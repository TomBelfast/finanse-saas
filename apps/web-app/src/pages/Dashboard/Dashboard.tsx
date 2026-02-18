import React, { useState, lazy, Suspense } from 'react';
import { Route, RouteComponentProps, Switch } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';

import { AppStore, getUserInitial } from '@akademiasaas/shared';
import { SidebarProvider, SidebarInset } from '~/components/ui/sidebar';
import { AppSidebar } from '~/components/app-sidebar';
import { SiteHeader } from '~/components/site-header';
import { ThemeToggleCompact } from '~/components/ui/theme-toggle';
import ProfileDrawer from './ProfileDrawer/ProfileDrawer';
import FullPageLoader from '~/components/FullPageLoader/FullPageLoader';

const Loans = lazy(() => import('~/pages/Loans/Loans'));
const Subscriptions = lazy(() => import('~/pages/Subscriptions/Subscriptions'));
const Insurances = lazy(() => import('~/pages/Insurances/Insurances'));
const AI = lazy(() => import('~/pages/AI/AI'));
const Reports = lazy(() => import('~/pages/Reports/Reports'));
const Settings = lazy(() => import('~/pages/Settings/Settings'));
const Finished = lazy(() => import('~/pages/Finished/Finished'));

// Import styli lokalnych jeśli potrzebne, ale shadcn używa tailwind.
// Zostawiam proste styles inline/tailwind.

const Dashboard: React.FC<React.PropsWithChildren<RouteComponentProps>> = ({ children }) => {
  const { t } = useTranslation('dashboard');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { details } = useSelector((store: AppStore) => store.user);

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "18rem", // Adjusted to rem or explicit value, or use user's calc
          "--header-height": "4rem",
        } as React.CSSProperties
      }
    >
      <AppSidebar />
      <SidebarInset>
        <SiteHeader>
          <ThemeToggleCompact />

          <div
            onClick={toggleDrawer}
            className="flex items-center gap-2 cursor-pointer ml-2 hover:bg-accent hover:text-accent-foreground p-1 rounded-md transition-colors"
            role="button"
            tabIndex={0}
          >
            <div className="hidden md:flex flex-col items-end text-sm mr-1">
              <span className="font-semibold leading-none">{details?.firstName} {details?.lastName}</span>
              <span className="text-xs text-gray-500">Kursant</span>
            </div>
            <Avatar className="cursor-pointer">
              <AvatarImage src={(Array.isArray(details?.avatarUrl) ? details?.avatarUrl[0] : details?.avatarUrl) || undefined} />
              <AvatarFallback>{getUserInitial(`${details?.firstName} ${details?.lastName}`)}</AvatarFallback>
            </Avatar>
          </div>
        </SiteHeader>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min mt-4">
            <Suspense fallback={<FullPageLoader />}>
              <Switch>
                <Route exact path="/" component={Subscriptions} />
                <Route path="/loans" component={Loans} />
                <Route path="/finances" component={Subscriptions} />
                <Route path="/insurances" component={Insurances} />
                <Route path="/ai" component={AI} />
                <Route path="/reports" component={Reports} />
                <Route path="/settings/:tab?" component={Settings} />
                <Route path="/finished" component={Finished} />
                {children}
              </Switch>
            </Suspense>
          </div>
        </div>

        <ProfileDrawer isOpen={isDrawerOpen} toggleDrawer={toggleDrawer} />
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Dashboard;