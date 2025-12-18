import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import {
  User,
  Clock,
  DollarSign,
  FileText,
  TrendingUp,
  TrendingDown,
  ArrowRight
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

interface ActivityItem {
  id: string;
  user: string;
  action: string;
  time: string;
  type: 'success' | 'warning' | 'error' | 'info';
}

const Home: React.FC = () => {
  const { t } = useTranslation(['dashboard', 'common']);
  const [activityData, setActivityData] = useState<ActivityItem[]>([]);

  useEffect(() => {
    const mockActivity: ActivityItem[] = [
      {
        id: '1',
        user: 'John Doe',
        action: 'Created a new report',
        time: '2 minutes ago',
        type: 'success',
      },
      {
        id: '2',
        user: 'Jane Smith',
        action: 'Updated user profile',
        time: '10 minutes ago',
        type: 'info',
      },
      {
        id: '3',
        user: 'Robert Brown',
        action: 'Subscription payment failed',
        time: '1 hour ago',
        type: 'error',
      },
      {
        id: '4',
        user: 'Sarah Williams',
        action: 'Invited new team member',
        time: '3 hours ago',
        type: 'info',
      },
      {
        id: '5',
        user: 'Thomas Wilson',
        action: 'Completed onboarding',
        time: '5 hours ago',
        type: 'success',
      },
    ];
    setActivityData(mockActivity);
  }, []);

  const getBadgeVariant = (type: ActivityItem['type']) => {
    switch (type) {
      case 'success': return 'default'; // Greenish usually or default primary
      case 'error': return 'destructive';
      case 'warning': return 'secondary'; // Or specific warning style
      case 'info': return 'outline';
      default: return 'outline';
    }
  };

  // Custom badge styling to match previous colors roughly if needed, or use specific shadcn variants
  const getBadgeClass = (type: ActivityItem['type']) => {
    switch (type) {
      case 'success': return 'bg-green-100 text-green-800 hover:bg-green-200 border-none';
      case 'error': return 'bg-red-100 text-red-800 hover:bg-red-200 border-none';
      case 'warning': return 'bg-orange-100 text-orange-800 hover:bg-orange-200 border-none';
      case 'info': return 'bg-blue-100 text-blue-800 hover:bg-blue-200 border-none';
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-200 border-none';
    }
  }

  return (
    <div className="space-y-8 container mx-auto pb-10">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">{t('dashboard:home.welcomeMessage')}</h2>
        <p className="text-muted-foreground">{t('dashboard:home.dashboardOverview')}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dashboard:home.stats.totalUsers')}
            </CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">128</div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              12% {t('dashboard:home.stats.fromLastMonth')}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dashboard:home.stats.activeSubscriptions')}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98</div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              5% {t('dashboard:home.stats.fromLastMonth')}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dashboard:home.stats.documentsCreated')}
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">256</div>
            <div className="flex items-center text-xs text-blue-600 mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              25% {t('dashboard:home.stats.fromLastMonth')}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dashboard:home.stats.averageSessionTime')}
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15:42</div>
            <div className="flex items-center text-xs text-red-600 mt-1">
              <TrendingDown className="h-3 w-3 mr-1" />
              3% {t('dashboard:home.stats.fromLastMonth')}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 lg:col-span-5">
          <CardHeader>
            <CardTitle>{t('dashboard:home.recentActivity')}</CardTitle>
            <CardDescription>
              {t('dashboard:home.recentActivityDescription') || "Latest actions performed by users"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {activityData.map((item) => (
                <div key={item.id} className="flex items-start md:items-center space-x-4">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                  </Avatar>
                  <div className="space-y-1 flex-1">
                    <p className="text-sm font-medium leading-none">{item.user}</p>
                    <p className="text-sm text-muted-foreground">{item.action}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge className={getBadgeClass(item.type)} variant="outline">
                      {t(`common:${item.type}`)}
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {item.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-4 lg:col-span-2">
          <CardHeader>
            <CardTitle>{t('dashboard:home.quickActions')}</CardTitle>
            <CardDescription>
              Shortcuts for common tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {[
                { title: t('dashboard:home.actions.addNewUser'), link: '/users/new' },
                { title: t('dashboard:home.actions.createReport'), link: '/reports/new' },
                { title: t('dashboard:home.actions.manageSubscription'), link: '/subscription' },
                { title: t('dashboard:home.actions.updateProfile'), link: '/settings/profile' },
              ].map((action, i) => (
                <Link
                  key={i}
                  to={action.link}
                  className="flex w-full items-center justify-between rounded-md border p-4 hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <span className="text-sm font-medium">{action.title}</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Home;
