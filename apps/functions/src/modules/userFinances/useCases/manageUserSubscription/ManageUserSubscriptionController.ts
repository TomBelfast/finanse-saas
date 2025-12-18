import { Request, Response } from 'express';
import {
  CreateUserSubscriptionDTO,
  UpdateUserSubscriptionDTO,
  UserSubscriptionDocument,
} from '@akademiasaas/shared';
import { UserSubscriptionRepository } from '../../../../shared/repositories';
import {
  CreateUserSubscriptionDTOValidator,
  GetUserSubscriptionParamsValidator,
  GetUserSubscriptionsQueryValidator,
  UpdateUserSubscriptionDTOValidator,
} from './ManageUserSubscriptionDTO';
import { logger } from '../../../../shared/utils/logger';

export class ManageUserSubscriptionController {
  constructor(private subscriptionRepository: UserSubscriptionRepository) { }

  async createUserSubscription(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const validation = CreateUserSubscriptionDTOValidator.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.format() });
      }

      // Destructure to avoid type mismatch in spread
      const { periodStart, periodEnd, renewalDate, ...otherData } = validation.data;

      const dto: CreateUserSubscriptionDTO = {
        ...otherData,
        userId,
        periodStart: new Date(periodStart).toISOString(),
        periodEnd: new Date(periodEnd).toISOString(),
        renewalDate: new Date(renewalDate).toISOString(),
      };

      const subscription = await this.subscriptionRepository.create(dto);
      return res.status(201).json(subscription);
    } catch (error: unknown) {
      const err = error as Error;
      logger.error('Error creating user subscription', err);
      return res.status(500).json({ error: err.message || 'Internal server error' });
    }
  }

  async updateUserSubscription(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { id } = req.params;
      const paramsValidation = GetUserSubscriptionParamsValidator.safeParse({ id });
      if (!paramsValidation.success) {
        return res.status(400).json({ error: paramsValidation.error.format() });
      }

      const validation = UpdateUserSubscriptionDTOValidator.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.format() });
      }

      // Destructure to avoid type mismatch in spread
      const { periodStart, periodEnd, renewalDate, ...otherData } = validation.data;

      const dto: UpdateUserSubscriptionDTO = {
        ...otherData,
      };

      if (periodStart) {
        dto.periodStart = new Date(periodStart).toISOString();
      }

      if (periodEnd) {
        dto.periodEnd = new Date(periodEnd).toISOString();
      }

      if (renewalDate) {
        dto.renewalDate = new Date(renewalDate).toISOString();
      }

      // Check if subscription exists and belongs to the user
      const subscription = await this.subscriptionRepository.getById(id);
      if (!subscription) {
        return res.status(404).json({ error: 'Subscription not found' });
      }

      if (subscription.userId !== userId) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const updatedSubscription = await this.subscriptionRepository.update(id, dto);
      return res.status(200).json(updatedSubscription);
    } catch (error: unknown) {
      const err = error as Error;
      logger.error('Error updating user subscription', err);
      return res.status(500).json({ error: err.message || 'Internal server error' });
    }
  }

  async deleteUserSubscription(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { id } = req.params;
      const validation = GetUserSubscriptionParamsValidator.safeParse({ id });
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.format() });
      }

      // Check if subscription exists and belongs to the user
      const subscription = await this.subscriptionRepository.getById(id);
      if (!subscription) {
        return res.status(404).json({ error: 'Subscription not found' });
      }

      if (subscription.userId !== userId) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      await this.subscriptionRepository.delete(id);
      return res.status(204).send();
    } catch (error: unknown) {
      const err = error as Error;
      logger.error('Error deleting user subscription', err);
      return res.status(500).json({ error: err.message || 'Internal server error' });
    }
  }

  async getUserSubscription(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { id } = req.params;
      const validation = GetUserSubscriptionParamsValidator.safeParse({ id });
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.format() });
      }

      const subscription = await this.subscriptionRepository.getById(id);
      if (!subscription) {
        return res.status(404).json({ error: 'Subscription not found' });
      }

      if (subscription.userId !== userId) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      return res.status(200).json(subscription);
    } catch (error: unknown) {
      const err = error as Error;
      logger.error('Error getting user subscription', err);
      return res.status(500).json({ error: err.message || 'Internal server error' });
    }
  }

  async getUserSubscriptions(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const validation = GetUserSubscriptionsQueryValidator.safeParse(req.query);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.format() });
      }

      // Get all subscriptions for user
      const subscriptions = await this.subscriptionRepository.getByUserId(userId);

      // Apply filters if provided
      let filteredSubscriptions = subscriptions;
      const { status, category, fromDate, toDate } = validation.data;

      if (status) {
        filteredSubscriptions = filteredSubscriptions.filter(
          (sub: UserSubscriptionDocument) => sub.status === status
        );
      }

      if (category) {
        filteredSubscriptions = filteredSubscriptions.filter(
          (sub: UserSubscriptionDocument) => sub.category === category
        );
      }

      if (fromDate) {
        const fromTime = fromDate.getTime();
        filteredSubscriptions = filteredSubscriptions.filter(
          (sub: UserSubscriptionDocument) => {
            const renewalTime = new Date(sub.renewalDate).getTime();
            return renewalTime >= fromTime;
          }
        );
      }

      if (toDate) {
        const toTime = toDate.getTime();
        filteredSubscriptions = filteredSubscriptions.filter(
          (sub: UserSubscriptionDocument) => {
            const renewalTime = new Date(sub.renewalDate).getTime();
            return renewalTime <= toTime;
          }
        );
      }

      return res.status(200).json(filteredSubscriptions);
    } catch (error: unknown) {
      const err = error as Error;
      logger.error('Error getting user subscriptions', err);
      return res.status(500).json({ error: err.message || 'Internal server error' });
    }
  }
}