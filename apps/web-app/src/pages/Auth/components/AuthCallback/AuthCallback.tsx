import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { supabase } from '~/lib/supabase';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const AuthCallback: React.FC = () => {
    const history = useHistory();

    useEffect(() => {
        const handleAuthCallback = async () => {
            const { error } = await supabase.auth.getSession();
            const query = new URLSearchParams(window.location.search);
            const continuePath = query.get('continue') || '/';

            if (error) {
                toast.error('Błąd autoryzacji: ' + error.message);
                history.push('/auth/login');
            } else {
                history.push(continuePath);
            }
        };

        handleAuthCallback();
    }, [history]);

    return (
        <div className="flex h-screen w-full items-center justify-center bg-slate-950">
            <div className="text-center space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-lime-500 mx-auto" />
                <p className="text-slate-400 animate-pulse">Trwa autoryzacja...</p>
            </div>
        </div>
    );
};

export default AuthCallback;
