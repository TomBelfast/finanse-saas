import { Action, configureStore, EnhancedStore, Middleware, ThunkAction } from '@reduxjs/toolkit';
import { createLogger } from 'redux-logger';
import { AnalyticsService } from '../services/AnalyticsService';
import { createRootReducer } from './reducers';
import { UserReducer } from './reducers/user/types';
import { NotificationsReducer } from './reducers/notifications/types';
import { SubscriptionReducer } from './reducers/subscription/types';
import { IntegrationApiTokensReducer } from './reducers/integrationApiTokens/types';
import { StatisticsReducer } from './reducers/statistics/types';

export interface AppStore {
  user: UserReducer;
  notifications: NotificationsReducer;
  statistics: StatisticsReducer;
  integrationApiTokens: IntegrationApiTokensReducer;
  subscription: SubscriptionReducer;
}

export interface StoreDependencies {
  // Firebase removed - using REST API instead
  analytics: AnalyticsService;
  config?: {
    APP_FUNCTION_DOMAIN: string;
  };
  // Optional: API client can be passed if needed
  apiClient?: any;
}

type UserDetailsListener = {
  userDetailsListener?: Function;
  subscriptionListener?: Function;
};

type NotificationsListener = {
  notificationsListener?: Function;
};

type IntegrationListener = {
  integrationListener?: Function;
  apiTokenListener?: Function;
};

type NewslettersListener = {
  newslettersListener?: Function;
};

type NewsletterListener = {
  newsletterListener?: Function;
};

type ArchiveListener = {
  archiveListener?: Function;
  lastArchiveDocumentCursor?: any | null; // Removed Firebase dependency
};

type ProductAutomationListener = {
  productAutomationListener?: Function;
};

type ReportsListener = {
  reportsListener?: Function;
};

type ProductReferralsListener = {
  referralsListener?: Function;
};

type UserReferralsListener = {
  userReferralsListener?: Function;
};

type DiscountsListener = {
  discountsListener?: Function;
};

type ProductUserSettingsListener = {
  productUserSettingsListener?: Function;
};

type FirestoreSubscriptions = UserDetailsListener &
  NotificationsListener &
  IntegrationListener &
  NewsletterListener &
  NewslettersListener &
  ArchiveListener &
  ProductAutomationListener &
  ReportsListener &
  ProductReferralsListener &
  UserReferralsListener &
  DiscountsListener &
  ProductUserSettingsListener;

export type ActionParams<T = undefined, R = undefined> = {
  payload: T;
  onSuccess?: (_data?: R) => void;
  onFailure?: (errorCode?: number | string) => void;
};

export type AsyncThunkCreator<T = null> = {
  extra: StoreDependencies;
  state: AppStore;
  rejectValue: T;
};

export type AppThunk<T = void> = ThunkAction<
  T,
  AppStore,
  StoreDependencies,
  Action<string>
>;

export const createStore = (storeDependencies: StoreDependencies): { store: EnhancedStore } => {
  const middleware: Middleware[] = [];
  const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';

  if (IS_DEVELOPMENT) {
    middleware.push(createLogger({ collapsed: true }) as Middleware);
  }
  const store = configureStore({
    reducer: createRootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
        immutableCheck: false,
        thunk: {
          extraArgument: storeDependencies,
        },
      }).concat(middleware),
  });

  return { store };
};
