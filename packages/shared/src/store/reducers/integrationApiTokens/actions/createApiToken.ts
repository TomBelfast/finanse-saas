import { createAsyncThunk } from '@reduxjs/toolkit';
import { ActionParams, AsyncThunkCreator } from '../../../index';
import { INTEGRATION_API_TOKENS_REDUCER_NAME } from '../types';
import { cloudFunctionErrorHandler } from '../../../../helpers/cloudFunctionErrorHandler';

export type Payload = {
  name: string;
  expiresIn: null | '1d' | '7d' | '30d' | '365d';
};

export const createApiToken = createAsyncThunk<
  string,
  ActionParams<Payload, string>,
  AsyncThunkCreator<number>
>(
  `${INTEGRATION_API_TOKENS_REDUCER_NAME}/createApiToken`,
  async (
    { onSuccess, onFailure },
    { rejectWithValue }
  ) => {
    try {
      console.warn('createApiToken (Firebase) is deprecated.');
      const stubToken = 'stub-token-' + Date.now();
      onSuccess?.(stubToken);
      return stubToken;
    } catch (e) {
      onFailure?.('deprecated');
      return rejectWithValue(0);
    }
  }
);
