import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { ProductFiltersState, SortOption } from '../types/product';
import { ProductCard } from '../components/products/ProductCard';
import { ProductFilters } from '../components/products/ProductFilters';
import { Search, SlidersHorizontal, ArrowUpDown, X } from 'lucide-react';
import { motion } from 'motion/react';
import { useI18n } from '../i18n/I18nContext';

export const ProductsPage: React.FC = () => {
  const { publishedProducts: products } = useStore();
  const { t } = useI18n();
  const [searchParams, setSearchParams] = useSearchParams();

  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const initialCategory = searchParams.get('category') || '';
  const initialSearch = searchParams.get('q') || '';
  const initialSort = (searchParams.get('sort') as SortOption) || 'featured';

  const [filters, setFilters] = useState<ProductFiltersState>({
    searchQuery: initialSearch,
    category: initialCategory,
    minPrice: null,
    maxPrice: null,
    size: '',
    color: '',
    sortBy: initialSort,
    onlyInStock: false,
  });

  // Sync state if URL searchParams change
  useEffect(() => {
    const urlCategory = searchParams.get('category') || '';
    const urlSearch = searchParams.get('q') || '';
    const urlSort = (searchParams.get('sort') as SortOption) || 'featured';

    setFilters((prev) => ({
      ...prev,
      category: urlCategory,
      searchQuery: urlSearch,
      sortBy: urlSort,
    }));
  }, [searchParams]);

  const handleFilterChange = (newFilters: ProductFiltersState) => {
    setFilters(newFilters);
    // update searchParams
    const params = new URLSearchParams();
    if (newFilters.category) params.set('category', newFilters.category);
    if (newFilters.searchQuery) params.set('q', newFilters.searchQuery);
    if (newFilters.sortBy !== 'featured') params.set('sort', newFilters.sortBy);
    setSearchParams(params, { replace: true });
  };

  const handleResetFilters = () => {
    const resetState: ProductFiltersState = {
      searchQuery: '',
      category: '',
      minPrice: null,
      maxPrice: null,
      size: '',
      color: '',
      sortBy: 'featured',
      onlyInStock: false,
    };
    setFilters(resetState);
    setSearchParams({}, { replace: true });
  };

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Search
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        const matches =
          product.name.toLowerCase().includes(q) ||
          product.categoryName.toLowerCase().includes(q) ||
          product.description.toLowerCase().includes(q) ||
          (product.brand && product.brand.toLowerCase().includes(q)) ||
          product.tags.some((t) => t.toLowerCase().includes(q));
        if (!matches) return false;
      }

      // Category
      if (filters.category && product.category !== filters.category) {
        return false;
      }

      // Max price
      if (filters.maxPrice !== null && product.price > filters.maxPrice) {
        return false;
      }

      // Size
      if (filters.size && !product.sizes.includes(filters.size)) {
        return false;
      }

      // Color
      if (filters.color && !product.colors.some((c) => c.name.toLowerCase() === filters.color.toLowerCase())) {
        return false;
      }

      // Stock
      if (filters.onlyInStock && !product.inStock) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      switch (filters.sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'newest':
          return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
        case 'featured':
        default:
          return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
      }
    });
  }, [products, filters]);

  const activeFilterCount =
    (filters.category ? 1 : 0) +
    (filters.size ? 1 : 0) +
    (filters.color ? 1 : 0) +
    (filters.maxPrice ? 1 : 0) +
    (filters.onlyInStock ? 1 : 0);

  return (
    <div className="pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-8 space-y-4">
        <div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground font-display tracking-tighter">
            {t('pages', 'catalog.title')}
          </h1>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 mt-1">
            {t('pages', 'catalog.subtitle')}
          </p>
        </div>

        {/* Search & Sort Controls Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card p-3 sm:p-4 rounded-3xl border border-border shadow-xs">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              id="catalog-search-input"
              type="text"
              value={filters.searchQuery}
              onChange={(e) => handleFilterChange({ ...filters, searchQuery: e.target.value })}
              placeholder={t('pages', 'catalog.searchPlaceholder')}
              className="w-full pl-11 pr-10 py-2.5 rounded-2xl text-sm bg-zinc-100 dark:bg-zinc-800/80 text-foreground placeholder-zinc-400 font-medium focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-all"
            />
            {filters.searchQuery && (
              <button
                type="button"
                onClick={() => handleFilterChange({ ...filters, searchQuery: '' })}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            {/* Mobile Filter Toggle */}
            <button
              type="button"
              onClick={() => setIsMobileFiltersOpen(true)}
              className="lg:hidden flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{t('pages', 'catalog.filters')}</span>
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-foreground text-background dark:bg-card dark:text-card-foreground text-[10px] flex items-center justify-center font-black">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Sort Select */}
            <div className="relative flex items-center">
              <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400 absolute left-3.5 pointer-events-none" />
              <select
                id="catalog-sort-select"
                value={filters.sortBy}
                onChange={(e) => handleFilterChange({ ...filters, sortBy: e.target.value as SortOption })}
                className="pl-9 pr-9 py-2.5 rounded-2xl text-xs font-black bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border-none appearance-none focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white cursor-pointer"
              >
                <option value="featured">{t('pages', 'catalog.sortFeatured')}</option>
                <option value="price-asc">{t('pages', 'catalog.sortCheap')}</option>
                <option value="price-desc">{t('pages', 'catalog.sortExpensive')}</option>
                <option value="newest">{t('pages', 'catalog.sortNewest')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Active Filter Chips */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs text-zinc-400 font-bold">{t('pages', 'catalog.activeFilters')}</span>
            {filters.category && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs bg-foreground text-background dark:bg-card dark:text-card-foreground font-bold">
                {t('pages', 'catalog.chipCategory', filters.category)}
                <button type="button" onClick={() => handleFilterChange({ ...filters, category: '' })}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.size && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs bg-foreground text-background dark:bg-card dark:text-card-foreground font-bold">
                {t('pages', 'catalog.chipSize', filters.size)}
                <button type="button" onClick={() => handleFilterChange({ ...filters, size: '' })}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.color && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs bg-foreground text-background dark:bg-card dark:text-card-foreground font-bold">
                {t('pages', 'catalog.chipColor', filters.color)}
                <button type="button" onClick={() => handleFilterChange({ ...filters, color: '' })}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.maxPrice && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs bg-foreground text-background dark:bg-card dark:text-card-foreground font-bold">
                {t('pages', 'catalog.chipMax', `${new Intl.NumberFormat('uz-UZ').format(filters.maxPrice)} so'm`)}
                <button type="button" onClick={() => handleFilterChange({ ...filters, maxPrice: null })}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs text-rose-500 hover:underline font-bold ml-2"
            >
              {t('pages', 'catalog.clearAll')}
            </button>
          </div>
        )}
      </div>

      {/* Main Content Layout: Sidebar + Grid */}
      <div className="flex gap-8 items-start">
        {/* Sidebar Filters */}
        <ProductFilters
          filters={filters}
          onChange={handleFilterChange}
          onReset={handleResetFilters}
          isMobileOpen={isMobileFiltersOpen}
          onMobileClose={() => setIsMobileFiltersOpen(false)}
          totalResults={filteredProducts.length}
        />

        {/* Products Grid Area */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
            <span>
              {t('pages', 'catalog.found', filteredProducts.length)}
            </span>
          </div>

          {filteredProducts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-3xl p-12 text-center border border-border space-y-4"
            >
              <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-zinc-400">
                <Search className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-black text-foreground font-display tracking-tight">
                  {t('pages', 'catalog.emptyTitle')}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
                  {t('pages', 'catalog.emptyDesc')}
                </p>
              </div>
              <div>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-6 py-3 rounded-xl text-xs font-black bg-foreground text-background dark:bg-card dark:text-card-foreground hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors shadow-xs uppercase tracking-wider"
                >
                  {t('pages', 'catalog.clearFilters')}
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
