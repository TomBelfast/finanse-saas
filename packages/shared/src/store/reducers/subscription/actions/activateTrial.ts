import { createAsyncThunk } from '@reduxjs/toolkit';
import { AsyncThunkCreator } from '../../../index';
import { SUBSCRIPTION_REDUCER_NAME } from '../types';

type Payload = void;

export const activateTrial = createAsyncThunk<void, Payload, AsyncThunkCreator<number>>(
  `${SUBSCRIPTION_REDUCER_NAME}/activateTrial`,
  async (payload, { rejectWithValue }) => {
    console.warn('activateTrial (Firebase) is deprecated.');
    return;
  }
);
