import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { Product } from '../types/product';
import { useStore } from './StoreContext';

interface FavoritesContextType {
  favoriteIds: string[];
  favoriteProducts: Product[];
  totalFavorites: number;
  isFavorite: (id: string) => boolean;
  toggleFavorite: (product: Product | string) => void;
  removeFavorite: (id: string) => void;
  clearFavorites: () => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

const STORAGE_KEY = 'ecommerce_saved_favorites';

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { products } = useStore();

  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favoriteIds));
    } catch {
      // ignore
    }
  }, [favoriteIds]);

  const isFavorite = (id: string) => favoriteIds.includes(id);

  const toggleFavorite = (item: Product | string) => {
    const id = typeof item === 'string' ? item : item.id;
    setFavoriteIds((prev) =>
      prev.includes(id) ? prev.filter((favId) => favId !== id) : [...prev, id]
    );
  };

  const removeFavorite = (id: string) => {
    setFavoriteIds((prev) => prev.filter((favId) => favId !== id));
  };

  const clearFavorites = () => {
    setFavoriteIds([]);
  };

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
