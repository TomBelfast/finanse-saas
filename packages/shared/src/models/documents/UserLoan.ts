// Removed firebase dependency
type Timestamp = string;

export enum UserLoanStatus {
  Active = 'active',
  Paid = 'paid',
  Delayed = 'delayed',
  Defaulted = 'defaulted',
  Refinanced = 'refinanced',
}

export enum UserLoanType {
  Mortgage = 'mortgage',
  Personal = 'personal',
  Car = 'car',
  Student = 'student',
  Business = 'business',
  Credit = 'credit',
  Other = 'other',
}

export interface UserLoanDocument {
  id: string;
  userId: string;
  name: string;
  totalAmount: number; // Total loan amount
  remainingAmount: number; // Remaining amount to pay
  interestRate: number; // Annual interest rate in percentage
  currency: string;
  startDate: Timestamp;
  endDate: Timestamp;
  nextPaymentDate: Timestamp;
  nextPaymentAmount: number;
  lender: string; // Bank or financial institution
  loanNumber?: string;
  description?: string;
  loanType: UserLoanType;
  status: UserLoanStatus;
  paymentFrequency: 'monthly' | 'quarterly' | 'yearly' | 'custom';
  durationInMonths: number;
  documents?: string[]; // Array of document IDs or URLs
  category?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type CreateUserLoanDTO = Omit<UserLoanDocument, 'id' | 'createdAt' | 'updatedAt'>;

export type UpdateUserLoanDTO = Partial<Omit<UserLoanDocument, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>; 