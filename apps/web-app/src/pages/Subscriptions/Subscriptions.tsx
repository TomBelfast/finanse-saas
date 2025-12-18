import React, { useEffect, useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Plus,
  Edit,
  Trash2,
  Paperclip,
  DollarSign,
  Calendar as CalendarIcon,
  Trophy,
  Tag as TagIcon,
  Loader2,
  BarChart3,
} from 'lucide-react'
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
} from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig
} from "~/components/ui/chart"
import { useSelector } from 'react-redux'
import { AppStore, formatCurrency, Currency } from '@akademiasaas/shared'
import { apiClient } from '../../services/apiClient'
import { ApiSubscription } from '~/types/api'
import { logger } from '~/utils/logger'
import UploadField from '../../components/UploadField/UploadField'
import TableFiltersPanel, { FilterField } from '../../components/TableFiltersPanel'
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '~/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form'
import { Input } from '~/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { Textarea } from '~/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
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
import { toast } from 'sonner'
import { cn } from '~/lib/utils'

interface Attachment {
  name: string
  url: string
  type: string
  uid?: string
}

interface Subscription {
  id: string
  name: string
  amount: number
  cycle: string
  renewalDate: string
  status: string
  note?: string
  attachments?: Attachment[]
  tag?: string
  category?: string // Added for compatibility with filtering
}

const COLLECTION = 'subscriptions'

const SUBSCRIPTION_TAGS = [
  { value: 'uslugi_cyfrowe', label: 'Usługi cyfrowe', color: 'bg-blue-100 text-blue-800' },
  { value: 'ubezpieczenia', label: 'Ubezpieczenia', color: 'bg-green-100 text-green-800' },
  { value: 'media', label: 'Media', color: 'bg-orange-100 text-orange-800' },
  { value: 'telefony', label: 'Telefony', color: 'bg-purple-100 text-purple-800' },
  { value: 'streaming', label: 'Streaming', color: 'bg-red-100 text-red-800' },
  { value: 'inne', label: 'Inne', color: 'bg-gray-100 text-gray-800' },
]

const filterFields: FilterField[] = [
  { type: 'text', name: 'name', label: 'Nazwa' },
  {
    type: 'select',
    name: 'cycle',
    label: 'Cykl',
    options: [
      { value: 'miesięczny', label: 'Miesięczny' },
      { value: 'roczny', label: 'Roczny' },
    ],
  },
  {
    type: 'select',
    name: 'status',
    label: 'Status',
    options: [
      { value: 'aktywna', label: 'Aktywna' },
      { value: 'nieaktywna', label: 'Nieaktywna' },
    ],
  },
  {
    type: 'select',
    name: 'tag',
    label: 'Kategoria',
    options: SUBSCRIPTION_TAGS.map((tag) => ({ value: tag.value, label: tag.label })),
  },
]

const formSchema = z.object({
  name: z.string().min(1, 'Nazwa jest wymagana'),
  amount: z.coerce.number().min(0, 'Kwota musi być dodatnia'),
  cycle: z.string(),
  renewalDate: z.string().min(1, 'Data odnowienia jest wymagana'),
  status: z.string(),
  tag: z.string().optional(),
  note: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

const Subscriptions = () => {
  const [data, setData] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editingSub, setEditingSub] = useState<Subscription | null>(null)
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [initialDataLoaded, setInitialDataLoaded] = useState(false)
  const userDetails = useSelector((store: AppStore) => store.user.details)
  const userCurrency = (userDetails?.defaultCurrency || 'pln') as Currency

  const form = useForm<FormValues>({
    // @ts-expect-error - zodResolver type mismatch with z.coerce.number()
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: 'aktywna',
      cycle: 'miesięczny',
      tag: 'inne',
      note: '',
    },
  })

  // Pobieranie danych z API
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const subscriptions = await apiClient.getSubscriptions()
        // Mapowanie danych z API do formatu komponentu
        const mappedData = subscriptions.map((sub: ApiSubscription) => {
          // Parse documents from JSON string if needed
          let attachments: Attachment[] = [];
          if (sub.documents) {
            try {
              const parsed = typeof sub.documents === 'string' ? JSON.parse(sub.documents) : sub.documents;
              attachments = Array.isArray(parsed) ? parsed : [];
            } catch {
              attachments = [];
            }
          }
          
          return {
            id: sub.id,
            name: sub.name,
            amount: sub.amount,
            cycle: 'miesięczny', // Default - cycle not in API response
            renewalDate: typeof sub.renewal_date === 'string' ? sub.renewal_date : (sub.renewal_date instanceof Date ? sub.renewal_date.toISOString() : ''),
            status: sub.status || 'aktywna',
            note: sub.description || '',
            attachments,
            tag: sub.category || 'inne',
          } as Subscription;
        })
        setData(mappedData)
        setInitialDataLoaded(true)
      } catch (error: unknown) {
        logger.error('Błąd podczas ładowania subskrypcji', error instanceof Error ? error : new Error(String(error)));
        const errorMessage = (error instanceof Error ? error.message : null) || (typeof error === 'object' && error !== null && 'error' in error ? String(error.error) : null) || 'Nie udało się załadować subskrypcji'
        toast.error(errorMessage)
        setData([])
      } finally {
        setLoading(false)
      }
    }

    loadData()
    const interval = setInterval(loadData, 30000)
    return () => clearInterval(interval)
  }, [])



  const filteredData = useMemo(() => {
    return data.filter((sub) => {
      // Filtrowanie po nazwie (case-insensitive, częściowe dopasowanie)
      const nameMatch = !filters.name || 
        (sub.name && sub.name.toLowerCase().includes(filters.name.toLowerCase().trim()));
      
      // Filtrowanie po cyklu (obsługa różnych formatów)
      const cycleMatch = !filters.cycle || 
        sub.cycle === filters.cycle ||
        (filters.cycle === 'miesięczny' && (sub.cycle === 'monthly' || sub.cycle === 'miesięczny')) ||
        (filters.cycle === 'roczny' && (sub.cycle === 'yearly' || sub.cycle === 'roczny'));
      
      // Filtrowanie po statusie (obsługa różnych formatów)
      const statusMatch = !filters.status || 
        sub.status === filters.status ||
        (filters.status === 'aktywna' && (sub.status === 'active' || sub.status === 'aktywna')) ||
        (filters.status === 'nieaktywna' && (sub.status === 'inactive' || sub.status === 'nieaktywna'));
      
      // Filtrowanie po kategorii/tagu
      const tagMatch = !filters.tag || 
        sub.tag === filters.tag ||
        sub.category === filters.tag;
      
      return nameMatch && cycleMatch && statusMatch && tagMatch;
    });
  }, [data, filters])

  const openAddModal = () => {
    setModalOpen(true)
    setEditMode(false)
    setEditingSub(null)
    setAttachments([])
    form.reset({
      name: '',
      amount: 0,
      cycle: 'miesięczny',
      renewalDate: '',
      status: 'aktywna',
      tag: 'inne',
      note: '',
    })
  }

  const openEditModal = (sub: Subscription) => {
    setModalOpen(true)
    setEditMode(true)
    setEditingSub(sub)
    setAttachments(sub.attachments || [])
    form.reset({
      name: sub.name,
      amount: sub.amount,
      cycle: sub.cycle,
      renewalDate: sub.renewalDate ? sub.renewalDate.split('T')[0] : '', // format YYYY-MM-DD for input date
      status: sub.status,
      tag: sub.tag,
      note: sub.note,
    })
  }

  const handleDelete = async (id: string) => {
    try {
      await apiClient.deleteSubscription(id)
      toast.success('Usunięto subskrypcję')
      const subscriptions = await apiClient.getSubscriptions()
      const mappedData = subscriptions.map((sub: ApiSubscription) => {
        let attachments: Attachment[] = [];
        if (sub.documents) {
          try {
            const parsed = typeof sub.documents === 'string' ? JSON.parse(sub.documents) : sub.documents;
            attachments = Array.isArray(parsed) ? parsed : [];
          } catch {
            attachments = [];
          }
        }
        
        return {
          id: sub.id,
          name: sub.name,
          amount: sub.amount,
          cycle: 'miesięczny',
          renewalDate: typeof sub.renewal_date === 'string' ? sub.renewal_date : (sub.renewal_date instanceof Date ? sub.renewal_date.toISOString() : ''),
          status: sub.status || 'aktywna',
          note: sub.description || '',
          attachments,
          tag: sub.category || 'inne',
        } as Subscription;
      })
      setData(mappedData)
    } catch (error: unknown) {
      logger.error('Błąd podczas usuwania', error instanceof Error ? error : new Error(String(error)), { subscriptionId: id });
      toast.error((error instanceof Error ? error.message : null) || (typeof error === 'object' && error !== null && 'message' in error ? String(error.message) : null) || 'Nie udało się usunąć subskrypcji')
    }
  }

  const onSubmit = async (values: FormValues) => {
    try {
      const statusMap: Record<string, string> = {
        aktywna: 'active',
        nieaktywna: 'inactive',
        anulowana: 'cancelled',
      }

      const renewalDate = values.renewalDate ? new Date(values.renewalDate) : new Date()
      const cycle = values.cycle || 'miesięczny'

      let periodStart = new Date(renewalDate)
      let periodEnd = new Date(renewalDate)

      if (cycle === 'miesięczny') {
        periodEnd.setMonth(periodEnd.getMonth() + 1)
      } else if (cycle === 'roczny') {
        periodEnd.setFullYear(periodEnd.getFullYear() + 1)
      }

      const subscriptionData = {
        name: values.name?.trim() || '',
        amount: values.amount || 0,
        currency: userCurrency || 'PLN',
        periodStart: periodStart.toISOString(),
        periodEnd: periodEnd.toISOString(),
        renewalDate: renewalDate.toISOString(),
        provider: 'Manual',
        status: statusMap[values.status || 'aktywna'] || 'active',
        isAutomaticRenewal: true,
        description: values.note?.trim() || '',
        documents: attachments || [],
        category: values.tag || 'inne',
      }

      if (editMode && editingSub) {
        await apiClient.updateSubscription(editingSub.id, subscriptionData)
        toast.success('Zaktualizowano subskrypcję')
      } else {
        await apiClient.createSubscription(subscriptionData)
        toast.success('Dodano subskrypcję')
      }

      const subscriptions = await apiClient.getSubscriptions()
      const mappedData = subscriptions.map((sub: ApiSubscription) => {
        let attachments: Attachment[] = [];
        if (sub.documents) {
          try {
            const parsed = typeof sub.documents === 'string' ? JSON.parse(sub.documents) : sub.documents;
            attachments = Array.isArray(parsed) ? parsed : [];
          } catch {
            attachments = [];
          }
        }
        
        return {
          id: sub.id,
          name: sub.name,
          amount: sub.amount,
          cycle: 'miesięczny', // Default - cycle not in API response
          renewalDate: typeof sub.renewal_date === 'string' ? sub.renewal_date : (sub.renewal_date instanceof Date ? sub.renewal_date.toISOString() : ''),
          status: sub.status || 'aktywna',
          note: sub.description || '',
          attachments,
          tag: sub.category || 'inne',
        } as Subscription;
      })
      setData(mappedData)

      setModalOpen(false)
      setEditingSub(null)
      setAttachments([])
      form.reset()
    } catch (error: unknown) {
      logger.error('Błąd zapisu subskrypcji', error instanceof Error ? error : new Error(String(error)));
      toast.error(error.message || 'Wystąpił błąd podczas zapisywania')
    }
  }

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

  const summary = useMemo(() => {
    // Używamy wszystkich danych (data) dla summary, aby pokazywać całkowite wartości
    // Filtry są używane tylko w tabeli i wykresach
    const allSubscriptions = data || [];
    
    // Używamy wszystkich subskrypcji, nie tylko aktywnych, dla podsumowania
    const subscriptionsToUse = allSubscriptions;
    
    const totalMonthly = subscriptionsToUse
      .filter((sub) => sub.cycle === 'miesięczny' || sub.cycle === 'monthly')
      .reduce((sum, sub) => sum + parseAmount(sub.amount), 0)

    const totalYearly = subscriptionsToUse
      .filter((sub) => sub.cycle === 'roczny' || sub.cycle === 'yearly')
      .reduce((sum, sub) => sum + parseAmount(sub.amount), 0)

    const monthlyFromYearly = totalYearly / 12
    const totalMonthlyWithYearly = totalMonthly + monthlyFromYearly

    const categoryTotals = SUBSCRIPTION_TAGS.reduce((acc, tag) => {
      const categorySubscriptions = subscriptionsToUse.filter((sub) => 
        sub.tag === tag.value || sub.category === tag.value
      )
      const monthlyTotal = categorySubscriptions
        .filter((sub) => sub.cycle === 'miesięczny' || sub.cycle === 'monthly')
        .reduce((sum, sub) => sum + parseAmount(sub.amount), 0)

      const yearlyTotal = categorySubscriptions
        .filter((sub) => sub.cycle === 'roczny' || sub.cycle === 'yearly')
        .reduce((sum, sub) => sum + parseAmount(sub.amount), 0)

      acc[tag.value] = monthlyTotal + yearlyTotal / 12
      return acc
    }, {} as Record<string, number>)

    return {
      totalMonthly,
      totalYearly,
      totalMonthlyWithYearly,
      categoryTotals,
    };
  }, [data])

  const handleResetFilters = () => {
    setFilters({});
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <TableFiltersPanel 
          fields={filterFields} 
          values={filters} 
          onChange={setFilters}
          onReset={handleResetFilters}
        />
        <Button onClick={openAddModal} className="w-full md:w-auto gap-2">
          <Plus className="h-4 w-4" />
          Dodaj subskrypcję
        </Button>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nazwa</TableHead>
              <TableHead>Kwota</TableHead>
              <TableHead>Cykl</TableHead>
              <TableHead>Data odnowienia</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Kategoria</TableHead>
              <TableHead>Notatka</TableHead>
              <TableHead>Załączniki</TableHead>
              <TableHead className="text-right">Akcje</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  Brak subskrypcji
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.name}</TableCell>
                  <TableCell>
                    {formatCurrency(
                      typeof record.amount === 'number' ? record.amount : parseFloat(record.amount) || 0,
                      userCurrency
                    )}
                  </TableCell>
                  <TableCell className="capitalize">{record.cycle}</TableCell>
                  <TableCell>
                    {record.renewalDate ? new Date(record.renewalDate).toLocaleDateString() : '-'}
                  </TableCell>
                  <TableCell className="capitalize">{record.status}</TableCell>
                  <TableCell>
                    {(() => {
                      const tagConfig =
                        SUBSCRIPTION_TAGS.find((t) => t.value === record.tag) ||
                        SUBSCRIPTION_TAGS[SUBSCRIPTION_TAGS.length - 1]
                      return record.tag ? (
                        <Badge variant="secondary" className={tagConfig.color}>
                          {tagConfig.label}
                        </Badge>
                      ) : null
                    })()}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate" title={record.note}>
                    {record.note}
                  </TableCell>
                  <TableCell>
                    {record.attachments && record.attachments.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {record.attachments.map((attachment, index) => (
                          <a
                            key={index}
                            href={attachment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                          >
                            <Paperclip className="h-3 w-3" />
                            {attachment.name}
                          </a>
                        ))}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditModal(record)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Czy na pewno chcesz usunąć tę subskrypcję?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Ta operacja jest nieodwracalna.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Anuluj</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(record.id)}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              Usuń
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suma miesięczna</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(summary.totalMonthlyWithYearly, userCurrency)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Płatności miesięczne</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(summary.totalMonthly, userCurrency)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Płatności roczne</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(summary.totalYearly, userCurrency)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {SUBSCRIPTION_TAGS.map((tag) => (
          <Card key={tag.value}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{tag.label} (miesięcznie)</CardTitle>
              <TagIcon className={cn("h-4 w-4", tag.color.split(' ')[1])} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(summary.categoryTotals[tag.value] || 0, userCurrency)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      {filteredData.length > 0 && (
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Analiza subskrypcji
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Subscriptions by category */}
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Subskrypcje według kategorii</h3>
                {(() => {
                  // Obliczamy kategorie z filteredData
                  const COLORS = [
                    "hsl(var(--chart-1))",
                    "hsl(var(--chart-2))",
                    "hsl(var(--chart-3))",
                    "hsl(var(--chart-4))",
                    "hsl(var(--chart-5))",
                  ];

                  const categoryData = SUBSCRIPTION_TAGS.map((tag, index) => {
                    const categorySubscriptions = filteredData.filter((sub) => sub.tag === tag.value);
                    const monthlyTotal = categorySubscriptions
                      .filter((sub) => sub.cycle === 'miesięczny')
                      .reduce((sum, sub) => sum + (typeof sub.amount === 'number' ? sub.amount : parseFloat(String(sub.amount)) || 0), 0);
                    const yearlyTotal = categorySubscriptions
                      .filter((sub) => sub.cycle === 'roczny')
                      .reduce((sum, sub) => sum + (typeof sub.amount === 'number' ? sub.amount : parseFloat(String(sub.amount)) || 0), 0);
                    return {
                      category: tag.value,
                      categoryLabel: tag.label,
                      total: monthlyTotal + yearlyTotal / 12, // Miesięczny ekwiwalent
                      count: categorySubscriptions.length,
                      fill: COLORS[index % COLORS.length],
                    };
                  }).filter(item => item.total > 0 || item.count > 0);

                  // Tworzymy config z kolorami dla każdej kategorii
                  const categoryConfig = categoryData.reduce((acc, item) => {
                    acc[item.category] = {
                      label: item.categoryLabel,
                      color: item.fill,
                    };
                    return acc;
                  }, {} as Record<string, { label: string; color: string }>);

                  categoryConfig.total = {
                    label: "Koszt miesięczny",
                    color: "hsl(var(--chart-1))",
                  };

                  return categoryData.length > 0 ? (
                    <ChartContainer config={categoryConfig} className="max-h-[300px] w-full">
                      <BarChart data={categoryData} layout="vertical" margin={{ left: 0 }}>
                        <CartesianGrid horizontal={false} />
                        <YAxis 
                          dataKey="category" 
                          type="category" 
                          tickLine={false} 
                          axisLine={false} 
                          width={120} 
                          style={{ fontSize: '12px' }}
                          tickFormatter={(value) => categoryData.find(d => d.category === value)?.categoryLabel || value}
                        />
                        <XAxis type="number" tickLine={false} axisLine={false} style={{ fontSize: '12px' }} />
                        <ChartTooltip 
                          cursor={false} 
                          content={<ChartTooltipContent 
                            hideLabel 
                            formatter={(value: number) => formatCurrency(value, userCurrency)}
                          />} 
                        />
                        <Bar dataKey="total" layout="vertical" radius={5}>
                          <LabelList 
                            dataKey="total" 
                            position="right" 
                            className="fill-foreground font-bold" 
                            fontSize={12} 
                            formatter={(v: number) => formatCurrency(v, userCurrency)}
                          />
                        </Bar>
                      </BarChart>
                    </ChartContainer>
                  ) : (
                    <p className="text-sm text-muted-foreground">Brak danych do wyświetlenia</p>
                  );
                })()}
              </div>

              {/* Subscriptions by category - Pie Chart */}
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Subskrypcje według kategorii</h3>
                {(() => {
                  // Obliczamy kategorie z filteredData
                  const COLORS = [
                    "hsl(var(--chart-1))",
                    "hsl(var(--chart-2))",
                    "hsl(var(--chart-3))",
                    "hsl(var(--chart-4))",
                    "hsl(var(--chart-5))",
                  ];

                  const categoryData = SUBSCRIPTION_TAGS.map((tag, index) => {
                    const categorySubscriptions = filteredData.filter((sub) => sub.tag === tag.value);
                    const monthlyTotal = categorySubscriptions
                      .filter((sub) => sub.cycle === 'miesięczny')
                      .reduce((sum, sub) => sum + parseAmount(sub.amount), 0);
                    const yearlyTotal = categorySubscriptions
                      .filter((sub) => sub.cycle === 'roczny')
                      .reduce((sum, sub) => sum + parseAmount(sub.amount), 0);
                    return {
                      category: tag.value,
                      categoryLabel: tag.label,
                      total: monthlyTotal + yearlyTotal / 12, // Miesięczny ekwiwalent
                      count: categorySubscriptions.length,
                      fill: COLORS[index % COLORS.length],
                    };
                  }).filter(item => item.total > 0 || item.count > 0);

                  // Tworzymy config z kolorami dla każdej kategorii
                  const categoryConfig = categoryData.reduce((acc, item) => {
                    acc[item.category] = {
                      label: item.categoryLabel,
                      color: item.fill,
                    };
                    return acc;
                  }, {} as Record<string, { label: string; color: string }>);

                  categoryConfig.total = {
                    label: "Koszt miesięczny",
                    color: "hsl(var(--chart-1))",
                  };

                  return categoryData.length > 0 ? (
                    <ChartContainer config={categoryConfig} className="mx-auto aspect-square max-h-[300px]">
                      <PieChart>
                        <ChartTooltip 
                          content={<ChartTooltipContent 
                            hideLabel
                            formatter={(value: number) => formatCurrency(value, userCurrency)}
                          />} 
                        />
                        <Pie
                          data={categoryData}
                          dataKey="total"
                          label={(entry: { categoryLabel: string; total: number }) => `${entry.categoryLabel}: ${formatCurrency(entry.total, userCurrency)}`}
                          nameKey="categoryLabel"
                        >
                          {categoryData.map((entry, index) => (
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

            {/* Monthly vs Yearly costs */}
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Koszty miesięczne vs roczne</h3>
              {(() => {
                const monthlySubs = filteredData.filter(s => s.cycle === 'miesięczny');
                const yearlySubs = filteredData.filter(s => s.cycle === 'roczny');

                const monthlyTotal = monthlySubs.reduce((sum, sub) => 
                  sum + (typeof sub.amount === 'number' ? sub.amount : parseFloat(sub.amount as any) || 0), 0
                );
                const yearlyTotal = yearlySubs.reduce((sum, sub) => 
                  sum + (typeof sub.amount === 'number' ? sub.amount : parseFloat(sub.amount as any) || 0), 0
                );

                const chartData = [
                  {
                    type: 'Miesięczne',
                    total: monthlyTotal,
                    count: monthlySubs.length,
                  },
                  {
                    type: 'Roczne',
                    total: yearlyTotal / 12, // Przeliczone na miesięczne
                    count: yearlySubs.length,
                  },
                ];

                const costConfig = {
                  total: {
                    label: "Koszt miesięczny",
                    color: "hsl(var(--chart-1))",
                  },
                  count: {
                    label: "Ilość",
                    color: "hsl(var(--chart-2))",
                  },
                } satisfies ChartConfig;

                return (
                  <ChartContainer config={costConfig} className="max-h-[300px] w-full">
                    <ComposedChart data={chartData}>
                      <CartesianGrid vertical={false} />
                      <XAxis
                        dataKey="type"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                      />
                      <ChartTooltip 
                        cursor={false} 
                        content={<ChartTooltipContent 
                          indicator="dot"
                          formatter={(value: number, name: string) => {
                            if (name === 'total') {
                              return [formatCurrency(value, userCurrency), 'Koszt miesięczny'];
                            }
                            return [value, 'Ilość'];
                          }}
                        />} 
                      />
                      <ChartLegend content={<ChartLegendContent />} />
                      <Bar dataKey="total" fill="var(--color-total)" radius={[4, 4, 0, 0]}>
                        <LabelList 
                          dataKey="total" 
                          position="top" 
                          className="fill-foreground font-bold" 
                          fontSize={12} 
                          formatter={(v: number) => formatCurrency(v, userCurrency)}
                        />
                      </Bar>
                      <Line
                        dataKey="count"
                        type="monotone"
                        stroke="var(--color-count)"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                    </ComposedChart>
                  </ChartContainer>
                );
              })()}
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editMode ? 'Edytuj subskrypcję' : 'Dodaj subskrypcję'}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nazwa</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kwota</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cycle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cykl</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Wybierz cykl" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="miesięczny">Miesięczny</SelectItem>
                        <SelectItem value="roczny">Roczny</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="renewalDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data odnowienia</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Wybierz status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="aktywna">Aktywna</SelectItem>
                        <SelectItem value="nieaktywna">Nieaktywna</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tag"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kategoria</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Wybierz kategorię" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SUBSCRIPTION_TAGS.map((tag) => (
                          <SelectItem key={tag.value} value={tag.value}>
                            {tag.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="note"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notatka</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormItem>
                <FormLabel>Załączniki</FormLabel>
                <UploadField
                  fileList={attachments.map(a => ({ url: a.url, name: a.name, uid: a.uid || a.name }))}
                  onChange={(value) => setAttachments(value.map((f: { name: string; url: string; uid?: string; type?: string }) => ({
                    name: f.name,
                    url: f.url,
                    type: f.type || '',
                    uid: f.uid
                  })))}
                  storageRef={`subscriptions/${editingSub?.id || 'new'}`}
                  multiple
                />
              </FormItem>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                  Anuluj
                </Button>
                <Button type="submit">
                  {editMode ? 'Zapisz zmiany' : 'Dodaj'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Subscriptions