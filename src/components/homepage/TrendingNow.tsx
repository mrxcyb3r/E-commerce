import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, TrendingUp } from 'lucide-react';
import { ProductCard } from '../products/ProductCard';
import { useStore } from '../../context/StoreContext';
import { Reveal, Stagger } from '../motion';
import { staggerContainer, staggerItem } from '../../lib/animations';

export const TrendingNow: React.FC = () => {
  const { publishedProducts } = useStore();

  const trendingProducts = publishedProducts
    .filter((p) => p.isFeatured || p.isNew)
    .slice(0, 7);

  if (trendingProducts.length === 0) return null;

  const heroProduct = trendingProducts[0];
  const sidebarProducts = trendingProducts.slice(1, 3);
  const gridProducts = trendingProducts.slice(3);

  return (
    <section
      id="trending"
      className="section-padding bg-background"
      aria-labelledby="trending-heading"
    >
      <div className="max-w-full mx-auto px-6 sm:px-8 lg:px-12 xl:px-16">
        <Reveal className="mb-12">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-border text-[11px] font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-400 mb-4">
                <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
                <span>Trending Now</span>
              </div>
              <h2
                id="trending-heading"
                className="font-display font-black tracking-tightest text-foreground"
                style={{
                  fontSize: 'clamp(2.25rem, 5vw, 4rem)',
                  lineHeight: '1.02',
                  letterSpacing: '-0.03em',
                }}
              >
                Trending
                <br />
                <span className="text-amber-500">Now</span>
              </h2>
            </div>

            <Link
              to="/products?sort=trending"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full glass-strong font-semibold text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-border transition-all group self-end"
            >
              View All
              <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </Reveal>

        <Stagger
          containerVariant={staggerContainer}
          itemVariant={staggerItem}
        >
          {/* Editorial layout: Hero + sidebar + grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Hero product - large card */}
            <div className="lg:col-span-2">
              <ProductCard
                product={heroProduct}
                index={0}
                variant="editorial"
              />
            </div>

            {/* Sidebar - 2 stacked cards */}
            <div className="flex flex-col gap-6 lg:gap-8">
              {sidebarProducts.map((product, i) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={i + 1}
                  variant="compact"
                />
              ))}
            </div>
          </div>

          {/* Bottom grid - remaining products */}
          {gridProducts.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8 mt-6 lg:mt-8">
              {gridProducts.map((product, i) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={i + 3}
                  variant="default"
                />
              ))}
            </div>
          )}
        </Stagger>
      </div>
    </section>
  );
};

export default TrendingNow;
