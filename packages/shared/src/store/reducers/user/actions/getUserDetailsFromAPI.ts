import { AppThunk } from '../../../index';
import { getUserDetailsFailed, getUserDetailsStarted, getUserDetailsSuccess } from '../reducer';
import { UserDocument } from '../../../../models/documents';

/**
 * Fetch user details from REST API instead of Firebase
 * This replaces the old getUserDetails action that used Firebase Firestore
 */
export const getUserDetailsFromAPI =
  (uid: string, apiClient: any): AppThunk =>
  async (dispatch) => {
    dispatch(getUserDetailsStarted());
    try {
      const userData = await apiClient.getCurrentUser();
      if (userData) {
        // Normalize currency to lowercase (API returns uppercase, but we use lowercase in the app)
        const defaultCurrency = userData.defaultCurrency || userData.default_currency || 'pln';
        const normalizedCurrency = typeof defaultCurrency === 'string' 
          ? defaultCurrency.toLowerCase() as 'pln' | 'eur' | 'usd' | 'gbp'
          : 'pln';
        
        dispatch(getUserDetailsSuccess({
          uid: userData.uid || uid,
          email: userData.email || null,
          firstName: userData.firstName || '',
          lastName: userData.lastName || null,
          avatarUrl: userData.avatarUrl || null,
          lang: userData.lang || 'pl',
          timezone: userData.timezone || 'Europe/Warsaw',
          contactEmail: userData.contactEmail || null,
          defaultCurrency: normalizedCurrency,
          createdAt: userData.createdAt ? new Date(userData.createdAt) : new Date(),
          updatedAt: userData.updatedAt ? new Date(userData.updatedAt) : new Date(),
          systemRole: null,
          isImpersonated: false,
        } as UserDocument & { systemRole: null | 'admin'; isImpersonated: boolean }));
      } else {
        dispatch(getUserDetailsFailed());
      }
    } catch (error) {
      console.error('[getUserDetailsFromAPI] Error:', error);
      dispatch(getUserDetailsFailed());
    }
  };
