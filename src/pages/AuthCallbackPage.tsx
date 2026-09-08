import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase/client';
import { useAuth } from '../context/AuthContext';
import { logAuthEvent } from '../lib/auth/security';
import { postChannel, getPendingAuthRedirect } from '../lib/auth/session';

/**
 * Landing page for OAuth (Google) redirects. supabase-js exchanges the PKCE
 * code automatically on load; this component waits for the session, then the
 * AuthContext resolves the DB identity via rpc_my_profile() before navigating.
 * The destination comes from sessionStorage so the user lands back on the
 * deep link they were trying to open (stashed by LoginPage before OAuth).
 */
export const AuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const { blocked, isAuthenticated } = useAuth();
  const [state, setState] = useState<'waiting' | 'done'>('waiting');

  useEffect(() => {
    let cancelled = false;
    const settle = async () => {
      await new Promise((r) => setTimeout(r, 800));
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      if (data.session?.user) {
        void logAuthEvent('oauth_login', { success: true }, data.session.user.email ?? undefined);
        postChannel({ type: 'login' });
        navigate(getPendingAuthRedirect(), { replace: true });
      } else {
        navigate('/login?denied=1', { replace: true });
      }
      if (!cancelled) setState('done');
    };
    void settle();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  useEffect(() => {
    if (blocked) {
      void supabase.auth.signOut();
      navigate('/login?denied=1', { replace: true });
    }
  }, [blocked, navigate]);

  // isAuthenticated is flipped by AuthContext's onAuthStateChange listener.
  useEffect(() => {
    if (isAuthenticated) navigate(getPendingAuthRedirect(), { replace: true });
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-zinc-900 flex flex-col items-center justify-center px-4">
      <div className="w-12 h-12 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
      <p className="mt-4 text-xs font-semibold text-zinc-400">{state === 'waiting' ? 'Sessiya tasdiqlanmoqda…' : 'Yo‘naltirilmoqda…'}</p>
    </div>
  );
};

export default AuthCallbackPage;