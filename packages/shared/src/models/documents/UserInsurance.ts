// Removed firebase dependency
type Timestamp = string;

export enum UserInsuranceStatus {
  Active = 'active',
  Inactive = 'inactive',
  PendingRenewal = 'pending_renewal',
  Cancelled = 'cancelled',
  Expired = 'expired',
}

export enum UserInsuranceType {
  Health = 'health',
  Life = 'life',
  Car = 'car',
  Home = 'home',
  Travel = 'travel',
  Liability = 'liability',
  Other = 'other',
}

export interface UserInsuranceDocument {
  id: string;
  userId: string;
  name: string;
  amount: number;
  currency: string;
  periodStart: Timestamp;
  periodEnd: Timestamp;
  renewalDate: Timestamp;
  insuranceCompany: string;
  policyNumber?: string;
  insuredObject?: string;
  description?: string;
  insuranceType: UserInsuranceType;
  status: UserInsuranceStatus;
  documents?: string[]; // Array of document IDs or URLs
  category?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type CreateUserInsuranceDTO = Omit<UserInsuranceDocument, 'id' | 'createdAt' | 'updatedAt'>;

export type UpdateUserInsuranceDTO = Partial<Omit<UserInsuranceDocument, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>; 