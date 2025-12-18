import React, { FunctionComponent, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AppStore, RequestStatus, userActions } from '@akademiasaas/shared';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useAppDispatch } from '~/initializeStore';
import { Mail } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Separator } from '~/components/ui/separator';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form';

interface OwnProps { }

type Props = OwnProps;

const SetContactEmail: FunctionComponent<Props> = () => {
  const { t } = useTranslation(['settings', 'common']);
  const { updateUserDataStatus, data, details } = useSelector((store: AppStore) => store.user);
  const dispatch = useAppDispatch();

  const formSchema = z.object({
    email: z.string().email({ message: t<string>('common:validationErrors.invalidEmail') }),
  });

  type ContactEmailFormValues = z.infer<typeof formSchema>;

  const form = useForm<ContactEmailFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });

  useEffect(() => {
    if (details) {
      form.reset({
        email: details.contactEmail || details.email || '',
      });
    }
  }, [details, form]);

  const handleContactEmailForm = async (values: ContactEmailFormValues) => {
    if (data) {
      await dispatch(
        userActions.updateUserData({
          uid: data.uid,
          contactEmail: values.email,
        })
      );
      toast.success(t<string>('contactEmail.emailSetSuccess'));
    }
  };

  return (
    <div className="space-y-6 max-w-md mx-auto p-4 bg-card rounded-lg border shadow-sm">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">{t<string>('contactEmail.setEmail')}</h3>
        <Separator />
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleContactEmailForm)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t<string>('contactEmail.email')}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="email@example.com" className="pl-9" {...field} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={updateUserDataStatus === RequestStatus.UPDATING}
          >
            {updateUserDataStatus === RequestStatus.UPDATING && <span className="mr-2 animate-spin">⏳</span>}
            {t<string>('contactEmail.save')}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default SetContactEmail;
