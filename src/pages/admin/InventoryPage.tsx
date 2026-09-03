import React, { useState, useEffect } from 'react';
import {
  Boxes,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Save,
  Check,
  RotateCcw,
  Plus,
  Minus,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const InventoryPage: React.FC = () => {
  const { products, updateProductStock } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'in-stock' | 'low' | 'out'>('all');
  const [localStock, setLocalStock] = useState<Record<string, { inStock: boolean; count: number }>>(() => {
    const map: Record<string, { inStock: boolean; count: number }> = {};
    products.forEach((p) => {
      map[p.id] = {
        inStock: p.inStock !== false,
        count: p.stockCount ?? (p.inStock ? 10 : 0),
      };
    });
    return map;
  });

  // Keep local editable state in sync with source of truth (products)
  useEffect(() => {
    setLocalStock((prev) => {
      const next: Record<string, { inStock: boolean; count: number }> = {};
      products.forEach((p) => {
        next[p.id] =
          prev[p.id] ?? {
            inStock: p.inStock !== false,
            count: p.stockCount ?? (p.inStock ? 10 : 0),
          };
      });
      return next;
    });
  }, [products]);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const filteredProducts = products.filter((p) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!p.name.toLowerCase().includes(q) && !p.sku?.toLowerCase().includes(q)) {
        return false;
      }
    }
    const current = localStock[p.id] || { inStock: p.inStock, count: p.stockCount ?? 0 };
    if (filter === 'in-stock' && (!current.inStock || current.count <= 0)) return false;
    if (filter === 'low' && (!current.inStock || current.count > 3 || current.count <= 0)) return false;
    if (filter === 'out' && (current.inStock && current.count > 0)) return false;
    return true;
  });

  const handleToggleStock = (id: string) => {
    setLocalStock((prev) => {
      const existing = prev[id] || { inStock: true, count: 10 };
      const nextInStock = !existing.inStock;
      return {
        ...prev,
        [id]: {
          inStock: nextInStock,
          count: nextInStock ? (existing.count > 0 ? existing.count : 5) : 0,
        },
      };
    });
  };

  const handleChangeCount = (id: string, newCount: number) => {
    const count = Math.max(0, newCount);
    setLocalStock((prev) => ({
      ...prev,
      [id]: {
        inStock: count > 0,
        count,
      },
    }));
  };

  const handleSaveAll = () => {
    Object.entries(localStock as Record<string, { inStock: boolean; count: number }>).forEach(([id, val]) => {
      updateProductStock(id, val.inStock, val.count);
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
            Inventar va Zaxiralar Boshqaruvi
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            Barcha mahsulotlar soni va mavjudligini tezkor yangilang
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveAll}
          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-black shadow-md transition-all active:scale-95 flex items-center gap-2 self-start sm:self-auto"
        >
          {savedSuccess ? (
            <>
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Saqlandi!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Zaxira o'zgarishlarini saqlash</span>
            </>
          )}
        </button>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Mahsulot yoki SKU izlash..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === 'all'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
            }`}
          >
            Barchasi ({products.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('in-stock')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === 'in-stock'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
            }`}
          >
            Mavjud
          </button>
          <button
            type="button"
            onClick={() => setFilter('low')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === 'low'
                ? 'bg-amber-500 text-neutral-950 shadow-xs'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
            }`}
          >
            Kam qolgan (1-3 dona)
          </button>
          <button
            type="button"
            onClick={() => setFilter('out')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === 'out'
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
            }`}
          >
            Tugagan
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-800/40 text-neutral-500 font-bold uppercase text-[10px]">
                <th className="py-3.5 pl-6 pr-3">Mahsulot</th>
                <th className="py-3.5 px-3">Kategoriya</th>
                <th className="py-3.5 px-3">Narxi</th>
                <th className="py-3.5 px-3 text-center">Holati</th>
                <th className="py-3.5 pr-6 pl-3 text-right">Qoldiq Soni (Dona)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {filteredProducts.map((p) => {
                const stockItem = localStock[p.id] || { inStock: p.inStock, count: p.stockCount ?? 0 };
                return (
                  <tr key={p.id} className="hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40">
                    <td className="py-3.5 pl-6 pr-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.images[0] || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=200'}
                          alt=""
                          className="w-10 h-10 rounded-xl object-cover border border-neutral-200 dark:border-neutral-700 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <p className="font-bold text-neutral-900 dark:text-white truncate max-w-xs">
                            {p.name}
                          </p>
                          <span className="font-mono text-[10px] text-neutral-400">{p.sku}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3 font-medium text-neutral-600 dark:text-neutral-300">
                      {p.categoryName || p.category}
                    </td>

                    <td className="py-3.5 px-3 font-bold text-neutral-900 dark:text-white">
                      {p.price.toLocaleString('uz-UZ')} so'm
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleStock(p.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                          stockItem.inStock
                            ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
                            : 'bg-red-100 dark:bg-red-950/40 text-red-800 dark:text-red-300'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            stockItem.inStock ? 'bg-emerald-500' : 'bg-red-500'
                          }`}
                        />
                        <span>{stockItem.inStock ? 'Mavjud' : 'Tugagan'}</span>
                      </button>
                    </td>

                    <td className="py-3.5 pr-6 pl-3 text-right">
                      <div className="inline-flex items-center gap-1.5 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl">
                        <button
                          type="button"
                          onClick={() => handleChangeCount(p.id, stockItem.count - 1)}
                          className="p-1 rounded-lg bg-white dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <input
                          type="number"
                          min={0}
                          value={stockItem.count}
                          onChange={(e) => handleChangeCount(p.id, Number(e.target.value))}
                          className="w-14 text-center font-extrabold text-xs bg-transparent border-none focus:outline-hidden text-neutral-900 dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={() => handleChangeCount(p.id, stockItem.count + 1)}
                          className="p-1 rounded-lg bg-white dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
