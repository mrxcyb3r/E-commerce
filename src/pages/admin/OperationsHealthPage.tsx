import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  PackageX,
  PackageSearch,
  ImageOff,
  AlignLeft,
  FolderOpen,
  VideoOff,
  EyeOff,
  HeartOff,
  ShoppingBag,
  Wrench,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useAnalyticsData } from '../../hooks/useAnalyticsData';
import { track } from '../../lib/analytics/client';

interface IssueGroup {
  key: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  tone: 'red' | 'amber' | 'sky';
  fixHref: string;
  ids: string[];
}

export const OperationsHealthPage: React.FC = () => {
  const { products } = useStore();
  const resolvers = useMemo(
    () => ({
      resolveProduct: (id: string) => products.find((p) => p.id === id)?.name ?? 'O‘chirilgan mahsulot',
      resolveCategory: () => '—',
    }),
    [products]
  );
  const data = useAnalyticsData(resolvers);

  const productMap = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

  const attention = useMemo(() => {
    const viewed = new Set<string>();
    const saved = new Set<string>();
    const prepared = new Set<string>();
    for (const ev of data.events) {
      if (!ev.product_id) continue;
      if (ev.event_type === 'product_view') viewed.add(ev.product_id);
      else if (ev.event_type === 'product_save') saved.add(ev.product_id);
      else if (ev.event_type === 'buy_list_add') prepared.add(ev.product_id);
    }

    const noImage = products.filter((p) => !p.images || p.images.length === 0).map((p) => p.id);
    const noDesc = products.filter((p) => {
      const desc = (p.short_description ?? '') + ' ' + (p.description ?? '');
      return desc.trim().length < 20;
    }).map((p) => p.id);
    const noCategory = products.filter((p) => !p.category?.trim()).map((p) => p.id);
    const noVideo = products.filter((p) => !p.videoUrl).map((p) => p.id);
    const outOfStock = products.filter((p) => p.inStock === false).map((p) => p.id);
    const lowStock = products
      .filter((p) => p.inStock && (p.stockCount ?? 0) > 0 && (p.stockCount ?? 0) <= 3)
      .map((p) => p.id);
    const neverViewed = products.filter((p) => !viewed.has(p.id)).map((p) => p.id);
    const neverSaved = products.filter((p) => !saved.has(p.id)).map((p) => p.id);
    const neverPrepared = products.filter((p) => !prepared.has(p.id)).map((p) => p.id);

    return { noImage, noDesc, noCategory, noVideo, outOfStock, lowStock, neverViewed, neverSaved, neverPrepared };
  }, [products, data.events]);

  const groups: IssueGroup[] = [
    {
      key: 'out-of-stock',
      title: 'Zaxirada yo‘q',
      description: 'Sotuvda mavjud emas — mijozgargi oldin zaxirani kiring.',
      icon: <PackageX className="w-5 h-5" />,
      tone: 'red',
      fixHref: '/admin/inventory',
      ids: attention.outOfStock,
    },
    {
      key: 'low-stock',
      title: 'Kam zaxira',
      description: '3 yoki undan kam dona qolgan — qayta buyurtma vaqti.',
      icon: <PackageSearch className="w-5 h-5" />,
      tone: 'amber',
      fixHref: '/admin/inventory',
      ids: attention.lowStock,
    },
    {
      key: 'no-image',
      title: 'Rasmsiz mahsulotlar',
      description: 'Rasmga ega bo‘lmagan mahsulotlar ko‘rilmaydi.',
      icon: <ImageOff className="w-5 h-5" />,
      tone: 'amber',
      fixHref: '/admin/products',
      ids: attention.noImage,
    },
    {
      key: 'no-description',
      title: 'Tavsifi yo‘q',
      description: 'Qisqa yoki bo‘sh tavsif — mahsulot «to‘liq» ko‘rinmaydi.',
      icon: <AlignLeft className="w-5 h-5" />,
      tone: 'amber',
      fixHref: '/admin/products',
      ids: attention.noDesc,
    },
    {
      key: 'no-category',
      title: 'Kategoriyasiz',
      description: 'Kategoriya tanlanmagan mahsulotlar katalogda adashadi.',
      icon: <FolderOpen className="w-5 h-5" />,
      tone: 'amber',
      fixHref: '/admin/products',
      ids: attention.noCategory,
    },
    {
      key: 'no-video',
      title: 'Videosiz mahsulotlar',
      description: 'Video qo‘shilgan mahsulotlar ko‘proq ekranda ko‘rinadi.',
      icon: <VideoOff className="w-5 h-5" />,
      tone: 'sky',
      fixHref: '/admin/feed',
      ids: attention.noVideo,
    },
    {
      key: 'never-viewed',
      title: 'Hech ko‘rilmagan',
      description: 'Bir marta ham ochilmagan — feed yoki bosh sahifada joy bering.',
      icon: <EyeOff className="w-5 h-5" />,
      tone: 'sky',
      fixHref: '/admin/feed',
      ids: attention.neverViewed,
    },
    {
      key: 'never-saved',
      title: 'Sevimlilarga qo‘shilmagan',
      description: 'Xaridorlar e’tiborini tortmayapti — tavsif/rasm yaxshilang.',
      icon: <HeartOff className="w-5 h-5" />,
      tone: 'sky',
      fixHref: '/admin/products',
      ids: attention.neverSaved,
    },
    {
      key: 'never-prepared',
      title: 'Xaridga tayyorlanmagan',
      description: 'Buy listga qo‘shilmagan — katta aylanma imkoniyat.',
      icon: <ShoppingBag className="w-5 h-5" />,
      tone: 'sky',
      fixHref: '/admin/products',
      ids: attention.neverPrepared,
    },
  ];

  const totalOpen = groups.reduce((s, g) => s + g.ids.length, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-500 mb-1">
            <Wrench className="w-3.5 h-3.5" />
            <span>Katalog</span>
          </div>
          <h1 className="text-2xl font-black text-foreground font-display tracking-tighter">E’tibor markazi</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Do‘koningizda eng ko‘p e’tibor talab qiladigan joylar — bitta sahifada.
          </p>
        </div>
        <div className="rounded-xl bg-foreground text-background dark:bg-primary dark:text-primary-foreground px-4 py-2.5 text-sm font-black tabular-nums">
          {data.loading ? '…' : `${totalOpen} ochiq holat`}
        </div>
      </div>

      {data.error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-xs font-bold text-destructive">
          {data.error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {groups.map((g) => (
          <div key={g.key} className="rounded-2xl border border-border bg-card p-4 flex flex-col">
            <div className="flex items-start justify-between gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${toneBg(g.tone)}`}>
                {g.icon}
              </div>
              <span className={`text-lg font-black tabular-nums ${toneText(g.tone)}`}>{g.ids.length}</span>
            </div>
            <h3 className="text-sm font-black text-foreground mt-3">{g.title}</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">{g.description}</p>

            <div className="mt-3 space-y-1 min-h-[2rem]">
              {g.ids.length === 0 ? (
                <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">Hammasi joyida ✓</p>
              ) : (
                g.ids.slice(0, 3).map((id) => {
                  const p = productMap.get(id);
                  return (
                    <Link
                      key={id}
                      to={`/admin/products/${id}`}
                      className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-muted/50 hover:bg-muted text-xs text-foreground transition-colors"
                    >
                      <span className="truncate font-medium">{p?.name ?? 'O‘chirilgan mahsulot'}</span>
                      <ArrowRight className="w-3 h-3 shrink-0 opacity-60" />
                    </Link>
                  );
                })
              )}
              {g.ids.length > 3 && (
                <p className="text-[10px] text-muted-foreground px-1">+{g.ids.length - 3} ta yana…</p>
              )}
            </div>

            <div className="mt-auto pt-3">
              <Link
                to={g.fixHref}
                onClick={() => track('inventory_issue_fixed', { metadata: { issue: g.key } })}
                className={`w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-black transition-all active:scale-[0.98] ${fixButton(g.tone)}`}
              >
                <Wrench className="w-3.5 h-3.5" />
                Tuzatish
              </Link>
            </div>
          </div>
        ))}
      </div>

      {data.loading && (
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          Analitik ma’lumotlar yuklanmoqda…
        </div>
      )}
    </div>
  );
};

function toneBg(tone: IssueGroup['tone']): string {
  switch (tone) {
    case 'red':
      return 'bg-red-500/10 text-red-600 dark:text-red-400';
    case 'amber':
      return 'bg-amber-500/10 text-amber-600 dark:text-amber-400';
    default:
      return 'bg-sky-500/10 text-sky-600 dark:text-sky-400';
  }
}

function toneText(tone: IssueGroup['tone']): string {
  switch (tone) {
    case 'red':
      return 'text-red-600 dark:text-red-400';
    case 'amber':
      return 'text-amber-600 dark:text-amber-400';
    default:
      return 'text-sky-600 dark:text-sky-400';
  }
}

function fixButton(tone: IssueGroup['tone']): string {
  switch (tone) {
    case 'red':
      return 'bg-red-500/10 text-red-700 dark:text-red-300 hover:bg-red-500/20';
    case 'amber':
      return 'bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20';
    default:
      return 'bg-sky-500/10 text-sky-700 dark:text-sky-300 hover:bg-sky-500/20';
  }
}

export default OperationsHealthPage;