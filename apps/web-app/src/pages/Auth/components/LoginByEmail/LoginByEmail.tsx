import React, { FunctionComponent, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '~/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { Trans, useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Link, useHistory } from 'react-router-dom';
import { AppStore, userActions, UserStatus } from '@akademiasaas/shared';
import { useAppDispatch } from '~/initializeStore';
import { Loader2, CheckCircle2 } from 'lucide-react';

interface OwnProps { }

type Props = OwnProps;

const loginByEmailSchema = z.object({
  email: z.string().email(),
});

type LoginFormModel = z.infer<typeof loginByEmailSchema>;

const LoginByEmail: FunctionComponent<Props> = () => {
  const { i18n, t } = useTranslation(['auth', 'common']);
  const dispatch = useAppDispatch();
  const [loading, toggleLoader] = useState(false);
  const [showSuccess, toggleSuccess] = useState(false);
  const { status: userStatus, error } = useSelector((store: AppStore) => store.user);

  const queryParams = new URLSearchParams(window.location.search);
  const emailInQuery = queryParams.get('email')?.replace(' ', '+') ?? '';
  const errorInQuery = queryParams.get('error') ?? null;
  const history = useHistory();

  const form = useForm<LoginFormModel>({
    resolver: zodResolver(loginByEmailSchema),
    defaultValues: {
      email: emailInQuery,
    },
  });

  const { handleSubmit, setValue } = form;

  useEffect(() => {
    if (errorInQuery) {
      dispatch(userActions.logInFailed(errorInQuery));
      const search = new URLSearchParams(window.location.search);
      search.delete('error');
      history.replace({
        search: search.toString(),
      });
    } else {
      dispatch(userActions.resetErrors());
    }
  }, [dispatch, history, errorInQuery]);

  useEffect(() => {
    if (emailInQuery) {
      // Small timeout to not conflict with render? original code had it.
      setTimeout(() => {
        history.replace({
          search: '',
        });
      }, 0);
      setValue('email', emailInQuery);
    }
  }, [emailInQuery, history, setValue]);

  const onFinish = async (values: LoginFormModel) => {
    const validatedEmail = values.email.trim();
    toggleLoader(true);
    await dispatch(
      userActions.sendLoginLink(
        validatedEmail,
        `${window.location.origin}/auth/sign-with-link`,
        i18n.language
      )
    );
    window.localStorage.setItem('emailForSignIn', validatedEmail ?? '');
    toggleLoader(false);
    toggleSuccess(true);
  };

  return (
    <div className="flex flex-1 justify-center items-center">
      <div className="min-w-[350px] p-2.5">
        {showSuccess ? (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
            </div>
            <h3 className="text-lg font-medium">{t<string>('auth:sendLink.successTitle')}</h3>
            <p className="text-muted-foreground">{t<string>('auth:sendLink.successMessage')}</p>
            <div className="pt-4">
              <Link to="/" className="text-primary hover:underline">{t<string>('common:goToLoginPage')}</Link>
            </div>
          </div>
        ) : (
          <>
            <h4 className="text-xl font-semibold mb-5 pb-5 text-center">
              {t<string>('loginByEmailPanel')}
            </h4>

            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {userStatus === UserStatus.HAS_ERROR ? (
                    t<string>(`common:firebaseAuthErrors.${error}`)
                  ) : (
                    <Trans t={t} i18nKey="common:startJourney" />
                  )}
                </AlertDescription>
              </Alert>
            )}

            <Form {...form}>
              <form onSubmit={handleSubmit(onFinish)} className="space-y-6">
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
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t<string>('common:button.sendLink')}
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

export default LoginByEmail;
