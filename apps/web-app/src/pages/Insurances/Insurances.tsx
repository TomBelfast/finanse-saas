import React, { useEffect, useState, useMemo } from 'react';
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
  Clock,
  Check,
  Search,
  Filter,
  BarChart3,
  PieChart as PieChartIcon,
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
import { ApiInsurance } from '~/types/api';
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '~/components/ui/card';
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
import UploadField from '../../components/UploadField/UploadField';

interface Attachment {
  name: string;
  url: string;
  type: string;
}

interface PaymentHistoryEntry {
  date: string;
  amount: number;
  method?: string;
}

interface Insurance {
  id: string;
  name: string;
  paymentStatus: 'do_zaplaty' | 'zaplacono';
  status: string;
  renewalCycle: 'monthly' | 'yearly';
  nextPaymentDate?: string;
  amountDue?: number;
  paymentHistory?: PaymentHistoryEntry[];
  note?: string;
  attachments?: Attachment[];
  // Added properties
  amount?: number;
  currency?: string;
  periodStart?: string;
  periodEnd?: string;
  insuranceCompany?: string;
  insuranceType?: string;
}

const getPaymentStatusColor = (status: string, nextPaymentDate?: string) => {
  if (status === 'zaplacono') return 'success'; // Zielony
  if (!nextPaymentDate) return 'secondary'; // Szary
  const now = new Date();
  const next = new Date(nextPaymentDate);
  const diffDays = Math.ceil((next.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays > 7) return 'warning'; // Żółty
  if (diffDays > 1) return 'destructive'; // Pomarańczowy/Czerwony (używam destructive jako czerwony)
  if (diffDays <= 1) return 'destructive'; // Czerwony
  return 'secondary';
};

const getDaysToPayment = (nextPaymentDate?: string) => {
  if (!nextPaymentDate) return '-';
  const now = new Date();
  const next = new Date(nextPaymentDate);
  const diffDays = Math.ceil((next.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays;
};

const Insurances = () => {
  const [data, setData] = useState<Insurance[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingInsurance, setEditingInsurance] = useState<Insurance | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  // Filters
  const [filterName, setFilterName] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Form State
  const [formData, setFormData] = useState<Partial<Insurance>>({
    name: '',
    paymentStatus: 'do_zaplaty',
    status: 'active',
    renewalCycle: 'monthly',
    note: '',
    nextPaymentDate: '',
    amountDue: 0,
  });

  const userDetails = useSelector((store: AppStore) => store.user.details);
  const userCurrency = (userDetails?.defaultCurrency || 'pln') as Currency;

  // Helper function to parse amount
  const parseAmount = (amount: unknown): number => {
    if (typeof amount === 'number') return amount;
    if (typeof amount === 'string') {
      // Remove currency symbols and spaces, replace comma with dot
      const cleaned = amount.replace(/[^\d.,-]/g, '').replace(',', '.');
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  }

  const loadData = async () => {
    setLoading(true);
    try {
      const insurances = await apiClient.getInsurances();
      const mapped = (insurances as ApiInsurance[]).map(row => {
        // Parse documents
        let attachments = [];
        try {
          attachments = typeof row.documents === 'string' ? JSON.parse(row.documents) : (row.documents || row.attachments || []);
        } catch (e) { 
          logger.error('Error parsing attachments', e instanceof Error ? e : new Error(String(e)));
        }

        // Extract renewalCycle from description if needed
        let renewalCycle = 'monthly';
        if (row.description && row.description.includes('Renewal Cycle:')) {
          const match = row.description.match(/Renewal Cycle:\s*(\w+)/);
          if (match) renewalCycle = match[1];
        } else if (row.renewalCycle) {
          renewalCycle = row.renewalCycle;
        }

        // Mapowanie statusów - API zwraca angielskie, ale możemy je zostawić jako są
        // paymentStatus zależy od statusu i daty płatności
        let paymentStatus: 'do_zaplaty' | 'zaplacono' = 'do_zaplaty';
        if (row.status === 'expired' || row.status === 'cancelled') {
          paymentStatus = 'zaplacono';
        } else if (row.status === 'active' || row.status === 'pending') {
          // Dla aktywnych i oczekujących - sprawdź datę płatności
          if (row.renewal_date) {
            const renewalDate = new Date(row.renewal_date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            renewalDate.setHours(0, 0, 0, 0);
            // Jeśli data płatności minęła, oznacza że do zapłaty
            paymentStatus = renewalDate < today ? 'do_zaplaty' : 'zaplacono';
          } else {
            paymentStatus = 'do_zaplaty';
          }
        }

        return {
          id: row.id,
          name: row.name,
          amount: row.amount ? parseAmount(row.amount) : 0,
          amountDue: row.amount ? parseAmount(row.amount) : 0,
          currency: row.currency,
          nextPaymentDate: row.renewal_date,
          status: row.status, // Zostawiamy angielskie statusy z API
          paymentStatus: paymentStatus,
          renewalCycle: renewalCycle as 'monthly' | 'yearly',
          note: row.description,
          attachments: attachments,
          insuranceCompany: row.insurance_company,
          insuranceType: row.insurance_type,
          periodStart: row.period_start,
          periodEnd: row.period_end
        };
      });
      setData(mapped);
    } catch (error: unknown) {
      logger.error('Błąd podczas ładowania ubezpieczeń', error instanceof Error ? error : new Error(String(error)));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Odśwież dane co 30 sekund
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const filteredData = data.filter(insurance => {
    return (
      (!filterName || insurance.name?.toLowerCase().includes(filterName.toLowerCase())) &&
      (filterStatus === 'all' || !filterStatus || insurance.status === filterStatus)
    );
  });

  // Sortowanie: najpierw do zapłaty, potem zapłacone
  const sortedData = [...filteredData].sort((a, b) => {
    if (a.paymentStatus === b.paymentStatus) return 0;
    if (a.paymentStatus === 'do_zaplaty') return -1;
    if (b.paymentStatus === 'do_zaplaty') return 1;
    return 0;
  });

  // Funkcja obliczania podsumowania ubezpieczeń
  const summary = useMemo(() => {
    // Używamy wszystkich danych (data) dla summary, aby pokazywać całkowite wartości
    const allInsurances = data || [];
    
    // Filtrujemy tylko aktywne ubezpieczenia (nie anulowane, nie wygasłe)
    const activeInsurances = allInsurances.filter(ins => 
      ins.status === 'active' || ins.status === 'pending'
    );
    
    // Z aktywnych wybieramy te do zapłaty i zapłacone
    const pendingPayments = activeInsurances.filter(ins => ins.paymentStatus === 'do_zaplaty');
    const paidInsurances = activeInsurances.filter(ins => ins.paymentStatus === 'zaplacono');

    let totalMonthly = 0;
    let totalYearly = 0;
    let monthlyCount = 0;
    let yearlyCount = 0;
    let actualMonthlyCost = 0;  // Rzeczywisty koszt miesięcznych ubezpieczeń
    let actualYearlyCost = 0;   // Rzeczywisty koszt rocznych ubezpieczeń
    let totalPendingAmount = 0; // Suma kwot do zapłaty

    activeInsurances.forEach(ins => {
      const amount = parseAmount(ins.amountDue);

      // Dodaj do sumy kwot do zapłaty jeśli status to "do_zaplaty"
      if (ins.paymentStatus === 'do_zaplaty') {
        totalPendingAmount += amount;
      }

      if (ins.renewalCycle === 'monthly') {
        actualMonthlyCost += amount;  // Rzeczywisty miesięczny koszt
        totalMonthly += amount;
        monthlyCount++;
        totalYearly += amount * 12; // Convert monthly to yearly
      } else if (ins.renewalCycle === 'yearly') {
        actualYearlyCost += amount;   // Rzeczywisty roczny koszt
        totalYearly += amount;
        yearlyCount++;
        totalMonthly += amount / 12; // Convert yearly to monthly
      }
    });

    const averagePerInsurance = activeInsurances.length > 0 ? totalMonthly / activeInsurances.length : 0;

    return {
      activeCount: activeInsurances.length,
      pendingPaymentsCount: pendingPayments.length,
      paidCount: paidInsurances.length,
      totalMonthly,
      totalYearly,
      totalPendingAmount,
      averagePerInsurance,
      monthlyInsurances: { count: monthlyCount, total: actualMonthlyCost },
      yearlyInsurances: { count: yearlyCount, total: actualYearlyCost }
    };
  }, [data]);

  const handleOpenAddModal = () => {
    setEditMode(false);
    setEditingInsurance(null);
    setFormData({
      name: '',
      paymentStatus: 'do_zaplaty',
      status: 'active',
      renewalCycle: 'monthly',
      note: '',
      nextPaymentDate: '',
      amountDue: 0,
    });
    setAttachments([]);
    setModalOpen(true);
  };

  const handleOpenEditModal = (insurance: Insurance) => {
    setEditMode(true);
    setEditingInsurance(insurance);
    setFormData({ ...insurance });
    setAttachments(insurance.attachments || []);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Na pewno usunąć?')) return;
    try {
      await apiClient.deleteInsurance(id);
      loadData();
    } catch (error) {
      logger.error('Błąd usuwania', error instanceof Error ? error : new Error(String(error)), { insuranceId: id });
    }
  };

  const handlePayment = async (insurance: Insurance) => {
    try {
      // 1. Przenieś obecny rekord do "expired" (opłacony/zakończony okres)
      await apiClient.updateInsurance(insurance.id, {
        status: 'expired',
      });

      // 2. Wylicz nową datę płatności na podstawie cyklu
      let nextDate = '';
      if (insurance.nextPaymentDate) {
        const current = new Date(insurance.nextPaymentDate);
        if (insurance.renewalCycle === 'monthly') {
          const day = current.getDate();
          current.setMonth(current.getMonth() + 1);
          if (current.getDate() < day) {
            current.setDate(0);
          }
        } else if (insurance.renewalCycle === 'yearly') {
          const day = current.getDate();
          current.setFullYear(current.getFullYear() + 1);
          if (current.getDate() < day) {
            current.setDate(0);
          }
        }
        nextDate = current.toISOString().split('T')[0];
      }

      // 3. Utwórz nowy rekord z nową datą i statusem "do_zaplaty"
      const newInsurance = {
        name: insurance.name,
        amount: insurance.amount,
        currency: insurance.currency || userCurrency || 'PLN',
        period_start: insurance.periodStart || new Date().toISOString().split('T')[0],
        period_end: insurance.periodEnd || '',
        renewal_date: nextDate,
        insurance_company: insurance.insuranceCompany || '',
        insurance_type: insurance.insuranceType || '',
        status: 'active',
        nextPaymentDate: nextDate,
        renewalCycle: insurance.renewalCycle || 'monthly',
        attachments: Array.isArray(insurance.attachments) ? insurance.attachments : [],
      };

      await apiClient.createInsurance(newInsurance);
      loadData();
    } catch (error) {
      logger.error('Błąd płatności', error instanceof Error ? error : new Error(String(error)));
    }
  };

  const handleSubmit = async () => {
    try {
      if (!formData.name) {
        alert('Podaj nazwę');
        return;
      }

      const safeAttachments = Array.isArray(attachments)
        ? attachments.map(a => ({ name: a?.name || '', url: a?.url || '', type: a?.type || '' }))
        : [];

      // Jeśli paymentStatus jest "zaplacono", ustaw renewal_date na przyszłą datę
      let renewalDate = formData.nextPaymentDate;
      if (formData.paymentStatus === 'zaplacono' && formData.nextPaymentDate) {
        const currentDate = new Date(formData.nextPaymentDate);
        const cycle = formData.renewalCycle || 'monthly';
        
        if (cycle === 'monthly') {
          currentDate.setMonth(currentDate.getMonth() + 1);
        } else {
          currentDate.setFullYear(currentDate.getFullYear() + 1);
        }
        renewalDate = currentDate.toISOString().split('T')[0];
      } else if (formData.paymentStatus === 'do_zaplaty' && formData.nextPaymentDate) {
        // Jeśli zmieniamy na "do zapłaty", ustaw datę na przeszłą (np. wczoraj)
        const currentDate = new Date(formData.nextPaymentDate);
        currentDate.setDate(currentDate.getDate() - 1);
        renewalDate = currentDate.toISOString().split('T')[0];
      }

      const payload = {
        ...formData,
        amount: formData.amountDue, // map amountDue to amount for backend
        documents: safeAttachments,
        description: formData.note,
        renewal_date: renewalDate,
        status: formData.status || 'active', // Upewnij się, że status jest wysyłany
      };

      if (editMode && editingInsurance) {
        await apiClient.updateInsurance(editingInsurance.id, payload);
      } else {
        await apiClient.createInsurance(payload as any);
      }

      setModalOpen(false);
      loadData();
    } catch (e: unknown) {
      logger.error('Błąd zapisu ubezpieczenia', e instanceof Error ? e : new Error(String(e)));
      alert(e?.message || 'Błąd zapisu');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Ubezpieczenia</h1>
        <Button onClick={handleOpenAddModal} className="gap-2">
          <Plus className="h-4 w-4" /> Dodaj ubezpieczenie
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* ... Cards code preserved ... */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktywne ubezpieczenia</CardTitle>
            <Trophy className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.activeCount}</div>
            <p className="text-xs text-gray-500">Aktualne polisy</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Do zapłaty</CardTitle>
            <Clock className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{summary.pendingPaymentsCount}</div>
            <p className="text-xs text-gray-500">Wymagające uwagi</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Koszt miesięczny</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{formatCurrency(summary.totalMonthly, userCurrency)}</div>
            <p className="text-xs text-gray-500">Średni koszt</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Koszt roczny</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{formatCurrency(summary.totalYearly, userCurrency)}</div>
            <p className="text-xs text-gray-500">Prognoza</p>
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
              placeholder="np. OC Samochód"
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
              <SelectItem value="active">Aktywne</SelectItem>
              <SelectItem value="pending">Oczekujące</SelectItem>
              <SelectItem value="expired">Wygasłe</SelectItem>
              <SelectItem value="cancelled">Anulowane</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" className="gap-2 ml-auto" onClick={() => { setFilterName(''); setFilterStatus('all'); }}>
          <Filter className="h-4 w-4" /> Resetuj filtry
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nazwa</TableHead>
              <TableHead>Status płatności</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Cykl</TableHead>
              <TableHead>Data płatności</TableHead>
              <TableHead>Dni do zapłaty</TableHead>
              <TableHead>Kwota</TableHead>
              <TableHead>Załączniki</TableHead>
              <TableHead className="text-right">Akcje</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  Brak danych
                </TableCell>
              </TableRow>
            ) : (
              sortedData.map((insurance) => (
                <TableRow key={insurance.id}>
                  <TableCell className="font-medium">{insurance.name}</TableCell>
                  <TableCell>
                    <Badge variant={getPaymentStatusColor(insurance.paymentStatus, insurance.nextPaymentDate)}>
                      {insurance.paymentStatus === 'do_zaplaty' ? 'Do zapłaty' : 'Zapłacono'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {insurance.status === 'active' ? 'Aktywna' :
                       insurance.status === 'pending' ? 'Oczekująca' :
                       insurance.status === 'expired' ? 'Wygasła' :
                       insurance.status === 'cancelled' ? 'Anulowana' :
                       insurance.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{insurance.renewalCycle === 'monthly' ? 'Miesięczny' : 'Roczny'}</TableCell>
                  <TableCell>
                    {insurance.nextPaymentDate ? (insurance.nextPaymentDate.includes('T') ? insurance.nextPaymentDate.split('T')[0] : insurance.nextPaymentDate.substring(0, 10)) : '-'}
                  </TableCell>
                  <TableCell>
                    <span className={Number(getDaysToPayment(insurance.nextPaymentDate)) <= 3 && insurance.paymentStatus === 'do_zaplaty' ? 'text-destructive font-bold' : 'text-foreground'}>
                      {getDaysToPayment(insurance.nextPaymentDate)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {insurance.amountDue ? formatCurrency(insurance.amountDue, userCurrency) : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {insurance.attachments?.map((att, i) => (
                        <a key={i} href={att.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80">
                          <Paperclip className="h-4 w-4" />
                        </a>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenEditModal(insurance)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      {insurance.paymentStatus === 'do_zaplaty' && insurance.status !== 'finished' && (
                        <Button variant="outline" size="icon" className="text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => handlePayment(insurance)} title="Oznacz jako zapłacone">
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80" onClick={() => handleDelete(insurance.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Charts Section */}
      {sortedData.length > 0 && (
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Analiza ubezpieczeń
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* All insurance services - Each service as separate bar */}
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Wszystkie ubezpieczenia</h3>
                {(() => {
                  // Używamy wszystkich ubezpieczeń, nie tylko przefiltrowanych, aby pokazać wszystkie elementy
                  const allInsurances = data || [];
                  
                  const COLORS = [
                    "hsl(var(--chart-1))",
                    "hsl(var(--chart-2))",
                    "hsl(var(--chart-3))",
                    "hsl(var(--chart-4))",
                    "hsl(var(--chart-5))",
                  ];

                  // Każdy element ubezpieczenia jako osobny słupek
                  const chartData = allInsurances
                    .filter(ins => ins.amountDue)
                    .map((ins, index) => {
                      // Dla rocznych, dzielimy przez 12, dla miesięcznych bierzemy pełną kwotę
                      const monthlyAmount = ins.renewalCycle === 'yearly' 
                        ? (ins.amountDue || 0) / 12 
                        : (ins.amountDue || 0);
                      
                      return {
                        name: ins.name || `Ubezpieczenie ${index + 1}`,
                        amount: monthlyAmount,
                        fill: COLORS[index % COLORS.length],
                        paymentStatus: ins.paymentStatus === 'zaplacono' ? 'Zapłacono' : 'Do zapłaty',
                      };
                    })
                    .sort((a, b) => b.amount - a.amount); // Sortuj od największej do najmniejszej

                  // Tworzymy config z kolorami dla każdego ubezpieczenia
                  const insuranceConfig = chartData.reduce((acc, item, index) => {
                    acc[item.name] = {
                      label: item.name,
                      color: item.fill,
                    };
                    return acc;
                  }, {} as Record<string, { label: string; color: string }>);

                  insuranceConfig.amount = {
                    label: "Kwota miesięczna",
                    color: "hsl(var(--chart-1))",
                  };

                  return chartData.length > 0 ? (
                    <ChartContainer config={insuranceConfig} className="max-h-[300px] w-full">
                      <BarChart data={chartData} layout="vertical" margin={{ left: 0 }}>
                        <CartesianGrid horizontal={false} />
                        <YAxis 
                          dataKey="name" 
                          type="category" 
                          tickLine={false} 
                          axisLine={false} 
                          width={150} 
                          style={{ fontSize: '12px' }}
                        />
                        <XAxis type="number" tickLine={false} axisLine={false} style={{ fontSize: '12px' }} />
                        <ChartTooltip 
                          cursor={false} 
                          content={<ChartTooltipContent 
                            hideLabel 
                            formatter={(value: unknown, name: string, props: { payload?: { paymentStatus?: string } }) => {
                              const paymentStatus = props.payload?.paymentStatus || '';
                              return [formatCurrency(value, userCurrency), paymentStatus];
                            }}
                            labelFormatter={(label) => label}
                          />} 
                        />
                        <Bar dataKey="amount" layout="vertical" radius={5}>
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ChartContainer>
                  ) : (
                    <p className="text-sm text-muted-foreground">Brak danych do wyświetlenia</p>
                  );
                })()}
              </div>

              {/* All insurance services - Each service as separate segment */}
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Wszystkie ubezpieczenia</h3>
                {(() => {
                  // Używamy wszystkich ubezpieczeń, nie tylko przefiltrowanych
                  const allInsurances = data || [];
                  
                  const COLORS = [
                    "hsl(var(--chart-1))",
                    "hsl(var(--chart-2))",
                    "hsl(var(--chart-3))",
                    "hsl(var(--chart-4))",
                    "hsl(var(--chart-5))",
                  ];

                  // Każde ubezpieczenie jako osobny segment
                  const chartData = allInsurances
                    .filter(ins => {
                      // Używamy amountDue jeśli istnieje, w przeciwnym razie amount
                      const amount = ins.amountDue || ins.amount || 0;
                      return amount > 0;
                    })
                    .map((ins, index) => {
                      // Używamy amountDue jeśli istnieje, w przeciwnym razie amount
                      const baseAmount = ins.amountDue || ins.amount || 0;
                      // Dla rocznych, dzielimy przez 12, dla miesięcznych bierzemy pełną kwotę
                      const monthlyAmount = ins.renewalCycle === 'yearly' 
                        ? baseAmount / 12 
                        : baseAmount;
                      
                      return {
                        name: ins.name || `Ubezpieczenie ${index + 1}`,
                        total: monthlyAmount,
                        fill: COLORS[index % COLORS.length],
                        paymentStatus: ins.paymentStatus === 'zaplacono' ? 'Zapłacono' : 'Do zapłaty',
                      };
                    })
                    .filter(item => item.total > 0) // Filtrujemy tylko pozytywne wartości
                    .sort((a, b) => b.total - a.total); // Sortuj od największej do najmniejszej

                  // Obliczamy całkowitą sumę dla procentów
                  const totalSum = chartData.reduce((sum, item) => sum + item.total, 0);

                  // Dodajemy procenty do każdego elementu
                  const chartDataWithPercentages = chartData.map((item) => {
                    const percentage = totalSum > 0 ? (item.total / totalSum) * 100 : 0;
                    return {
                      ...item,
                      percentage: Math.round(percentage * 10) / 10,
                    };
                  });

                  // Tworzymy config z kolorami dla każdego ubezpieczenia
                  const insuranceConfig = chartDataWithPercentages.reduce((acc, item, index) => {
                    acc[item.name] = {
                      label: item.name,
                      color: item.fill,
                    };
                    return acc;
                  }, {} as Record<string, { label: string; color: string }>);

                  insuranceConfig.total = {
                    label: "Kwota miesięczna",
                    color: "hsl(var(--chart-1))",
                  };

                  return chartDataWithPercentages.length > 0 && totalSum > 0 ? (
                    <ChartContainer config={insuranceConfig} className="[&_.recharts-pie-label-text]:fill-foreground mx-auto aspect-square max-h-[300px]">
                      <PieChart>
                        <ChartTooltip 
                          content={<ChartTooltipContent 
                            hideLabel
                            formatter={(value: unknown, name: string, props: { payload?: { paymentStatus?: string } }) => {
                              const paymentStatus = props.payload?.paymentStatus || '';
                              return [formatCurrency(value, userCurrency), paymentStatus];
                            }}
                            labelFormatter={(label) => label}
                          />} 
                        />
                        <Pie
                          data={chartDataWithPercentages}
                          dataKey="total"
                          label={(entry: { name: string; total: number }) => {
                            return `${entry.name}: ${formatCurrency(entry.total, userCurrency)}`;
                          }}
                          nameKey="name"
                        >
                          {chartDataWithPercentages.map((entry, index) => (
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

            {/* All insurance services by renewal cycle - Each service as separate bar */}
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Ubezpieczenia według cyklu odnowienia</h3>
              {(() => {
                // Używamy wszystkich ubezpieczeń, nie tylko przefiltrowanych
                const allInsurances = data || [];
                
                const COLORS = [
                  "hsl(var(--chart-1))",
                  "hsl(var(--chart-2))",
                  "hsl(var(--chart-3))",
                  "hsl(var(--chart-4))",
                  "hsl(var(--chart-5))",
                ];

                // Każdy element ubezpieczenia jako osobny słupek z informacją o cyklu
                const chartData = allInsurances
                  .filter(ins => ins.amountDue)
                  .map((ins, index) => {
                    // Dla rocznych, dzielimy przez 12, dla miesięcznych bierzemy pełną kwotę
                    const monthlyAmount = ins.renewalCycle === 'yearly' 
                      ? (ins.amountDue || 0) / 12 
                      : (ins.amountDue || 0);
                    
                    return {
                      name: ins.name || `Ubezpieczenie ${index + 1}`,
                      amount: monthlyAmount,
                      fill: COLORS[index % COLORS.length],
                      cycle: ins.renewalCycle === 'monthly' ? 'Miesięczny' : 'Roczny',
                      paymentStatus: ins.paymentStatus === 'zaplacono' ? 'Zapłacono' : 'Do zapłaty',
                    };
                  })
                  .sort((a, b) => b.amount - a.amount); // Sortuj od największej do najmniejszej

                // Tworzymy config z kolorami dla każdego ubezpieczenia
                const cycleConfig = chartData.reduce((acc, item, index) => {
                  acc[item.name] = {
                    label: item.name,
                    color: item.fill,
                  };
                  return acc;
                }, {} as Record<string, { label: string; color: string }>);

                cycleConfig.amount = {
                  label: "Kwota miesięczna",
                  color: "hsl(var(--chart-1))",
                };

                return chartData.length > 0 ? (
                  <ChartContainer config={cycleConfig} className="max-h-[300px] w-full">
                    <BarChart data={chartData} layout="vertical" margin={{ left: 0 }}>
                      <CartesianGrid horizontal={false} />
                      <YAxis 
                        dataKey="name" 
                        type="category" 
                        tickLine={false} 
                        axisLine={false} 
                        width={150} 
                        style={{ fontSize: '12px' }}
                      />
                      <XAxis type="number" tickLine={false} axisLine={false} style={{ fontSize: '12px' }} />
                      <ChartTooltip 
                        cursor={false} 
                        content={<ChartTooltipContent 
                          hideLabel 
                          formatter={(value: unknown, name: string, props: { payload?: { cycle?: string } }) => {
                            const cycle = props.payload?.cycle || '';
                            const paymentStatus = props.payload?.paymentStatus || '';
                            return [formatCurrency(value, userCurrency), `${cycle} - ${paymentStatus}`];
                          }}
                          labelFormatter={(label) => label}
                        />} 
                      />
                      <Bar dataKey="amount" layout="vertical" radius={5}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
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

      {/* Edit/Add Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[600px] bg-background">
          <DialogHeader>
            <DialogTitle>{editMode ? 'Edytuj ubezpieczenie' : 'Dodaj ubezpieczenie'}</DialogTitle>
            <DialogDescription>
              Wypełnij poniższe dane aby {editMode ? 'zaktualizować' : 'utworzyć'} ubezpieczenie.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto px-1">
            <div className="grid gap-2">
              <Label htmlFor="name">Nazwa</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="np. PZU OC"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
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
                    <SelectItem value="active">Aktywna</SelectItem>
                    <SelectItem value="pending">Oczekująca</SelectItem>
                    <SelectItem value="expired">Wygasła</SelectItem>
                    <SelectItem value="cancelled">Anulowana</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="paymentStatus">Płatność</Label>
                <Select
                  value={formData.paymentStatus}
                  onValueChange={(value) => setFormData({ ...formData, paymentStatus: value as 'do_zaplaty' | 'zaplacono' })}
                >
                  <SelectTrigger id="paymentStatus">
                    <SelectValue placeholder="Wybierz" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="do_zaplaty">Do zapłaty</SelectItem>
                    <SelectItem value="zaplacono">Zapłacono</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="renewalCycle">Cykl odnowienia</Label>
              <Select
                value={formData.renewalCycle}
                onValueChange={(value) => setFormData({ ...formData, renewalCycle: value as 'monthly' | 'yearly' })}
              >
                <SelectTrigger id="renewalCycle">
                  <SelectValue placeholder="Wybierz" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Miesięczny</SelectItem>
                  <SelectItem value="yearly">Roczny</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="nextPaymentDate">Data płatności</Label>
                <Input
                  id="nextPaymentDate"
                  type="date"
                  value={formData.nextPaymentDate ? (formData.nextPaymentDate.includes('T') ? formData.nextPaymentDate.split('T')[0] : formData.nextPaymentDate) : ''}
                  onChange={(e) => setFormData({ ...formData, nextPaymentDate: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="amountDue">Kwota</Label>
                <Input
                  id="amountDue"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.amountDue}
                  onChange={(e) => setFormData({ ...formData, amountDue: parseFloat(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="note">Notatka</Label>
              <Textarea
                id="note"
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                placeholder="Dodatkowe informacje..."
              />
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
                storageRef={`insurances/${editingInsurance?.id || 'new'}`}
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

export default Insurances;