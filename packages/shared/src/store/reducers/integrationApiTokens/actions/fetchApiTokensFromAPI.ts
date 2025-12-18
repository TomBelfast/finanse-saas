import { AppThunk } from '../../../index';
import {
  subscribeToApiTokensFailed,
  subscribeToApiTokensStarted,
  subscribeToApiTokensSuccess,
} from '../reducer';
import { ApiTokenDocument } from '../../../../models/documents';

/**
 * Fetch API tokens from REST API instead of Firebase
 * This replaces the old subscribeToApiTokens action that used Firebase Firestore
 */
export const fetchApiTokensFromAPI =
  (apiClient: any): AppThunk =>
  async (dispatch) => {
    try {
      dispatch(subscribeToApiTokensStarted());
      // TODO: Implement getApiTokens in apiClient
      // For now, return empty array if endpoint doesn't exist
      try {
        const tokens = await apiClient.getApiTokens?.() || [];
        dispatch(subscribeToApiTokensSuccess(tokens || []));
      } catch (error: any) {
        // If endpoint doesn't exist yet, return empty array
        if (error?.message?.includes('404') || error?.message?.includes('not found')) {
          dispatch(subscribeToApiTokensSuccess([]));
        } else {
          throw error;
        }
      }
    } catch (error: any) {
      console.error('[fetchApiTokensFromAPI] Error:', error);
      dispatch(subscribeToApiTokensFailed(error?.message || 'Failed to fetch API tokens'));
    }
  };
