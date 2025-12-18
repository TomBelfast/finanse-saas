import { logger } from 'firebase-functions';
import { IssueInvoiceToNewPaymentUseCase } from './IssueInvoiceToNewPaymentUseCase';
import { validator } from './IssueInvoiceToNewPaymentDTOValidator';
import { IssueInvoiceToNewPaymentErrors } from './IssueInvoiceToNewPaymentErrors';
import { PubSubEventController } from 'shared/infra/http/PubSubEventController';

export class IssueInvoiceToNewPaymentController extends PubSubEventController {
  constructor(private useCase: IssueInvoiceToNewPaymentUseCase) {
    super();
  }

  async executeImpl(payload: unknown) {
    try {
      logger.debug(`Handling payload ${JSON.stringify(payload)}`);
      const dto = validator(payload);
      const result = await this.useCase.execute(dto);
      if (result.isLeft()) {
        throw result.value;
      } else {
        return this.ok(result.value.getValue());
      }
    } catch (err: unknown) {
      if (err instanceof IssueInvoiceToNewPaymentErrors.DtoValidationError) {
        return this.invalid(err.errorValue().message);
      }
      if (err instanceof IssueInvoiceToNewPaymentErrors.UnsupportedFeature) {
        return this.todo(err.errorValue().message);
      }
      const errorMessage = err instanceof Error 
        ? (err as { errorValue?: () => { message: string } }).errorValue?.()?.message ?? err.message
        : String(err);
      return this.fail(errorMessage);
    }
  }
}
