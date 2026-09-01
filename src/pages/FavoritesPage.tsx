import React from 'react';
import { Link } from 'react-router-dom';
import { useFavorites } from '../hooks/useFavorites';
import { ProductCard } from '../components/products/ProductCard';
import { Heart, Trash2, ArrowRight, Store, ShoppingBag } from 'lucide-react';
import { motion } from 'motion/react';
import { BUSINESS_CONFIG } from '../config/business';

export const FavoritesPage: React.FC = () => {
  const { favoriteProducts, totalFavorites, clearFavorites } = useFavorites();

  return (
    <div className="pt-28 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[70vh]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-rose-500 mb-1">
            <Heart className="w-3.5 h-3.5 fill-rose-500" />
            <span>Saqlanganlar</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white font-['Outfit',sans-serif] tracking-tighter">
            Sevimlilar ro'yxati
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 font-normal">
            {totalFavorites > 0
              ? `Siz ${totalFavorites} ta mahsulotni saqlab qo'ydingiz.`
              : "Do'konga borishdan oldin yoqtirgan mahsulotlaringizni shu yerga saqlang."}
          </p>
        </div>

        {totalFavorites > 0 && (
          <button
            type="button"
            onClick={clearFavorites}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900 transition-colors uppercase tracking-wider"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Ro'yxatni tozalash</span>
          </button>
        )}
      </div>

      {totalFavorites === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto py-16 text-center space-y-5"
        >
          <div className="w-20 h-20 rounded-3xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 flex items-center justify-center mx-auto">
            <Heart className="w-10 h-10" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-2xl font-black text-zinc-900 dark:text-white font-['Outfit',sans-serif] tracking-tight">
              Sevimli mahsulotlaringiz shu yerda ko'rinadi.
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
              Katalogdagi yurakcha tugmasini bosib, o'zingizga yoqqan kiyim va oyoq kiyimlarni saqlab qo'ying.
            </p>
          </div>

          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-black text-sm bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all shadow-sm tracking-wide"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Mahsulotlarni ko'rish</span>
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-8">
          {/* Helpful Store Visit Tip Banner */}
          <div className="p-5 sm:p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center shrink-0">
                <Store className="w-6 h-6" />
              </div>
              <div>
                <div className="text-sm sm:text-base font-black text-zinc-900 dark:text-white">
                  Do'konga tashrif buyurganingizda:
                </div>
                <div className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-medium">
                  Ushbu sahifani sotuvchiga ko'rsatsangiz, tanlangan mahsulotlarni kiyib ko'rish uchun tezda olib berishadi.
                </div>
              </div>
            </div>

            <a
              href={BUSINESS_CONFIG.telegram}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 text-xs font-black rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100 shrink-0 transition-colors shadow-xs"
            >
              Telegramda yuborish
            </a>
          </div>

          {/* Grid of Saved Favorite Products */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {favoriteProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
