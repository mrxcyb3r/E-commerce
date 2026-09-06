import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  FolderTree,
  Film,
  Sparkles,
  Star,
  Sparkle,
  Percent,
  AlertTriangle,
  Plus,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  HardDrive,
  Database,
  MessageSquare,
  ThumbsUp,
  Store,
  HelpCircle,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useVideoFeed } from '../../context/VideoContext';
import { useI18n } from '../../i18n/I18nContext';
import { useBrand } from '../../hooks/useBrand';
import { supabase } from '../../lib/supabase/client';
import type { AdminActivityLog } from '../../types/cms';
import { motion } from 'motion/react';
import {
  AdminPageLayout,
  StatCard,
  StatCardGrid,
  ActionButton,
  LoadingSkeleton,
  EmptyState,
  PageHeader,
} from '../../components/admin/ui';

const entityMeta: Record<
  AdminActivityLog['entity'],
  { icon: typeof Package }
> = {
  product: { icon: Package },
  category: { icon: FolderTree },
  video: { icon: Film },
  prompt: { icon: Sparkles },
  testimonial: { icon: Star },
  faq: { icon: HelpCircle },
  store: { icon: Store },
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
  const [dbOnline, setDbOnline] = useState(true);

  useEffect(() => {
    let active = true;
    const countTable = async (
      table: string,
      setter: (n: number) => void
    ): Promise<boolean> => {
      try {
        const { count, error } = await supabase
          .from(table as any)
          .select('*', { count: 'exact', head: true });
        if (!active) return false;
        if (error) throw error;
        setter(count ?? 0);
        return true;
      } catch {
        if (active) setter(0);
        return false;
      }
    };
    (async () => {
      const commentsOk = await countTable('feed_comments', setCommentCount);
      const likesOk = await countTable('feed_likes', setLikeCount);
      if (active) setDbOnline(commentsOk || likesOk);
    })();
    return () => {
      active = false;
    };
  }, []);

  const imageFileCount = products.reduce((sum, p) => sum + (p.images?.length || 0), 0);
  const storageUsedMb = imageFileCount * 0.4;
  const storageEstimateMb = 100;
  const storagePct = Math.min(100, Math.round((storageUsedMb / storageEstimateMb) * 100));

  const stats = [
    {
      title: t('admin', 'totalProducts'),
      value: products.length,
      subtitle: `${products.filter((p) => p.published !== false).length} ${t('admin', 'totalProductsSub')}`,
      icon: <Package className="w-5 h-5" />,
      iconBg: 'bg-primary/10',
      href: '/admin/products',
    },
    {
      title: t('admin', 'categories'),
      value: categories.length,
      subtitle: t('admin', 'categoriesSub'),
      icon: <FolderTree className="w-5 h-5" />,
      iconBg: 'bg-emerald-500/10',
      href: '/admin/categories',
    },
    {
      title: t('admin', 'liveFeed'),
      value: (publishedVideos?.length ?? 0),
      subtitle: t('admin', 'liveFeedSub'),
      icon: <Film className="w-5 h-5" />,
      iconBg: 'bg-purple-500/10',
      href: '/admin/feed',
    },
    {
      title: t('admin', 'aiPrompts'),
      value: prompts.length,
      subtitle: t('admin', 'aiPromptsSub'),
      icon: <Sparkles className="w-5 h-5" />,
      iconBg: 'bg-amber-500/10',
      href: '/admin/prompts',
    },
    {
      title: t('admin', 'featuredProducts'),
      value: featuredProducts.length,
      subtitle: t('admin', 'featuredProductsSub'),
      icon: <Star className="w-5 h-5" />,
      iconBg: 'bg-amber-500/10',
      href: '/admin/products?filter=featured',
    },
    {
      title: t('admin', 'newArrivals'),
      value: newProducts.length,
      subtitle: t('admin', 'newArrivalsSub'),
      icon: <Sparkle className="w-5 h-5" />,
      iconBg: 'bg-rose-500/10',
      href: '/admin/products?filter=new',
    },
    {
      title: t('admin', 'discounted'),
      value: discountedProducts.length,
      subtitle: t('admin', 'discountedSub'),
      icon: <Percent className="w-5 h-5" />,
      iconBg: 'bg-teal-500/10',
      href: '/admin/products?filter=discount',
    },
    {
      title: t('admin', 'stockAlerts'),
      value: outOfStockCount + lowStockCount,
      subtitle: t('admin', 'stockAlertsSub', outOfStockCount, lowStockCount),
      icon: <AlertTriangle className="w-5 h-5" />,
      iconBg: 'bg-red-500/10',
      href: '/admin/inventory',
    },
  ];

  const quickActions = [
    {
      title: t('admin', 'addProduct'),
      desc: t('admin', 'addProductDesc'),
      link: '/admin/products/new',
      icon: <Plus className="w-4 h-4" />,
    },
    {
      title: t('admin', 'addVideo'),
      desc: t('admin', 'addVideoDesc'),
      link: '/admin/feed',
      icon: <Film className="w-4 h-4" />,
    },
    {
      title: t('admin', 'addPrompt'),
      desc: t('admin', 'addPromptDesc'),
      link: '/admin/prompts',
      icon: <Sparkles className="w-4 h-4" />,
    },
    {
      title: t('admin', 'addCategory'),
      desc: t('admin', 'addCategoryDesc'),
      link: '/admin/categories',
      icon: <FolderTree className="w-4 h-4" />,
    },
  ];

  const healthCards = [
    {
      label: 'Rasmlar fayllari',
      value: `${imageFileCount} fayl`,
      detail: `${storageUsedMb.toFixed(1)} MB taxminiy`,
      icon: <HardDrive className="w-5 h-5" />,
      iconBg: 'bg-primary/10',
      progress: storagePct,
    },
    {
      label: 'Ma\'lumotlar bazasi',
      value: dbOnline ? 'Online' : 'Cheklangan',
      icon: <Database className="w-5 h-5" />,
      iconBg: dbOnline ? 'bg-emerald-500/10' : 'bg-amber-500/10',
      status: dbOnline ? 'online' : 'limited',
    },
    {
      label: 'Umumiy izohlar',
      value: commentCount,
      icon: <MessageSquare className="w-5 h-5" />,
      iconBg: 'bg-purple-500/10',
    },
    {
      label: 'Jami yoqtirishlar',
      value: likeCount,
      icon: <ThumbsUp className="w-5 h-5" />,
      iconBg: 'bg-rose-500/10',
    },
  ];

  return (
    <AdminPageLayout
      header={{
        title: t('admin', 'dashboard'),
        subtitle: t('admin', 'dashboardDesc'),
        description: t('admin', 'dashboardDesc2'),
        action: (
          <div className="flex items-center gap-2">
            <Link
              to="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-primary text-primary-foreground font-bold text-xs hover:bg-primary/90 transition-all shadow-sm"
            >
              <span>{t('admin', 'viewStore')}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        ),
        breadcrumb: [
          { label: 'Admin' },
          { label: t('admin', 'dashboard') },
        ],
      }}
    >
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative rounded-3xl bg-primary text-primary-foreground p-6 sm:p-8 overflow-hidden shadow-xl border border-border"
      >
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/20 text-accent text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{brand.displayName} — {t('admin', 'dashboard')}</span>
            </div>
            <h2 className="font-display font-black tracking-tight text-primary-foreground"
              style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', lineHeight: '1.1' }}>
              {t('admin', 'dashboardDesc')}
            </h2>
            <p className="text-sm text-primary-foreground/70 leading-relaxed">
              {t('admin', 'dashboardDesc2')}
            </p>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-primary-foreground text-primary font-bold text-xs hover:opacity-90 transition-all shadow-md"
            >
              <span>{t('admin', 'viewStore')}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <span className="text-[11px] text-muted-foreground font-medium">
              {t('admin', 'location')} {storeInfo.city}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Quick Action Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <PageHeader
          title={t('admin', 'quickActions')}
          subtitle={`${quickActions.length} actions available`}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <Link
                key={idx}
                to={action.link}
                className="p-4 rounded-2xl transition-all shadow-sm border border-border hover:shadow-md hover:border-muted-foreground/20 group flex items-start justify-between"
              >
                <div className="space-y-1">
                  <h4 className="font-semibold text-foreground flex items-center gap-2">
                    <span>{action.title}</span>
                  </h4>
                  <p className="text-sm text-muted-foreground">{action.desc}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  {action.icon}
                </div>
              </Link>
            );
          })}
        </div>
      </motion.div>

      {/* Real Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <PageHeader
          title={t('admin', 'todayStats')}
          subtitle={t('admin', 'statsNote')}
        />

        <StatCardGrid stats={stats} />
      </motion.div>

      {/* Storage & Health Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <PageHeader
          title="Saqlash va Sog'liq"
          subtitle="Storage usage and system health"
          action={
            <TrendingUp className="w-4 h-4 text-accent" />
          }
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {healthCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="p-5 rounded-2xl card flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-muted-foreground">
                    {card.label}
                  </span>
                  <div className={`p-2 rounded-xl ${card.iconBg}`}>
                    {card.icon}
                  </div>
                </div>
                <div>
                  {card.progress !== undefined && (
                    <>
                      <div className="text-2xl font-black text-foreground tracking-tight mb-1">
                        {card.value}
                      </div>
                      <p className="text-xs font-medium text-muted-foreground mb-2 truncate">
                        {card.detail}
                      </p>
                      <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden mt-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${card.progress}%` }}
                          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
                          className="h-full rounded-full bg-gradient-to-r from-accent to-primary"
                        />
                      </div>
                    </>
                  )}

                  {card.status && (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-black text-foreground tracking-tight">
                          {card.value}
                        </span>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          card.status === 'online'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50'
                        }`}>
                          <span className="relative flex w-2 h-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75" />
                            <span className="relative inline-flex rounded-full w-2 h-2 bg-current" />
                          </span>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {card.status === 'online' ? 'Online' : 'Limited'}
                        </span>
                      </div>
                    </>
                  )}

                  {!card.progress && !card.status && (
                    <div className="text-2xl font-black text-foreground tracking-tight">
                      {card.value}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Two Columns: Recent Products & Activity Log */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Recent Products (2 cols) */}
        <div className="lg:col-span-2 card p-6">
          <PageHeader
            title={t('admin', 'recentProducts')}
            subtitle={t('admin', 'recentProductsDesc')}
            action={
              <Link
                to="/admin/products"
                className="inline-flex items-center gap-1 text-sm font-bold text-accent hover:underline"
              >
                Barchasini ko'rish ({products.length})
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            }
          />

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm" role="grid">
              <thead>
                <tr className="border-b border-border text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <th className="pb-3 pl-1 text-left">{t('admin', 'product')}</th>
                  <th className="pb-3">{t('admin', 'category')}</th>
                  <th className="pb-3">{t('admin', 'price')}</th>
                  <th className="pb-3">{t('admin', 'stock')}</th>
                  <th className="pb-3">{t('admin', 'status')}</th>
                  <th className="pb-3 text-right pr-1">{t('admin', 'action')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {products.slice(0, 6).map((p) => (
                  <tr key={p.id} className="hover:bg-muted/50 transition-colors">
                    <td className="py-3 pl-1">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.images[0] || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=200'}
                          alt=""
                          className="w-10 h-10 rounded-xl object-cover border border-border shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground truncate max-w-[160px] sm:max-w-xs">
                            {p.name}
                          </p>
                          <span className="text-xs text-muted-foreground">{p.sku}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 font-medium text-muted-foreground">
                      {p.categoryName || p.category}
                    </td>
                    <td className="py-3">
                      <span className="font-semibold text-foreground">
                        {p.price.toLocaleString('uz-UZ')} so'm
                      </span>
                      {p.originalPrice && p.originalPrice > p.price && (
                        <span className="block text-xs text-muted-foreground line-through">
                          {p.originalPrice.toLocaleString('uz-UZ')} so'm
                        </span>
                      )}
                    </td>
                    <td className="py-3">
                      {p.inStock ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>{p.stockCount ?? 1} dona</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 dark:text-red-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                          <span>{t('admin', 'outOfStock')}</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-1">
                        {p.isFeatured && (
                          <span className="px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold border border-amber-200 dark:border-amber-900/50">
                            {t('admin', 'featured')}
                          </span>
                        )}
                        {p.isNew && (
                          <span className="px-1.5 py-0.5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px] font-bold border border-rose-200 dark:border-rose-900/50">
                            {t('admin', 'new')}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 text-right pr-1">
                      <Link
                        to={`/admin/products/${p.id}`}
                        className="px-2.5 py-1 rounded-lg bg-muted hover:bg-muted/80 text-xs font-semibold text-foreground transition-colors"
                      >
                        {t('admin', 'edit')}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Real Activity Logs (1 col) */}
        <div className="card p-6 flex flex-col">
          <PageHeader
            title={t('admin', 'recentActivity')}
            subtitle={`${activityLogs.length} ${t('admin', 'records')}`}
            action={
              <Clock className="w-4 h-4 text-accent" />
            }
          />

          <div className="flex-1 space-y-3 overflow-y-auto max-h-[380px] pr-1 scrollbar-thin">
            {activityLogs.length > 0 ? (
              activityLogs.slice(0, 10).map((log) => {
                const meta = entityMeta[log.entity] ?? entityMeta.store;
                const EntityIcon = meta.icon;
                return (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="p-3 rounded-2xl bg-muted/50 border border-border space-y-1 text-sm"
                  >
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5 font-bold uppercase tracking-wider">
                        <EntityIcon className="w-3 h-3 text-muted-foreground" />
                        <span className="text-accent">
                          {log.entity} • {log.action}
                        </span>
                      </span>
                      <span>
                        {new Date(log.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="font-medium text-foreground text-sm leading-snug">
                      {log.description}
                    </p>
                  </motion.div>
                );
              })
            ) : (
              <EmptyState
                illustration="document"
                title={t('admin', 'noActivity')}
                description="No recent activity recorded"
              />
            )}
          </div>
        </div>
      </motion.div>
    </AdminPageLayout>
  );
};

export default DashboardPage;