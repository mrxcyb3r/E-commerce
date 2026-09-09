import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, AlertCircle, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase/client';

type RState = 'checking' | 'ready' | 'done' | 'invalid';

/**
 * Landing page for the Supabase password-recovery email. supabase-js exchanges
 * the PKCE code automatically on load; this page waits for the session, then
 * lets the user set a new password. After success the session is signed out so
 * the user goes back through the normal login flow.
 */
export const ResetPasswordPage: React.FC = () => {
  const [state, setState] = useState<RState>('checking');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      const { data } = await supabase.auth.getSession();
      if (!cancelled && data.session) setState('ready');
    };
    void check();

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return;
      if ((event === 'SIGNED_IN' || event === 'PASSWORD_RECOVERY') && session) {
        setState('ready');
      }
    });

    const timer = setTimeout(() => {
      if (!cancelled) setState((s) => (s === 'checking' ? 'invalid' : s));
    }, 15_000);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      sub.subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (password.length < 8) {
      setErrorMessage('Yangi parol kamida 8 ta belgidan iborat bo‘lishi kerak.');
      return;
    }
    if (password !== confirm) {
      setErrorMessage('Parollar mos kelmadi.');
      return;
    }
    setIsLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setIsLoading(false);
      setErrorMessage('Parol yangilanmadi. Havola eskirgan bo‘lishi mumkin — qayta urining.');
      return;
    }
    await supabase.auth.signOut();
    setIsLoading(false);
    setState('done');
  };

  if (state === 'checking') {
    return (
      <div className="min-h-screen bg-zinc-900 flex flex-col items-center justify-center px-4">
        <div className="w-12 h-12 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-xs font-semibold text-zinc-400">Havola tekshirilmoqda…</p>
      </div>
    );
  }

  if (state === 'invalid' || state === 'done') {
    const ok = state === 'done';
    return (
      <div className="min-h-screen bg-zinc-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
          <div className="bg-zinc-800/90 backdrop-blur-md py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-zinc-700/80 text-center">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
                ok ? 'bg-emerald-950/50 text-emerald-400' : 'bg-red-950/50 text-red-400'
              }`}
            >
              {ok ? <CheckCircle2 className="w-7 h-7" /> : <AlertCircle className="w-7 h-7" />}
            </div>
            <h2 className="text-xl font-black text-white">
              {ok ? 'Parol yangilandi' : 'Havola yaroqsiz'}
            </h2>
            <p className="mt-2 text-xs text-zinc-400">
              {ok
                ? 'Endi yangi parolingiz bilan kira olasiz.'
                : 'Tiklash havolasi yaroqsiz, eskirgan yoki muddati tugagan. Yangi havola so‘rang.'}
            </p>
            <div className="mt-6 space-y-2">
              <Link
                to="/login"
                className="block w-full py-3 px-4 rounded-2xl font-bold text-sm text-accent-foreground bg-accent hover:bg-amber-400 transition-colors"
              >
                Kirish sahifasi
              </Link>
              {!ok && (
                <Link
                  to="/forgot-password"
                  className="block w-full py-3 px-4 rounded-2xl font-bold text-sm text-white bg-zinc-700 hover:bg-zinc-600 transition-colors"
                >
                  Yangi havola so‘rash
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const inputCls =
    'block w-full pl-10 pr-11 py-3 rounded-2xl bg-zinc-900/90 border border-zinc-700 text-white placeholder-zinc-500 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all font-medium';

  return (
    <div className="min-h-screen bg-zinc-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-zinc-800/90 backdrop-blur-md py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-zinc-700/80">
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-black text-white">Yangi parol</h2>
            <p className="mt-2 text-xs text-zinc-400">Kamida 8 ta belgi. Parolni tasdiqlang va saqlang.</p>
          </div>

          {errorMessage && (
            <div className="mt-6 p-4 rounded-2xl bg-red-950/50 border border-red-800/60 text-red-300 text-xs font-semibold flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
            {['password', 'confirm'].map((kind) => {
              const label = kind === 'password' ? 'Yangi parol' : 'Parolni tasdiqlash';
              const value = kind === 'password' ? password : confirm;
              const set = kind === 'password' ? setPassword : setConfirm;
              return (
                <div key={kind}>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5 uppercase tracking-wider">{label}</label>
                  <div className="relative rounded-2xl">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete={kind === 'password' ? 'new-password' : 'new-password'}
                      value={value}
                      onChange={(e) => set(e.target.value)}
                      placeholder="••••••••"
                      className={inputCls}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-white transition-colors"
                      aria-label={showPassword ? 'Parolni yashirish' : 'Parolni ko‘rsatish'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              );
            })}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl font-bold text-sm text-accent-foreground bg-accent hover:bg-amber-400 transition-all active:scale-[0.98] shadow-lg disabled:opacity-70 disabled:pointer-events-none"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>Parolni saqlash</span>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-zinc-700/60">
            <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition-colors">
              Kirish sahifasi
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;