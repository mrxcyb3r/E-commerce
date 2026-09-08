import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity as ActivityIcon,
  Package,
  FolderTree,
  Film,
  Sparkles,
  Quote,
  HelpCircle,
  Store,
  ShoppingBag,
  Banknote,
  Megaphone,
  Boxes,
  Rocket,
  Search,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { AdminActivityLog } from '../../types/cms';
import { track } from '../../lib/analytics/client';

const ENTITY_ICONS: Record<AdminActivityLog['entity'], React.ReactNode> = {
  product: <Package className="w-4 h-4" />,
  category: <FolderTree className="w-4 h-4" />,
  video: <Film className="w-4 h-4" />,
  prompt: <Sparkles className="w-4 h-4" />,
  testimonial: <Quote className="w-4 h-4" />,
  faq: <HelpCircle className="w-4 h-4" />,
  store: <Store className="w-4 h-4" />,
  buySession: <ShoppingBag className="w-4 h-4" />,
  sale: <Banknote className="w-4 h-4" />,
  campaign: <Megaphone className="w-4 h-4" />,
  inventory: <Boxes className="w-4 h-4" />,
  onboarding: <Rocket className="w-4 h-4" />,
};

const ENTITY_LABELS: Record<AdminActivityLog['entity'], string> = {
  product: 'Mahsulot',
  category: 'Kategoriya',
  video: 'Video',
  prompt: 'Prompt',
  testimonial: 'Sharh',
  faq: 'Savol-javob',
  store: 'Do‘kon',
  buySession: 'Xarid sessiyasi',
  sale: 'Sotuv',
  campaign: 'Aktsiya',
  inventory: 'Inventar',
  onboarding: 'Sozlash',
};

export const ActivityPage: React.FC = () => {
  const { activityLogs } = useStore();
  const [entity, setEntity] = useState<AdminActivityLog['entity'] | 'all'>('all');
  const [query, setQuery] = useState('');

  useEffect(() => {
    track('activity_opened', { metadata: { entries: activityLogs.length } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = activityLogs.filter((l) => {
      if (entity !== 'all' && l.entity !== entity) return false;
      if (q && !l.description.toLowerCase().includes(q)) return false;
      return true;
    });

    const buckets: { date: string; logs: AdminActivityLog[] }[] = [];
    for (const log of filtered) {
      const date = new Date(log.timestamp).toLocaleDateString('uz-UZ', { day: '2-digit', month: 'short', year: 'numeric' });
      const last = buckets[buckets.length - 1];
      if (last && last.date === date) last.logs.push(log);
      else buckets.push({ date, logs: [log] });
    }
    return buckets;
  }, [activityLogs, entity, query]);

  const counts = useMemo(() => {
    const map = new Map<AdminActivityLog['entity'], number>();
    for (const log of activityLogs) map.set(log.entity, (map.get(log.entity) ?? 0) + 1);
    return map;
  }, [activityLogs]);

  return (
    <div className="space-y-6">
      <div>
        <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-500 mb-1">
          <ActivityIcon className="w-3.5 h-3.5" />
          <span>Do‘kon</span>
        </div>
        <h1 className="text-2xl font-black text-foreground font-display tracking-tighter">Faoliyat tarixi</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Do‘konda sodir bo‘lgan barcha amallar — yangisidan eskisiga, xronologik tartibda.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-card p-3">
        <div className="flex gap-1.5 overflow-x-auto mr-auto">
          <EntityChip active={entity === 'all'} onClick={() => setEntity('all')} label={`Barchasi · ${activityLogs.length}`} />
          {(Object.keys(ENTITY_LABELS) as AdminActivityLog['entity'][]).map((e) => (
            <EntityChip
              key={e}
              active={entity === e}
              onClick={() => setEntity(e)}
              label={`${ENTITY_LABELS[e]}`}
              count={counts.get(e) ?? 0}
            />
          ))}
        </div>
        <label className="relative min-w-[160px] flex-1">
          <Search className="absolute left-3 top-2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Qidirish…"
            className="w-full pl-8 pr-3 py-2 rounded-lg bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all"
          />
        </label>
      </div>

      {groups.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-muted text-muted-foreground flex items-center justify-center mx-auto">
            <ActivityIcon className="w-7 h-7" />
          </div>
          <h3 className="text-sm font-black text-foreground">Faoliyat yo‘q</h3>
          <p className="text-xs text-muted-foreground">
            Mahsulot qo‘shish, video yuklash, sotuv yakunlash kabi amallar shu yerda ko‘rinadi.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map((bucket) => (
            <div key={bucket.date}>
              <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2 px-1">{bucket.date}</h3>
              <div className="rounded-2xl border border-border bg-card divide-y divide-border/60">
                {bucket.logs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 px-4 py-3">
                    <div className="w-9 h-9 rounded-xl bg-muted text-muted-foreground flex items-center justify-center shrink-0">
                      {ENTITY_ICONS[log.entity]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-foreground leading-snug">{log.description}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {ENTITY_LABELS[log.entity]} · {ActionLabel[log.action]}
                      </p>
                    </div>
                    <span className="text-[10px] text-muted-foreground tabular-nums shrink-0">
                      {new Date(log.timestamp).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ActionLabel: Record<AdminActivityLog['action'], string> = {
  create: 'Yaratildi',
  update: 'Yangilandi',
  delete: 'O‘chirildi',
  publish: 'Nashr',
  setting: 'Sozlama',
  complete: 'Yakunlandi',
  cancel: 'Bekor qilindi',
  expire: 'Muddati tugadi',
  start: 'Boshlandi',
  warning: 'Ogohlantirish',
};

function EntityChip({ active, onClick, label, count }: { active: boolean; onClick: () => void; label: string; count?: number }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-black transition-all ${
        active ? 'bg-foreground text-background dark:bg-primary dark:text-primary-foreground' : 'bg-muted/60 text-muted-foreground hover:text-foreground'
      }`}
    >
      {label}
      {count !== undefined && <span className="ml-1 opacity-60 tabular-nums">{count}</span>}
    </button>
  );
}

export default ActivityPage;