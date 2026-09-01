import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ArrowRight, Tag } from 'lucide-react';
import { PRODUCTS } from '../../data/products';
import { formatPrice } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setQuery('');
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // parent will toggle
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const filteredProducts = query.trim() === ''
    ? PRODUCTS.slice(0, 4)
    : PRODUCTS.filter((product) => {
        const q = query.toLowerCase();
        return (
          product.name.toLowerCase().includes(q) ||
          product.categoryName.toLowerCase().includes(q) ||
          product.description.toLowerCase().includes(q) ||
          (product.brand && product.brand.toLowerCase().includes(q)) ||
          product.tags.some((t) => t.toLowerCase().includes(q))
        );
      });

  const handleSelectProduct = (productId: string) => {
    onClose();
    navigate(`/products/${productId}`);
  };

  const handleViewAllResults = () => {
    onClose();
    navigate(`/products?q=${encodeURIComponent(query)}`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm transition-opacity"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden z-10"
          >
            {/* Input Header */}
            <div className="flex items-center px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 gap-3">
              <Search className="w-5 h-5 text-zinc-400 dark:text-zinc-500 shrink-0" />
              <input
                id="global-search-input"
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Mahsulot nomi, toifa yoki brend bo'yicha qidiring..."
                className="w-full bg-transparent text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 text-base font-medium focus:outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="text-xs font-black px-2 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              >
                ESC
              </button>
            </div>

            {/* Results / Suggestions */}
            <div className="max-h-[60vh] overflow-y-auto p-4 divide-y divide-zinc-100 dark:divide-zinc-800/60">
              <div className="text-xs font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500 pb-2">
                {query.trim() === '' ? 'Ommabop mahsulotlar' : `Natijalar (${filteredProducts.length})`}
              </div>

              {filteredProducts.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="inline-flex p-3 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400 mb-3">
                    <Search className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-black text-zinc-900 dark:text-zinc-100 mb-1">
                    Hech qanday mahsulot topilmadi.
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Qidiruv so'zini o'zgartirib ko'ring yoki boshqa toifani tanlang.
                  </p>
                </div>
              ) : (
                <div className="space-y-1 pt-2">
                  {filteredProducts.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => handleSelectProduct(product.id)}
                      className="w-full flex items-center gap-3.5 p-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors text-left group"
                    >
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-12 h-12 rounded-xl object-cover bg-zinc-100 dark:bg-zinc-800 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-black text-zinc-900 dark:text-zinc-100 truncate group-hover:text-zinc-700 dark:group-hover:text-zinc-300">
                          {product.name}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1 font-medium">
                            <Tag className="w-3 h-3" />
                            {product.categoryName}
                          </span>
                          {product.brand && (
                            <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">• {product.brand}</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sm font-black text-zinc-900 dark:text-zinc-100">
                          {formatPrice(product.price)}
                        </div>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black">
                          Mavjud
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            {query.trim() !== '' && filteredProducts.length > 0 && (
              <div className="p-3 bg-zinc-50 dark:bg-zinc-900/90 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                  Katalogda barcha mos natijalarni ko'rish
                </span>
                <button
                  type="button"
                  onClick={handleViewAllResults}
                  className="inline-flex items-center gap-1.5 text-xs font-black text-zinc-900 dark:text-zinc-100 hover:underline"
                >
                  Barcha natijalar <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
