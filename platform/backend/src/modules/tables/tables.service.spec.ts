import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { TablesService } from './tables.service';
import { RestaurantTable } from './entities/restaurant-table.entity';
import { EventsGateway } from '@/modules/events/events.realtime';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('TablesService', () => {
  let service: TablesService;
  let tableRepository: Repository<RestaurantTable>;
  let eventsGateway: EventsGateway;

  const mockTable = {
    id: 'table-1',
    restaurant_id: 'restaurant-1',
    table_number: 'T1',
    capacity: 4,
    seats: 4,
    status: 'available',
    qr_code: 'QR-restaurant-1-T1',
  };

  const mockTableRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    findAndCount: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockEventsGateway = {
    notifyRestaurant: jest.fn(),
    server: {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    },
  };

  const mockQueryRunner = {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: {
      findOne: jest.fn(),
      save: jest.fn(),
    },
  };

  const mockDataSource = {
    createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TablesService,
        {
          provide: getRepositoryToken(RestaurantTable),
          useValue: mockTableRepository,
        },
        {
          provide: EventsGateway,
          useValue: mockEventsGateway,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<TablesService>(TablesService);
    tableRepository = module.get(getRepositoryToken(RestaurantTable));
    eventsGateway = module.get(EventsGateway);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a table successfully', async () => {
      const createDto = {
        restaurant_id: 'restaurant-1',
        table_number: 'T5',
        capacity: 4,
      };

      mockTableRepository.findOne.mockResolvedValue(null);
      mockTableRepository.create.mockReturnValue(mockTable);
      mockTableRepository.save.mockResolvedValue(mockTable);
      mockEventsGateway.notifyRestaurant.mockResolvedValue(undefined);

      const result = await service.create(createDto as any);

      expect(result).toEqual(mockTable);
      expect(mockTableRepository.save).toHaveBeenCalled();
      expect(mockEventsGateway.notifyRestaurant).toHaveBeenCalled();
    });

    it('should throw ConflictException if table number already exists', async () => {
      const createDto = {
        restaurant_id: 'restaurant-1',
        table_number: 'T1',
        capacity: 4,
      };

      mockTableRepository.findOne.mockResolvedValue(mockTable);

      await expect(service.create(createDto as any)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all tables for a restaurant', async () => {
      mockTableRepository.findAndCount.mockResolvedValue([[mockTable], 1]);

      const result = await service.findAll('restaurant-1');

      expect(result.items).toEqual([mockTable]);
      expect(result.meta.total).toBe(1);
      expect(mockTableRepository.findAndCount).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a table by id', async () => {
      mockTableRepository.findOne.mockResolvedValue(mockTable);

      const result = await service.findOne('table-1');

      expect(result).toEqual(mockTable);
    });

    it('should throw NotFoundException if table not found', async () => {
      mockTableRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a table', async () => {
      const updateDto = { notes: 'Updated notes' };

      mockTableRepository.findOne.mockResolvedValue(mockTable);
      mockTableRepository.save.mockResolvedValue({
        ...mockTable,
        notes: 'Updated notes',
      });

      const result = await service.update('table-1', updateDto as any);

      expect(result.notes).toBe('Updated notes');
      expect(mockTableRepository.save).toHaveBeenCalled();
    });
  });

  describe('updateStatus', () => {
    it('should update table status', async () => {
      const updateStatusDto = { status: 'occupied' as any };

      mockTableRepository.findOne.mockResolvedValue(mockTable);
      mockTableRepository.save.mockResolvedValue({
        ...mockTable,
        status: 'occupied',
      });

      const result = await service.updateStatus('table-1', updateStatusDto);

      expect(result.status).toBe('occupied');
      expect(mockEventsGateway.server.emit).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove a table', async () => {
      const availableTable = { ...mockTable, status: 'available' };
      mockTableRepository.findOne.mockResolvedValue(availableTable);
      mockTableRepository.remove.mockResolvedValue(availableTable);

      await service.remove('table-1');

      expect(mockTableRepository.remove).toHaveBeenCalled();
    });

    it('should throw NotFoundException if table not found', async () => {
      mockTableRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
