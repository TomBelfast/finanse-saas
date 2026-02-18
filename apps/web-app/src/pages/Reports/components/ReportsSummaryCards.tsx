import React, { memo } from 'react';
import { formatCurrency, Currency } from '@akademiasaas/shared';
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { DollarSign, Briefcase, Shield, Zap, TrendingUp, Calculator, Wallet, Coins } from "lucide-react";
import { ReportsTotals } from '../types/reportsTypes';

interface ReportsSummaryCardsProps {
  totals: ReportsTotals;
  loading: boolean;
  userCurrency: Currency;
}

export const ReportsSummaryCards: React.FC<ReportsSummaryCardsProps> = memo(({
  totals,
  loading,
  userCurrency,
}) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 stagger-children">
      <Card className="stat-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Kredyty</CardTitle>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Briefcase className="h-4 w-4 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold tracking-tight animate-fade-in-up">
            {loading ? '...' : formatCurrency(totals.loansMonthly, userCurrency)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Rata miesięczna</p>
        </CardContent>
      </Card>

      <Card className="stat-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Finanse</CardTitle>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
            <DollarSign className="h-4 w-4 text-blue-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold tracking-tight animate-fade-in-up">
            {loading ? '...' : formatCurrency(totals.subscriptionsMonthly, userCurrency)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Subskrypcje miesięcznie</p>
        </CardContent>
      </Card>

      <Card className="stat-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Ubezpieczenia</CardTitle>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
            <Shield className="h-4 w-4 text-emerald-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold tracking-tight animate-fade-in-up">
            {loading ? '...' : formatCurrency(totals.insurancesMonthly, userCurrency)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Miesięczny ekwiwalent</p>
        </CardContent>
      </Card>

      <Card className="stat-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">AI</CardTitle>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10">
            <Zap className="h-4 w-4 text-purple-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold tracking-tight animate-fade-in-up">
            {loading ? '...' : formatCurrency(totals.aiMonthly, userCurrency)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Miesięczny ekwiwalent</p>
        </CardContent>
      </Card>

      <Card className="stat-card border-primary/20 bg-primary/[0.02]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-primary">Razem miesięcznie</CardTitle>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 shadow-sm shadow-primary/20">
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold tracking-tight text-primary animate-fade-in-up">
            {loading ? '...' : formatCurrency(totals.totalMonthly, userCurrency)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Suma wydatków stałych</p>
        </CardContent>
      </Card>

      <Card className="stat-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Razem rocznie</CardTitle>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
            <Calculator className="h-4 w-4 text-amber-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold tracking-tight text-amber-500 animate-fade-in-up">
            {loading ? '...' : formatCurrency(totals.totalMonthly * 12, userCurrency)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Suma roczna × 12</p>
        </CardContent>
      </Card>

      <Card className="stat-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Pozostało do spłaty</CardTitle>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10">
            <Wallet className="h-4 w-4 text-destructive" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold tracking-tight text-destructive animate-fade-in-up">
            {loading ? '...' : formatCurrency(totals.totalRemaining, userCurrency)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Zadłużenie całkowite</p>
        </CardContent>
      </Card>

      <Card className="stat-card border-emerald-500/20 bg-emerald-500/[0.02]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Dochód</CardTitle>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
            <Coins className="h-4 w-4 text-emerald-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold tracking-tight text-emerald-500 animate-fade-in-up">
            {loading ? '...' : formatCurrency(totals.totalIncome, userCurrency)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Przychód miesięczny</p>
        </CardContent>
      </Card>
    </div>
  );
});
