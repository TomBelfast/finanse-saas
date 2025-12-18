import { AppThunk } from '../../../store';
import { unsubscribeFromUserDetails as unsubscribeAction } from '../reducer';

export const unsubscribeFromUserDetails =
  (): AppThunk =>
    (dispatch, _, { }) => {
      // Stub: Firebase removed.
      dispatch(unsubscribeAction());
    };
