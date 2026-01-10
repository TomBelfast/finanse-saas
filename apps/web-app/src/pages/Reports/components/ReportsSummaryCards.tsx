import React, { memo } from 'react';
import { formatCurrency, Currency } from '@akademiasaas/shared';
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { DollarSign } from "lucide-react";
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
            Rata miesięczna
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
  );
});

