import { AppThunk } from '../../../index';
import { COLLECTION } from '../../../../firestore/collectionNames';
import {
  subscribeToCreatorStatsSuccess,
  subscribeToCreatorStatsStarted,
  subscribeToCreatorStatsFailed,
} from '../reducer';
import { firestoreDateMapper } from '../../../../helpers/firestoreDateMapper';
import { CreatorStatsDocument } from '../../../../models/documents/Reports';
import { fetchCurrentMonthStats } from './fetchCurrentMonthStats';

export const subscribeToCreatorStats =
  (): AppThunk =>
    (dispatch) => {
      console.warn('subscribeToCreatorStats (Firebase) is deprecated.');
      dispatch(subscribeToCreatorStatsFailed());
    };
