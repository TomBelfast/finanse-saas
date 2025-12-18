import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { logger } from '../../utils/logger';

/**
 * Get Redis configuration from environment variables.
 * @throws Error if required environment variables are missing in production
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

  // Development fallback (with warning)
  if (!url || !token || url === 'https://example.com' || token === 'INVALID') {
    logger.warn(
      'UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN not set. Rate limiting may not work correctly. Using fallback values.',
      { url: url || 'missing', token: token ? 'set' : 'missing' }
    );
    return {
      url: 'https://example.com',
      token: 'INVALID',
    };
  }

  return { url, token };
}

const redisConfig = getRedisConfig();
const rateLimit = new Ratelimit({
  redis: new Redis({
    url: redisConfig.url,
    token: redisConfig.token,
  }),
  limiter: Ratelimit.fixedWindow(1, `1 s`),
  prefix: `db-limiter`,
});

type RateLimitOptions = {
  identifierArgs?: number[]; // Indices of arguments to use for the identifier
};

// External decorator function
export function RateLimit(optionalPropertyKey?: string, options: RateLimitOptions = {}) {
  return function (target: object, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      let identifier = `${target.constructor.name}_${optionalPropertyKey || propertyKey}`;

      if (options.identifierArgs && options.identifierArgs.length > 0) {
        const identifierParts = options.identifierArgs.map((index) => args[index]);
        identifier += `_${identifierParts.join('_')}`;
      }

      const { success, limit, reset, remaining } = await rateLimit.blockUntilReady(
        identifier,
        60_000
      );

      if (!success) {
        const error = new Error('Rate limit exceeded') as Error & { response?: { status: number; data: object } };
        error.response = {
          status: 429,
          data: { limit, reset, remaining },
        };
        throw error;
      }

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

export class BaseRepository {
  public rateLimit: Ratelimit;

  constructor() {
    this.rateLimit = rateLimit;
  }

  public async withRateLimit<T>(operation: () => Promise<T>, identifier: string) {
    const { success, limit, reset, remaining } = await this.rateLimit.blockUntilReady(
      identifier,
      30_000
    );

    if (!success) {
      const error = new Error('Rate limit exceeded. Unable to process, even after 30 seconds') as Error & { response?: { status: number; data: object } };
      error.response = {
        status: 429,
        data: { limit, reset, remaining },
      };
      throw error;
    }

    return operation();
  }

  public RateLimit() {
    return (target: object, propertyKey: string, descriptor: PropertyDescriptor) => {
      const originalMethod = descriptor.value;

      descriptor.value = async function (this: BaseRepository, ...args: unknown[]) {
        const identifier = `${target.constructor.name}_${propertyKey}`;
        const { success, limit, reset, remaining } = await this.rateLimit.blockUntilReady(
          identifier,
          30_000
        );

        if (!success) {
          const error = new Error('Rate limit exceeded') as Error & { response?: { status: number; data: object } };
          error.response = {
            status: 429,
            data: { limit, reset, remaining },
          };
          throw error;
        }

        return originalMethod.apply(this, args);
      };

      return descriptor;
    };
  }
}

export interface PaginatedResult<T> {
  data: T[];
  count: number;
  total: number;
}
