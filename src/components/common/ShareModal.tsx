import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  Link2,
  Send,
  MessageCircle,
  Facebook,
  Mail,
  AtSign,
  Instagram,
  QrCode,
  Share2,
  X,
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { useToast } from './ToastProvider';

export interface ShareModalProps {
  open: boolean;
  url: string;
  title?: string;
  text?: string;
  onClose: () => void;
  onShare?: (method: string, url: string) => void;
}

interface ShareTarget {
  key: string;
  label: string;
  icon: React.ReactNode;
  className: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({ open, url, title, text, onClose, onShare }) => {
  const { showToast } = useToast();
  const [showQr, setShowQr] = useState(false);
  const [copiedQr, setCopiedQr] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  const shareText = text || title || '';
  const webShareSupported = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      closeBtnRef.current?.focus();
      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', onKey);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', onKey);
      };
    }
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setShowQr(false);
      setCopiedQr(false);
    }
  }, [open]);

  const copyLink = async (openQrMessage: string) => {
    try {
      await navigator.clipboard.writeText(url);
      showToast(openQrMessage);
      onShare?.('copy', url);
      onClose();
    } catch {
      showToast('Nusxalash uchun havolani belgilang', 'error');
    }
  };

  const popup = (kind: string, href: string) => {
    onShare?.(kind, url);
    const w = window.open(href, '_blank', 'noopener,noreferrer');
    if (w) w.opener = null;
    onClose();
  };

  const targets: ShareTarget[] = [
    {
      key: 'copy',
      label: 'Havola',
      icon: <Link2 className="w-5 h-5" />,
      className: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200',
    },
    {
      key: 'telegram',
      label: 'Telegram',
      icon: <Send className="w-5 h-5" />,
      className: 'bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-300',
    },
    {
      key: 'whatsapp',
      label: 'WhatsApp',
      icon: <MessageCircle className="w-5 h-5" />,
      className: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-300',
    },
    {
      key: 'facebook',
      label: 'Facebook',
      icon: <Facebook className="w-5 h-5" />,
      className: 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300',
    },
    {
      key: 'instagram',
      label: 'Instagram',
      icon: <Instagram className="w-5 h-5" />,
      className: 'bg-pink-100 dark:bg-pink-900/50 text-pink-600 dark:text-pink-300',
    },
    {
      key: 'email',
      label: 'Email',
      icon: <Mail className="w-5 h-5" />,
      className: 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-300',
    },
    {
      key: 'x',
      label: 'X',
      icon: <AtSign className="w-5 h-5" />,
      className: 'bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-100',
    },
    {
      key: 'qr',
      label: 'QR Kod',
      icon: <QrCode className="w-5 h-5" />,
      className: 'bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-300',
    },
  ];

  const actions: Record<string, () => void> = {
    copy: () => copyLink('Havola nusxalandi'),
    telegram: () => popup('telegram', `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareText)}`),
    whatsapp: () => popup('whatsapp', `https://wa.me/?text=${encodeURIComponent(shareText ? `${shareText} ` : '')}${encodeURIComponent(url)}`),
    facebook: () => popup('facebook', `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`),
    email: () => popup('email', `mailto:?subject=${encodeURIComponent(title || 'Ulashish')}&body=${encodeURIComponent(shareText ? `${shareText}\n` : '')}${encodeURIComponent(url)}`),
    x: () => popup('x', `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`),
    instagram: () => copyLink('Havola nusxalandi — Instagramda (Story/Post) joylang'),
    qr: () => setShowQr((v) => !v),
  };

  const handleWebShare = async () => {
    try {
      await navigator.share({ title, text: shareText, url });
      onShare?.('web-share', url);
      onClose();
    } catch {
      // user cancelled — keep sheet open
    }
  };

  const modal = (
    <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Ulashish"
        initial={{ y: '100%', opacity: 1 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 340 }}
        className="relative w-full sm:w-[420px] bg-white dark:bg-zinc-900 sm:rounded-3xl rounded-t-[28px] shadow-[0_-12px_40px_rgba(0,0,0,0.35)] border-t sm:border border-neutral-200 dark:border-neutral-700 p-5 sm:p-6 max-w-md mx-auto"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="min-w-0">
            <h3 className="text-base font-black text-neutral-900 dark:text-white">Ulashish</h3>
            <p className="text-[11px] text-neutral-400 font-medium mt-0.5 line-clamp-1">
              {title || url}
            </p>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors active:scale-90"
            aria-label="Yopish"
          >
            <X className="w-4 h-4 text-neutral-500" />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {targets.map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => actions[opt.key]()}
              className="flex flex-col items-center gap-2 transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none rounded-xl p-1"
              aria-label={opt.label}
            >
              <span
                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-sm transition-transform ${opt.className}`}
              >
                {opt.icon}
              </span>
              <span className="text-[10px] font-bold text-neutral-600 dark:text-neutral-300 text-center leading-tight">
                {opt.label}
              </span>
            </button>
          ))}
        </div>

        {webShareSupported && (
          <div className="mt-4">
            <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 my-3">
              <span className="flex-1 h-px bg-neutral-200 dark:bg-neutral-700" />
              yoki
              <span className="flex-1 h-px bg-neutral-200 dark:bg-neutral-700" />
            </div>
            <button
              type="button"
              onClick={handleWebShare}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60 text-neutral-600 dark:text-neutral-300 text-xs font-bold hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors active:scale-95"
            >
              <Share2 className="w-4 h-4" />
              Boshqa qurilma bilan ulashish
            </button>
          </div>
        )}

        <AnimatePresence>
          {showQr && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 flex flex-col items-center gap-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-neutral-200 dark:border-neutral-700 p-5">
                <div className="bg-white p-3 rounded-xl shadow-sm">
                  <QRCodeCanvas value={url} size={160} marginSize={0} level="M" />
                </div>
                <p className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400">
                  Kamerada skan qilib oching
                </p>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(url);
                      setCopiedQr(true);
                      onShare?.('copy', url);
                      setTimeout(() => setCopiedQr(false), 2000);
                    } catch {
                      showToast('Nusxalashda xatolik', 'error');
                    }
                  }}
                  className={`px-4 py-2 rounded-xl text-[11px] font-extrabold transition-all active:scale-95 ${
                    copiedQr
                      ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-300'
                      : 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
                  }`}
                >
                  {copiedQr ? 'Nusxalandi' : 'Havolani nusxalash'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );

  return createPortal(<AnimatePresence>{open && modal}</AnimatePresence>, document.body);
};