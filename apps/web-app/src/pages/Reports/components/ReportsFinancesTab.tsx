import React, { useMemo } from 'react';
import { formatCurrency, Currency } from '@akademiasaas/shared';
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "~/components/ui/chart";
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Cell } from 'recharts';
import { ApiSubscription } from '~/types/api';

interface ReportsFinancesTabProps {
  subscriptions: ApiSubscription[];
  userCurrency: Currency;
  parseAmount: (amount: unknown) => number;
}

export const ReportsFinancesTab: React.FC<ReportsFinancesTabProps> = ({
  subscriptions,
  userCurrency,
  parseAmount,
}) => {
  const chartData = useMemo(() => {
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
    
    const data = subscriptions
      .filter((sub: ApiSubscription) => parseAmount(sub.amount || 0) > 0)
      .map((sub: ApiSubscription, index: number) => {
        const amount = parseAmount(sub.amount || 0);
        // Default to monthly - cycle is not in API response
        const monthlyAmount = amount;
        
        return {
          name: sub.name || `Subskrypcja ${index + 1}`,
          amount: monthlyAmount,
          fill: COLORS[index % COLORS.length],
          cycle: 'Miesięczny',
        };
      })
      .sort((a, b) => b.amount - a.amount);
    
    const config = data.reduce((acc, item) => {
      acc[item.name] = { label: item.name, color: item.fill };
      return acc;
    }, {} as Record<string, { label: string; color: string }>);
    
    return { data, config };
  }, [subscriptions, parseAmount]);

  if (subscriptions.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Analiza finansów (Subskrypcje)</h3>
        <p className="text-sm text-muted-foreground">Brak subskrypcji</p>
      </div>
    );
  }

  if (!chartData) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Analiza finansów (Subskrypcje)</h3>
        <p className="text-sm text-muted-foreground">Brak danych do wyświetlenia</p>
      </div>
    );
  }

  const tooltipFormatter = (v: unknown, _name: unknown, props?: { payload?: { cycle?: string } }) => {
    const value = typeof v === 'number' ? v : Number(v) || 0;
    return [formatCurrency(value, userCurrency), props?.payload?.cycle || ''];
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Analiza finansów (Subskrypcje)</h3>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Wszystkie subskrypcje</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartData.config} className="max-h-[400px] w-full">
            <BarChart data={chartData.data} layout="vertical">
              <CartesianGrid horizontal={false} />
              <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={150} style={{ fontSize: '12px' }} />
              <XAxis type="number" tickLine={false} axisLine={false} style={{ fontSize: '12px' }} />
              <ChartTooltip content={<ChartTooltipContent hideLabel formatter={tooltipFormatter} />} />
              <Bar dataKey="amount" radius={5}>
                {chartData.data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};

