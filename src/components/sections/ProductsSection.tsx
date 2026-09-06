import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ProductCard } from '../products/ProductCard';
import { useStore } from '../../context/StoreContext';
import { useI18n } from '../../i18n/I18nContext';
import { Reveal, Stagger } from '../motion';
import { staggerContainer, staggerItem } from '../../lib/animations';

export const ProductsSection: React.FC = () => {
  const { t } = useI18n();
  const { publishedProducts } = useStore();

  // If no products, hide gracefully
  if (publishedProducts.length === 0) {
    return null;
  }

  // Display top 8 products
  const displayProducts = publishedProducts.slice(0, 8);

  return (
    <section id="products" className="py-16 lg:py-24 bg-background relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <Reveal className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-black uppercase tracking-wider">
              <span>{'Yangi mahsulotlar'}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black font-display tracking-tight">
              {t('pages', 'home.featuredTitle')}
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base max-w-xl">
              {t('pages', 'home.featuredCurated')}
            </p>
          </Reveal>

          <Reveal transition={{ duration: 0.5, delay: 0.1 }}>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-black border border-white/15 transition-all active:scale-95 group shadow-sm"
            >
              {t('pages', 'home.trendingViewAll')}
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>

        {/* Products Grid */}
        <Stagger
          containerVariant={staggerContainer}
          itemVariant={staggerItem}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {displayProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              variant="default"
            />
          ))}
        </Stagger>

        {/* Mobile Full Discovery CTA */}
        <div className="mt-8 sm:hidden text-center">
          <Link
            to="/products"
            className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-primary text-primary-foreground text-xs font-black uppercase tracking-wider transition-all duration-300 hover:bg-primary/90"
          >
            {t('pages', 'home.trendingViewAll')}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};