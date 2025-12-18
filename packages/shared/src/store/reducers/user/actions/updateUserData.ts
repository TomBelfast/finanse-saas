import { AppThunk } from '../../../index';
import {
  updateUserDetailsStarted,
  updateUserDetailsFailed,
} from '../reducer';
import { UserDocument } from '../../../../models/documents';

export const updateUserData =
  (
    userData: Partial<UserDocument> & Pick<UserDocument, 'uid'>,
    token?: string,
    onSuccess?: () => void,
    onFailure?: () => void
  ): AppThunk =>
    async (dispatch) => {
      dispatch(updateUserDetailsStarted());
      console.warn('updateUserData (Firebase) is deprecated.');
      dispatch(updateUserDetailsFailed());
      onFailure?.();
    };
