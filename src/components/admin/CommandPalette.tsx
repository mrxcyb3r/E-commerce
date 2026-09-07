import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  Film,
  Send,
  BarChart3,
  Store,
  Settings,
  Boxes,
  MessageSquare,
  Search,
  Plus,
  CornerDownLeft,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { ADMIN_SHORTCUT_OPEN_SEARCH } from '../../hooks/useAdminShortcuts';

interface PaletteItem {
  id: string;
  group: string;
  label: string;
  hint?: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

const PAGE_ITEMS: PaletteItem[] = [
  { id: 'go-dashboard', group: 'Sahifalar', label: 'Boshqaruv markazi', hint: 'G D', path: '/admin', icon: LayoutDashboard },
  { id: 'go-products', group: 'Sahifalar', label: 'Mahsulotlar', hint: 'G P', path: '/admin/products', icon: Package },
  { id: 'go-categories', group: 'Sahifalar', label: 'Kategoriyalar', hint: 'G C', path: '/admin/categories', icon: FolderTree },
  { id: 'go-orders', group: 'Sahifalar', label: 'Buyurtmalar', hint: 'G O', path: '/admin/orders', icon: ShoppingCart },
  { id: 'go-inventory', group: 'Sahifalar', label: 'Inventar', hint: 'G I', path: '/admin/inventory', icon: Boxes },
  { id: 'go-feed', group: 'Sahifalar', label: 'Video / Feed', hint: 'G F', path: '/admin/feed', icon: Film },
  { id: 'go-homepage', group: 'Sahifalar', label: 'Bosh sahifa CMS', hint: 'G H', path: '/admin/homepage', icon: Send },
  { id: 'go-analytics', group: 'Sahifalar', label: 'Analitika', hint: 'G A', path: '/admin/analytics', icon: BarChart3 },
  { id: 'go-store', group: 'Sahifalar', label: "Do'kon sozlamalari", hint: 'G S', path: '/admin/store', icon: Store },
  { id: 'go-comments', group: 'Sahifalar', label: 'Izohlar', path: '/admin/comments', icon: MessageSquare },
  { id: 'go-settings', group: 'Sahifalar', label: 'Sozlamalar', path: '/admin/settings', icon: Settings },
];

const ACTION_ITEMS: PaletteItem[] = [
  { id: 'act-new-product', group: 'Amallar', label: 'Yangi mahsulot yaratish', hint: 'Create', path: '/admin/products/new', icon: Plus },
  { id: 'act-bulk', group: 'Amallar', label: 'Mahsulotlarni ommaviy yaratish', path: '/admin/products/bulk-create', icon: Plus },
  { id: 'act-import', group: 'Amallar', label: 'Mahsulotlarni import qilish', path: '/admin/products/import', icon: Plus },
];

/**
 * Global command palette (Ctrl+K / Cmd+K / "/").
 * Searches live store products + categories + admin pages/actions.
 */
export const CommandPalette: React.FC = () => {
  const navigate = useNavigate();
  const { products, categories } = useStore();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onOpen = () => {
      setOpen(true);
      setQuery('');
      setActiveIndex(0);
    };
    window.addEventListener(ADMIN_SHORTCUT_OPEN_SEARCH, onOpen);
    return () => window.removeEventListener(ADMIN_SHORTCUT_OPEN_SEARCH, onOpen);
  }, []);

  useEffect(() => {
    if (open) {
      // Focus after mount animation
      const t = setTimeout(() => inputRef.current?.focus(), 30);
      return () => clearTimeout(t);
    }
  }, [open ]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const productItems: PaletteItem[] = (products ?? []).slice(0, 200).map((p) => ({
      id: `product-${p.id}`,
      group: 'Mahsulotlar',
      label: p.name,
      hint: p.categoryName || undefined,
      path: `/admin/products/${p.id}`,
      icon: Package,
    }));
    const categoryItems: PaletteItem[] = (categories ?? []).map((c) => ({
      id: `category-${c.id}`,
      group: 'Kategoriyalar',
      label: c.name,
      path: '/admin/categories',
      icon: FolderTree,
    }));
    const all = [...ACTION_ITEMS, ...PAGE_ITEMS, ...productItems, ...categoryItems];
    if (!q) return all.slice(0, 12);
    return all.filter((i) => i.label.toLowerCase().includes(q) || i.group.toLowerCase().includes(q)).slice(0, 14);
  }, [query, products, categories]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  const close = () => setOpen(false);

  const go = (path: string) => {
    close();
    navigate(path);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const item = results[activeIndex];
      if (item) go(item.path);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      close();
    }
  };

  // Scroll active option into view
  useEffect(() => {
    listRef.current
      ?.querySelector(`[data-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-[90] flex items-start justify-center px-4 pt-[12vh]"
          role="dialog"
          aria-modal="true"
          aria-label="Global qidiruv"
          onKeyDown={onKeyDown}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={close}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl bg-card border border-border shadow-2xl"
          >
            <div className="flex items-center gap-2 border-b border-border px-4">
              <Search className="w-4 h-4 text-muted-foreground shrink-0" aria-hidden="true" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Mahsulot, kategoriya, sahifa qidirish…"
                aria-label="Global qidiruv"
                className="w-full bg-transparent py-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              <kbd className="admin-kbd shrink-0">ESC</kbd>
            </div>
            <div ref={listRef} className="max-h-[50vh] overflow-y-auto p-2" role="listbox" aria-label="Qidiruv natijalari">
              {results.length === 0 ? (
                <p className="px-3 py-8 text-center text-xs text-muted-foreground">
                  Hech narsa topilmadi. Boshqa so‘z bilan urinib ko‘ring.
                </p>
              ) : (
                results.map((item, idx) => {
                  const Icon = item.icon;
                  const active = idx === activeIndex;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      data-index={idx}
                      role="option"
                      aria-selected={active}
                      onMouseEnter={() => setActiveIndex(idx)}
                      onClick={() => go(item.path)}
                      className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                        active ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                      }`}
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted border border-border shrink-0">
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-semibold">{item.label}</span>
                        <span className="block text-[10px] opacity-70">{item.group}</span>
                      </span>
                      {item.hint ? (
                        <span className="admin-kbd shrink-0 max-w-[140px] truncate">{item.hint}</span>
                      ) : (
                        <CornerDownLeft className="h-3.5 w-3.5 opacity-40 shrink-0" aria-hidden="true" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
            <div className="flex items-center gap-3 border-t border-border px-4 py-2 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1"><kbd className="admin-kbd">↑↓</kbd> navigatsiya</span>
              <span className="flex items-center gap-1"><kbd className="admin-kbd">Enter</kbd> ochish</span>
              <span className="ml-auto flex items-center gap-1"><kbd className="admin-kbd">Ctrl K</kbd> yopish/ochish</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;
