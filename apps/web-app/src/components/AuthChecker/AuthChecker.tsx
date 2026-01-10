import React, { FunctionComponent, PropsWithChildren, useEffect, useState } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { AppStore, userActions, UserDocument } from '@akademiasaas/shared';
import { PayloadAction } from '@reduxjs/toolkit';
import { useQuery } from '~/hooks/useQuery';
import { useAppDispatch } from '~/initializeStore';
import { apiClient } from '~/services/apiClient';
import { logger } from '~/utils/logger';

interface OwnProps { }

type Props = PropsWithChildren<OwnProps>;

const AuthChecker: FunctionComponent<Props> = ({ children }) => {
  const dispatch = useAppDispatch();
  const history = useHistory();
  const { user, isLoaded: isUserLoaded } = useUser();
  const { isSignedIn, getToken } = useAuth();
  const reduxUser = useSelector((store: AppStore) => store.user);
  const userUid = reduxUser.data?.uid;
  const query = useQuery();
  // Track if token has been set for authenticated users
  const [isTokenReady, setIsTokenReady] = useState(false);

  if (import.meta.env.VITE_DEBUG === 'true') {
    logger.debug('[AuthChecker] DEBUG ENV', { debug: import.meta.env.VITE_DEBUG });
  }

  useEffect(() => {
    if (!isUserLoaded) {
      if (import.meta.env.VITE_DEBUG === 'true') {
        logger.debug('[AuthChecker] Clerk user not loaded yet');
      }
      return;
    }

    const syncUserData = async () => {
      if (import.meta.env.VITE_DEBUG === 'true') {
        logger.debug('[AuthChecker] syncUserData', { isSignedIn, user: user?.id, userUid });
      }

      if (isSignedIn && user) {
        // Get Clerk token and set it in API client - MUST complete before rendering children
        try {
          const token = await getToken();
          if (token) {
            apiClient.setToken(token);
            setIsTokenReady(true);
            if (import.meta.env.VITE_DEBUG === 'true') {
              logger.debug('[AuthChecker] Clerk token set in API client');
            }
          }
        } catch (error) {
          logger.error('[AuthChecker] Error getting Clerk token', error);
          // Even on error, allow rendering to continue (will show auth errors)
          setIsTokenReady(true);
        }

        // Sync Clerk user with Redux store
        if (user.id !== userUid) {
          if (import.meta.env.VITE_DEBUG === 'true') {
            logger.debug('[AuthChecker] Dispatch logInSuccess', { uid: user.id, email: user.primaryEmailAddress?.emailAddress });
          }

          dispatch(userActions.logInSuccess({
            uid: user.id,
            email: user.primaryEmailAddress?.emailAddress || null,
          }));

          // Fetch full user details from API
          try {
            const fullUser = await apiClient.getCurrentUser();
            if (import.meta.env.VITE_DEBUG === 'true') {
              logger.debug('[AuthChecker] Fetched user details', { 
                userId: fullUser?.uid, 
                email: fullUser?.email,
                firstName: fullUser?.firstName,
                lastName: fullUser?.lastName,
                defaultCurrency: fullUser?.defaultCurrency || fullUser?.default_currency || 'pln'
              });
            }
            // Update Redux store directly with API data (don't use getUserDetails which uses Firebase)
            if (fullUser) {
              // Normalize currency to lowercase (API may return uppercase, but we use lowercase in the app)
              const defaultCurrency = fullUser.defaultCurrency || fullUser.default_currency || 'pln';
              const normalizedCurrency = typeof defaultCurrency === 'string' 
                ? defaultCurrency.toLowerCase() as 'pln' | 'eur' | 'usd' | 'gbp'
                : 'pln';

              // Map API response to UserDocument format and dispatch directly
              // Backend returns UserDocument with 'uid' field, not 'userId'
              const userDocument: UserDocument & { systemRole: null | 'admin'; isImpersonated: boolean } = {
                uid: (fullUser.uid || fullUser.userId || user.id) as string,
                email: (fullUser.email || user.primaryEmailAddress?.emailAddress || null) as string | null,
                firstName: (fullUser.firstName || user.firstName || '') as string,
                lastName: (fullUser.lastName || user.lastName || null) as string | null,
                avatarUrl: (fullUser.avatarUrl || fullUser.avatar_url || user.imageUrl || null) as string | null,
                lang: (fullUser.lang || 'pl') as string,
                timezone: (fullUser.timezone || 'Europe/Warsaw') as string,
                contactEmail: (fullUser.contactEmail || fullUser.contact_email || null) as string | null,
                defaultCurrency: normalizedCurrency,
                createdAt: fullUser.createdAt ? new Date(fullUser.createdAt as string) : new Date(),
                updatedAt: fullUser.updatedAt ? new Date(fullUser.updatedAt as string) : new Date(),
                systemRole: null,
                isImpersonated: false,
              } as UserDocument & { systemRole: null | 'admin'; isImpersonated: boolean };

              // Dispatch getUserDetailsSuccess action directly
              if (import.meta.env.VITE_DEBUG === 'true') {
                logger.debug('[AuthChecker] Dispatching getUserDetailsSuccess', { 
                  firstName: userDocument.firstName, 
                  lastName: userDocument.lastName 
                });
              }
              dispatch({
                type: 'User/getUserDetailsSuccess',
                payload: userDocument,
              } as PayloadAction<UserDocument & { systemRole: null | 'admin'; isImpersonated: boolean }>);
            }
          } catch (error) {
            logger.error('[AuthChecker] Error fetching user details', error);
            // User might not exist in our database yet - create it via API
            try {
              const createdUser = await apiClient.updateUser({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.primaryEmailAddress?.emailAddress || '',
              }) as { uid?: string } | null | undefined;
              if (createdUser && import.meta.env.VITE_DEBUG === 'true') {
                logger.debug('[AuthChecker] User created via API', { userId: createdUser?.uid || 'unknown' });
              }
            } catch (createError) {
              logger.error('[AuthChecker] Error creating user', createError);
            }
          }
        }

        // Redirect if on auth page (but not on SSO callback)
        const currentPath = history.location.pathname;
        if (currentPath.startsWith('/auth') && !currentPath.includes('sso-callback')) {
          const continuePath = query.get('continue') || '/';
          if (import.meta.env.VITE_DEBUG === 'true') {
            logger.debug('[AuthChecker] Przekierowanie po zalogowaniu', { continuePath, currentPath });
          }
          // Use setTimeout to ensure redirect happens after Clerk finishes processing
          setTimeout(() => {
            history.push(continuePath);
          }, 100);
        }
      } else {
        // User is not signed in
        if (userUid) {
          // Clear Redux state
          dispatch(userActions.logOutUser());
        }
        apiClient.setToken(null);
        // Mark as ready for non-authenticated users
        setIsTokenReady(true);
      }
    };

    syncUserData();
  }, [isUserLoaded, isSignedIn, user, userUid, dispatch, history, query, getToken]);

  // Wait for Clerk to load
  if (!isUserLoaded) {
    if (import.meta.env.VITE_DEBUG === 'true') {
      logger.debug('[AuthChecker] Wyświetlam spinner ładowania (Clerk loading)');
    }
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  // Wait for token to be set before rendering children (prevents race condition)
  if (isSignedIn && !isTokenReady) {
    if (import.meta.env.VITE_DEBUG === 'true') {
      logger.debug('[AuthChecker] Waiting for token to be set...');
    }
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (import.meta.env.VITE_DEBUG === 'true') {
    logger.debug('[AuthChecker] Renderuję children', { isSignedIn, userId: user?.id, isTokenReady });
  }

  return <>{children}</>;
};

export default AuthChecker;
