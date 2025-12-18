import { createAsyncThunk } from '@reduxjs/toolkit';
import { AsyncThunkCreator } from '../../../index';
import { SUBSCRIPTION_REDUCER_NAME } from '../types';
import {
  SubscriptionPlan,
  UserSubscriptionInterval,
} from '../../../../models/documents/Subscriptions';

type Payload = {
  interval: UserSubscriptionInterval;
  plan: SubscriptionPlan;
};

export const changeSubscriptionPlan = createAsyncThunk<void, Payload, AsyncThunkCreator<number>>(
  `${SUBSCRIPTION_REDUCER_NAME}/changeSubscriptionPlan`,
  async (payload, { rejectWithValue }) => {
    console.warn('changeSubscriptionPlan (Firebase) is deprecated.');
    return;
  }
);
