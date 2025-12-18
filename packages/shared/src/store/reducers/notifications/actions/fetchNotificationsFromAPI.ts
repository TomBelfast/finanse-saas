import { AppThunk } from '../../../index';
import {
  subscribeToNotificationsFailed,
  subscribeToNotificationsStarted,
  subscribeToNotificationsSuccess,
} from '../reducer';
import { Notification, NotificationStatus } from '../../../../models/documents/notifications';

/**
 * Fetch notifications from REST API instead of Firebase
 * This replaces the old subscribeToNotifications action that used Firebase Firestore
 */
export const fetchNotificationsFromAPI =
  (apiClient: any, onlyUnread = false): AppThunk =>
  async (dispatch) => {
    try {
      dispatch(subscribeToNotificationsStarted());
      // TODO: Implement getNotifications in apiClient
      // For now, return empty array if endpoint doesn't exist
      try {
        const notifications = await apiClient.getNotifications?.(onlyUnread) || [];
        const totalUnread = notifications.filter((n: Notification) => n.status === NotificationStatus.UNREAD).length;
        dispatch(subscribeToNotificationsSuccess({
          filter: onlyUnread ? 'unread' : 'all',
          list: notifications,
          totalUnread,
        }));
      } catch (error: any) {
        // If endpoint doesn't exist yet, return empty array
        if (error?.message?.includes('404') || error?.message?.includes('not found')) {
          dispatch(subscribeToNotificationsSuccess({
            filter: onlyUnread ? 'unread' : 'all',
            list: [],
            totalUnread: 0,
          }));
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error('[fetchNotificationsFromAPI] Error:', error);
      dispatch(subscribeToNotificationsFailed());
    }
  };
