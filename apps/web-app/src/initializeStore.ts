// Store initialization without Firebase - using REST API instead
import {
  AppStore,
  createStore,
  StoreDependencies,
} from '@akademiasaas/shared';
import { ThunkDispatch, AnyAction } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { NoOpAnalyticsService, WebAnalyticsService } from '~/services/WebAnalyticsService';
import { apiClient } from '~/services/apiClient';

const {
  VITE_POSTHOG_API_KEY,
  VITE_USE_ANALYTICS,
} = import.meta.env;

const analyticsService =
  VITE_USE_ANALYTICS === 'true'
    ? new WebAnalyticsService({
        postHogApiKey: VITE_POSTHOG_API_KEY || '',
      })
    : new NoOpAnalyticsService();

export const { store } = createStore({
  analytics: analyticsService,
  config: {
    APP_FUNCTION_DOMAIN: import.meta.env.VITE_FUNCTION_DOMAIN || import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  },
  apiClient, // Pass API client to store for use in actions
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = ThunkDispatch<AppStore, StoreDependencies, AnyAction>;
export const useAppDispatch = (): AppDispatch => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
