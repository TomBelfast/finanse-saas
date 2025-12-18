import { AppThunk } from '../../../index';
import { COLLECTION } from '../../../../constants/collectionNames';
import {
  subscribeToSubscriptionFailed,
  subscribeToSubscriptionStarted,
  subscribeToSubscriptionSuccess,
} from '../reducer';
import { Stripe } from 'stripe';

export const subscribeToSubscription =
  (subscriptionId: string): AppThunk =>
    (dispatch) => {
      console.warn('subscribeToSubscription (Firebase) is deprecated.');
      dispatch(subscribeToSubscriptionFailed());
    };
