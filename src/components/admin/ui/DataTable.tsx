import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ChevronUp, ChevronDown, Minus, Check, CheckSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T, index: number) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  selectedIds?: Set<string>;
  onSelectionChange?: (ids: Set<string>) => void;
  onRowClick?: (row: T) => void;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (key: string) => void;
  loading?: boolean;
  emptyState?: {
    title: string;
    description?: string;
    action?: React.ReactNode;
  };
  rowClassName?: (row: T, index: number) => string;
  striped?: boolean;
  hoverable?: boolean;
  compact?: boolean;
}

function SortIcon({ order }: { order: 'asc' | 'desc' | 'none' }) {
  if (order === 'asc') return <ChevronUp className="w-4 h-4 text-foreground" />;
  if (order === 'desc') return <ChevronDown className="w-4 h-4 text-foreground" />;
  return <Minus className="w-4 h-4 text-muted-foreground/40" />;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  selectedIds = new Set(),
  onSelectionChange,
  onRowClick,
  sortBy,
  sortOrder = 'asc',
  onSort,
  loading = false,
  emptyState,
  rowClassName,
  striped = true,
  hoverable = true,
  compact = false,
}: DataTableProps<T>) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const rowRefs = useRef<Array<HTMLTableRowElement | null>>([]);

  const allSelected = data.length > 0 && data.every((row) => selectedIds.has(keyExtractor(row)));
  const someSelected = data.length > 0 && data.some((row) => selectedIds.has(keyExtractor(row)));

  const handleSelectAll = () => {
    if (!onSelectionChange) return;
    if (allSelected) {
      onSelectionChange(new Set());
    } else {
      onSelectionChange(new Set(data.map(keyExtractor)));
    }
  };

  const handleSelectOne = (id: string) => {
    if (!onSelectionChange) return;
    const newSelection = new Set(selectedIds);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    onSelectionChange(newSelection);
  };

  const hasSelection = selectedIds.size > 0;

  // Keep row refs in sync with data length
  useEffect(() => {
    rowRefs.current = rowRefs.current.slice(0, data.length);
    setFocusedIndex((i) => (i >= data.length ? -1 : i));
  }, [data.length]);

  const focusRow = (index: number) => {
    const clamped = Math.max(0, Math.min(index, data.length - 1));
    setFocusedIndex(clamped);
    rowRefs.current[clamped]?.focus();
  };

  const handleTableKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      focusRow(focusedIndex + 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      focusRow(focusedIndex < 0 ? data.length - 1 : focusedIndex - 1);
    } else if (e.key === 'Enter' && onRowClick && focusedIndex >= 0 && data[focusedIndex]) {
      e.preventDefault();
      onRowClick(data[focusedIndex]);
    } else if (e.key === ' ' && onSelectionChange && focusedIndex >= 0 && data[focusedIndex]) {
      const target = e.target as HTMLElement;
      if (target.tagName !== 'INPUT' && target.tagName !== 'BUTTON') {
        e.preventDefault();
        handleSelectOne(keyExtractor(data[focusedIndex]));
      }
    }
  };

  if (loading) {
    return (
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full" role="grid">
            <thead>
              <tr className="border-b border-border">
                {columns.map((col) => (
                  <th key={col.key} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <div className="shimmer h-4 w-full" style={{ width: col.width || 'auto' }} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-border/50">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3">
                      <div className="shimmer h-4 w-full" style={{ width: col.width || 'auto' }} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="card p-12 text-center">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <Minus className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="font-display font-bold text-foreground mb-1">
          {emptyState?.title || 'No data'}
        </h3>
        {emptyState?.description && (
          <p className="text-muted-foreground text-sm mb-4">{emptyState.description}</p>
        )}
        {emptyState?.action && (
          <div className="flex justify-center">{emptyState.action}</div>
        )}
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      {hasSelection && onSelectionChange && (
        <motion.div
          initial={{ opacity: 0, y: -10, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -10, height: 0 }}
          className="sticky top-0 z-10 bg-accent/5 border-b border-accent/20 px-4 py-2.5 flex items-center justify-between"
        >
          <span className="text-sm font-medium text-accent tabular-nums" role="status" aria-live="polite">
            {selectedIds.size} selected
          </span>
          <button
            type="button"
            onClick={() => onSelectionChange(new Set())}
            className="text-sm font-medium text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          >
            Clear
          </button>
        </motion.div>
      )}

      <div className="overflow-x-auto" onKeyDown={handleTableKeyDown}>
        <table className="w-full" role="grid" aria-label="Ma'lumotlar jadvali">
          <thead className="sticky top-0 z-[5]">
            <tr className="border-b border-border bg-muted/80 backdrop-blur supports-[backdrop-filter]:bg-muted/70">
              {onSelectionChange && (
                <th className="px-4 py-3 w-12">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={handleSelectAll}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected && !allSelected;
                    }}
                    className="w-4 h-4 rounded border-border text-accent focus:ring-accent cursor-pointer"
                    aria-label="Select all"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : ''} ${col.sortable ? 'cursor-pointer select-none hover:text-foreground' : ''} ${col.className || ''}`}
                  style={{ width: col.width }}
                  onClick={col.sortable && onSort ? () => onSort(col.key) : undefined}
                >
                  <div className="flex items-center gap-2">
                    <span>{col.header}</span>
                    {col.sortable && (
                      <SortIcon
                        order={sortBy === col.key ? sortOrder : 'none'}
                      />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {data.map((row, index) => {
                const id = keyExtractor(row);
                const isSelected = selectedIds.has(id);
                const isHovered = hoveredId === id;
                void isHovered;

                return (
                  <motion.tr
                    key={id}
                    ref={(el) => {
                      rowRefs.current[index] = el;
                    }}
                    tabIndex={onRowClick || onSelectionChange ? 0 : undefined}
                    aria-selected={onSelectionChange ? isSelected : undefined}
                    aria-rowindex={index + 1}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: Math.min(index * 0.02, 0.2), duration: 0.2 }}
                    className={`${striped && index % 2 === 0 ? 'bg-muted/30' : ''} ${hoverable ? 'hover:bg-muted/60' : ''} ${isSelected ? 'bg-accent/10 shadow-[inset_2px_0_0_0_var(--color-accent)]' : ''} ${focusedIndex === index ? 'outline-none ring-2 ring-inset ring-ring/60' : ''} ${rowClassName?.(row, index) || ''} ${compact ? '' : ''} border-b border-border/50 last:border-0 transition-colors focus-visible:outline-none`}
                    onMouseEnter={() => setHoveredId(id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onFocus={() => setFocusedIndex(index)}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    style={{ cursor: onRowClick ? 'pointer' : 'default' }}
                  >
                    {onSelectionChange && (
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectOne(id)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-4 h-4 rounded border-border text-accent focus:ring-accent cursor-pointer"
                          aria-label="Select row"
                        />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`px-4 py-3 ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : ''} ${col.className || ''}`}
                      >
                        {col.render(row, index)}
                      </td>
                    ))}
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {data.length === 0 && !loading && emptyState && (
        <div className="p-12 text-center">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Minus className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-display font-bold text-foreground mb-1">
            {emptyState.title}
          </h3>
          {emptyState.description && (
            <p className="text-muted-foreground text-sm mb-4">{emptyState.description}</p>
          )}
          {emptyState.action && (
            <div className="flex justify-center">{emptyState.action}</div>
          )}
        </div>
      )}
    </div>
  );
}

export default DataTable;