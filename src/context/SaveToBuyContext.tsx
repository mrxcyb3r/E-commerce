import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from 'react';
import { Product } from '../types/product';
import { useStore } from './StoreContext';
import { track } from '../lib/analytics/client';
import { getVisitorId } from '../lib/analytics/session';
import { createBuySession, encodeSessionForQR, type BuySessionItem, type BuySession } from '../types/buySession';
import { BUSINESS_CONFIG } from '../config/business';

/**
 * "Save to Buy" — independent from Favorites (likes).
 * Favorites = things I like. Buy list = products I intend to purchase
 * in the physical shop (no checkout, no payment, local-first).
 *
 * Persistence: localStorage only (survives refresh, works offline).
 * NOTE: no Supabase table yet — intentionally, while the migration history
 * is frozen (see docs/MIGRATIONS.md). The visitor id is captured so a future
 * server sync can merge without refactoring call sites. Analytics uses
 * buy_list_add / buy_list_remove (see migration 20260908*); until that
 * allowlist lands, the tracking client's per-row fallback isolates any
 * rejected rows without losing the rest of the batch.
 */

export interface BuyListItem {
  id: string;
  qty: number;
  size?: string;
  color?: string;
  notes?: string;
}

export interface BuyListLine extends BuyListItem {
  product: Product;
  lineTotal: number;
}

interface SaveToBuyContextType {
  items: BuyListItem[];
  lines: BuyListLine[];
  totalCount: number;
  totalSum: number;
  isSaved: (id: string) => boolean;
  toggleSave: (product: Product, variant?: { size?: string; color?: string }) => void;
  setQty: (id: string, qty: number) => void;
  setNotes: (id: string, notes: string) => void;
  removeItem: (id: string) => void;
  clearList: () => void;
  moveToFavorites: (product: Product) => void;
  hydrated: boolean;
  /** Portable share payload (base64url JSON) — future QR / staff lookup. */
  shareToken: () => string;
  /** Generate a Buy Session for in-store shopping */
  createBuySession: () => { session: BuySession; qrPayload: string };
}

const SaveToBuyContext = createContext<SaveToBuyContextType | undefined>(undefined);

const STORAGE_KEY = 'ecommerce_save_to_buy_v1';
const MAX_QTY = 99;

function loadCached(): BuyListItem[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((x) => x && typeof x.id === 'string' && x.id)
      .map((x) => ({
        id: x.id,
        qty: Math.min(MAX_QTY, Math.max(1, Number(x.qty) || 1)),
        ...(typeof x.size === 'string' && x.size ? { size: x.size } : {}),
        ...(typeof x.color === 'string' && x.color ? { color: x.color } : {}),
      }));
  } catch {
    return [];
  }
}

export const SaveToBuyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { products } = useStore();
  const visitorId = getVisitorId();
  void visitorId; // captured for future server sync; local-first for now.

  const [items, setItems] = useState<BuyListItem[]>(loadCached);
  const [hydrated, setHydrated] = useState(false);

  // Local cache is the source of truth; mark hydrated after first paint so
  // pages never flash an empty list before the cache loads.
  useEffect(() => {
    setItems(loadCached());
    setHydrated(true);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore (private mode / quota)
    }
  }, [items]);

  const isSaved = useCallback((id: string) => items.some((i) => i.id === id), [items]);

  const toggleSave = useCallback(
    (product: Product, variant?: { size?: string; color?: string }) => {
      if (!product?.id) return;
      const exists = items.some((i) => i.id === product.id);
      setItems((prev) =>
        exists
          ? prev.filter((i) => i.id !== product.id)
          : [...prev, { id: product.id, qty: 1, ...variant }]
      );
      track(exists ? 'buy_list_remove' : 'buy_list_add', {
        productId: product.id,
        metadata: variant ?? {},
      });
    },
    [items]
  );

  const setQty = useCallback((id: string, qty: number) => {
    if (!id) return;
    const next = Math.min(MAX_QTY, Math.max(1, Math.floor(qty) || 1));
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, qty: next } : i)));
  }, []);

  const setNotes = useCallback((id: string, notes: string) => {
    if (!id) return;
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, notes: notes.trim() || undefined } : i))
    );
  }, []);

  const removeItem = useCallback((id: string) => {
    if (!id) return;
    setItems((prev) => {
      if (!prev.some((i) => i.id === id)) return prev;
      track('buy_list_remove', { productId: id });
      return prev.filter((i) => i.id !== id);
    });
  }, []);

  const clearList = useCallback(() => setItems([]), []);

  const moveToFavorites = useCallback(
    (product: Product) => {
      if (!product?.id) return;
      // Add to favorites
      // We'll use a custom event to trigger the favorites context
      window.dispatchEvent(new CustomEvent('move-to-favorites', { detail: product }));
      // Remove from buy list
      removeItem(product.id);
      track('buy_list_move_to_favorites', { productId: product.id });
    },
    [removeItem]
  );

  const lines = useMemo<BuyListLine[]>(() => {
    const map = new Map(products.map((p) => [p.id, p]));
    return items.flatMap((item) => {
      const product = map.get(item.id);
      if (!product) return [];
      const price = typeof product.price === 'number' ? product.price : 0;
      return [{ ...item, product, lineTotal: price * item.qty }];
    });
  }, [items, products]);

  const totalCount = useMemo(() => items.reduce((s, i) => s + i.qty, 0), [items]);
  const totalSum = useMemo(() => lines.reduce((s, l) => s + l.lineTotal, 0), [lines]);

  const createBuySessionFn = useCallback(() => {
    const sessionItems: BuySessionItem[] = items.map(({ id, qty, size, color, notes }) => ({
      id,
      qty,
      size,
      color,
      notes,
    }));
    const session = createBuySession(sessionItems, BUSINESS_CONFIG.name || 'default');
    const qrPayload = encodeSessionForQR(session);
    track('buy_session_created', {
      metadata: {
        itemCount: items.length,
        totalQty: totalCount,
        totalSum,
      },
    });
    return { session, qrPayload };
  }, [items, totalCount, totalSum]);

  const shareToken = useCallback(() => {
    // v1 envelope: versioned, self-describing, QR-encodable later.
    // No backend involved — staff lookup flow can adopt this format as-is.
    const payload = {
      v: 1,
      ts: Date.now(),
      items: items.map(({ id, qty, size, color, notes }) => ({ id, qty, size, color, notes })),
    };
    const json = JSON.stringify(payload);
    return btoa(unescape(encodeURIComponent(json)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }, [items]);

  return (
    <SaveToBuyContext.Provider
      value={{
        items,
        lines,
        totalCount,
        totalSum,
        isSaved,
        toggleSave,
        setQty,
        setNotes,
        removeItem,
        clearList,
        moveToFavorites,
        hydrated,
        shareToken,
        createBuySession: createBuySessionFn,
      }}
    >
      {children}
    </SaveToBuyContext.Provider>
  );
};

export const useSaveToBuy = (): SaveToBuyContextType => {
  const context = useContext(SaveToBuyContext);
  if (!context) {
    throw new Error('useSaveToBuy must be used within a SaveToBuyProvider');
  }
  return context;
};
