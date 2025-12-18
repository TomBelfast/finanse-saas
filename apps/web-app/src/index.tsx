import './index.css';
import './i18nextConfig';
import React from 'react';
import * as Sentry from '@sentry/react';
import { AntdConfigProvider } from '~/providers/AntdConfigProvider';
import App from './App';
import reportWebVitals from './reportWebVitals';
import dayjs from 'dayjs';
import ErrorBoundary from '~/components/ErrorBoundary/ErrorBoundary';
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
// Console logger disabled - uncomment to enable debug logging
// import '~/utils/consoleLogger';

import 'dayjs/locale/pl';
dayjs.locale('pl');

// Initialize theme before React renders to prevent flash
if (typeof window !== 'undefined') {
  const root = window.document.documentElement;
  const theme = (localStorage.getItem('theme') as 'light' | 'dark' | 'system') || 'system';
  
  root.classList.remove('light', 'dark');
  
  if (theme === 'system') {
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    root.classList.add(systemTheme);
  } else {
    root.classList.add(theme);
  }
}

const sentryKey = import.meta.env.VITE_SENTRY_KEY;

if (sentryKey) {
  Sentry.init({
    dsn: sentryKey,
    environment: import.meta.env.VITE_ENV_NAME,
    release: '@akademiasaas/web-app@' + import.meta.env.APP_VERSION,
  });
}

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Clerk Publishable Key');
}

const container = document.getElementById('root');
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = createRoot(container!);

root.render(
  <React.StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
      <ErrorBoundary>
        <AntdConfigProvider>
          <App />
        </AntdConfigProvider>
      </ErrorBoundary>
    </ClerkProvider>
  </React.StrictMode>
);

reportWebVitals();
