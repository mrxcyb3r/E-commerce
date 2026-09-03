import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { ProductCard } from './ProductCard';
import { motion } from 'motion/react';

export const FeaturedProducts: React.FC = () => {
  const { publishedProducts, homepageCms, publishedCategories } = useStore();
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const categories = publishedCategories;

  const filterTabs = [
    { id: 'all', label: 'Barchasi' },
    ...categories.slice(0, 4).map((c) => ({ id: c.slug, label: c.name })),
  ];

  const featuredProducts = publishedProducts.filter((p) => p.isFeatured || p.isNew);
  const displayedProducts = selectedFilter === 'all'
    ? (featuredProducts.length > 0 ? featuredProducts.slice(0, 8) : publishedProducts.slice(0, 8))
    : (featuredProducts.filter((p) => p.category === selectedFilter).length > 0
        ? featuredProducts.filter((p) => p.category === selectedFilter).slice(0, 8)
        : publishedProducts.filter((p) => p.category === selectedFilter).slice(0, 8));

  return (
    <section id="products" className="py-16 md:py-24 bg-white dark:bg-zinc-900 transition-colors scroll-mt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="space-y-2"
          >
            <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Eng saralangan</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-zinc-900 dark:text-white font-['Outfit',sans-serif] tracking-tighter">
              {homepageCms.featuredSectionTitle || 'Mashhur mahsulotlar'}
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-lg font-normal">
              {homepageCms.featuredSectionSubtitle || 'Xaridorlarimiz tomonidan eng ko\'p tanlanayotgan va do\'konimizda mavjud bo\'lgan zamonaviy mahsulotlar.'}
            </p>
          </motion.div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl self-start md:self-auto border border-zinc-200 dark:border-zinc-700">
            {filterTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedFilter(tab.id)}
                className={`px-3.5 py-1.5 text-xs rounded-lg transition-all ${
                  selectedFilter === tab.id
                    ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 font-black shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white font-bold'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid (8 products) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayedProducts.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>

        {/* Bottom CTA to all products */}
        <div className="mt-12 text-center">
          <Link
            to="/products"
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl font-black text-sm tracking-wide bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all shadow-sm hover:shadow-md group"
          >
            <span>Barcha mahsulotlarni ko'rish</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
};
