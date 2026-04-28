import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MenuItem } from '@/modules/menu-items/entities/menu-item.entity';
import { PlatformConnection } from '@/modules/integrations/entities/platform-connection.entity';
import { ExternalMenuMapping } from '@/modules/integrations/entities/external-menu-mapping.entity';
import { OrdersGateway } from '@/modules/orders/orders.realtime';
import { FinancialEventListenerService } from '@/modules/financial/services/financial-event-listener.service';
import { KDS_MESSAGES } from '@/common/i18n/kds-brain.i18n';

@Injectable()
export class ItemAvailabilityService {
  private readonly logger = new Logger(ItemAvailabilityService.name);

  constructor(
    @InjectRepository(MenuItem)
    private readonly menuItemRepo: Repository<MenuItem>,

    @InjectRepository(PlatformConnection)
    private readonly platformConnectionRepo: Repository<PlatformConnection>,

    @InjectRepository(ExternalMenuMapping)
    private readonly externalMenuMappingRepo: Repository<ExternalMenuMapping>,

    private readonly ordersGateway: OrdersGateway,
    private readonly financialEventListener: FinancialEventListenerService,
  ) {}

  /**
   * Mark a menu item as unavailable (86'd).
   * Emits WebSocket event 'menu:item_unavailable' to the restaurant room.
   */
  async markUnavailable(
    menuItemId: string,
    restaurantId: string,
  ): Promise<MenuItem> {
    const item = await this.findMenuItem(menuItemId, restaurantId);
    item.is_available = false;
    const saved = await this.menuItemRepo.save(item);

    this.ordersGateway.notifyOrderUpdated({
      restaurant_id: restaurantId,
      kds_event: 'menu:item_unavailable',
      menu_item_id: menuItemId,
      item_name: item.name,
    });

    this.logger.log(
      `Menu item ${menuItemId} marked unavailable (restaurant ${restaurantId})`,
    );

    // 86 propagation: Pause item on connected delivery platforms
    await this.propagateAvailabilityToExternalPlatforms(
      menuItemId,
      restaurantId,
      false,
    );

    // GAP-2: Trigger financial event for forecast adjustment (non-blocking)
    try {
      await this.financialEventListener.onItemUnavailable(menuItemId, restaurantId);
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Unknown error';
      this.logger.warn(
        `Financial event (onItemUnavailable) failed for item ${menuItemId}: ${error}`,
      );
    }

    return saved;
  }

  /**
   * Mark a menu item as available again.
   * Emits WebSocket event 'menu:item_available' to the restaurant room.
   */
  async markAvailable(
    menuItemId: string,
    restaurantId: string,
  ): Promise<MenuItem> {
    const item = await this.findMenuItem(menuItemId, restaurantId);
    item.is_available = true;
    const saved = await this.menuItemRepo.save(item);

    this.ordersGateway.notifyOrderUpdated({
      restaurant_id: restaurantId,
      kds_event: 'menu:item_available',
      menu_item_id: menuItemId,
      item_name: item.name,
    });

    this.logger.log(
      `Menu item ${menuItemId} marked available (restaurant ${restaurantId})`,
    );

    // 86 propagation: Unpause item on connected delivery platforms
    await this.propagateAvailabilityToExternalPlatforms(
      menuItemId,
      restaurantId,
      true,
    );

    return saved;
  }

  /**
   * Toggle the availability of a menu item.
   * Returns the updated item with the new availability state.
   */
  async toggleAvailability(
    menuItemId: string,
    restaurantId: string,
  ): Promise<MenuItem> {
    const item = await this.findMenuItem(menuItemId, restaurantId);

    if (item.is_available) {
      return this.markUnavailable(menuItemId, restaurantId);
    } else {
      return this.markAvailable(menuItemId, restaurantId);
    }
  }

  // ─── Private helpers ──────────────────────────────────────────────

  /**
   * Propagate item availability change to all active external delivery platforms.
   * Finds PlatformConnections for the restaurant, looks up ExternalMenuMappings
   * for the menu item, and logs the intended adapter call.
   *
   * NOTE: Actual API calls to iFood/Rappi/UberEats will be implemented when
   * platform adapters are production-ready. This is a log placeholder.
   */
  private async propagateAvailabilityToExternalPlatforms(
    menuItemId: string,
    restaurantId: string,
    available: boolean,
  ): Promise<void> {
    try {
      const activeConnections = await this.platformConnectionRepo.find({
        where: { restaurant_id: restaurantId, is_active: true },
      });

      if (activeConnections.length === 0) return;

      for (const connection of activeConnections) {
        const mapping = await this.externalMenuMappingRepo.findOne({
          where: {
            restaurant_id: restaurantId,
            platform: connection.platform,
            internal_menu_item_id: menuItemId,
            is_active: true,
          },
        });

        if (mapping) {
          const action = available ? 'unpause' : 'pause';
          this.logger.log(
            `TODO: Call adapter to ${action} item on ${connection.platform} ` +
            `(external_id=${mapping.external_item_id}, menu_item=${menuItemId})`,
          );
        }
      }
    } catch (error) {
      // Non-blocking: log and continue — internal 86 already succeeded
      this.logger.warn(
        `Failed to propagate availability to external platforms for item ${menuItemId}: ${error}`,
      );
    }
  }

  private async findMenuItem(
    menuItemId: string,
    restaurantId: string,
  ): Promise<MenuItem> {
    const item = await this.menuItemRepo.findOne({
      where: { id: menuItemId, restaurant_id: restaurantId },
    });

    if (!item) {
      throw new NotFoundException(KDS_MESSAGES.ITEM_NOT_FOUND);
    }

    return item;
  }
}
