import { AppThunk } from '../../../index';
import { finishRegisterStarted, finishRegisterFailed } from '../reducer';

export interface FinishRegisterData {
  firstName: string;
  lastName: string;
  termsAndPrivacyPolicy: boolean;
}

export const fulfillUserDetails =
  (
    { lastName, firstName, termsAndPrivacyPolicy }: FinishRegisterData,
    callback?: () => void
  ): AppThunk =>
    async (dispatch) => {
      dispatch(finishRegisterStarted());
      console.error('fulfillUserDetails (Firebase) is deprecated.');
      dispatch(finishRegisterFailed());
    };
