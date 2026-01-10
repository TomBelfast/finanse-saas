/**
 * API Response Types
 * These types represent the raw data returned from the REST API
 * (snake_case format from database)
 */

// Base types for API responses (snake_case from database)
export interface ApiSubscription {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  currency: string;
  period_start: string | Date;
  period_end: string | Date;
  renewal_date: string | Date;
  provider: string;
  description?: string | null;
  status: string;
  is_automatic_renewal: boolean;
  category?: string | null;
  documents?: string | null; // JSON string or null
  created_at: string | Date;
  updated_at: string | Date;
}

export interface ApiInsurance {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  currency: string;
  period_start: string | Date;
  period_end: string | Date;
  renewal_date: string | Date;
  insurance_company: string;
  policy_number?: string | null;
  insured_object?: string | null;
  description?: string | null;
  insurance_type: string;
  status: string;
  category?: string | null;
  documents?: string | null; // JSON string or null
  created_at: string | Date;
  updated_at: string | Date;
}

export interface ApiLoan {
  id: string;
  user_id: string;
  name: string;
  total_amount: number;
  remaining_amount: number;
  interest_rate: number;
  currency: string;
  start_date: string | Date;
  end_date: string | Date;
  next_payment_date: string | Date;
  next_payment_amount: number;
  lender: string;
  loan_number?: string | null;
  description?: string | null;
  loan_type: string;
  status: string;
  payment_frequency: string;
  duration_in_months: number;
  category?: string | null;
  documents?: string | null; // JSON string or null
  created_at: string | Date;
  updated_at: string | Date;
}

// AI uses the same structure as Insurance
export type ApiAI = ApiInsurance;

// User API response type
export interface ApiUser {
  id: string;
  uid?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  default_currency?: string;
  created_at?: string | Date;
  updated_at?: string | Date;
  [key: string]: unknown; // Allow additional fields
}

