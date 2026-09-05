import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Check, Package } from 'lucide-react';
import { Product } from '../../types/product';
import { formatPrice } from '../../lib/utils';
import { useFavorites } from '../../context/FavoritesContext';
import { motion, AnimatePresence } from 'motion/react';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, index = 0 }) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(product.id);
  const imageCount = product.images?.length ?? 0;

  const isOnSale = !!product.originalPrice && product.originalPrice > product.price;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35, delay: (index % 8) * 0.05 }}
      className="flex flex-col h-full bg-white dark:bg-zinc-900 overflow-hidden border border-zinc-100 dark:border-zinc-800 transition-colors"
      onMouseEnter={() => {}}
      onMouseLeave={() => {}}
    >
      {/* Product Image - dominates the card */}
      <div className="aspect-[4/5] bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
        <Link to={`/products/${product.id}`} className="block w-full h-full">
          {imageCount > 0 ? (
            <AnimatePresence mode="wait">
              <motion.img
                key={0}
                src={product.images[0] ?? ''}
                alt={product.name}
                initial={{ opacity: 0.8 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0.8 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full object-cover object-center transition-transform duration-500 ease-out"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            </AnimatePresence>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500">
              <Package className="w-10 h-10 opacity-50" />
            </div>
          )}
        </Link>

        {/* Favorite Button - compact, always visible */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(product);
          }}
          className="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full flex items-center justify-center border border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 text-zinc-600 dark:text-zinc-300 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-white dark:hover:bg-zinc-900 transition-all shadow-sm"
          aria-label={favorite ? "Sevimlilardan o'chirish" : "Sevimlilarga qo'shish"}
          title={favorite ? "Sevimlilardan o'chirish" : "Sevimlilarga qo'shish"}
        >
          <Heart className={`w-4 h-4 transition-transform duration-200 ${favorite ? 'fill-rose-500 scale-110' : 'group-hover:scale-105'}`} />
        </button>

        {/* Sale badge - subtle when on sale */}
        {isOnSale && (
          <span className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-orange-600 text-white rounded-md">
            Chegirma
          </span>
        )}
      </div>

      {/* Product Information */}
      <div className="p-3 flex-1 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-1">
          <span className="font-bold uppercase tracking-wider text-[10px] text-zinc-400 dark:text-zinc-500">
            {product.categoryName}
          </span>
        </div>

        <Link
          to={`/products/${product.id}`}
          className="block font-black text-base sm:text-lg text-zinc-900 dark:text-white hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors line-clamp-1 font-['Outfit',sans-serif] tracking-tight"
        >
          {product.name}
        </Link>

        {/* Price and Stock */}
        <div className="flex items-center justify-between pt-2">
          <div>
            <div className="text-base sm:text-lg font-black text-zinc-900 dark:text-white font-['Outfit',sans-serif] tracking-tight">
              {formatPrice(product.price)}
            </div>
            {isOnSale && (
              <div className="text-xs text-zinc-400 line-through -mt-0.5 font-bold">
                {formatPrice(product.originalPrice!)}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 rounded-md">
            {product.inStock ? (
              <>
                <Check className="w-3 h-3" />
                <span>Do'konda</span>
              </>
            ) : (
              <>
                <Package className="w-3 h-3" />
                <span>Tugagan</span>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;