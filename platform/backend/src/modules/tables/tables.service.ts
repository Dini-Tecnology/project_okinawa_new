import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { RestaurantTable, TableStatus } from './entities/restaurant-table.entity';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';
import { UpdateTableStatusDto } from './dto/update-table-status.dto';
import { EventsGateway } from '@/modules/events/events.gateway';
import { PaginationDto, paginate, toPaginationDto } from '@/common/dto/pagination.dto';

@Injectable()
export class TablesService {
  constructor(
    @InjectRepository(RestaurantTable)
    private tableRepository: Repository<RestaurantTable>,
    private eventsGateway: EventsGateway,
    private dataSource: DataSource,
  ) {}

  async create(createTableDto: CreateTableDto) {
    // Check if table number already exists for this restaurant
    const existingTable = await this.tableRepository.findOne({
      where: {
        restaurant_id: createTableDto.restaurant_id,
        table_number: createTableDto.table_number,
      },
    });

    if (existingTable) {
      throw new ConflictException(
        `Table ${createTableDto.table_number} already exists for this restaurant`
      );
    }

    // Generate QR code (placeholder - seria integração com QR generator)
    const qr_code = `QR-${createTableDto.restaurant_id}-${createTableDto.table_number}`;

    const table = this.tableRepository.create({
      ...createTableDto,
      seats: createTableDto.capacity,
      qr_code,
      status: TableStatus.AVAILABLE,
    });

    const savedTable = await this.tableRepository.save(table);

    // Notify restaurant staff about new table
    this.eventsGateway.notifyRestaurant(createTableDto.restaurant_id, {
      type: 'table:created',
      table: savedTable,
    });

    return savedTable;
  }

  async findAll(restaurantId: string, pagination?: PaginationDto) {
    const dto = toPaginationDto(pagination);

    const [items, total] = await this.tableRepository.findAndCount({
      where: { restaurant_id: restaurantId },
      order: { table_number: 'ASC' },
      skip: dto.offset,
      take: dto.limit,
    });

    return paginate(items, total, dto);
  }

  async findOne(id: string) {
    const table = await this.tableRepository.findOne({
      where: { id },
      relations: ['restaurant'],
    });

    if (!table) {
      throw new NotFoundException('Table not found');
    }

    return table;
  }

  async update(id: string, updateTableDto: UpdateTableDto) {
    const table = await this.findOne(id);

    // Check for table_number conflict if changing it
    if (
      updateTableDto.table_number &&
      updateTableDto.table_number !== table.table_number
    ) {
      const existingTable = await this.tableRepository.findOne({
        where: {
          restaurant_id: table.restaurant_id,
          table_number: updateTableDto.table_number,
        },
      });

      if (existingTable) {
        throw new ConflictException(
          `Table ${updateTableDto.table_number} already exists`
        );
      }
    }

    Object.assign(table, updateTableDto);
    if (updateTableDto.capacity) {
      table.seats = updateTableDto.capacity;
    }

    const updatedTable = await this.tableRepository.save(table);

    // Notify about update
    this.eventsGateway.notifyRestaurant(table.restaurant_id, {
      type: 'table:updated',
      table: updatedTable,
    });

    return updatedTable;
  }

  async updateStatus(id: string, updateStatusDto: UpdateTableStatusDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Lock the table row to prevent concurrent status updates (e.g. double-booking)
      const table = await queryRunner.manager.findOne(RestaurantTable, {
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });

      if (!table) {
        throw new NotFoundException('Table not found');
      }

      const oldStatus = table.status;

      table.status = updateStatusDto.status;
      const updatedTable = await queryRunner.manager.save(RestaurantTable, table);

      await queryRunner.commitTransaction();

      // Emit WebSocket event for real-time update (outside transaction)
      this.eventsGateway.server
        .to(`restaurant:${table.restaurant_id}`)
        .emit('table:status_changed', {
          table_id: table.id,
          table_number: table.table_number,
          old_status: oldStatus,
          new_status: updateStatusDto.status,
          updated_at: new Date(),
        });

      return updatedTable;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: string) {
    const table = await this.findOne(id);

    // Check if table is occupied before deleting
    if (table.status === TableStatus.OCCUPIED) {
      throw new ConflictException(
        'Cannot delete occupied table. Please free the table first.'
      );
    }

    await this.tableRepository.remove(table);

    // Notify about deletion
    this.eventsGateway.notifyRestaurant(table.restaurant_id, {
      type: 'table:deleted',
      table_id: id,
      table_number: table.table_number,
    });

    return { message: 'Table deleted successfully' };
  }

  async getAvailableTables(restaurantId: string, seats?: number) {
    const query = this.tableRepository
      .createQueryBuilder('table')
      .where('table.restaurant_id = :restaurantId', { restaurantId })
      .andWhere('table.status = :status', { status: TableStatus.AVAILABLE });

    if (seats) {
      query.andWhere('table.seats >= :seats', { seats });
    }

    return query.orderBy('table.seats', 'ASC').getMany();
  }

  async assignToReservation(tableId: string, reservationId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Lock the table row to prevent race conditions
      const table = await queryRunner.manager.findOne(RestaurantTable, {
        where: { id: tableId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!table) {
        throw new NotFoundException('Table not found');
      }

      if (table.status !== TableStatus.AVAILABLE) {
        throw new ConflictException('Table is not available');
      }

      table.status = TableStatus.RESERVED;
      const updatedTable = await queryRunner.manager.save(table);

      await queryRunner.commitTransaction();

      // Emit status change
      this.eventsGateway.server
        .to(`restaurant:${table.restaurant_id}`)
        .emit('table:status_changed', {
          table_id: table.id,
          table_number: table.table_number,
          old_status: TableStatus.AVAILABLE,
          new_status: TableStatus.RESERVED,
          reservation_id: reservationId,
          updated_at: new Date(),
        });

      return updatedTable;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async assignWaiter(tableId: string, waiterId: string) {
    const table = await this.findOne(tableId);
    table.assigned_waiter_id = waiterId;
    const updatedTable = await this.tableRepository.save(table);

    // Emit WebSocket event
    this.eventsGateway.server
      .to(`restaurant:${table.restaurant_id}`)
      .emit('table:waiter_assigned', {
        table_id: table.id,
        table_number: table.table_number,
        waiter_id: waiterId,
        updated_at: new Date(),
      });

    return updatedTable;
  }

  async updateNotes(tableId: string, notes?: string) {
    const table = await this.findOne(tableId);

    table.notes = notes || '';
    return this.tableRepository.save(table);
  }

  async markAsOccupied(tableId: string, orderId?: string) {
    const table = await this.findOne(tableId);

    if (![TableStatus.AVAILABLE, TableStatus.RESERVED].includes(table.status)) {
      throw new ConflictException('Table cannot be marked as occupied');
    }

    const oldStatus = table.status;
    table.status = TableStatus.OCCUPIED;
    const updatedTable = await this.tableRepository.save(table);

    this.eventsGateway.server
      .to(`restaurant:${table.restaurant_id}`)
      .emit('table:occupied', {
        table_id: table.id,
        table_number: table.table_number,
        old_status: oldStatus,
        order_id: orderId,
        updated_at: new Date(),
      });

    return updatedTable;
  }

  async markForCleaning(tableId: string) {
    const table = await this.findOne(tableId);

    if (table.status !== TableStatus.OCCUPIED) {
      throw new ConflictException('Only occupied tables can be marked for cleaning');
    }

    table.status = TableStatus.CLEANING;
    const updatedTable = await this.tableRepository.save(table);

    this.eventsGateway.server
      .to(`restaurant:${table.restaurant_id}`)
      .emit('table:cleaning_started', {
        table_id: table.id,
        table_number: table.table_number,
        updated_at: new Date(),
      });

    return updatedTable;
  }

  async markAsAvailable(tableId: string) {
    const table = await this.findOne(tableId);

    if (table.status !== TableStatus.CLEANING) {
      throw new ConflictException('Only cleaning tables can be marked as available');
    }

    table.status = TableStatus.AVAILABLE;
    const updatedTable = await this.tableRepository.save(table);

    this.eventsGateway.server
      .to(`restaurant:${table.restaurant_id}`)
      .emit('table:freed', {
        table_id: table.id,
        table_number: table.table_number,
        updated_at: new Date(),
      });

    return updatedTable;
  }

  /**
   * Find a table by restaurant_id and table_number.
   * Returns null if not found.
   */
  async findByNumber(restaurantId: string, tableNumber: string): Promise<RestaurantTable | null> {
    return this.tableRepository.findOne({
      where: {
        restaurant_id: restaurantId,
        table_number: tableNumber,
      },
    });
  }
}
