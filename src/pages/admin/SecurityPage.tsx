import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ShieldCheck,
  LogIn,
  LogOut,
  KeyRound,
  AlertTriangle,
  MonitorSmartphone,
  Fingerprint,
  MailX,
  Clock,
  Lock,
  Download,
  Loader2,
} from 'lucide-react';
import { supabase } from '../../lib/supabase/client';
import { useAuth } from '../../context/AuthContext';
import { deviceSignature, logAuthEvent } from '../../lib/auth/security';
import { relativeTime } from '../../lib/admin/relativeTime';
import { cn } from '../../lib/utils';

interface LoginRow {
  id: number;
  email: string;
  event_type: string;
  ip: string | null;
  user_agent: string | null;
  device_signature: string | null;
  created_at: string;
  metadata: Record<string, unknown>;
}

const EVENT_META: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
  login_success: { label: 'Kirish muvaffaqiyatli', cls: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', icon: <LogIn className="w-3 h-3" /> },
  login_failure: { label: 'Kirish xatosi', cls: 'bg-red-500/10 text-red-600 dark:text-red-400', icon: <AlertTriangle className="w-3 h-3" /> },
  otp_request: { label: 'OTP so‘raldi', cls: 'bg-sky-500/10 text-sky-600 dark:text-sky-400', icon: <KeyRound className="w-3 h-3" /> },
  otp_verify: { label: 'OTP tasdiqlandi', cls: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', icon: <KeyRound className="w-3 h-3" /> },
  otp_resend: { label: 'OTP qayta yuborildi', cls: 'bg-sky-500/10 text-sky-600 dark:text-sky-400', icon: <KeyRound className="w-3 h-3" /> },
  password_reset: { label: 'Parol tiklandi', cls: 'bg-amber-500/10 text-amber-600 dark:text-amber-400', icon: <Lock className="w-3 h-3" /> },
  password_changed: { label: 'Parol almashtirildi', cls: 'bg-amber-500/10 text-amber-600 dark:text-amber-400', icon: <Lock className="w-3 h-3" /> },
  oauth_login: { label: 'Google orqali kirish', cls: 'bg-violet-500/10 text-violet-600 dark:text-violet-400', icon: <LogIn className="w-3 h-3" /> },
  new_device: { label: 'Yangi qurilma', cls: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400', icon: <MonitorSmartphone className="w-3 h-3" /> },
  signup_blocked: { label: 'Ro‘yxatdan o‘tish bloklandi', cls: 'bg-red-500/10 text-red-600 dark:text-red-400', icon: <MailX className="w-3 h-3" /> },
  session_expired: { label: 'Sessiya tugadi', cls: 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-300', icon: <Clock className="w-3 h-3" /> },
  session_revoked: { label: 'Sessiya bekor qilindi', cls: 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-300', icon: <LogOut className="w-3 h-3" /> },
};

export const SecurityPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [rows, setRows] = useState<LoginRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signingAll, setSigningAll] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error: err } = (await supabase
      .from('login_history')
      .select('id,email,event_type,ip,user_agent,device_signature,created_at,metadata')
      .order('created_at', { ascending: false })
      .limit(100)) as unknown as { data: LoginRow[] | null; error: { message?: string } | null };
    if (err) setError("Tarixni o‘qib bo‘lmadi — faqat egasi va administratorlar ko‘ra oladi.");
    else setRows(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const myDevice = deviceSignature();

  const stats = useMemo(() => {
    const failures = rows.filter((r) => r.event_type === 'login_failure').length;
    const otpReqs = rows.filter((r) => r.event_type === 'otp_request' || r.event_type === 'otp_resend').length;
    const resets = rows.filter((r) => r.event_type === 'password_reset').length;
    const devices = new Set(rows.filter((r) => r.device_signature).map((r) => r.device_signature)).size;
    return { failures, otpReqs, resets, devices };
  }, [rows]);

  const handleLogoutEverywhere = async () => {
    setSigningAll(true);
    try {
      void logAuthEvent('session_revoked', { scope: 'global' });
    } catch {}
    await supabase.auth.signOut({ scope: 'global' });
    await logout();
  };

  const downloadCsv = () => {
    const head = 'time,email,event,ip,device,this_device\n';
    const body = rows
      .map((r) =>
        [
          r.created_at,
          r.email,
          r.event_type,
          r.ip ?? '',
          r.device_signature ?? '',
          r.device_signature === myDevice ? 'yes' : '',
        ]
          .map((v) => `"${(v ?? '').replace(/"/g, '""')}"`)
          .join(',')
      )
      .join('\n');
    const blob = new Blob([head + body], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'login-history.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const num = (icon: React.ReactNode, value: number | string, label: string, tone: string) => (
    <div className="rounded-2xl bg-card border border-border p-4">
      <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center mb-2', tone)}>{icon}</div>
      <p className="text-2xl font-black tabular-nums">{value}</p>
      <p className="text-[11px] font-bold text-muted-foreground">{label}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-500 mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Xavfsizlik</span>
          </div>
          <h1 className="text-2xl font-black text-foreground font-display tracking-tighter">Hisob xavfsizligi</h1>
          <p className="text-sm text-muted-foreground mt-1 text-[11px]">
            Kirishlar tarixi, qurilmalar va email-xabarlar. Jurnal yozuvlari o‘zgartirilmaydi va o‘chirilmaydi.
          </p>
        </div>
        <button
          type="button"
          onClick={downloadCsv}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border text-xs font-bold text-foreground hover:bg-muted transition-colors"
        >
          <Download className="w-3.5 h-3.5" /> CSV
        </button>
      </div>

      {error && <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-4 text-xs font-semibold text-red-600 dark:text-red-400">{error}</div>}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {num(<LogIn className="w-4 h-4" />, rows.filter((r) => r.event_type === 'login_success').length, "Muvaffaqiyatli kirish", 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400')}
        {num(<AlertTriangle className="w-4 h-4" />, stats.failures, 'Muvaffaqiyatsiz urinishlar', 'bg-red-500/10 text-red-600 dark:text-red-400')}
        {num(<Fingerprint className="w-4 h-4" />, stats.devices, 'Qurilmalar soni', 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400')}
        {num(<Clock className="w-4 h-4" />, rows[0] ? relativeTime(rows[0].created_at) : '—', 'So‘nggi faollik', 'bg-sky-500/10 text-sky-600 dark:text-sky-400')}
      </div>

      <div className="rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
          <h2 className="text-sm font-black text-foreground flex items-center gap-1.5">
            <MonitorSmartphone className="w-4 h-4 text-primary" /> Bu qurilma
          </h2>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
              <MonitorSmartphone className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-foreground">
                Ushbu brauzer {user?.isOwner ? '· Egasining qurilmasi' : ''}
              </p>
              <p className="text-[11px] text-muted-foreground break-all">ID: {myDevice}</p>
            </div>
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black">
              <ShieldCheck className="w-3 h-3" /> Faol
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Sessiya avtomatik yangilanadi (Supabase PKCE), barcha varaqlarda bitta sessiya, har bir varaqda boshqa
            kirishdan darhol chiqariladi.
          </p>
          <button
            type="button"
            onClick={handleLogoutEverywhere}
            disabled={signingAll}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-bold hover:bg-red-500/10 transition-colors disabled:opacity-40"
          >
            {signingAll ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogOut className="w-3.5 h-3.5" />}
            Barcha qurilmalardan chiqish
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
          <h2 className="text-sm font-black text-foreground flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-primary" /> Kirishlar tarixi
          </h2>
          {!loading && <span className="text-[11px] font-bold text-muted-foreground">{rows.length} ta so‘nggi yozuv</span>}
        </div>
        {loading ? (
          <div className="py-12 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : rows.length === 0 ? (
          <p className="py-10 text-center text-xs text-muted-foreground">Hozircha yozuv yo‘q.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border/60">
                  <th className="px-4 py-2 font-black">Event</th>
                  <th className="px-4 py-2 font-black">Email</th>
                  <th className="px-4 py-2 font-black">IP</th>
                  <th className="px-4 py-2 font-black">Qurilma</th>
                  <th className="px-4 py-2 font-black">Vaqt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {rows.map((r) => {
                  const ev = EVENT_META[r.event_type] ?? {
                    label: r.event_type,
                    cls: 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-300',
                    icon: <LogIn className="w-3 h-3" />,
                  };
                  const sameDevice = r.device_signature === myDevice;
                  return (
                    <tr key={r.id} className="text-xs text-foreground">
                      <td className="px-4 py-2.5">
                        <span className={cn('inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black whitespace-nowrap', ev.cls)}>
                          {ev.icon} {ev.label}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 font-semibold whitespace-nowrap">{r.email || '—'}</td>
                      <td className="px-4 py-2.5 text-muted-foreground whitespace-nowrap">{r.ip || '—'}</td>
                      <td className="px-4 py-2.5 text-muted-foreground whitespace-nowrap">
                        {r.device_signature ? (
                          <span className={cn('tabular-nums', sameDevice && 'text-emerald-600 dark:text-emerald-400 font-bold')}>
                            {r.device_signature.slice(0, 8)}
                            {sameDevice && ' · bu qurilma'}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground whitespace-nowrap">{relativeTime(r.created_at)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="p-4 rounded-2xl border border-border bg-card flex justify-between items-center">
        <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground">
          <Clock className="w-3.5 h-3.5" />
          {user?.lastLoginAt ? <>So‘nggi kirish: {relativeTime(user.lastLoginAt)}</> : 'Kirish haqida ma’lumot yo‘q'}
        </div>
        <p className="text-[11px] text-muted-foreground">Login-tarix omboridagi oxirgi 100 yozuv ko‘rsatilmoqda.</p>
      </div>
    </div>
  );
};

export default SecurityPage;