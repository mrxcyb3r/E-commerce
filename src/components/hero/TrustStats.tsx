import React, { useMemo } from 'react';
import { TRUST_STATS } from '../../config/business';
import { Package, Sparkles, CheckCircle2, Store } from 'lucide-react';
import { motion } from 'motion/react';
import { useStore } from '../../context/StoreContext';
import { CountUp } from '../common/CountUp';
import type { TrustStatItem } from '../../types/cms';

export const TrustStats: React.FC = () => {
  const { homepageCms, publishedProducts } = useStore();
  const icons = [
    <Package className="w-5 h-5 text-zinc-900 dark:text-white" />,
    <Sparkles className="w-5 h-5 text-zinc-900 dark:text-white" />,
    <CheckCircle2 className="w-5 h-5 text-zinc-900 dark:text-white" />,
    <Store className="w-5 h-5 text-zinc-900 dark:text-white" />,
  ];

  const stats = useMemo<TrustStatItem[]>(() => {
    const cmsStats = homepageCms?.stats;
    const base = Array.isArray(cmsStats) && cmsStats.length > 0 ? cmsStats : TRUST_STATS;
    return base.map((stat) =>
      (stat as TrustStatItem).dynamic
        ? { ...stat, value: `${Math.max(publishedProducts.length, 100)}+` }
        : stat,
    );
  }, [homepageCms, publishedProducts.length]);

  return (
    <section className="border-y border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 py-8 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="flex items-start gap-3.5 min-w-0"
            >
              <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 border border-zinc-200 dark:border-zinc-700">
                {icons[index % icons.length]}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
                  <CountUp
                    value={stat.value}
                    className="font-black text-lg sm:text-2xl text-zinc-900 dark:text-white font-['Outfit',sans-serif] tracking-tight"
                  />
                  <span className="font-extrabold text-sm sm:text-base text-zinc-800 dark:text-zinc-200">
                    {stat.label}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 leading-snug font-medium">
                  {stat.sublabel}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};