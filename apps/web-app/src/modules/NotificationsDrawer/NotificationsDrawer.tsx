import React, { FunctionComponent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Bell } from 'lucide-react';
import { AppStore, notificationsActions, RequestStatus } from '@akademiasaas/shared';
import { useAppDispatch } from '~/initializeStore';
import NotificationItem from './components/NotificationItem/NotificationItem';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '~/components/ui/sheet';
import { Badge } from '~/components/ui/badge';
import { Switch } from '~/components/ui/switch';
import { Button } from '~/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert';
import { toast } from 'sonner';

interface OwnProps {
  isOpen: boolean;
  toggleDrawer: () => void;
}

type Props = OwnProps;

const NotificationsDrawer: FunctionComponent<Props> = ({ toggleDrawer, isOpen }) => {
  const { t } = useTranslation(['dashboard', 'common']);
  const dispatch = useAppDispatch();

  const { totalUnread, listStatus, notifications, filter } = useSelector(
    (store: AppStore) => store.notifications
  );

  const [checked, toggleChecked] = useState(filter === 'unread');

  useEffect(() => {
    // TODO: Replace Firebase subscription with API polling or WebSocket
    // Temporarily disabled to avoid Firebase errors
    // dispatch(notificationsActions.subscribeToNotifications());

    return () => {
      dispatch(notificationsActions.unsubscribeFromNotifications());
    };
  }, [dispatch]);

  useEffect(() => {
    const checkedState = checked ? 'unread' : 'all';
    if (checkedState !== filter) {
      // TODO: Replace Firebase subscription with API polling or WebSocket
      // Temporarily disabled to avoid Firebase errors
      // dispatch(notificationsActions.subscribeToNotifications(checked));
    }
  }, [dispatch, checked, filter]);

  const markAllAsRead = async () => {
    const loadingToast = toast.loading(t<string>('common:messages.loading.default'));
    try {
      await dispatch(notificationsActions.markAllAsRead()).unwrap();
      toast.dismiss(loadingToast);
      toast.success(t<string>('common:messages.success.default'));
    } catch (e) {
      toast.dismiss(loadingToast);
      toast.error(t<string>('common:messages.error.default'));
    }
  };

  const renderContent = () => {
    if (listStatus === RequestStatus.FAILED) {
      return (
        <div className="my-2">
          <Alert variant="destructive">
            <AlertTitle>Błąd</AlertTitle>
            <AlertDescription>{t<string>('errors.cannotFetchNotificationsList')}</AlertDescription>
          </Alert>
        </div>
      );
    }

    if (notifications.length === 0) {
      return (
        <div className="flex justify-center items-center p-8 text-muted-foreground">
          {t<string>('notificationsDrawer.emptyState')}
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {notifications.map((notification) => (
          <NotificationItem key={notification.id} notification={notification} closeDrawer={toggleDrawer} />
        ))}
      </div>
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && toggleDrawer()}>
      <SheetContent className="w-[600px] sm:max-w-[600px] overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                <span>{t<string>('notifications')}</span>
                <Badge variant="secondary" className="ml-2">
                  {totalUnread}
                </Badge>
              </div>

              <div className="flex flex-col lg:flex-row justify-between items-end">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="unread-switch"
                    checked={checked}
                    // @ts-ignore
                    onCheckedChange={(checked) => toggleChecked(checked)}
                  />
                  <label htmlFor="unread-switch" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {t<string>('notificationsDrawer.showOnlyUnread')}
                  </label>
                </div>
                {totalUnread > 0 && (
                  <Button size="sm" variant="outline" className="mt-4" onClick={markAllAsRead}>
                    {t<string>('notificationsDrawer.markAllAsRead')}
                  </Button>
                )}
              </div>
            </div>
          </SheetTitle>
        </SheetHeader>

        {renderContent()}

      </SheetContent>
    </Sheet>
  );
};

export default NotificationsDrawer;
