import { AppThunk } from '../../../index';
import { logInSuccess } from '../reducer';

export const setLoggedUserData =
  (user: any): AppThunk =>
    async (dispatch) => {
      console.log('[setLoggedUserData] stubbed for Clerk migration');
      if (user) {
        dispatch(logInSuccess({
          uid: user.id || user.uid,
          email: user.emailAddresses?.[0]?.emailAddress || user.email,
        }));
      }
    };
