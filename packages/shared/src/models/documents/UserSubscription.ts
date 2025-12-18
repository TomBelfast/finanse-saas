// Removed firebase dependency
type Timestamp = string;

export enum UserSubscriptionStatus {
  Active = 'active',
  Inactive = 'inactive',
  PendingRenewal = 'pending_renewal',
  Cancelled = 'cancelled',
  Expired = 'expired',
}

export interface UserSubscriptionDocument {
  id: string;
  userId: string;
  name: string;
  amount: number;
  currency: string;
  periodStart: Timestamp;
  periodEnd: Timestamp;
  renewalDate: Timestamp;
  provider: string;
  description?: string;
  status: UserSubscriptionStatus;
  isAutomaticRenewal: boolean;
  category?: string;
  documents?: string[]; // Array of document IDs or URLs
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type CreateUserSubscriptionDTO = Omit<UserSubscriptionDocument, 'id' | 'createdAt' | 'updatedAt'>;

export type UpdateUserSubscriptionDTO = Partial<Omit<UserSubscriptionDocument, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>; 