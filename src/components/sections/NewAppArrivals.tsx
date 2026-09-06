// Unused — kept for potential future use
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { ProductCard } from '../products/ProductCard';
import { Reveal } from '../motion';

export const NewAppArrivals: React.FC = () => {
  const { publishedProducts, homepageCms } = useStore();

  const newProducts = publishedProducts.filter((p) => p.isNew);

  const displayProducts = newProducts.length > 0 ? newProducts.slice(0, 8) : publishedProducts.slice(0, 8).filter((p, i) => i < 8);

  const eyebrow = 'Yangi kelganlar';
  const heading = 'Katalogga yaqinda qo\'shilgan';
  const ctaText = 'Barchasini ko\'rish →';

  return (
    <section id="new-arrivals" className="py-10 md:py-16 bg-card transition-colors scroll-mt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <Reveal className="space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{eyebrow}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground font-['Outfit',sans-serif] tracking-tighter">
              {heading}
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-lg font-normal">
              {newProducts.length > 0 ? 'Doimiy yangilanuvchi kolleksiyaga xush kelibsiz' : 'Do\'konimizdagi yangi arrivallar'}
            </p>
          </Reveal>

          {/* CTA */}
          <div className="self-start md:self-auto">
            <Link
              to="/products"
              className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-2xl text-xs font-black tracking-wide text-zinc-900 dark:text-zinc-300 border border-border hover:bg-zinc-50 dark:hover:bg-background transition-all"
            >
              <span>{ctaText}</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>

      {/* Product Cards Grid - 2-column on mobile, 3 on tablet, 4 on desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {displayProducts.map((product, index) => (
          <ProductCard key={product.id} product={product} index={index} />
        ))}
      </div>
    </section>
  );
};
