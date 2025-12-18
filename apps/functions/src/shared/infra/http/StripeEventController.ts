import { logger } from '../../utils/logger';
import Stripe from 'stripe';

export abstract class StripeEventController {
  protected abstract executeImpl(event: Stripe.Event): Promise<any>;

  public async execute(event: Stripe.Event): Promise<any> {
    try {
      return this.executeImpl(event);
    } catch (err) {
      logger.error('[CloudFunctionController]: Uncaught controller error');
      logger.error(err);
      this.fail('An unexpected error occurred');
    }
  }

  public static errorResponse(code: string, message: string) {
    logger.error(`Function ended with error ${code}: ${message}`);

    return;
  }

  public ok<T>(dto?: T) {
    logger.debug('Returning dto', { dto });

    return {
      status: 'ok',
      data: dto || null,
    };
  }

  public warn<T>(dto?: T) {
    logger.warn('Returning dto', { dto });

    return {
      status: 'ok',
      data: dto || null,
    };
  }

  // ... (keeping other methods if not changing, but for tool usage I need contiguous or separate chunks. I'll do separate chunks for clarity or one big block if close)
  // Converting to one big block for the modified methods to cover the whole file changes needed.

  public fail(error: Error | string, _?: string) {
    logger.error('Stripe event processing failed', error);

    return;
  }
}
