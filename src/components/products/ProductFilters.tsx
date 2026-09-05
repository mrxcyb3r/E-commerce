import React from 'react';
import { CATEGORIES } from '../../data/categories';
import { ProductFiltersState, SortOption } from '../../types/product';
import { RotateCcw, X, SlidersHorizontal, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useI18n } from '../../i18n/I18nContext';

interface ProductFiltersProps {
  filters: ProductFiltersState;
  onChange: (newFilters: ProductFiltersState) => void;
  onReset: () => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
  totalResults: number;
}

const AVAILABLE_SIZES = ['S', 'M', 'L', 'XL', '2XL', '39', '40', '41', '42', '43', '44', '30', '32', '34'];
const AVAILABLE_COLORS = [
  { name: 'Qora', hex: '#18181b' },
  { name: 'Oq', hex: '#ffffff' },
  { name: 'Kulrang', hex: '#71717a' },
  { name: 'Ko\'k', hex: '#2563eb' },
  { name: 'Yashil', hex: '#16a34a' },
  { name: 'Qizil', hex: '#dc2626' },
  { name: 'Jigarrang', hex: '#78350f' },
];

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  filters,
  onChange,
  onReset,
  isMobileOpen,
  onMobileClose,
  totalResults,
}) => {
  const { t } = useI18n();

  const handleCategoryChange = (slug: string) => {
    onChange({
      ...filters,
      category: filters.category === slug ? '' : slug,
    });
  };

  const handleSizeChange = (size: string) => {
    onChange({
      ...filters,
      size: filters.size === size ? '' : size,
    });
  };

  const handleColorChange = (colorName: string) => {
    onChange({
      ...filters,
      color: filters.color === colorName ? '' : colorName,
    });
  };

  const handleSortChange = (sortBy: SortOption) => {
    onChange({
      ...filters,
      sortBy,
    });
  };

  const hasActiveFilters =
    filters.category !== '' ||
    filters.size !== '' ||
    filters.color !== '' ||
    filters.minPrice !== null ||
    filters.maxPrice !== null ||
    filters.onlyInStock;

  const FilterContent = (
    <div className="space-y-6">
      {/* Header / Reset */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-zinc-900 dark:text-white" />
          <span className="font-black text-sm text-zinc-900 dark:text-white font-['Outfit',sans-serif]">{t('pages', 'catalog.filters')}</span>
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1 font-bold transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            {t('pages', 'catalog.filtersReset')}
          </button>
        )}
      </div>

      {/* Categories */}
      <div className="space-y-2.5">
        <label className="text-xs font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          {t('pages', 'catalog.categoryLabel')}
        </label>
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => onChange({ ...filters, category: '' })}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors flex items-center justify-between ${
              filters.category === ''
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 font-black'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-medium'
            }`}
          >
            <span>{t('pages', 'catalog.allCategories')}</span>
          </button>

          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleCategoryChange(cat.slug)}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors flex items-center justify-between ${
                filters.category === cat.slug
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 font-black'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-medium'
              }`}
            >
              <span>{cat.name}</span>
              <span className="text-[11px] opacity-70">({cat.productCount})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Sizes */}
      <div className="space-y-2.5">
        <label className="text-xs font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          {t('pages', 'catalog.sizeLabel')}
        </label>
        <div className="flex flex-wrap gap-1.5">
          {AVAILABLE_SIZES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => handleSizeChange(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-black border transition-all ${
                filters.size === s
                  ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-950 dark:border-white shadow-xs'
                  : 'bg-white dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div className="space-y-2.5">
        <label className="text-xs font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          {t('pages', 'catalog.colorLabel')}
        </label>
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_COLORS.map((c) => {
            const isSelected = filters.color === c.name;
            return (
              <button
                key={c.name}
                type="button"
                onClick={() => handleColorChange(c.name)}
                title={c.name}
                className={`relative w-7 h-7 rounded-full border-2 transition-transform ${
                  isSelected ? 'scale-110 ring-2 ring-zinc-900 dark:ring-white' : 'hover:scale-105'
                }`}
                style={{
                  backgroundColor: c.hex,
                  borderColor: c.hex === '#ffffff' ? '#d4d4d8' : c.hex,
                }}
              >
                {isSelected && (
                  <Check
                    className={`w-3.5 h-3.5 absolute inset-0 m-auto ${
                      c.hex === '#ffffff' ? 'text-black' : 'text-white'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range Filter */}
      <div className="space-y-2.5">
        <label className="text-xs font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          {t('pages', 'catalog.maxPriceLabel')}
        </label>
        <div className="space-y-2">
          <input
            type="range"
            min="100000"
            max="600000"
            step="20000"
            value={filters.maxPrice || 600000}
            onChange={(e) =>
              onChange({
                ...filters,
                maxPrice: Number(e.target.value) === 600000 ? null : Number(e.target.value),
              })
            }
            className="w-full accent-zinc-900 dark:accent-white cursor-pointer"
          />
          <div className="flex justify-between text-xs text-zinc-500 dark:text-zinc-400 font-mono font-bold">
            <span>100 000 so'm</span>
            <span>{filters.maxPrice ? `${new Intl.NumberFormat('uz-UZ').format(filters.maxPrice)} so'm` : t('pages', 'catalog.priceAll')}</span>
          </div>
        </div>
      </div>

      {/* In Stock toggle */}
      <div className="pt-2">
        <label className="flex items-center gap-2.5 text-xs sm:text-sm font-bold text-zinc-800 dark:text-zinc-200 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.onlyInStock}
            onChange={(e) => onChange({ ...filters, onlyInStock: e.target.checked })}
            className="w-4 h-4 rounded text-zinc-900 dark:text-white accent-zinc-900 dark:accent-white"
          />
          <span>{t('pages', 'catalog.onlyInStock')}</span>
        </label>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar Filters */}
      <aside className="hidden lg:block w-64 shrink-0">
        <div className="sticky top-24 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
          {FilterContent}
        </div>
      </aside>

      {/* Mobile Drawer Filter Modal */}
      <AnimatePresence>
        {isMobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onMobileClose}
              className="fixed inset-0 bg-zinc-950/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-x-0 bottom-0 max-h-[85vh] bg-white dark:bg-zinc-900 rounded-t-3xl p-6 shadow-2xl flex flex-col justify-between overflow-hidden"
            >
              <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
                <h3 className="font-black text-lg text-zinc-900 dark:text-white font-['Outfit',sans-serif] tracking-tight">
                  {t('pages', 'catalog.filters')}
                </h3>
                <button
                  type="button"
                  onClick={onMobileClose}
                  className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-4">
                {FilterContent}
              </div>

              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={onMobileClose}
                  className="w-full py-4 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 font-black text-sm shadow-sm tracking-wide"
                >
                  {t('pages', 'catalog.showResults', totalResults)}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
