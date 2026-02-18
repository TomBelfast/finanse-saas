import React, { FunctionComponent } from 'react';
import { Redirect, Route, Switch, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Login from './components/Login/Login';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { Register } from '~/pages/Auth/components/Register/Register';
import { ForgotPassword } from '~/pages/Auth/components/ForgotPassword/ForgotPassword';
import { ResetPassword } from '~/pages/Auth/components/ResetPassword/ResetPassword';
import { SignWithLink } from '~/pages/Auth/components/SignWithLink/SignWithLink';
import LoginByEmail from '~/pages/Auth/components/LoginByEmail/LoginByEmail';
import logoBlack from '../../assets/icons/logo-black.png';
import logoWhite from '../../assets/icons/logo-white.png';
import bg from '../../assets/images/auth-bg.jpg';
import ImpersonationModal from '~/components/ImpersonationModal/ImpersonationModal';
import { APP_NAME, APP_URL } from '@akademiasaas/shared';
import AuthCallback from '~/pages/Auth/components/AuthCallback/AuthCallback';

interface OwnProps { }

const Auth: FunctionComponent<OwnProps> = () => {
  const { i18n } = useTranslation();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const showImpersonateModal = searchParams.get('impersonate') === 'true';
  const [isOpen, setIsOpen] = React.useState(showImpersonateModal);
  const isPolish = i18n.language === 'pl';

  const heroContent = isPolish
    ? {
      badge: 'Panel finansowy',
      title: 'Miej finanse firmy pod kontrola kazdego dnia.',
      subtitle:
        'Subskrypcje, pozyczki i ubezpieczenia w jednym miejscu, bez chaosu w arkuszach.',
      highlights: [
        'Szybki podglad na kluczowe koszty',
        'Czytelne raporty i statystyki',
        'Bezpieczny dostep dla zespolu',
      ],
    }
    : {
      badge: 'Finance workspace',
      title: 'Keep your company finances clear and under control.',
      subtitle:
        'Track subscriptions, loans and insurance from one focused dashboard.',
      highlights: [
        'Fast overview of recurring costs',
        'Clean reports and monthly trends',
        'Secure access for your whole team',
      ],
    };

  const authRoutes = (
    <Switch>
      <Route exact path="/auth/callback" component={AuthCallback} />
      <Route exact path="/auth/forgot-password/:email?" component={ForgotPassword} />
      <Route path="/auth/login" component={Login} />
      <Route exact path="/auth/register" component={Register} />
      <Route exact path="/auth/reset-password" component={ResetPassword} />
      <Route exact path="/auth/sign-with-link" component={SignWithLink} />
      <Route exact path="/auth/login-by-link" component={LoginByEmail} />
      <Redirect from="/" exact to="/auth/login" />
      <Redirect from="/auth" exact to="/auth/login" />
    </Switch>
  );

  const isAuthCallback = location.pathname === '/auth/callback';

  if (isAuthCallback) {
    return <AuthCallback />;
  }

  return (
    <>
      <div className="relative min-h-screen overflow-hidden bg-slate-950">
        <img src={bg} alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-30" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-slate-950/95 via-slate-900/90 to-slate-950/95" />
        <div className="pointer-events-none absolute -left-24 top-12 h-80 w-80 rounded-full bg-lime-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />

        <div className="relative z-10 flex min-h-screen">
          <div className="relative hidden w-[44%] min-w-[520px] lg:block">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950/70 via-slate-950/60 to-transparent" />
            <div className="relative z-10 flex h-full flex-col justify-between p-10 text-white xl:p-14">
              <a href={APP_URL} target="_blank" rel="nofollow noreferrer" className="w-fit">
                <img src={logoWhite} alt={APP_NAME} className="h-11 w-auto" />
              </a>

              <div className="space-y-6 animate-in fade-in duration-700">
                <p className="text-xs uppercase tracking-[0.24em] text-lime-300/90">{heroContent.badge}</p>
                <p className="max-w-xl text-4xl font-semibold leading-tight xl:text-5xl">
                  {heroContent.title}
                </p>
                <p className="max-w-lg text-base text-slate-200 xl:text-lg">{heroContent.subtitle}</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 animate-in fade-in duration-700">
                {heroContent.highlights.map((highlight) => (
                  <div
                    key={highlight}
                    className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm"
                  >
                    <p className="text-sm leading-relaxed text-slate-100">{highlight}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="relative flex flex-1 flex-col justify-center px-4 py-10 sm:px-8 lg:px-16 xl:px-24">
            <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-24 bg-gradient-to-r from-slate-950/65 to-transparent lg:block" />

            <div className="absolute right-4 top-4 z-20 lg:right-8 lg:top-8">
              <Select
                value={i18n.language}
                onValueChange={(lang) => i18n.changeLanguage(lang)}
              >
                <SelectTrigger className="h-9 w-[110px] border-white/20 bg-white/10 text-white shadow-sm backdrop-blur">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">EN</SelectItem>
                  <SelectItem value="pl">PL</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="mx-auto w-full max-w-[500px] animate-in fade-in slide-in-from-bottom-4 duration-700">
              {authRoutes}
            </div>

            <div className="mt-6 text-center text-xs text-slate-300 lg:hidden">{heroContent.badge}</div>
          </div>
        </div>
      </div>
      <ImpersonationModal open={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default Auth;
