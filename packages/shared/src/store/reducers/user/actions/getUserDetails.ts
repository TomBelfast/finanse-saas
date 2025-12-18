import { AppThunk } from '../../../index';
import { getUserDetailsFailed } from '../reducer';

export const getUserDetails =
  (_uid: string): AppThunk =>
    async (dispatch) => {
      console.error('getUserDetails (Firebase) is deprecated. Use API.');
      dispatch(getUserDetailsFailed());
    };
