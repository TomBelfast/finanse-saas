import { AppThunk } from '../../../index';
import { logInFailed } from '../reducer';

export const signInWithGoogle = (): AppThunk => async (dispatch) => {
  console.error('signInWithGoogle is deprecated and removed. Please use Clerk authentication.');
  dispatch(logInFailed('deprecated'));
}; 