import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import { supabase } from '../lib/supabase/client';
import { AUTH_CONFIG, rateBucket } from '../lib/auth/config';
import {
  deviceSignature,
  isNewDevice,
  logAuthEvent,
  logBusinessAudit,
  authTryAttempt,
  authRecordAttempt,
  localCooldownMs,
} from '../lib/auth/security';
import { postChannel, listenAuthChannel, AuthChannelMessage } from '../lib/auth/session';
import { StaffRole } from '../types/supabase-db';
import { useStore } from './StoreContext';

export interface AdminUser {
  id: string;
  email: string;
  username: string;
  name: string;
  role: StaffRole;
  isOwner: boolean;
  isSuspended: boolean;
  lastLoginAt: string | null;
}

export interface AuthResult {
  success: boolean;
  error?: string;
  /** Rate limit: seconds to wait before retrying. */
  retryAfter?: number;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  /** True once the DB identity check has finished on load — gates AdminRoute
   *  so a cold-load can never flash the login page while the session resolves. */
  sessionChecked: boolean;
  user: AdminUser | null;
  adminUsername: string;
  role: StaffRole | null;
  /** True when the browser holds a session the DB did not authorize. */
  blocked: boolean;
  /** Countdown warning state for the soon-to-expire session. */
  sessionWarning: boolean;
  sessionExpiresAt: number | null;
  login: (email: string, password: string) => Promise<AuthResult>;
  loginOtp: (email: string) => Promise<AuthResult>;
  verifyOtp: (email: string, code: string) => Promise<AuthResult>;
  resendOtp: (email: string) => Promise<AuthResult>;
  forgotPassword: (email: string) => Promise<AuthResult>;
  loginGoogle: () => Promise<AuthResult>;
  logout: () => void;
  updateCredentials: (newUsername: string, newPassword: string) => void;
  changeCredentials: (currentPassword: string, newUsername?: string, newPassword?: string) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
  /** Force a real token refresh (resets sessionExpiresAt) when the session
   *  is about to expire. No-op when there is no active session. */
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const toAdminUser = (p: {
  id: string;
  email: string | null;
  username: string;
  full_name: string | null;
  role: StaffRole | null;
  is_owner: boolean;
  is_suspended: boolean;
  last_login_at: string | null;
  is_approved: boolean;
}): AdminUser => ({
  id: p.id,
  email: p.email ?? p.username,
  username: p.username,
  name: p.full_name || p.username,
  role: p.role ?? 'viewer',
  isOwner: p.is_owner,
  isSuspended: p.is_suspended,
  lastLoginAt: p.last_login_at,
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { storeInfo } = useStore();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [blocked, setBlocked] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [sessionWarning, setSessionWarning] = useState(false);
  const [sessionExpiresAt, setSessionExpiresAt] = useState<number | null>(null);
  const busy = useRef(false);

  const loadSession = useCallback(async () => {
    if (busy.current) return;
    busy.current = true;
    try {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      if (!session?.user) {
        setUser(null);
        setBlocked(false);
        setSessionExpiresAt(null);
        setSessionChecked(true);
        return;
      }

      const { data: profile, error } = await supabase.rpc('rpc_my_profile');
      if (error) {
        console.warn('rpc_my_profile failed:', error);
        setUser(null);
        setBlocked(false);
        setSessionChecked(true);
        return;
      }
      if (!profile || profile.is_suspended === true) {
        // Session exists but the DB did not authorize it → access denied.
        setUser(null);
        setBlocked(true);
        setSessionChecked(true);
        return;
      }

      const adminUser = toAdminUser(profile);
      const expiresAt = session.expires_at;
      const isNew = profile.is_owner === false && isNewDevice();
      setUser(adminUser);
      setBlocked(false);
      setSessionExpiresAt(expiresAt ?? null);
      setSessionChecked(true);
      if (isNew) {
        void logAuthEvent('new_device', {}, adminUser.email);
      }
    } catch (e) {
      console.warn('loadSession failed:', e);
      setUser(null);
      setSessionChecked(true);
    } finally {
      busy.current = false;
    }
  }, []);

  useEffect(() => {
    void loadSession();
  }, [loadSession]);

  // First-run OAuth/redirect handling happens automatically; this listens for
  // every subsequent auth transition and re-resolves the DB identity.
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setBlocked(false);
        setSessionExpiresAt(null);
        setSessionWarning(false);
        setSessionChecked(true);
        return;
      }
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        setSessionExpiresAt(session?.expires_at ?? null);
        void loadSession();
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [loadSession]);

  // Cross-tab logout: another tab signed out → this tab signs out too.
  useEffect(() => {
    const apply = (msg: AuthChannelMessage) => {
      if (msg.type === 'logout') {
        if (typeof window !== 'undefined') window.location.reload();
      }
    };
    const unsubscribe = listenAuthChannel(apply);
    const onStorage = (e: StorageEvent) => {
      if (e.key && e.key.includes('sb-')) apply({ type: 'logout' });
    };
    window.addEventListener('storage', onStorage);
    return () => {
      unsubscribe();
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  // Session expiry heartbeat: warn before, hard-stop after.
  useEffect(() => {
    if (!sessionExpiresAt) {
      setSessionWarning(false);
      return;
    }
    const warnAt = (sessionExpiresAt * 1000) - AUTH_CONFIG.sessionWarnMs;
    const hardAt = sessionExpiresAt * 1000;
    const tick = () => {
      const now = Date.now();
      if (now >= hardAt) {
        setSessionWarning(false);
        setUser(null);
        void supabase.auth.signOut();
        postChannel({ type: 'logout' });
        return;
      }
      setSessionWarning(now >= warnAt && now < hardAt);
    };
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, [sessionExpiresAt]);

  const login = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      const clean = email.trim();
      const bucket = rateBucket('login_password', clean);
      const gate = await authTryAttempt(bucket, 300, 5);
      if (!gate.ok) {
        void logAuthEvent('login_failure', { reason: 'rate_limited' }, clean);
        return { success: false, error: "Juda ko'p urinish. Birozdan so'ng qayta urinib ko'ring.", retryAfter: gate.retryAfter };
      }
      await authRecordAttempt(bucket);
      const { error } = await supabase.auth.signInWithPassword({ email: clean, password: password.trim() });
      if (error) {
        void logAuthEvent('login_failure', { reason: error.message }, clean);
        return { success: false, error: "Email yoki parol noto'g'ri." };
      }
      void logAuthEvent('login_success', {}, clean);
      await loadSession();
      return { success: true };
    },
    [loadSession],
  );

  const loginOtp = useCallback(async (email: string): Promise<AuthResult> => {
    const clean = email.trim().toLowerCase();
    if (!clean.includes('@')) return { success: false, error: "Email manzilini to'liq kiriting (masalan ism@domen.uz)." };

    const cooldown = localCooldownMs(`otp:${clean}`, 60_000);
    if (cooldown > 0) {
      void logAuthEvent('otp_request', { reason: 'cooldown' }, clean);
      return { success: false, error: `Kodni qayta yuborish uchun kutish kerak (${Math.ceil(cooldown / 1000)}s).`, retryAfter: Math.ceil(cooldown / 1000) };
    }

    const bucket = rateBucket('login_otp', clean);
    const gate = await authTryAttempt(bucket, 300, 5);
    if (!gate.ok) {
      void logAuthEvent('otp_request', { reason: 'rate_limited' }, clean);
      return { success: false, error: "Juda ko'p so'rov. OTP kodini keyinroq talab qiling.", retryAfter: gate.retryAfter };
    }
    await authRecordAttempt(bucket);

    const { error } = await supabase.auth.signInWithOtp({
      email: clean,
      options: { shouldCreateUser: true },
    });
    if (error) {
      void logAuthEvent('otp_request', { reason: error.message }, clean);
      return { success: false, error: "Kod yuborilmadi. Email tasdiqlanmagan bo‘lishi yoki xat yuborish sozlanmagan bo‘lishi mumkin — parol bilan kirishni sinab ko‘ring." };
    }
    void logAuthEvent('otp_request', {}, clean);
    return { success: true };
  }, []);

  const verifyOtp = useCallback(
    async (email: string, code: string): Promise<AuthResult> => {
      const clean = email.trim().toLowerCase();
      const { error } = await supabase.auth.verifyOtp({ email: clean, token: code.trim(), type: 'email' });
      if (error) {
        void logAuthEvent('otp_verify', { success: false, reason: error.message }, clean);
        return { success: false, error: "Kod noto'g'ri yoki eskirgan." };
      }
      void logAuthEvent('otp_verify', { success: true }, clean);
      await loadSession();
      return { success: true };
    },
    [loadSession],
  );

  const resendOtp = useCallback(
    async (email: string): Promise<AuthResult> => {
      const clean = email.trim().toLowerCase();
      const bucket = rateBucket('resend_otp', clean);
      const gate = await authTryAttempt(bucket, 300, 3);
      if (!gate.ok) {
        void logAuthEvent('otp_resend', { reason: 'rate_limited' }, clean);
        return { success: false, error: 'Ko‘p marta yuborish — birozdan so‘ng qayta urinib ko‘ring.', retryAfter: gate.retryAfter };
      }
      await authRecordAttempt(bucket);

      const { error } = await supabase.auth.signInWithOtp({
        email: clean,
        options: { shouldCreateUser: true },
      });
      if (error) {
        return { success: false, error: "Kod yuborilmadi. Bir daqiqadan so'ng qayta urinib ko'ring." };
      }
      void logAuthEvent('otp_resend', {}, clean);
      return { success: true };
    },
    [],
  );

  const loginGoogle = useCallback(async (): Promise<AuthResult> => {
    if (!AUTH_CONFIG.googleEnabled) {
      return { success: false, error: 'Google kirish sozlanmagan.' };
    }
    const bucket = rateBucket('google_oauth', deviceSignature());
    const gate = await authTryAttempt(bucket, 300, 5);
    if (!gate.ok) {
      return { success: false, error: 'Ko‘p urinish — birozdan so‘ng qayta urinib ko‘ring.', retryAfter: gate.retryAfter };
    }
    await authRecordAttempt(bucket);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/login/callback` },
    });
    if (error) {
      void logAuthEvent('oauth_login', { success: false, reason: error.message });
      return { success: false, error: 'Google bilan kirishda xatolik yuz berdi.' };
    }
    return { success: true };
  }, []);

  const forgotPassword = useCallback(async (email: string): Promise<AuthResult> => {
    const clean = email.trim().toLowerCase();
    if (!clean.includes('@')) return { success: false, error: "Email manzilini to'liq kiriting." };

    const bucket = rateBucket('reset', clean);
    const gate = await authTryAttempt(bucket, 300, 3);
    if (!gate.ok) {
      void logAuthEvent('password_reset', { reason: 'rate_limited' }, clean);
      return { success: false, error: 'Ko‘p so‘rov — birozdan so‘ng qayta urinib ko‘ring.', retryAfter: gate.retryAfter };
    }
    await authRecordAttempt(bucket);

    const { error } = await supabase.auth.resetPasswordForEmail(clean, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      void logAuthEvent('password_reset', { reason: error.message }, clean);
      return { success: false, error: "Tiklash havolasi yuborilmadi. Elektron pochta yuborish sozlanmagan bo‘lishi mumkin — admin bilan bog‘laning." };
    }
    void logAuthEvent('password_reset', {}, clean);
    return { success: true };
  }, []);

  const logout = useCallback(() => {
    void logAuthEvent('logout', {}, user?.email);
    void supabase.auth.signOut();
    setUser(null);
    setBlocked(false);
    setSessionExpiresAt(null);
    setSessionWarning(false);
    postChannel({ type: 'logout' });
  }, [user?.email]);

  const updateCredentials = useCallback(() => {
    // Supabase manages auth identities; kept for interface compatibility.
  }, []);

  const changeCredentials = useCallback(
    async (currentPassword: string, _newUsername?: string, newPassword?: string): Promise<boolean> => {
      const email = user?.email;
      if (!email || !newPassword) return false;
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email,
        password: currentPassword.trim(),
      });
      if (verifyError) return false;
      const { error } = await supabase.auth.updateUser({ password: newPassword.trim() });
      if (error) return false;
      void logBusinessAudit('password_changed', 'auth', user?.id, { email });
      return true;
    },
    [user?.email, user?.id],
  );

  const refreshProfile = useCallback(async () => {
    await loadSession();
  }, [loadSession]);

  const refreshSession = useCallback(async () => {
    try {
      const { data } = await supabase.auth.refreshSession();
      if (data.session) {
        setSessionExpiresAt(data.session.expires_at ?? null);
      }
    } catch (e) {
      console.warn('refreshSession failed:', e);
    }
    await loadSession();
  }, [loadSession]);

  const adminUsername = user?.username || 'admin';

  const value = useMemo<AuthContextType>(
    () => ({
      isAuthenticated: sessionChecked && !!user && !user.isSuspended,
      sessionChecked,
      user,
      adminUsername,
      role: user?.role ?? null,
      blocked,
      sessionWarning,
      sessionExpiresAt,
      login,
      loginOtp,
      verifyOtp,
      resendOtp,
      forgotPassword,
      loginGoogle,
      logout,
      updateCredentials,
      changeCredentials,
      refreshProfile,
      refreshSession,
    }),
    [sessionChecked, user, adminUsername, blocked, sessionWarning, sessionExpiresAt, login, loginOtp, verifyOtp, resendOtp, forgotPassword, loginGoogle, logout, updateCredentials, changeCredentials, refreshProfile, refreshSession],
  );

  // Expose the shared auth channel so other modules can trigger cross-tab sync.

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};