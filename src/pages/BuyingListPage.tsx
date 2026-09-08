import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSaveToBuy } from '../context/SaveToBuyContext';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/products/ProductCard';
import { Save, Trash2, ShoppingBag } from 'lucide-react';
import { motion } from 'motion/react';
import { useI18n } from '../i18n/I18nContext';
import { formatPrice } from '../lib/utils';
import { track } from '../lib/analytics/client';

export const BuyingListPage: React.FC = () => {
  const { items, lines, totalCount, totalSum, clearList, isSaved, toggleSave, setQty } = useSaveToBuy();
  const { storeInfo } = useStore();
  const { t } = useI18n();
  const navigate = useNavigate();

  // Track buying list open
  useEffect(() => {
    track('buy_list_open', { totalItems: totalCount, totalSum });
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
          <button
            type="button"
            onClick={clearList}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 border border-amber-200 dark:border-amber-800 transition-colors uppercase tracking-wider"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{t('pages', 'buyList.clear')}</span>
          </button>
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
          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {lines.map((line, idx) => (
              <ProductCard
                key={line.id || idx}
                product={line.product}
                index={idx}
                
              />
            ))}
          </div>

          {/* Summary */}
          <div className="pt-6 border-t border-border">
            <div className="flex justify-between text-sm text-zinc-500 dark:text-zinc-400">
              <span>{t('pages', 'buyList.subtotal')}</span>
              <span className="font-black text-foreground">{formatPrice(totalSum)} so'm</span>
            </div>

            {storeInfo.city && storeInfo.address && (
              <div className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
                {t('pages', 'buyList.location', storeInfo.city, storeInfo.address)}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-6 flex flex-col sm:flex-row gap-3">
            <Link
              to="/products"
              className="flex-1 sm:flex-auto inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-black text-sm bg-foreground text-background dark:bg-card dark:text-card-foreground hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all shadow-sm tracking-wide"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{t('pages', 'buyList.continueShopping')}</span>
            </Link>

            <button
              onClick={() => navigate('/')}
              className="sm:flex-auto inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-black text-sm bg-amber-600 text-amber-950 hover:bg-amber-500 dark:bg-amber-800 dark:text-amber-50 transition-all shadow-md tracking-wide">
              <Save className="w-4 h-4" />
              <span>{t('pages', 'buyList.generateQR')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};