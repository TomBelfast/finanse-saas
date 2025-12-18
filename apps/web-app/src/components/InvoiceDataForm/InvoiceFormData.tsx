import React, { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { ClientInvoiceData, COUNTRIES, getFlagEmoji } from '@akademiasaas/shared';
import sortBy from 'lodash.sortby';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { Button } from '~/components/ui/button';
import { DialogFooter } from '~/components/ui/dialog';
import { Loader2 } from 'lucide-react';

export const invoiceDataSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1, 'Field is required'),
  lastName: z.string().min(1, 'Field is required'),
  companyName: z.string().optional().or(z.literal('')),
  nip: z.string().optional().or(z.literal('')),
  street: z.string().min(1, 'Field is required'),
  postalCode: z.string().min(1, 'Field is required'),
  city: z.string().min(1, 'Field is required'),
  country: z.string().min(1, 'Field is required'),
});

type InvoiceFormData = z.infer<typeof invoiceDataSchema>;

interface OwnProps {
  onSubmit: (formData: ClientInvoiceData) => void;
  model?: Partial<ClientInvoiceData> | null;
  onCancel?: () => void;
  loading?: boolean;
}

type Props = OwnProps;

const InvoiceDataForm: React.FC<Props> = ({
  onSubmit,
  model,
  onCancel,
  loading,
}) => {
  const { t } = useTranslation(['subscription', 'common']);

  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceDataSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      companyName: '',
      nip: '',
      street: '',
      postalCode: '',
      city: '',
      country: 'PL',
      email: '',
      ...model,
    } as any,
  });

  useEffect(() => {
    if (model) {
      form.reset({
        firstName: model.firstName || '',
        lastName: model.lastName || '',
        companyName: model.companyName || '',
        nip: model.nip || '',
        street: model.street || '',
        postalCode: model.postalCode || '',
        city: model.city || '',
        country: model.country || 'PL',
        email: model.email || '',
      });
    }
  }, [model, form]);

  const countriesSorted = useMemo(
    () =>
      sortBy(
        COUNTRIES.map((country) => ({
          ...country,
          label: t<string>(`common:countries.${country.name}`),
        })),
        'label'
      ),
    [t]
  );

  const handleSubmit = (data: InvoiceFormData) => {
    // Cast to ClientInvoiceData as we are confident the form data matches structure
    // or merge with existing model to keep hidden fields if any (though ClientInvoiceData implies these are the fields)
    onSubmit(data as unknown as ClientInvoiceData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('invoice.email')}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>{t('invoice.emailHelp')}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('invoice.firstName')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('invoice.firstNamePlaceholder')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('invoice.lastName')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('invoice.lastNamePlaceholder')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="companyName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('invoice.companyName')}</FormLabel>
              <FormControl>
                <Input placeholder={t('invoice.companyNamePlaceholder')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="nip"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('invoice.nip.name')}</FormLabel>
              <FormControl>
                <Input placeholder={t('invoice.nip.placeholder')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="street"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('invoice.street')}</FormLabel>
              <FormControl>
                <Input placeholder={t('invoice.streetPlaceholder')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="postalCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('invoice.postalCode')}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('invoice.city')}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="country"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('invoice.country')}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {countriesSorted.map((country) => (
                    <SelectItem key={country.isoCode} value={country.isoCode}>
                      <span className="flex items-center gap-2">
                        <span>{getFlagEmoji(country.isoCode)}</span>
                        <span>{country.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <DialogFooter className="pt-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
              {t('common:button.cancel')}
            </Button>
          )}
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('common:button.save')}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default InvoiceDataForm;
