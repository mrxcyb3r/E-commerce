import React, { createContext, useContext, useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { Product } from '../types/product';
import { useStore } from './StoreContext';
import { track } from '../lib/analytics/client';
import { supabase } from '../lib/supabase/client';
import { getVisitorId } from '../lib/analytics/session';

interface FavoritesContextType {
  favoriteIds: string[];
  favoriteProducts: Product[];
  totalFavorites: number;
  isFavorite: (id: string) => boolean;
  toggleFavorite: (product: Product | string) => void;
  removeFavorite: (id: string) => void;
  clearFavorites: () => void;
  hydrated: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

const STORAGE_KEY = 'ecommerce_saved_favorites';

function loadCached(): string[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch {
    return [];
  }
}

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { products } = useStore();
  const visitorId = getVisitorId();

  const [favoriteIds, setFavoriteIds] = useState<string[]>(loadCached);
  const [hydrated, setHydrated] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // Cross-session sync: load product favorites for this visitor from Supabase
  // and reconcile with the local cache (local wins on conflicts, DB fills gaps).
  useEffect(() => {
    let cancelled = false;
    const sync = async () => {
      try {
        const { data, error } = await supabase
          .from('favorites')
          .select('product_id')
          .eq('visitor_id', visitorId);
        if (error) throw error;
        if (cancelled || !mountedRef.current) return;
        const remote = (data ?? []).map((r) => r.product_id);
        const local = loadCached();
        const merged = Array.from(new Set([...local, ...remote]));
        setFavoriteIds(merged);
        setHydrated(true);
      } catch (err) {
        if (import.meta.env.DEV) console.error('[favorites] sync failed:', err);
        setHydrated(true);
      }
    };
    sync();
    return () => { cancelled = true; };
  }, [visitorId]);

  // Keep the local cache in sync for fast reads while offline.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favoriteIds));
    } catch {
      // ignore
    }
  }, [favoriteIds]);

  const isFavorite = useCallback(
    (id: string) => favoriteIds.includes(id),
    [favoriteIds],
  );

  const toggleFavorite = (item: Product | string) => {
    const id = typeof item === 'string' ? item : item.id;
    if (!id) return;
    const exists = favoriteIds.includes(id);
    // Optimistic update
    setFavoriteIds((prev) => (exists ? prev.filter((f) => f !== id) : [...prev, id]));
    track(exists ? 'product_unsave' : 'product_save', { productId: id });

    // Persist to Supabase (visitor-scoped). Rollback on failure.
    (async () => {
      try {
        const { error: delErr } = await supabase
          .from('favorites')
          .delete()
          .eq('visitor_id', visitorId)
          .eq('product_id', id);
        if (delErr) throw delErr;
        if (!exists) {
          const { error: insErr } = await supabase
            .from('favorites')
            .insert({ product_id: id, visitor_id: visitorId });
          if (insErr) throw insErr;
        }
      } catch (err) {
        if (import.meta.env.DEV) console.error('[favorites] toggle failed:', err);
        setFavoriteIds((prev) => (exists ? [...prev, id] : prev.filter((f) => f !== id)));
      }
    })();
  };

  const removeFavorite = useCallback((id: string) => {
    if (!id) return;
    setFavoriteIds((prev) => prev.filter((favId) => favId !== id));
    supabase
      .from('favorites')
      .delete()
      .eq('visitor_id', visitorId)
      .eq('product_id', id)
      .then(({ error }) => {
        if (error && import.meta.env.DEV) console.error('[favorites] remove failed:', error);
      });
  }, [visitorId]);

  const clearFavorites = useCallback(() => {
    setFavoriteIds([]);
    supabase
      .from('favorites')
      .delete()
      .eq('visitor_id', visitorId)
      .then(({ error }) => {
        if (error && import.meta.env.DEV) console.error('[favorites] clear failed:', error);
      });
  }, [visitorId]);

  const favoriteProducts = useMemo(() => {
    return products.filter((product) => favoriteIds.includes(product.id));
  }, [products, favoriteIds]);

  return (
    <FavoritesContext.Provider
      value={{
        favoriteIds,
        favoriteProducts,
        totalFavorites: favoriteIds.length,
        isFavorite,
        toggleFavorite,
        removeFavorite,
        clearFavorites,
        hydrated,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = (): FavoritesContextType => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};