import React, { useState, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { AppStore, formatCurrency, Currency } from '@akademiasaas/shared'
import { Button } from '~/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '~/components/ui/alert-dialog'
import { Badge } from '~/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Plus, Trash2, BarChart3 } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  LabelList,
} from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig
} from "~/components/ui/chart"

// Model zakończonego zobowiązania
interface FinishedItem {
  id: string
  type: 'subskrypcja' | 'ubezpieczenie' | 'kredyt'
  name: string
  amount: number
  endDate: string
  note?: string
}

// Przykładowe dane
const mockFinished: FinishedItem[] = [
  {
    id: '1',
    type: 'subskrypcja',
    name: 'Adobe CC',
    amount: 299.99,
    endDate: '2025-01-01',
    note: 'Faktura na firmę',
  },
  {
    id: '2',
    type: 'ubezpieczenie',
    name: 'Ubezpieczenie mieszkania',
    amount: 320.00,
    endDate: '2025-02-01',
    note: 'Allianz',
  },
  {
    id: '3',
    type: 'kredyt',
    name: 'Pożyczka gotówkowa',
    amount: 350.00,
    endDate: '2024-07-20',
    note: 'Alior Bank',
  },
]

const typeLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  subskrypcja: { label: 'Subskrypcja', variant: 'default' },
  ubezpieczenie: { label: 'Ubezpieczenie', variant: 'secondary' },
  kredyt: { label: 'Kredyt', variant: 'outline' },
}

const Finished = () => {
  const [data, setData] = useState<FinishedItem[]>(mockFinished)
  const userDetails = useSelector((store: AppStore) => store.user.details)
  const userCurrency = (userDetails?.defaultCurrency || 'pln') as Currency

  const handleDelete = (id: string) => {
    setData((prev) => prev.filter((item) => item.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Zakończone</h1>
        <Button disabled className="gap-2">
          <Plus className="h-4 w-4" />
          Dodaj zakończone
        </Button>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Typ</TableHead>
              <TableHead>Nazwa</TableHead>
              <TableHead>Kwota</TableHead>
              <TableHead>Data zakończenia</TableHead>
              <TableHead>Notatka</TableHead>
              <TableHead className="text-right">Akcje</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Brak danych
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Badge variant={typeLabels[item.type]?.variant || 'default'}>
                      {typeLabels[item.type]?.label || item.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{formatCurrency(item.amount, userCurrency)}</TableCell>
                  <TableCell>{item.endDate}</TableCell>
                  <TableCell className="text-muted-foreground">{item.note || '-'}</TableCell>
                  <TableCell className="text-right">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Czy na pewno chcesz usunąć?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Ten rekord zostanie trwale usunięty. Tej operacji nie można cofnąć.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Nie</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(item.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Tak, usuń
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Charts Section */}
      {data.length > 0 && (
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Analiza zakończonych zobowiązań
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Type distribution */}
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Rozkład typów</h3>
                {(() => {
                  const typeData = data.reduce((acc, item) => {
                    const type = typeLabels[item.type]?.label || item.type;
                    acc[type] = (acc[type] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>);

                  const chartData = Object.entries(typeData).map(([type, count]) => ({ type, count }));

                  const typeConfig = {
                    count: {
                      label: "Ilość",
                    },
                  } satisfies ChartConfig;

                  const COLORS = [
                    "hsl(var(--chart-1))",
                    "hsl(var(--chart-2))",
                    "hsl(var(--chart-3))",
                  ];

                  return (
                    <ChartContainer config={typeConfig} className="mx-auto aspect-square max-h-[300px]">
                      <PieChart>
                        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                        <Pie
                          data={chartData}
                          dataKey="count"
                          label
                          nameKey="type"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ChartContainer>
                  );
                })()}
              </div>

              {/* Amounts by type */}
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Kwoty według typu</h3>
                {(() => {
                  const COLORS = [
                    "hsl(var(--chart-1))",
                    "hsl(var(--chart-2))",
                    "hsl(var(--chart-3))",
                  ];

                  const amountData = data.reduce((acc, item) => {
                    const type = item.type;
                    const typeLabel = typeLabels[type]?.label || type;
                    if (!acc[type]) {
                      acc[type] = { type, typeLabel, total: 0, count: 0 };
                    }
                    acc[type].total += item.amount;
                    acc[type].count += 1;
                    return acc;
                  }, {} as Record<string, { type: string; typeLabel: string; total: number; count: number }>);

                  const chartData = Object.values(amountData).map((item, index) => ({
                    ...item,
                    fill: COLORS[index % COLORS.length],
                  }));

                  // Tworzymy config z kolorami dla każdego typu
                  const amountConfig = chartData.reduce((acc, item) => {
                    acc[item.type] = {
                      label: item.typeLabel,
                      color: item.fill,
                    };
                    return acc;
                  }, {} as Record<string, { label: string; color: string }>);

                  amountConfig.total = {
                    label: "Kwota",
                    color: "hsl(var(--chart-1))",
                  };

                  return (
                    <ChartContainer config={amountConfig} className="max-h-[300px] w-full">
                      <BarChart data={chartData}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                          dataKey="type"
                          tickLine={false}
                          axisLine={false}
                          tickMargin={8}
                          style={{ fontSize: '12px' }}
                          tickFormatter={(value) => chartData.find(d => d.type === value)?.typeLabel || value}
                        />
                        <YAxis tickLine={false} axisLine={false} style={{ fontSize: '12px' }} />
                        <ChartTooltip 
                          cursor={false} 
                          content={<ChartTooltipContent 
                            indicator="dot"
                            formatter={(value: number) => formatCurrency(value, userCurrency)}
                          />} 
                        />
                        <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                          <LabelList 
                            dataKey="total" 
                            position="top" 
                            className="fill-foreground font-bold" 
                            fontSize={12} 
                            formatter={(v: number) => formatCurrency(v, userCurrency)}
                          />
                        </Bar>
                      </BarChart>
                    </ChartContainer>
                  );
                })()}
              </div>
            </div>

            {/* Timeline of finished items */}
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Zakończenia w czasie</h3>
              {(() => {
                const timelineData = data.reduce((acc, item) => {
                  const month = item.endDate.substring(0, 7); // YYYY-MM
                  if (!acc[month]) {
                    acc[month] = { month, count: 0, total: 0 };
                  }
                  acc[month].count += 1;
                  acc[month].total += item.amount;
                  return acc;
                }, {} as Record<string, { month: string; count: number; total: number }>);

                const chartData = Object.values(timelineData)
                  .sort((a, b) => a.month.localeCompare(b.month))
                  .map(item => ({
                    month: new Date(item.month + '-01').toLocaleDateString('pl-PL', { month: 'short', year: 'numeric' }),
                    count: item.count,
                    total: item.total,
                  }));

                const timelineConfig = {
                  count: {
                    label: "Ilość",
                    color: "hsl(var(--chart-1))",
                  },
                  total: {
                    label: "Kwota",
                    color: "hsl(var(--chart-2))",
                  },
                } satisfies ChartConfig;

                return chartData.length > 0 ? (
                  <ChartContainer config={timelineConfig} className="max-h-[300px] w-full">
                    <BarChart data={chartData}>
                      <CartesianGrid vertical={false} />
                      <XAxis
                        dataKey="month"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        style={{ fontSize: '12px' }}
                        tickFormatter={(value) => value.slice(0, 3)}
                      />
                      <YAxis tickLine={false} axisLine={false} style={{ fontSize: '12px' }} />
                      <ChartTooltip 
                        cursor={false} 
                        content={<ChartTooltipContent 
                          hideLabel
                          formatter={(value: number, name: string) => {
                            if (name === 'total') {
                              return [formatCurrency(value, userCurrency), 'Kwota'];
                            }
                            return [value, 'Ilość'];
                          }}
                        />} 
                      />
                      <ChartLegend content={<ChartLegendContent />} />
                      <Bar
                        dataKey="count"
                        stackId="a"
                        fill="var(--color-count)"
                        radius={[0, 0, 4, 4]}
                      />
                      <Bar
                        dataKey="total"
                        stackId="a"
                        fill="var(--color-total)"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ChartContainer>
                ) : (
                  <p className="text-sm text-muted-foreground">Brak danych do wyświetlenia</p>
                );
              })()}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default Finished