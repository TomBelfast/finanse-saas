import { Redis as UpstashRedis } from '@upstash/redis';
import Redis from 'ioredis';
import { logger } from '../../utils/logger';

type RedisClient = UpstashRedis | Redis;
type RedisClientType = 'upstash' | 'standard' | 'disabled';

interface RedisConfig {
  client: RedisClient | null;
  type: RedisClientType;
  enabled: boolean;
}

/**
 * Get Redis configuration from environment variables.
 * Supports both Upstash REST API and standard Redis connection string.
 */
function getRedisConfig(): RedisConfig {
  // Check for standard Redis connection string (redis:// or rediss://)
  const redisUrl = process.env.REDIS_URL;
  if (redisUrl && (redisUrl.startsWith('redis://') || redisUrl.startsWith('rediss://'))) {
    try {
      const client = new Redis(redisUrl, {
        maxRetriesPerRequest: 3,
        retryStrategy: (times) => {
          if (times > 3) {
            return null; // Stop retrying
          }
          return Math.min(times * 200, 2000); // Retry with exponential backoff
        },
        connectTimeout: 5000,
      });

      logger.info('Redis cache enabled using standard Redis connection string');
      return { client, type: 'standard', enabled: true };
    } catch (error) {
      logger.error('Failed to initialize standard Redis client', error instanceof Error ? error : new Error(String(error)));
      return { client: null, type: 'disabled', enabled: false };
    }
  }

  // Fallback to Upstash REST API
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  // Check for placeholder or invalid values
  const isPlaceholderUrl = !url || 
    url === 'https://example.com' || 
    url.includes('example.com') ||
    url.includes('your-url') ||
    url === 'https://your-url.upstash.io';
    
  const isPlaceholderToken = !token || 
    token === 'INVALID' || 
    token === 'your_token' ||
    (token && token.length < 10);

  // If placeholder values, disable Redis (cache will be disabled, but app will work)
  if (isPlaceholderUrl || isPlaceholderToken) {
    if (process.env.NODE_ENV === 'production') {
      logger.warn(
        'Redis cache is disabled in production - REDIS_URL or UPSTASH_REDIS_REST_URL/UPSTASH_REDIS_REST_TOKEN not configured. ' +
        'Application will work without cache, but performance may be reduced. ' +
        'To enable cache, set REDIS_URL (for standard Redis) or UPSTASH_REDIS_REST_URL/UPSTASH_REDIS_REST_TOKEN (for Upstash) in environment variables.'
      );
    }
    return { client: null, type: 'disabled', enabled: false };
  }

  // Check if URL looks valid (should be Upstash URL)
  if (!url.includes('upstash.io') && !url.includes('upstash.com')) {
    if (process.env.NODE_ENV === 'production') {
      logger.warn('Redis URL does not appear to be a valid Upstash URL. Cache disabled.');
    }
    return { client: null, type: 'disabled', enabled: false };
  }

  // Valid Upstash Redis configuration found
  try {
    const client = new UpstashRedis({
      url,
      token,
    });
    logger.info('Redis cache enabled using Upstash REST API');
    return { client, type: 'upstash', enabled: true };
  } catch (error) {
    logger.error('Failed to initialize Upstash Redis client', error instanceof Error ? error : new Error(String(error)));
    return { client: null, type: 'disabled', enabled: false };
  }
}

const redisConfig = getRedisConfig();

/**
 * Redis Cache Service
 * Provides caching functionality for frequently accessed data
 * Supports both Upstash REST API and standard Redis connection string
 */
export class RedisCache {
  private redis: RedisClient | null;
  private redisType: RedisClientType;
  private isEnabled: boolean;
  private failureCount: number = 0;
  private readonly MAX_FAILURES = 3;

  constructor() {
    this.redis = redisConfig.client;
    this.redisType = redisConfig.type;
    this.isEnabled = redisConfig.enabled && redisConfig.client !== null;
    
    if (!this.isEnabled) {
      logger.warn('Redis cache is disabled - REDIS_URL or UPSTASH_REDIS_REST_URL/UPSTASH_REDIS_REST_TOKEN not properly configured. Application will work without cache.');
    } else {
      logger.info(`Redis cache is enabled and ready (type: ${this.redisType})`);
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

      let value: string | null;
      if (this.redisType === 'upstash') {
        value = await Promise.race([
          (this.redis as UpstashRedis).get(key),
          timeoutPromise,
        ]) as string | null;
      } else {
        // Standard Redis (ioredis)
        value = await Promise.race([
          (this.redis as Redis).get(key),
          timeoutPromise,
        ]) as string | null;
      }

      // Reset failure count on success
      this.failureCount = 0;
      
      if (value) {
        logger.debug('Cache hit', { key });
        try {
          return JSON.parse(value) as T;
        } catch {
          // If parsing fails, return as-is (might be a plain string)
          return value as unknown as T;
        }
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

      const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);

      if (this.redisType === 'upstash') {
        await Promise.race([
          (this.redis as UpstashRedis).setex(key, ttlSeconds, serializedValue),
          timeoutPromise,
        ]);
      } else {
        // Standard Redis (ioredis) - setex syntax: setex(key, seconds, value)
        await Promise.race([
          (this.redis as Redis).setex(key, ttlSeconds, serializedValue),
          timeoutPromise,
        ]);
      }

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
    if (!this.isEnabled || !this.redis) {
      return false;
    }

    try {
      if (this.redisType === 'upstash') {
        await (this.redis as UpstashRedis).del(key);
      } else {
        await (this.redis as Redis).del(key);
      }
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
    if (!this.isEnabled || !this.redis) {
      return 0;
    }

    try {
      if (this.redisType === 'upstash') {
        // Upstash Redis doesn't support KEYS command directly
        // We'll use SCAN if available, or track keys manually
        // For now, return 0 and log a warning
        logger.warn('deletePattern not fully implemented for Upstash Redis', { pattern });
        return 0;
      } else {
        // Standard Redis (ioredis) - use SCAN to find keys matching pattern
        const stream = (this.redis as Redis).scanStream({
          match: pattern,
          count: 100,
        });
        
        let deletedCount = 0;
        const keysToDelete: string[] = [];
        
        for await (const keys of stream) {
          keysToDelete.push(...keys);
        }
        
        if (keysToDelete.length > 0) {
          deletedCount = await (this.redis as Redis).del(...keysToDelete);
        }
        
        logger.debug('Cache deletePattern', { pattern, deletedCount });
        return deletedCount;
      }
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

