import React, { FunctionComponent, PropsWithChildren, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { AppStore, userActions, UserDocument } from '@akademiasaas/shared';
import { PayloadAction } from '@reduxjs/toolkit';
import { useQuery } from '~/hooks/useQuery';
import { useAppDispatch } from '~/initializeStore';
import { apiClient } from '~/services/apiClient';
import { logger } from '~/utils/logger';
import { useSupabaseAuth } from '~/providers/SupabaseAuthProvider';
import { supabase } from '~/lib/supabase';
import { toast } from 'sonner';

interface OwnProps { }

type Props = PropsWithChildren<OwnProps>;

const AuthChecker: FunctionComponent<Props> = ({ children }) => {
  const dispatch = useAppDispatch();
  const history = useHistory();
  const { user, session, isLoading: isAuthLoading } = useSupabaseAuth();
  const isSignedIn = !!session;

  const reduxUser = useSelector((store: AppStore) => store.user);
  const userUid = reduxUser.data?.uid;
  const query = useQuery();
  // Track if token has been set for authenticated users
  const [isTokenReady, setIsTokenReady] = useState(false);

  if (import.meta.env.VITE_DEBUG === 'true') {
    logger.debug('[AuthChecker] DEBUG ENV', { debug: import.meta.env.VITE_DEBUG });
  }

  useEffect(() => {
    if (isAuthLoading) {
      if (import.meta.env.VITE_DEBUG === 'true') {
        logger.debug('[AuthChecker] Supabase auth not loaded yet');
      }
      return;
    }

    const syncUserData = async () => {
      if (import.meta.env.VITE_DEBUG === 'true') {
        logger.debug('[AuthChecker] syncUserData', { isSignedIn, user: user?.id, userUid });
      }

      if (isSignedIn && user && session) {
        // Set Supabase access token in API client
        try {
          const token = session.access_token;
          if (token) {
            apiClient.setToken(token);
            setIsTokenReady(true);
            if (import.meta.env.VITE_DEBUG === 'true') {
              logger.debug('[AuthChecker] Supabase token set in API client');
            }
          }
        } catch (error) {
          logger.error('[AuthChecker] Error getting Supabase token', error);
          setIsTokenReady(true);
        }

        // Check user permissions for this specific app
        try {
          const appId = import.meta.env.VITE_APP_ID || 'finanse-app';
          const { data: permission, error: permError } = await supabase
            .from('user_permissions')
            .select('*')
            .eq('user_id', user.id)
            .eq('app_id', appId)
            .eq('is_active', true)
            .single();

          if (permError || !permission) {
            logger.warn('[AuthChecker] Access denied - no active permission for app', { appId, userId: user.id, error: permError });
            toast.error('Brak uprawnień do korzystania z tej aplikacji.');
            await supabase.auth.signOut();
            dispatch(userActions.logOutUser());
            setIsTokenReady(true);
            return;
          }
        } catch (error) {
          logger.error('[AuthChecker] Error checking permissions', error);
          toast.error('Błąd podczas weryfikacji uprawnień.');
          await supabase.auth.signOut();
          dispatch(userActions.logOutUser());
          setIsTokenReady(true);
          return;
        }

        // Sync Supabase user with Redux store
        if (user.id !== userUid) {
          if (import.meta.env.VITE_DEBUG === 'true') {
            logger.debug('[AuthChecker] Dispatch logInSuccess', { uid: user.id, email: user.email });
          }

          dispatch(userActions.logInSuccess({
            uid: user.id,
            email: user.email || null,
          }));

          // Fetch full user details from API
          try {
            const fullUser = await apiClient.getCurrentUser();
            if (fullUser) {
              const defaultCurrency = fullUser.defaultCurrency || fullUser.default_currency || 'pln';
              const normalizedCurrency = typeof defaultCurrency === 'string'
                ? defaultCurrency.toLowerCase() as 'pln' | 'eur' | 'usd' | 'gbp'
                : 'pln';

              const userDocument: UserDocument & { systemRole: null | 'admin'; isImpersonated: boolean } = {
                uid: (fullUser.uid || fullUser.userId || user.id) as string,
                email: (fullUser.email || user.email || null) as string | null,
                firstName: (fullUser.firstName || user.user_metadata?.first_name || '') as string,
                lastName: (fullUser.lastName || user.user_metadata?.last_name || null) as string | null,
                avatarUrl: (fullUser.avatarUrl || fullUser.avatar_url || user.user_metadata?.avatar_url || null) as string | null,
                lang: (fullUser.lang || 'pl') as string,
                timezone: (fullUser.timezone || 'Europe/Warsaw') as string,
                contactEmail: (fullUser.contactEmail || fullUser.contact_email || null) as string | null,
                defaultCurrency: normalizedCurrency,
                createdAt: fullUser.createdAt ? new Date(fullUser.createdAt as string) : new Date(),
                updatedAt: fullUser.updatedAt ? new Date(fullUser.updatedAt as string) : new Date(),
                systemRole: null,
                isImpersonated: false,
              } as UserDocument & { systemRole: null | 'admin'; isImpersonated: boolean };

              dispatch({
                type: 'User/getUserDetailsSuccess',
                payload: userDocument,
              } as PayloadAction<UserDocument & { systemRole: null | 'admin'; isImpersonated: boolean }>);
            }
          } catch (error) {
            logger.error('[AuthChecker] Error fetching user details', error);
            // User might not exist in our database yet - create it via API
            try {
              await apiClient.updateUser({
                firstName: user.user_metadata?.first_name || '',
                lastName: user.user_metadata?.last_name || '',
                email: user.email || '',
              });
            } catch (createError) {
              logger.error('[AuthChecker] Error creating user', createError);
            }
          }
        }

        // Redirect if on auth page
        const currentPath = history.location.pathname;
        if (currentPath.startsWith('/auth')) {
          const continuePath = query.get('continue') || '/';
          setTimeout(() => {
            history.push(continuePath);
          }, 100);
        }
      } else {
        if (userUid) {
          dispatch(userActions.logOutUser());
        }
        apiClient.setToken(null);
        setIsTokenReady(true);
      }
    };

    syncUserData();
  }, [isAuthLoading, isSignedIn, user, session, userUid, dispatch, history, query]);

  if (isAuthLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (isSignedIn && !isTokenReady) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthChecker;
