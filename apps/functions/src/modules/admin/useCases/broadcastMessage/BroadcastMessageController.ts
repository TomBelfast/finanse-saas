import { CloudFunctionController } from 'shared/infra/http/CloudFunctionController';
import { BroadcastMessageUseCase } from './BroadcastMessageUseCase';
import { AuthenticatedUser } from 'shared/core/AuthenticatedUser';
import { AppError } from 'shared/core/AppError';
import { BroadcastMessageErrors } from './BroadcastMessageErrors';
import { logger } from 'shared/utils/logger';
import { validator } from './BroadcastMessageDTOValidator';

export class BroadcastMessageController extends CloudFunctionController {
  constructor(private useCase: BroadcastMessageUseCase) {
    super();
  }

  protected async executeImpl<TResult = unknown>(payload: unknown, user: AuthenticatedUser): Promise<TResult> {
    try {
      logger.debug('Handling broadcast message payload', { payload });
      const dto = validator(payload);
      const result = await this.useCase.execute(dto, user.uid);

      if (result.isLeft()) {
        throw result.value;
      } else {
        return this.ok(result.value.getValue()) as TResult;
      }
    } catch (err) {
      const error = err as Error & { errorValue?: () => { message: string } };
      switch (error.constructor) {
        case BroadcastMessageErrors.NotAuthorized:
          this.unauthorized(error.errorValue?.()?.message || 'Not authorized');
          throw new Error('Unauthorized');
        case BroadcastMessageErrors.BroadcastFailed:
          this.fail(error.errorValue?.()?.message || 'Broadcast failed');
          throw new Error('Broadcast failed');
        case AppError.UnexpectedError:
          this.fail(error.errorValue?.()?.message || 'Unexpected error');
          throw new Error('Unexpected error');
        default:
          this.fail(error.errorValue?.()?.message || error.message || 'Unknown error');
          throw error;
      }
    }
  }
}
