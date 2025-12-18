import { AppThunk } from '../../../index';
import { sendLoginLinkSuccess } from '../reducer';

export const sendLoginLink =
  (email: string, continueUrl: string, lang: string): AppThunk =>
    async (dispatch) => {
      console.warn('sendLoginLink (Firebase) is deprecated.');
      // Pretend success
      dispatch(sendLoginLinkSuccess());
    };
