import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ShoppingBag,
  Link2,
  FolderTree,
  Clock,
  Eye,
  Flame,
  PackageX,
  Loader2,
  Search,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useAnalyticsData } from '../../hooks/useAnalyticsData';
import { listBuySessions } from '../../lib/admin/ops';
import { formatPrice } from '../../lib/utils';

interface Pair {
  a: string;
  b: string;
  score: number;
}

export const CustomerInterestPage: React.FC = () => {
  const { products } = useStore();
  const resolvers = useMemo(
    () => ({
      resolveProduct: (id: string) => products.find((p) => p.id === id)?.name ?? 'O‘chirilgan mahsulot',
      resolveCategory: (id: string) => products.find((p) => p.category === id)?.categoryName ?? 'O‘chirilgan toifa',
    }),
    [products]
  );
  const data = useAnalyticsData(resolvers);

  const [query, setQuery] = useState('');

  const stats = useMemo(() => {
    const prepared = new Map<string, number>();
    const preparedUnique = new Map<string, Set<string>>();
    const intentByProduct = new Map<string, Set<string>>();
    const saved = new Map<string, Set<string>>();
    const viewed = new Map<string, Set<string>>();
    const visitorSets = new Map<string, Set<string>>();

    for (const ev of data.events) {
      if (!ev.product_id) continue;
      if (ev.event_type === 'buy_list_add') {
        prepared.set(ev.product_id, (prepared.get(ev.product_id) ?? 0) + 1);
        let set = preparedUnique.get(ev.product_id);
        if (!set) { set = new Set(); preparedUnique.set(ev.product_id, set); }
        set.add(ev.visitor_id);
        let vs = visitorSets.get(ev.visitor_id);
        if (!vs) { vs = new Set(); visitorSets.set(ev.visitor_id, vs); }
        vs.add(ev.product_id);
      } else if (ev.event_type === 'product_save') {
        let set = saved.get(ev.product_id);
        if (!set) { set = new Set(); saved.set(ev.product_id, set); }
        set.add(ev.visitor_id);
      } else if (ev.event_type === 'product_view') {
        let set = viewed.get(ev.product_id);
        if (!set) { set = new Set(); viewed.set(ev.product_id, set); }
        set.add(ev.visitor_id);
      } else if (
        ev.event_type === 'telegram_click' ||
        ev.event_type === 'phone_click' ||
        ev.event_type === 'directions_click' ||
        ev.event_type === 'feed_product_click'
      ) {
        let set = intentByProduct.get(ev.product_id);
        if (!set) { set = new Set(); intentByProduct.set(ev.product_id, set); }
        set.add(ev.visitor_id);
      }
    }

    // Sessions prepared (customer-side registry) also signal intent.
    for (const s of listBuySessions()) {
      if (s.status === 'cancelled') continue;
      for (const item of s.items) {
        prepared.set(item.id, (prepared.get(item.id) ?? 0) + 1);
      }
    }

    const pairs = new Map<string, Pair>();
    for (const set of visitorSets.values()) {
      const arr = Array.from(set);
      for (let i = 0; i < arr.length; i++) {
        for (let j = i + 1; j < arr.length; j++) {
          const a = arr[i].localeCompare(arr[j]) <= 0 ? arr[i] : arr[j];
          const b = a === arr[i] ? arr[j] : arr[i];
          const key = `${a}|${b}`;
          pairs.set(key, { a, b, score: (pairs.get(key)?.score ?? 0) + 1 });
        }
      }
    }

    // High interest, low completion: prepared/saved but zero contact intent.
    const interestNoCompletion: { id: string; prepared: number; saved: number }[] = [];
    for (const [id, count] of prepared) {
      const intents = intentByProduct.get(id)?.size ?? 0;
      if (intents === 0) {
        interestNoCompletion.push({ id, prepared: count, saved: saved.get(id)?.size ?? 0 });
      }
    }
    interestNoCompletion.sort((a, b) => b.prepared - a.prepared);

    const categories = [...data.categories]
      .map((c) => ({
        id: c.id,
        name: resolvers.resolveCategory(c.id),
        views: c.views + c.productOpens,
        saves: c.favorites,
        rank: c.popularityRank,
      }))
      .sort((a, b) => b.views - a.views);

    const peakHours = [...data.hourly].sort((a, b) => b.count - a.count).slice(0, 3);

    return { prepared, preparedUnique, saved, intentByProduct, viewed, pairs, interestNoCompletion, categories, peakHours };
  }, [data.events, data.categories, data.hourly, resolvers]);

  const topPrepared = useMemo(
    () =>
      Array.from(stats.prepared.entries())
        .map(([id, count]) => ({ id, count, unique: stats.preparedUnique.get(id)?.size ?? 0, value: priceOf(products, id) }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8),
    [stats, products]
  );

  const topViewed = useMemo(
    () => Array.from(stats.viewed.entries()).sort((a, b) => b[1].size - a[1].size).slice(0, 8),
    [stats]
  );

  const pairsList = useMemo(
    () =>
      Array.from(stats.pairs.values())
        .sort((a, b) => b.score - a.score)
        .slice(0, 6),
    [stats]
  );

  const abandoned = useMemo(() => {
    const sessions = listBuySessions().filter((s) => s.status === 'expired' || s.status === 'cancelled');
    return sessions
      .map((s) => ({
        code: s.code,
        ts: s.ts,
        pcs: s.items.reduce((sum, i) => sum + i.qty, 0),
        value: s.items.reduce((sum, i) => sum + priceOf(products, i.id) * i.qty, 0),
        status: s.status,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [products]);

  const q = query.trim().toLowerCase();

  if (data.loading) {
    return (
      <div className="space-y-6">
        <Header />
        <div className="flex items-center justify-center py-20 gap-2 text-xs text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          Xaridor qiziqishi yuklanmoqda…
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Header />

      <label className="relative block max-w-md">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Mahsulot yoki kategoriya bo‘yicha filtrlash…"
          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all"
        />
      </label>

      {/* Most prepared products */}
      <Section title="Eng ko‘p tayyorlangan mahsulotlar" icon={<ShoppingBag className="w-4 h-4" />}>
        <RankList
          items={topPrepared
            .filter((r) => !q || resolvers.resolveProduct(r.id).toLowerCase().includes(q))
            .map((r, i) => ({
              name: resolvers.resolveProduct(r.id),
              href: `/admin/products/${r.id}`,
              rank: i + 1,
              right: (
                <>
                  <span className="font-black text-amber-600 dark:text-amber-400 tabular-nums">{r.count}</span>
                  <span className="text-[10px] text-muted-foreground"> marta</span>
                </>
              ),
              sub: `${r.unique} no‘sim · ${formatPrice(r.value)}`,
            }))}
        />
      </Section>

      {/* Frequently bought together */}
      <Section title="Birga tayyorlanadiganlar" icon={<Link2 className="w-4 h-4" />}>
        {pairsList.length === 0 ? (
          <Empty text="Hali etarli ma’lumot yo‘q — xaridorlar ro‘yxatga qo‘shishni boshlaganda bu yerda juftliklar paydo bo‘ladi." />
        ) : (
          <div className="space-y-2">
            {pairsList
              .filter((p) => !q || resolvers.resolveProduct(p.a).toLowerCase().includes(q) || resolvers.resolveProduct(p.b).toLowerCase().includes(q))
              .map((p) => (
                <div key={`${p.a}|${p.b}`} className="flex items-center justify-between gap-3 rounded-xl bg-muted/50 px-3 py-2.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-bold text-foreground truncate">{resolvers.resolveProduct(p.a)}</span>
                    <span className="text-[10px] font-black text-muted-foreground">+</span>
                    <span className="text-xs font-bold text-foreground truncate">{resolvers.resolveProduct(p.b)}</span>
                  </div>
                  <span className="text-[11px] font-black text-muted-foreground tabular-nums shrink-0">{p.score}×</span>
                </div>
              ))}
          </div>
        )}
      </Section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular categories */}
        <Section title="Ommabop kategoriyalar" icon={<FolderTree className="w-4 h-4" />}>
          <RankList
            items={stats.categories
              .filter((c) => !q || c.name.toLowerCase().includes(q))
              .slice(0, 6)
              .map((c, i) => ({
                name: c.name,
                rank: i + 1,
                href: '/admin/categories',
                right: <span className="font-black tabular-nums">{c.views}</span>,
                sub: `${c.saves} sevimlilarda`,
              }))}
          />
        </Section>

        {/* Peak hours */}
        <Section title="Eng faol soatlar" icon={<Clock className="w-4 h-4" />}>
          <div className="grid grid-cols-3 gap-2">
            {stats.peakHours.map((h) => (
              <div key={h.hour} className="rounded-xl bg-muted/50 px-3 py-4 text-center">
                <p className="text-2xl font-black tabular-nums">{String(h.hour).padStart(2, '0')}:00</p>
                <p className="text-[10px] text-muted-foreground">{h.count} ta faollik</p>
              </div>
            ))}
            {stats.peakHours.length === 0 && (
              <p className="text-xs text-muted-foreground col-span-3 py-4 text-center">Hali ma’lumot yo‘q</p>
            )}
          </div>
        </Section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most viewed */}
        <Section title="Eng ko‘p ko‘rilganlar" icon={<Eye className="w-4 h-4" />}>
          <RankList
            items={topViewed
              .filter(([id]) => !q || resolvers.resolveProduct(id).toLowerCase().includes(q))
              .map(([id, set], i) => ({
                name: resolvers.resolveProduct(id),
                href: `/admin/products/${id}`,
                rank: i + 1,
                right: <span className="font-black tabular-nums">{set.size}</span>,
                sub: 'no‘sim xaridor',
              }))}
          />
        </Section>

        {/* High interest, low completion */}
        <Section title="Qiziqish bor, aloqa yo‘q" icon={<Flame className="w-4 h-4" />}>
          {stats.interestNoCompletion.length === 0 ? (
            <Empty text="Barcha qiziqgan mahsulotlar bo‘yicha aloqa kuzatilgan — zo‘r!" />
          ) : (
            <RankList
              items={stats.interestNoCompletion
                .filter((r) => !q || resolvers.resolveProduct(r.id).toLowerCase().includes(q))
                .slice(0, 6)
                .map((r, i) => ({
                  name: resolvers.resolveProduct(r.id),
                  href: `/admin/products/${r.id}`,
                  rank: i + 1,
                  right: <span className="font-black text-red-500 tabular-nums">{r.prepared}</span>,
                  sub: `${r.saved} sevimli, aloqa 0 — mahsulotni feedda ko‘rsating`,
                }))}
            />
          )}
        </Section>
      </div>

      {/* Abandoned sessions */}
      <Section title="Qarovsiz qolgan sessiyalar" icon={<PackageX className="w-4 h-4" />}>
        {abandoned.length === 0 ? (
          <Empty text="Hozircha qarovsiz sessiya yo‘q." />
        ) : (
          <div className="space-y-2">
            {abandoned.map((s) => (
              <div key={s.code} className="flex items-center justify-between gap-3 rounded-xl bg-muted/50 px-3 py-2.5">
                <div className="min-w-0">
                  <p className="font-mono font-black tracking-widest text-xs">{s.code}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {s.pcs} dona · {new Date(s.ts).toLocaleString()}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-black">{formatPrice(s.value)}</p>
                  <p className="text-[10px] text-muted-foreground">{s.status === 'expired' ? 'Muddati tugagan' : 'Bekor'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      <p className="text-[11px] text-muted-foreground px-1">
        Barcha ko‘rsatkichlar real foydalanuvchi ma’lumotlaridan (analitika + sessiya yozuvlari) hisoblanadi, taxminiy qiymat emas.
      </p>
    </div>
  );
};

function priceOf(products: ReturnType<typeof useStore>['products'], id: string): number {
  const p = products.find((x) => x.id === id);
  return typeof p?.price === 'number' ? p.price : 0;
}

function Header() {
  return (
    <div>
      <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-500 mb-1">
        <Sparkles className="w-3.5 h-3.5" />
        <span>Analitika</span>
      </div>
      <h1 className="text-2xl font-black text-foreground font-display tracking-tighter">Xaridor qiziqishi</h1>
      <p className="text-sm text-muted-foreground mt-1">
        Mijozlar nimaga qiziqayotgani — nima tayyorlanyapti, nima birga olinyapti, qachon faol.
      </p>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-muted-foreground mb-3">
        {icon}
        {title}
      </h3>
      {children}
    </div>
  );
}

interface RankEntry {
  name: string;
  href: string;
  rank: number;
  right: React.ReactNode;
  sub: string;
}

function RankList({ items }: { items: RankEntry[] }) {
  if (items.length === 0) {
    return <p className="text-xs text-muted-foreground py-4 text-center">Natija yo‘q</p>;
  }
  return (
    <div className="space-y-1.5">
      {items.map((it) => (
        <Link
          key={`${it.rank}-${it.name}`}
          to={it.href}
          className="flex items-center gap-3 rounded-xl px-2.5 py-2 hover:bg-muted/60 transition-colors group"
        >
          <span className="w-6 h-6 rounded-lg bg-muted text-[10px] font-black flex items-center justify-center text-muted-foreground group-hover:text-foreground shrink-0">
            {it.rank}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-foreground truncate">{it.name}</p>
            <p className="text-[10px] text-muted-foreground truncate">{it.sub}</p>
          </div>
          <div className="text-xs shrink-0">{it.right}</div>
        </Link>
      ))}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="text-xs text-muted-foreground py-4 text-center">{text}</p>;
}

export default CustomerInterestPage;