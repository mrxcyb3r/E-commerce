import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Eye } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useI18n } from '../../i18n/I18nContext';
import { ProductCard } from '../products/ProductCard';
import { Reveal, Stagger } from '../motion';
import { staggerContainer, staggerItem } from '../../lib/animations';

export const Community: React.FC = () => {
  const { t } = useI18n();
  const { publishedProducts } = useStore();

  const featuredLooks = publishedProducts
    .filter((p) => p.images && p.images.length > 0)
    .slice(0, 6);

  if (featuredLooks.length === 0) return null;

  const heroProduct = featuredLooks[0];
  const gridProducts = featuredLooks.slice(1);

  return (
    <section
      id="community"
      className="section-padding bg-background relative overflow-hidden"
      aria-labelledby="community-heading"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_20%_100%,_amber-500/5_0%,_transparent_60%)] dark:bg-[radial-gradient(ellipse_60%_60%_at_20%_100%,_amber-500/3_0%,_transparent_60%)]" aria-hidden="true" />

      <div className="relative z-10 max-w-full mx-auto px-6 sm:px-8 lg:px-12 xl:px-16">
        <Reveal className="mb-12 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-card border border-border text-[11px] font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-400 mb-4">
              <Eye className="w-3.5 h-3.5 text-amber-500" />
              <span>{t('pages', 'home.editorBadge')}</span>
            </div>
            <h2
              id="community-heading"
              className="font-display font-black tracking-tightest text-foreground"
              style={{
                fontSize: 'clamp(2.25rem, 5vw, 4rem)',
                lineHeight: '1.02',
                letterSpacing: '-0.03em',
              }}
            >
              {t('pages', 'home.communityTitle')}
            </h2>
          </div>

          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full glass-strong font-semibold text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-border transition-all group self-end"
          >
            {t('pages', 'home.communityViewAll')}
            <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>

        <Stagger
          containerVariant={staggerContainer}
          itemVariant={staggerItem}
        >
          <div className="mb-6 lg:mb-8">
            <ProductCard
              product={heroProduct}
              index={0}
              variant="editorial"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {gridProducts.map((product, i) => (
              <ProductCard
                key={product.id}
                product={product}
                index={i + 1}
                variant="default"
              />
            ))}
          </div>
        </Stagger>

        <Reveal className="mt-12 text-center">
          <Link
            to="/products"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full glass-strong font-semibold text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-border transition-all group"
          >
            {t('pages', 'home.communityViewAll')}
            <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
};

export default Community;
