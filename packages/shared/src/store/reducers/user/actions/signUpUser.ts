import { AppThunk } from '../../../index';
import { signUpFailed } from '../reducer';

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  termsAndPrivacyPolicy: boolean;
  lang: string;
  timezone: string;
  ip: string | null;
  phoneNumber: string | null;
}

export const signUpUser =
  (
    _data: RegisterData,
    _callback?: () => void,
    _onFail?: () => void
  ): AppThunk =>
    async (dispatch) => {
      console.error('signUpUser (Firebase) is deprecated. Use API.');
      dispatch(signUpFailed('deprecated'));
    };
