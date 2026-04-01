import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { StockItem } from '../entities/stock-item.entity';
import { StockMovement, StockMovementType } from '../entities/stock-movement.entity';
import { RecipeService } from '../../cost-control/services/recipe.service';
import { EventsGateway } from '../../events/events.gateway';

export interface MovementFilters {
  ingredient_id?: string;
  type?: StockMovementType;
  from?: string; // ISO date
  to?: string;   // ISO date
  page?: number;
  limit?: number;
}

@Injectable()
export class StockService {
  private readonly logger = new Logger(StockService.name);

  constructor(
    @InjectRepository(StockItem)
    private readonly stockRepo: Repository<StockItem>,
    @InjectRepository(StockMovement)
    private readonly movementRepo: Repository<StockMovement>,
    private readonly recipeService: RecipeService,
    private readonly eventsGateway: EventsGateway,
    private readonly eventEmitter: EventEmitter2,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Get all stock items for a restaurant with ingredient details.
   */
  async getStock(restaurantId: string): Promise<StockItem[]> {
    return this.stockRepo.find({
      where: { restaurant_id: restaurantId },
      relations: ['ingredient'],
      order: { ingredient: { name: 'ASC' } },
    });
  }

  /**
   * Get stock items where current_quantity < min_quantity (low stock alerts).
   */
  async getLowStock(restaurantId: string): Promise<StockItem[]> {
    const allItems = await this.stockRepo.find({
      where: { restaurant_id: restaurantId },
      relations: ['ingredient'],
    });

    return allItems.filter(
      (item) =>
        item.min_quantity !== null &&
        Number(item.current_quantity) < Number(item.min_quantity),
    );
  }

  /**
   * Manual stock adjustment (positive or negative delta).
   * Wrapped in a transaction with pessimistic lock on the stock item to prevent
   * divergence between current_quantity and the sum of movements.
   */
  async adjustStock(
    ingredientId: string,
    restaurantId: string,
    quantityDelta: number,
    reason?: string,
    userId?: string,
  ): Promise<StockItem> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Lock the stock item row before reading quantity
      let stockItem = await queryRunner.manager.findOne(StockItem, {
        where: { ingredient_id: ingredientId, restaurant_id: restaurantId },
        relations: ['ingredient'],
        lock: { mode: 'pessimistic_write' },
      });

      if (!stockItem) {
        throw new NotFoundException(
          `Stock item not found for ingredient ${ingredientId} in restaurant ${restaurantId}`,
        );
      }

      const previousQty = Number(stockItem.current_quantity);
      stockItem.current_quantity = Math.max(0, previousQty + quantityDelta);
      stockItem = await queryRunner.manager.save(StockItem, stockItem);

      // Create movement record within the same transaction
      const movementType: StockMovementType =
        quantityDelta >= 0 ? 'adjustment_positive' : 'adjustment_negative';

      const movement = queryRunner.manager.create(StockMovement, {
        stock_item_id: stockItem.id,
        restaurant_id: restaurantId,
        ingredient_id: ingredientId,
        type: movementType,
        quantity: quantityDelta,
        quantity_before: previousQty,
        quantity_after: Number(stockItem.current_quantity),
        notes: reason || null,
        created_by: userId || null,
      });
      await queryRunner.manager.save(StockMovement, movement);

      await queryRunner.commitTransaction();

      this.logger.log(
        `Stock adjusted: ingredient=${ingredientId}, delta=${quantityDelta}, ` +
          `${previousQty} -> ${stockItem.current_quantity}` +
          (reason ? `, reason: ${reason}` : ''),
      );

      // Check low stock alert (outside transaction — read-only side effect)
      this.checkAndEmitLowStock(stockItem, restaurantId);

      return stockItem;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Auto-deduct stock for an order item.
   * Finds the Recipe for the menu item, then for each RecipeIngredient,
   * subtracts (ingredient_quantity x order_item_quantity) from stock.
   *
   * Each ingredient deduction locks the StockItem row (pessimistic_write)
   * to prevent divergence between current_quantity and movement records.
   *
   * Idempotency: if a StockMovement with reference_type='order_item' and
   * reference_id=referenceId already exists, the deduction is skipped to
   * prevent double-deduction on retries.
   */
  async deductForOrder(
    menuItemId: string,
    restaurantId: string,
    orderItemQuantity: number,
    referenceId?: string,
  ): Promise<void> {
    try {
      // Idempotency check: skip if stock was already deducted for this order item
      if (referenceId) {
        const existingMovement = await this.movementRepo.findOne({
          where: {
            reference_type: 'order_item',
            reference_id: referenceId,
          },
        });

        if (existingMovement) {
          this.logger.debug(
            `Stock deduction already processed for order item ${referenceId} — skipping`,
          );
          return;
        }
      }

      const recipe = await this.recipeService.findByMenuItem(menuItemId);

      if (!recipe || !recipe.ingredients?.length) {
        this.logger.debug(
          `No recipe found for menu item ${menuItemId} — skipping stock deduction`,
        );
        return;
      }

      for (const ri of recipe.ingredients) {
        const deduction = Number(ri.quantity) * orderItemQuantity;

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
          // Lock the stock item row before reading quantity
          const stockItem = await queryRunner.manager.findOne(StockItem, {
            where: {
              ingredient_id: ri.ingredient_id,
              restaurant_id: restaurantId,
            },
            relations: ['ingredient'],
            lock: { mode: 'pessimistic_write' },
          });

          if (!stockItem) {
            this.logger.debug(
              `No stock record for ingredient ${ri.ingredient_id} — skipping`,
            );
            await queryRunner.commitTransaction();
            continue;
          }

          const previousQty = Number(stockItem.current_quantity);
          stockItem.current_quantity = Math.max(0, previousQty - deduction);
          await queryRunner.manager.save(StockItem, stockItem);

          // Create movement record for sale consumption within the same transaction
          const movement = queryRunner.manager.create(StockMovement, {
            stock_item_id: stockItem.id,
            restaurant_id: restaurantId,
            ingredient_id: ri.ingredient_id,
            type: 'sale_consumption' as StockMovementType,
            quantity: -deduction,
            quantity_before: previousQty,
            quantity_after: Number(stockItem.current_quantity),
            reference_id: referenceId || null,
            reference_type: referenceId ? 'order_item' : null,
          });
          await queryRunner.manager.save(StockMovement, movement);

          await queryRunner.commitTransaction();

          this.logger.debug(
            `Stock deducted: ingredient=${ri.ingredient_id}, qty=${deduction}, ` +
              `${previousQty} -> ${stockItem.current_quantity}`,
          );

          // Auto-86: if stock depleted, emit event to mark affected menu items unavailable
          if (Number(stockItem.current_quantity) <= 0) {
            this.eventEmitter.emit('stock.item.depleted', {
              ingredientId: ri.ingredient_id,
              ingredientName: stockItem.ingredient?.name || 'Unknown',
              restaurantId,
            });
            this.logger.warn(
              `Stock DEPLETED for ingredient ${stockItem.ingredient?.name || ri.ingredient_id} — auto-86 triggered`,
            );
          } else {
            this.checkAndEmitLowStock(stockItem, restaurantId);
          }
        } catch (ingredientError) {
          await queryRunner.rollbackTransaction();
          throw ingredientError;
        } finally {
          await queryRunner.release();
        }
      }
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Failed to deduct stock for menu item ${menuItemId}: ${err.message}`,
        err.stack,
      );
    }
  }

  /**
   * Receive stock from a purchase — add quantity and update price/date.
   * Wrapped in a transaction with pessimistic lock on the stock item.
   */
  async receiveStock(
    ingredientId: string,
    restaurantId: string,
    quantity: number,
    price?: number,
    supplier?: string,
    userId?: string,
  ): Promise<StockItem> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Try to lock the existing stock item
      let stockItem = await queryRunner.manager.findOne(StockItem, {
        where: { ingredient_id: ingredientId, restaurant_id: restaurantId },
        relations: ['ingredient'],
        lock: { mode: 'pessimistic_write' },
      });

      const previousQty = stockItem ? Number(stockItem.current_quantity) : 0;

      if (!stockItem) {
        // Auto-create stock record if ingredient exists but stock doesn't
        stockItem = queryRunner.manager.create(StockItem, {
          ingredient_id: ingredientId,
          restaurant_id: restaurantId,
          current_quantity: 0,
          unit: 'un', // will be overridden if ingredient has unit
        });
      }

      stockItem.current_quantity =
        Number(stockItem.current_quantity) + quantity;

      if (price !== undefined) {
        stockItem.last_purchase_price = price;
      }
      stockItem.last_purchase_date = new Date();

      stockItem = await queryRunner.manager.save(StockItem, stockItem);

      // Create movement record for purchase within the same transaction
      const movement = queryRunner.manager.create(StockMovement, {
        stock_item_id: stockItem.id,
        restaurant_id: restaurantId,
        ingredient_id: ingredientId,
        type: 'purchase_manual' as StockMovementType,
        quantity: quantity,
        quantity_before: previousQty,
        quantity_after: Number(stockItem.current_quantity),
        unit_cost: price || null,
        notes: supplier ? `Supplier: ${supplier}` : null,
        created_by: userId || null,
      });
      await queryRunner.manager.save(StockMovement, movement);

      await queryRunner.commitTransaction();

      this.logger.log(
        `Stock received: ingredient=${ingredientId}, qty=${quantity}` +
          (price ? `, price=${price}` : '') +
          (supplier ? `, supplier=${supplier}` : ''),
      );

      return stockItem;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Register waste/loss — deduct quantity and create movement.
   * Wrapped in a transaction with pessimistic lock on the stock item.
   */
  async registerWaste(
    ingredientId: string,
    restaurantId: string,
    quantity: number,
    reason: string,
    userId?: string,
  ): Promise<StockItem> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const stockItem = await queryRunner.manager.findOne(StockItem, {
        where: { ingredient_id: ingredientId, restaurant_id: restaurantId },
        relations: ['ingredient'],
        lock: { mode: 'pessimistic_write' },
      });

      if (!stockItem) {
        throw new NotFoundException(
          `Stock item not found for ingredient ${ingredientId} in restaurant ${restaurantId}`,
        );
      }

      const previousQty = Number(stockItem.current_quantity);
      stockItem.current_quantity = Math.max(0, previousQty - quantity);
      await queryRunner.manager.save(StockItem, stockItem);

      const movement = queryRunner.manager.create(StockMovement, {
        stock_item_id: stockItem.id,
        restaurant_id: restaurantId,
        ingredient_id: ingredientId,
        type: 'waste' as StockMovementType,
        quantity: -quantity,
        quantity_before: previousQty,
        quantity_after: Number(stockItem.current_quantity),
        notes: reason,
        created_by: userId || null,
      });
      await queryRunner.manager.save(StockMovement, movement);

      await queryRunner.commitTransaction();

      this.logger.log(
        `Waste registered: ingredient=${ingredientId}, qty=${quantity}, reason=${reason}`,
      );

      this.checkAndEmitLowStock(stockItem, restaurantId);

      return stockItem;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Register internal use — deduct quantity and create movement.
   * Wrapped in a transaction with pessimistic lock on the stock item.
   */
  async registerInternalUse(
    ingredientId: string,
    restaurantId: string,
    quantity: number,
    reason: string,
    userId?: string,
  ): Promise<StockItem> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const stockItem = await queryRunner.manager.findOne(StockItem, {
        where: { ingredient_id: ingredientId, restaurant_id: restaurantId },
        relations: ['ingredient'],
        lock: { mode: 'pessimistic_write' },
      });

      if (!stockItem) {
        throw new NotFoundException(
          `Stock item not found for ingredient ${ingredientId} in restaurant ${restaurantId}`,
        );
      }

      const previousQty = Number(stockItem.current_quantity);
      stockItem.current_quantity = Math.max(0, previousQty - quantity);
      await queryRunner.manager.save(StockItem, stockItem);

      const movement = queryRunner.manager.create(StockMovement, {
        stock_item_id: stockItem.id,
        restaurant_id: restaurantId,
        ingredient_id: ingredientId,
        type: 'internal_use' as StockMovementType,
        quantity: -quantity,
        quantity_before: previousQty,
        quantity_after: Number(stockItem.current_quantity),
        notes: reason,
        created_by: userId || null,
      });
      await queryRunner.manager.save(StockMovement, movement);

      await queryRunner.commitTransaction();

      this.logger.log(
        `Internal use registered: ingredient=${ingredientId}, qty=${quantity}, reason=${reason}`,
      );

      this.checkAndEmitLowStock(stockItem, restaurantId);

      return stockItem;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Check stock availability for a menu item based on its recipe.
   * Returns whether all ingredients are available and lists any missing ones.
   */
  async checkAvailability(
    menuItemId: string,
    restaurantId: string,
    quantity: number,
  ): Promise<{ available: boolean; missingIngredients: string[] }> {
    const recipe = await this.recipeService.findByMenuItem(menuItemId);
    if (!recipe || !recipe.ingredients?.length) {
      // No recipe defined = no stock tracking, assume available
      return { available: true, missingIngredients: [] };
    }

    const missing: string[] = [];
    for (const ri of recipe.ingredients) {
      const stockItem = await this.stockRepo.findOne({
        where: { ingredient_id: ri.ingredient_id, restaurant_id: restaurantId },
      });

      const needed = Number(ri.quantity) * quantity;
      const available = stockItem ? Number(stockItem.current_quantity) : 0;

      if (available < needed) {
        missing.push(ri.ingredient?.name || ri.ingredient_id);
      }
    }

    return { available: missing.length === 0, missingIngredients: missing };
  }

  /**
   * Get paginated movements with optional filters.
   */
  async getMovements(
    restaurantId: string,
    filters: MovementFilters = {},
  ): Promise<{ data: StockMovement[]; total: number; page: number; limit: number }> {
    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const skip = (page - 1) * limit;

    const qb = this.movementRepo
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.stock_item', 'si')
      .leftJoinAndSelect('si.ingredient', 'ing')
      .where('m.restaurant_id = :restaurantId', { restaurantId })
      .orderBy('m.created_at', 'DESC')
      .skip(skip)
      .take(limit);

    if (filters.ingredient_id) {
      qb.andWhere('m.ingredient_id = :ingredientId', {
        ingredientId: filters.ingredient_id,
      });
    }

    if (filters.type) {
      qb.andWhere('m.type = :type', { type: filters.type });
    }

    if (filters.from) {
      qb.andWhere('m.created_at >= :from', { from: new Date(filters.from) });
    }

    if (filters.to) {
      qb.andWhere('m.created_at <= :to', { to: new Date(filters.to) });
    }

    const [data, total] = await qb.getManyAndCount();

    return { data, total, page, limit };
  }

  /**
   * Get movement summary grouped by type for a period.
   */
  async getMovementsSummary(
    restaurantId: string,
    from?: string,
    to?: string,
  ): Promise<{ type: string; count: number; total_quantity: number }[]> {
    const qb = this.movementRepo
      .createQueryBuilder('m')
      .select('m.type', 'type')
      .addSelect('COUNT(m.id)', 'count')
      .addSelect('SUM(m.quantity)', 'total_quantity')
      .where('m.restaurant_id = :restaurantId', { restaurantId })
      .groupBy('m.type')
      .orderBy('count', 'DESC');

    if (from) {
      qb.andWhere('m.created_at >= :from', { from: new Date(from) });
    }

    if (to) {
      qb.andWhere('m.created_at <= :to', { to: new Date(to) });
    }

    return qb.getRawMany();
  }

  /**
   * Create a stock movement record.
   */
  private async createMovement(
    data: Partial<StockMovement>,
  ): Promise<StockMovement> {
    const movement = this.movementRepo.create(data);
    return this.movementRepo.save(movement);
  }

  /**
   * Check if stock is below min_quantity and emit WS event.
   */
  private checkAndEmitLowStock(
    stockItem: StockItem,
    restaurantId: string,
  ): void {
    if (
      stockItem.min_quantity !== null &&
      Number(stockItem.current_quantity) < Number(stockItem.min_quantity)
    ) {
      try {
        this.eventsGateway.server
          .to(`restaurant:${restaurantId}`)
          .emit('stock:low', {
            ingredient_id: stockItem.ingredient_id,
            ingredient_name: stockItem.ingredient?.name || 'Unknown',
            current_quantity: Number(stockItem.current_quantity),
            min_quantity: Number(stockItem.min_quantity),
            unit: stockItem.unit,
          });
      } catch (err) {
        this.logger.warn('Failed to emit stock:low event');
      }
    }
  }
}
