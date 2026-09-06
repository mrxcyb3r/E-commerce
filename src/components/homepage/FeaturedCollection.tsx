import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ProductCard } from '../products/ProductCard';
import { useStore } from '../../context/StoreContext';
import { useI18n } from '../../i18n/I18nContext';
import { Reveal, Stagger } from '../motion';
import { staggerContainer, staggerItem } from '../../lib/animations';

export const FeaturedCollection: React.FC = () => {
  const { t } = useI18n();
  const { publishedProducts } = useStore();

  const featuredProducts = publishedProducts
    .filter((p) => p.isFeatured)
    .slice(0, 8);

  if (featuredProducts.length === 0) return null;

  return (
    <section
      id="featured-collection"
      className="py-16 lg:py-24 bg-background relative overflow-hidden"
      aria-labelledby="featured-heading"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 xl:px-16">
        <Reveal className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h2
              id="featured-heading"
              className="font-display font-black tracking-tight text-foreground"
              style={{
                fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
                lineHeight: '1.1',
                letterSpacing: '-0.03em',
              }}
            >
              {t('pages', 'home.featuredTitle')}
            </h2>
            <p className="mt-2 text-muted-foreground text-base max-w-lg">
              {t('pages', 'home.featuredCurated')}
            </p>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-sm font-semibold text-foreground hover:text-accent transition-colors group shrink-0"
          >
            {t('pages', 'home.trendingViewAll')}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>

        <Stagger
          containerVariant={staggerContainer}
          itemVariant={staggerItem}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6"
        >
          {featuredProducts.map((product, i) => (
            <ProductCard
              key={product.id}
              product={product}
              index={i}
              variant="default"
            />
          ))}
        </Stagger>
      </div>
    </section>
  );
};

export default FeaturedCollection;
