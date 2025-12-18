import { AppThunk } from '../../../index';
import { resetPasswordFailed } from '../reducer';

export interface LoginData {
  password: string;
  oldPassword?: string;
}

export const setUserPassword =
  ({ password, oldPassword }: LoginData, _callback?: () => void): AppThunk =>
    async (dispatch) => {
      console.error('setUserPassword (Firebase) is deprecated.');
      dispatch(resetPasswordFailed('deprecated'));
    };
