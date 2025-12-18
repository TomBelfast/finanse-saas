import { AppThunk } from '../../../index';
import { sendPasswordResetSuccess } from '../reducer';

export const sendPasswordResetEmail =
  (email: string, continueUrl: string): AppThunk =>
    async (dispatch) => {
      console.warn('sendPasswordResetEmail (api) is deprecated/stubbed.');
      // Pretend success
      dispatch(sendPasswordResetSuccess());
    };
