import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Sparkles } from 'lucide-react';
import { ProductCard } from '../products/ProductCard';
import { useStore } from '../../context/StoreContext';
import { motion } from 'motion/react';
import { Reveal, Stagger } from '../motion';
import { fadeUp, staggerContainer, staggerItem } from '../../lib/animations';

export const FeaturedCollection: React.FC = () => {
  const { publishedProducts } = useStore();

  const featuredProducts = publishedProducts
    .filter((p) => p.isFeatured)
    .slice(0, 5);

  const heroProduct = featuredProducts[0];
  const secondaryProducts = featuredProducts.slice(1, 4);
  const tertiaryProducts = featuredProducts.slice(4, 6);

  if (featuredProducts.length === 0) return null;

  return (
    <section
      id="featured-collection"
      className="section-padding bg-background relative overflow-hidden"
      aria-labelledby="featured-heading"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_20%_0%,_amber-500/5_0%,_transparent_50%)] dark:bg-[radial-gradient(ellipse_80%_50%_at_20%_0%,_amber-500/3_0%,_transparent_50%)]" aria-hidden="true" />

      <div className="relative z-10 max-w-full mx-auto px-6 sm:px-8 lg:px-12 xl:px-16">
        <Reveal className="mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-400 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Featured Collection</span>
          </div>
          <h2
            id="featured-heading"
            className="font-display font-black tracking-tightest text-zinc-950 dark:text-white max-w-2xl"
            style={{
              fontSize: 'clamp(2.25rem, 5vw, 4rem)',
              lineHeight: '1.02',
              letterSpacing: '-0.03em',
            }}
          >
            Editor&apos;s
            <br />
            <span className="text-amber-500">Picks</span>
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {heroProduct && (
            <Reveal
              variant={fadeUp}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="lg:col-span-7 lg:row-span-2 relative group"
            >
              <Link
                to={`/products/${heroProduct.id}`}
                className="block relative aspect-[16/10] overflow-hidden rounded-2xl"
                aria-label={`View ${heroProduct.name}`}
              >
                <div className="absolute inset-0 bg-zinc-100 dark:bg-zinc-900">
                  {heroProduct.images?.[0] && (
                    <img
                      src={heroProduct.images[0]}
                      alt={heroProduct.name}
                      className="w-full h-full object-cover object-center transition-all duration-1000 ease-out group-hover:scale-105"
                      loading="eager"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_center,_transparent_0%,_black/50_100%)]" />
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-8 lg:p-12">
                  <div className="max-w-xl">
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest bg-white/10 backdrop-blur-sm text-white rounded-full border border-white/20">
                        {heroProduct.categoryName}
                      </span>
                      {heroProduct.isNew && (
                        <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest bg-amber-500 text-zinc-950 rounded-full">
                          New
                        </span>
                      )}
                      {heroProduct.isFeatured && (
                        <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest bg-zinc-950 text-white rounded-full">
                          Featured
                        </span>
                      )}
                    </div>

                    <h3 className="font-display font-black text-white mb-4 leading-tight"
                      style={{ fontSize: 'clamp(1.75rem, 3.5vw, 3rem)', lineHeight: '1.05', letterSpacing: '-0.02em' }}>
                      {heroProduct.name}
                    </h3>

                    <p className="text-white/80 mb-8 max-w-md leading-relaxed"
                      style={{ fontSize: '1.125rem', lineHeight: '1.7' }}>
                      {heroProduct.description || 'Handpicked by our style editors. Premium quality meets modern design.'}
                    </p>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-baseline gap-3">
                        <span className="font-display font-black text-white text-2xl lg:text-3xl">
                          {heroProduct.price.toLocaleString()} UZS
                        </span>
                        {heroProduct.originalPrice && heroProduct.originalPrice > heroProduct.price && (
                          <span className="font-display font-medium text-white/60 line-through text-lg">
                            {heroProduct.originalPrice.toLocaleString()} UZS
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <button className="px-6 py-3 rounded-full bg-white text-zinc-950 font-black text-sm tracking-wider hover:bg-white/90 shadow-xl transition-all group-hover:scale-105">
                          Shop Now
                        </button>
                        <Link
                          to={`/products/${heroProduct.id}`}
                          className="px-6 py-3 rounded-full glass-strong text-white font-semibold text-sm tracking-wide hover:bg-white/10 transition-all border border-white/20"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </Reveal>
          )}

          <Stagger
            containerVariant={staggerContainer}
            itemVariant={staggerItem}
            className="lg:col-span-5 space-y-6"
          >
            {secondaryProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                index={index}
                variant="featured"
              />
            ))}
          </Stagger>

          {tertiaryProducts.length > 0 && (
            <Stagger
              containerVariant={staggerContainer}
              itemVariant={staggerItem}
              className="lg:col-span-12 grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8 mt-6"
            >
              {tertiaryProducts.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={index}
                  variant="compact"
                />
              ))}
            </Stagger>
          )}

          <Reveal
            className="lg:col-span-12 text-center pt-4"
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Link
              to="/products?featured=true"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full glass-strong font-semibold text-zinc-950 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 transition-all group"
            >
              View Full Collection
              <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCollection;
