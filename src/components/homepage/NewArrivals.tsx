import React, { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { ProductCard } from '../products/ProductCard';
import { useStore } from '../../context/StoreContext';
import { useI18n } from '../../i18n/I18nContext';
import { motion, AnimatePresence } from 'motion/react';

export const NewArrivals: React.FC = () => {
  const { t } = useI18n();
  const { publishedProducts } = useStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const newProducts = publishedProducts
    .filter((p) => p.isNew)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 12);

  if (newProducts.length === 0) return null;

  const productsPerView = 4;
  const maxIndex = Math.max(0, newProducts.length - productsPerView);
  const visibleProducts = newProducts.slice(currentIndex, currentIndex + productsPerView);

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
  }, [maxIndex]);

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goNext();
      else goPrev();
    }
    setTouchStart(null);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goPrev();
      else if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goNext, goPrev]);

  return (
    <section
      id="new-arrivals"
      className="section-padding bg-background relative overflow-hidden"
      aria-labelledby="new-arrivals-heading"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_80%_100%,_amber-500/5_0%,_transparent_50%)] dark:bg-[radial-gradient(ellipse_80%_50%_at_80%_100%,_amber-500/3_0%,_transparent_50%)]" aria-hidden="true" />

      <div className="relative z-10 max-w-full mx-auto px-6 sm:px-8 lg:px-12 xl:px-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-card border border-border text-[11px] font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-400 mb-4">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{t('pages', 'home.newTitle')}</span>
            </div>
            <h2
              id="new-arrivals-heading"
              className="font-display font-black tracking-tightest text-foreground"
              style={{
                fontSize: 'clamp(2.25rem, 5vw, 4rem)',
                lineHeight: '1.02',
                letterSpacing: '-0.03em',
              }}
            >
              {t('pages', 'home.newTitle')}
            </h2>
          </div>

          <Link
            to="/products?sort=newest"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full glass-strong font-semibold text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-border transition-all group self-end"
          >
            {t('pages', 'home.newViewAll')}
            <motion.div
              whileHover={{ x: 4 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              <ChevronRight className="w-5 h-5" />
            </motion.div>
          </Link>
        </motion.div>

        <div className="relative" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
          <div className="overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="flex gap-6 lg:gap-8"
              >
                {visibleProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.06, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="flex-shrink-0 w-full sm:max-w-xs"
                  >
                    <ProductCard product={product} index={index} variant="default" />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          {newProducts.length > productsPerView && (
            <>
              <button
                onClick={goPrev}
                disabled={currentIndex === 0}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 sm:-translate-x-6 z-10 p-3 rounded-full bg-card border border-border text-zinc-700 dark:text-zinc-300 shadow-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition-all"
                aria-label="Previous products"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                onClick={goNext}
                disabled={currentIndex >= maxIndex}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 sm:translate-x-6 z-10 p-3 rounded-full bg-background dark:bg-white border border-border text-white dark:text-zinc-950 shadow-xl hover:bg-zinc-800 dark:hover:bg-zinc-100 disabled:opacity-30 disabled:pointer-events-none transition-all"
                aria-label="Next products"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          <div className="flex items-center justify-center gap-2 mt-8" role="tablist" aria-label="New arrivals pages">
            {Array.from({ length: Math.ceil(newProducts.length / productsPerView) }, (_, i) => (
              <motion.button
                key={i}
                role="tab"
                aria-selected={i === currentIndex}
                aria-label={`Page ${i + 1}`}
                onClick={() => setCurrentIndex(i * productsPerView)}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03, duration: 0.3 }}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === currentIndex
                    ? 'w-8 bg-background dark:bg-white'
                    : 'w-2 bg-zinc-300 dark:bg-zinc-700 hover:bg-zinc-400 dark:hover:bg-zinc-600'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewArrivals;