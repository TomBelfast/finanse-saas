import { AppThunk } from '../../../index';
import { resetPasswordFailed } from '../reducer';

export interface ResetPasswordData {
  resetPasswordCode: string;
  password: string;
}

export const resetUserPassword =
  ({ resetPasswordCode, password }: ResetPasswordData, _callback?: () => void): AppThunk =>
    async (dispatch) => {
      console.error('resetUserPassword (Firebase) is deprecated.');
      dispatch(resetPasswordFailed('deprecated'));
    };
