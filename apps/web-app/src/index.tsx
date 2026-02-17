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
const container = document.getElementById('root');
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = createRoot(container!);
if (!PUBLISHABLE_KEY) {
  if (import.meta.env.PROD) {
    throw new Error('Missing Clerk Publishable Key');
  }

  root.render(
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: '24px',
        background: 'linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)',
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: '720px',
          width: '100%',
          background: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 20px 60px -32px rgba(15, 23, 42, 0.45)',
        }}
      >
        <h2 style={{ marginBottom: '12px', color: '#0f172a' }}>Brak konfiguracji Clerk</h2>
        <p style={{ color: '#475569', marginBottom: '16px' }}>
          Ustaw zmienna <code>VITE_CLERK_PUBLISHABLE_KEY</code> w pliku
          {' '}<code>apps/web-app/.env.local</code>, aby uruchomic logowanie lokalnie.
        </p>
        <pre
          style={{
            margin: 0,
            padding: '14px',
            borderRadius: '10px',
            background: '#0f172a',
            color: '#e2e8f0',
            overflowX: 'auto',
          }}
        >
{`VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_API_URL=http://localhost:3001/api`}
        </pre>
      </div>
    </div>
  );
} else {
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
}

reportWebVitals();
