import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ItemAvailabilityService } from '../services/item-availability.service';
import { RecipeService } from '../../cost-control/services/recipe.service';

/**
 * StockDepletionListener — Auto-86 when stock reaches zero.
 *
 * Listens for 'stock.item.depleted' event and finds all MenuItems
 * that use the depleted ingredient (via Recipe → RecipeIngredient),
 * then marks each as unavailable (86'd).
 */
@Injectable()
export class StockDepletionListener {
  private readonly logger = new Logger(StockDepletionListener.name);

  constructor(
    private readonly itemAvailabilityService: ItemAvailabilityService,
    private readonly recipeService: RecipeService,
  ) {}

  @OnEvent('stock.item.depleted', { async: true })
  async handleStockDepleted(payload: {
    ingredientId: string;
    ingredientName: string;
    restaurantId: string;
  }): Promise<void> {
    try {
      // Find all recipes that use this ingredient (via RecipeService)
      const recipeIngredients = await this.recipeService.findRecipeIngredientsByIngredientId(
        payload.ingredientId,
      );

      if (!recipeIngredients.length) {
        this.logger.debug(
          `No recipes use ingredient ${payload.ingredientName} — no items to 86`,
        );
        return;
      }

      const affectedMenuItemIds = new Set<string>();

      for (const ri of recipeIngredients) {
        if (ri.recipe?.menu_item_id) {
          affectedMenuItemIds.add(ri.recipe.menu_item_id);
        }
      }

      // Mark each affected menu item as unavailable (86)
      for (const menuItemId of affectedMenuItemIds) {
        try {
          await this.itemAvailabilityService.markUnavailable(menuItemId);
          this.logger.warn(
            `Auto-86: MenuItem ${menuItemId} marked unavailable due to depleted ingredient "${payload.ingredientName}"`,
          );
        } catch (err) {
          const error = err as Error;
          this.logger.error(
            `Failed to auto-86 menu item ${menuItemId}: ${error.message}`,
          );
        }
      }

      this.logger.log(
        `Auto-86 complete: ingredient "${payload.ingredientName}" depleted → ` +
          `${affectedMenuItemIds.size} menu item(s) marked unavailable`,
      );
    } catch (err) {
      const error = err as Error;
      this.logger.error(
        `StockDepletionListener failed: ${error.message}`,
        error.stack,
      );
    }
  }
}
