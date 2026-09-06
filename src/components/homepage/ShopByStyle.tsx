import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Sparkles } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { motion } from 'motion/react';

interface StyleCollection {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  productCount: number;
  categorySlug: string;
  accentColor?: string;
}

const styleCollections: StyleCollection[] = [
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean lines. Essential pieces. Timeless style.',
    imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1200&q=80',
    productCount: 24,
    categorySlug: 'minimal',
    accentColor: '#18181b',
  },
  {
    id: 'street',
    name: 'Street',
    description: 'Bold graphics. Oversized fits. Urban attitude.',
    imageUrl: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1200&q=80',
    productCount: 31,
    categorySlug: 'streetwear',
    accentColor: '#0f172a',
  },
  {
    id: 'sport',
    name: 'Sport',
    description: 'Performance fabrics. Movement-first design.',
    imageUrl: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=1200&q=80',
    productCount: 18,
    categorySlug: 'sportswear',
    accentColor: '#166534',
  },
  {
    id: 'classic',
    name: 'Classic',
    description: 'Heritage silhouettes. Refined details. Forever relevant.',
    imageUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=1200&q=80',
    productCount: 22,
    categorySlug: 'classic',
    accentColor: '#451a03',
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'Luxury materials. Impeccable craftsmanship.',
    imageUrl: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=1200&q=80',
    productCount: 15,
    categorySlug: 'premium',
    accentColor: '#78350f',
  },
];

export const ShopByStyle: React.FC = () => {
  return (
    <section
      id="shop-by-style"
      className="section-padding bg-zinc-950 dark:bg-black relative overflow-hidden"
      aria-labelledby="shop-by-style-heading"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,_amber-500/3_0%,_transparent_60%)] dark:bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,_amber-500/2_0%,_transparent_60%)]" aria-hidden="true" />

      <div className="relative z-10 max-w-full mx-auto px-6 sm:px-8 lg:px-12 xl:px-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mb-12 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-800 border border-zinc-700 text-[11px] font-black uppercase tracking-widest text-zinc-400 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Shop by Style</span>
          </div>
          <h2
            id="shop-by-style-heading"
            className="font-display font-black tracking-tightest text-white max-w-2xl mx-auto"
            style={{
              fontSize: 'clamp(2.25rem, 5vw, 4rem)',
              lineHeight: '1.02',
              letterSpacing: '-0.03em',
            }}
          >
            Find Your
            <br />
            <span className="text-amber-500">Aesthetic</span>
          </h2>
          <p className="mt-4 text-zinc-400 text-lg leading-relaxed max-w-2xl mx-auto">
            Curated collections for every mood. Explore distinct aesthetics built around how you live.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6">
          {styleCollections.map((collection, index) => (
            <motion.article
              key={collection.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, delay: 0.1 + index * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="group relative"
            >
              <Link
                to={`/products?category=${collection.categorySlug}`}
                className="block relative aspect-[3/4] overflow-hidden rounded-2xl"
                aria-label={`Shop ${collection.name} collection`}
              >
                <div className="absolute inset-0 bg-zinc-900">
                  <img
                    src={collection.imageUrl}
                    alt={collection.name}
                    className="w-full h-full object-cover object-center transition-all duration-1000 ease-out group-hover:scale-105"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_center,_transparent_0%,_black/40_100%)]" />
                </div>

                <div className="absolute inset-0 p-6 lg:p-8 flex flex-col justify-end">
                  <div className="relative z-10">
                    <span className="inline-block px-3 py-1 text-[10px] font-black uppercase tracking-widest bg-white/10 backdrop-blur-sm text-white rounded-full border border-white/20 mb-4">
                      {collection.productCount} items
                    </span>

                    <h3 className="font-display font-black text-white mb-2 leading-tight"
                      style={{ fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)', lineHeight: '1.1', letterSpacing: '-0.02em' }}>
                      {collection.name}
                    </h3>

                    <p className="text-white/70 mb-6 max-w-xs leading-relaxed text-sm">
                      {collection.description}
                    </p>

                    <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-sm text-white font-semibold text-sm tracking-wide hover:bg-white/20 transition-all border border-white/20 group-hover:gap-3">
                      Explore
                      <motion.div
                        whileHover={{ x: 3 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </motion.div>
                    </div>
                  </div>
                </div>
              </Link>

              <div className="absolute top-4 left-4 right-4 flex justify-between pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="pointer-events-auto">
                  <span className="inline-block px-3 py-1.5 text-[10px] font-black uppercase tracking-widest bg-white/10 backdrop-blur-sm text-white rounded-full border border-white/20">
                    Collection
                  </span>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-12 text-center"
        >
          <Link
            to="/products"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full glass-strong text-white font-semibold text-sm tracking-wide hover:bg-white/10 transition-all border border-white/10 group"
          >
            Browse All Categories
            <motion.div
              whileHover={{ x: 4 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              <ChevronRight className="w-5 h-5" />
            </motion.div>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default ShopByStyle;