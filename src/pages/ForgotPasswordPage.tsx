import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Mail, ArrowLeft, ArrowRight, ShieldCheck, AlertCircle, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Ask Supabase to email a secure reset link. Rate-limited + logged. */
export const ForgotPasswordPage: React.FC = () => {
  const { forgotPassword } = useAuth();
  const [params] = useSearchParams();
  const [email, setEmail] = useState(params.get('email') ?? '');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!EMAIL_RE.test(email)) {
      setErrorMessage("Email manzilini to'liq kiriting (masalan ism@domen.uz).");
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);
    const result = await forgotPassword(email);
    setIsLoading(false);
    if (result.success) setSent(true);
    else setErrorMessage(result.error ?? 'Xatolik yuz berdi.');
  };

  return (
    <div className="min-h-screen bg-zinc-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-zinc-800/90 backdrop-blur-md py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-zinc-700/80">
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto mb-4">
              <KeyRound className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-black text-white">Parolni tiklash</h2>
            <p className="mt-2 text-xs text-zinc-400">Email manzilingizga tiklash havolasini yuboramiz.</p>
          </div>

          {errorMessage && (
            <div className="mt-6 p-4 rounded-2xl bg-red-950/50 border border-red-800/60 text-red-300 text-xs font-semibold flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {sent ? (
            <div className="mt-6 p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 text-xs font-semibold flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 shrink-0" />
              <span>
                Havola yuborildi. Email pochtangizni tekshiring va kirayotgan havola orqali parolni yangilang.
              </span>
            </div>
          ) : (
            <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5 uppercase tracking-wider">Email</label>
                <div className="relative rounded-2xl">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    autoCapitalize="none"
                    spellCheck={false}
                    required
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ism@domen.uz"
                    className="block w-full pl-10 pr-4 py-3 rounded-2xl bg-zinc-900/90 border border-zinc-700 text-white placeholder-zinc-500 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl font-bold text-sm text-accent-foreground bg-accent hover:bg-amber-400 transition-all active:scale-[0.98] shadow-lg disabled:opacity-70 disabled:pointer-events-none"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Havolani yuborish</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-zinc-700/60 flex items-center justify-between">
            <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              Kirish sahifasi
            </Link>
            <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition-colors">
              Do'konga qaytish
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;