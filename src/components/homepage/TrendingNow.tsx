import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, TrendingUp } from 'lucide-react';
import { ProductCard } from '../products/ProductCard';
import { useStore } from '../../context/StoreContext';
import { motion } from 'motion/react';

export const TrendingNow: React.FC = () => {
  const { publishedProducts } = useStore();

  const trendingProducts = publishedProducts
    .filter((p) => p.isFeatured || p.isNew)
    .slice(0, 8);

  if (trendingProducts.length === 0) return null;

  return (
    <section
      id="trending"
      className="section-padding bg-background"
      aria-labelledby="trending-heading"
    >
      <div className="max-w-full mx-auto px-6 sm:px-8 lg:px-12 xl:px-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mb-12"
        >
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-400 mb-4">
                <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
                <span>Trending Now</span>
              </div>
              <h2
                id="trending-heading"
                className="font-display font-black tracking-tightest text-zinc-950 dark:text-white"
                style={{
                  fontSize: 'clamp(2.25rem, 5vw, 4rem)',
                  lineHeight: '1.02',
                  letterSpacing: '-0.03em',
                }}
              >
                What&apos;s
                <br />
                <span className="text-amber-500">Hot</span>
                <span className="text-zinc-400 dark:text-zinc-500 font-medium" style={{ fontSize: '0.4em' }}> This Week</span>
              </h2>
            </div>

            <Link
              to="/products?sort=trending"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full glass-strong font-semibold text-zinc-950 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 transition-all group self-end"
            >
              View All Trending
              <motion.div
                whileHover={{ x: 4 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                <ChevronRight className="w-5 h-5" />
              </motion.div>
            </Link>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background to-transparent -z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background to-transparent -z-10 pointer-events-none" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {trendingProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} variant="default" />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TrendingNow;