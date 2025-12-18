import { useMemo, useCallback } from 'react';
import { formatCurrency, Currency } from '@akademiasaas/shared';
import { ApiLoan, ApiSubscription, ApiInsurance, ApiAI } from '~/types/api';
import { ReportsTotals, ChartConfig, ActiveLoansData } from '../types/reportsTypes';

interface UseReportsCalculationsProps {
  loans: ApiLoan[];
  subscriptions: ApiSubscription[];
  insurances: ApiInsurance[];
  ai: ApiAI[];
  userCurrency: Currency;
}

export function useReportsCalculations({
  loans,
  subscriptions,
  insurances,
  ai,
  userCurrency,
}: UseReportsCalculationsProps) {
  // Helper function to parse amount - memoized to avoid recreation
  const parseAmount = useCallback((amount: unknown): number => {
    if (typeof amount === 'number') return amount;
    if (typeof amount === 'string') {
      const cleaned = amount.replace(/[^\d.,-]/g, '').replace(',', '.');
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  }, []);

  // Calculate totals
  const totals = useMemo((): ReportsTotals => {
    let totalMonthly = 0;
    let totalYearly = 0;
    let totalRemaining = 0;
    let totalIncome = 0;

    // Map statuses from API (English) to Polish for filtering
    const statusMap: Record<string, string> = {
      'active': 'aktywna',
      'paid': 'spłacona',
      'delayed': 'opóźniona',
      'defaulted': 'niespłacona',
      'refinanced': 'refinansowana',
    };
    
    // Loans calculations
    let loansMonthly = 0;
    let loansRemaining = 0;
    
    const activeLoans = loans.filter((loan) => {
      const mappedStatus = statusMap[loan.status] || loan.status;
      return mappedStatus === 'aktywna';
    });
    
    activeLoans.forEach((loan) => {
      const installmentAmount = parseAmount(loan.next_payment_amount || 0);
      loansMonthly += installmentAmount;
      totalMonthly += installmentAmount;
      
      const originalAmount = parseAmount(loan.total_amount || 0);
      const remainingAmount = loan.remaining_amount ? parseAmount(loan.remaining_amount) : undefined;
      
      if (typeof remainingAmount === 'number' && !isNaN(remainingAmount) && remainingAmount >= 0) {
        loansRemaining += remainingAmount;
        totalRemaining += remainingAmount;
      } else {
        const totalInstallments = loan.duration_in_months || 0;
        const startDate = loan.start_date;
        
        if (totalInstallments > 0 && startDate && installmentAmount > 0) {
          const today = new Date();
          const start = new Date(startDate);
          if (!isNaN(start.getTime())) {
            const monthsPassed = today.getFullYear() * 12 + today.getMonth() - (start.getFullYear() * 12 + start.getMonth());
            const paid = Math.max(0, Math.min(totalInstallments, monthsPassed + 1));
            const left = Math.max(0, totalInstallments - paid);
            const leftAmount = left * installmentAmount;
            loansRemaining += leftAmount;
            totalRemaining += leftAmount;
          } else {
            loansRemaining += originalAmount;
            totalRemaining += originalAmount;
          }
        } else {
          loansRemaining += originalAmount;
          totalRemaining += originalAmount;
        }
      }
    });

    // Subscriptions calculations
    let subscriptionsMonthly = 0;
    let subscriptionsYearly = 0;
    subscriptions.forEach((sub) => {
      const amount = parseAmount(sub.amount || 0);
      const cycle = 'monthly'; // Default to monthly
      
      if (cycle === 'monthly' || cycle === 'miesięczny') {
        subscriptionsMonthly += amount;
        totalMonthly += amount;
      } else if (cycle === 'yearly' || cycle === 'roczny' || cycle === 'year') {
        subscriptionsYearly += amount;
        totalYearly += amount;
        subscriptionsMonthly += amount / 12;
        totalMonthly += amount / 12;
      } else {
        subscriptionsMonthly += amount;
        totalMonthly += amount;
      }
    });

    // Insurances calculations
    let insurancesMonthly = 0;
    let insurancesYearly = 0;
    insurances.forEach((ins) => {
      const amount = parseAmount(ins.amount || 0);
      let renewalCycle: string | undefined;
      if (ins.description) {
        if (ins.description.includes('Renewal Cycle:')) {
          const match = ins.description.match(/Renewal Cycle:\s*(\w+)/);
          if (match) renewalCycle = match[1];
        }
      }
      if (!renewalCycle) {
        renewalCycle = 'monthly';
      }
      
      if (renewalCycle === 'yearly' || renewalCycle === 'roczny') {
        insurancesYearly += amount;
        totalYearly += amount;
        insurancesMonthly += amount / 12;
        totalMonthly += amount / 12;
      } else {
        insurancesMonthly += amount;
        totalMonthly += amount;
      }
    });

    // AI calculations
    let aiMonthly = 0;
    let aiYearly = 0;
    ai.forEach((aiItem) => {
      const amount = parseAmount(aiItem.amount || 0);
      let renewalCycle: string | undefined;
      if (aiItem.description) {
        if (aiItem.description.includes('Renewal Cycle:')) {
          const match = aiItem.description.match(/Renewal Cycle:\s*(\w+)/);
          if (match) renewalCycle = match[1];
        }
      }
      if (!renewalCycle) {
        renewalCycle = 'monthly';
      }
      
      if (renewalCycle === 'yearly' || renewalCycle === 'roczny') {
        aiYearly += amount;
        totalYearly += amount;
        aiMonthly += amount / 12;
        totalMonthly += amount / 12;
      } else {
        aiMonthly += amount;
        totalMonthly += amount;
      }
    });

    totalIncome = 2287.67;

    return {
      totalMonthly,
      totalYearly,
      totalRemaining,
      totalIncome,
      loansMonthly,
      loansRemaining,
      subscriptionsMonthly,
      subscriptionsYearly,
      insurancesMonthly,
      insurancesYearly,
      aiMonthly,
      aiYearly,
    };
  }, [loans, subscriptions, insurances, ai, parseAmount]);

  // Memoized chart data for pie chart (monthly costs distribution)
  const categoryChartData = useMemo((): ChartConfig => {
    const COLORS = [
      "hsl(var(--chart-1))",
      "hsl(var(--chart-2))",
      "hsl(var(--chart-3))",
      "hsl(var(--chart-4))",
      "hsl(var(--chart-5))",
    ];
    const data = [
      { name: 'Kredyty', value: totals.loansMonthly, fill: COLORS[0] },
      { name: 'Finanse', value: totals.subscriptionsMonthly, fill: COLORS[1] },
      { name: 'Ubezpieczenia', value: totals.insurancesMonthly, fill: COLORS[2] },
      { name: 'AI', value: totals.aiMonthly, fill: COLORS[3] },
    ].filter(item => item.value > 0);
    
    const config = data.reduce((acc, item) => {
      acc[item.name] = { label: item.name, color: item.fill };
      return acc;
    }, {} as Record<string, { label: string; color: string }>);
    
    return { data, config, COLORS };
  }, [totals.loansMonthly, totals.subscriptionsMonthly, totals.insurancesMonthly, totals.aiMonthly]);

  // Memoized chart data for bar chart (monthly costs comparison)
  const barChartData = useMemo((): ChartConfig => {
    const COLORS = [
      "hsl(var(--chart-1))",
      "hsl(var(--chart-2))",
      "hsl(var(--chart-3))",
      "hsl(var(--chart-4))",
    ];
    const data = [
      { name: 'Kredyty', value: totals.loansMonthly, fill: COLORS[0] },
      { name: 'Finanse', value: totals.subscriptionsMonthly, fill: COLORS[1] },
      { name: 'Ubezpieczenia', value: totals.insurancesMonthly, fill: COLORS[2] },
      { name: 'AI', value: totals.aiMonthly, fill: COLORS[3] },
    ].filter(item => item.value > 0);
    
    const config = data.reduce((acc, item) => {
      acc[item.name] = { label: item.name, color: item.fill };
      return acc;
    }, {} as Record<string, { label: string; color: string }>);
    
    return { data, config, COLORS };
  }, [totals.loansMonthly, totals.subscriptionsMonthly, totals.insurancesMonthly, totals.aiMonthly]);

  // Memoized active loans data
  const activeLoansData = useMemo((): ActiveLoansData => {
    const statusMap: Record<string, string> = {
      'active': 'aktywna',
      'paid': 'spłacona',
      'delayed': 'opóźniona',
      'defaulted': 'niespłacona',
      'refinanced': 'refinansowana',
    };
    
    const activeLoans = loans.filter((loan) => {
      const mappedStatus = statusMap[loan.status] || loan.status;
      return mappedStatus === 'aktywna';
    });
    
    const COLORS = [
      "hsl(var(--chart-1))",
      "hsl(var(--chart-2))",
      "hsl(var(--chart-3))",
      "hsl(var(--chart-4))",
      "hsl(var(--chart-5))",
    ];
    
    const chartData = activeLoans.map((loan, index: number) => ({
      name: loan.name || `Kredyt ${index + 1}`,
      remaining: parseAmount(loan.remaining_amount || 0),
      monthly: parseAmount(loan.next_payment_amount || 0),
      fill: COLORS[index % COLORS.length],
    })).filter(item => item.remaining > 0 || item.monthly > 0);
    
    const config = chartData.reduce((acc, item) => {
      acc[item.name] = { label: item.name, color: item.fill };
      return acc;
    }, {} as Record<string, { label: string; color: string }>);
    
    return { activeLoans, chartData, config, COLORS };
  }, [loans, parseAmount]);

  // Memoized subscriptions chart data
  const subscriptionsChartData = useMemo(() => {
    if (subscriptions.length === 0) {
      return null;
    }
    
    const COLORS = [
      "hsl(var(--chart-1))",
      "hsl(var(--chart-2))",
      "hsl(var(--chart-3))",
      "hsl(var(--chart-4))",
      "hsl(var(--chart-5))",
    ];
    
    const chartData = subscriptions
      .filter((sub) => parseAmount(sub.amount || 0) > 0)
      .map((sub, index: number) => {
        const amount = parseAmount(sub.amount || 0);
        const monthlyAmount = amount;
        
        return {
          name: sub.name || `Subskrypcja ${index + 1}`,
          amount: monthlyAmount,
          fill: COLORS[index % COLORS.length],
          cycle: 'Miesięczny',
        };
      })
      .sort((a, b) => b.amount - a.amount);
    
    const config = chartData.reduce((acc, item) => {
      acc[item.name] = { label: item.name, color: item.fill };
      return acc;
    }, {} as Record<string, { label: string; color: string }>);
    
    return { chartData, config, COLORS };
  }, [subscriptions, parseAmount]);

  // Memoized tooltip formatter
  const currencyFormatter = useCallback((v: unknown) => {
    return formatCurrency(typeof v === 'number' ? v : Number(v) || 0, userCurrency);
  }, [userCurrency]);

  return {
    totals,
    categoryChartData,
    barChartData,
    activeLoansData,
    subscriptionsChartData,
    currencyFormatter,
    parseAmount,
  };
}

