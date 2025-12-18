import { AppThunk } from '../../../index';
import { COLLECTION } from '../../../../constants/collectionNames';
import {
  subscribeToCreatorStatsSuccess,
  subscribeToCreatorStatsStarted,
  subscribeToCreatorStatsFailed,
} from '../reducer';
import { CreatorStatsDocument } from '../../../../models/documents/Reports';
import { fetchCurrentMonthStats } from './fetchCurrentMonthStats';

export const subscribeToCreatorStats =
  (): AppThunk =>
    (dispatch) => {
      console.warn('subscribeToCreatorStats (Firebase) is deprecated.');
      dispatch(subscribeToCreatorStatsFailed());
    };
