import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUserDetails } from '../../../../packages/shared/src/store/reducers/user/actions/getUserDetails';
import { logger } from '~/utils/logger';
import { AppStore, RequestStatus } from '@akademiasaas/shared';

export const useUserDetails = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: AppStore) => state.user.data);
  const detailsStatus = useSelector((state: AppStore) => state.user.detailsStatus);
  const loading = detailsStatus === RequestStatus.FETCHING || detailsStatus === RequestStatus.UPDATING;
  const error = useSelector((state: AppStore) => state.user.error);

  useEffect(() => {
    if (import.meta.env.VITE_DEBUG === 'true') {
      logger.debug('[useUserDetails] useEffect start', { hasUser: !!user, loading, hasError: !!error });
    }
    if (!user && !loading) {
      if (import.meta.env.VITE_DEBUG === 'true') {
        logger.debug('[useUserDetails] Dispatching getUserDetails');
      }
      // Pobierz uid z Clerk - już zaimplementowane w AuthChecker
      // Clerk authentication is handled by AuthChecker component
      // This hook is deprecated - user details are now managed by AuthChecker
      if (import.meta.env.VITE_DEBUG === 'true') {
        logger.debug('[useUserDetails] User details are now managed by AuthChecker component');
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