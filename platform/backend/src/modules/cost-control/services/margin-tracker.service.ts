import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Recipe } from '../entities/recipe.entity';
import { MenuItem } from '../../menu-items/entities/menu-item.entity';
import { TransactionCategory } from '../../financial/entities/financial-transaction.entity';
import { FinancialTransactionService } from '../../financial/financial-transaction.service';

export interface MarginItem {
  menu_item_id: string;
  name: string;
  category: string | null;
  sale_price: number;
  cost_price: number;
  margin_pct: number;
  units_sold: number;
  revenue: number;
  cogs: number;
  profit: number;
}

export interface MarginAlert {
  type: 'low_margin' | 'no_recipe';
  menu_item_id: string;
  name: string;
  margin_pct?: number;
  threshold?: number;
}

export interface FoodCostResult {
  food_cost_pct: number;
  total_cogs: number;
  total_food_revenue: number;
  status: 'healthy' | 'warning' | 'critical';
  benchmark: string;
}

@Injectable()
export class MarginTrackerService {
  private readonly logger = new Logger(MarginTrackerService.name);

  constructor(
    @InjectRepository(Recipe)
    private readonly recipeRepo: Repository<Recipe>,
    @InjectRepository(MenuItem)
    private readonly menuItemRepo: Repository<MenuItem>,
    private readonly financialTransactionService: FinancialTransactionService,
  ) {}

  /**
   * Get margin analysis for each menu item in the restaurant.
   * Returns sale_price, cost_price, margin_pct, units_sold, revenue, cogs, profit.
   */
  async getMargins(restaurantId: string, periodDays: number = 30): Promise<MarginItem[]> {
    const since = new Date();
    since.setDate(since.getDate() - periodDays);

    // Get all menu items for the restaurant
    const menuItems = await this.menuItemRepo.find({
      where: { restaurant_id: restaurantId, is_available: true },
      relations: ['category'],
    });

    // Get all recipes for the restaurant
    const recipes = await this.recipeRepo.find({
      where: { restaurant_id: restaurantId },
    });
    const recipeMap = new Map(recipes.map((r) => [r.menu_item_id, r]));

    // Get COGS transactions for the period (via FinancialTransactionService)
    const cogsTransactions = await this.financialTransactionService.findCogsTransactions(
      restaurantId,
      since,
    );

    // Get sale transactions for the period (via FinancialTransactionService)
    const saleTransactions = await this.financialTransactionService.findSaleTransactions(
      restaurantId,
      since,
      [TransactionCategory.FOOD_SALES, TransactionCategory.BEVERAGE_SALES],
    );

    // Aggregate COGS by menu_item_id
    const cogsMap = new Map<string, { totalCogs: number; unitsSold: number }>();
    for (const tx of cogsTransactions) {
      const meta = tx.metadata as any;
      if (!meta?.menu_item_id) continue;
      const itemId = meta.menu_item_id;
      const existing = cogsMap.get(itemId) || { totalCogs: 0, unitsSold: 0 };
      existing.totalCogs += Number(tx.amount);
      existing.unitsSold += Number(meta.quantity || 0);
      cogsMap.set(itemId, existing);
    }

    // Build margin items
    const margins: MarginItem[] = menuItems.map((item) => {
      const recipe = recipeMap.get(item.id);
      const cogsData = cogsMap.get(item.id) || { totalCogs: 0, unitsSold: 0 };
      const salePrice = Number(item.price);
      const costPrice = recipe ? Number(recipe.calculated_cost || 0) : 0;
      const marginPct = salePrice > 0
        ? Math.round(((salePrice - costPrice) / salePrice) * 10000) / 100
        : 0;
      const revenue = salePrice * cogsData.unitsSold;
      const profit = revenue - cogsData.totalCogs;

      return {
        menu_item_id: item.id,
        name: item.name,
        category: item.category?.name || null,
        sale_price: salePrice,
        cost_price: costPrice,
        margin_pct: marginPct,
        units_sold: cogsData.unitsSold,
        revenue: Math.round(revenue * 100) / 100,
        cogs: Math.round(cogsData.totalCogs * 100) / 100,
        profit: Math.round(profit * 100) / 100,
      };
    });

    // Sort ascending by margin (worst first)
    margins.sort((a, b) => a.margin_pct - b.margin_pct);

    return margins;
  }

  /**
   * Get margin alerts: items with margin below threshold + items without recipe.
   */
  async getAlerts(restaurantId: string, threshold: number = 25): Promise<MarginAlert[]> {
    const alerts: MarginAlert[] = [];

    // Get all menu items
    const menuItems = await this.menuItemRepo.find({
      where: { restaurant_id: restaurantId, is_available: true },
    });

    // Get all recipes
    const recipes = await this.recipeRepo.find({
      where: { restaurant_id: restaurantId },
    });
    const recipeMap = new Map(recipes.map((r) => [r.menu_item_id, r]));

    for (const item of menuItems) {
      const recipe = recipeMap.get(item.id);

      if (!recipe) {
        alerts.push({
          type: 'no_recipe',
          menu_item_id: item.id,
          name: item.name,
        });
        continue;
      }

      const costPrice = Number(recipe.calculated_cost || 0);
      const salePrice = Number(item.price);
      const marginPct = salePrice > 0
        ? Math.round(((salePrice - costPrice) / salePrice) * 10000) / 100
        : 0;

      if (marginPct < threshold && costPrice > 0) {
        alerts.push({
          type: 'low_margin',
          menu_item_id: item.id,
          name: item.name,
          margin_pct: marginPct,
          threshold,
        });
      }
    }

    // Sort: low_margin first (by margin ascending), then no_recipe
    alerts.sort((a, b) => {
      if (a.type === 'low_margin' && b.type === 'low_margin') {
        return (a.margin_pct || 0) - (b.margin_pct || 0);
      }
      if (a.type === 'low_margin') return -1;
      return 1;
    });

    return alerts;
  }

  /**
   * Calculate food cost percentage for the period.
   * food_cost_pct = (total COGS / total food revenue) x 100
   * Status: healthy (<30%), warning (30-35%), critical (>35%)
   */
  async getFoodCost(restaurantId: string, periodDays: number = 30): Promise<FoodCostResult> {
    const since = new Date();
    since.setDate(since.getDate() - periodDays);

    // Total COGS (via FinancialTransactionService)
    const totalCogs = await this.financialTransactionService.sumCogsAmount(restaurantId, since);

    // Total food revenue (via FinancialTransactionService)
    const totalFoodRevenue = await this.financialTransactionService.sumSaleRevenue(
      restaurantId,
      since,
      [TransactionCategory.FOOD_SALES, TransactionCategory.BEVERAGE_SALES],
    );
    const foodCostPct = totalFoodRevenue > 0
      ? Math.round((totalCogs / totalFoodRevenue) * 10000) / 100
      : 0;

    let status: 'healthy' | 'warning' | 'critical';
    if (foodCostPct < 30) {
      status = 'healthy';
    } else if (foodCostPct <= 35) {
      status = 'warning';
    } else {
      status = 'critical';
    }

    return {
      food_cost_pct: foodCostPct,
      total_cogs: Math.round(totalCogs * 100) / 100,
      total_food_revenue: Math.round(totalFoodRevenue * 100) / 100,
      status,
      benchmark: '28-35%',
    };
  }
}
