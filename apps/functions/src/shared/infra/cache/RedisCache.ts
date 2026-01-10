import { Redis } from '@upstash/redis';
import { logger } from '../../utils/logger';

/**
 * Get Redis configuration from environment variables.
 */
function getRedisConfig(): { url: string; token: string; enabled: boolean } {
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
    return { url, token, enabled: true };
  }

  // Development: disable if not properly configured or placeholder values
  const isPlaceholderUrl = !url || 
    url === 'https://example.com' || 
    url.includes('example.com') ||
    url.includes('your-url') ||
    url === 'https://your-url.upstash.io';
    
  const isPlaceholderToken = !token || 
    token === 'INVALID' || 
    token === 'your_token' ||
    token.length < 10;

  if (isPlaceholderUrl || isPlaceholderToken) {
    return {
      url: 'https://example.com',
      token: 'INVALID',
      enabled: false,
    };
  }

  // Check if URL looks valid (should be Upstash URL)
  if (!url.includes('upstash.io') && !url.includes('upstash.com')) {
    return {
      url: 'https://example.com',
      token: 'INVALID',
      enabled: false,
    };
  }

  return { url, token, enabled: true };
}

const redisConfig = getRedisConfig();
const redis = redisConfig.enabled ? new Redis({
  url: redisConfig.url,
  token: redisConfig.token,
}) : null;

/**
 * Redis Cache Service
 * Provides caching functionality for frequently accessed data
 */
export class RedisCache {
  private redis: Redis | null;
  private isEnabled: boolean;
  private failureCount: number = 0;
  private readonly MAX_FAILURES = 3;

  constructor() {
    this.redis = redis;
    // Only enable cache if Redis is properly configured
    this.isEnabled = redisConfig.enabled && redis !== null;
    
    if (!this.isEnabled && process.env.NODE_ENV !== 'production') {
      logger.warn('Redis cache is disabled - UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN not properly configured');
    }
  }

  /**
   * Get cached value by key
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.isEnabled || this.failureCount >= this.MAX_FAILURES || !this.redis) {
      return null;
    }

    try {
      // Add timeout to prevent long waits
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Redis timeout')), 1000);
      });

      const value = await Promise.race([
        this.redis.get(key),
        timeoutPromise,
      ]);

      // Reset failure count on success
      this.failureCount = 0;
      
      if (value) {
        logger.debug('Cache hit', { key });
        return value as T;
      }
      logger.debug('Cache miss', { key });
      return null;
    } catch (error) {
      this.failureCount++;
      if (this.failureCount >= this.MAX_FAILURES) {
        logger.warn(`Redis cache disabled after ${this.MAX_FAILURES} failures`, { key });
        this.isEnabled = false;
      } else {
        logger.error('Redis cache get error', error instanceof Error ? error : new Error(String(error)), { 
          key, 
          failureCount: this.failureCount 
        });
      }
      return null;
    }
  }

  /**
   * Set cached value with TTL (time to live) in seconds
   */
  async set(key: string, value: unknown, ttlSeconds: number = 300): Promise<boolean> {
    if (!this.isEnabled || this.failureCount >= this.MAX_FAILURES || !this.redis) {
      return false;
    }

    try {
      // Add timeout to prevent long waits
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Redis timeout')), 1000);
      });

      await Promise.race([
        this.redis.setex(key, ttlSeconds, JSON.stringify(value)),
        timeoutPromise,
      ]);

      // Reset failure count on success
      this.failureCount = 0;
      logger.debug('Cache set', { key, ttlSeconds });
      return true;
    } catch (error) {
      this.failureCount++;
      if (this.failureCount >= this.MAX_FAILURES) {
        logger.warn(`Redis cache disabled after ${this.MAX_FAILURES} failures`, { key });
        this.isEnabled = false;
      } else {
        logger.error('Redis cache set error', error instanceof Error ? error : new Error(String(error)), { 
          key, 
          failureCount: this.failureCount 
        });
      }
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

