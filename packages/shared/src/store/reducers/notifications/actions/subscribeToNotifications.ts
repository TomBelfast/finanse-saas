import { AppThunk } from '../../../index';
import {
  subscribeToNotificationsFailed,
} from '../reducer';

export const subscribeToNotifications =
  (_onlyUnread = false): AppThunk =>
    async (dispatch) => {
      console.error('subscribeToNotifications (Firebase) is deprecated.');
      dispatch(subscribeToNotificationsFailed());
    };
