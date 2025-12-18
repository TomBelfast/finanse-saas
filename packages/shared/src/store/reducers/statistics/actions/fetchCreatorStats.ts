import { createAsyncThunk } from '@reduxjs/toolkit';
import { AsyncThunkCreator } from '../../../index';
import { STATISTICS_REDUCER_NAME } from '../types';
import { COLLECTION } from '../../../../constants/collectionNames';
import { CreatorStatsDocument } from '../../../../models/documents/Reports';

export const fetchCreatorStats = createAsyncThunk<
  CreatorStatsDocument | null,
  void,
  AsyncThunkCreator<number>
>(
  `${STATISTICS_REDUCER_NAME}/fetchCreatorStats`,
  async (_, { rejectWithValue }) => {
    console.warn('fetchCreatorStats (Firebase) is deprecated.');
    return null;
  }
);
