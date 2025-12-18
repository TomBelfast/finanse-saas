import { createAsyncThunk } from '@reduxjs/toolkit';
import { AsyncThunkCreator } from '../../../index';
import { STATISTICS_REDUCER_NAME } from '../types';
import { COLLECTION } from '../../../../constants/collectionNames';
import { CreatorMonthStatsDocument } from '../../../../models/documents/Reports';
import dayjs from 'dayjs';

export const fetchCurrentMonthStats = createAsyncThunk<
  CreatorMonthStatsDocument | null,
  void,
  AsyncThunkCreator<number>
>(
  `${STATISTICS_REDUCER_NAME}/fetchCurrentMonthStats`,
  async (_, { rejectWithValue }) => {
    console.warn('fetchCurrentMonthStats (Firebase) is deprecated.');
    return null;
  }
);
