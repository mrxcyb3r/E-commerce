import React from 'react';
import { X, Search, Filter, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit?: (value: string) => void;
  filters?: Array<{
    key: string;
    label: string;
    options: FilterOption[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
  }>;
  activeFiltersCount?: number;
  onClearFilters?: () => void;
  className?: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  filters = [],
  activeFiltersCount = 0,
  onClearFilters,
  className = '',
}) => {
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`card p-4 space-y-4 ${className}`}
    >
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && onSearchSubmit?.(e.currentTarget.value)}
            placeholder="Search..."
            className="input pl-10 pr-4"
            aria-label="Search"
          />
        </div>

        {filters.length > 0 && (
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all bg-muted hover:bg-muted/80 border border-border"
          >
            <Filter className="w-4 h-4" />
            Filters
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
            {activeFiltersCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-accent text-accent-foreground text-[10px] font-black flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
        )}

        {activeFiltersCount > 0 && onClearFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
            Clear
          </button>
        )}
      </div>

      <AnimatePresence>
        {showAdvanced && filters.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="pt-2 border-t border-border"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {filters.map((filter) => (
                <div key={filter.key} className="relative">
                  <label htmlFor={`filter-${filter.key}`} className="sr-only">
                    {filter.label}
                  </label>
                  <select
                    id={`filter-${filter.key}`}
                    value={filter.value}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => filter.onChange(e.target.value)}
                    className="input appearance-none pr-10 bg-background"
                  >
                    <option value="">{filter.placeholder || `All ${filter.label}`}</option>
                    {filter.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default FilterBar;