import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ArrowRight, Tag, Clock, TrendingUp, XCircle } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useI18n } from '../../i18n/I18nContext';
import { formatPrice } from '../../lib/utils';
import { track } from '../../lib/analytics/client';
import { motion, AnimatePresence } from 'motion/react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const { t } = useI18n();
  const { publishedProducts: PRODUCTS } = useStore();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [trendingSearches, setTrendingSearches] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredProducts = useMemo(() => {
    if (query.trim() === '') return [];
    const q = query.toLowerCase();
    return PRODUCTS.filter((product) => {
      return (
        product.name.toLowerCase().includes(q) ||
        product.categoryName.toLowerCase().includes(q) ||
        product.description.toLowerCase().includes(q) ||
        (product.brand && product.brand.toLowerCase().includes(q)) ||
        product.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [query, PRODUCTS]);

  const allCategories = useMemo(() => {
    return [...new Set(PRODUCTS.map((p) => p.categoryName))];
  }, [PRODUCTS]);

  useEffect(() => {
    const stored = localStorage.getItem('recent_searches');
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch {
        setRecentSearches([]);
      }
    }
  }, []);

  useEffect(() => {
    const popular = ['oversized hoodie', 'minimal tee', 'cargo pants', 'premium denim', 'leather jacket', 'running shoes'];
    setTrendingSearches(popular);
  }, []);

  const saveRecentSearch = useCallback((search: string) => {
    if (!search.trim()) return;
    const newSearches = [search, ...recentSearches.filter((s) => s !== search)].slice(0, 8);
    setRecentSearches(newSearches);
    localStorage.setItem('recent_searches', JSON.stringify(newSearches));
  }, [recentSearches]);

  const recordSearch = useCallback((q: string) => {
    if (q.trim()) {
      track('search', {
        searchQuery: q.trim(),
        metadata: { noResults: filteredProducts.length === 0 },
      });
      saveRecentSearch(q.trim());
    }
  }, [filteredProducts.length, saveRecentSearch]);

  const handleSelectProduct = useCallback((productId: string) => {
    recordSearch(query);
    onClose();
    navigate(`/products/${productId}`);
  }, [query, recordSearch, navigate, onClose]);

  const handleViewAllResults = useCallback(() => {
    recordSearch(query);
    onClose();
    navigate(`/products?q=${encodeURIComponent(query)}`);
  }, [query, recordSearch, navigate, onClose]);

  const handleSuggestionClick = useCallback((suggestion: string) => {
    setQuery(suggestion);
    inputRef.current?.focus();
  }, []);

  const handleClearRecent = useCallback(() => {
    setRecentSearches([]);
    localStorage.removeItem('recent_searches');
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
      setShowSuggestions(true);
    } else {
      document.body.style.overflow = 'unset';
      setQuery('');
      setShowSuggestions(false);
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      } else if (e.key === 'Enter' && query.trim()) {
        recordSearch(query);
        onClose();
        navigate(`/products?q=${encodeURIComponent(query)}`);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, query, recordSearch, navigate]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-background/70 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -20 }}
          transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative w-full max-w-3xl bg-white dark:bg-background rounded-3xl shadow-2xl border border-border/60 overflow-hidden z-10"
        >
          <div className="flex items-center px-6 py-5 border-b border-zinc-100 dark:border-border/60 gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 dark:text-zinc-500" />
              <input
                id="global-search-input"
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder={t('common', 'searchPlaceholder')}
                className="w-full pl-12 pr-4 py-3.5 bg-card text-foreground placeholder-zinc-400 dark:placeholder-zinc-500 text-base font-medium rounded-2xl border border-border/60 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="text-xs font-black px-3 py-2 bg-card text-zinc-500 dark:text-zinc-400 rounded-xl border border-border/60 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all"
            >
              ESC
            </button>
          </div>

          <AnimatePresence mode="wait">
            {showSuggestions && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="max-h-[65vh] overflow-y-auto p-4 divide-y divide-zinc-100/60 dark:divide-zinc-800/60"
              >
                {query.trim() === '' ? (
                  <>
                    {recentSearches.length > 0 && (
                      <>
                        <div className="flex items-center justify-between px-2 py-3">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
                            <span className="text-xs font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500">{t('common', 'search')}</span>
                          </div>
                          <button
                            type="button"
                            onClick={handleClearRecent}
                            className="text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 font-medium flex items-center gap-1"
                          >
                            Clear
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2 px-2 pb-4">
                          {recentSearches.map((search) => (
                            <button
                              key={search}
                              type="button"
                              onClick={() => handleSuggestionClick(search)}
                              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-card text-zinc-700 dark:text-zinc-300 text-sm font-medium hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-border/60 transition-all"
                            >
                              <Clock className="w-3.5 h-3.5 text-zinc-400" />
                              {search}
                            </button>
                          ))}
                        </div>
                      </>
                    )}

                    {trendingSearches.length > 0 && (
                      <>
                        <div className="flex items-center gap-2 px-2 py-3">
                          <TrendingUp className="w-4 h-4 text-amber-500" />
                          <span className="text-xs font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500">{t('pages', 'home.searchTrending')}</span>
                        </div>
                        <div className="flex flex-wrap gap-2 px-2 pb-4">
                          {trendingSearches.map((search) => (
                            <button
                              key={search}
                              type="button"
                              onClick={() => handleSuggestionClick(search)}
                              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50/80 dark:bg-amber-900/30 text-zinc-800 dark:text-amber-100 text-sm font-medium hover:bg-amber-100/80 dark:hover:bg-amber-900/50 border border-amber-200/50 dark:border-amber-800/50 transition-all"
                            >
                              <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
                              {search}
                            </button>
                          ))}
                        </div>
                      </>
                    )}

                    <div className="px-2 py-3">
                      <div className="flex items-center gap-2 px-2 mb-2">
                        <Tag className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
                        <span className="text-xs font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500">{t('common', 'category')}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 px-2">
                        {allCategories.slice(0, 8).map((category) => (
                          <button
                            key={category}
                            type="button"
                            onClick={() => handleSuggestionClick(category)}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-card text-zinc-700 dark:text-zinc-300 text-sm font-medium hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-border/60 transition-all"
                          >
                            <Tag className="w-3.5 h-3.5 text-zinc-400" />
                            {category}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between px-2 py-3">
                      <span className="text-xs font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                        Products ({filteredProducts.length})
                      </span>
                      {filteredProducts.length > 5 && (
                        <button
                          type="button"
                          onClick={handleViewAllResults}
                          className="text-xs font-medium text-amber-500 hover:underline"
                        >
                          {t('common', 'viewAll')}
                        </button>
                      )}
                    </div>

                    <div className="space-y-1 pt-2">
                      {filteredProducts.slice(0, 8).map((product) => (
                        <button
                          key={product.id}
                          onClick={() => handleSelectProduct(product.id)}
                          className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-zinc-100/80 dark:hover:bg-zinc-800/80 transition-all text-left group"
                        >
                          <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-card shrink-0">
                            <img
                              src={product.images?.[0]}
                              alt={product.name}
                              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-display font-black text-foreground text-sm truncate group-hover:text-amber-500 transition-colors">
                              {product.name}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
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
                            <div className="font-display font-black text-foreground text-base">
                              {formatPrice(product.price)}
                            </div>
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-wide">
                              In Stock
                            </span>
                          </div>
                        </button>
                      ))}

                      {filteredProducts.length === 0 && (
                        <div className="py-12 text-center">
                          <div className="inline-flex p-3 rounded-full bg-card text-zinc-400 mb-4">
                            <Search className="w-6 h-6" />
                          </div>
                          <h4 className="font-display font-black text-foreground mb-1">{t('common', 'notFound')}</h4>
                          <p className="text-sm text-zinc-500 dark:text-zinc-400">Try a different search term or browse categories.</p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {query.trim() !== '' && filteredProducts.length > 0 && (
            <div className="p-4 bg-card border-t border-zinc-100/60 dark:border-border/60">
              <button
                type="button"
                onClick={handleViewAllResults}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-black text-foreground hover:underline transition-colors"
              >
                {t('pages', 'home.viewAllResults')}
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SearchModal;