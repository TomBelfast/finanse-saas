import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUserDetails } from '../../../../packages/shared/src/store/reducers/user/actions/getUserDetails';

export const useUserDetails = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.user.data);
  const loading = useSelector((state: any) => state.user.loading);
  const error = useSelector((state: any) => state.user.error);

  useEffect(() => {
    if (import.meta.env.VITE_DEBUG === 'true') {
      console.debug('[useUserDetails] useEffect start', { user, loading, error });
    }
    if (!user && !loading) {
      if (import.meta.env.VITE_DEBUG === 'true') {
        console.debug('[useUserDetails] Dispatching getUserDetails');
      }
      // Pobierz uid z Clerk, jeśli dostępny
      // TODO: Update to use Clerk instead of Firebase
      const uid = undefined; // (window as any)?.firebase?.auth?.()?.currentUser?.uid; // REMOVED
      if (uid) {
        dispatch(getUserDetails(uid) as any)
          .then((res: any) => {
            if (import.meta.env.VITE_DEBUG === 'true') {
              console.debug('[useUserDetails] getUserDetails resolved', res);
            }
          })
          .catch((err: any) => {
            if (import.meta.env.VITE_DEBUG === 'true') {
              console.error('[useUserDetails] getUserDetails error', err);
            }
          });
      } else {
        if (import.meta.env.VITE_DEBUG === 'true') {
          console.warn('[useUserDetails] Brak uid, nie można pobrać szczegółów użytkownika');
        }
      }
    }
  }, [dispatch, user, loading, error]);

  useEffect(() => {
    if (import.meta.env.VITE_DEBUG === 'true') {
      console.debug('[useUserDetails] user changed', user);
      console.debug('[useUserDetails] loading changed', loading);
      console.debug('[useUserDetails] error changed', error);
    }
  }, [user, loading, error]);

  return { user, loading, error };
}; 