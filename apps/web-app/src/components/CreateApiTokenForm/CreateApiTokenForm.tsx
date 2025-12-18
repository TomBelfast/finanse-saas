import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Trans, useTranslation } from 'react-i18next';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
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

export const createTokenSchema = z.object({
  name: z.string().min(1, 'Field is required'),
  expiresIn: z.enum(['never', '1d', '7d', '30d', '365d']),
});

export type CreateTokenFormData = z.infer<typeof createTokenSchema>;

interface OwnProps {
  model?: CreateTokenFormData | null;
  onSubmit: (formData: CreateTokenFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

type Props = OwnProps;

function CreateApiTokenForm({ model, onSubmit, onCancel, loading }: Props) {
  const { t } = useTranslation(['settings', 'common']);

  const form = useForm<CreateTokenFormData>({
    resolver: zodResolver(createTokenSchema),
    defaultValues: {
      name: '',
      expiresIn: 'never',
      ...model,
    },
  });

  useEffect(() => {
    if (model) {
      form.reset(model);
    }
  }, [model, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('settings:apiIntegration.name')}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t('settings:apiIntegration.namePlaceholder')}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="expiresIn"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('settings:apiIntegration.expiresIn')}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="never">
                    {t('settings:apiIntegration.indefinitely')}
                  </SelectItem>
                  <SelectItem value="1d">
                    <Trans t={t} i18nKey="settings:apiIntegration:days" count={1} />
                  </SelectItem>
                  <SelectItem value="7d">
                    <Trans t={t} i18nKey="settings:apiIntegration:days" count={7} />
                  </SelectItem>
                  <SelectItem value="30d">
                    <Trans t={t} i18nKey="settings:apiIntegration:days" count={30} />
                  </SelectItem>
                  <SelectItem value="365d">
                    <Trans t={t} i18nKey="settings:apiIntegration:days" count={365} />
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <DialogFooter className="pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            {t('common:button.cancel')}
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('settings:apiIntegration.create')}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

export default CreateApiTokenForm;
