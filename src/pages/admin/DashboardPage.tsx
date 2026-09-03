import React from 'react';
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
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useVideoFeed } from '../../context/VideoContext';

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

  const outOfStockCount = products.filter((p) => !p.inStock || (p.stockCount !== undefined && p.stockCount <= 0)).length;
  const lowStockCount = products.filter((p) => p.inStock && p.stockCount !== undefined && p.stockCount > 0 && p.stockCount <= 3).length;

  const stats = [
    {
      title: 'Jami Mahsulotlar',
      value: products.length,
      subtext: `${products.filter((p) => p.published !== false).length} ta faol nashrda`,
      icon: Package,
      color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/50',
      link: '/admin/products',
    },
    {
      title: 'Kategoriyalar',
      value: categories.length,
      subtext: 'Asosiy bo\'limlar',
      icon: FolderTree,
      color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50',
      link: '/admin/categories',
    },
    {
      title: 'Jonli Feed / Videolar',
      value: (publishedVideos?.length ?? 0),
      subtext: 'Faol video va lukbuklar',
      icon: Film,
      color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-900/50',
      link: '/admin/feed',
    },
    {
      title: 'AI Prompt Library',
      value: prompts.length,
      subtext: 'Tayyor AI ko\'rsatmalari',
      icon: Sparkles,
      color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/50',
      link: '/admin/prompts',
    },
    {
      title: 'Mashhur Mahsulotlar',
      value: featuredProducts.length,
      subtext: 'Bosh sahifada tavsiya etilgan',
      icon: Star,
      color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/50',
      link: '/admin/products?filter=featured',
    },
    {
      title: 'Yangi Kelganlar',
      value: newProducts.length,
      subtext: '"Yangi" belgisi bilan',
      icon: Sparkle,
      color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/50',
      link: '/admin/products?filter=new',
    },
    {
      title: 'Chegirmadagi Mahsulotlar',
      value: discountedProducts.length,
      subtext: 'Maxsus arzonlashtirilgan',
      icon: Percent,
      color: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-900/50',
      link: '/admin/products?filter=discount',
    },
    {
      title: 'Zaxira Ogohlantirishlari',
      value: outOfStockCount + lowStockCount,
      subtext: `${outOfStockCount} tugagan, ${lowStockCount} kam qolgan`,
      icon: AlertTriangle,
      color: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/50',
      link: '/admin/inventory',
    },
  ];

  const quickActions = [
    {
      title: 'Mahsulot qo\'shish',
      desc: 'Yangi kiyim yoki poyabzal kiritish',
      link: '/admin/products/new',
      icon: Plus,
      color: 'bg-amber-500 text-neutral-950 hover:bg-amber-400',
    },
    {
      title: 'Video / Reel qo\'shish',
      desc: 'Yangi video yuklash yoki mavjud videolarni boshqarish',
      link: '/admin/feed',
      icon: Film,
      color: 'bg-neutral-900 text-white dark:bg-neutral-800 hover:bg-neutral-800 dark:hover:bg-neutral-700',
    },
    {
      title: 'AI Prompt qo\'shish',
      desc: 'Yangi kiyim promptini yaratish',
      link: '/admin/prompts',
      icon: Sparkles,
      color: 'bg-neutral-900 text-white dark:bg-neutral-800 hover:bg-neutral-800 dark:hover:bg-neutral-700',
    },
    {
      title: 'Kategoriya qo\'shish',
      desc: 'Yangi bo\'lim ochish',
      link: '/admin/categories',
      icon: FolderTree,
      color: 'bg-neutral-900 text-white dark:bg-neutral-800 hover:bg-neutral-800 dark:hover:bg-neutral-700',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative rounded-3xl bg-neutral-900 text-white p-6 sm:p-8 overflow-hidden shadow-xl border border-neutral-800">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{storeInfo.businessName} — Boshqaruv Markazi</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Do'kon holati va ko'rsatkichlari
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              Bu yerdan mahsulotlar, narxlar, chegirmalar, zaxiralar, videolavhalar va AI promptlar kutubxonasini to'liq boshqarasiz. O'zgarishlar darhol saytda aks etadi.
            </p>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white text-neutral-950 font-bold text-xs hover:bg-neutral-100 transition-all shadow-md active:scale-95"
            >
              <span>Do'koni ko'rish</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <span className="text-[11px] text-neutral-400 font-medium">
              Manzil: {storeInfo.city}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Action Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
            Tezkor Amallar
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <Link
                key={idx}
                to={action.link}
                className={`p-4 rounded-2xl transition-all shadow-xs border border-transparent hover:shadow-md active:scale-[0.98] flex items-start justify-between group ${action.color}`}
              >
                <div className="space-y-1">
                  <h4 className="text-sm font-extrabold flex items-center gap-2">
                    <span>{action.title}</span>
                  </h4>
                  <p className="text-[11px] opacity-80">{action.desc}</p>
                </div>
                <div className="w-8 h-8 rounded-xl bg-black/10 dark:bg-white/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Icon className="w-4 h-4" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Real Stats Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
            Bugungi Ko'rsatkichlar
          </h3>
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            Haqiqiy ma'lumotlar asosida hisoblangan
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <Link
                key={idx}
                to={stat.link}
                className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400">
                    {stat.title}
                  </span>
                  <div className={`p-2 rounded-xl border ${stat.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                <div>
                  <div className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight">
                    {stat.value}
                  </div>
                  <p className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 mt-1 truncate">
                    {stat.subtext}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Two Columns: Recent Products & Activity Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Products (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-neutral-200/80 dark:border-neutral-800/80 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-extrabold text-neutral-900 dark:text-white">
                So'nggi Mahsulotlar
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Katalogdagi so'nggi yangilangan kiyim va poyabzallar
              </p>
            </div>
            <Link
              to="/admin/products"
              className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
            >
              <span>Barchasini ko'rish ({products.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-100 dark:border-neutral-800 text-neutral-400 font-bold uppercase text-[10px]">
                  <th className="pb-3 pl-1">Mahsulot</th>
                  <th className="pb-3">Kategoriya</th>
                  <th className="pb-3">Narxi</th>
                  <th className="pb-3">Zaxira</th>
                  <th className="pb-3">Holati</th>
                  <th className="pb-3 text-right pr-1">Harakat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {products.slice(0, 6).map((p) => (
                  <tr key={p.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                    <td className="py-3 pl-1">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.images[0] || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=200'}
                          alt=""
                          className="w-10 h-10 rounded-xl object-cover border border-neutral-200 dark:border-neutral-700 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-neutral-900 dark:text-white truncate max-w-[160px] sm:max-w-xs">
                            {p.name}
                          </p>
                          <span className="text-[10px] text-neutral-400">{p.sku}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 font-medium text-neutral-600 dark:text-neutral-300">
                      {p.categoryName || p.category}
                    </td>
                    <td className="py-3">
                      <span className="font-bold text-neutral-900 dark:text-white">
                        {p.price.toLocaleString('uz-UZ')} so'm
                      </span>
                      {p.originalPrice && p.originalPrice > p.price && (
                        <span className="block text-[10px] text-neutral-400 line-through">
                          {p.originalPrice.toLocaleString('uz-UZ')} so'm
                        </span>
                      )}
                    </td>
                    <td className="py-3">
                      {p.inStock ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>{p.stockCount ?? 1} dona</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 dark:text-red-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                          <span>Tugagan</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-1">
                        {p.isFeatured && (
                          <span className="px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-[10px] font-bold">
                            Mashhur
                          </span>
                        )}
                        {p.isNew && (
                          <span className="px-1.5 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-[10px] font-bold">
                            Yangi
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 text-right pr-1">
                      <Link
                        to={`/admin/products/${p.id}`}
                        className="px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-[11px] font-bold text-neutral-900 dark:text-white transition-colors"
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

        {/* Real Activity Logs (1 col) */}
        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-neutral-200/80 dark:border-neutral-800/80 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-extrabold text-neutral-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>So'nggi Amallar</span>
            </h3>
            <span className="text-[11px] font-bold text-neutral-400">
              {activityLogs.length} ta yozuv
            </span>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto max-h-[380px] pr-1 scrollbar-thin">
            {activityLogs.length > 0 ? (
              activityLogs.slice(0, 10).map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-800 space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between text-[10px] text-neutral-400">
                    <span className="font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                      {log.entity} • {log.action}
                    </span>
                    <span>
                      {new Date(log.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="font-medium text-neutral-800 dark:text-neutral-200 text-xs leading-snug">
                    {log.description}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-xs text-neutral-400 text-center py-8">
                Hozircha yangi amallar yo'q.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
