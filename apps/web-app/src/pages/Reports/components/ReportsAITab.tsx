import React, { memo, useMemo } from 'react';
import { formatCurrency, Currency } from '@akademiasaas/shared';
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "~/components/ui/chart";
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Cell } from 'recharts';
import { Cpu, Sparkles } from 'lucide-react';
import { ApiAI } from '~/types/api';

interface ReportsAITabProps {
  ai: ApiAI[];
  userCurrency: Currency;
  parseAmount: (amount: unknown) => number;
}

export const ReportsAITab: React.FC<ReportsAITabProps> = memo(({
  ai,
  userCurrency,
  parseAmount,
}) => {
  const chartData = useMemo(() => {
    const activeAI = ai.filter((aiItem: ApiAI) =>
      aiItem.status === 'active' || aiItem.status === 'pending'
    );

    if (activeAI.length === 0) {
      return null;
    }

    // Using global chart palette
    const COLORS = [
      "var(--chart-1)",
      "var(--chart-2)",
      "var(--chart-3)",
      "var(--chart-4)",
      "var(--chart-5)",
      "var(--chart-6)",
      "var(--chart-7)",
    ];

    const data = activeAI
      .filter((aiItem: ApiAI) => parseAmount(aiItem.amount || 0) > 0)
      .map((aiItem: ApiAI, index: number) => {
        const amount = parseAmount(aiItem.amount || 0);
        let renewalCycle: string | undefined;
        if (aiItem.description) {
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
          fill: `hsl(${COLORS[index % COLORS.length]})`,
          paymentStatus: 'Do zapłaty',
        };
      })
      .sort((a, b) => b.amount - a.amount);

    const config = data.reduce((acc, item) => {
      acc[item.name] = { label: item.name, color: item.fill };
      return acc;
    }, {} as Record<string, { label: string; color: string }>);

    return { data, config };
  }, [ai, parseAmount]);

  if (ai.filter((aiItem: ApiAI) => aiItem.status === 'active' || aiItem.status === 'pending').length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
          <Cpu className="h-6 w-6 text-muted-foreground" />
        </div>
        <div>
          <h3 className="text-lg font-medium text-foreground">Brak aktywnych usług AI</h3>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">Dodaj pierwszą usługę AI w sekcji AI, aby zobaczyć analizę.</p>
        </div>
      </div>
    );
  }

  if (!chartData) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
          <Cpu className="h-6 w-6 text-muted-foreground" />
        </div>
        <div>
          <h3 className="text-lg font-medium text-foreground">Brak danych dla AI</h3>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">Uzrełnij kwoty swoich subskrypcji AI, aby zobaczyć analizę kosztów.</p>
        </div>
      </div>
    );
  }

  const tooltipFormatter = (v: unknown, _name: unknown, props?: { payload?: { paymentStatus?: string } }) => {
    const value = typeof v === 'number' ? v : Number(v) || 0;
    return [formatCurrency(value, userCurrency), props?.payload?.paymentStatus || ''];
  };

  return (
    <div className="space-y-6 pt-4">
      <Card className="shadow-sm border-border/50">
        <CardHeader className="border-b border-border/50 pb-4">
          <CardTitle className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-lg">Analiza usług AI</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <ChartContainer config={chartData.config} className="max-h-[500px] w-full">
            <BarChart data={chartData.data} layout="vertical" margin={{ left: -20, right: 20 }}>
              <CartesianGrid horizontal={false} strokeDasharray="3 3" opacity={0.3} />
              <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={120} style={{ fontSize: '11px' }} />
              <XAxis type="number" tickLine={false} axisLine={false} style={{ fontSize: '11px' }} />
              <ChartTooltip content={<ChartTooltipContent hideLabel formatter={tooltipFormatter} />} />
              <Bar dataKey="amount" radius={[0, 4, 4, 0]} barSize={24}>
                {chartData.data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} className="hover:opacity-80 transition-opacity" />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
});
