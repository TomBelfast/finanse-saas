import { AppThunk } from '../../../index';
import { logInFailed } from '../reducer';

export interface LoginData {
  email: string;
  password: string;
}

export const logInUser =
  ({ email }: LoginData, _callback?: () => void): AppThunk =>
    async (dispatch) => {
      console.error('logInUser (Firebase) is deprecated. Use Clerk.');
      dispatch(logInFailed('deprecated'));
    };
