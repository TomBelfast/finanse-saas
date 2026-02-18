import React, { FunctionComponent, useState } from 'react';
import { useHistory, Link } from 'react-router-dom';
import { supabase } from '~/lib/supabase';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Mail, Lock } from 'lucide-react';

interface OwnProps { }
type Props = OwnProps;

const Login: FunctionComponent<Props> = () => {
  const history = useHistory();
  const query = new URLSearchParams(history.location.search);
  const continuePath = query.get('continue') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success('Zalogowano pomyślnie');
      history.push(continuePath);
    } catch (error: any) {
      toast.error(error.message || 'Błąd logowania');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: import.meta.env.VITE_AUTH_REDIRECT_URL || 'https://finanse.aihub.ovh',
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || 'Błąd logowania przez Google');
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[430px] space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-white">Witaj ponownie</h1>
        <p className="text-slate-400">Zaloguj się do swojego konta</p>
      </div>

      <div className="rounded-[28px] border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-200">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
              <Input
                id="email"
                type="email"
                placeholder="twoj@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-white/10 bg-white/5 pl-10 text-white placeholder:text-slate-500 focus:ring-lime-500"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-slate-200">Hasło</Label>
              <Link to="/auth/forgot-password" className="text-xs text-lime-400 hover:text-lime-300">
                Zapomniałeś hasła?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-white/10 bg-white/5 pl-10 text-white focus:ring-lime-500"
                required
              />
            </div>
          </div>

          <Button
            disabled={isLoading}
            className="w-full bg-lime-500 font-semibold text-slate-950 hover:bg-lime-400"
            type="submit"
          >
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Zaloguj się'}
          </Button>
        </form>

        <div className="relative my-6 text-center text-xs uppercase">
          <span className="bg-transparent px-2 text-slate-500">Lub</span>
          <div className="absolute inset-0 top-1/2 -z-10 border-t border-white/10"></div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full border-white/10 bg-white/5 text-white hover:bg-white/10"
          onClick={handleGoogleLogin}
          disabled={isGoogleLoading}
        >
          {isGoogleLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
          )}
          Kontynuuj z Google
        </Button>
      </div>

      <p className="px-8 text-center text-sm text-slate-400">
        Nie masz konta?{' '}
        <Link to="/auth/register" className="font-semibold text-lime-400 hover:text-lime-300">
          Zarejestruj się
        </Link>
      </p>
    </div>
  );
};

export default Login;
