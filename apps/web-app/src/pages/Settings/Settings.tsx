import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { integrationApiTokensActions, RequestStatus, AppStore } from '@akademiasaas/shared';
import SetPasswordForm from '~/components/SetPasswordForm/SetPasswordForm';
import SetContactEmail from '~/components/SetContactEmail/SetContactEmail';
import CurrencySettings from '~/components/CurrencySettings/CurrencySettings';
import AdditionalIntegrations from '~/pages/Settings/AdditionalIntegrations/AdditionalIntegrations';
import { useAppDispatch, useAppSelector } from '~/initializeStore';
import { useLocation, useHistory, useParams } from 'react-router-dom';

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "~/components/ui/tabs"
import { Card, CardContent } from "~/components/ui/card"

interface OwnProps { }

type Props = OwnProps;

const Settings: FunctionComponent<Props> = () => {
  const { t } = useTranslation('settings');
  const location = useLocation();
  const history = useHistory();
  const { tab } = useParams<{ tab: string }>();

  const dispatch = useAppDispatch();
  const status = useAppSelector((store: AppStore) => store.integrationApiTokens.status);

  useEffect(() => {
    // TODO: Replace Firebase subscription with API polling or WebSocket
    // Temporarily disabled to avoid Firebase errors
    // dispatch(integrationApiTokensActions.subscribeToApiTokens());
  }, [dispatch]);

  const handleTabChange = useCallback(
    (key: string) => {
      // Preserve query params if needed, or clear them. 
      // Original code preserved search, but here we just push path.
      // If preserving search is needed: history.push({ pathname: `/settings/${key}`, search: location.search });
      history.push(`/settings/${key}`);
    },
    [history]
  );

  // Determine active tab or default to 'integrations'
  // If params.tab is missing or purely optional, we handle redirect or defaults.
  // The original code had a useEffect redirecting if !tab or tab includes ':'. 
  // We can replicate logic or simplify.

  const activeTab = tab || 'integrations';

  useEffect(() => {
    if (!tab) {
      history.replace('/settings/integrations');
    }
  }, [tab, history]);


  return (
    <div className="space-y-6 container mx-auto pb-10">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold tracking-tight">{t<string>('title')}</h2>
      </div>

      {/* Loading state could be handled with Skeleton, but Card with loading prop isn't standard in Shadcn. 
          We can just render content. */}

      <Tabs value={activeTab} onValueChange={handleTabChange} orientation="vertical" className="h-full space-y-6">
        <div className="flex flex-col md:flex-row gap-6">
          <aside className="md:w-1/4">
            <TabsList className="flex flex-col h-auto items-stretch bg-transparent p-0 gap-2 text-muted-foreground w-full">
              <TabsTrigger
                value="integrations"
                className="justify-start px-4 py-2 data-[state=active]:bg-secondary data-[state=active]:text-foreground shadow-none border-l-2 border-transparent data-[state=active]:border-primary rounded-none transition-all hover:text-foreground"
              >
                {t<string>('additionalIntegrations.title')}
              </TabsTrigger>
              <TabsTrigger
                value="account"
                className="justify-start px-4 py-2 data-[state=active]:bg-secondary data-[state=active]:text-foreground shadow-none border-l-2 border-transparent data-[state=active]:border-primary rounded-none transition-all hover:text-foreground"
              >
                {t<string>('account.title')}
              </TabsTrigger>
              <TabsTrigger
                value="currency"
                className="justify-start px-4 py-2 data-[state=active]:bg-secondary data-[state=active]:text-foreground shadow-none border-l-2 border-transparent data-[state=active]:border-primary rounded-none transition-all hover:text-foreground"
              >
                {t<string>('currency.title')}
              </TabsTrigger>
            </TabsList>
          </aside>
          <div className="flex-1 max-w-4xl">
            <TabsContent value="integrations" className="m-0 space-y-4">
              <AdditionalIntegrations />
            </TabsContent>
            <TabsContent value="account" className="m-0 space-y-4">
              <SetContactEmail />
              <SetPasswordForm />
            </TabsContent>
            <TabsContent value="currency" className="m-0 space-y-4">
              <CurrencySettings />
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  );
};

export default Settings;
