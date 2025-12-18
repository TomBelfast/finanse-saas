import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUserDetails } from '../../../../packages/shared/src/store/reducers/user/actions/getUserDetails';
import { logger } from '~/utils/logger';

export const useUserDetails = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.user.data);
  const loading = useSelector((state: any) => state.user.loading);
  const error = useSelector((state: any) => state.user.error);

  useEffect(() => {
    if (import.meta.env.VITE_DEBUG === 'true') {
      logger.debug('[useUserDetails] useEffect start', { hasUser: !!user, loading, hasError: !!error });
    }
    if (!user && !loading) {
      if (import.meta.env.VITE_DEBUG === 'true') {
        logger.debug('[useUserDetails] Dispatching getUserDetails');
      }
      // Pobierz uid z Clerk, jeśli dostępny
      // TODO: Update to use Clerk instead of Firebase
      const uid = undefined; // (window as any)?.firebase?.auth?.()?.currentUser?.uid; // REMOVED
      if (uid) {
        dispatch(getUserDetails(uid) as any)
          .then((res: any) => {
            if (import.meta.env.VITE_DEBUG === 'true') {
              logger.debug('[useUserDetails] getUserDetails resolved', { success: !!res });
            }
          })
          .catch((err: any) => {
            logger.error('[useUserDetails] getUserDetails error', err);
          });
      } else {
        if (import.meta.env.VITE_DEBUG === 'true') {
          logger.warn('[useUserDetails] Brak uid, nie można pobrać szczegółów użytkownika');
        }
      }
    }
  }, [dispatch, user, loading, error]);

  useEffect(() => {
    if (import.meta.env.VITE_DEBUG === 'true') {
      logger.debug('[useUserDetails] user changed', { hasUser: !!user, userId: user?.uid });
      logger.debug('[useUserDetails] loading changed', { loading });
      logger.debug('[useUserDetails] error changed', { hasError: !!error });
    }
  }, [user, loading, error]);

  return { user, loading, error };
}; 