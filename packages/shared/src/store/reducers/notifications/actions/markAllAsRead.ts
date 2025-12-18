import { createAsyncThunk } from '@reduxjs/toolkit';
import { AsyncThunkCreator } from '../../../index';
import { NOTIFICATIONS_REDUCER_NAME } from '../types';
import { COLLECTION } from '../../../../constants/collectionNames';
import { splitIntoChunks } from '../../../../helpers/splitIntoChunks';
import { BATCH_SIZE_LIMIT } from '../../../../constants/collectionNames';
import { NotificationStatus } from '../../../../models/documents';

export const markAllAsRead = createAsyncThunk<void, void, AsyncThunkCreator<number>>(
  `${NOTIFICATIONS_REDUCER_NAME}/markAllAsRead`,
  async (_, { rejectWithValue }) => {
    console.warn('markAllAsRead (Firebase) is deprecated.');
    return;
  }
);
