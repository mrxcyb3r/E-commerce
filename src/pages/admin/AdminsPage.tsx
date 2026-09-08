import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  UserCog,
  Plus,
  MailCheck,
  Shield,
  ShieldX,
  RotateCcw,
  Crown,
  Loader2,
  Users as UsersIcon,
  Link2,
  CheckCircle2,
  Clock,
  Ban,
  Power,
} from 'lucide-react';
import { supabase } from '../../lib/supabase/client';
import { useAuth } from '../../context/AuthContext';
import { StaffRole } from '../../types/supabase-db';
import { canManageUsers } from '../../lib/admin/permissions';
import { logBusinessAudit } from '../../lib/auth/security';
import { relativeTime } from '../../lib/admin/relativeTime';
import { AUTH_CONFIG } from '../../lib/auth/config';

interface Member {
  id: string;
  email: string;
  username: string;
  role: StaffRole;
  full_name: string | null;
  is_suspended: boolean;
  last_login_at: string | null;
  created_at: string;
}

interface Invite {
  id: string;
  email: string;
  status: 'pending' | 'used' | 'revoked';
  created_at: string;
  used_at: string | null;
}

const ROLE_META: Record<StaffRole, { label: string; cls: string }> = {
  owner: { label: 'Egasi', cls: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  admin: { label: 'Administrator', cls: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  manager: { label: 'Menejer', cls: 'bg-sky-500/10 text-sky-600 dark:text-sky-400' },
  editor: { label: 'Muharrir', cls: 'bg-violet-500/10 text-violet-600 dark:text-violet-400' },
  staff: { label: 'Xodim', cls: 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-300' },
  support: { label: 'Support', cls: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400' },
  viewer: { label: 'Kuzatuvchi', cls: 'bg-slate-500/10 text-slate-600 dark:text-slate-400' },
};

const STAR_SELF_ROLES: StaffRole[] = ['owner', 'admin', 'manager', 'editor', 'staff', 'support'];

export const AdminsPage: React.FC = () => {
  const { user } = useAuth();
  const canManage = canManageUsers(user?.role);

  const [members, setMembers] = useState<Member[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    const m = await supabase.from('profiles').select('id,email,username,role,full_name,is_suspended,last_login_at,created_at').order('created_at', { ascending: true });
    const i = await supabase.from('allowed_admin_emails').select('id,email,status,created_at,used_at').order('created_at', { ascending: false });
    if (!m.error) setMembers((m.data ?? []) as unknown as Member[]);
    if (!i.error) setInvites((i.data ?? []) as unknown as Invite[]);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const stats = useMemo(() => {
    const active = members.filter((m) => !m.is_suspended && m.role !== 'viewer').length;
    const pending = invites.filter((i) => i.status === 'pending').length;
    const suspended = members.filter((m) => m.is_suspended).length;
    return { active, pending, suspended };
  }, [members, invites]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManage) return;
    const email = inviteEmail.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Email manzilini to'g'ri kiriting.");
      return;
    }
    if (email === AUTH_CONFIG.ownerEmail.toLowerCase()) {
      setError('Owner email taklif qilinmaydi — u doim to‘liq huquqqa ega.');
      return;
    }
    setBusy(true);
    setError(null);
    setNotice(null);
    const { error: err } = await supabase.from('allowed_admin_emails').insert({
      email,
      store_id: 'default',
      status: 'pending',
      created_by: user?.id ?? null,
    });
    setBusy(false);
    if (err) {
      setError(err.code === '23505' ? 'Bu email allaqachon ro‘yxatda.' : "Taklif yaratilmadi. Faqat do'kon egasi taklif yaratishi mumkin.");
      return;
    }
    void logBusinessAudit('invite_created', 'users', null, { email });
    setInviteEmail('');
    setNotice('Taklif yuborildi — email ro‘yxatga kiritildi. U kirishi bilan ro‘li avtomatik «Administrator» bo‘ladi.');
    void load();
  };

  const handleRevoke = async (invite: Invite) => {
    if (!canManage) return;
    await supabase.from('allowed_admin_emails').update({ status: 'revoked' }).eq('id', invite.id);
    void logBusinessAudit('invite_revoked', 'users', invite.id, { email: invite.email });
    void load();
  };

  const handleRole = async (member: Member, role: StaffRole) => {
    if (!canManage || member.role === 'owner') return;
    await supabase.from('profiles').update({ role }).eq('id', member.id);
    void logBusinessAudit('member_role_changed', 'users', member.id, { email: member.email, to: role, from: member.role });
    void load();
  };

  const handleSuspend = async (member: Member) => {
    if (!canManage || member.role === 'owner') return;
    await supabase.from('profiles').update({ is_suspended: !member.is_suspended }).eq('id', member.id);
    void logBusinessAudit(member.is_suspended ? 'member_unsuspended' : 'member_suspended', 'users', member.id, { email: member.email });
    void load();
  };

  const owner = members.find((m) => m.role === 'owner');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-500 mb-1">
            <UserCog className="w-3.5 h-3.5" />
            <span>Xavfsizlik</span>
          </div>
          <h1 className="text-2xl font-black text-foreground font-display tracking-tighter">Xodimlar va takliflar</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Ro‘yxatdan o‘tish ochiq emas — har bir admin emailingiz orqali taklif qilinadi.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-4 text-xs font-semibold text-red-600 dark:text-red-400">{error}</div>
      )}
      {notice && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-xs font-semibold text-emerald-600 dark:text-emerald-400">{notice}</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-2xl bg-card border border-border p-4">
          <p className="text-[11px] font-bold text-muted-foreground">Faol a’zolar</p>
          <p className="text-2xl font-black tabular-nums">{stats.active}</p>
        </div>
        <div className="rounded-2xl bg-card border border-border p-4">
          <p className="text-[11px] font-bold text-muted-foreground">Kutilayotgan takliflar</p>
          <p className="text-2xl font-black tabular-nums">{stats.pending}</p>
        </div>
        <div className="rounded-2xl bg-card border border-border p-4">
          <p className="text-[11px] font-bold text-muted-foreground">Suspense qilinganlar</p>
          <p className="text-2xl font-black tabular-nums">{stats.suspended}</p>
        </div>
      </div>

      {owner && (
        <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent p-5">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Crown className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-black text-foreground">{owner.full_name || owner.username}</p>
              <p className="text-xs text-muted-foreground truncate">{owner.email}</p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-black">
              <Shield className="w-3 h-3" /> Platforma egasi · o‘zgarmas
            </span>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
          <h2 className="text-sm font-black text-foreground flex items-center gap-1.5">
            <UsersIcon className="w-4 h-4 text-primary" /> A’zolar
          </h2>
          <span className="text-[11px] font-bold text-muted-foreground">{members.length} ta</span>
        </div>
        {members.length === 0 ? (
          <p className="py-10 text-center text-xs text-muted-foreground">A’zolar hali yo‘q.</p>
        ) : (
          <ul className="divide-y divide-border/60">
            {members.map((m) => {
              const r = ROLE_META[m.role];
              const self = m.id === user?.id;
              return (
                <li key={m.id} className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-9 h-9 rounded-xl bg-muted text-muted-foreground flex items-center justify-center font-black shrink-0">
                      {(m.full_name || m.username || m.email || '?').charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground truncate">
                        {m.full_name || m.username}
                        {self && <span className="text-muted-foreground font-medium"> (siz)</span>}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {m.email}
                        {m.last_login_at && <span className="ml-2 inline-flex items-center gap-1"><Clock className="w-3 h-3" /> {relativeTime(m.last_login_at)}</span>}
                      </p>
                    </div>
                  </div>

                  {m.is_suspended && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 text-[10px] font-black shrink-0">
                      <Ban className="w-3 h-3" /> Suspend
                    </span>
                  )}
                  {m.role !== 'owner' ? (
                    <select
                      value={m.role}
                      disabled={!canManage}
                      onChange={(e) => handleRole(m, e.target.value as StaffRole)}
                      className="px-2 py-1.5 rounded-lg bg-background border border-border text-[11px] font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/30 disabled:opacity-50"
                      aria-label={`${m.email} roli`}
                    >
                      {STAR_SELF_ROLES.map((r2) => (
                        <option key={r2} value={r2}>
                          {ROLE_META[r2].label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-black ${r.cls} shrink-0`}>
                      <b className="w-1.5 h-1.5 rounded-full bg-amber-400" /> {r.label}
                    </span>
                  )}

                  {canManage && m.role !== 'owner' && (
                    <button
                      type="button"
                      onClick={() => handleSuspend(m)}
                      title={m.is_suspended ? 'Faollashtirish' : 'Suspense qilish'}
                      className={`p-2 rounded-lg border border-border transition-colors ${
                        m.is_suspended ? 'text-emerald-600 hover:bg-emerald-500/10' : 'text-muted-foreground hover:text-red-600 hover:bg-red-500/10'
                      } shrink-0`}
                    >
                      {m.is_suspended ? <Power className="w-4 h-4" /> : <ShieldX className="w-4 h-4" />}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
          <h2 className="text-sm font-black text-foreground flex items-center gap-1.5">
            <Link2 className="w-4 h-4 text-primary" /> Takliflar (email allowlist)
          </h2>
          {!canManage && <span className="text-[10px] font-bold text-muted-foreground">Faqat egasi boshqaradi</span>}
        </div>

        {canManage && (
          <form onSubmit={handleInvite} className="p-4 border-b border-border/60 flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <MailCheck className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="yangi.xodim@company.uz"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={busy}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-foreground text-background dark:bg-primary dark:text-primary-foreground text-xs font-black transition-all hover:opacity-90 active:scale-95 disabled:opacity-40"
            >
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Taklif berish
            </button>
          </form>
        )}

        {invites.length === 0 ? (
          <p className="py-8 text-center text-xs text-muted-foreground">Takliflar yo‘q.</p>
        ) : (
          <ul className="divide-y divide-border/60">
            {invites.map((inv) => (
              <li key={inv.id} className="flex flex-col sm:flex-row sm:items-center gap-2 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-foreground truncate">{inv.email}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {inv.status === 'pending' && <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" /> Kutilmoqda · {relativeTime(inv.created_at)}</span>}
                    {inv.status === 'used' && <span className="inline-flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Ro‘yxatdan o‘tdi {inv.used_at ? relativeTime(inv.used_at) : ''}</span>}
                    {inv.status === 'revoked' && <span className="inline-flex items-center gap-1"><ShieldX className="w-3 h-3" /> Bekor qilingan</span>}
                  </p>
                </div>
                {inv.status === 'pending' && canManage && (
                  <button
                    type="button"
                    onClick={() => handleRevoke(inv)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-[11px] font-bold text-muted-foreground hover:text-red-600 hover:border-red-500/40 transition-colors shrink-0"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Bekor qilish
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {!canManage && (
        <p className="text-[11px] text-muted-foreground">
          Siz a’zolarni ko‘ra olasiz, lekin taklif va rol boshqaruvi faqat platforma egasi uchun.
        </p>
      )}
    </div>
  );
};

export default AdminsPage;