import React, { memo } from 'react';
import { formatCurrency, Currency } from '@akademiasaas/shared';
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "~/components/ui/chart";
import { PieChart, Pie, Cell, BarChart, Bar, CartesianGrid, XAxis, YAxis } from 'recharts';
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
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Podsumowanie wszystkich sekcji</h3>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Rozkład kosztów miesięcznych</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryChartData.data.length > 0 ? (
              <div className="w-full overflow-visible p-4">
                <ChartContainer config={categoryChartData.config} className="mx-auto aspect-square max-h-[400px] w-full [&_.recharts-pie-label-text]:fill-foreground [&_.recharts-pie-label-line]:stroke-foreground">
                  <PieChart margin={{ top: 60, right: 120, bottom: 60, left: 120 }}>
                    <ChartTooltip content={<ChartTooltipContent hideLabel formatter={currencyFormatter} />} />
                    <Pie 
                      data={categoryChartData.data} 
                      dataKey="value" 
                      label={(entry: { cx: number; cy: number; midAngle: number; innerRadius: number; outerRadius: number; name: string }) => {
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
                        {categoryChartData.data.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ChartContainer>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Brak danych</p>
              )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Porównanie kosztów miesięcznych</CardTitle>
          </CardHeader>
          <CardContent>
            {barChartData.data.length > 0 ? (
              <ChartContainer config={barChartData.config} className="max-h-[300px] w-full">
                <BarChart data={barChartData.data}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} style={{ fontSize: '12px' }} />
                  <YAxis tickLine={false} axisLine={false} style={{ fontSize: '12px' }} />
                  <ChartTooltip content={<ChartTooltipContent hideLabel formatter={currencyFormatter} />} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {barChartData.data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            ) : (
              <p className="text-sm text-muted-foreground">Brak danych</p>
            )}
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
              <TableCell>{activeLoansCount}</TableCell>
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
              <TableCell>{activeInsurancesCount}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">AI</TableCell>
              <TableCell>{formatCurrency(totals.aiMonthly, userCurrency)}</TableCell>
              <TableCell>{formatCurrency(totals.aiYearly + totals.aiMonthly * 12, userCurrency)}</TableCell>
              <TableCell>{activeAICount}</TableCell>
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
  );
});

