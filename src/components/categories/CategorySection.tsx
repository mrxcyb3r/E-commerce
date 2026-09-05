import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Layers } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { CategoryCard } from './CategoryCard';
import { motion } from 'motion/react';

export const CategorySection: React.FC = () => {
  const { publishedCategories: categories } = useStore();

  return (
    <section className="py-16 md:py-24 bg-zinc-50/50 dark:bg-zinc-950 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="space-y-2"
          >
            <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              <Layers className="w-3.5 h-3.5" />
              <span>Kerakli bo‘limni tanlang</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-zinc-900 dark:text-white font-['Outfit',sans-serif] tracking-tighter">
              Kerakli bo‘limni tanlang
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-lg font-normal">
              Erkaklar, ayollar va bolalar kiyimlari, poyabzallar va aksessuarlarni bir joydan ko‘rib chiqing.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Link
              to="/products"
              className="inline-flex items-center gap-1.5 text-sm font-black text-zinc-900 dark:text-white hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors group"
            >
              <span>Barcha toifalar</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>

        {/* Category Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          {categories.map((category, index) => (
            <CategoryCard key={category.id} category={category} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};
