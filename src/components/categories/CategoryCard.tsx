import React from 'react';
import { Link } from 'react-router-dom';
import { Category } from '../../types/product';
import { ArrowUpRight } from 'lucide-react';
import { track } from '../../lib/analytics/client';
import { motion } from 'motion/react';

interface CategoryCardProps {
  category: Category;
  index: number;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
    >
      <Link
        to={`/products?category=${category.slug}`}
        onClick={() => track('category_view', { categoryId: category.slug, uniquePerVisitor: true })}
        className="group relative block rounded-2xl overflow-hidden aspect-[4/5] bg-zinc-100 dark:bg-zinc-800 border border-border shadow-xs hover:shadow-xl transition-all duration-300"
      >
        {/* Background Image with Zoom on Hover */}
        <img
          src={category.image}
          alt={category.name}
          className="w-full h-full object-cover object-center transform group-hover:scale-108 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/40 to-transparent transition-opacity duration-300" />

        {/* Card Content */}
        <div className="absolute inset-0 p-5 flex flex-col justify-between text-white">
          <div className="flex justify-end">
            <span className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white opacity-80 group-hover:opacity-100 group-hover:bg-white group-hover:text-zinc-950 transition-all duration-200">
              <ArrowUpRight className="w-4 h-4 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-black text-zinc-300 tracking-wider uppercase">
              {category.productCount} ta mahsulot
            </span>
            <h3 className="text-xl font-black text-white tracking-tight font-['Outfit',sans-serif]">
              {category.name}
            </h3>
            <p className="text-xs text-zinc-300 line-clamp-1 opacity-90 font-medium">
              {category.description}
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
