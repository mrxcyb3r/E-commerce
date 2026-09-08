import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSaveToBuy } from '../context/SaveToBuyContext';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/products/ProductCard';
import { Save, Trash2, ShoppingBag, Heart } from 'lucide-react';
import { motion } from 'motion/react';
import { useI18n } from '../i18n/I18nContext';
import { formatPrice } from '../lib/utils';
import { track } from '../lib/analytics/client';

export const BuyingListPage: React.FC = () => {
  const { items, lines, totalCount, totalSum, clearList, isSaved, toggleSave, setQty, removeItem, moveToFavorites } = useSaveToBuy();
  const { storeInfo } = useStore();
  const { t } = useI18n();
  const navigate = useNavigate();

  // Track buying list open
  useEffect(() => {
    track('buy_list_open', { metadata: { totalItems: totalCount, totalSum } });
  }, []);

  return (
    <div className="pt-28 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[70vh]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-6 border-b border-border">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-500 mb-1">
            <Save className="w-3.5 h-3.5 fill-amber-500" />
            <span>{t('pages', 'buyList.eyebrow')}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-foreground font-display tracking-tighter">
            {t('pages', 'buyList.title')}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 font-normal">
            {totalCount > 0
              ? t('pages', 'buyList.count', totalCount, formatPrice(totalSum))
              : t('pages', 'buyList.emptyDesc')}
          </p>
        </div>

        {totalCount > 0 && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={clearList}
              aria-label="Ro'yxatni tozalash"
              className="self-start sm:self-auto inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 border border-amber-200 dark:border-amber-800 transition-colors uppercase tracking-wider"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t('pages', 'buyList.clear')}</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/products')}
              aria-label="Keyingizga qaytish"
              className="self-start sm:self-auto inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black text-foreground dark:text-card-foreground hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all shadow-sm tracking-wide"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{t('pages', 'buyList.continueShopping')}</span>
            </button>

            <button
              type="button"
              onClick={() => moveToFavorites(items[0]?.product)}
              aria-label="Sevimlilarga qo'shish"
              className="self-start sm:self-auto inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900 transition-colors uppercase tracking-wider"
            >
              <Heart className="w-3.5 h-3.5" />
              <span>{t('pages', 'buyList.moveToFav')}</span>
            </button>
          </div>
        )}
      </div>

      {totalCount === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto py-16 text-center space-y-5"
        >
          <div className="w-20 h-20 rounded-3xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 flex items-center justify-center mx-auto">
            <Save className="w-10 h-10" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-2xl font-black text-foreground font-display tracking-tight">
              {t('pages', 'buyList.emptyTitle')}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
              {t('pages', 'buyList.emptyHint')}
            </p>
          </div>

          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-black text-sm bg-foreground text-background dark:bg-card dark:text-card-foreground hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all shadow-sm tracking-wide"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{t('pages', 'buyList.browse')}</span>
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-8">
          {/* Summary Header */}
          <div className="pt-6 border-b border-border">
            <div className="flex justify-between text-sm text-zinc-500 dark:text-zinc-400">
              <span>{t('pages', 'buyList.subtotal')}</span>
              <span className="font-black text-foreground">{formatPrice(totalSum)} so'm</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
              <span>{t('pages', 'buyList.items')}: {totalCount} dona</span>
              <span>{t('pages', 'buyList.products')}: {lines.length} ta</span>
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {lines.map((line, idx) => (
              <ProductCard key={line.id || idx} product={line.product} index={idx} />
            ))}
          </div>

          {/* Per-item controls */}
          {lines.length > 0 && (
            <div className="pt-4 space-y-3">
              {lines.map((line, idx) => (
                <div key={line.id || idx} className="flex items-center justify-between px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-border/60">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-foreground truncate">
                      {line.product.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setQty(line.id, 1)}
                        aria-label="Miqdar 1 ga oshirish"
                        className="p-1.5 rounded-xl bg-white dark:bg-zinc-800 text-sm font-black text-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="5" y1="12" x2="19" y2="12" />
                          <line x1="12" y1="5" x2="12" y2="19" />
                        </svg>
                      </button>
                      <span className="mx-2 font-black text-foreground">{line.qty}</span>
                      <button
                        type="button"
                        onClick={() => setQty(line.id, line.qty - 1)}
                        aria-label="Miqdar kamaytirish"
                        className="p-1.5 rounded-xl bg-white dark:bg-zinc-800 text-sm font-black text-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="5" y1="12" x2="19" y2="12" />
                          <line x1="12" y1="5" x2="12" y2="19" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">
                      {t('pages', 'buyList.unitPrice')}: {formatPrice(line.product.price)} so'm
                    </span>
                    <span className="font-black text-foreground">{formatPrice(line.lineTotal)} so'm</span>
                  </div>
                  {line.notes && (
                    <span className="text-xs text-zinc-400 dark:text-zinc-300">
                      {t('pages', 'buyList.notes')}: {line.notes}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeItem(line.id)}
                    aria-label="Remove from buying list"
                    className="p-1.5 rounded-xl bg-red-500 text-white text-xs font-bold hover:bg-red-600 transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-6 flex flex-col sm:flex-row gap-3">
            <Link
              to="/products"
              className="flex-1 sm:flex-auto inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-black text-sm bg-foreground text-background dark:bg-card dark:text-card-foreground hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all shadow-sm tracking-wide">
              <ShoppingBag className="w-4 h-4" />
              <span>{t('pages', 'buyList.continueShopping')}</span>
            </Link>

            <div className="sm:flex-auto">
              <button
                onClick={() => window.open('', '_blank')}
                className="sm-flex-auto inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-black text-sm bg-amber-600 text-amber-950 hover:bg-amber-500 dark:bg-amber-800 dark:text-amber-50 transition-all shadow-md tracking-wide">
                <Save className="w-4 h-4" />
                <span>{t('pages', 'buyList.generateQR')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};