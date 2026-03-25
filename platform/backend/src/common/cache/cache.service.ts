import { Injectable, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  prefix?: string;
}

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private readonly defaultTtl = 60 * 1000; // 60 seconds

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async get<T>(key: string, options?: CacheOptions): Promise<T | undefined> {
    const fullKey = this.buildKey(key, options?.prefix);
    try {
      const value = await this.cacheManager.get<T>(fullKey);
      if (value) {
        this.logger.debug(`Cache HIT: ${fullKey}`);
      } else {
        this.logger.debug(`Cache MISS: ${fullKey}`);
      }
      return value;
    } catch (error) {
      this.logger.error(`Cache GET error for ${fullKey}:`, error);
      return undefined;
    }
  }

  async set<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
    const fullKey = this.buildKey(key, options?.prefix);
    const ttl = options?.ttl || this.defaultTtl;
    try {
      await this.cacheManager.set(fullKey, value, ttl);
      this.logger.debug(`Cache SET: ${fullKey} (TTL: ${ttl}ms)`);
    } catch (error) {
      this.logger.error(`Cache SET error for ${fullKey}:`, error);
    }
  }

  async delete(key: string, options?: CacheOptions): Promise<void> {
    const fullKey = this.buildKey(key, options?.prefix);
    try {
      await this.cacheManager.del(fullKey);
      this.logger.debug(`Cache DEL: ${fullKey}`);
    } catch (error) {
      this.logger.error(`Cache DEL error for ${fullKey}:`, error);
    }
  }

  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    options?: CacheOptions,
  ): Promise<T> {
    const cached = await this.get<T>(key, options);
    if (cached !== undefined) {
      return cached;
    }

    const value = await factory();
    await this.set(key, value, options);
    return value;
  }

  async invalidatePattern(pattern: string): Promise<void> {
    try {
      // Pattern invalidation requires Redis store with keys support
      // For simple in-memory cache, this logs a warning
      const cacheWithStores = this.cacheManager as unknown as { stores?: Array<{ opts?: { store?: { keys: (pattern: string) => Promise<string[]> } } }> };
      if (cacheWithStores.stores && cacheWithStores.stores[0]?.opts?.store?.keys) {
        const keys = await cacheWithStores.stores[0].opts.store.keys(`${pattern}*`);
        if (keys && keys.length > 0) {
          await Promise.all(keys.map((key: string) => this.cacheManager.del(key)));
          this.logger.debug(`Cache INVALIDATE pattern: ${pattern} (${keys.length} keys)`);
        }
      } else {
        this.logger.debug(`Cache pattern invalidation skipped (no Redis): ${pattern}`);
      }
    } catch (error) {
      this.logger.error(`Cache INVALIDATE pattern error for ${pattern}:`, error);
    }
  }

  async invalidateRestaurantCache(restaurantId: string): Promise<void> {
    await this.invalidatePattern(`restaurant:${restaurantId}`);
    await this.invalidatePattern(`menu:${restaurantId}`);
    await this.invalidatePattern(`tables:${restaurantId}`);
  }

  async invalidateUserCache(userId: string): Promise<void> {
    await this.invalidatePattern(`user:${userId}`);
    await this.invalidatePattern(`orders:user:${userId}`);
  }

  private buildKey(key: string, prefix?: string): string {
    return prefix ? `${prefix}:${key}` : key;
  }
}

// Cache key builders
export const CacheKeys = {
  restaurant: (id: string) => `restaurant:${id}`,
  restaurantMenu: (id: string) => `menu:${id}`,
  restaurantTables: (id: string) => `tables:${id}`,
  user: (id: string) => `user:${id}`,
  userOrders: (userId: string) => `orders:user:${userId}`,
  analytics: (restaurantId: string, type: string) => `analytics:${restaurantId}:${type}`,
  menuItem: (id: string) => `menuItem:${id}`,
};

// Cache TTL constants (in milliseconds)
export const CacheTTL = {
  SHORT: 30 * 1000,      // 30 seconds
  MEDIUM: 5 * 60 * 1000, // 5 minutes
  LONG: 30 * 60 * 1000,  // 30 minutes
  HOUR: 60 * 60 * 1000,  // 1 hour
  DAY: 24 * 60 * 60 * 1000, // 24 hours
};
