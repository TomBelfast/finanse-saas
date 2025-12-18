import React, { useMemo } from 'react';
import { formatCurrency, Currency } from '@akademiasaas/shared';
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "~/components/ui/chart";
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Cell } from 'recharts';
import { ApiInsurance } from '~/types/api';

interface ReportsInsurancesTabProps {
  insurances: ApiInsurance[];
  userCurrency: Currency;
  parseAmount: (amount: unknown) => number;
}

export const ReportsInsurancesTab: React.FC<ReportsInsurancesTabProps> = ({
  insurances,
  userCurrency,
  parseAmount,
}) => {
  const chartData = useMemo(() => {
    const activeInsurances = insurances.filter((ins: ApiInsurance) => 
      ins.status === 'active' || ins.status === 'pending'
    );
    
    if (activeInsurances.length === 0) {
      return null;
    }
    
    const COLORS = [
      "hsl(var(--chart-1))",
      "hsl(var(--chart-2))",
      "hsl(var(--chart-3))",
      "hsl(var(--chart-4))",
      "hsl(var(--chart-5))",
    ];
    
    const data = activeInsurances
      .filter((ins: ApiInsurance) => parseAmount(ins.amount || 0) > 0)
      .map((ins: ApiInsurance, index: number) => {
        const amount = parseAmount(ins.amount || 0);
        let renewalCycle: string | undefined;
        if (ins.description) {
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
          paymentStatus: 'Do zapłaty', // ApiInsurance doesn't have paymentStatus
        };
      })
      .sort((a, b) => b.amount - a.amount);
    
    const config = data.reduce((acc, item) => {
      acc[item.name] = { label: item.name, color: item.fill };
      return acc;
    }, {} as Record<string, { label: string; color: string }>);
    
    return { data, config };
  }, [insurances, parseAmount]);

  if (insurances.filter((ins: ApiInsurance) => ins.status === 'active' || ins.status === 'pending').length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Analiza ubezpieczeń</h3>
        <p className="text-sm text-muted-foreground">Brak aktywnych ubezpieczeń</p>
      </div>
    );
  }

  if (!chartData) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Analiza ubezpieczeń</h3>
        <p className="text-sm text-muted-foreground">Brak danych do wyświetlenia</p>
      </div>
    );
  }

  const tooltipFormatter = (v: unknown, _name: unknown, props?: { payload?: { paymentStatus?: string } }) => {
    const value = typeof v === 'number' ? v : Number(v) || 0;
    return [formatCurrency(value, userCurrency), props?.payload?.paymentStatus || ''];
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Analiza ubezpieczeń</h3>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Wszystkie ubezpieczenia</CardTitle>
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

