import React, { FunctionComponent, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { logger } from '~/utils/logger';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { Button } from '~/components/ui/button';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { AppStore, Currency, userActions } from '@akademiasaas/shared';
import { useAppDispatch } from '~/initializeStore';
import { apiClient } from '~/services/apiClient';
import { Globe, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface OwnProps { }

type Props = OwnProps;

const CURRENCIES: Currency[] = ['pln', 'eur', 'usd', 'gbp'];

const currencySchema = z.object({
  defaultCurrency: z.enum(['pln', 'eur', 'usd', 'gbp'] as [string, ...string[]]),
});

type CurrencyFormValues = z.infer<typeof currencySchema>;

const CurrencySettings: FunctionComponent<Props> = () => {
  const { t } = useTranslation('settings');
  const dispatch = useAppDispatch();
  const userDetails = useSelector((store: AppStore) => store.user.details);
  const [loading, setLoading] = useState(false);

  const form = useForm<CurrencyFormValues>({
    resolver: zodResolver(currencySchema),
    defaultValues: {
      defaultCurrency: (userDetails?.defaultCurrency as any) || 'pln',
    },
  });

  useEffect(() => {
    if (userDetails?.defaultCurrency) {
      form.setValue('defaultCurrency', userDetails.defaultCurrency as any);
    }
  }, [userDetails, form]);

  const handleSave = async (values: CurrencyFormValues) => {
    if (!userDetails) return;

    setLoading(true);
    try {
      // Update user via API (API expects uppercase)
      await apiClient.updateUser({
        defaultCurrency: values.defaultCurrency.toUpperCase() as 'PLN' | 'EUR' | 'USD' | 'GBP'
      });
      
      // Refresh user details in Redux store to get updated currency
      await dispatch(userActions.getUserDetailsFromAPI(userDetails.uid, apiClient));
      
      toast.success(t('currency.saveSuccess'));
    } catch (error) {
      logger.error('Error updating currency', error instanceof Error ? error : new Error(String(error)), { currency: form.getValues('defaultCurrency') });
      toast.error(t('currency.saveError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          {t('currency.title')}
        </CardTitle>
        <CardDescription>
          {t('currency.defaultCurrencyDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6">
            <FormField
              control={form.control}
              name="defaultCurrency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('currency.defaultCurrency')}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CURRENCIES.map((currency) => (
                        <SelectItem key={currency} value={currency}>
                          {t(`currency.currencies.${currency}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('currency.save')}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default CurrencySettings; 