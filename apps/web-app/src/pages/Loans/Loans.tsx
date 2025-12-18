import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { logger } from '~/utils/logger';
import {
  Plus,
  Edit,
  Trash2,
  Paperclip,
  DollarSign,
  Calendar,
  Trophy,
  Banknote, // or Landmark for Bank
  Percent,
  Search,
  Filter,
  BarChart3,
  LineChart as LineChartIcon,
} from 'lucide-react';
import {
  BarChart,
  LineChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ComposedChart,
  PieChart,
  Pie,
  Cell,
  LabelList,
} from 'recharts';
import { AppStore, formatCurrency, Currency } from '@akademiasaas/shared';
import { apiClient } from '../../services/apiClient';
import { ApiLoan } from '~/types/api';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig
} from "~/components/ui/chart";

// UI Components
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Textarea } from '~/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import UploadField from '../../components/UploadField/UploadField';

interface Attachment {
  name: string;
  url: string;
  type: string;
}
interface Loan {
  id: string;
  name: string;
  amount: number;
  nextPayment: string;
  status: string;
  installments: number;
  installmentAmount: number;
  startDate: string;
  endDate: string;
  note?: string;
  attachments?: Attachment[];
}

const Loans = () => {
  const [data, setData] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  // Filters
  const [filterName, setFilterName] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Form
  const [formData, setFormData] = useState<Partial<Loan>>({
    name: '',
    amount: 0,
    installments: 0,
    installmentAmount: 0,
    startDate: '',
    endDate: '',
    nextPayment: '',
    status: 'aktywna',
    note: '',
  });

  const userDetails = useSelector((store: AppStore) => store.user.details);
  const userCurrency = (userDetails?.defaultCurrency || 'pln') as Currency;

  // Helper function to parse amount - memoized to avoid recreation
  const parseAmount = useCallback((amount: unknown): number => {
    if (typeof amount === 'number') return amount;
    if (typeof amount === 'string') {
      // Remove currency symbols and spaces, replace comma with dot
      const cleaned = amount.replace(/[^\d.,-]/g, '').replace(',', '.');
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  }, [])

  const loadData = async () => {
    setLoading(true);
    try {
      const loans = await apiClient.getLoans();
      const mapped = (loans as ApiLoan[]).map(row => {
        let attachments = [];
        try {
          attachments = typeof row.documents === 'string' ? JSON.parse(row.documents) : (row.documents ? (Array.isArray(row.documents) ? row.documents : []) : []);
        } catch (e) { 
          logger.error('Error parsing attachments', e instanceof Error ? e : new Error(String(e)));
        }

        // Mapowanie statusów z angielskiego (API) na polski (UI)
        const statusMap: Record<string, string> = {
          'active': 'aktywna',
          'paid': 'spłacona',
          'delayed': 'opóźniona',
          'defaulted': 'niespłacona',
          'refinanced': 'refinansowana'
        };
        const mappedStatus = statusMap[row.status] || row.status;

        return {
          id: row.id,
          name: row.name,
          amount: row.total_amount ? parseAmount(row.total_amount) : 0,
          remainingAmount: row.remaining_amount ? parseAmount(row.remaining_amount) : undefined,
          nextPayment: typeof row.next_payment_date === 'string' ? row.next_payment_date : (row.next_payment_date instanceof Date ? row.next_payment_date.toISOString() : ''),
          status: mappedStatus,
          installments: row.duration_in_months,
          installmentAmount: row.next_payment_amount ? parseAmount(row.next_payment_amount) : 0,
          startDate: typeof row.start_date === 'string' ? row.start_date : (row.start_date instanceof Date ? row.start_date.toISOString() : ''),
          endDate: typeof row.end_date === 'string' ? row.end_date : (row.end_date instanceof Date ? row.end_date.toISOString() : ''),
          note: row.description || undefined,
          attachments: attachments,
        } as Loan;
      });
      setData(mapped);
    } catch (error: unknown) {
      logger.error('Błąd podczas ładowania kredytów', error instanceof Error ? error : new Error(String(error)));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Memoized filtered data
  const filteredData = useMemo(() => {
    return data.filter(loan => {
      return (
        (!filterName || loan.name?.toLowerCase().includes(filterName.toLowerCase())) &&
        (filterStatus === 'all' || !filterStatus || loan.status === filterStatus)
      );
    });
  }, [data, filterName, filterStatus]);

  const getInstallmentsInfo = (loan: Loan) => {
    const today = new Date();
    const start = new Date(loan.startDate);
    const total = Number(loan.installments) || 0;
    const installmentAmount = Number(loan.installmentAmount);

    if (isNaN(start.getTime()) || !total || isNaN(installmentAmount)) {
      const leftAmount = typeof loan.remainingAmount === 'number' ? loan.remainingAmount : undefined;
      return {
        paid: undefined,
        left: undefined,
        leftAmount,
        valid: false,
        fallback: true,
        originalInstallments: loan.installments,
        originalAmount: loan.amount,
      };
    }
    const monthsPassed = today.getFullYear() * 12 + today.getMonth() - (start.getFullYear() * 12 + start.getMonth());
    const paid = Math.max(0, Math.min(total, monthsPassed + 1));
    const left = Math.max(0, total - paid);
    const leftAmount = left * installmentAmount;
    return { paid, left, leftAmount, valid: true, fallback: false, originalInstallments: loan.installments, originalAmount: loan.amount };
  };

  const summary = useMemo(() => {
    // Używamy wszystkich danych (data) dla summary, aby pokazywać całkowite wartości
    const allLoans = data || [];
    
    const activeLoans = allLoans.filter(loan => loan.status === 'aktywna');
    const completedLoans = allLoans.filter(loan => loan.status === 'spłacona');

    let totalOriginalAmount = 0;
    let totalRemainingAmount = 0;
    let totalPaidAmount = 0;
    let totalMonthlyPayment = 0;
    let nextPaymentsSoon = 0;

    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    activeLoans.forEach(loan => {
      const originalAmount = parseAmount(loan.amount);
      const installmentAmount = parseAmount(loan.installmentAmount);
      const remainingAmount = typeof loan.remainingAmount === 'number' ? loan.remainingAmount : parseAmount(loan.remainingAmount);

      totalOriginalAmount += originalAmount;
      totalMonthlyPayment += installmentAmount;

      if (loan.nextPayment) {
        const nextPayment = new Date(loan.nextPayment);
        if (nextPayment <= nextWeek && nextPayment >= today) {
          nextPaymentsSoon++;
        }
      }

      // Używamy remainingAmount z API jeśli dostępne, w przeciwnym razie obliczamy
      if (typeof remainingAmount === 'number' && !isNaN(remainingAmount) && remainingAmount >= 0) {
        totalRemainingAmount += remainingAmount;
        totalPaidAmount += originalAmount - remainingAmount;
      } else {
        // Fallback: obliczamy na podstawie rat
        const { leftAmount, paid, valid, fallback } = getInstallmentsInfo(loan);

        if (valid && typeof leftAmount === 'number') {
          totalRemainingAmount += leftAmount;
          if (typeof paid === 'number') {
            totalPaidAmount += paid * installmentAmount;
          }
        } else if (fallback && typeof leftAmount === 'number') {
          totalRemainingAmount += leftAmount;
          totalPaidAmount += originalAmount - leftAmount;
        } else {
          totalRemainingAmount += originalAmount;
        }
      }
    });

    completedLoans.forEach(loan => {
      const originalAmount = parseAmount(loan.amount);
      totalPaidAmount += originalAmount;
      // Dla spłaconych kredytów, cała kwota jest już zapłacona
      // totalRemainingAmount pozostaje bez zmian
    });

    // Obliczamy postęp: ile zapłacono / (zapłacono + pozostało) * 100
    const totalProgress = (totalPaidAmount + totalRemainingAmount) > 0 
      ? (totalPaidAmount / (totalPaidAmount + totalRemainingAmount)) * 100 
      : 0;

    return {
      activeCount: activeLoans.length,
      completedCount: completedLoans.length,
      totalOriginalAmount,
      totalRemainingAmount,
      totalPaidAmount,
      totalMonthlyPayment,
      nextPaymentsSoon,
      totalProgress: Math.round(totalProgress * 100) / 100
    };
  }, [data, parseAmount]);

  const handleOpenAddModal = () => {
    setEditMode(false);
    setEditingLoan(null);
    setFormData({
      name: '',
      amount: 0,
      installments: 0,
      installmentAmount: 0,
      startDate: '',
      endDate: '',
      nextPayment: '',
      status: 'aktywna',
      note: '',
    });
    setAttachments([]);
    setModalOpen(true);
  };

  const handleOpenEditModal = (loan: Loan) => {
    setEditMode(true);
    setEditingLoan(loan);
    setFormData({ ...loan });
    setAttachments(loan.attachments || []);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Na pewno usunąć?')) return;
    try {
      await apiClient.deleteLoan(id);
      loadData();
    } catch (error) {
      logger.error('Błąd podczas usuwania', error instanceof Error ? error : new Error(String(error)), { loanId: id });
    }
  };

  const handleSubmit = async () => {
    try {
      const safeAttachments = Array.isArray(attachments)
        ? attachments.map(a => ({ name: a?.name || '', url: a?.url || '', type: a?.type || '' }))
        : [];

      const payload = {
        name: formData.name,
        total_amount: formData.amount,
        duration_in_months: formData.installments,
        next_payment_amount: formData.installmentAmount,
        start_date: formData.startDate,
        end_date: formData.endDate,
        next_payment_date: formData.nextPayment,
        status: formData.status,
        description: formData.note,
        documents: safeAttachments
      };

      if (editMode && editingLoan) {
        await apiClient.updateLoan(editingLoan.id, payload);
      } else {
        await apiClient.createLoan(payload);
      }

      setModalOpen(false);
      loadData();
    } catch (e: unknown) {
      logger.error('Błąd zapisu kredytu', e instanceof Error ? e : new Error(String(e)));
      alert('Błąd zapisu');
    }
  };

  const renderInstallmentInfo = (loan: Loan) => {
    const { paid, valid, fallback, originalInstallments } = getInstallmentsInfo(loan);
    if (valid) return `${paid} z ${loan.installments}`;
    if (fallback) return originalInstallments ? `– z ${originalInstallments}` : '–';
    return '–';
  };

  const renderRemainingAmount = (loan: Loan) => {
    const { leftAmount, valid, fallback, originalAmount } = getInstallmentsInfo(loan);
    if (valid) return formatCurrency(leftAmount ?? 0, userCurrency);
    if (fallback && typeof leftAmount === 'number') return formatCurrency(leftAmount, userCurrency);
    if (fallback && typeof originalAmount === 'number') return formatCurrency(originalAmount, userCurrency);
    return '–';
  };

  // Chart data preparation
  const chartData = useMemo(() => {
    // Jeśli nie ma startDate, grupujemy po nazwie lub używamy "Inne"
    const loansByMonth = filteredData.reduce((acc, loan) => {
      let monthKey: string;
      if (loan.startDate) {
        monthKey = loan.startDate.substring(0, 7); // YYYY-MM
      } else {
        // Jeśli brak daty, używamy nazwy kredytu jako klucza
        monthKey = loan.name || 'Inne';
      }
      
      if (!acc[monthKey]) {
        acc[monthKey] = { month: monthKey, totalAmount: 0, count: 0, paidAmount: 0 };
      }
      acc[monthKey].totalAmount += loan.amount || 0;
      acc[monthKey].count += 1;
      const { paid, valid } = getInstallmentsInfo(loan);
      if (valid && typeof paid === 'number' && loan.installmentAmount) {
        acc[monthKey].paidAmount += paid * loan.installmentAmount;
      }
      return acc;
    }, {} as Record<string, { month: string; totalAmount: number; count: number; paidAmount: number }>);

    return Object.values(loansByMonth)
      .sort((a, b) => {
        // Sortuj daty jako daty, nazwy alfabetycznie
        if (a.month.match(/^\d{4}-\d{2}$/)) {
          return a.month.localeCompare(b.month);
        }
        return a.month.localeCompare(b.month);
      })
      .map(item => {
        // Jeśli to data, formatuj jako datę, w przeciwnym razie użyj nazwy
        const monthLabel = item.month.match(/^\d{4}-\d{2}$/) 
          ? new Date(item.month + '-01').toLocaleDateString('pl-PL', { month: 'short', year: 'numeric' })
          : item.month;
        return {
          month: monthLabel,
          totalAmount: item.totalAmount,
          count: item.count,
          paidAmount: item.paidAmount,
          remainingAmount: item.totalAmount - item.paidAmount,
        };
      });
  }, [filteredData]);

  const COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ];

  const statusDistribution = useMemo(() => {
    // Używamy wszystkich danych (data), nie tylko przefiltrowanych, aby pokazać wszystkie kredyty
    const allLoans = data || [];
    const statuses = allLoans.reduce((acc, loan) => {
      acc[loan.status] = (acc[loan.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(statuses).map(([status, count], index) => ({ 
      status, 
      count,
      fill: COLORS[index % COLORS.length],
    }));
  }, [data]);

  const loansConfig = {
    totalAmount: {
      label: "Kwota całkowita",
      color: "hsl(var(--chart-1))",
    },
    paidAmount: {
      label: "Spłacono",
      color: "hsl(var(--chart-2))",
    },
    remainingAmount: {
      label: "Pozostało",
      color: "hsl(var(--chart-3))",
    },
  } satisfies ChartConfig;

  const statusConfig = {
    count: {
      label: "Ilość",
    },
  } satisfies ChartConfig;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Kredyty i Pożyczki</h1>
        <Button onClick={handleOpenAddModal} className="gap-2">
          <Plus className="h-4 w-4" /> Dodaj kredyt
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktywne pożyczki</CardTitle>
            <Banknote className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.activeCount}</div>
            <p className="text-xs text-gray-500">Aktualne zobowiązania</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Spłacone</CardTitle>
            <Trophy className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{summary.completedCount}</div>
            <p className="text-xs text-gray-500">Zakończone sukcesem</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Postęp spłat</CardTitle>
            <Percent className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{summary.totalProgress}%</div>
            <p className="text-xs text-gray-500">Całkowitego zadłużenia</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Miesięczne raty</CardTitle>
            <Calendar className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{formatCurrency(summary.totalMonthlyPayment, userCurrency)}</div>
            <p className="text-xs text-gray-500">Obciążenie budżetu</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-end bg-card p-4 rounded-lg border shadow-sm">
        <div className="grid gap-2 w-full sm:w-auto">
          <Label>Szukaj nazwy</Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="np. Kredyt Hipoteczny"
              className="pl-9 w-full sm:w-[300px]"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
            />
          </div>
        </div>
        <div className="grid gap-2 w-full sm:w-auto">
          <Label>Status</Label>
          <Select
            value={filterStatus}
            onValueChange={setFilterStatus}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Wybierz status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Wszystkie</SelectItem>
              <SelectItem value="aktywna">Aktywna</SelectItem>
              <SelectItem value="spłacona">Spłacona</SelectItem>
              <SelectItem value="zawieszona">Zawieszona</SelectItem>
              <SelectItem value="anulowana">Anulowana</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="left" className="w-full">
        <TabsList>
          <TabsTrigger value="left">Pozostało do zapłaty rat</TabsTrigger>
          <TabsTrigger value="summary">Podsumowanie spłat</TabsTrigger>
        </TabsList>
        <TabsContent value="left" className="mt-4 border rounded-md bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nazwa</TableHead>
                <TableHead>Kwota</TableHead>
                <TableHead>Ilość rat</TableHead>
                <TableHead>Raty (spłacone/wszystkie)</TableHead>
                <TableHead>Kwota raty</TableHead>
                <TableHead>Do spłaty</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Start</TableHead>
                <TableHead>Koniec</TableHead>
                <TableHead>Następna</TableHead>
                <TableHead className="text-right">Akcje</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="h-24 text-center">Brak danych</TableCell>
                </TableRow>
              ) : (
                filteredData.map((loan) => (
                  <TableRow key={loan.id}>
                    <TableCell className="font-medium">{loan.name}</TableCell>
                    <TableCell>{formatCurrency(loan.amount || 0, userCurrency)}</TableCell>
                    <TableCell>{loan.installments}</TableCell>
                    <TableCell>{renderInstallmentInfo(loan)}</TableCell>
                    <TableCell>{formatCurrency(parseAmount(loan.installmentAmount), userCurrency)}</TableCell>
                    <TableCell className="font-bold">{renderRemainingAmount(loan)}</TableCell>
                    <TableCell>
                      <Badge variant={loan.status === 'aktywna' ? 'default' : loan.status === 'spłacona' ? 'success' : 'secondary'}>
                        {loan.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{loan.startDate ? loan.startDate.substring(0, 10) : '-'}</TableCell>
                    <TableCell>{loan.endDate ? loan.endDate.substring(0, 10) : '-'}</TableCell>
                    <TableCell>{loan.nextPayment ? loan.nextPayment.substring(0, 10) : '-'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenEditModal(loan)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80" onClick={() => handleDelete(loan.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TabsContent>
        <TabsContent value="summary" className="mt-4 border rounded-md bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nazwa</TableHead>
                <TableHead>Ilość rat spłaconych</TableHead>
                <TableHead>Kwota spłacona</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">Brak danych</TableCell>
                </TableRow>
              ) : (
                filteredData.map((loan) => {
                  const { paid, valid } = getInstallmentsInfo(loan);
                  const paidAmount = (valid && typeof paid === 'number' && !isNaN(Number(loan.installmentAmount)))
                    ? paid * Number(loan.installmentAmount)
                    : null;

                  return (
                    <TableRow key={loan.id}>
                      <TableCell className="font-medium">{loan.name}</TableCell>
                      <TableCell>{valid && typeof paid === 'number' ? paid : '–'}</TableCell>
                      <TableCell>{paidAmount !== null ? formatCurrency(paidAmount, userCurrency) : '–'}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>

      {/* Charts Section */}
      {filteredData.length > 0 && (
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Analiza kredytów i pożyczek
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Loans over time */}
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Kwoty kredytów w czasie</h3>
                {chartData.length > 0 ? (
                  <ChartContainer config={loansConfig} className="max-h-[300px] w-full">
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
                            if (name === 'paidAmount' || name === 'remainingAmount') {
                              return [formatCurrency(value, userCurrency), loansConfig[name as keyof typeof loansConfig]?.label || name];
                            }
                            return [formatCurrency(value, userCurrency), name];
                          }}
                        />} 
                      />
                      <ChartLegend content={<ChartLegendContent />} />
                      <Bar
                        dataKey="paidAmount"
                        stackId="a"
                        fill="var(--color-paidAmount)"
                        radius={[0, 0, 4, 4]}
                      />
                      <Bar
                        dataKey="remainingAmount"
                        stackId="a"
                        fill="var(--color-remainingAmount)"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ChartContainer>
                ) : (
                  <p className="text-sm text-muted-foreground">Brak danych do wyświetlenia</p>
                )}
              </div>

              {/* Loans by installment amount */}
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Kredyty według wysokości raty</h3>
                {(() => {
                  // Grupujemy kredyty według DOKŁADNEJ wysokości raty (nie zakresów!)
                  const allLoans = data || [];
                  
                  // Grupujemy według dokładnej kwoty raty
                  const loansByAmount = allLoans.reduce((acc, loan) => {
                    const installmentAmount = parseAmount(loan.installmentAmount);
                    const amountKey = installmentAmount.toFixed(2); // Używamy dokładnej kwoty jako klucza
                    
                    if (!acc[amountKey]) {
                      acc[amountKey] = { 
                        amount: installmentAmount,
                        amountLabel: formatCurrency(installmentAmount, userCurrency),
                        total: 0, 
                        count: 0,
                        loanNames: [] // Zbieramy nazwy kredytów
                      };
                    }
                    
                    // Sumujemy kwoty rat (każda rata dodaje swoją kwotę)
                    acc[amountKey].total += installmentAmount;
                    acc[amountKey].count += 1;
                    // Dodajemy nazwę kredytu
                    if (loan.name) {
                      acc[amountKey].loanNames.push(loan.name);
                    }
                    
                    return acc;
                  }, {} as Record<string, { amount: number; amountLabel: string; total: number; count: number; loanNames: string[] }>);

                  // Obliczamy całkowitą sumę wszystkich kwot rat
                  const totalInstallmentAmount = allLoans.reduce((sum, loan) => {
                    return sum + parseAmount(loan.installmentAmount);
                  }, 0);
                  
                  const chartData = Object.values(loansByAmount)
                    .map((item, index) => {
                      // Obliczamy procent: (suma kwot rat dla tej wysokości / całkowita suma) * 100
                      const percentage = totalInstallmentAmount > 0 
                        ? Math.round((item.total / totalInstallmentAmount) * 100 * 100) / 100 // Zaokrąglamy do 2 miejsc po przecinku
                        : 0;
                      return {
                        ...item,
                        fill: COLORS[index % COLORS.length],
                        percentage,
                        value: percentage, // Procent kwoty rat jako wartość wykresu
                      };
                    })
                    .filter(item => item.total > 0) // Pokazujemy tylko kwoty > 0
                    .sort((a, b) => b.amount - a.amount) // Sortuj od najwyższej do najniższej
                    .slice(0, 10); // Pokazujemy tylko top 10, żeby wykres nie był przeładowany

                  // Tworzymy config z kolorami dla każdej kwoty
                  const amountChartConfig = chartData.reduce((acc, item) => {
                    acc[item.amountLabel] = {
                      label: item.amountLabel,
                      color: item.fill,
                    };
                    return acc;
                  }, {} as Record<string, { label: string; color: string }>);

                  amountChartConfig.value = {
                    label: "Procent",
                    color: "hsl(var(--chart-1))",
                  };

                  return chartData.length > 0 ? (
                    <ChartContainer config={amountChartConfig} className="mx-auto aspect-square max-h-[300px]">
                      <PieChart>
                        <ChartTooltip 
                          content={<ChartTooltipContent 
                            hideLabel={false}
                            formatter={(value: unknown) => {
                              const numValue = typeof value === 'number' ? value : Number(value) || 0;
                              return formatCurrency(numValue, userCurrency);
                            }}
                            // @ts-expect-error - recharts formatter signature mismatch
                            formatter={(value: number, name: string, item: unknown, index: number, payload: { amountLabel?: string }) => {
                              // payload to cały obiekt danych z chartData
                              const amountLabel = payload?.amountLabel || item?.payload?.amountLabel || '';
                              // Zwracamy kwotę raty jako wartość, nie procent
                              // Format: [wartość_do_wyświetlenia, etykieta]
                              return [amountLabel, ''];
                            }}
                            labelFormatter={(label, payload) => {
                              // Label to nazwy kredytów
                              const loanNames = payload?.[0]?.payload?.loanNames || [];
                              return loanNames.length > 0 ? loanNames.join(', ') : '';
                            }}
                          />} 
                        />
                        <Pie
                          data={chartData}
                          dataKey="value"
                          label={(entry: { amountLabel?: string; percentage?: number }) => {
                            const amountLabel = String(entry.amountLabel || '').trim();
                            const percentage = entry.percentage || 0;
                            if (!amountLabel || amountLabel.length === 0) {
                              return `${percentage}%`;
                            }
                            return `${amountLabel}: ${percentage}%`;
                          }}
                          nameKey="amountLabel"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ChartContainer>
                  ) : (
                    <p className="text-sm text-muted-foreground">Brak danych do wyświetlenia</p>
                  );
                })()}
              </div>
            </div>

            {/* Remaining vs Paid */}
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Postęp spłat</h3>
              {chartData.length > 0 ? (
                <ChartContainer config={loansConfig} className="max-h-[300px] w-full">
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
                          if (name === 'paidAmount' || name === 'remainingAmount') {
                            return [formatCurrency(value, userCurrency), loansConfig[name as keyof typeof loansConfig]?.label || name];
                          }
                          return [formatCurrency(value, userCurrency), name];
                        }}
                      />} 
                    />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar
                      dataKey="paidAmount"
                      stackId="a"
                      fill="var(--color-paidAmount)"
                      radius={[0, 0, 4, 4]}
                    />
                    <Bar
                      dataKey="remainingAmount"
                      stackId="a"
                      fill="var(--color-remainingAmount)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ChartContainer>
              ) : (
                <p className="text-sm text-muted-foreground">Brak danych do wyświetlenia</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit/Add Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editMode ? 'Edytuj kredyt' : 'Dodaj kredyt'}</DialogTitle>
            <DialogDescription>
              Wypełnij poniższe dane aby {editMode ? 'zaktualizować' : 'utworzyć'} kredyt.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nazwa</Label>
              <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="amount">Kwota całkowita</Label>
                <Input id="amount" type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Wybierz" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aktywna">Aktywna</SelectItem>
                    <SelectItem value="spłacona">Spłacona</SelectItem>
                    <SelectItem value="zawieszona">Zawieszona</SelectItem>
                    <SelectItem value="anulowana">Anulowana</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="installments">Ilość rat</Label>
                <Input id="installments" type="number" value={formData.installments} onChange={(e) => setFormData({ ...formData, installments: parseFloat(e.target.value) })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="installmentAmount">Kwota raty</Label>
                <Input id="installmentAmount" type="number" step="0.01" value={formData.installmentAmount} onChange={(e) => setFormData({ ...formData, installmentAmount: parseFloat(e.target.value) })} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startDate">Data rozpoczęcia</Label>
                <Input id="startDate" type="date" value={formData.startDate ? formData.startDate.substring(0, 10) : ''} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endDate">Data zakończenia</Label>
                <Input id="endDate" type="date" value={formData.endDate ? formData.endDate.substring(0, 10) : ''} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="nextPayment">Data następnej raty</Label>
              <Input id="nextPayment" type="date" value={formData.nextPayment ? formData.nextPayment.substring(0, 10) : ''} onChange={(e) => setFormData({ ...formData, nextPayment: e.target.value })} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="note">Notatka</Label>
              <Textarea id="note" value={formData.note} onChange={(e) => setFormData({ ...formData, note: e.target.value })} placeholder="Dodatkowe informacje..." />
            </div>

            <div className="grid gap-2">
              <Label>Załączniki</Label>
              <UploadField
                fileList={attachments.map(a => ({ url: a.url, name: a.name, uid: a.name }))}
                onChange={(value) => {
                  const newAttachments = value.map((f: { name: string; url: string; uid?: string; type?: string }) => ({
                    name: f.name,
                    url: f.url,
                    type: f.type || '',
                  }));
                  setAttachments(newAttachments);
                }}
                storageRef={`loans/${editingLoan?.id || 'new'}`}
                multiple
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Anuluj</Button>
            <Button onClick={handleSubmit}>Zapisz</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Loans;