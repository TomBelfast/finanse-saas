import React, { FunctionComponent, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '~/components/ui/button';
import { Separator } from '~/components/ui/separator';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { userActions } from '@akademiasaas/shared';
import { useAppDispatch } from '~/initializeStore';
import { CheckCircle2 } from 'lucide-react';

interface OwnProps { }

type Props = OwnProps;

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

type ForgotPasswordFormModel = z.infer<typeof forgotPasswordSchema>;

export const ForgotPassword: FunctionComponent<Props> = () => {
  const { t } = useTranslation(['auth', 'common']);
  const [loading, toggleLoader] = useState(false);
  const [success, toggleSuccess] = useState(false);
  const { email: defaultEmail } = useParams<{ email?: string }>();
  const dispatch = useAppDispatch();

  const form = useForm<ForgotPasswordFormModel>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: defaultEmail || '',
    },
  });

  const { handleSubmit, reset } = form;

  const handleSubmitLoginForm = async ({ email }: ForgotPasswordFormModel) => {
    toggleLoader(true);
    await dispatch(userActions.sendPasswordResetEmail(email, window.location.origin));

    reset({ email: '' });
    toggleLoader(false);
    toggleSuccess(true);
  };

  return (
    <div className="flex flex-1 justify-center items-center">
      <div className="min-w-[350px] p-2.5">
        {success ? (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
            </div>
            <h3 className="text-lg font-medium">{t<string>('auth:forgotPassword.successTitle')}</h3>
            <p className="text-muted-foreground">{t<string>('auth:forgotPassword.successMessage')}</p>
            <div className="pt-4">
              <Link to="/" className="text-primary hover:underline">{t<string>('common:goToLoginPage')}</Link>
            </div>
          </div>
        ) : (
          <>
            <h4 className="text-xl font-semibold mb-5 pb-5 text-center">
              {t<string>('resetPassword.title')}
            </h4>
            <Form {...form}>
              <form onSubmit={handleSubmit(handleSubmitLoginForm)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t<string>('login')}</FormLabel>
                      <FormControl>
                        <Input placeholder="email@example.com" autoFocus {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : t<string>('reset')}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      {t<string>('common:or')}
                    </span>
                  </div>
                </div>

                <div className="flex justify-center items-center space-x-2 text-sm">
                  <Link to="/auth/login" className="text-primary hover:underline">
                    {t<string>('common:button.loginWithPassword')}
                  </Link>
                  <span className="text-muted-foreground">-</span>
                  <h4 className="font-medium">{t<string>('registerClaim')}</h4>
                </div>
              </form>
            </Form>
          </>
        )}
      </div>
    </div>
  );
};
