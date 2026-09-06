import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Sparkles } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useI18n } from '../../i18n/I18nContext';
import { Reveal, Stagger } from '../motion';
import { staggerContainer, staggerItem } from '../../lib/animations';

export const ShopByStyle: React.FC = () => {
  const { t } = useI18n();
  const { publishedCategories } = useStore();

  if (!publishedCategories || publishedCategories.length === 0) return null;

  return (
    <section
      id="shop-by-style"
      className="py-16 lg:py-24 bg-background dark:bg-background relative overflow-hidden"
      aria-labelledby="shop-by-style-heading"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,_amber-500/3_0%,_transparent_60%)] dark:bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,_amber-500/2_0%,_transparent_60%)]" aria-hidden="true" />

      <div className="relative z-10 max-w-full mx-auto px-6 sm:px-8 lg:px-12 xl:px-16">
        <Reveal className="mb-10 text-center">
          <h2
            id="shop-by-style-heading"
            className="font-display font-black tracking-tight text-foreground max-w-2xl mx-auto"
            style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
              lineHeight: '1.1',
              letterSpacing: '-0.03em',
            }}
          >
            {t('pages', 'home.styleTitle')}
          </h2>
        </Reveal>

        <Stagger
          containerVariant={staggerContainer}
          itemVariant={staggerItem}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6"
        >
          {publishedCategories.map((category) => (
            <article key={category.id} className="group relative">
              <Link
                to={`/products?category=${category.slug}`}
                className="block relative aspect-[4/5] overflow-hidden rounded-2xl"
                aria-label={`${category.name} kolleksiyasini ko'rish`}
              >
                <div className="absolute inset-0 bg-muted">
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover object-center transition-all duration-1000 ease-out group-hover:scale-105"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                      <span className="text-5xl font-display font-black text-muted-foreground/20 select-none">
                        {category.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_center,_transparent_0%,_black/40_100%)]" />
                </div>

                <div className="absolute inset-0 p-6 lg:p-8 flex flex-col justify-end">
                  <div className="relative z-10">
                    {category.productCount !== undefined && category.productCount > 0 && (
                      <span className="inline-block px-3 py-1 text-[10px] font-black uppercase tracking-widest bg-white/10 backdrop-blur-sm text-white rounded-full border border-white/20 mb-4">
                        {category.productCount} ta mahsulot
                      </span>
                    )}

                    <h3
                      className="font-display font-black text-white mb-2 leading-tight"
                      style={{ fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)', lineHeight: '1.1', letterSpacing: '-0.02em' }}
                    >
                      {category.name}
                    </h3>

                    {category.description && (
                      <p className="text-white/70 mb-6 max-w-xs leading-relaxed text-sm">
                        {category.description}
                      </p>
                    )}

                    <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-sm text-white font-semibold text-sm tracking-wide hover:bg-white/20 transition-all border border-white/20 group-hover:gap-3">
                      {t('pages', 'home.styleBrowseAll')}
                      <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </Stagger>

        <Reveal className="mt-12 text-center" transition={{ duration: 0.5, delay: 0.3 }}>
          <Link
            to="/products"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-card border border-border text-foreground font-semibold text-sm tracking-wide hover:bg-muted transition-all group"
          >
            {t('pages', 'home.styleBrowseAll')}
            <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
};

export default ShopByStyle;
