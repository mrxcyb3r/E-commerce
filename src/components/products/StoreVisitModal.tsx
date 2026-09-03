import React from 'react';
import { Product } from '../../types/product';
import { BUSINESS_CONFIG } from '../../config/business';
import { formatPrice, generateTelegramProductLink } from '../../lib/utils';
import { 
  X, 
  Send, 
  Phone, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  ExternalLink 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface StoreVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  selectedSize?: string;
  selectedColor?: string;
}

export const StoreVisitModal: React.FC<StoreVisitModalProps> = ({
  isOpen,
  onClose,
  product,
  selectedSize,
  selectedColor,
}) => {
  if (!isOpen) return null;

  const telegramLink = generateTelegramProductLink(product, selectedSize, selectedColor);
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    BUSINESS_CONFIG.address
  )}`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-zinc-950/60 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 z-10 space-y-6 overflow-hidden"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header */}
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1 text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-md uppercase tracking-wider">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Do'konda mavjud</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white font-['Outfit',sans-serif] tracking-tight">
              Do'konda ko'rish & Band qilish
            </h3>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-normal">
              Mahsulotni do'konimizga tashrif buyurib ko'rishingiz va o'zingizga mos o'lchamni tanlashingiz mumkin.
            </p>
          </div>

          {/* Product Summary Mini Card */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60">
            <img
              src={product.images?.[0]}
              alt={product.name}
              className="w-16 h-16 rounded-xl object-cover bg-zinc-200 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-black text-zinc-900 dark:text-white truncate">
                {product.name}
              </div>
              <div className="text-base font-black text-zinc-900 dark:text-white">
                {formatPrice(product.price)}
              </div>
              <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
                {selectedSize && <span>O'lcham: <strong className="text-zinc-900 dark:text-zinc-200 font-bold">{selectedSize}</strong></span>}
                {selectedColor && <span>Rang: <strong className="text-zinc-900 dark:text-zinc-200 font-bold">{selectedColor}</strong></span>}
              </div>
            </div>
          </div>

          {/* Store info snapshot */}
          <div className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400 font-medium">
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-zinc-900 dark:text-white shrink-0 mt-0.5" />
              <span><strong className="text-zinc-900 dark:text-white font-bold">Manzil:</strong> {BUSINESS_CONFIG.address} ({BUSINESS_CONFIG.landmark})</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-zinc-900 dark:text-white shrink-0" />
              <span><strong className="text-zinc-900 dark:text-white font-bold">Ish vaqti:</strong> {BUSINESS_CONFIG.workingHours}</span>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="space-y-2.5 pt-2">
            <a
              href={telegramLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-4 px-4 rounded-xl text-sm font-black bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors shadow-xs"
            >
              <Send className="w-4 h-4" />
              <span>Telegram orqali sotuvchiga yozish</span>
            </a>

            <div className="grid grid-cols-2 gap-2.5">
              <a
                href={`tel:${BUSINESS_CONFIG.phoneRaw}`}
                className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs font-black bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Qo'ng'iroq qilish</span>
              </a>

              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs font-black bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Xaritada ochish</span>
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
