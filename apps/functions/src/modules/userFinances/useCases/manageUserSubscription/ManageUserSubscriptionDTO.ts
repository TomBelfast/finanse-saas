import { z } from 'zod';
import { UserSubscriptionStatus } from '@akademiasaas/shared';

export const CreateUserSubscriptionDTOValidator = z.object({
  name: z.string().min(1, 'Name is required'),
  amount: z.number().nonnegative('Amount must be a positive number'),
  currency: z.string().min(1, 'Currency is required'),
  periodStart: z.date(),
  periodEnd: z.date(),
  renewalDate: z.date(),
  provider: z.string().min(1, 'Provider is required'),
  description: z.string().optional(),
  status: z.nativeEnum(UserSubscriptionStatus),
  isAutomaticRenewal: z.boolean(),
  category: z.string().optional(),
  documents: z.array(z.string()).optional(),
});

export const UpdateUserSubscriptionDTOValidator = CreateUserSubscriptionDTOValidator.partial();

export const GetUserSubscriptionParamsValidator = z.object({
  id: z.string().uuid('Invalid subscription ID'),
});

export const GetUserSubscriptionsQueryValidator = z.object({
  status: z.nativeEnum(UserSubscriptionStatus).optional(),
  category: z.string().optional(),
  fromDate: z.string().optional().transform((val) => val ? new Date(val) : undefined),
  toDate: z.string().optional().transform((val) => val ? new Date(val) : undefined),
}); 