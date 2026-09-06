import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { ProductCard } from './ProductCard';
import { motion } from 'motion/react';

export const FeaturedProducts: React.FC = () => {
  const { publishedProducts, homepageCms } = useStore();
  const featuredProducts = publishedProducts.filter((p) => p.isFeatured || p.isNew);
  const displayedProducts = featuredProducts.length > 0 ? featuredProducts.slice(0, 8) : publishedProducts.slice(0, 8);

  const hasNewProducts = featuredProducts.some((p) => p.isNew);
  const hasDiscountedProducts = featuredProducts.some((p) => p.originalPrice && p.originalPrice > p.price);

  return (
    <section id="products" className="py-10 md:py-16 bg-card transition-colors scroll-mt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="space-y-2"
          >
            <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{'Tanlanganlar'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground font-['Outfit',sans-serif] tracking-tighter">
              {homepageCms.featuredSectionTitle || 'Ommabop mahsulotlar'}
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-lg font-normal">
              {homepageCms.featuredSectionSubtitle || 'Eng ko\'p ko\'rilayotgan mahsulotlar shu yerda.'}
            </p>
          </motion.div>

          {/* CTA to all products */}
          <div className="self-start md:self-auto">
            <Link
              to="/products"
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl font-black text-sm tracking-wide bg-foreground text-background dark:bg-card dark:text-card-foreground hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all shadow-sm hover:shadow-md group"
            >
              <span>Barchasini ko'rish →</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>

      {/* Product Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {displayedProducts.map((product, index) => (
          <ProductCard key={product.id} product={product} index={index} />
        ))}
      </div>
    </section>
  );
};