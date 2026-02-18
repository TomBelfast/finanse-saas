import React, { memo } from 'react';
import { formatCurrency, Currency } from '@akademiasaas/shared';
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "~/components/ui/chart";
import { PieChart, Pie, Cell, BarChart, Bar, CartesianGrid, XAxis, YAxis } from 'recharts';
import { PieChart as PieIcon, BarChart3, List } from 'lucide-react';
import { ApiLoan, ApiSubscription, ApiInsurance, ApiAI } from '~/types/api';
import { ReportsTotals, ChartConfig } from '../types/reportsTypes';

interface ReportsOverviewTabProps {
  totals: ReportsTotals;
  categoryChartData: ChartConfig;
  barChartData: ChartConfig;
  loans: ApiLoan[];
  subscriptions: ApiSubscription[];
  insurances: ApiInsurance[];
  ai: ApiAI[];
  userCurrency: Currency;
  currencyFormatter: (v: unknown) => string;
}

export const ReportsOverviewTab: React.FC<ReportsOverviewTabProps> = memo(({
  totals,
  categoryChartData,
  barChartData,
  loans,
  subscriptions,
  insurances,
  ai,
  userCurrency,
  currencyFormatter,
}) => {
  const statusMap: Record<string, string> = {
    'active': 'aktywna',
    'paid': 'spłacona',
    'delayed': 'opóźniona',
    'defaulted': 'niespłacona',
    'refinanced': 'refinansowana',
  };

  const activeLoansCount = loans.filter((l: ApiLoan) => {
    return (statusMap[l.status] || l.status) === 'aktywna';
  }).length;

  const activeInsurancesCount = insurances.filter((i: ApiInsurance) =>
    i.status === 'active' || i.status === 'pending'
  ).length;

  const activeAICount = ai.filter((a: ApiAI) =>
    a.status === 'active' || a.status === 'pending'
  ).length;

  return (
    <div className="space-y-6 pt-4">
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm border-border/50">
          <CardHeader className="border-b border-border/50 pb-4">
            <CardTitle className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <PieIcon className="h-4 w-4" />
              </div>
              <span className="text-lg">Rozkład kosztów</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {categoryChartData.data.length > 0 ? (
              <div className="w-full overflow-visible">
                <ChartContainer config={categoryChartData.config} className="mx-auto aspect-square max-h-[350px] w-full">
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent hideLabel formatter={currencyFormatter} />} />
                    <Pie
                      data={categoryChartData.data}
                      dataKey="value"
                      labelLine={false}
                      label={(entry) => `${entry.name}`}
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={40}
                      paddingAngle={2}
                    >
                      {categoryChartData.data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} stroke="transparent" />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>
              </div>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">Brak danych</div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/50">
          <CardHeader className="border-b border-border/50 pb-4">
            <CardTitle className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <BarChart3 className="h-4 w-4" />
              </div>
              <span className="text-lg">Porównanie kosztów</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {barChartData.data.length > 0 ? (
              <ChartContainer config={barChartData.config} className="max-h-[300px] w-full">
                <BarChart data={barChartData.data}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={10} style={{ fontSize: '12px' }} />
                  <YAxis tickLine={false} axisLine={false} tickMargin={10} style={{ fontSize: '12px' }} />
                  <ChartTooltip cursor={{ fill: 'rgba(var(--primary), 0.05)' }} content={<ChartTooltipContent hideLabel formatter={currencyFormatter} />} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40}>
                    {barChartData.data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} className="hover:opacity-80 transition-opacity" />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">Brak danych</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm overflow-hidden border-border/50">
        <CardHeader className="bg-muted/30 border-b border-border/50">
          <CardTitle className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <List className="h-4 w-4" />
            </div>
            <span className="text-lg">Szczegółowe zestawienie</span>
          </CardTitle>
        </CardHeader>
        <Table className="premium-table">
          <TableHeader>
            <TableRow>
              <TableHead>Kategoria</TableHead>
              <TableHead>Miesięcznie</TableHead>
              <TableHead>Rocznie</TableHead>
              <TableHead className="text-right">Elementy</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Kredyty</TableCell>
              <TableCell className="font-semibold">{formatCurrency(totals.loansMonthly, userCurrency)}</TableCell>
              <TableCell>{formatCurrency(totals.loansMonthly * 12, userCurrency)}</TableCell>
              <TableCell className="text-right">{activeLoansCount}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Finanse</TableCell>
              <TableCell className="font-semibold">{formatCurrency(totals.subscriptionsMonthly, userCurrency)}</TableCell>
              <TableCell>{formatCurrency(totals.subscriptionsYearly + totals.subscriptionsMonthly * 12, userCurrency)}</TableCell>
              <TableCell className="text-right">{subscriptions.length}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Ubezpieczenia</TableCell>
              <TableCell className="font-semibold">{formatCurrency(totals.insurancesMonthly, userCurrency)}</TableCell>
              <TableCell>{formatCurrency(totals.insurancesYearly + totals.insurancesMonthly * 12, userCurrency)}</TableCell>
              <TableCell className="text-right">{activeInsurancesCount}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">AI</TableCell>
              <TableCell className="font-semibold">{formatCurrency(totals.aiMonthly, userCurrency)}</TableCell>
              <TableCell>{formatCurrency(totals.aiYearly + totals.aiMonthly * 12, userCurrency)}</TableCell>
              <TableCell className="text-right">{activeAICount}</TableCell>
            </TableRow>
            <TableRow className="bg-primary/5 hover:bg-primary/10 transition-colors border-t-2">
              <TableCell className="font-bold text-primary italic underline-offset-4 decoration-primary/30 decoration-2">RAZEM</TableCell>
              <TableCell className="font-bold text-primary">{formatCurrency(totals.totalMonthly, userCurrency)}</TableCell>
              <TableCell className="font-bold text-primary">{formatCurrency(totals.totalYearly + totals.totalMonthly * 12, userCurrency)}</TableCell>
              <TableCell className="text-right font-bold text-primary">{loans.length + subscriptions.length + insurances.length + ai.length}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Card>
    </div>
  );
});
