import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSaveToBuy } from '../context/SaveToBuyContext';
import { useBuySession } from '../context/BuySessionContext';
import { BUSINESS_CONFIG } from '../config/business';
import { Save, Trash2, ShoppingBag, Heart, Minus, Plus, QrCode, MessageSquare, ArrowRight, ShoppingCart, Check, MapPin } from 'lucide-react';
import { motion } from 'motion/react';
import { useI18n } from '../i18n/I18nContext';
import { formatPrice } from '../lib/utils';
import { track } from '../lib/analytics/client';

const flowSteps = [
  { icon: Save, labelKey: 'buyList.flowStep1', descKey: 'buyList.flowStep1Desc' },
  { icon: QrCode, labelKey: 'buyList.flowStep2', descKey: 'buyList.flowStep2Desc' },
  { icon: MapPin, labelKey: 'buyList.flowStep3', descKey: 'buyList.flowStep3Desc' },
  { icon: ShoppingCart, labelKey: 'buyList.flowStep4', descKey: 'buyList.flowStep4Desc' },
  { icon: Check, labelKey: 'buyList.flowStep5', descKey: 'buyList.flowStep5Desc' },
];

export const BuyingListPage: React.FC = () => {
  const { items, lines, totalCount, totalSum, clearList, setQty, removeItem, setNotes, moveToFavorites } = useSaveToBuy();
  const { openSession } = useBuySession();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [notesMap, setNotesMap] = useState<Record<string, string>>({});
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    track('buy_list_open', { metadata: { totalItems: totalCount, totalSum } });
  }, []);

  const handlePrepareForStore = () => {
    if (totalCount === 0) return;
    setCreating(true);
    const newSession = openSession(items, BUSINESS_CONFIG.name || 'default');
    track('buy_session_created', { metadata: { itemCount: lines.length, totalQty: totalCount, totalSum } });
    setTimeout(() => {
      setCreating(false);
      navigate(`/buy-session/${newSession.code}`, { replace: true });
    }, 400);
  };

  const handleNotesChange = (id: string, value: string) => {
    setNotesMap((prev) => ({ ...prev, [id]: value }));
    setNotes(id, value);
  };

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
              className="self-start sm:self-auto inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 border border-amber-200 dark:border-amber-800 transition-colors uppercase tracking-wider"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t('pages', 'buyList.clear')}</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/products')}
              className="self-start sm:self-auto inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black text-foreground dark:text-card-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all shadow-sm tracking-wide border border-border"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{t('pages', 'buyList.continueShopping')}</span>
            </button>
          </div>
        )}
      </div>

      {totalCount === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto py-16 text-center space-y-8"
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

          {/* Flow illustration */}
          <div className="pt-8 border-t border-border">
            <p className="text-[11px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-6">
              {t('pages', 'buyList.flowTitle')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-0">
              {flowSteps.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <React.Fragment key={idx}>
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] font-bold text-zinc-600 dark:text-zinc-300">{t('pages', step.labelKey)}</span>
                      <span className="text-[10px] text-zinc-400">{t('pages', step.descKey)}</span>
                    </div>
                    {idx < flowSteps.length - 1 && (
                      <ArrowRight className="w-4 h-4 text-zinc-300 dark:text-zinc-600 hidden sm:block mx-2 shrink-0" />
                    )}
                    {idx < flowSteps.length - 1 && (
                      <ArrowRight className="w-4 h-4 text-zinc-300 dark:text-zinc-600 sm:hidden rotate-90 my-1" />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {/* Summary Header */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-border/60 p-4 sm:p-5"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-zinc-500 dark:text-zinc-400">{t('pages', 'buyList.items')}:</span>
                  <span className="font-black text-foreground">{totalCount} dona</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-zinc-500 dark:text-zinc-400">{t('pages', 'buyList.products')}:</span>
                  <span className="font-black text-foreground">{lines.length} ta</span>
                </div>
              </div>
              <div className="sm:text-right">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{t('pages', 'buyList.subtotal')}</p>
                <p className="text-2xl font-black text-foreground">{formatPrice(totalSum)}</p>
              </div>
            </div>
          </motion.div>

          {/* Per-item controls */}
          <div className="space-y-3">
            {lines.map((line, idx) => (
              <motion.div
                key={line.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="rounded-2xl border border-border/60 bg-card p-4 sm:p-5 space-y-3"
              >
                {/* Product name + remove */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      to={`/products/${line.id}`}
                      className="font-black text-foreground hover:text-amber-600 dark:hover:text-amber-400 transition-colors truncate block"
                    >
                      {line.product.name}
                    </Link>
                    {(line.size || line.color) && (
                      <div className="flex items-center gap-2 mt-1">
                        {line.size && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-[11px] font-bold text-zinc-600 dark:text-zinc-300">
                            {t('pages', 'buyList.size') || 'O\'lcham'}: {line.size}
                          </span>
                        )}
                        {line.color && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-[11px] font-bold text-zinc-600 dark:text-zinc-300">
                            {t('pages', 'buyList.color') || 'Rang'}: {line.color}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-black text-foreground">{formatPrice(line.lineTotal)}</span>
                    <button
                      type="button"
                      onClick={() => removeItem(line.id)}
                      className="p-1.5 rounded-xl text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                      aria-label="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Qty + unit price + move-to-fav */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setQty(line.id, line.qty - 1)}
                      disabled={line.qty <= 1}
                      className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center font-black text-foreground">{line.qty}</span>
                    <button
                      type="button"
                      onClick={() => setQty(line.id, line.qty + 1)}
                      className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs text-zinc-400 dark:text-zinc-500 ml-1">
                      × {formatPrice(line.product.price)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => moveToFavorites(line.product)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  >
                    <Heart className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{t('pages', 'buyList.moveToFav')}</span>
                  </button>
                </div>

                {/* Notes */}
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-2.5 w-3.5 h-3.5 text-zinc-300 dark:text-zinc-600" />
                  <input
                    type="text"
                    value={notesMap[line.id] ?? line.notes ?? ''}
                    onChange={(e) => handleNotesChange(line.id, e.target.value)}
                    placeholder={t('pages', 'buyList.notesPlaceholder') || 'Izoh qoldirish...'}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-border/60 text-xs text-foreground placeholder:text-zinc-300 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all"
                  />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Prepare for Store CTA */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="sticky bottom-24 z-10"
          >
            <div className="rounded-2xl bg-card border border-border shadow-lg p-4 sm:p-5 space-y-4">
              {/* Summary */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-500 dark:text-zinc-400">
                  {totalCount} dona · {lines.length} ta mahsulot
                </span>
                <span className="font-black text-foreground text-lg">{formatPrice(totalSum)}</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  to="/products"
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-black text-sm bg-foreground text-background dark:bg-card dark:text-card-foreground hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all shadow-sm tracking-wide border border-border"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{t('pages', 'buyList.continueShopping')}</span>
                </Link>

                <button
                  type="button"
                  onClick={handlePrepareForStore}
                  disabled={totalCount === 0 || creating}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-black text-sm bg-amber-500 text-amber-950 hover:bg-amber-400 dark:bg-amber-600 dark:text-amber-50 dark:hover:bg-amber-500 transition-all shadow-md tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? (
                    <div className="w-4 h-4 rounded-full border-2 border-amber-950/30 border-t-amber-950 animate-spin" />
                  ) : (
                    <QrCode className="w-4 h-4" />
                  )}
                  <span>{t('pages', 'buyList.prepareStore')}</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
