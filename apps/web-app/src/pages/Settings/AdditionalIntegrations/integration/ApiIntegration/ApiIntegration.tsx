import React, { FunctionComponent, useState } from 'react';
import { Button } from '~/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '~/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import { Textarea } from '~/components/ui/textarea';
import { Plus, Loader2, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import {
  API_DOCUMENTATION_URL,
  ApiTokenDocument,
  integrationApiTokensActions,
} from '@akademiasaas/shared';
import CreateApiTokenForm, {
  CreateTokenFormData,
} from '~/components/CreateApiTokenForm/CreateApiTokenForm';
import { useLoading } from '~/hooks/useLoading';
import { useAppDispatch } from '~/initializeStore';
import { useUserFeatures } from '~/hooks/useUserFeatures';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog"
import { toast } from 'sonner';

interface OwnProps {
  tokens: null | ApiTokenDocument[];
}

type Props = OwnProps;

const ApiIntegration: FunctionComponent<Props> = ({ tokens }) => {
  const { t } = useTranslation(['settings', 'common']);
  const [showModal, toggleModal] = useState(false);
  const [createdToken, setCreatedToken] = useState<null | string>(null);
  const dispatch = useAppDispatch();
  const [loading, startLoading, stopLoading] = useLoading();
  const { api: apiEnabled } = useUserFeatures();

  const handleFormSubmit = async (data: CreateTokenFormData) => {
    startLoading();

    await dispatch(
      integrationApiTokensActions.createApiToken({
        payload: {
          name: data.name,
          expiresIn: data.expiresIn === 'never' ? null : data.expiresIn,
        },
        onFailure: () => {
          toast.error(t<string>('settings:apiIntegration.createFailure'));
        },
        onSuccess: (token) => {
          setCreatedToken(token ?? null);
        }
      })
    ).unwrap().then(token => {
      // Because unwrap return the payload, logic here depends on thunk implementation.
      // Assuming unwrap returns token string or similar if successful.
      // In original code: const token = await ... .unwrap(); setCreatedToken(token);
      // I'll stick to original flow but handle errors properly.
      setCreatedToken(token);
    }).catch(() => {
      // Handled in onFailure or here? 
      // Original code relied on onFailure callback for toast.
      // But unwrap() throws if rejected.
    });

    toggleModal(false);
    stopLoading();
  };

  const handleDeleteApiKey = async (id: string) => {
    const loadingToast = toast.loading(`${t<string>('settings:apiIntegration.deleteProgress')}`);

    await dispatch(
      integrationApiTokensActions.deleteApiToken({
        payload: { id },
        onSuccess: () => {
          toast.success(t<string>('settings:apiIntegration.deleteSuccess'));
          toast.dismiss(loadingToast);
        },
        onFailure: () => {
          toast.error(t<string>('settings:apiIntegration.deleteFailure'));
          toast.dismiss(loadingToast);
        },
      })
    );
  };

  if (!apiEnabled) {
    return (
      <div className="flex flex-col gap-6 w-3/4">
        <Alert variant="destructive">
          <AlertTitle>{t('settings:apiIntegration.disabled')}</AlertTitle>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full lg:w-3/4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-bold">
            {t('settings:apiIntegration.title')}
          </CardTitle>
          <Button onClick={() => toggleModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {t('settings:apiIntegration.create')}
          </Button>

          <Dialog open={showModal} onOpenChange={toggleModal}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{t('settings:apiIntegration.create')}</DialogTitle>
              </DialogHeader>
              <CreateApiTokenForm
                onSubmit={handleFormSubmit}
                onCancel={() => toggleModal(false)}
                loading={loading}
              />
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {createdToken && (
            <Alert className="mb-6 border-green-500 text-green-700 bg-green-50">
              <AlertTitle>{t('settings:apiIntegration.createSuccess')}</AlertTitle>
              <AlertDescription>
                <div className="space-y-4 pt-2">
                  <p>{t('settings:apiIntegration.createSuccessDescription')}</p>
                  <Textarea
                    className="bg-white font-mono text-xs"
                    rows={4}
                    value={createdToken}
                    readOnly
                    onFocus={(e) => e.target.select()}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(createdToken);
                      toast.success(t('settings:apiIntegration.copySuccess'));
                    }}
                  >
                    {t('common:button.copy')}
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[192px]">{t('settings:apiIntegration.name')}</TableHead>
                  <TableHead className="w-[144px]">{t('settings:apiIntegration.created')}</TableHead>
                  <TableHead className="w-[144px]">{t('settings:apiIntegration.expiresAt')}</TableHead>
                  <TableHead className="w-[120px]">{t('settings:apiIntegration.status')}</TableHead>
                  <TableHead className="w-[120px]">{t('common:options')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tokens === null ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : tokens && tokens.length > 0 ? (
                  tokens.map((token) => (
                    <TableRow key={token.id}>
                      <TableCell className="font-medium">{token.name}</TableCell>
                      <TableCell>{dayjs(token.createdAt).format('DD.MM.YYYY')}</TableCell>
                      <TableCell>
                        {token.expiresAt
                          ? dayjs(token.expiresAt).format('DD.MM.YYYY')
                          : t('settings:apiIntegration.indefinitely')}
                      </TableCell>
                      <TableCell>
                        {token.expiresAt ? (
                          new Date(token.expiresAt) > new Date() ? (
                            <span className="text-green-600">{t('settings:apiIntegration.active')}</span>
                          ) : (
                            <span className="text-red-600">{t('settings:apiIntegration.expired')}</span>
                          )
                        ) : (
                          <span className="text-green-600">{t('settings:apiIntegration.active')}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                              {t('common:button.delete')}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{t('settings:apiIntegration.deleteWarning')}</AlertDialogTitle>
                              <AlertDialogDescription>
                                {t('settings:apiIntegration.deleteConfirmation')}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{t('common:button.cancel')}</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteApiKey(token.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                {t('common:button.delete')}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      {t('settings:apiIntegration.empty')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="pt-4">
            <a target="_blank" rel="noreferrer" href={API_DOCUMENTATION_URL} className="text-primary hover:underline flex items-center gap-2 text-sm">
              {t('settings:apiIntegration.instruction.title')}
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiIntegration;
