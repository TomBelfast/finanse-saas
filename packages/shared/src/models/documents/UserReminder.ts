// Removed firebase dependency
type Timestamp = string;

export enum UserReminderItemType {
  Subscription = 'subscription',
  Insurance = 'insurance',
  Loan = 'loan',
}

export enum UserReminderStatus {
  Active = 'active',
  Sent = 'sent',
  Failed = 'failed',
  Cancelled = 'cancelled',
}

export interface UserReminderDocument {
  id: string;
  userId: string;
  itemId: string; // ID of the subscription, insurance, or loan
  itemType: UserReminderItemType;
  daysBeforeDate: number; // Number of days before the renewal/payment date
  status: UserReminderStatus;
  isEnabled: boolean;
  targetDate: Timestamp; // The date of renewal/payment
  scheduledDate: Timestamp; // The date when reminder should be sent
  emailTemplate?: string;
  customMessage?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  sentAt?: Timestamp;
}

export interface UserReminderSettings {
  userId: string;
  subscriptionsEnabled: boolean;
  insurancesEnabled: boolean;
  loansEnabled: boolean;
  defaultDaysBeforeDates: number[]; // Array of default reminders, e.g. [30, 14, 3, 1]
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type CreateUserReminderDTO = Omit<UserReminderDocument, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'sentAt'>;

export type UpdateUserReminderDTO = Partial<Omit<UserReminderDocument, 'id' | 'userId' | 'itemId' | 'itemType' | 'createdAt' | 'updatedAt' | 'sentAt'>>; 