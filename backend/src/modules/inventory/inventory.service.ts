import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryItem } from './entities/inventory-item.entity';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';
import { UpdateItemLevelDto } from './dto/update-item-level.dto';

export type InventoryStatus = 'ok' | 'low' | 'critical';

export interface InventoryItemResponse {
  id: string;
  restaurant_id: string;
  name: string;
  category: string;
  current_level: number;
  unit: string;
  min_level: number;
  max_level: number | null;
  unit_cost: number | null;
  supplier: string | null;
  is_active: boolean;
  notes: string | null;
  last_restocked_at: Date | null;
  created_at: Date;
  updated_at: Date;
  status: InventoryStatus;
  level_pct: number;
}

export interface InventoryStats {
  total: number;
  ok: number;
  low: number;
  critical: number;
  estimatedStockValue: number | null;
}

function computeStatus(item: InventoryItem): InventoryStatus {
  const minLevel = Number(item.min_level);
  if (!minLevel || minLevel === 0) return 'ok';
  const pct = (Number(item.current_level) / minLevel) * 100;
  if (pct < 20) return 'critical';
  if (pct < 50) return 'low';
  return 'ok';
}

function computeLevelPct(item: InventoryItem): number {
  const minLevel = Number(item.min_level);
  if (!minLevel || minLevel === 0) return 100;
  return Math.round((Number(item.current_level) / minLevel) * 100);
}

function toResponse(item: InventoryItem): InventoryItemResponse {
  return {
    id: item.id,
    restaurant_id: item.restaurant_id,
    name: item.name,
    category: item.category,
    current_level: Number(item.current_level),
    unit: item.unit,
    min_level: Number(item.min_level),
    max_level: item.max_level ? Number(item.max_level) : null,
    unit_cost: item.unit_cost ? Number(item.unit_cost) : null,
    supplier: item.supplier || null,
    is_active: item.is_active,
    notes: item.notes || null,
    last_restocked_at: item.last_restocked_at || null,
    created_at: item.created_at,
    updated_at: item.updated_at,
    status: computeStatus(item),
    level_pct: computeLevelPct(item),
  };
}

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(InventoryItem)
    private inventoryRepository: Repository<InventoryItem>,
  ) {}

  /**
   * List all active inventory items for a restaurant.
   * Supports optional filtering by category and computed status.
   */
  async findAll(
    restaurantId: string,
    category?: string,
    status?: string,
  ): Promise<InventoryItemResponse[]> {
    const where: Record<string, any> = {
      restaurant_id: restaurantId,
      is_active: true,
    };

    if (category) {
      where.category = category;
    }

    const items = await this.inventoryRepository.find({
      where,
      order: { name: 'ASC' },
    });

    let responses = items.map(toResponse);

    // Filter by computed status if requested
    if (status) {
      responses = responses.filter((r) => r.status === status);
    }

    // Sort: critical first, then low, then ok
    const statusOrder: Record<string, number> = { critical: 0, low: 1, ok: 2 };
    responses.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);

    return responses;
  }

  /**
   * Get alerts: items with status 'low' or 'critical', ordered by urgency.
   */
  async getAlerts(restaurantId: string): Promise<InventoryItemResponse[]> {
    const items = await this.inventoryRepository.find({
      where: { restaurant_id: restaurantId, is_active: true },
      order: { name: 'ASC' },
    });

    return items
      .map(toResponse)
      .filter((r) => r.status === 'low' || r.status === 'critical')
      .sort((a, b) => {
        const statusOrder: Record<string, number> = { critical: 0, low: 1 };
        return statusOrder[a.status] - statusOrder[b.status];
      });
  }

  /**
   * Get summary stats: count by status + estimated stock value.
   */
  async getStats(restaurantId: string): Promise<InventoryStats> {
    const items = await this.inventoryRepository.find({
      where: { restaurant_id: restaurantId, is_active: true },
    });

    const responses = items.map(toResponse);
    const ok = responses.filter((r) => r.status === 'ok').length;
    const low = responses.filter((r) => r.status === 'low').length;
    const critical = responses.filter((r) => r.status === 'critical').length;

    // Calculate estimated stock value
    let estimatedStockValue: number | null = null;
    const valuableItems = items.filter((i) => i.unit_cost != null);
    if (valuableItems.length > 0) {
      estimatedStockValue = valuableItems.reduce(
        (sum, i) => sum + Number(i.current_level) * Number(i.unit_cost),
        0,
      );
      estimatedStockValue = Math.round(estimatedStockValue * 100) / 100;
    }

    return {
      total: items.length,
      ok,
      low,
      critical,
      estimatedStockValue,
    };
  }

  /**
   * Get a single inventory item by ID.
   */
  async findOne(id: string): Promise<InventoryItemResponse> {
    const item = await this.inventoryRepository.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Inventory item not found');
    return toResponse(item);
  }

  /**
   * Create a new inventory item.
   */
  async create(dto: CreateInventoryItemDto): Promise<InventoryItemResponse> {
    const item = this.inventoryRepository.create(dto);
    const saved = await this.inventoryRepository.save(item);
    return toResponse(saved);
  }

  /**
   * Update an inventory item's configuration.
   */
  async update(id: string, dto: UpdateInventoryItemDto): Promise<InventoryItemResponse> {
    const item = await this.inventoryRepository.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Inventory item not found');
    Object.assign(item, dto);
    const saved = await this.inventoryRepository.save(item);
    return toResponse(saved);
  }

  /**
   * Quick level update (operational restock/adjustment).
   * Updates current_level, notes, and last_restocked_at.
   */
  async updateLevel(id: string, dto: UpdateItemLevelDto): Promise<InventoryItemResponse> {
    const item = await this.inventoryRepository.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Inventory item not found');

    item.current_level = dto.current_level;
    if (dto.notes !== undefined) {
      item.notes = dto.notes;
    }
    item.last_restocked_at = new Date();

    const saved = await this.inventoryRepository.save(item);
    return toResponse(saved);
  }

  /**
   * Soft delete (set is_active = false).
   */
  async remove(id: string): Promise<{ message: string }> {
    const item = await this.inventoryRepository.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Inventory item not found');
    item.is_active = false;
    await this.inventoryRepository.save(item);
    return { message: 'Inventory item deactivated successfully' };
  }
}
