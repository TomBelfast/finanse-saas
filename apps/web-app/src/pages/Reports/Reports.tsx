"use client"

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { addDays, format } from 'date-fns';
import { DateRange } from "react-day-picker";
import { AppStore, Currency } from '@akademiasaas/shared';
import { logger } from '~/utils/logger';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "~/components/ui/tabs"
import { Button } from "~/components/ui/button"
import { Calendar } from "~/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover"
import { Card, CardContent } from "~/components/ui/card"
import {
  Download,
  Calendar as CalendarIcon,
  BarChart3,
  DollarSign,
} from "lucide-react"
import { cn } from "~/lib/utils"

// Hooks
import { useReportsData } from './hooks/useReportsData';
import { useReportsCalculations } from './hooks/useReportsCalculations';

// Components
import { ReportsSummaryCards } from './components/ReportsSummaryCards';
import { ReportsOverviewTab } from './components/ReportsOverviewTab';
import { ReportsLoansTab } from './components/ReportsLoansTab';
import { ReportsFinancesTab } from './components/ReportsFinancesTab';
import { ReportsInsurancesTab } from './components/ReportsInsurancesTab';
import { ReportsAITab } from './components/ReportsAITab';

const Reports: React.FC = () => {
  const { t } = useTranslation(['dashboard', 'common']);
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 7),
  });

  const userDetails = useSelector((store: AppStore) => store.user.details);
  const userCurrency = (userDetails?.defaultCurrency || 'pln') as Currency;

  // Data fetching
  const { loans, subscriptions, insurances, ai, loading } = useReportsData();

  // Calculations
  const {
    totals,
    categoryChartData,
    barChartData,
    activeLoansData,
    currencyFormatter,
    parseAmount,
  } = useReportsCalculations({
    loans,
    subscriptions,
    insurances,
    ai,
    userCurrency,
  });

  const handleDownloadReport = () => {
    logger.info('Downloading report', { dateRange: date });
  };

  return (
    <div className="container mx-auto space-y-8 p-4 md:p-6 pb-12 stagger-children">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 animate-fade-in-up">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Analytics & Reports
          </h2>
          <p className="text-muted-foreground mt-1">View detailed analytics and generate reports.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-[260px] justify-start text-left font-normal shadow-sm hover:shadow-md transition-shadow",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "LLL dd, y")} -{" "}
                      {format(date.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(date.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
          <Button onClick={handleDownloadReport} className="gap-2 shadow-sm hover:shadow-md transition-shadow">
            <Download className="h-4 w-4" />
            Download
          </Button>
        </div>
      </div>

      {/* Key metrics */}
      <ReportsSummaryCards
        totals={totals}
        loading={loading}
        userCurrency={userCurrency}
      />

      <Card className="col-span-4 shadow-md border-border/40 overflow-hidden animate-fade-in-up">
        <CardContent className="p-0">
          <Tabs defaultValue="overview" className="space-y-0">
            <div className="bg-muted/30 p-2 border-b border-border/50 overflow-x-auto no-scrollbar">
              <TabsList className="bg-transparent gap-1">
                <TabsTrigger value="overview" className="flex items-center gap-2 px-4 py-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  <BarChart3 className="h-4 w-4" /> Przegląd
                </TabsTrigger>
                <TabsTrigger value="loans" className="flex items-center gap-2 px-4 py-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  <DollarSign className="h-4 w-4 text-primary" /> Kredyty
                </TabsTrigger>
                <TabsTrigger value="finances" className="flex items-center gap-2 px-4 py-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  <DollarSign className="h-4 w-4 text-blue-500" /> Finanse
                </TabsTrigger>
                <TabsTrigger value="insurances" className="flex items-center gap-2 px-4 py-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  <DollarSign className="h-4 w-4 text-emerald-500" /> Ubezpieczenia
                </TabsTrigger>
                <TabsTrigger value="ai" className="flex items-center gap-2 px-4 py-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  <DollarSign className="h-4 w-4 text-purple-500" /> AI
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6 pt-2">
              <TabsContent value="overview" className="space-y-4">
                <ReportsOverviewTab
                  totals={totals}
                  categoryChartData={categoryChartData}
                  barChartData={barChartData}
                  loans={loans}
                  subscriptions={subscriptions}
                  insurances={insurances}
                  ai={ai}
                  userCurrency={userCurrency}
                  currencyFormatter={currencyFormatter}
                />
              </TabsContent>

              <TabsContent value="loans" className="space-y-4">
                <ReportsLoansTab
                  activeLoansData={activeLoansData}
                  currencyFormatter={currencyFormatter}
                />
              </TabsContent>

              <TabsContent value="finances" className="space-y-4">
                <ReportsFinancesTab
                  subscriptions={subscriptions}
                  userCurrency={userCurrency}
                  parseAmount={parseAmount}
                />
              </TabsContent>

              <TabsContent value="insurances" className="space-y-4">
                <ReportsInsurancesTab
                  insurances={insurances}
                  userCurrency={userCurrency}
                  parseAmount={parseAmount}
                />
              </TabsContent>

              <TabsContent value="ai" className="space-y-4">
                <ReportsAITab
                  ai={ai}
                  userCurrency={userCurrency}
                  parseAmount={parseAmount}
                />
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
