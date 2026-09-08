import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import { motion } from 'motion/react';
import { MapPin, Clock, Copy, Check, Share2, RefreshCw, ShoppingBag, ArrowLeft, Phone, Send } from 'lucide-react';
import { useBuySession } from '../context/BuySessionContext';
import { useStore } from '../context/StoreContext';
import { formatPrice } from '../lib/utils';
import { encodeSessionForQR, formatTimeRemaining, verifyChecksum } from '../types/buySession';
import { useI18n } from '../i18n/I18nContext';
import { track } from '../lib/analytics/client';

export const BuySessionPage: React.FC = () => {
  const { code } = useParams<{ code: string }>();
const { session, regenerateSession } = useBuySession();
const { storeInfo } = useStore();
const { t } = useI18n();
const [now, setNow] = useState<number>(() => Date.now());
const [copied, setCopied] = useState(false);
const [qrcode, setQrcode] = useState<string | null>(null);

  const current = session?.session;
  const isValid =
    current &&
    (!code || current.code.toUpperCase() === code.toUpperCase());

  // Track page view + build QR payload once relevant session is valid
  useEffect(() => {
    if (isValid && current) {
      track('buy_session_opened', {
        metadata: {
          code: current.code,
          itemCount: current.items.length,
          totalQty: current.items.reduce((s, i) => s + i.qty, 0),
          validChecksum: verifyChecksum(current),
        },
      });
      try {
        setQrcode(encodeSessionForQR(current));
      } catch {
        setQrcode(null);
      }
    }
  }, [isValid, current]);

// Live countdown
useEffect(() => {
  if (!session) return;
  const iv = setInterval(() => {
    setNow(Date.now());
  }, 1000);
  return () => clearInterval(iv);
}, [session]);

  // Handle copy
  const handleCopy = async () => {
    if (!current) return;
    try {
      await navigator.clipboard.writeText(current.code);
      setCopied(true);
      track('buy_session_copied', { metadata: { code: current.code } });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleShare = async () => {
    if (!current) return;
    const url = `${window.location.origin}/buy-session/${current.code}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: storeInfo.businessName || 'Do\'kon',
          text: `${current.code}`,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
      track('buy_session_shared', { metadata: { code: current.code } });
    } catch {
      // user cancelled
    }
  };

  const handleRegenerate = () => {
    regenerateSession();
  };

  // No valid session — explain the flow + CTA
if (!isValid || !session) {
    return (
      <div className="pt-28 pb-24 max-w-lg mx-auto px-4 sm:px-6 lg:px-8 min-h-[70vh] text-center space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5"
        >
          <div className="w-20 h-20 rounded-3xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 flex items-center justify-center mx-auto">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-2xl font-black text-foreground font-display tracking-tight">
              {t('pages', 'buyList.sessionExpiredTitle') || 'Sessiya topilmadi'}
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {t('pages', 'buyList.sessionExpiredDesc') || 'Do\'kon uchun yangi sessiya yaratish uchun ro\'yxatingizni qayta tayyorlang.'}
            </p>
          </div>
          <Link
            to="/buy-list"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-black text-sm bg-foreground text-background dark:bg-card dark:text-card-foreground hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all shadow-sm tracking-wide"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('pages', 'buyList.continueShoppingBtn')}</span>
          </Link>
        </motion.div>
      </div>
    );
  }

  const expiresInMs = Math.max(0, session.session.exp - now);
  const totalSum = session.totalSum;

  return (
    <div className="pt-28 pb-24 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[70vh]">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="text-center space-y-1.5">
          <p className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-500">
            <ShoppingBag className="w-3.5 h-3.5" />
            {t('pages', 'buyList.sessionTitle')}
          </p>
          <h1 className="text-2xl font-black text-foreground font-display tracking-tighter">
            {t('pages', 'buyList.sessionDesc')}
          </h1>
        </div>

        {/* QR + Passcode card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.05 }}
          className="rounded-3xl bg-card border border-border p-6 sm:p-8 shadow-lg space-y-6 text-center"
        >
          {qrcode ? (
            <div className="mx-auto w-fit">
              <div className="bg-white p-4 rounded-2xl shadow-sm ring-1 ring-zinc-100 dark:ring-zinc-800">
                <QRCodeCanvas
                  value={qrcode}
                  size={208}
                  marginSize={2}
                  level="M"
                  title={t('pages', 'buyList.qrAlt')}
                />
              </div>
            </div>
          ) : (
            <div className="mx-auto w-52 h-52 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded-2xl" />
          )}

          <div className="space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">
              {t('pages', 'buyList.passcodeLabel')}
            </p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-5xl font-black tracking-[0.2em] text-foreground font-display">
                {current.code}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="p-2 rounded-xl text-zinc-400 hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors active:scale-90"
                aria-label={t('pages', 'buyList.copyPasscode')}
              >
                {copied ? (
                  <Check className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Countdown */}
          <div className="flex items-center justify-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-amber-500" />
            {expiresInMs > 0 ? (
              <>
                <span className="text-zinc-500 dark:text-zinc-400">
                  {t('pages', 'buyList.expiresIn')}:
                </span>
                <span className="font-black text-foreground tabular-nums">
                  {formatTimeRemaining(expiresInMs)}
                </span>
              </>
            ) : (
              <span className="font-black text-red-500">
                {t('pages', 'buyList.expired')}
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <button
              type="button"
              onClick={handleCopy}
              disabled={copied}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black bg-foreground text-background dark:bg-card dark:text-card-foreground hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all shadow-sm tracking-wide disabled:opacity-50"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? t('pages', 'buyList.copied') : t('pages', 'buyList.copyPasscode')}
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black bg-amber-500 text-amber-950 hover:bg-amber-400 dark:bg-amber-600 dark:text-amber-50 dark:hover:bg-amber-500 transition-all shadow-sm tracking-wide"
            >
              <Share2 className="w-3.5 h-3.5" />
              {t('pages', 'buyList.share')}
            </button>
            <button
              type="button"
              onClick={handleRegenerate}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black border border-border hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors tracking-wide"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              {t('pages', 'buyList.regenerate')}
            </button>
          </div>
        </motion.div>

        {/* Instruction */}
        <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 p-4 text-center">
          <p className="text-sm font-bold text-amber-900 dark:text-amber-200">
            {t('pages', 'buyList.instructions')}
          </p>
        </div>

        {/* Product list */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-3xl bg-card border border-border p-5 sm:p-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-foreground uppercase tracking-wider">
              {session.lines.length} {t('pages', 'buyList.products')}
            </h3>
            <span className="text-xs font-bold text-zinc-500">
              {session.totalCount} {t('pages', 'buyList.itemCount', session.totalCount)}
            </span>
          </div>

          <div className="space-y-2.5">
            {session.lines.map((line) => (
              <div
                key={line.id}
                className="flex items-center justify-between gap-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-border/60 px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">
                    {line.product.name}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[11px] font-bold text-zinc-500">×{line.qty}</span>
                    {(line.size || line.color) && (
                      <>
                        <span className="w-0.5 h-0.5 rounded-full bg-zinc-300" />
                        {line.size && (
                          <span className="text-[11px] text-zinc-500">
                            {t('pages', 'buyList.size')}: {line.size}
                          </span>
                        )}
                        {line.color && (
                          <span className="text-[11px] text-zinc-500">
                            {t('pages', 'buyList.color')}: {line.color}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                  {line.notes && (
                    <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5 line-clamp-1">
                      📝 {line.notes}
                    </p>
                  )}
                </div>
                <span className="text-sm font-black text-foreground shrink-0">
                  {formatPrice(line.lineTotal)}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-border">
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              {t('pages', 'buyList.subtotal')}
            </span>
            <span className="text-xl font-black text-foreground">
              {formatPrice(totalSum)}
            </span>
          </div>
        </motion.div>

        {/* Store info */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-3xl bg-card border border-border p-5 sm:p-6 space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-foreground text-background flex items-center justify-center font-black text-base shrink-0">
              {(storeInfo.businessName || 'D').charAt(0)}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-black text-foreground truncate">
                {storeInfo.businessName || 'Do\'kon'}
              </h3>
              <p className="text-[11px] text-zinc-500 truncate">
                {[storeInfo.address, storeInfo.city].filter(Boolean).join(', ')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {storeInfo.phone && (
              <a
                href={`tel:${storeInfo.phone}`}
                className="inline-flex items-center gap-2 px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-border/60 text-xs font-bold text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-amber-500" />
                {storeInfo.phone}
              </a>
            )}
            {storeInfo.telegram && (
              <a
                href={storeInfo.telegram.startsWith('http') ? storeInfo.telegram : `https://t.me/${storeInfo.telegram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-border/60 text-xs font-bold text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <Send className="w-3.5 h-3.5 text-sky-500" />
                {storeInfo.telegram}
              </a>
            )}
          </div>

          {storeInfo.address && (
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(`${storeInfo.address}, ${storeInfo.city}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-foreground transition-colors"
            >
              <MapPin className="w-3.5 h-3.5" />
              {storeInfo.address}
            </a>
          )}
        </motion.div>

        {/* Back to list */}
        <div className="text-center">
          <Link
            to="/buy-list"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black border border-border hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors tracking-wide"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {t('pages', 'buyList.continueShoppingBtn')}
          </Link>
        </div>
      </motion.div>
    </div>
  );
};