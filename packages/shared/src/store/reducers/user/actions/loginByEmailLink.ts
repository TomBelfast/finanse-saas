import { AppThunk } from '../../../index';
import { logInFailed } from '../reducer';

export interface LoginData {
  email: string;
  href: string;
}

export const loginByEmailLink =
  (
    _data: LoginData,
    _callback?: () => void,
    onFailure?: (code: string, message: string) => void
  ): AppThunk =>
    async (dispatch) => {
      console.error('loginByEmailLink (Firebase) is deprecated.');
      onFailure?.('deprecated', 'Firebase auth is removed');
      dispatch(logInFailed('deprecated'));
    };
