import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Plus,
  Search,
  Star,
  Sparkle,
  Percent,
  Eye,
  Edit,
  Copy,
  Trash2,
  Boxes,
  Check,
  X,
  Layers,
  Tag,
  CheckCircle2,
  UploadCloud,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { Product } from '../../types/product';

type BulkAction =
  | 'publish'
  | 'unpublish'
  | 'feature'
  | 'unfeature'
  | 'sale-on'
  | 'sale-off'
  | 'stock-on'
  | 'stock-off';

export const ProductsListPage: React.FC = () => {
  const {
    products,
    categories,
    deleteProduct,
    duplicateProduct,
    duplicateProducts,
    toggleProductFeatured,
    toggleProductNew,
    toggleProductPublished,
    updateProductStock,
    bulkUpdateProducts,
    bulkDeleteProducts,
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

  // Selection & Bulk
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkConfirm, setBulkConfirm] = useState<BulkAction | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkCategoryMenu, setBulkCategoryMenu] = useState(false);
  const [bulkDupeMenu, setBulkDupeMenu] = useState(false);
  const [bulkDupeCount, setBulkDupeCount] = useState(2);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [batchStatus, setBatchStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const statusTimer = useRef<number | null>(null);

  // Deletion Modal
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  useEffect(() => {
    return () => {
      if (statusTimer.current) window.clearTimeout(statusTimer.current);
    };
  }, []);

  const notify = (ok: boolean, text: string) => {
    setBatchStatus({ ok, text });
    if (statusTimer.current) window.clearTimeout(statusTimer.current);
    statusTimer.current = window.setTimeout(() => setBatchStatus(null), 3000);
  };

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(q);
        const matchesSku = product.sku?.toLowerCase().includes(q);
        const matchesDesc = product.description.toLowerCase().includes(q);
        const matchesTags = product.tags?.some((t) => t.toLowerCase().includes(q));
        if (!matchesName && !matchesSku && !matchesDesc && !matchesTags) return false;
      }

      if (selectedCategory !== 'all') {
        const cat = categories.find((c) => c.id === selectedCategory);
        if (product.category !== selectedCategory && product.categoryName !== selectedCategory) return false;
        if (cat && product.category !== cat.slug && product.categoryName !== cat.name) return false;
      }

      if (stockFilter === 'in-stock' && !product.inStock) return false;
      if (stockFilter === 'out-of-stock' && product.inStock && (product.stockCount ?? 1) > 0) return false;
      if (stockFilter === 'low-stock' && (!product.inStock || (product.stockCount ?? 0) > 3 || (product.stockCount ?? 0) <= 0)) return false;

      if (badgeFilter === 'featured' && !product.isFeatured) return false;
      if (badgeFilter === 'new' && !product.isNew) return false;
      if (badgeFilter === 'discount' && (!product.originalPrice || product.originalPrice <= product.price)) return false;

      if (statusFilter === 'published' && product.published === false) return false;
      if (statusFilter === 'draft' && product.published !== false) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return (new Date(b.createdAt || 0).getTime()) - (new Date(a.createdAt || 0).getTime());
    });
  }, [products, searchQuery, selectedCategory, stockFilter, badgeFilter, statusFilter, sortBy, categories]);

  // Keep selection valid when products change (e.g. filters shrink the list).
  useEffect(() => {
    setSelectedIds((prev) => prev.filter((id) => products.some((p) => p.id === id)));
  }, [products]);

  const allVisibleSelected = filteredProducts.length > 0 && filteredProducts.every((p) => selectedIds.includes(p.id));

  const toggleSelectAll = () => {
    const visibleIds = filteredProducts.map((p) => p.id);
    if (allVisibleSelected) {
      setSelectedIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const runBulkAction = (action: BulkAction) => {
    if (selectedIds.length === 0) return;
    setBulkBusy(true);
    setBulkConfirm(null);
    setBulkCategoryMenu(false);
    const n = selectedIds.length;

    switch (action) {
      case 'publish': bulkUpdateProducts(selectedIds, { published: true }); break;
      case 'unpublish': bulkUpdateProducts(selectedIds, { published: false }); break;
      case 'feature': bulkUpdateProducts(selectedIds, { isFeatured: true }); break;
      case 'unfeature': bulkUpdateProducts(selectedIds, { isFeatured: false }); break;
      case 'sale-on': bulkUpdateProducts(selectedIds, { isOnSale: true }); break;
      case 'sale-off': bulkUpdateProducts(selectedIds, { isOnSale: false }); break;
      case 'stock-on': bulkUpdateProducts(selectedIds, { inStock: true }); break;
      case 'stock-off': bulkUpdateProducts(selectedIds, { inStock: false }); break;
    }
    notify(true, `${n} ta mahsulot yangilandi`);
    setSelectedIds([]);
    setBulkBusy(false);
  };

  const runBulkDelete = () => {
    if (selectedIds.length === 0) return;
    setBulkBusy(true);
    setBulkDeleteOpen(false);
    const n = selectedIds.length;
    bulkDeleteProducts(selectedIds);
    notify(true, `${n} ta mahsulot o'chirildi`);
    setSelectedIds([]);
    setBulkBusy(false);
  };

  const runBulkCategory = (categoryId: string) => {
    const cat = categories.find((c) => c.id === categoryId);
    if (!cat) return;
    if (selectedIds.length === 0) return;
    bulkUpdateProducts(selectedIds, { category: cat.slug });
    notify(true, `${selectedIds.length} ta mahsulot "${cat.name}" kategoriyasiga ko'chirildi`);
    setSelectedIds([]);
    setBulkCategoryMenu(false);
  };

  const runBulkDuplicate = () => {
    if (selectedIds.length === 0) return;
    setBulkBusy(true);
    setBulkDupeMenu(false);
    const perProduct = bulkDupeCount;
    const n = selectedIds.length;
    const created = duplicateProducts(selectedIds, perProduct);
    notify(true, `${n} ta mahsulotdan ${created} ta nusxa yaratildi`);
    setSelectedIds([]);
    setBulkBusy(false);
  };

  const handleDeleteConfirm = () => {
    if (productToDelete) {
      deleteProduct(productToDelete.id);
      setProductToDelete(null);
    }
  };

  const bulkLabels: Record<BulkAction, { title: string; message: string; confirm: string }> = {
    publish: { title: 'Nashr etish', message: 'Tanlangan mahsulotlarni saytda ko\'rsatishga ruxsat berasizmi?', confirm: 'Ha, nashr etish' },
    unpublish: { title: 'Nashrdan olib tashlash', message: 'Tanlangan mahsulotlarni saytdan yashirishni tasdiqlaysizmi?', confirm: 'Ha, yashirish' },
    feature: { title: 'Mashhur qilish', message: 'Tanlangan mahsulotlarni "Mashhurlar" bo\'limiga qo\'shasizmi?', confirm: 'Ha, mashhur qilish' },
    unfeature: { title: 'Mashhurlikni olib tashlash', message: 'Tanlangan mahsulotlarni "Mashhurlar" bo\'limidan olasizmi?', confirm: 'Ha, olib tashlash' },
    'sale-on': { title: 'Chegirmaga qo\'shish', message: 'Tanlangan mahsulotlarni "Chegirmada" sifatida belgilaysizmi?', confirm: 'Ha, belgilash' },
    'sale-off': { title: 'Chegirmadan chiqarish', message: 'Tanlangan mahsulotlarni chegirmadan chiqarasizmi?', confirm: 'Ha, chiqarish' },
    'stock-on': { title: 'Zaxirada belgilash', message: 'Tanlangan mahsulotlarni "Mavjud" deb belgilaysizmi?', confirm: 'Ha, mavjud qilish' },
    'stock-off': { title: 'Tugadi deb belgilash', message: 'Tanlangan mahsulotlarni "Tugagan" deb belgilaysizmi?', confirm: 'Ha, tugadi qilish' },
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
            to="/admin/products/bulk-create"
            className="px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-bold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors flex items-center gap-1.5"
          >
            <Layers className="w-4 h-4" />
            <span>Ommaviy yaratish</span>
          </Link>
          <Link
            to="/admin/products/import"
            className="px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-bold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors flex items-center gap-1.5"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Import</span>
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

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300/60 dark:border-amber-900/60 shadow-xs flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 mr-2">
            <span className="w-6 h-6 rounded-lg bg-amber-500 text-neutral-950 flex items-center justify-center text-xs font-black">
              {selectedIds.length}
            </span>
            <span className="text-xs font-extrabold text-amber-900 dark:text-amber-200">
              mahsulot tanlandi
            </span>
          </div>
          <button
            type="button"
            onClick={() => setSelectedIds([])}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-300 hover:underline"
          >
            <X className="w-3.5 h-3.5" />
            Bekor qilish
          </button>

          <div className="w-px h-5 bg-amber-300/70 dark:bg-amber-900/60 mx-1" />

          <button type="button" onClick={() => runBulkAction('publish')} className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 text-[11px] font-black shadow-sm transition-all flex items-center gap-1">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            Nashr
          </button>
          <button type="button" onClick={() => setBulkConfirm('unpublish')} className="px-3 py-1.5 rounded-lg bg-white dark:bg-neutral-800 border border-amber-300 dark:border-amber-900 text-amber-900 dark:text-amber-200 text-[11px] font-bold hover:bg-neutral-50 transition-colors flex items-center gap-1">
            Yashirish
          </button>
          <button type="button" onClick={() => runBulkAction('feature')} className="px-3 py-1.5 rounded-lg bg-white dark:bg-neutral-800 border border-amber-300 dark:border-amber-900 text-amber-900 dark:text-amber-200 text-[11px] font-bold hover:bg-neutral-50 transition-colors flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-current" />
            Mashhur
          </button>
          <button type="button" onClick={() => runBulkAction('sale-on')} className="px-3 py-1.5 rounded-lg bg-white dark:bg-neutral-800 border border-amber-300 dark:border-amber-900 text-amber-900 dark:text-amber-200 text-[11px] font-bold hover:bg-neutral-50 transition-colors flex items-center gap-1">
            <Percent className="w-3.5 h-3.5" />
            Chegirma
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setBulkCategoryMenu((v) => !v)}
              className="px-3 py-1.5 rounded-lg bg-white dark:bg-neutral-800 border border-amber-300 dark:border-amber-900 text-amber-900 dark:text-amber-200 text-[11px] font-bold hover:bg-neutral-50 transition-colors flex items-center gap-1"
            >
              <Tag className="w-3.5 h-3.5" />
              Kategoriya
            </button>
            {bulkCategoryMenu && (
              <div className="absolute left-0 top-full mt-1.5 z-30 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-lg p-1.5 max-h-56 overflow-auto min-w-40">
                {categories.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => runBulkCategory(c.id)}
                    className="block w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <button
              type="button"
              className="px-3 py-1.5 rounded-lg bg-white dark:bg-neutral-800 border border-amber-300 dark:border-amber-900 text-amber-900 dark:text-amber-200 text-[11px] font-bold hover:bg-neutral-50 transition-colors flex items-center gap-1"
              onClick={() => runBulkAction('stock-on')}
            >
              <Layers className="w-3.5 h-3.5" />
              Mavjud
            </button>
          </div>
          <button type="button" onClick={() => setBulkConfirm('stock-off')} className="px-3 py-1.5 rounded-lg bg-white dark:bg-neutral-800 border border-amber-300 dark:border-amber-900 text-amber-900 dark:text-amber-200 text-[11px] font-bold hover:bg-neutral-50 transition-colors">
            Tugadi
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setBulkDupeMenu((v) => !v)}
              className="px-3 py-1.5 rounded-lg bg-white dark:bg-neutral-800 border border-amber-300 dark:border-amber-900 text-amber-900 dark:text-amber-200 text-[11px] font-bold hover:bg-neutral-50 transition-colors flex items-center gap-1"
            >
              <Copy className="w-3.5 h-3.5" />
              Nusxa
            </button>
            {bulkDupeMenu && (
              <div className="absolute left-0 top-full mt-1.5 z-30 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-lg p-3 min-w-44">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-bold text-neutral-700 dark:text-neutral-200">
                    {selectedIds.length} ta mahsulot
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={bulkDupeCount}
                    onChange={(e) => setBulkDupeCount(Math.max(1, Math.min(100, Number(e.target.value) || 1)))}
                    className="w-20 px-2.5 py-1.5 text-xs rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white font-bold focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="text-[11px] text-neutral-500">tadan</span>
                  <button
                    type="button"
                    onClick={runBulkDuplicate}
                    className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 text-[11px] font-black"
                  >
                    Nusxalash
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="w-px h-5 bg-amber-300/70 dark:bg-amber-900/60 mx-1" />

          <button
            type="button"
            onClick={() => setBulkDeleteOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-[11px] font-black shadow-sm transition-all flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            O'chirish
          </button>
        </div>
      )}

      {/* Transient status banner */}
      {batchStatus && (
        <div className={`px-4 py-3 rounded-2xl border text-xs font-bold flex items-center gap-2 shadow-xs ${
          batchStatus.ok
            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300/60 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-200'
            : 'bg-red-50 dark:bg-red-950/40 border-red-300/60 dark:border-red-900/60 text-red-800 dark:text-red-200'
        }`}>
          <CheckCircle2 className="w-4 h-4" />
          {batchStatus.text}
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800/80 shadow-xs overflow-hidden">
        {filteredProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-800/40 text-neutral-500 dark:text-neutral-400 font-bold uppercase text-[10px]">
                  <th className="py-3.5 pl-5 pr-2 w-8">
                    <input
                      type="checkbox"
                      checked={allVisibleSelected}
                      onChange={toggleSelectAll}
                      aria-label="Barchasini tanlash"
                      className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                    />
                  </th>
                  <th className="py-3.5 pr-3">Mahsulot</th>
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
                  const checked = selectedIds.includes(p.id);
                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 transition-colors ${
                        !isPublished ? 'opacity-60 bg-neutral-50/40 dark:bg-neutral-950/40' : ''
                      } ${checked ? 'bg-amber-50/60 dark:bg-amber-950/20' : ''}`}
                    >
                      <td className="py-3.5 pl-5 pr-2">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleSelect(p.id)}
                          aria-label={`${p.name} tanlash`}
                          className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                        />
                      </td>
                      <td className="py-3.5 pr-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.images[0] || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=200'}
                            alt=""
                            className="w-12 h-12 rounded-xl object-cover border border-neutral-200 dark:border-neutral-700 shrink-0 shadow-2xs"
                            referrerPolicy="no-referrer"
                            loading="lazy"
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
                              {p.images?.length > 1 && (
                                <span className="bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.2 rounded font-medium">
                                  {p.images?.length} rasm
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

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
                          {p.colors?.slice(0, 2).map((c) => c.name).join(', ')}
                        </div>
                      </td>

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

      {/* Bulk action confirmation */}
      {bulkConfirm && (
        <ConfirmDialog
          isOpen
          title={bulkLabels[bulkConfirm].title}
          message={`${bulkLabels[bulkConfirm].message} (${selectedIds.length} ta mahsulot)`}
          confirmLabel={bulkLabels[bulkConfirm].confirm}
          onConfirm={() => runBulkAction(bulkConfirm)}
          onCancel={() => setBulkConfirm(null)}
        />
      )}

      {/* Bulk delete confirmation */}
      {bulkDeleteOpen && (
        <ConfirmDialog
          isOpen
          title="Ommaviy o'chirish"
          message={`${selectedIds.length} ta mahsulot va ularning barcha rasmlari/ma'lumotlari butunlay o'chiriladi. Bu amalni ortga qaytarib bo'lmaydi. Davom etasizmi?`}
          confirmLabel="Ha, barchasini o'chirish"
          onConfirm={runBulkDelete}
          onCancel={() => setBulkDeleteOpen(false)}
        />
      )}
    </div>
  );
};