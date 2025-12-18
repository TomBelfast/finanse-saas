import { createAsyncThunk } from '@reduxjs/toolkit';
import { ActionParams, AsyncThunkCreator } from '../../../index';
import { INTEGRATION_API_TOKENS_REDUCER_NAME } from '../types';
import { cloudFunctionErrorHandler } from '../../../../helpers/cloudFunctionErrorHandler';

export type Payload = {
  id: string;
};

export const deleteApiToken = createAsyncThunk<
  void,
  ActionParams<Payload, string>,
  AsyncThunkCreator<number>
>(
  `${INTEGRATION_API_TOKENS_REDUCER_NAME}/deleteApiToken`,
  async (
    { onSuccess, onFailure },
    { rejectWithValue }
  ) => {
    console.warn('deleteApiToken (Firebase) is deprecated.');
    onSuccess?.();
    return;
  }
);
