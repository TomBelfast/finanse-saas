import { ApiLoan, ApiSubscription, ApiInsurance, ApiAI } from '~/types/api';

export interface ReportsTotals {
  totalMonthly: number;
  totalYearly: number;
  totalRemaining: number;
  totalIncome: number;
  loansMonthly: number;
  loansRemaining: number;
  subscriptionsMonthly: number;
  subscriptionsYearly: number;
  insurancesMonthly: number;
  insurancesYearly: number;
  aiMonthly: number;
  aiYearly: number;
}

export interface ChartDataItem {
  name: string;
  value?: number;
  amount?: number;
  remaining?: number;
  monthly?: number;
  fill: string;
  cycle?: string;
  paymentStatus?: string;
}

export interface ChartConfig {
  data: ChartDataItem[];
  config: Record<string, { label: string; color: string }>;
  COLORS: string[];
}

export interface ActiveLoansData {
  activeLoans: ApiLoan[];
  chartData: ChartDataItem[];
  config: Record<string, { label: string; color: string }>;
  COLORS: string[];
}

export interface ReportsData {
  loans: ApiLoan[];
  subscriptions: ApiSubscription[];
  insurances: ApiInsurance[];
  ai: ApiAI[];
  loading: boolean;
}

