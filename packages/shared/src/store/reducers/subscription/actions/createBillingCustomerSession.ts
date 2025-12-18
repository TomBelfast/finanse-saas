import { createAsyncThunk } from '@reduxjs/toolkit';
import { AsyncThunkCreator } from '../../../index';
import { SUBSCRIPTION_REDUCER_NAME } from '../types';
import Stripe from 'stripe';

export const createBillingCustomerSession = createAsyncThunk<
  Stripe.Response<Stripe.BillingPortal.Session>,
  void,
  AsyncThunkCreator<number>
>(
  `${SUBSCRIPTION_REDUCER_NAME}/createBillingCustomerSession`,
  async (_, { rejectWithValue }) => {
    console.warn('createBillingCustomerSession (Firebase) is deprecated.');
    return rejectWithValue(0);
  }
);
