/**
 * Inventory types for the Stock module (EPIC 5)
 * Matches the backend InventoryItem entity + computed fields
 */

export type InventoryStatus = 'ok' | 'low' | 'critical';

export type InventoryCategory =
  | 'meats'
  | 'grains'
  | 'vegetables'
  | 'dairy'
  | 'beverages'
  | 'spirits'
  | 'condiments'
  | 'packaging'
  | 'cleaning'
  | 'other';

export type InventoryUnit = 'kg' | 'g' | 'l' | 'ml' | 'un' | 'cx' | 'pct' | 'dz';

export interface InventoryItem {
  id: string;
  restaurant_id: string;
  name: string;
  category: InventoryCategory;
  current_level: number;
  unit: InventoryUnit;
  min_level: number;
  max_level: number | null;
  unit_cost: number | null;
  supplier: string | null;
  is_active: boolean;
  notes: string | null;
  last_restocked_at: string | null;
  created_at: string;
  updated_at: string;
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

export interface CreateInventoryItemPayload {
  restaurant_id: string;
  name: string;
  category: InventoryCategory;
  current_level: number;
  unit: InventoryUnit;
  min_level: number;
  max_level?: number;
  unit_cost?: number;
  supplier?: string;
  notes?: string;
}

export interface UpdateItemLevelPayload {
  current_level: number;
  notes?: string;
}

export const INVENTORY_CATEGORIES: InventoryCategory[] = [
  'meats',
  'grains',
  'vegetables',
  'dairy',
  'beverages',
  'spirits',
  'condiments',
  'packaging',
  'cleaning',
  'other',
];

export const INVENTORY_UNITS: InventoryUnit[] = [
  'kg', 'g', 'l', 'ml', 'un', 'cx', 'pct', 'dz',
];
