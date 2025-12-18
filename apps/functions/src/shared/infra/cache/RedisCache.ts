import { Redis } from '@upstash/redis';
import { logger } from '../../utils/logger';

/**
 * Get Redis configuration from environment variables.
 */
function getRedisConfig(): { url: string; token: string } {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  // In production, require valid Redis configuration
  if (process.env.NODE_ENV === 'production') {
    if (!url || !token || url === 'https://example.com' || token === 'INVALID') {
      throw new Error(
        'UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are required in production. ' +
        'Please set them in environment variables.'
      );
    }
  }

  // Development fallback
  if (!url || !token || url === 'https://example.com' || token === 'INVALID') {
    return {
      url: 'https://example.com',
      token: 'INVALID',
    };
  }

  return { url, token };
}

const redisConfig = getRedisConfig();
const redis = new Redis({
  url: redisConfig.url,
  token: redisConfig.token,
});

/**
 * Redis Cache Service
 * Provides caching functionality for frequently accessed data
 */
export class RedisCache {
  private redis: Redis;
  private isEnabled: boolean;

  constructor() {
    this.redis = redis;
    // Only enable cache if Redis is properly configured
    this.isEnabled = redisConfig.url !== 'https://example.com' && redisConfig.token !== 'INVALID';
    
    if (!this.isEnabled && process.env.NODE_ENV !== 'production') {
      logger.warn('Redis cache is disabled - UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN not set');
    }
  }

  /**
   * Get cached value by key
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.isEnabled) {
      return null;
    }

    try {
      const value = await this.redis.get(key);
      if (value) {
        logger.debug('Cache hit', { key });
        return value as T;
      }
      logger.debug('Cache miss', { key });
      return null;
    } catch (error) {
      logger.error('Redis cache get error', error instanceof Error ? error : new Error(String(error)), { key });
      return null;
    }
  }

  /**
   * Set cached value with TTL (time to live) in seconds
   */
  async set(key: string, value: unknown, ttlSeconds: number = 300): Promise<boolean> {
    if (!this.isEnabled) {
      return false;
    }

    try {
      await this.redis.setex(key, ttlSeconds, JSON.stringify(value));
      logger.debug('Cache set', { key, ttlSeconds });
      return true;
    } catch (error) {
      logger.error('Redis cache set error', error instanceof Error ? error : new Error(String(error)), { key });
      return false;
    }
  }

  /**
   * Delete cached value by key
   */
  async delete(key: string): Promise<boolean> {
    if (!this.isEnabled) {
      return false;
    }

    try {
      await this.redis.del(key);
      logger.debug('Cache delete', { key });
      return true;
    } catch (error) {
      logger.error('Redis cache delete error', error instanceof Error ? error : new Error(String(error)), { key });
      return false;
    }
  }

  /**
   * Delete all cache entries matching a pattern
   */
  async deletePattern(pattern: string): Promise<number> {
    if (!this.isEnabled) {
      return 0;
    }

    try {
      // Upstash Redis doesn't support KEYS command directly
      // We'll use SCAN if available, or track keys manually
      // For now, return 0 and log a warning
      logger.warn('deletePattern not fully implemented for Upstash Redis', { pattern });
      return 0;
    } catch (error) {
      logger.error('Redis cache deletePattern error', error instanceof Error ? error : new Error(String(error)), { pattern });
      return 0;
    }
  }

  /**
   * Invalidate cache for a user's data
   */
  async invalidateUserCache(userId: string): Promise<void> {
    if (!this.isEnabled) {
      return;
    }

    const patterns = [
      `user:${userId}:subscriptions:*`,
      `user:${userId}:insurances:*`,
      `user:${userId}:loans:*`,
      `user:${userId}:ai:*`,
    ];

    for (const pattern of patterns) {
      await this.deletePattern(pattern);
    }

    logger.debug('User cache invalidated', { userId });
  }

  /**
   * Generate cache key for user data
   */
  static generateKey(prefix: string, userId: string, params?: Record<string, string | number>): string {
    const parts = [prefix, userId];
    if (params) {
      const sortedParams = Object.keys(params)
        .sort()
        .map(key => `${key}:${params[key]}`)
        .join(':');
      parts.push(sortedParams);
    }
    return parts.join(':');
  }
}

// Singleton instance
export const redisCache = new RedisCache();

