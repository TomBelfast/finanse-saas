import React, { lazy, Suspense, useEffect } from 'react';
import './App.css';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { store } from '~/initializeStore';
import AuthChecker from './components/AuthChecker/AuthChecker';
import Auth from './pages/Auth/Auth';
import ProtectedRoute from '~/components/ProtectedRoute/ProtectedRoute';
import { useTranslation } from 'react-i18next';
import FullPageLoader from '~/components/FullPageLoader/FullPageLoader';
import { Toaster } from '~/components/ui/sonner';

const Dashboard = lazy(() => import('~/pages/Dashboard/Dashboard'));
const Loans = lazy(() => import('~/pages/Loans/Loans'));
const Subscriptions = lazy(() => import('~/pages/Subscriptions/Subscriptions'));
const Insurances = lazy(() => import('~/pages/Insurances/Insurances'));
const Reports = lazy(() => import('~/pages/Reports/Reports'));
const Settings = lazy(() => import('~/pages/Settings/Settings'));

const AppRoutes = () => (
  <AuthChecker>
    <Switch>
      <Route path="/auth" component={Auth} />
      <ProtectedRoute
        path="/"
        render={(props) => (
          <Suspense fallback={<FullPageLoader />}>
            <Dashboard {...props} />
          </Suspense>
        )}
      />
    </Switch>
  </AuthChecker>
);

const Routes = () => {
  return (
    <>
      <Suspense fallback={<FullPageLoader />}>
        <Route path="/" component={AppRoutes} />
      </Suspense>
    </>
  );
};

function App() {
  const { i18n } = useTranslation('common');

  useEffect(() => {
    if (['pl', 'en'].includes(i18n.language) || !i18n.language) {
      return;
    }
    const [lang] = i18n.language.split('-');
    i18n.changeLanguage(lang || 'en');
  }, [i18n]);

  return (
    <Provider store={store}>
      <Router>
        <Routes />
        <Toaster />
      </Router>
    </Provider>
  );
}

export default App;
