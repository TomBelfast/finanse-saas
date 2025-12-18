import { createAsyncThunk } from '@reduxjs/toolkit';
import { NotificationStatus } from '../../../../models/documents/notifications/NotificationCommon';
import { AsyncThunkCreator } from '../../../index';
import { NOTIFICATIONS_REDUCER_NAME } from '../types';
import { COLLECTION } from '../../../../constants/collectionNames';

export const markAsRead = createAsyncThunk<void, string, AsyncThunkCreator<number>>(
  `${NOTIFICATIONS_REDUCER_NAME}/markAsRead`,
  async (notificationId, { rejectWithValue }) => {
    console.warn('markAsRead (Firebase) is deprecated.');
    return;
  }
);
