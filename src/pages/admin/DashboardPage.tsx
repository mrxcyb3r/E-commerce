import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  FolderTree,
  Film,
  Sparkles,
  Star,
  AlertTriangle,
  Plus,
  ArrowRight,
  TrendingUp,
  Clock,
  ExternalLink,
  MessageSquare,
  ThumbsUp,
  Eye,
  Heart,
  Send,
  Boxes,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useVideoFeed } from '../../context/VideoContext';
import { useI18n } from '../../i18n/I18nContext';
import { useBrand } from '../../hooks/useBrand';
import { supabase } from '../../lib/supabase/client';
import type { AdminActivityLog } from '../../types/cms';
import { motion } from 'motion/react';
import { PageHeader, ActionButton } from '../../components/admin/ui';

const entityMeta: Record<AdminActivityLog['entity'], { icon: typeof Package; color: string }> = {
  product: { icon: Package, color: 'text-blue-500' },
  category: { icon: FolderTree, color: 'text-purple-500' },
  video: { icon: Film, color: 'text-teal-500' },
  prompt: { icon: Sparkles, color: 'text-amber-500' },
  testimonial: { icon: Star, color: 'text-amber-500' },
  faq: { icon: MessageSquare, color: 'text-muted-foreground' },
  store: { icon: Package, color: 'text-muted-foreground' },
};

export const DashboardPage: React.FC = () => {
  const {
    products,
    categories,
    prompts,
    featuredProducts,
    newProducts,
    discountedProducts,
    activityLogs,
    storeInfo,
  } = useStore();
  const { publishedVideos } = useVideoFeed();
  const { t } = useI18n();
  const brand = useBrand();

  const outOfStockCount = products.filter((p) => !p.inStock || (p.stockCount !== undefined && p.stockCount <= 0)).length;
  const lowStockCount = products.filter((p) => p.inStock && p.stockCount !== undefined && p.stockCount > 0 && p.stockCount <= 3).length;

  const [commentCount, setCommentCount] = useState(0);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    let active = true;
    const countTable = async (table: string, setter: (n: number) => void) => {
      try {
        const { count, error } = await supabase
          .from(table as any)
          .select('*', { count: 'exact', head: true });
        if (!active) return;
        if (error) throw error;
        setter(count ?? 0);
      } catch {
        if (active) setter(0);
      }
    };
    (async () => {
      await countTable('feed_comments', setCommentCount);
      await countTable('feed_likes', setLikeCount);
    })();
    return () => { active = false; };
  }, []);

  const stockAlerts = outOfStockCount + lowStockCount;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
            {t('admin', 'dashboard')}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {brand.displayName} — {storeInfo.city || "O'zbekiston"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/admin/products/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-foreground text-background text-xs font-semibold hover:bg-foreground/90 transition-all active:scale-[0.98] shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            Yangi mahsulot
          </Link>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-muted text-foreground text-xs font-semibold hover:bg-muted/80 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Do'kon
          </a>
        </div>
      </div>

      {/* Compact Overview Strip */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3"
      >
        {[
          { label: 'Mahsulotlar', value: products.length, icon: Package, href: '/admin/products', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
          { label: 'Kategoriyalar', value: categories.length, icon: FolderTree, href: '/admin/categories', color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400' },
          { label: 'Videolar', value: publishedVideos?.length ?? 0, icon: Film, href: '/admin/feed', color: 'bg-teal-500/10 text-teal-600 dark:text-teal-400' },
          { label: 'Promptlar', value: prompts.length, icon: Sparkles, href: '/admin/prompts', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
          { label: 'Yoqtirishlar', value: likeCount, icon: ThumbsUp, color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400' },
          { label: 'Izohlar', value: commentCount, icon: MessageSquare, color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' },
        ].map((item, idx) => {
          const Icon = item.icon;
          const Wrapper = item.href ? Link : 'div';
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03, duration: 0.25 }}
            >
              <Wrapper
                to={item.href || ''}
                className="block p-3 rounded-xl bg-card border border-border hover:border-muted-foreground/20 hover:shadow-sm transition-all group"
                {...(item.href ? { target: undefined } : {})}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${item.color}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  {item.href && <ArrowRight className="w-3 h-3 text-muted-foreground/0 group-hover:text-muted-foreground transition-colors" />}
                </div>
                <div className="text-lg font-bold text-foreground tabular-nums">{item.value}</div>
                <div className="text-[11px] text-muted-foreground font-medium">{item.label}</div>
              </Wrapper>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Actionable Insights */}
      {stockAlerts > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="p-4 rounded-xl bg-accent/5 border border-accent/20"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4 text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground">
                {stockAlerts} ta mahsulotga e'tibor kerak
              </p>
              <p className="text-[11px] text-muted-foreground">
                {outOfStockCount > 0 && `${outOfStockCount} ta tugagan`}
                {outOfStockCount > 0 && lowStockCount > 0 && ', '}
                {lowStockCount > 0 && `${lowStockCount} ta kam qolgan`}
              </p>
            </div>
            <Link
              to="/admin/inventory"
              className="px-3 py-1.5 rounded-lg bg-foreground text-background text-[11px] font-semibold hover:bg-foreground/90 transition-colors shrink-0"
            >
              Zaxirani boshqarish
            </Link>
          </div>
        </motion.div>
      )}

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Products - 2 cols */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground">So'nggi mahsulotlar</h2>
            <Link
              to="/admin/products"
              className="text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              Barchasini ko'rish ({products.length})
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 py-2.5 text-left">Mahsulot</th>
                    <th className="px-4 py-2.5 hidden sm:table-cell">Kategoriya</th>
                    <th className="px-4 py-2.5">Narx</th>
                    <th className="px-4 py-2.5 hidden md:table-cell">Zaxira</th>
                    <th className="px-4 py-2.5 text-right">Amal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {products.slice(0, 6).map((p) => (
                    <tr key={p.id} className="admin-table-row">
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={p.images[0] || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=200'}
                            alt=""
                            className="w-8 h-8 rounded-lg object-cover border border-border shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div className="min-w-0">
                            <p className="font-medium text-foreground truncate max-w-[160px]">
                              {p.name}
                            </p>
                            <span className="text-[10px] text-muted-foreground font-mono">{p.sku}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground hidden sm:table-cell">
                        {p.categoryName || p.category}
                      </td>
                      <td className="px-4 py-2.5 font-semibold text-foreground tabular-nums">
                        {p.price.toLocaleString('uz-UZ')} so'm
                      </td>
                      <td className="px-4 py-2.5 hidden md:table-cell">
                        {p.inStock ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            {p.stockCount ?? 1} dona
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-red-600 dark:text-red-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                            Tugagan
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <Link
                          to={`/admin/products/${p.id}`}
                          className="text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Tahrirlash
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>

        {/* Activity Log - 1 col */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground">So'nggi faoliyat</h2>
            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
          </div>

          <div className="bg-card border border-border rounded-xl p-4">
            {activityLogs.length > 0 ? (
              <div className="space-y-3">
                {activityLogs.slice(0, 8).map((log) => {
                  const meta = entityMeta[log.entity] ?? entityMeta.store;
                  const EntityIcon = meta.icon;
                  return (
                    <div key={log.id} className="flex items-start gap-2.5">
                      <div className={`mt-0.5 ${meta.color}`}>
                        <EntityIcon className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-foreground leading-snug">{log.description}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-6">Hozircha faoliyat yo'q</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Quick Stats Row */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.25 }}
      >
        <h2 className="text-sm font-semibold text-foreground mb-3">Tezkor ma'lumotlar</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Mashhurlar', value: featuredProducts.length, icon: Star, href: '/admin/products?filter=featured' },
            { label: 'Yangilar', value: newProducts.length, icon: Sparkles, href: '/admin/products?filter=new' },
            { label: 'Chegirmada', value: discountedProducts.length, icon: TrendingUp, href: '/admin/products?filter=discount' },
            { label: 'Tashriflar', value: '—', icon: Eye, note: "Analytics'da ko'ring" },
          ].map((item, idx) => {
            const Icon = item.icon;
            const Wrapper = item.href ? Link : 'div';
            return (
              <Wrapper
                key={item.label}
                to={item.href || ''}
                className="p-3 rounded-xl bg-card border border-border hover:border-muted-foreground/20 hover:shadow-sm transition-all group"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                  {item.href && <ArrowRight className="w-3 h-3 text-muted-foreground/0 group-hover:text-muted-foreground transition-colors" />}
                </div>
                <div className="text-base font-bold text-foreground tabular-nums">{item.value}</div>
                <div className="text-[11px] text-muted-foreground font-medium">{item.label}</div>
                {item.note && <div className="text-[10px] text-muted-foreground/60 mt-0.5">{item.note}</div>}
              </Wrapper>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardPage;
