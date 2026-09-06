import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ProductCard } from '../products/ProductCard';
import { useStore } from '../../context/StoreContext';
import { useI18n } from '../../i18n/I18nContext';
import { Reveal, Stagger } from '../motion';
import { formatPrice } from '../../lib/utils';
import { fadeUp, staggerContainer, staggerItem } from '../../lib/animations';

export const FeaturedCollection: React.FC = () => {
  const { t } = useI18n();
  const { publishedProducts } = useStore();

  const featuredProducts = publishedProducts
    .filter((p) => p.isFeatured)
    .slice(0, 5);

  const heroProduct = featuredProducts[0];
  const secondaryProducts = featuredProducts.slice(1, 4);
  const tertiaryProduct = featuredProducts[4];

  if (featuredProducts.length === 0) return null;

  return (
    <section
      id="featured-collection"
      className="bg-background relative overflow-hidden"
      aria-labelledby="featured-heading"
    >
      {/* ── Editorial Hero ────────────────────────────────────── */}
      {heroProduct && (
        <Reveal
          variant={fadeUp}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <Link
            to={`/products/${heroProduct.id}`}
            className="group block relative w-full h-[70vh] min-h-[520px] max-h-[900px] overflow-hidden"
            aria-label={`View ${heroProduct.name}`}
          >
            {/* Image */}
            <div className="absolute inset-0 bg-muted">
              {heroProduct.images?.[0] && (
                <img
                  src={heroProduct.images[0]}
                  alt=""
                  className="w-full h-full object-cover object-center transition-transform duration-[1.2s] ease-out group-hover:scale-[1.03]"
                  loading="eager"
                  referrerPolicy="no-referrer"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-background/60 via-transparent to-transparent" />
            </div>

            {/* Overlay Content — Magazine Spread Style */}
            <div className="relative z-10 h-full flex flex-col justify-end px-8 sm:px-12 lg:px-20 xl:px-28 pb-16 lg:pb-24 max-w-7xl">
              {/* Category pill */}
              <div className="mb-6">
                <span className="inline-block px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] bg-foreground text-background rounded-full">
                  {heroProduct.categoryName}
                </span>
                {heroProduct.isNew && (
                  <span className="ml-2 inline-block px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] bg-accent text-accent-foreground rounded-full">
                    {t('common', 'new')}
                  </span>
                )}
              </div>

              {/* Large editorial quote/statement */}
              <h2
                id="featured-heading"
                className="font-display font-black text-foreground max-w-3xl"
                style={{
                  fontSize: 'clamp(2.5rem, 6vw, 5.5rem)',
                  lineHeight: '0.95',
                  letterSpacing: '-0.04em',
                }}
              >
                {heroProduct.name}
              </h2>

              {/* Statement text */}
              <p
                className="mt-6 max-w-lg text-muted-foreground leading-snug"
                style={{
                  fontSize: 'clamp(1rem, 1.5vw, 1.25rem)',
                  lineHeight: '1.5',
                }}
              >
                {heroProduct.description ||
                  t('pages.home', 'featuredCurated')}
              </p>

              {/* Price + CTA row */}
              <div className="mt-8 flex items-center gap-6">
                <span
                  className="font-display font-black text-foreground"
                  style={{
                    fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {formatPrice(heroProduct.price)}
                </span>
                <span className="flex items-center gap-2 text-sm font-semibold text-foreground group-hover:text-accent transition-colors">
                  {t('product', 'shopNow')}
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </div>
          </Link>
        </Reveal>
      )}

      {/* ── Secondary Grid — Asymmetric Masonry ─────────────── */}
      <div className="px-8 sm:px-12 lg:px-20 xl:px-28 py-16 lg:py-24 max-w-[1600px] mx-auto">
        <Reveal className="mb-12">
          <p
            className="font-display font-black uppercase tracking-[0.15em] text-muted-foreground"
            style={{ fontSize: 'clamp(0.75rem, 1.2vw, 1rem)' }}
          >
            {t('pages.home', 'editorBadge')}
          </p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8">
          {/* First secondary — tall */}
          {secondaryProducts[0] && (
            <Stagger
              containerVariant={staggerContainer}
              itemVariant={staggerItem}
              className="md:col-span-5"
            >
              <ProductCard
                product={secondaryProducts[0]}
                index={0}
                variant="editorial"
              />
            </Stagger>
          )}

          {/* Second secondary — standard, offset down */}
          {secondaryProducts[1] && (
            <Stagger
              containerVariant={staggerContainer}
              itemVariant={staggerItem}
              className="md:col-span-4 md:mt-16"
            >
              <ProductCard
                product={secondaryProducts[1]}
                index={1}
                variant="editorial"
              />
            </Stagger>
          )}

          {/* Third secondary — short, offset up */}
          {secondaryProducts[2] && (
            <Stagger
              containerVariant={staggerContainer}
              itemVariant={staggerItem}
              className="md:col-span-3 md:-mt-4"
            >
              <ProductCard
                product={secondaryProducts[2]}
                index={2}
                variant="editorial"
              />
            </Stagger>
          )}

          {/* Tertiary product — wide accent */}
          {tertiaryProduct && (
            <Stagger
              containerVariant={staggerContainer}
              itemVariant={staggerItem}
              className="md:col-span-12"
            >
              <Reveal
                variant={fadeUp}
                transition={{
                  duration: 0.7,
                  delay: 0.2,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
              >
                <Link
                  to={`/products/${tertiaryProduct.id}`}
                  className="group block relative h-[40vh] min-h-[320px] overflow-hidden rounded-2xl bg-muted"
                  aria-label={`View ${tertiaryProduct.name}`}
                >
                  {tertiaryProduct.images?.[0] && (
                    <img
                      src={tertiaryProduct.images[0]}
                      alt=""
                      className="w-full h-full object-cover object-center transition-transform duration-[1.2s] ease-out group-hover:scale-[1.03]"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-background/20 to-transparent" />

                  <div className="relative z-10 h-full flex flex-col justify-center px-10 sm:px-16 lg:px-24 max-w-2xl">
                    <span
                      className="font-display font-black text-foreground max-w-xl"
                      style={{
                        fontSize: 'clamp(1.75rem, 4vw, 3.5rem)',
                        lineHeight: '1',
                        letterSpacing: '-0.03em',
                      }}
                    >
                      {tertiaryProduct.name}
                    </span>
                    <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-foreground group-hover:text-accent transition-colors">
                      Discover
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            </Stagger>
          )}
        </div>

        {/* View All Link */}
        <Reveal
          className="mt-12 lg:mt-16 text-center"
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Link
            to="/products?featured=true"
            className="inline-flex items-center gap-3 text-sm font-semibold text-foreground hover:text-accent transition-colors group"
          >
            View Full Collection
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
};

export default FeaturedCollection;
