import { createAsyncThunk } from '@reduxjs/toolkit';
import { AsyncThunkCreator } from '../../../index';
import { USER_REDUCER, logInSuccess } from '../reducer';
import { getUserDetails } from './getUserDetails';

export const impersonateUser = createAsyncThunk<void, string, AsyncThunkCreator<string>>(
  `${USER_REDUCER}/impersonateUser`,
  async (customToken, { dispatch, rejectWithValue }) => {
    try {
      console.error('impersonateUser (Firebase) is deprecated.');
      return rejectWithValue('Deprecated');
    } catch (e) {
      if (e instanceof Error) {
        return rejectWithValue(e.message);
      }

      return rejectWithValue('Failed to impersonate user');
    }

    return;
  }
);
