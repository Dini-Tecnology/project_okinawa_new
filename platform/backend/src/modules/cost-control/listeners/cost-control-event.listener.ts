import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { CogsService } from '../services/cogs.service';
import { RecipeService } from '../services/recipe.service';
import { OrdersService } from '../../orders/orders.service';

/**
 * CostControlEventListener — Transmission belts for cost control:
 *
 * 1. 'order.payment.confirmed' → Record COGS for each order item
 * 2. 'ingredient.price.updated' → Recalculate affected recipes
 */
@Injectable()
export class CostControlEventListener {
  private readonly logger = new Logger(CostControlEventListener.name);

  constructor(
    private readonly cogsService: CogsService,
    private readonly recipeService: RecipeService,
    private readonly ordersService: OrdersService,
  ) {}

  @OnEvent('order.payment.confirmed', { async: true })
  async handlePaymentConfirmed(payload: {
    orderId: string;
    restaurantId: string;
  }): Promise<void> {
    try {
      const order = await this.ordersService.findOne(payload.orderId);

      if (!order?.items?.length) {
        this.logger.debug(`No items found for order ${payload.orderId} — skipping COGS`);
        return;
      }

      let totalCogs = 0;
      let recipesFound = 0;

      for (const item of order.items) {
        try {
          const result = await this.cogsService.recordCogs(
            payload.restaurantId,
            item.menu_item_id,
            item.menu_item?.name || `Item ${item.menu_item_id.slice(0, 8)}`,
            item.quantity,
            Number(item.unit_price),
            order.id,
          );

          totalCogs += result.cost;
          if (result.has_recipe) recipesFound++;
        } catch (err) {
          const error = err as Error;
          this.logger.error(
            `COGS recording failed for item ${item.menu_item_id}: ${error.message}`,
          );
        }
      }

      this.logger.log(
        `COGS recorded for order ${order.id.slice(0, 8)}: ` +
          `total=${totalCogs.toFixed(2)}, items=${order.items.length}, ` +
          `with_recipe=${recipesFound}`,
      );
    } catch (err) {
      const error = err as Error;
      this.logger.error(
        `Failed to process COGS for order ${payload.orderId}: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * When an ingredient price is updated, recalculate all affected recipes.
   * This ensures Recipe.calculated_cost and calculated_margin_pct stay current.
   */
  @OnEvent('ingredient.price.updated', { async: true })
  async handlePriceUpdated(payload: {
    ingredientId: string;
    newPrice: number;
    affectedRecipeIds: string[];
  }): Promise<void> {
    let recalculated = 0;

    for (const recipeId of payload.affectedRecipeIds) {
      try {
        await this.recipeService.calculateCost(recipeId);
        recalculated++;
      } catch (err) {
        const error = err as Error;
        this.logger.error(
          `Failed to recalculate recipe ${recipeId}: ${error.message}`,
        );
      }
    }

    this.logger.log(
      `Recipes recalculated after ingredient price update: ` +
        `${recalculated}/${payload.affectedRecipeIds.length}`,
    );
  }
}
