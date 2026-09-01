import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Lock, User, Eye, EyeOff, ArrowRight, ShieldCheck, AlertCircle, Store } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { login, isAuthenticated } = useAuth();
  const { storeInfo } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/admin';

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMessage("Iltimos, login va parolni to'liq kiriting.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const result = await login(username, password);
    setIsLoading(false);

    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setErrorMessage(result.error || "Login yoki parol noto'g'ri.");
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Brand Logo */}
        <div className="text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-neutral-800/80 border border-neutral-700/60 shadow-lg text-white group hover:border-amber-500/40 transition-all"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-neutral-950 font-black text-base flex items-center justify-center shadow-xs">
              E
            </div>
            <div className="text-left">
              <span className="font-extrabold text-sm tracking-tight text-white block">
                {storeInfo.businessName}
              </span>
              <span className="text-[10px] text-amber-400 font-bold block">
                Admin Boshqaruv Markazi
              </span>
            </div>
          </Link>

          <h2 className="mt-6 text-2xl sm:text-3xl font-black text-white tracking-tight">
            Tizimga kirish
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-neutral-400">
            Do'kon vitrinasi, mahsulotlar va kontentni boshqarish uchun tizimga kiring
          </p>
        </div>

        {/* Login Card */}
        <div className="mt-8 bg-neutral-800/90 backdrop-blur-md py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-neutral-700/80">
          {errorMessage && (
            <div className="mb-6 p-4 rounded-2xl bg-red-950/50 border border-red-800/60 text-red-300 text-xs font-semibold flex items-center gap-3 animate-shake">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Username Field */}
            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1.5 uppercase tracking-wider">
                Foydalanuvchi nomi (Login)
              </label>
              <div className="relative rounded-2xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  autoFocus
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="admin"
                  className="block w-full pl-10 pr-4 py-3 rounded-2xl bg-neutral-900/90 border border-neutral-700 text-white placeholder-neutral-500 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all font-medium"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1.5 uppercase tracking-wider">
                Maxfiy parol
              </label>
              <div className="relative rounded-2xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-11 py-3 rounded-2xl bg-neutral-900/90 border border-neutral-700 text-white placeholder-neutral-500 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl font-bold text-sm text-neutral-950 bg-amber-500 hover:bg-amber-400 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all active:scale-[0.98] shadow-lg disabled:opacity-70 disabled:pointer-events-none"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Boshqaruv paneliga kirish</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </form>

          {/* Quick Notice */}
          <div className="mt-6 pt-6 border-t border-neutral-700/60 text-center">
            <div className="inline-flex items-center gap-1.5 text-xs text-neutral-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Xavfsiz va himoyalangan admin sessiyasi</span>
            </div>
          </div>
        </div>

        {/* Back to Public Store */}
        <div className="mt-6 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
          >
            <Store className="w-4 h-4" />
            <span>Mijozlar vitrinasiga qaytish</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
