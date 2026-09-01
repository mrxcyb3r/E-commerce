import React, { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  Star,
  Sparkle,
  Percent,
  CheckCircle2,
  XCircle,
  Eye,
  Edit,
  Copy,
  Trash2,
  ExternalLink,
  ChevronDown,
  ArrowUpDown,
  Boxes,
  SlidersHorizontal,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { Product } from '../../types/product';

export const ProductsListPage: React.FC = () => {
  const {
    products,
    categories,
    deleteProduct,
    duplicateProduct,
    toggleProductFeatured,
    toggleProductNew,
    toggleProductPublished,
    updateProductStock,
  } = useStore();

  const [searchParams, setSearchParams] = useSearchParams();
  const initialFilter = searchParams.get('filter') || 'all';

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<string>('all');
  const [badgeFilter, setBadgeFilter] = useState<string>(initialFilter);
  const [statusFilter, setStatusFilter] = useState<string>('all'); // all, published, draft
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc' | 'name'>('newest');

  // Deletion Modal
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(q);
        const matchesSku = product.sku?.toLowerCase().includes(q);
        const matchesDesc = product.description.toLowerCase().includes(q);
        const matchesTags = product.tags?.some((t) => t.toLowerCase().includes(q));
        if (!matchesName && !matchesSku && !matchesDesc && !matchesTags) return false;
      }

      // Category match
      if (selectedCategory !== 'all') {
        if (product.category !== selectedCategory && product.categoryName !== selectedCategory) {
          return false;
        }
      }

      // Stock status match
      if (stockFilter === 'in-stock' && !product.inStock) return false;
      if (stockFilter === 'out-of-stock' && product.inStock && (product.stockCount ?? 1) > 0) return false;
      if (stockFilter === 'low-stock' && (!product.inStock || (product.stockCount ?? 0) > 3 || (product.stockCount ?? 0) <= 0)) return false;

      // Badge filter match
      if (badgeFilter === 'featured' && !product.isFeatured) return false;
      if (badgeFilter === 'new' && !product.isNew) return false;
      if (badgeFilter === 'discount' && (!product.originalPrice || product.originalPrice <= product.price)) return false;

      // Published status match
      if (statusFilter === 'published' && product.published === false) return false;
      if (statusFilter === 'draft' && product.published !== false) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      // default newest
      return (new Date(b.createdAt || 0).getTime()) - (new Date(a.createdAt || 0).getTime());
    });
  }, [products, searchQuery, selectedCategory, stockFilter, badgeFilter, statusFilter, sortBy]);

  const handleDeleteConfirm = () => {
    if (productToDelete) {
      deleteProduct(productToDelete.id);
      setProductToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
            Mahsulotlar Katalogi
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            Jami {products.length} ta mahsulot ({filteredProducts.length} ta saralangan)
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/admin/inventory"
            className="px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-bold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors flex items-center gap-1.5"
          >
            <Boxes className="w-4 h-4" />
            <span>Zaxira jadvali</span>
          </Link>
          <Link
            to="/admin/products/new"
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-extrabold shadow-sm transition-all active:scale-95 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Yangi mahsulot</span>
          </Link>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative lg:col-span-2">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Nomi, SKU yoki kalit so'z bo'yicha izlash..."
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-neutral-400 hover:text-neutral-600"
              >
                Tozalash
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2.5 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-medium"
            >
              <option value="all">Barcha kategoriyalar</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.productCount ?? 0})
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="w-full px-3 py-2.5 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-medium"
            >
              <option value="newest">Yangi qo'shilganlar</option>
              <option value="price-asc">Narx: Arzondan qimmatga</option>
              <option value="price-desc">Narx: Qimmatdan arzonga</option>
              <option value="name">Nomi bo'yicha (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
          <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mr-1">
            Filtrlar:
          </span>

          {/* Badge Filter Tabs */}
          <button
            type="button"
            onClick={() => setBadgeFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              badgeFilter === 'all'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200'
            }`}
          >
            Barchasi
          </button>
          <button
            type="button"
            onClick={() => setBadgeFilter('featured')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
              badgeFilter === 'featured'
                ? 'bg-amber-500 text-neutral-950 font-bold shadow-xs'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200'
            }`}
          >
            <Star className="w-3 h-3 fill-current" />
            <span>Mashhurlar</span>
          </button>
          <button
            type="button"
            onClick={() => setBadgeFilter('new')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
              badgeFilter === 'new'
                ? 'bg-rose-500 text-white font-bold shadow-xs'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200'
            }`}
          >
            <Sparkle className="w-3 h-3" />
            <span>Yangilar</span>
          </button>
          <button
            type="button"
            onClick={() => setBadgeFilter('discount')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
              badgeFilter === 'discount'
                ? 'bg-teal-600 text-white font-bold shadow-xs'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200'
            }`}
          >
            <Percent className="w-3 h-3" />
            <span>Chegirmada</span>
          </button>

          {/* Stock status filter */}
          <div className="h-4 w-px bg-neutral-200 dark:bg-neutral-700 mx-1" />

          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="text-xs px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 border-none text-neutral-700 dark:text-neutral-300 font-medium"
          >
            <option value="all">Zaxira: Barchasi</option>
            <option value="in-stock">Mavjud mahsulotlar</option>
            <option value="low-stock">Kam qolgan (1-3 dona)</option>
            <option value="out-of-stock">Tugagan mahsulotlar</option>
          </select>

          {/* Publish status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 border-none text-neutral-700 dark:text-neutral-300 font-medium"
          >
            <option value="all">Holat: Barchasi</option>
            <option value="published">Faol nashrda</option>
            <option value="draft">Qoralama (Yashirilgan)</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800/80 shadow-xs overflow-hidden">
        {filteredProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-800/40 text-neutral-500 dark:text-neutral-400 font-bold uppercase text-[10px]">
                  <th className="py-3.5 pl-5 pr-3">Mahsulot</th>
                  <th className="py-3.5 px-3">Kategoriya</th>
                  <th className="py-3.5 px-3">Narxi</th>
                  <th className="py-3.5 px-3">O'lcham / Rang</th>
                  <th className="py-3.5 px-3 text-center">Zaxira</th>
                  <th className="py-3.5 px-3 text-center">Belgilar</th>
                  <th className="py-3.5 px-3 text-center">Nashr</th>
                  <th className="py-3.5 pr-5 pl-3 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {filteredProducts.map((p) => {
                  const isPublished = p.published !== false;
                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 transition-colors ${
                        !isPublished ? 'opacity-60 bg-neutral-50/40 dark:bg-neutral-950/40' : ''
                      }`}
                    >
                      {/* Product Thumbnail & Details */}
                      <td className="py-3.5 pl-5 pr-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.images[0] || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=200'}
                            alt=""
                            className="w-12 h-12 rounded-xl object-cover border border-neutral-200 dark:border-neutral-700 shrink-0 shadow-2xs"
                            referrerPolicy="no-referrer"
                          />
                          <div className="min-w-0">
                            <Link
                              to={`/admin/products/${p.id}`}
                              className="font-bold text-neutral-900 dark:text-white hover:text-amber-600 dark:hover:text-amber-400 transition-colors block truncate max-w-[200px] sm:max-w-xs"
                            >
                              {p.name}
                            </Link>
                            <div className="flex items-center gap-2 mt-0.5 text-[10px] text-neutral-400">
                              <span className="font-mono">{p.sku}</span>
                              {p.images.length > 1 && (
                                <span className="bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.2 rounded font-medium">
                                  {p.images.length} rasm
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-3">
                        <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                          {p.categoryName || p.category}
                        </span>
                        {p.subcategory && (
                          <span className="block text-[10px] text-neutral-400">
                            {p.subcategory}
                          </span>
                        )}
                      </td>

                      {/* Price & Discount */}
                      <td className="py-3.5 px-3">
                        <div className="font-extrabold text-neutral-900 dark:text-white">
                          {p.price.toLocaleString('uz-UZ')} so'm
                        </div>
                        {p.originalPrice && p.originalPrice > p.price && (
                          <div className="text-[10px] text-red-500 font-semibold flex items-center gap-1">
                            <span className="line-through text-neutral-400">
                              {p.originalPrice.toLocaleString('uz-UZ')}
                            </span>
                            <span>-{Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)}%</span>
                          </div>
                        )}
                      </td>

                      {/* Sizes & Colors */}
                      <td className="py-3.5 px-3">
                        <div className="flex flex-wrap gap-1 max-w-[140px]">
                          {p.sizes?.slice(0, 3).map((s, idx) => (
                            <span
                              key={idx}
                              className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-[10px] font-semibold text-neutral-700 dark:text-neutral-300"
                            >
                              {s}
                            </span>
                          ))}
                          {(p.sizes?.length ?? 0) > 3 && (
                            <span className="text-[10px] text-neutral-400">
                              +{(p.sizes?.length ?? 0) - 3}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-neutral-400 mt-1">
                          {p.colors?.slice(0, 2).join(', ')}
                        </div>
                      </td>

                      {/* Stock Toggle */}
                      <td className="py-3.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => updateProductStock(p.id, !p.inStock)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-colors ${
                            p.inStock
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                              : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              p.inStock ? 'bg-emerald-500' : 'bg-red-500'
                            }`}
                          />
                          <span>{p.inStock ? `${p.stockCount ?? 1} dona` : 'Tugagan'}</span>
                        </button>
                      </td>

                      {/* Badges Toggles */}
                      <td className="py-3.5 px-3 text-center">
                        <div className="inline-flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl">
                          <button
                            type="button"
                            onClick={() => toggleProductFeatured(p.id)}
                            title={p.isFeatured ? "Mashhurlardan chiqarish" : "Mashhur qilish"}
                            className={`p-1.5 rounded-lg transition-colors ${
                              p.isFeatured
                                ? 'bg-amber-500 text-neutral-950'
                                : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200'
                            }`}
                          >
                            <Star className="w-3.5 h-3.5 fill-current" />
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleProductNew(p.id)}
                            title={p.isNew ? "Yangilik belgisini olish" : "Yangi deb belgilash"}
                            className={`p-1.5 rounded-lg transition-colors ${
                              p.isNew
                                ? 'bg-rose-500 text-white'
                                : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200'
                            }`}
                          >
                            <Sparkle className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* Published Toggle */}
                      <td className="py-3.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => toggleProductPublished(p.id)}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                            isPublished
                              ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                              : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-500'
                          }`}
                        >
                          {isPublished ? 'Faol' : 'Qoralama'}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 pr-5 pl-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <a
                            href={`/products/${p.id}`}
                            target="_blank"
                            rel="noreferrer"
                            title="Saytda ko'rish"
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </a>
                          <button
                            type="button"
                            onClick={() => duplicateProduct(p.id)}
                            title="Nusxa olish"
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <Link
                            to={`/admin/products/${p.id}`}
                            title="Tahrirlash"
                            className="p-1.5 rounded-lg text-neutral-700 dark:text-neutral-300 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => setProductToDelete(p)}
                            title="O'chirish"
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 px-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-400 mx-auto flex items-center justify-center mb-3">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              Hech qanday mahsulot topilmadi
            </h3>
            <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
              Qidiruv so'zini o'zgartiring yoki filtrlarni tozalang.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setStockFilter('all');
                setBadgeFilter('all');
                setStatusFilter('all');
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-xs font-bold text-neutral-800 dark:text-neutral-200"
            >
              Filtrlarni tozalash
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={!!productToDelete}
        title="Mahsulotni o'chirish"
        message={`"${productToDelete?.name}" nomli mahsulotni rostdan ham o'chirmoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi.`}
        confirmLabel="Ha, o'chirilsin"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setProductToDelete(null)}
      />
    </div>
  );
};
