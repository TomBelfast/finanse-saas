import React, { FunctionComponent } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AppStore, RequestStatus, userActions } from '@akademiasaas/shared';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useAppDispatch } from '~/initializeStore';
import { Lock } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Separator } from '~/components/ui/separator';
import { Alert, AlertDescription } from '~/components/ui/alert';
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

const SetPasswordForm: FunctionComponent<Props> = () => {
  const { i18n, t } = useTranslation(['auth', 'common']);
  const { passwordStatus, error, details } = useSelector((store: AppStore) => store.user);
  const dispatch = useAppDispatch();

  // Define Zod schema dynamically to use translations if needed, 
  // but for simplicity keeping messages simple or using errorMap if strict translation needed.
  // Using t() inside schema definition requires it to be inside hook or memoized.
  const formSchema = z.object({
    oldPassword: z.string().optional(),
    password: z.string().min(8, { message: t<string>('common:validationErrors.minLength', { number: 8 }) }),
    passwordConfirmation: z.string().min(8, { message: t<string>('common:validationErrors.minLength', { number: 8 }) }),
  }).refine((data) => data.password === data.passwordConfirmation, {
    message: t<string>('common:validationErrors.passwordNotMatch'),
    path: ["passwordConfirmation"],
  }).refine((data) => {
    if (!details?.onboarding?.loginOnlyByLink && !data.oldPassword) {
      return false;
    }
    return true;
  }, {
    message: t<string>('common:validationErrors.fieldIsRequired'),
    path: ["oldPassword"]
  });

  type PasswordSetFormValues = z.infer<typeof formSchema>;

  const form = useForm<PasswordSetFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      oldPassword: '',
      password: '',
      passwordConfirmation: '',
    },
  });

  const handleSetPasswordForm = async (values: PasswordSetFormValues) => {
    await dispatch(
      userActions.setUserPassword(
        {
          password: values.password,
          oldPassword: values.oldPassword,
        },
        () => {
          toast.success(t<string>('passwordChangeSuccess'));
          form.reset();
        }
      )
    );
  };

  const sendNewLink = async () => {
    if (details) {
      window.localStorage.setItem('emailForSignIn', details.email);
      await dispatch(
        userActions.sendLoginLink(
          details.email,
          `${window.location.origin}/auth/sign-with-link`,
          i18n.language
        )
      );
      toast.success(t<string>('checkYourEmail'));
      setTimeout(() => {
        dispatch(userActions.logOutUser());
      }, 700);
      dispatch(userActions.resetErrors());
    }
  };

  const renderAlertAction = () => {
    if (error === 'auth/requires-recent-login') {
      return (
        <Button variant="outline" size="sm" onClick={sendNewLink} className="mt-2">
          {t<string>('sendNewLoginLink')}
        </Button>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 max-w-md mx-auto p-4 bg-card rounded-lg border shadow-sm">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">
          {details?.onboarding?.loginOnlyByLink
            ? t<string>('loginByEmail.setPassword')
            : t<string>('loginByEmail.changePassword')}
        </h3>
        <Separator />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>
            {t<string>(`passwordErrors.${error}`)}
            {renderAlertAction()}
          </AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSetPasswordForm)} className="space-y-4">
          {!details?.onboarding?.loginOnlyByLink && (
            <FormField
              control={form.control}
              name="oldPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t<string>('oldPassword')}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input type="password" className="pl-9" placeholder={t<string>('oldPassword')} {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t<string>('password')}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input type="password" className="pl-9" placeholder={t<string>('password')} {...field} />
                  </div>
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
                  <div className="relative">
                    <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input type="password" className="pl-9" placeholder={t<string>('passwordConfirmation')} {...field} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={passwordStatus === RequestStatus.UPDATING}
          >
            {passwordStatus === RequestStatus.UPDATING && <span className="mr-2 animate-spin">⏳</span>}
            {t<string>('common:button.confirm')}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default SetPasswordForm;
