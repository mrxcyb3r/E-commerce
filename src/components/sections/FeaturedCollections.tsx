import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, ArrowRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useI18n } from '../../i18n/I18nContext';
import { track } from '../../lib/analytics/client';
import { Reveal, Stagger } from '../motion';
import { staggerContainer, staggerItem } from '../../lib/animations';

export const FeaturedCollections: React.FC = () => {
  const { publishedCategories, homepageCms } = useStore();
  const { t } = useI18n();

  const featured = publishedCategories
    .filter((c) => c.featured === true || c.is_visible !== false)
    .slice(0, 4);

  if (featured.length < 2) return null;

  return (
    <section id="featured-collections" className="py-16 md:py-24 bg-white dark:bg-zinc-900 transition-colors scroll-mt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <Reveal className="space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              <Layers className="w-3.5 h-3.5 text-amber-500" />
              <span>Tanlangan kolleksiyalar</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-zinc-900 dark:text-white font-['Outfit',sans-serif] tracking-tighter">
              {homepageCms.featuredCollectionsSectionTitle || "Tayyor to'plamlar"}
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-lg font-normal">
              {homepageCms.featuredCollectionsSectionSubtitle ||
                "Do'konimizdagi eng ko'p tanlab olinadigan kolleksiyalarga tashrif buyuring."}
            </p>
          </Reveal>

          <Reveal transition={{ duration: 0.4, delay: 0.1 }}>
            <Link
              to="/products"
              className="inline-flex items-center gap-1.5 text-sm font-black text-zinc-900 dark:text-white hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors group"
            >
              <span>{t('common', 'viewAll')}</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>

        <Stagger
          containerVariant={staggerContainer}
          itemVariant={staggerItem}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5"
        >
          {featured.map((category) => (
            <Link
              key={category.id}
              to={`/products?category=${category.id}`}
              onClick={() => track('category_view', { categoryId: category.id, uniquePerVisitor: true })}
              className="group relative block rounded-2xl overflow-hidden aspect-[4/5] bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 shadow-xs hover:shadow-xl transition-all duration-300"
            >
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-500 ease-out"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/30 to-transparent" />
              <div className="absolute inset-0 p-5 flex flex-col justify-between">
                <span className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white opacity-80 group-hover:opacity-100 group-hover:bg-white group-hover:text-zinc-950 transition-all duration-200">
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </span>
                <div className="space-y-1">
                  <span className="text-[11px] font-black text-zinc-300 tracking-wider uppercase">
                    {category.productCount ?? 0} ta mahsulot
                  </span>
                  <h3 className="text-xl font-black text-white tracking-tight font-['Outfit',sans-serif]">
                    {category.name}
                  </h3>
                  <p className="text-xs text-zinc-300 line-clamp-1 opacity-90 font-medium">
                    {category.description}
                  </p>
                  <span className="inline-flex items-center gap-1 text-xs font-black text-white mt-1">
                    Ko'rish
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </Stagger>
      </div>
    </section>
  );
};
