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
import { TFunction, useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { AppStore, RequestStatus, userActions } from '@akademiasaas/shared';
import { useHistory } from 'react-router-dom';
import { useQuery } from '~/hooks/useQuery';
import { useAppDispatch } from '~/initializeStore';
import { Loader2 } from 'lucide-react';

interface OwnProps {
  actionCode: string;
  continueUrl: string | null;
}

type Props = OwnProps;

const resetPasswordSchema = z.object({
  password: z.string().min(8),
  passwordConfirmation: z.string().min(8),
}).refine((data) => data.password === data.passwordConfirmation, {
  message: "Passwords must match",
  path: ["passwordConfirmation"],
});

type ChangePasswordModel = z.infer<typeof resetPasswordSchema>;

export const ResetPassword: FunctionComponent<Props> = ({ continueUrl }) => {
  const { t } = useTranslation(['auth', 'common']);
  const [status, setStatus] = useState<null | {
    type: 'error' | 'info';
    textKey: string;
  }>(null);
  const { passwordStatus } = useSelector((store: AppStore) => store.user);
  const dispatch = useAppDispatch();
  const [redirectDelay, setRedirectDelay] = useState<number>(5);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const history = useHistory();
  const query = useQuery();
  const code = query.get('code');

  const handleSubmitPasswordChangeForm = async ({ password }: ChangePasswordModel) => {
    dispatch(
      userActions.resetUserPassword({
        resetPasswordCode: code || '',
        password,
      })
    );
  };

  useEffect(() => {
    if (passwordStatus === RequestStatus.SUCCESS) {
      setStatus({ type: 'info', textKey: 'resetPassword.success' });
      setRedirectUrl(continueUrl || '/auth/login');
    }
    if (passwordStatus === RequestStatus.FAILED) {
      setStatus({ type: 'error', textKey: 'resetPassword.error' });
      setRedirectUrl('/auth/forgot-password');
    }
  }, [t, continueUrl, passwordStatus]);

  useEffect(() => {
    if (!redirectUrl) {
      return;
    }

    if (redirectDelay > 0) {
      const timer = setTimeout(() => {
        setRedirectDelay(redirectDelay - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }

    if (redirectDelay === 0) {
      history.push(redirectUrl);
    }
  }, [t, history, redirectDelay, redirectUrl]);

  return (
    <div className="flex flex-1 justify-center items-center">
      <div className="min-w-[350px] p-2.5">
        <h4 className="text-xl font-semibold mb-5 pb-5 text-center">
          {t<string>('resetPassword.title')}
        </h4>
        {status && (
          <div className="space-y-4 text-center">
            <Alert variant={status.type === 'error' ? "destructive" : "default"}>
              <AlertTitle>{status.type === 'error' ? 'Error' : 'Success'}</AlertTitle>
              <AlertDescription>
                {t(status.textKey)}
              </AlertDescription>
            </Alert>
            {redirectUrl && (
              <Button variant="link" onClick={() => history.push(redirectUrl)}>
                {t<string>('common:redirecting', { seconds: redirectDelay })}
              </Button>
            )}
          </div>
        )}
        {!status && (
          <ResetPasswordForm
            t={t}
            status={passwordStatus}
            handleSubmitPasswordChangeForm={handleSubmitPasswordChangeForm}
          />
        )}
      </div>
    </div>
  );
};

interface ResetPasswordFormProps {
  t: TFunction<string[]>;
  status: RequestStatus | null;
  handleSubmitPasswordChangeForm: (values: ChangePasswordModel) => void;
}

const ResetPasswordForm: FunctionComponent<ResetPasswordFormProps> = ({
  t,
  status,
  handleSubmitPasswordChangeForm,
}) => {
  const form = useForm<ChangePasswordModel>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      passwordConfirmation: '',
    },
  });

  const { handleSubmit } = form;

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(handleSubmitPasswordChangeForm)} className="space-y-6">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t<string>('password')}</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="passwordConfirmation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t<string>('passwordConfirmation')}</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={status === RequestStatus.UPDATING}
        >
          {status === RequestStatus.UPDATING && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {t<string>('reset')}
        </Button>
      </form>
    </Form>
  );
};
