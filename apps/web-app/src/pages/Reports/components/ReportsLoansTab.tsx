import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "~/components/ui/chart";
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Cell } from 'recharts';
import { Wallet, Briefcase } from 'lucide-react';
import { ActiveLoansData } from '../types/reportsTypes';

interface ReportsLoansTabProps {
  activeLoansData: ActiveLoansData;
  currencyFormatter: (v: unknown) => string;
}

export const ReportsLoansTab: React.FC<ReportsLoansTabProps> = memo(({
  activeLoansData,
  currencyFormatter,
}) => {
  if (activeLoansData.activeLoans.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
          <Briefcase className="h-6 w-6 text-muted-foreground" />
        </div>
        <div>
          <h3 className="text-lg font-medium text-foreground">Brak aktywnych kredytów</h3>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">Dodaj pierwszy kredyt w sekcji Kredyty, aby zobaczyć tutaj analizę.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-4">
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm border-border/50">
          <CardHeader className="border-b border-border/50 pb-4">
            <CardTitle className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Wallet className="h-4 w-4" />
              </div>
              <span className="text-lg">Pozostało do spłaty</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ChartContainer config={activeLoansData.config} className="max-h-[300px] w-full">
              <BarChart data={activeLoansData.chartData} layout="vertical" margin={{ left: -20, right: 20 }}>
                <CartesianGrid horizontal={false} strokeDasharray="3 3" opacity={0.3} />
                <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={120} style={{ fontSize: '11px' }} />
                <XAxis type="number" tickLine={false} axisLine={false} style={{ fontSize: '11px' }} />
                <ChartTooltip content={<ChartTooltipContent hideLabel formatter={currencyFormatter} />} />
                <Bar dataKey="remaining" radius={[0, 4, 4, 0]} barSize={24}>
                  {activeLoansData.chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} className="hover:opacity-80 transition-opacity" />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/50">
          <CardHeader className="border-b border-border/50 pb-4">
            <CardTitle className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Briefcase className="h-4 w-4" />
              </div>
              <span className="text-lg">Miesięczne raty</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ChartContainer config={activeLoansData.config} className="max-h-[300px] w-full">
              <BarChart data={activeLoansData.chartData} layout="vertical" margin={{ left: -20, right: 20 }}>
                <CartesianGrid horizontal={false} strokeDasharray="3 3" opacity={0.3} />
                <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={120} style={{ fontSize: '11px' }} />
                <XAxis type="number" tickLine={false} axisLine={false} style={{ fontSize: '11px' }} />
                <ChartTooltip content={<ChartTooltipContent hideLabel formatter={currencyFormatter} />} />
                <Bar dataKey="monthly" radius={[0, 4, 4, 0]} barSize={24}>
                  {activeLoansData.chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} className="hover:opacity-80 transition-opacity" />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
});
