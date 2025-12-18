import { AppThunk } from '../../../index';
import { logOutSuccess } from '../reducer';

export const logOutUser =
  (callback?: () => void): AppThunk =>
    async (dispatch) => {
      dispatch(logOutSuccess());
      callback?.();
    };
