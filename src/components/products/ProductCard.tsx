import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Eye, Check } from 'lucide-react';
import { Product } from '../../types/product';
import { formatPrice } from '../../lib/utils';
import { useFavorites } from '../../hooks/useFavorites';
import { motion, AnimatePresence } from 'motion/react';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, index = 0 }) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(product.id);
  const [isHovered, setIsHovered] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Auto-cycle images every 3 seconds while hovered
  useEffect(() => {
    if (!isHovered || (product.images?.length ?? 0) <= 1) {
      setCurrentImageIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % product.images?.length ?? 0);
    }, 3000);

    return () => clearInterval(interval);
  }, [isHovered, product.images?.length ?? 0]);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(product);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35, delay: (index % 8) * 0.05 }}
      className="group flex flex-col h-full bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs hover:shadow-xl hover:border-zinc-400 dark:hover:border-zinc-600 transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setCurrentImageIndex(0);
      }}
    >
      {/* Top Media Area with 3s Slider */}
      <div className="relative aspect-[4/5] bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
        <Link to={`/products/${product.id}`} className="block w-full h-full">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentImageIndex}
              src={product.images[currentImageIndex] || product.images[0]}
              alt={product.name}
              initial={{ opacity: 0.8 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0.8 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-500 ease-out"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          </AnimatePresence>
        </Link>

        {/* Badges (Top Left) */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none z-10">
          {product.isNew && (
            <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 rounded-md shadow-xs">
              Yangi
            </span>
          )}
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-orange-600 text-white rounded-md shadow-xs">
              Chegirma
            </span>
          )}
        </div>

        {/* Favorite Button (Top Right) */}
        <button
          type="button"
          onClick={handleFavoriteClick}
          className={`absolute top-3 right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-200 ${
            favorite
              ? 'bg-rose-50 dark:bg-rose-950/80 text-rose-500 border border-rose-200 dark:border-rose-800'
              : 'bg-white/90 dark:bg-zinc-900/90 text-zinc-600 dark:text-zinc-300 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-white dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-700'
          }`}
          aria-label={favorite ? "Sevimlilardan o'chirish" : "Sevimlilarga qo'shish"}
          title={favorite ? "Sevimlilardan o'chirish" : "Sevimlilarga qo'shish"}
        >
          <Heart className={`w-4 h-4 transition-transform duration-200 ${favorite ? 'fill-rose-500 scale-110' : 'group-hover:scale-105'}`} />
        </button>

        {/* Multi-Image Dots / 3s Slide Indicator (shown on hover if >1 image) */}
        {(product.images?.length ?? 0) > 1 && (
          <div className="absolute bottom-12 left-0 right-0 z-10 flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            {<ProductImages.map((_, i) => </ProductImages>?map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentImageIndex === i
                    ? 'w-4 bg-white shadow-sm'
                    : 'w-1.5 bg-white/50'
                }`}
              />
            ))}
          </div>
        )}

        {/* Quick View Hover Strip */}
        <div className="absolute bottom-3 left-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Link
            to={`/products/${product.id}`}
            className="w-full py-2.5 px-3 rounded-xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md text-zinc-900 dark:text-white text-xs font-black tracking-wide flex items-center justify-center gap-1.5 shadow-md hover:bg-zinc-900 hover:text-white dark:hover:bg-white dark:hover:text-zinc-950 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Tafsilotlarni ko'rish</span>
          </Link>
        </div>
      </div>

      {/* Product Information Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-1">
            <span className="font-bold uppercase tracking-wider text-[10px] text-zinc-400 dark:text-zinc-500">{product.categoryName}</span>
            {product.brand && <span className="font-bold text-zinc-600 dark:text-zinc-400">{product.brand}</span>}
          </div>

          <Link
            to={`/products/${product.id}`}
            className="block font-black text-sm sm:text-base text-zinc-900 dark:text-white hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors line-clamp-1 font-['Outfit',sans-serif] tracking-tight"
          >
            {product.name}
          </Link>
        </div>

        {/* Color swatches & Size tags preview */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-zinc-100 dark:border-zinc-800">
          {/* Colors */}
          <div className="flex items-center gap-1">
            {product.colors.slice(0, 4).map((c, i) => (
              <span
                key={i}
                title={c.name}
                className="w-3.5 h-3.5 rounded-full border border-zinc-300 dark:border-zinc-600 shrink-0"
                style={{ backgroundColor: c.hex }}
              />
            ))}
            {product.colors.length > 4 && (
              <span className="text-[10px] text-zinc-400 font-bold">
                +{product.colors.length - 4}
              </span>
            )}
          </div>

          {/* Sizes */}
          <div className="flex items-center gap-1 text-[11px] text-zinc-600 dark:text-zinc-400 font-mono font-bold">
            {product.sizes.slice(0, 3).map((size, i) => (
              <span key={i} className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded text-[10px]">
                {size}
              </span>
            ))}
            {product.sizes.length > 3 && (
              <span className="text-[10px] text-zinc-400 font-bold">
                +{product.sizes.length - 3}
              </span>
            )}
          </div>
        </div>

        {/* Price and Stock status */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <div className="text-base sm:text-lg font-black text-zinc-900 dark:text-white font-['Outfit',sans-serif] tracking-tight">
              {formatPrice(product.price)}
            </div>
            {product.originalPrice && product.originalPrice > product.price && (
              <div className="text-xs text-zinc-400 line-through -mt-0.5 font-bold">
                {formatPrice(product.originalPrice)}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 rounded-md">
            <Check className="w-3 h-3" />
            <span>Do'konda</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
