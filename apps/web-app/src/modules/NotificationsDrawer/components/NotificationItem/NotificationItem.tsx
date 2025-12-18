import React, { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Clock, ChevronRight } from 'lucide-react';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';
import {
  AppStore,
  notificationsActions,
  NotificationStatus,
  Notification,
  NotificationType,
  BroadcastMessageTrigger,
} from '@akademiasaas/shared';
import { useAppDispatch } from '~/initializeStore';
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';

interface OwnProps {
  notification: Notification;
  closeDrawer: () => void;
}

type Props = OwnProps;

const NotificationItem: FunctionComponent<Props> = ({ notification, closeDrawer }) => {
  const { t } = useTranslation(['dashboard', 'common']);
  const performingAction = useSelector((store: AppStore) => store.notifications.performingAction);
  const dispatch = useAppDispatch();

  const redirectToNotification = () => {
    if (
      notification.type === NotificationType.BroadcastMessage &&
      notification.data.action === BroadcastMessageTrigger.Announcement &&
      notification.data.payload.url
    ) {
      window.open(notification.data.payload.url, '_blank');
    }
    closeDrawer();
  };

  const getAlertVariant = () => {
    if (notification.type === NotificationType.BroadcastMessage) {
      return 'default'; // Info equivalent
    }
    return 'default'; // Warning equivalent often just default or specific style. Shadcn Alert has default and destructive.
    // I will use default but maybe style it differently if needed.
  };

  const getMessage = () => {
    if (
      notification.type === NotificationType.BroadcastMessage &&
      notification.data.action === BroadcastMessageTrigger.Announcement
    ) {
      return notification.data.payload.title;
    }
    return t<string>(`notificationsDrawer.notificationType.${notification.data.action}`);
  };

  const getIcon = () => {
    if (
      notification.type === NotificationType.BroadcastMessage &&
      notification.data.action === BroadcastMessageTrigger.Announcement &&
      notification.data.payload.emojiIcon
    ) {
      return <span className="mr-2 text-lg">{notification.data.payload.emojiIcon}</span>
    }
    return null;
  };

  return (
    <div className="relative mb-4 group">
      {notification.status === NotificationStatus.UNREAD && (
        <Badge className="absolute -top-2 -right-2 z-10" variant="destructive">
          {t<string>('notificationsDrawer.unread')}
        </Badge>
      )}

      <div
        onClick={(e) => {
          // Prevent click if clicking on action buttons
          if ((e.target as HTMLElement).closest('button')) {
            return;
          }
          redirectToNotification();
        }}
        className="cursor-pointer transition-all hover:bg-accent/50 rounded-lg"
      >
        <Alert className="relative pr-12 pb-2">
          {getIcon()}
          <AlertTitle className="mb-2 pr-8">{getMessage()}</AlertTitle>
          <AlertDescription>
            {notification.type === NotificationType.BroadcastMessage && notification.data.action === BroadcastMessageTrigger.Announcement ? (
              <div className="flex flex-col gap-2">
                <span className="whitespace-pre-line text-sm text-muted-foreground">{notification.data.payload.message}</span>
              </div>
            ) : null}

            <div className="flex justify-end items-center mt-2 text-xs text-muted-foreground gap-1">
              <Clock className="w-3 h-3" />
              <span>{dayjs(notification.timestamp).format('DD.MM HH:mm')}</span>
            </div>
          </AlertDescription>

          <div className="absolute right-2 top-2 flex flex-col gap-2">
            {notification.status === NotificationStatus.UNREAD && (
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-primary hover:text-primary/80"
                onClick={(e) => {
                  e.stopPropagation();
                  dispatch(notificationsActions.markAsRead(notification.id));
                }}
                disabled={performingAction?.notificationId === notification.id}
              >
                <Check className="w-4 h-4" />
              </Button>
            )}
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={(e) => {
                e.stopPropagation();
                redirectToNotification();
              }}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </Alert>
      </div>
    </div>
  );
};

export default NotificationItem;
