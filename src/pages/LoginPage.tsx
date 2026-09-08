import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff, ArrowRight, ShieldCheck, AlertCircle, Store, KeyRound, Shuffle, BadgeCheck, ShieldX } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { useI18n } from '../i18n/I18nContext';
import { AUTH_CONFIG } from '../lib/auth/config';

type Step = 'email' | 'otp' | 'password';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const LoginPage: React.FC = () => {
  const { login, loginOtp, verifyOtp, resendOtp, loginGoogle, isAuthenticated, blocked, logout } = useAuth();
  const { storeInfo } = useStore();
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();

  const [step, setStep] = useState<Step>(AUTH_CONFIG.devOtpPivot ? 'password' : 'email');
  const [email, setEmail] = useState(AUTH_CONFIG.devOtpPivot ? AUTH_CONFIG.ownerEmail : '');
  const [code, setCode] = useState('');
  const [codeCells, setCodeCells] = useState<string[]>(['', '', '', '', '', '']);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showOtpTab, setShowOtpTab] = useState(!AUTH_CONFIG.devOtpPivot);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resendIn, setResendIn] = useState(0);
  const codeInputRef = useRef<HTMLInputElement>(null);

  const from = (location.state as any)?.from?.pathname || '/admin';
  const isDenied = new URLSearchParams(location.search).get('denied') === '1' || blocked;

  const demoFallback = AUTH_CONFIG.devOtpPivot;

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (step === 'otp' && !demoFallback) {
      codeInputRef.current?.focus();
    }
  }, [step, demoFallback]);

  // Resend cooldown countdown.
  useEffect(() => {
    if (resendIn <= 0) return;
    const id = setInterval(() => setResendIn((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [resendIn]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!EMAIL_RE.test(email)) {
      setErrorMessage(t('pages', 'login.emailInvalid'));
      return;
    }
    if (showOtpTab) await handleSendCode();
    else pickTab('password');
  };

  const handleSendCode = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!EMAIL_RE.test(email)) {
      setErrorMessage(t('pages', 'login.emailInvalid'));
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);
    const result = await loginOtp(email);
    setIsLoading(false);
    if (result.success) {
      setStep('otp');
      setShowOtpTab(true);
      setResendIn(60);
      setTimeout(() => codeInputRef.current?.focus(), 50);
    } else {
      setErrorMessage(result.error || t('pages', 'login.otpFailed'));
    }
  };

  const handleResend = async () => {
    if (resendIn > 0) return;
    const result = await resendOtp(email);
    if (result.success) setResendIn(60);
    else setErrorMessage(result.error || t('pages', 'login.otpFailed'));
  };

  const handleCodeChange = (i: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...codeCells];
    next[i] = value.slice(-1);
    setCodeCells(next);
    const joined = next.join('');
    setCode(joined);
    if (value && i < 5) {
      document.getElementById(`otp-${i + 1}`)?.focus();
    }
  };

  const handleVerify = async () => {
    if (code.length !== 6) {
      setErrorMessage(t('pages', 'login.codeInvalid'));
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);
    const result = await verifyOtp(email, code);
    setIsLoading(false);
    if (!result.success) {
      setErrorMessage(result.error || t('pages', 'login.codeInvalid'));
      setCode('');
      setCodeCells(['', '', '', '', '', '']);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!EMAIL_RE.test(email) || !password) {
      setErrorMessage(t('pages', 'login.passwordInvalid'));
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);
    const result = await login(email, password);
    setIsLoading(false);
    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setErrorMessage(result.error || t('pages', 'login.errorInvalid'));
    }
  };

  const handleGoogle = async () => {
    setErrorMessage(null);
    setIsLoading(true);
    const result = await loginGoogle();
    setIsLoading(false);
    if (!result.success && result.error) setErrorMessage(result.error);
  };

  const pickTab = (next: Step) => {
    setStep(next);
    setErrorMessage(null);
  };

  const brandMark = useMemo(
    () => storeInfo.businessName?.charAt(0) || 'D',
    [storeInfo.businessName],
  );

  if (isDenied) {
    return (
      <div className="min-h-screen bg-zinc-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
          <div className="bg-zinc-800/90 backdrop-blur-md py-10 px-6 sm:px-10 shadow-2xl rounded-3xl border border-zinc-700/80 text-center">
            <div className="w-14 h-14 rounded-2xl bg-red-950/50 text-red-400 flex items-center justify-center mx-auto mb-4">
              <ShieldX className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-black text-white">{t('pages', 'login.deniedTitle')}</h2>
            <p className="text-xs text-zinc-400 mt-2">{t('pages', 'login.deniedDesc')}</p>
            <button
              type="button"
              onClick={() => {
                logout();
                navigate('/login', { replace: true });
              }}
              className="mt-6 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-700 text-white text-xs font-bold hover:bg-zinc-600 transition-colors"
            >
              <Shuffle className="w-4 h-4" /> {t('pages', 'login.deniedSignout')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Brand Logo */}
        <div className="text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-zinc-800/80 border border-zinc-700/60 shadow-lg text-white group hover:border-amber-500/40 transition-all"
          >
            <div className="w-9 h-9 rounded-xl bg-accent text-accent-foreground font-black text-base flex items-center justify-center shadow-xs">
              {brandMark}
            </div>
            <div className="text-left">
              <span className="font-extrabold text-sm tracking-tight text-white block">{storeInfo.businessName}</span>
              <span className="text-[10px] text-amber-400 font-bold block">{t('pages', 'login.brand')}</span>
            </div>
          </Link>

          <h2 className="mt-6 text-2xl sm:text-3xl font-black text-white tracking-tight">{t('pages', 'login.title')}</h2>
          <p className="mt-2 text-xs sm:text-sm text-zinc-400">{t('pages', 'login.subtitle')}</p>
        </div>

        {/* Login Card */}
        <div className="mt-8 bg-zinc-800/90 backdrop-blur-md py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-zinc-700/80">
          {errorMessage && (
            <div className="mb-6 p-4 rounded-2xl bg-red-950/50 border border-red-800/60 text-red-300 text-xs font-semibold flex items-center gap-3 animate-shake">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Method tabs */}
          {step === 'email' && !demoFallback && (
            <div className="mb-5 grid grid-cols-2 gap-2">
              <button
                type="button"
                className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold border transition-all ${showOtpTab ? 'bg-amber-500 text-zinc-950 border-amber-400' : 'bg-zinc-900/70 border-zinc-700 text-zinc-300'}`}
                onClick={() => setShowOtpTab(true)}
              >
                <KeyRound className="w-3.5 h-3.5" /> {t('pages', 'login.otpTab')}
              </button>
              <button
                type="button"
                className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold border transition-all ${!showOtpTab ? 'bg-amber-500 text-zinc-950 border-amber-400' : 'bg-zinc-900/70 border-zinc-700 text-zinc-300'}`}
                onClick={() => setShowOtpTab(false)}
              >
                <Lock className="w-3.5 h-3.5" /> {t('pages', 'login.passwordTab')}
              </button>
            </div>
          )}

          {step === 'email' && (
            <form className="space-y-5" onSubmit={handleEmailSubmit}>
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5 uppercase tracking-wider">{t('pages', 'login.email')}</label>
                <div className="relative rounded-2xl shadow-xs">
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
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder={t('pages', 'login.emailPlaceholder')}
                    className="block w-full pl-10 pr-4 py-3 rounded-2xl bg-zinc-900/90 border border-zinc-700 text-white placeholder-zinc-500 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl font-bold text-sm text-accent-foreground bg-accent hover:bg-amber-400 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all active:scale-[0.98] shadow-lg disabled:opacity-70 disabled:pointer-events-none"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                ) : showOtpTab ? (
                  <>
                    <span>{t('pages', 'login.sendCode')}</span>
                    <Mail className="w-4 h-4 stroke-[2.5]" />
                  </>
                ) : (
                  <>
                    <span>{t('pages', 'login.passwordNext')}</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
              </button>
            </form>
          )}

          {step === 'email' && (
            <div className="mt-1 mb-1">
              <div className="flex items-center gap-3 mt-3">
                <div className="h-px flex-1 bg-zinc-700/60" />
                <span className="text-[10px] uppercase tracking-widest text-zinc-500">yoki</span>
                <div className="h-px flex-1 bg-zinc-700/60" />
              </div>
              {AUTH_CONFIG.googleEnabled ? (
                <button
                  type="button"
                  onClick={handleGoogle}
                  disabled={isLoading}
                  className="mt-4 w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-2xl bg-zinc-900/90 border border-zinc-700 text-white text-sm font-bold hover:bg-zinc-800/90 hover:border-zinc-500 transition-all disabled:opacity-70 disabled:pointer-events-none"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M21.6 12.2c0-.7-.1-1.3-.2-2H12v3.9h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.4Z" fill="#4285F4" />
                    <path d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1a5.9 5.9 0 0 1-5.5-4.1H3.2v2.6A10 10 0 0 0 12 22Z" fill="#34A853" />
                    <path d="M6.5 14a6 6 0 0 1 0-3.8V7.6H3.2a10 10 0 0 0 0 9l3.3-2.6Z" fill="#FBBC05" />
                    <path d="M12 5.9c1.5 0 2.8.5 3.8 1.5L18.8 4.4A10 10 0 0 0 3.2 7.6l3.3 2.6A5.9 5.9 0 0 1 12 5.9Z" fill="#EA4335" />
                  </svg>
                  {t('pages', 'login.google')}
                </button>
              ) : (
                <p className="mt-4 text-center text-[10px] text-zinc-500">{t('pages', 'login.googleOff')}</p>
              )}
            </div>
          )}

          {step === 'otp' && (
            <div className="space-y-5">
              <div className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto mb-3">
                  <KeyRound className="w-6 h-6" />
                </div>
                <p className="text-xs text-zinc-300 font-semibold">{t('pages', 'login.codeSent', email)}</p>
                <p className="text-[11px] text-zinc-500 mt-1">{t('pages', 'login.codeSpam')}</p>
              </div>

              <div className="flex justify-center gap-2">
                {codeCells.map((v, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    ref={i === 0 ? codeInputRef : undefined}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={1}
                    value={v}
                    onChange={(e) => handleCodeChange(i, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && !v && i > 0) {
                        document.getElementById(`otp-${i - 1}`)?.focus();
                      }
                    }}
                    onPaste={(e) => {
                      const pasted = e.clipboardData.getData('text').replace(/\D/g, '');
                      if (pasted) {
                        e.preventDefault();
                        const next = pasted.slice(0, 6).padEnd(6, '').split('').slice(0, 6);
                        setCodeCells([...next, ...Array(6 - next.length).fill('')].slice(0, 6));
                        setCode(pasted.slice(0, 6));
                        document.getElementById(`otp-${Math.min(pasted.length, 5)}`)?.focus();
                      }
                    }}
                    className="w-11 h-12 rounded-xl bg-zinc-900/90 border border-zinc-700 text-center text-lg font-black text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                  />
                ))}
              </div>

              <button
                type="button"
                disabled={isLoading}
                onClick={handleVerify}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl font-bold text-sm text-accent-foreground bg-accent hover:bg-amber-400 transition-all active:scale-[0.98] shadow-lg disabled:opacity-70 disabled:pointer-events-none"
              >
                {isLoading ? <div className="w-5 h-5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" /> : <BadgeCheck className="w-4 h-4" />}
                <span>{t('pages', 'login.verify')}</span>
              </button>

              <div className="flex items-center justify-between text-[11px] font-semibold">
                <button type="button" onClick={() => setStep('email')} className="text-zinc-400 hover:text-white transition-colors">
                  {t('pages', 'login.back')}
                </button>
                <button type="button" onClick={handleResend} disabled={resendIn > 0 || isLoading} className="text-amber-400 hover:text-amber-300 disabled:opacity-50 transition-colors">
                  {resendIn > 0 ? t('pages', 'login.resendCooldown', resendIn) : t('pages', 'login.resend')}
                </button>
              </div>
            </div>
          )}

          {step === 'password' && (
            <form className="space-y-5" onSubmit={handlePasswordSubmit}>
              {demoFallback && (
                <div className="p-3 rounded-xl bg-sky-950/40 border border-sky-800/50 text-sky-300 text-[11px] font-semibold">
                  {t('pages', 'login.devPivot')}
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5 uppercase tracking-wider">{t('pages', 'login.email')}</label>
                <div className="relative rounded-2xl shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input type="email" autoCapitalize="none" spellCheck={false} required autoFocus value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('pages', 'login.emailPlaceholder')} className="block w-full pl-10 pr-4 py-3 rounded-2xl bg-zinc-900/90 border border-zinc-700 text-white placeholder-zinc-500 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all font-medium" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5 uppercase tracking-wider">{t('pages', 'login.password')}</label>
                <div className="relative rounded-2xl shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="block w-full pl-10 pr-11 py-3 rounded-2xl bg-zinc-900/90 border border-zinc-700 text-white placeholder-zinc-500 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all font-medium" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-white transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={isLoading} className="w-full mt-2 flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl font-bold text-sm text-accent-foreground bg-accent hover:bg-amber-400 transition-all active:scale-[0.98] shadow-lg disabled:opacity-70 disabled:pointer-events-none">
                {isLoading ? <div className="w-5 h-5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" /> : <><span>{t('pages', 'login.submit')}</span><ArrowRight className="w-4 h-4 stroke-[2.5]" /></>}
              </button>

              <div className="flex items-center justify-between text-[11px] font-semibold">
                <button type="button" onClick={() => setStep('email')} className="text-zinc-400 hover:text-white transition-colors">{t('pages', 'login.back')}</button>
                <button type="button" onClick={() => setStep('email')} className="text-amber-400 hover:text-amber-300 transition-colors">{t('pages', 'login.useOtp')}</button>
              </div>
            </form>
          )}

          {/* Secure notice */}
          <div className="mt-6 pt-6 border-t border-zinc-700/60 text-center">
            <div className="inline-flex items-center gap-1.5 text-xs text-zinc-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t('pages', 'login.secure')}</span>
            </div>
          </div>
        </div>

        {/* Back to Public Store */}
        <div className="mt-6 text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors">
            <Store className="w-4 h-4" />
            <span>{t('pages', 'login.backToStore')}</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;