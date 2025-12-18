import { AppThunk } from '../../../index';
import {
  subscribeToApiTokensFailed,
  subscribeToApiTokensStarted,
  subscribeToApiTokensSuccess,
} from '../reducer';
import { ApiTokenDocument } from '../../../../models/documents';
import { COLLECTION, DOCUMENT } from '../../../../constants';

export const subscribeToApiTokens =
  (): AppThunk =>
    (dispatch) => {
      console.warn('subscribeToApiTokens (Firebase) is deprecated.');
      // Optionally dispatch success with empty list or whatever
      dispatch(subscribeToApiTokensSuccess([]));
    };
