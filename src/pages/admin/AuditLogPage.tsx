import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollText, Search, Lock, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase/client';
import { relativeTime } from '../../lib/admin/relativeTime';
import { cn } from '../../lib/utils';

interface AuditRow {
  id: number;
  actor_email: string;
  action: string;
  entity: string;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  ip: string | null;
  created_at: string;
}

const ACTION_LABEL: Record<string, string> = {
  login: 'Login',
  logout: 'Logout',
  password_changed: 'Parol almashtirildi',
  email_changed: 'Email almashtirildi',
  invite_created: 'Taklif yaratildi',
  invite_revoked: 'Taklif bekor qilindi',
  member_role_changed: 'Rol o‘zgartirildi',
  member_suspended: 'A’zo suspend qilindi',
  member_unsuspended: 'A’zo faollashtirildi',
  store_updated: 'Do‘kon yangilandi',
  product_deleted: 'Mahsulot o‘chirildi',
  campaign_published: 'Aktsiya nashr qilindi',
  analytics_exported: 'Analitika eksport qilindi',
};

const ENTITY_LABEL: Record<string, string> = {
  auth: 'Auth',
  users: 'Foydalanuvchilar',
  store: 'Do‘kon',
  products: 'Mahsulotlar',
  campaigns: 'Aktsiyalar',
  analytics: 'Analitika',
};

export const AuditLogPage: React.FC = () => {
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [entity, setEntity] = useState('all');

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error: err } = (await supabase
      .from('auth_audit_log')
      .select('id,actor_email,action,entity,entity_id,metadata,ip,created_at')
      .order('created_at', { ascending: false })
      .limit(250)) as unknown as { data: AuditRow[] | null; error: { message?: string } | null };
    if (err) setError('Audit jurnalini o‘qib bo‘lmadi — faqat egasi va administratorlar ko‘ra oladi.');
    else setRows(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      const matchesQ =
        !q ||
        r.actor_email.toLowerCase().includes(q) ||
        r.action.toLowerCase().includes(q) ||
        r.entity.toLowerCase().includes(q) ||
        (r.entity_id ?? '').toLowerCase().includes(q) ||
        JSON.stringify(r.metadata ?? {}).toLowerCase().includes(q);
      const matchesE = entity === 'all' || r.entity === entity;
      return matchesQ && matchesE;
    });
  }, [rows, query, entity]);

  const entities = useMemo(() => Array.from(new Set(rows.map((r) => r.entity))).sort(), [rows]);

  return (
    <div className="space-y-6">
      <div>
        <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-500 mb-1">
          <ScrollText className="w-3.5 h-3.5" />
          <span>Xavfsizlik</span>
        </div>
        <h1 className="text-2xl font-black text-foreground font-display tracking-tighter">Audit jurnali</h1>
        <p className="text-sm text-muted-foreground mt-1 text-[11px]">
          Barcha muhim amallarning o‘zgarmas izi — kiringiz, chiqishingiz, o‘zgartirishlar, nashrlar va eksportlar.
        </p>
      </div>

      <div className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-600 dark:text-amber-400 text-[11px] font-bold">
        <Lock className="w-3.5 h-3.5" />
        Jurnaldagi yozuvlarni o‘chirish yoki o‘zgartirish mumkin emas (DB darajasida taqiqlangan).
      </div>

      {error && <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-4 text-xs font-semibold text-red-600 dark:text-red-400">{error}</div>}

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Email, amal, obyekt yoki ID bo‘yicha qidirish…"
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-card border border-border text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all"
          />
        </div>
        <select
          value={entity}
          onChange={(e) => setEntity(e.target.value)}
          className="px-3 py-2.5 rounded-xl bg-card border border-border text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/30"
        >
          <option value="all">Barcha bo‘limlar</option>
          {entities.map((e2) => (
            <option key={e2} value={e2}>
              {ENTITY_LABEL[e2] ?? e2}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-2xl border border-border bg-card">
        {loading ? (
          <div className="py-14 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="py-12 text-center text-xs text-muted-foreground">Yozuvlar topilmadi.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border/60">
                  <th className="px-4 py-2 font-black">Amal</th>
                  <th className="px-4 py-2 font-black">Kim</th>
                  <th className="px-4 py-2 font-black">Bo‘lim</th>
                  <th className="px-4 py-2 font-black">Tafsilot</th>
                  <th className="px-4 py-2 font-black">IP</th>
                  <th className="px-4 py-2 font-black">Vaqt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filtered.map((r) => (
                  <tr key={r.id} className="text-xs text-foreground">
                    <td className="px-4 py-2.5">
                      <span className="px-2 py-1 rounded-lg bg-muted text-muted-foreground text-[10px] font-black whitespace-nowrap">
                        {ACTION_LABEL[r.action] ?? r.action}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 font-semibold whitespace-nowrap">{r.actor_email || 'tizim'}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <span className={cn('px-2 py-1 rounded-lg text-[10px] font-black', entity === r.entity ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground')}>
                        {ENTITY_LABEL[r.entity] ?? r.entity}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground max-w-[260px] truncate">
                      {r.entity_id && <span className="tabular-nums font-mono">{r.entity_id}</span>}
                      <span className="block truncate">{r.metadata && Object.keys(r.metadata).length > 0 ? JSON.stringify(r.metadata).slice(0, 80) : ''}</span>
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground whitespace-nowrap">{r.ip || '—'}</td>
                    <td className="px-4 py-2.5 text-muted-foreground whitespace-nowrap">{relativeTime(r.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {!loading && (
        <p className="text-[11px] text-muted-foreground">
          So‘nggi 250 yozuv ko‘rsatilmoqda ({filtered.length} ta filtr bo‘yicha). To‘liq arxiv doimo bazada saqlanadi.
        </p>
      )}
    </div>
  );
};

export default AuditLogPage;