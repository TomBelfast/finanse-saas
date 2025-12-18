import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "~/components/ui/chart";
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Cell } from 'recharts';
import { ActiveLoansData } from '../types/reportsTypes';

interface ReportsLoansTabProps {
  activeLoansData: ActiveLoansData;
  currencyFormatter: (v: unknown) => string;
}

export const ReportsLoansTab: React.FC<ReportsLoansTabProps> = ({
  activeLoansData,
  currencyFormatter,
}) => {
  if (activeLoansData.activeLoans.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Analiza kredytów</h3>
        <p className="text-sm text-muted-foreground">Brak aktywnych kredytów</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Analiza kredytów</h3>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pozostałe kwoty do spłaty</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={activeLoansData.config} className="max-h-[300px] w-full">
              <BarChart data={activeLoansData.chartData} layout="vertical">
                <CartesianGrid horizontal={false} />
                <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={150} style={{ fontSize: '12px' }} />
                <XAxis type="number" tickLine={false} axisLine={false} style={{ fontSize: '12px' }} />
                <ChartTooltip content={<ChartTooltipContent hideLabel formatter={currencyFormatter} />} />
                <Bar dataKey="remaining" radius={5}>
                  {activeLoansData.chartData.map((entry, index) => (
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
            <ChartContainer config={activeLoansData.config} className="max-h-[300px] w-full">
              <BarChart data={activeLoansData.chartData} layout="vertical">
                <CartesianGrid horizontal={false} />
                <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={150} style={{ fontSize: '12px' }} />
                <XAxis type="number" tickLine={false} axisLine={false} style={{ fontSize: '12px' }} />
                <ChartTooltip content={<ChartTooltipContent hideLabel formatter={currencyFormatter} />} />
                <Bar dataKey="monthly" radius={5}>
                  {activeLoansData.chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

