"use client"

import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { addDays, format } from 'date-fns';
import { DateRange } from "react-day-picker";
import { AppStore, formatCurrency, Currency } from '@akademiasaas/shared';
import { apiClient } from '../../services/apiClient';
import {
  BarChart,
  LineChart,
  PieChart,
  AreaChart,
  Bar,
  Line,
  Pie,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ComposedChart,
  LabelList,
  Cell,
} from 'recharts';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig
} from "~/components/ui/chart"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "~/components/ui/tabs"
import { Button } from "~/components/ui/button"
import { Calendar } from "~/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table"
import { Progress } from "~/components/ui/progress"

import {
  Download,
  Calendar as CalendarIcon,
  Users as UsersIcon,
  DollarSign,
  FileText,
  Clock,
  BarChart3,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  CreditCard,
  Wallet,
  ShieldCheck,
  Brain,
} from "lucide-react"

import { cn } from "~/lib/utils"

// --- DANE I KONFIGURACJA ---

// 1. User Engagement
const userEngagementData = [
  { day: 'Monday', usersCount: 120, sessionTime: 15.2, pagesViewed: 8.5 },
  { day: 'Tuesday', usersCount: 132, sessionTime: 17.8, pagesViewed: 10.2 },
  { day: 'Wednesday', usersCount: 101, sessionTime: 14.3, pagesViewed: 7.8 },
  { day: 'Thursday', usersCount: 134, sessionTime: 16.9, pagesViewed: 9.6 },
  { day: 'Friday', usersCount: 90, sessionTime: 12.1, pagesViewed: 6.3 },
  { day: 'Saturday', usersCount: 85, sessionTime: 10.5, pagesViewed: 5.2 },
  { day: 'Sunday', usersCount: 93, sessionTime: 11.2, pagesViewed: 5.8 },
];

const userEngagementConfig = {
  usersCount: {
    label: "Users",
    color: "hsl(var(--chart-1))",
  },
  sessionTime: {
    label: "Session Time",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

// 2. Revenue
const revenueData = [
  { month: 'January', revenue: 12500, users: 150, averageRevenue: 83.33 },
  { month: 'February', revenue: 15000, users: 175, averageRevenue: 85.71 },
  { month: 'March', revenue: 18500, users: 200, averageRevenue: 92.5 },
  { month: 'April', revenue: 22000, users: 220, averageRevenue: 100.0 },
  { month: 'May', revenue: 24500, users: 240, averageRevenue: 102.08 },
  { month: 'June', revenue: 21000, users: 210, averageRevenue: 100.0 },
];

const revenueConfig = {
  revenue: {
    label: "Revenue ($)",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig

// 3. Top Users (Pie/Donut & Bar)
const topUsersByActivity = [
  { name: 'John Doe', email: 'john@ex.com', sessions: 45, documentsCreated: 28, fill: "hsl(var(--chart-1))" },
  { name: 'Jane Smith', email: 'jane@ex.com', sessions: 38, documentsCreated: 22, fill: "hsl(var(--chart-2))" },
  { name: 'Robert Brown', email: 'robert@ex.com', sessions: 32, documentsCreated: 18, fill: "hsl(var(--chart-3))" },
  { name: 'Sarah Williams', email: 'sarah@ex.com', sessions: 30, documentsCreated: 15, fill: "hsl(var(--chart-4))" },
  { name: 'Thomas Wilson', email: 'thomas@ex.com', sessions: 25, documentsCreated: 12, fill: "hsl(var(--chart-5))" },
].map((u, i) => ({ ...u, key: (i + 1).toString() }));

const topUsersConfig = {
  sessions: {
    label: "Sessions",
  },
  documentsCreated: {
    label: "Documents",
  },
} satisfies ChartConfig

const documentsConfig = {
  documentsCreated: {
    label: "Documents",
    color: "hsl(var(--chart-4))",
  }
} satisfies ChartConfig

// --- KOMPONENT ---

const Reports: React.FC = () => {
  const { t } = useTranslation(['dashboard', 'common']);
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 7),
  });

  const userDetails = useSelector((store: AppStore) => store.user.details);
  const userCurrency = (userDetails?.defaultCurrency || 'pln') as Currency;

  // Data fetching
  const [loans, setLoans] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [insurances, setInsurances] = useState<any[]>([]);
  const [ai, setAI] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper function to parse amount
  const parseAmount = (amount: any): number => {
    if (typeof amount === 'number') return amount;
    if (typeof amount === 'string') {
      const cleaned = amount.replace(/[^\d.,-]/g, '').replace(',', '.');
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [loansData, subscriptionsData, insurancesData, aiData] = await Promise.all([
          apiClient.getLoans(),
          apiClient.getSubscriptions(),
          apiClient.getInsurances(),
          apiClient.getAI(),
        ]);
        setLoans(loansData as any[]);
        setSubscriptions(subscriptionsData as any[]);
        setInsurances(insurancesData as any[]);
        setAI(aiData as any[]);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Calculate totals
  const totals = useMemo(() => {
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
    
    // Loans calculations - same logic as in Loans.tsx
    let loansMonthly = 0;
    let loansRemaining = 0;
    
    // Filter only active loans (same as Loans.tsx - only active loans count for remaining amount)
    const activeLoans = loans.filter((loan: any) => {
      const mappedStatus = statusMap[loan.status] || loan.status;
      return mappedStatus === 'aktywna';
    });
    
    activeLoans.forEach((loan: any) => {
      const installmentAmount = parseAmount(loan.next_payment_amount || loan.installment_amount || 0);
      loansMonthly += installmentAmount;
      totalMonthly += installmentAmount;
      
      // Calculate remaining amount - same logic as Loans.tsx summary
      const originalAmount = parseAmount(loan.total_amount || loan.amount || 0);
      const remainingAmount = loan.remaining_amount ? parseAmount(loan.remaining_amount) : undefined;
      
      // Use remaining_amount from API if available and valid (same check as Loans.tsx)
      if (typeof remainingAmount === 'number' && !isNaN(remainingAmount) && remainingAmount >= 0) {
        loansRemaining += remainingAmount;
        totalRemaining += remainingAmount;
      } else {
        // Fallback: calculate based on installments if we have the data
        // Simplified version - in Loans.tsx there's getInstallmentsInfo with more complex logic
        const totalInstallments = loan.duration_in_months || loan.installments || 0;
        const startDate = loan.start_date || loan.startDate;
        
        if (totalInstallments > 0 && startDate && installmentAmount > 0) {
          // Calculate months passed
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
            // If date is invalid, use original amount as fallback
            loansRemaining += originalAmount;
            totalRemaining += originalAmount;
          }
        } else {
          // If we don't have installments data, use original amount as fallback
          loansRemaining += originalAmount;
          totalRemaining += originalAmount;
        }
      }
    });

    // Subscriptions calculations
    let subscriptionsMonthly = 0;
    let subscriptionsYearly = 0;
    subscriptions.forEach((sub: any) => {
      const amount = parseAmount(sub.amount || 0);
      // Handle both English and Polish cycle values
      const cycle = sub.cycle || 'monthly';
      
      if (cycle === 'monthly' || cycle === 'miesięczny') {
        subscriptionsMonthly += amount;
        totalMonthly += amount;
      } else if (cycle === 'yearly' || cycle === 'roczny' || cycle === 'year') {
        subscriptionsYearly += amount;
        totalYearly += amount;
        // Also add monthly equivalent
        subscriptionsMonthly += amount / 12;
        totalMonthly += amount / 12;
      } else {
        // Default to monthly if unknown
        subscriptionsMonthly += amount;
        totalMonthly += amount;
      }
    });

    // Insurances calculations
    let insurancesMonthly = 0;
    let insurancesYearly = 0;
    insurances.forEach((ins: any) => {
      const amount = parseAmount(ins.amount || ins.amountDue || 0);
      // Extract renewalCycle from description if needed (same logic as in Insurances.tsx)
      let renewalCycle = ins.renewalCycle;
      if (!renewalCycle && ins.description) {
        if (ins.description.includes('Renewal Cycle:')) {
          const match = ins.description.match(/Renewal Cycle:\s*(\w+)/);
          if (match) renewalCycle = match[1];
        }
      }
      if (!renewalCycle) {
        renewalCycle = 'monthly'; // default
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
    ai.forEach((aiItem: any) => {
      const amount = parseAmount(aiItem.amount || aiItem.amountDue || 0);
      // Extract renewalCycle from description if needed (same logic as in AI.tsx)
      let renewalCycle = aiItem.renewalCycle;
      if (!renewalCycle && aiItem.description) {
        if (aiItem.description.includes('Renewal Cycle:')) {
          const match = aiItem.description.match(/Renewal Cycle:\s*(\w+)/);
          if (match) renewalCycle = match[1];
        }
      }
      if (!renewalCycle) {
        renewalCycle = 'monthly'; // default
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

    // Income calculation
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
  }, [loans, subscriptions, insurances, ai]);

  // Chart preferences
  const [chartTypes, setChartTypes] = useState(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('dashboard_chart_types');
        return saved ? JSON.parse(saved) : {
          userEngagement: 'mixed',
          revenue: 'bar',
          sessions: 'pie',
          documents: 'bar'
        };
      }
      return { userEngagement: 'mixed', revenue: 'bar', sessions: 'pie', documents: 'bar' };
    } catch {
      return { userEngagement: 'mixed', revenue: 'bar', sessions: 'pie', documents: 'bar' };
    }
  });

  const changeChartType = (key: string, type: string) => {
    const newTypes = { ...chartTypes, [key]: type };
    setChartTypes(newTypes);
    if (typeof window !== 'undefined') {
      localStorage.setItem('dashboard_chart_types', JSON.stringify(newTypes));
    }
  };

  const handleDownloadReport = () => {
    console.log('Downloading report with date range:', date);
  };

  // --- RENDERERS ---

  const renderUserEngagementChart = () => {
    const type = chartTypes.userEngagement;

    // Common components
    const grid = <CartesianGrid vertical={false} />;
    const xAxis = (
      <XAxis
        dataKey="day"
        tickLine={false}
        axisLine={false}
        tickMargin={8}
        tickFormatter={(value) => value.slice(0, 3)}
      />
    );
    const tooltip = <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />;
    const legend = <ChartLegend content={<ChartLegendContent />} />;

    if (type === 'area') {
      return (
        <ChartContainer config={userEngagementConfig} className="max-h-[400px] w-full">
          <AreaChart data={userEngagementData} margin={{ left: 12, right: 12 }}>
            <defs>
              <linearGradient id="fillUsers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-usersCount)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-usersCount)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillSessions" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-sessionTime)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-sessionTime)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            {grid}
            {xAxis}
            {tooltip}
            {legend}
            <Area
              dataKey="sessionTime"
              type="natural"
              fill="url(#fillSessions)"
              fillOpacity={0.4}
              stroke="var(--color-sessionTime)"
              stackId="a"
            />
            <Area
              dataKey="usersCount"
              type="natural"
              fill="url(#fillUsers)"
              fillOpacity={0.4}
              stroke="var(--color-usersCount)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      );
    }

    if (type === 'bar') {
      return (
        <ChartContainer config={userEngagementConfig} className="max-h-[400px] w-full">
          <BarChart data={userEngagementData}>
            {grid}
            {xAxis}
            {tooltip}
            {legend}
            <Bar dataKey="usersCount" fill="var(--color-usersCount)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="sessionTime" fill="var(--color-sessionTime)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      );
    }

    if (type === 'line') {
      return (
        <ChartContainer config={userEngagementConfig} className="max-h-[400px] w-full">
          <LineChart data={userEngagementData} margin={{ left: 12, right: 12 }}>
            {grid}
            {xAxis}
            {tooltip}
            {legend}
            <Line dataKey="usersCount" type="monotone" stroke="var(--color-usersCount)" strokeWidth={2} dot={{ r: 4 }} />
            <Line dataKey="sessionTime" type="monotone" stroke="var(--color-sessionTime)" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ChartContainer>
      );
    }

    // Mixed
    return (
      <ChartContainer config={userEngagementConfig} className="max-h-[400px] w-full">
        <ComposedChart data={userEngagementData}>
          {grid}
          {xAxis}
          {tooltip}
          {legend}
          <Bar dataKey="usersCount" fill="var(--color-usersCount)" radius={[4, 4, 0, 0]} />
          <Line dataKey="sessionTime" type="monotone" stroke="var(--color-sessionTime)" strokeWidth={2} dot={{ r: 4 }} />
        </ComposedChart>
      </ChartContainer>
    );
  };

  const renderRevenueChart = () => {
    const type = chartTypes.revenue;
    const grid = <CartesianGrid vertical={false} />;
    const xAxis = (
      <XAxis
        dataKey="month"
        tickLine={false}
        axisLine={false}
        tickMargin={8}
        tickFormatter={(value) => value.slice(0, 3)}
      />
    );
    const tooltip = <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" formatter={(v) => `$${Number(v).toLocaleString()}`} />} />;

    if (type === 'area') {
      return (
        <ChartContainer config={revenueConfig} className="max-h-[400px] w-full">
          <AreaChart data={revenueData} margin={{ left: 12, right: 12 }}>
            <defs>
              <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            {grid}
            {xAxis}
            {tooltip}
            <Area
              dataKey="revenue"
              type="natural"
              fill="url(#fillRevenue)"
              fillOpacity={0.4}
              stroke="var(--color-revenue)"
            />
          </AreaChart>
        </ChartContainer>
      );
    }

    // Bar default
    return (
      <ChartContainer config={revenueConfig} className="max-h-[400px] w-full">
        <BarChart data={revenueData}>
          {grid}
          {xAxis}
          {tooltip}
          <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[4, 4, 0, 0]}>
            <LabelList position="top" offset={12} className="fill-foreground" fontSize={12} formatter={(v: number) => `$${v / 1000}k`} />
          </Bar>
        </BarChart>
      </ChartContainer>
    );
  };

  const renderSessionsChart = () => {
    const type = chartTypes.sessions;
    const innerRadius = type === 'donut' ? 60 : 0;

    return (
      <ChartContainer
        config={topUsersConfig}
        className="mx-auto aspect-square max-h-[350px] [&_.recharts-pie-label-text]:fill-foreground"
      >
        <PieChart>
          <ChartTooltip content={<ChartTooltipContent hideLabel />} />
          <Pie
            data={topUsersByActivity}
            dataKey="sessions"
            label
            nameKey="name"
            innerRadius={innerRadius}
          />
        </PieChart>
      </ChartContainer>
    );
  };

  const renderDocumentsChart = () => {
    return (
      <ChartContainer config={documentsConfig} className="max-h-[350px] w-full">
        <BarChart data={topUsersByActivity} layout="vertical" margin={{ left: 0 }}>
          <CartesianGrid horizontal={false} />
          <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={80} style={{ fontSize: '10px' }} />
          <XAxis type="number" hide />
          <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
          <Bar dataKey="documentsCreated" layout="vertical" radius={5} fill="var(--color-documentsCreated)">
            <LabelList dataKey="documentsCreated" position="right" className="fill-foreground font-bold" fontSize={12} />
          </Bar>
        </BarChart>
      </ChartContainer>
    );
  };

  return (
    <div className="container mx-auto space-y-6 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics & Reports</h2>
          <p className="text-muted-foreground">View detailed analytics and generate reports.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-[260px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "LLL dd, y")} -{" "}
                      {format(date.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(date.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
          <Button onClick={handleDownloadReport}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kredyty</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : formatCurrency(totals.loansMonthly, userCurrency)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Miesięczne raty
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Finanse</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : formatCurrency(totals.subscriptionsMonthly, userCurrency)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Subskrypcje miesięcznie
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ubezpieczenia</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : formatCurrency(totals.insurancesMonthly, userCurrency)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Miesięczny ekwiwalent
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : formatCurrency(totals.aiMonthly, userCurrency)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Miesięczny ekwiwalent
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Razem miesięcznie</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {loading ? '...' : formatCurrency(totals.totalMonthly, userCurrency)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Kredyty + Subskrypcje + Ubezpieczenia + AI
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Razem rocznie</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {loading ? '...' : formatCurrency(totals.totalMonthly * 12, userCurrency)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Suma miesięczna × 12
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pozostało do spłaty</CardTitle>
            <DollarSign className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {loading ? '...' : formatCurrency(totals.totalRemaining, userCurrency)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Suma pozostałych kwot z kredytów
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dochód</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {loading ? '...' : formatCurrency(totals.totalIncome, userCurrency)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Przychód (do skonfigurowania)
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="col-span-4">
        <CardContent className="p-6">
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" /> Przegląd
              </TabsTrigger>
              <TabsTrigger value="loans" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" /> Kredyty
              </TabsTrigger>
              <TabsTrigger value="finances" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" /> Finanse
              </TabsTrigger>
              <TabsTrigger value="insurances" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" /> Ubezpieczenia
              </TabsTrigger>
              <TabsTrigger value="ai" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" /> AI
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Podsumowanie wszystkich sekcji</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Rozkład kosztów miesięcznych</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {(() => {
                        const COLORS = [
                          "hsl(var(--chart-1))",
                          "hsl(var(--chart-2))",
                          "hsl(var(--chart-3))",
                          "hsl(var(--chart-4))",
                          "hsl(var(--chart-5))",
                        ];
                        const categoryData = [
                          { name: 'Kredyty', value: totals.loansMonthly, fill: COLORS[0] },
                          { name: 'Finanse', value: totals.subscriptionsMonthly, fill: COLORS[1] },
                          { name: 'Ubezpieczenia', value: totals.insurancesMonthly, fill: COLORS[2] },
                          { name: 'AI', value: totals.aiMonthly, fill: COLORS[3] },
                        ].filter(item => item.value > 0);
                        
                        const config = categoryData.reduce((acc, item) => {
                          acc[item.name] = { label: item.name, color: item.fill };
                          return acc;
                        }, {} as Record<string, { label: string; color: string }>);
                        
                        return categoryData.length > 0 ? (
                          <div className="w-full overflow-visible p-4">
                            <ChartContainer config={config} className="mx-auto aspect-square max-h-[400px] w-full [&_.recharts-pie-label-text]:fill-foreground [&_.recharts-pie-label-line]:stroke-foreground">
                              <PieChart margin={{ top: 60, right: 120, bottom: 60, left: 120 }}>
                                <ChartTooltip content={<ChartTooltipContent hideLabel formatter={(v) => formatCurrency(typeof v === 'number' ? v : Number(v) || 0, userCurrency)} />} />
                                <Pie 
                                  data={categoryData} 
                                  dataKey="value" 
                                  label={(entry: any) => {
                                    const { cx, cy, midAngle, innerRadius, outerRadius } = entry;
                                    const RADIAN = Math.PI / 180;
                                    const radius = outerRadius + 20;
                                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                                    const y = cy + radius * Math.sin(-midAngle * RADIAN);
                                    
                                    return (
                                      <text 
                                        x={x} 
                                        y={y} 
                                        fill="currentColor" 
                                        textAnchor={x > cx ? 'start' : 'end'} 
                                        dominantBaseline="central"
                                        style={{ fontSize: '13px', fontWeight: 500, whiteSpace: 'nowrap' }}
                                        className="fill-foreground"
                                      >
                                        {entry.name}
                                      </text>
                                    );
                                  }}
                                  labelLine={{ stroke: 'currentColor', strokeWidth: 1 }}
                                  nameKey="name"
                                  cx="50%"
                                  cy="50%"
                                  outerRadius={90}
                                  innerRadius={0}
                                >
                                  {categoryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                  ))}
                                </Pie>
                              </PieChart>
                            </ChartContainer>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">Brak danych</p>
                        );
                      })()}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Porównanie kosztów miesięcznych</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {(() => {
                        const COLORS = [
                          "hsl(var(--chart-1))",
                          "hsl(var(--chart-2))",
                          "hsl(var(--chart-3))",
                          "hsl(var(--chart-4))",
                        ];
                        const barData = [
                          { name: 'Kredyty', value: totals.loansMonthly, fill: COLORS[0] },
                          { name: 'Finanse', value: totals.subscriptionsMonthly, fill: COLORS[1] },
                          { name: 'Ubezpieczenia', value: totals.insurancesMonthly, fill: COLORS[2] },
                          { name: 'AI', value: totals.aiMonthly, fill: COLORS[3] },
                        ].filter(item => item.value > 0);
                        
                        const config = barData.reduce((acc, item) => {
                          acc[item.name] = { label: item.name, color: item.fill };
                          return acc;
                        }, {} as Record<string, { label: string; color: string }>);
                        
                        return barData.length > 0 ? (
                          <ChartContainer config={config} className="max-h-[300px] w-full">
                            <BarChart data={barData}>
                              <CartesianGrid vertical={false} />
                              <XAxis dataKey="name" tickLine={false} axisLine={false} style={{ fontSize: '12px' }} />
                              <YAxis tickLine={false} axisLine={false} style={{ fontSize: '12px' }} />
                              <ChartTooltip content={<ChartTooltipContent hideLabel formatter={(v) => formatCurrency(typeof v === 'number' ? v : Number(v) || 0, userCurrency)} />} />
                              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                {barData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ChartContainer>
                        ) : (
                          <p className="text-sm text-muted-foreground">Brak danych</p>
                        );
                      })()}
                    </CardContent>
                  </Card>
                </div>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Kategoria</TableHead>
                        <TableHead>Miesięcznie</TableHead>
                        <TableHead>Rocznie</TableHead>
                        <TableHead>Liczba elementów</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Kredyty</TableCell>
                        <TableCell>{formatCurrency(totals.loansMonthly, userCurrency)}</TableCell>
                        <TableCell>{formatCurrency(totals.loansMonthly * 12, userCurrency)}</TableCell>
                        <TableCell>{loans.filter((l: any) => {
                          const statusMap: Record<string, string> = {
                            'active': 'aktywna',
                            'paid': 'spłacona',
                            'delayed': 'opóźniona',
                            'defaulted': 'niespłacona',
                            'refinanced': 'refinansowana',
                          };
                          return (statusMap[l.status] || l.status) === 'aktywna';
                        }).length}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Finanse</TableCell>
                        <TableCell>{formatCurrency(totals.subscriptionsMonthly, userCurrency)}</TableCell>
                        <TableCell>{formatCurrency(totals.subscriptionsYearly + totals.subscriptionsMonthly * 12, userCurrency)}</TableCell>
                        <TableCell>{subscriptions.length}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Ubezpieczenia</TableCell>
                        <TableCell>{formatCurrency(totals.insurancesMonthly, userCurrency)}</TableCell>
                        <TableCell>{formatCurrency(totals.insurancesYearly + totals.insurancesMonthly * 12, userCurrency)}</TableCell>
                        <TableCell>{insurances.filter((i: any) => i.status === 'active' || i.status === 'pending').length}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">AI</TableCell>
                        <TableCell>{formatCurrency(totals.aiMonthly, userCurrency)}</TableCell>
                        <TableCell>{formatCurrency(totals.aiYearly + totals.aiMonthly * 12, userCurrency)}</TableCell>
                        <TableCell>{ai.filter((a: any) => a.status === 'active' || a.status === 'pending').length}</TableCell>
                      </TableRow>
                      <TableRow className="font-bold">
                        <TableCell>RAZEM</TableCell>
                        <TableCell>{formatCurrency(totals.totalMonthly, userCurrency)}</TableCell>
                        <TableCell>{formatCurrency(totals.totalYearly + totals.totalMonthly * 12, userCurrency)}</TableCell>
                        <TableCell>{loans.length + subscriptions.length + insurances.length + ai.length}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="loans" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Analiza kredytów</h3>
                {(() => {
                  const statusMap: Record<string, string> = {
                    'active': 'aktywna',
                    'paid': 'spłacona',
                    'delayed': 'opóźniona',
                    'defaulted': 'niespłacona',
                    'refinanced': 'refinansowana',
                  };
                  const activeLoans = loans.filter((loan: any) => (statusMap[loan.status] || loan.status) === 'aktywna');
                  
                  if (activeLoans.length === 0) {
                    return <p className="text-sm text-muted-foreground">Brak aktywnych kredytów</p>;
                  }
                  
                  const COLORS = [
                    "hsl(var(--chart-1))",
                    "hsl(var(--chart-2))",
                    "hsl(var(--chart-3))",
                    "hsl(var(--chart-4))",
                    "hsl(var(--chart-5))",
                  ];
                  
                  const chartData = activeLoans.map((loan: any, index: number) => ({
                    name: loan.name || `Kredyt ${index + 1}`,
                    remaining: parseAmount(loan.remaining_amount || 0),
                    monthly: parseAmount(loan.next_payment_amount || loan.installment_amount || 0),
                    fill: COLORS[index % COLORS.length],
                  })).filter(item => item.remaining > 0 || item.monthly > 0);
                  
                  const config = chartData.reduce((acc, item) => {
                    acc[item.name] = { label: item.name, color: item.fill };
                    return acc;
                  }, {} as Record<string, { label: string; color: string }>);
                  
                  return (
                    <div className="grid gap-4 md:grid-cols-2">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Pozostałe kwoty do spłaty</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ChartContainer config={config} className="max-h-[300px] w-full">
                            <BarChart data={chartData} layout="vertical">
                              <CartesianGrid horizontal={false} />
                              <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={150} style={{ fontSize: '12px' }} />
                              <XAxis type="number" tickLine={false} axisLine={false} style={{ fontSize: '12px' }} />
                              <ChartTooltip content={<ChartTooltipContent hideLabel formatter={(v) => formatCurrency(typeof v === 'number' ? v : Number(v) || 0, userCurrency)} />} />
                              <Bar dataKey="remaining" radius={5}>
                                {chartData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ChartContainer>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Miesięczne raty</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ChartContainer config={config} className="max-h-[300px] w-full">
                            <BarChart data={chartData} layout="vertical">
                              <CartesianGrid horizontal={false} />
                              <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={150} style={{ fontSize: '12px' }} />
                              <XAxis type="number" tickLine={false} axisLine={false} style={{ fontSize: '12px' }} />
                              <ChartTooltip content={<ChartTooltipContent hideLabel formatter={(v) => formatCurrency(typeof v === 'number' ? v : Number(v) || 0, userCurrency)} />} />
                              <Bar dataKey="monthly" radius={5}>
                                {chartData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ChartContainer>
                        </CardContent>
                      </Card>
                    </div>
                  );
                })()}
              </div>
            </TabsContent>

            <TabsContent value="finances" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Analiza finansów (Subskrypcje)</h3>
                {(() => {
                  if (subscriptions.length === 0) {
                    return <p className="text-sm text-muted-foreground">Brak subskrypcji</p>;
                  }
                  
                  const COLORS = [
                    "hsl(var(--chart-1))",
                    "hsl(var(--chart-2))",
                    "hsl(var(--chart-3))",
                    "hsl(var(--chart-4))",
                    "hsl(var(--chart-5))",
                  ];
                  
                  const chartData = subscriptions
                    .filter((sub: any) => parseAmount(sub.amount || 0) > 0)
                    .map((sub: any, index: number) => {
                      const amount = parseAmount(sub.amount || 0);
                      const cycle = sub.cycle || 'monthly';
                      const monthlyAmount = (cycle === 'yearly' || cycle === 'roczny') ? amount / 12 : amount;
                      
                      return {
                        name: sub.name || `Subskrypcja ${index + 1}`,
                        amount: monthlyAmount,
                        fill: COLORS[index % COLORS.length],
                        cycle: cycle === 'yearly' || cycle === 'roczny' ? 'Roczny' : 'Miesięczny',
                      };
                    })
                    .sort((a, b) => b.amount - a.amount);
                  
                  const config = chartData.reduce((acc, item) => {
                    acc[item.name] = { label: item.name, color: item.fill };
                    return acc;
                  }, {} as Record<string, { label: string; color: string }>);
                  
                  const tooltipFormatter = (v: any, name: any, props: any) => {
                    const value = typeof v === 'number' ? v : Number(v) || 0;
                    return [formatCurrency(value, userCurrency), props.payload?.cycle || ''];
                  };

                  return (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Wszystkie subskrypcje</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ChartContainer config={config} className="max-h-[400px] w-full">
                          <BarChart data={chartData} layout="vertical">
                            <CartesianGrid horizontal={false} />
                            <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={150} style={{ fontSize: '12px' }} />
                            <XAxis type="number" tickLine={false} axisLine={false} style={{ fontSize: '12px' }} />
                            <ChartTooltip content={<ChartTooltipContent hideLabel formatter={tooltipFormatter} />} />
                            <Bar dataKey="amount" radius={5}>
                              {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ChartContainer>
                      </CardContent>
                    </Card>
                  );
                })()}
              </div>
            </TabsContent>

            <TabsContent value="insurances" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Analiza ubezpieczeń</h3>
                {(() => {
                  const activeInsurances = insurances.filter((ins: any) => ins.status === 'active' || ins.status === 'pending');
                  
                  if (activeInsurances.length === 0) {
                    return <p className="text-sm text-muted-foreground">Brak aktywnych ubezpieczeń</p>;
                  }
                  
                  const COLORS = [
                    "hsl(var(--chart-1))",
                    "hsl(var(--chart-2))",
                    "hsl(var(--chart-3))",
                    "hsl(var(--chart-4))",
                    "hsl(var(--chart-5))",
                  ];
                  
                  const chartData = activeInsurances
                    .filter((ins: any) => parseAmount(ins.amount || ins.amountDue || 0) > 0)
                    .map((ins: any, index: number) => {
                      const amount = parseAmount(ins.amount || ins.amountDue || 0);
                      let renewalCycle = ins.renewalCycle;
                      if (!renewalCycle && ins.description) {
                        if (ins.description.includes('Renewal Cycle:')) {
                          const match = ins.description.match(/Renewal Cycle:\s*(\w+)/);
                          if (match) renewalCycle = match[1];
                        }
                      }
                      if (!renewalCycle) renewalCycle = 'monthly';
                      
                      const monthlyAmount = (renewalCycle === 'yearly' || renewalCycle === 'roczny') ? amount / 12 : amount;
                      
                      return {
                        name: ins.name || `Ubezpieczenie ${index + 1}`,
                        amount: monthlyAmount,
                        fill: COLORS[index % COLORS.length],
                        paymentStatus: ins.paymentStatus === 'zaplacono' ? 'Zapłacono' : 'Do zapłaty',
                      };
                    })
                    .sort((a, b) => b.amount - a.amount);
                  
                  const config = chartData.reduce((acc, item) => {
                    acc[item.name] = { label: item.name, color: item.fill };
                    return acc;
                  }, {} as Record<string, { label: string; color: string }>);
                  
                  return (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Wszystkie ubezpieczenia</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ChartContainer config={config} className="max-h-[400px] w-full">
                          <BarChart data={chartData} layout="vertical">
                            <CartesianGrid horizontal={false} />
                            <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={150} style={{ fontSize: '12px' }} />
                            <XAxis type="number" tickLine={false} axisLine={false} style={{ fontSize: '12px' }} />
                            <ChartTooltip content={<ChartTooltipContent hideLabel formatter={(v, name, props) => [formatCurrency(typeof v === 'number' ? v : Number(v) || 0, userCurrency), props.payload?.paymentStatus || '']} />} />
                            <Bar dataKey="amount" radius={5}>
                              {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ChartContainer>
                      </CardContent>
                    </Card>
                  );
                })()}
              </div>
            </TabsContent>

            <TabsContent value="ai" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Analiza usług AI</h3>
                {(() => {
                  const activeAI = ai.filter((aiItem: any) => aiItem.status === 'active' || aiItem.status === 'pending');
                  
                  if (activeAI.length === 0) {
                    return <p className="text-sm text-muted-foreground">Brak aktywnych usług AI</p>;
                  }
                  
                  const COLORS = [
                    "hsl(var(--chart-1))",
                    "hsl(var(--chart-2))",
                    "hsl(var(--chart-3))",
                    "hsl(var(--chart-4))",
                    "hsl(var(--chart-5))",
                  ];
                  
                  const chartData = activeAI
                    .filter((aiItem: any) => parseAmount(aiItem.amount || aiItem.amountDue || 0) > 0)
                    .map((aiItem: any, index: number) => {
                      const amount = parseAmount(aiItem.amount || aiItem.amountDue || 0);
                      let renewalCycle = aiItem.renewalCycle;
                      if (!renewalCycle && aiItem.description) {
                        if (aiItem.description.includes('Renewal Cycle:')) {
                          const match = aiItem.description.match(/Renewal Cycle:\s*(\w+)/);
                          if (match) renewalCycle = match[1];
                        }
                      }
                      if (!renewalCycle) renewalCycle = 'monthly';
                      
                      const monthlyAmount = (renewalCycle === 'yearly' || renewalCycle === 'roczny') ? amount / 12 : amount;
                      
                      return {
                        name: aiItem.name || `Usługa ${index + 1}`,
                        amount: monthlyAmount,
                        fill: COLORS[index % COLORS.length],
                        paymentStatus: aiItem.paymentStatus === 'zaplacono' ? 'Zapłacono' : 'Do zapłaty',
                      };
                    })
                    .sort((a, b) => b.amount - a.amount);
                  
                  const config = chartData.reduce((acc, item) => {
                    acc[item.name] = { label: item.name, color: item.fill };
                    return acc;
                  }, {} as Record<string, { label: string; color: string }>);
                  
                  return (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Wszystkie usługi AI</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ChartContainer config={config} className="max-h-[400px] w-full">
                          <BarChart data={chartData} layout="vertical">
                            <CartesianGrid horizontal={false} />
                            <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={150} style={{ fontSize: '12px' }} />
                            <XAxis type="number" tickLine={false} axisLine={false} style={{ fontSize: '12px' }} />
                            <ChartTooltip content={<ChartTooltipContent hideLabel formatter={(v, name, props) => [formatCurrency(typeof v === 'number' ? v : Number(v) || 0, userCurrency), props.payload?.paymentStatus || '']} />} />
                            <Bar dataKey="amount" radius={5}>
                              {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ChartContainer>
                      </CardContent>
                    </Card>
                  );
                })()}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
