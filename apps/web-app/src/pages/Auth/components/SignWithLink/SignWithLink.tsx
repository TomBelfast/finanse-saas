import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '~/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { userActions } from '@akademiasaas/shared';
import { useQuery } from '~/hooks/useQuery';
import { useAppDispatch } from '~/initializeStore';

interface OwnProps { }

type Props = OwnProps;

const signInSchema = z.object({
  email: z.string().email(),
});

type SignInFormModel = z.infer<typeof signInSchema>;

export const SignWithLink: FunctionComponent<Props> = () => {
  const { t } = useTranslation(['auth', 'common']);
  const dispatch = useAppDispatch();
  const queryParams = useQuery();
  const [isLogging, toggleLogging] = useState<boolean>(false);

  // Initialize from storage or query param
  const defaultEmail = window.localStorage.getItem('emailForSignIn') ??
    queryParams.get('email')?.replace(' ', '+') ??
    '';

  const form = useForm<SignInFormModel>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: defaultEmail,
    },
  });

  const { handleSubmit, watch, setValue } = form;
  const email = watch('email');

  // Sync email from logic/storage to form if needed.
  useEffect(() => {
    if (defaultEmail && defaultEmail !== email) {
      setValue('email', defaultEmail);
    }
  }, [defaultEmail, setValue, email]);


  const handleSubmitLoginForm = useCallback(
    async (values: SignInFormModel) => {
      toggleLogging(true);
      dispatch(
        userActions.loginByEmailLink(
          {
            href: window.location.href,
            email: values.email,
          },
          () => {
            const redirectTo = queryParams.get('redirectTo');
            if (redirectTo) {
              window.location.replace(decodeURIComponent(redirectTo));
            }
            toggleLogging(false);
          },
          (code, errorMessage) => {
            if (!code) {
              toast.error(errorMessage);
              toggleLogging(false);
              return;
            }
            if (
              code === 'auth/expired-action-code' ||
              code === 'auth/invalid-action-code' ||
              code === 'auth/argument-error'
            ) {
              const loginByLinkUrl = new URL('/auth/login-by-link', window.location.origin);
              loginByLinkUrl.searchParams.set('error', code);

              window.location.replace(loginByLinkUrl);
              toggleLogging(false);
              return;
            }

            toast.error(t<string>(`loginByEmail.${code.split('/').join('.')}`));

            if (code === 'auth/invalid-email') {
              window.localStorage.removeItem('emailForSignIn');
              setValue('email', '');
            }

            toggleLogging(false);
          }
        )
      );
    },
    [dispatch, queryParams, t, setValue]
  );

  useEffect(() => {
    if (defaultEmail) {
      (async () => {
        await handleSubmitLoginForm({ email: defaultEmail });
      })();
    }
  }, [defaultEmail, handleSubmitLoginForm]);

  return (
    <div className="flex flex-1 justify-center items-center">
      <div className="min-w-[350px] p-2.5">
        <h4 className="text-xl font-semibold mb-5 pb-5 text-center">
          {t<string>('loginByEmail.title')}
        </h4>

        <Form {...form}>
          <form onSubmit={handleSubmit(handleSubmitLoginForm)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem
                  style={{
                    visibility: defaultEmail ? 'hidden' : 'visible',
                    height: defaultEmail ? 0 : 'auto',
                    marginBottom: defaultEmail ? 0 : 24,
                  }}
                >
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
              disabled={isLogging}
            >
              {isLogging ? 'Signing in...' : t<string>('signIn')}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};
