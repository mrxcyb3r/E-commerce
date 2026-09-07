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
  ChevronLeft,
  ChevronRight,
  Filter,
  RefreshCw,
  Download,
  Banknote,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { Product } from '../../types/product';
import { formatPrice } from '../../lib/utils';

type BulkAction =
  | 'publish'
  | 'unpublish'
  | 'feature'
  | 'unfeature'
  | 'sale-on'
  | 'sale-off'
  | 'stock-on'
  | 'stock-off';

const PAGE_SIZE = 20;

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
    updateProduct,
    updateProductStock,
    bulkUpdateProducts,
    bulkDeleteProducts,
  } = useStore();

  const [searchParams, setSearchParams] = useSearchParams();
  const initialFilter = searchParams.get('filter') || 'all';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [recencyFilter, setRecencyFilter] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<string>('all');
  const [badgeFilter, setBadgeFilter] = useState<string>(initialFilter);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc' | 'name' | 'updated'>('newest');
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkConfirm, setBulkConfirm] = useState<BulkAction | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkCategoryMenu, setBulkCategoryMenu] = useState(false);
  const [bulkDupeMenu, setBulkDupeMenu] = useState(false);
  const [bulkDupeCount, setBulkDupeCount] = useState(2);
  const [bulkPriceOpen, setBulkPriceOpen] = useState(false);
  const [bulkPriceValue, setBulkPriceValue] = useState('');
  const [bulkStockOpen, setBulkStockOpen] = useState(false);
  const [bulkStockValue, setBulkStockValue] = useState('');
  const [bulkDiscountOpen, setBulkDiscountOpen] = useState(false);
  const [bulkDiscountPct, setBulkDiscountPct] = useState('10');
  const [bulkBusy, setBulkBusy] = useState(false);
  const [batchStatus, setBatchStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const statusTimer = useRef<number | null>(null);

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

  const brandOptions = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => { if (p.brand?.trim()) set.add(p.brand.trim()); });
    return Array.from(set).sort();
  }, [products]);

  const filteredProducts = useMemo(() => {
    const now = Date.now();
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    const min = minPrice.trim() ? Number(minPrice) : null;
    const max = maxPrice.trim() ? Number(maxPrice) : null;
    return products.filter((product) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(q);
        const matchesSku = product.sku?.toLowerCase().includes(q);
        const matchesDesc = product.description.toLowerCase().includes(q);
        const matchesTags = product.tags?.some((t) => t.toLowerCase().includes(q));
        const matchesBrand = product.brand?.toLowerCase().includes(q);
        if (!matchesName && !matchesSku && !matchesDesc && !matchesTags && !matchesBrand) return false;
      }

      if (selectedCategory !== 'all') {
        const cat = categories.find((c) => c.id === selectedCategory);
        if (product.category !== selectedCategory && product.categoryName !== selectedCategory) return false;
        if (cat && product.category !== cat.slug && product.categoryName !== cat.name) return false;
      }

      if (selectedBrand !== 'all' && (product.brand || '') !== selectedBrand) return false;
      if (min !== null && Number.isFinite(min) && product.price < min) return false;
      if (max !== null && Number.isFinite(max) && product.price > max) return false;

      if (recencyFilter === 'created-7d') {
        const t = new Date(product.createdAt || 0).getTime();
        if (!t || now - t > sevenDays) return false;
      }
      if (recencyFilter === 'updated-7d') {
        const t = new Date(product.updatedAt || product.createdAt || 0).getTime();
        if (!t || now - t > sevenDays) return false;
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
      if (sortBy === 'updated') return (new Date(b.updatedAt || b.createdAt || 0).getTime()) - (new Date(a.updatedAt || a.createdAt || 0).getTime());
      return (new Date(b.createdAt || 0).getTime()) - (new Date(a.createdAt || 0).getTime());
    });
  }, [products, searchQuery, selectedCategory, selectedBrand, minPrice, maxPrice, recencyFilter, stockFilter, badgeFilter, statusFilter, sortBy, categories]);

  const totalPages = Math.ceil(filteredProducts.length / PAGE_SIZE) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredProducts.slice(start, start + PAGE_SIZE);
  }, [filteredProducts, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedBrand, minPrice, maxPrice, recencyFilter, stockFilter, badgeFilter, statusFilter, sortBy]);

  const clearFilters = () => {
    setSearchQuery(''); setSelectedCategory('all'); setSelectedBrand('all');
    setMinPrice(''); setMaxPrice(''); setRecencyFilter('all');
    setStockFilter('all'); setBadgeFilter('all'); setStatusFilter('all');
  };

  useEffect(() => {
    setSelectedIds((prev) => prev.filter((id) => products.some((p) => p.id === id)));
  }, [products]);

  const allVisibleSelected = paginatedProducts.length > 0 && paginatedProducts.every((p) => selectedIds.includes(p.id));

  const toggleSelectAll = () => {
    const visibleIds = paginatedProducts.map((p) => p.id);
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
    notify(true, `${selectedIds.length} ta mahsulot "${cat.name}" ga ko'chirildi`);
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

  const runBulkPrice = () => {
    const price = Number(bulkPriceValue);
    if (selectedIds.length === 0 || !Number.isFinite(price) || price < 0) return;
    setBulkBusy(true);
    bulkUpdateProducts(selectedIds, { price: Math.round(price) });
    notify(true, `${selectedIds.length} ta mahsulot narxi ${formatPrice(Math.round(price))} qilindi`);
    setSelectedIds([]);
    setBulkPriceValue('');
    setBulkPriceOpen(false);
    setBulkBusy(false);
  };

  const runBulkStock = () => {
    const count = Math.max(0, Math.floor(Number(bulkStockValue)));
    if (selectedIds.length === 0 || !Number.isFinite(count)) return;
    setBulkBusy(true);
    bulkUpdateProducts(selectedIds, { stockCount: count, inStock: count > 0 });
    notify(true, `${selectedIds.length} ta mahsulot zaxirasi ${count} dona qilindi`);
    setSelectedIds([]);
    setBulkStockValue('');
    setBulkStockOpen(false);
    setBulkBusy(false);
  };

  const runBulkDiscount = () => {
    const pct = Math.min(90, Math.max(1, Number(bulkDiscountPct)));
    if (selectedIds.length === 0 || !Number.isFinite(pct)) return;
    setBulkBusy(true);
    let n = 0;
    selectedIds.forEach((id) => {
      const p = products.find((x) => x.id === id);
      if (!p) return;
      const base = p.originalPrice && p.originalPrice > p.price ? p.originalPrice : p.price;
      const nextPrice = Math.max(0, Math.round(base * (1 - pct / 100)));
      updateProduct(id, { originalPrice: base, price: nextPrice, isOnSale: true });
      n += 1;
    });
    notify(true, `${n} ta mahsulotga ${pct}% chegirma qo‘llandi`);
    setSelectedIds([]);
    setBulkDiscountOpen(false);
    setBulkBusy(false);
  };

  const runBulkExport = () => {
    const rows = (selectedIds.length > 0 ? products.filter((p) => selectedIds.includes(p.id)) : filteredProducts).map((p) => ({
      id: p.id, name: p.name, sku: p.sku, price: p.price, originalPrice: p.originalPrice ?? '',
      category: p.categoryName || p.category, brand: p.brand ?? '', inStock: p.inStock, stockCount: p.stockCount ?? '',
      published: p.published !== false, featured: !!p.isFeatured, isNew: !!p.isNew,
    }));
    if (rows.length === 0) { notify(false, 'Eksport uchun mahsulot topilmadi'); return; }
    const header = Object.keys(rows[0]).join(',');
    const body = rows.map((r) => Object.values(r).map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([header + '\n' + body], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `products-export-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    notify(true, `${rows.length} ta mahsulot CSV ga eksport qilindi`);
  };

  const bulkLabels: Record<BulkAction, { title: string; message: string; confirm: string }> = {
    publish: { title: 'Nashr etish', message: "Tanlangan mahsulotlarni saytda ko'rsatishga ruxsat berasizmi?", confirm: 'Ha, nashr etish' },
    unpublish: { title: 'Nashrdan olib tashlash', message: "Tanlangan mahsulotlarni saytdan yashirishni tasdiqlaysizmi?", confirm: 'Ha, yashirish' },
    feature: { title: 'Mashhur qilish', message: 'Tanlangan mahsulotlarni "Mashhurlar" bo\'limiga qo\'shasizmi?', confirm: 'Ha, mashhur qilish' },
    unfeature: { title: 'Mashhurlikni olib tashlash', message: 'Tanlangan mahsulotlarni "Mashhurlar" bo\'limidan olasizmi?', confirm: 'Ha, olib tashlash' },
    'sale-on': { title: "Chegirmaga qo'shish", message: 'Tanlangan mahsulotlarni "Chegirmada" sifatida belgilaysizmi?', confirm: 'Ha, belgilash' },
    'sale-off': { title: 'Chegirmadan chiqarish', message: 'Tanlangan mahsulotlarni chegirmadan chiqarasizmi?', confirm: 'Ha, chiqarish' },
    'stock-on': { title: 'Zaxirada belgilash', message: 'Tanlangan mahsulotlarni "Mavjud" deb belgilaysizmi?', confirm: 'Ha, mavjud qilish' },
    'stock-off': { title: 'Tugadi deb belgilash', message: 'Tanlangan mahsulotlarni "Tugagan" deb belgilaysizmi?', confirm: 'Ha, tugadi qilish' },
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
            Mahsulotlar
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Jami {products.length} ta mahsulot ({filteredProducts.length} ta saralangan)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={runBulkExport}
            title="Filtrlangan ro‘yxatni CSV ga eksport qilish"
            className="px-3 py-2 rounded-lg border border-border bg-card text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Eksport</span>
          </button>
          <Link
            to="/admin/inventory"
            className="px-3 py-2 rounded-lg border border-border bg-card text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors flex items-center gap-1.5"
          >
            <Boxes className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Zaxira</span>
          </Link>
          <Link
            to="/admin/products/import"
            className="px-3 py-2 rounded-lg border border-border bg-card text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors flex items-center gap-1.5"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Import</span>
          </Link>
          <Link
            to="/admin/products/new"
            className="px-3.5 py-2 rounded-lg bg-foreground text-background text-xs font-semibold hover:bg-foreground/90 transition-all active:scale-[0.98] flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Yangi mahsulot</span>
          </Link>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-3 rounded-xl bg-card border border-border space-y-2.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Nomi, SKU yoki kalit so'z..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg bg-background border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring font-medium"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[10px] text-muted-foreground hover:text-foreground"
              >
                Tozalash
              </button>
            )}
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg bg-background border border-border text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring"
          >
            <option value="all">Barcha kategoriyalar</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name} ({c.productCount ?? 0})</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg bg-background border border-border text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring"
          >
            <option value="newest">Yangi qo'shilganlar</option>
            <option value="updated">So‘nggi yangilanganlar</option>
            <option value="price-asc">Narx: Arzondan qimmatga</option>
            <option value="price-desc">Narx: Qimmatdan arzonga</option>
            <option value="name">Nomi bo'yicha (A-Z)</option>
          </select>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg bg-background border border-border text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring"
            aria-label="Brend bo‘yicha filtr"
          >
            <option value="all">Brend: Barchasi</option>
            {brandOptions.map((b) => (<option key={b} value={b}>{b}</option>))}
          </select>
          <div className="flex items-center gap-1.5">
            <input type="number" min={0} value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="Min narx" aria-label="Minimal narx" className="w-full px-3 py-2 text-xs rounded-lg bg-background border border-border text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring" />
            <input type="number" min={0} value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="Max narx" aria-label="Maksimal narx" className="w-full px-3 py-2 text-xs rounded-lg bg-background border border-border text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring" />
          </div>
          <select
            value={recencyFilter}
            onChange={(e) => setRecencyFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg bg-background border border-border text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring sm:col-span-2"
            aria-label="Yaqinda qo‘shilgan/yangilangan"
          >
            <option value="all">Davr: Barchasi</option>
            <option value="created-7d">So‘nggi 7 kunda yaratilgan</option>
            <option value="updated-7d">So‘nggi 7 kunda yangilangan</option>
          </select>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-border/50">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mr-1">
            Filtrlar:
          </span>

          {[
            { key: 'all', label: 'Barchasi' },
            { key: 'featured', label: 'Mashhurlar', icon: Star },
            { key: 'new', label: 'Yangilar', icon: Sparkle },
            { key: 'discount', label: 'Chegirmada', icon: Percent },
          ].map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setBadgeFilter(f.key)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all flex items-center gap-1 ${
                badgeFilter === f.key
                  ? 'bg-foreground text-background'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {f.icon && <f.icon className="w-3 h-3" />}
              {f.label}
            </button>
          ))}

          <div className="w-px h-4 bg-border mx-1" />

          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="text-[11px] px-2 py-1 rounded-md bg-muted border-none text-muted-foreground font-medium focus:outline-none"
          >
            <option value="all">Zaxira: Barchasi</option>
            <option value="in-stock">Mavjud</option>
            <option value="low-stock">Kam qolgan</option>
            <option value="out-of-stock">Tugagan</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-[11px] px-2 py-1 rounded-md bg-muted border-none text-muted-foreground font-medium focus:outline-none"
          >
            <option value="all">Holat: Barchasi</option>
            <option value="published">Faol</option>
            <option value="draft">Qoralama</option>
          </select>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="p-3 rounded-xl bg-accent/5 border border-accent/20 flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 mr-1">
            <span className="w-5 h-5 rounded-md bg-foreground text-background flex items-center justify-center text-[10px] font-bold">
              {selectedIds.length}
            </span>
            <span className="text-[11px] font-semibold text-foreground">tanlandi</span>
          </div>
          <button type="button" onClick={() => setSelectedIds([])} className="text-[10px] font-medium text-muted-foreground hover:text-foreground flex items-center gap-0.5">
            <X className="w-3 h-3" /> Bekor
          </button>

          <div className="w-px h-4 bg-border" />

          <button type="button" onClick={() => runBulkAction('publish')} className="px-2.5 py-1 rounded-md bg-foreground text-background text-[10px] font-semibold hover:bg-foreground/90 transition-all flex items-center gap-1">
            <Check className="w-3 h-3 stroke-[3]" /> Nashr
          </button>
          <button type="button" onClick={() => setBulkConfirm('unpublish')} className="px-2.5 py-1 rounded-md bg-muted text-foreground text-[10px] font-medium hover:bg-muted/80 transition-colors">
            Yashirish
          </button>
          <button type="button" onClick={() => runBulkAction('feature')} className="px-2.5 py-1 rounded-md bg-muted text-foreground text-[10px] font-medium hover:bg-muted/80 transition-colors flex items-center gap-1">
            <Star className="w-3 h-3" /> Mashhur
          </button>
          <button type="button" onClick={() => runBulkAction('sale-on')} className="px-2.5 py-1 rounded-md bg-muted text-foreground text-[10px] font-medium hover:bg-muted/80 transition-colors flex items-center gap-1">
            <Percent className="w-3 h-3" /> Chegirma
          </button>

          <div className="relative">
            <button type="button" onClick={() => setBulkCategoryMenu((v) => !v)} className="px-2.5 py-1 rounded-md bg-muted text-foreground text-[10px] font-medium hover:bg-muted/80 transition-colors flex items-center gap-1">
              <Tag className="w-3 h-3" /> Kategoriya
            </button>
            {bulkCategoryMenu && (
              <div className="absolute left-0 top-full mt-1 z-30 bg-card border border-border rounded-lg shadow-lg p-1 max-h-48 overflow-auto min-w-36">
                {categories.map((c) => (
                  <button key={c.id} type="button" onClick={() => runBulkCategory(c.id)} className="block w-full text-left px-2.5 py-1.5 rounded-md text-[11px] font-medium text-foreground hover:bg-muted transition-colors">
                    {c.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button type="button" onClick={() => runBulkAction('stock-on')} className="px-2.5 py-1 rounded-md bg-muted text-foreground text-[10px] font-medium hover:bg-muted/80 transition-colors">
            Mavjud
          </button>
          <button type="button" onClick={() => setBulkConfirm('stock-off')} className="px-2.5 py-1 rounded-md bg-muted text-foreground text-[10px] font-medium hover:bg-muted/80 transition-colors">
            Tugadi
          </button>
          <button type="button" onClick={() => setBulkPriceOpen((v) => !v)} className="px-2.5 py-1 rounded-md bg-muted text-foreground text-[10px] font-medium hover:bg-muted/80 transition-colors flex items-center gap-1">
            <Banknote className="w-3 h-3" /> Narx
          </button>
          <button type="button" onClick={() => setBulkStockOpen((v) => !v)} className="px-2.5 py-1 rounded-md bg-muted text-foreground text-[10px] font-medium hover:bg-muted/80 transition-colors flex items-center gap-1">
            <Boxes className="w-3 h-3" /> Soni
          </button>
          <button type="button" onClick={() => setBulkDiscountOpen((v) => !v)} className="px-2.5 py-1 rounded-md bg-muted text-foreground text-[10px] font-medium hover:bg-muted/80 transition-colors flex items-center gap-1">
            <Percent className="w-3 h-3" /> -%
          </button>
          <button type="button" onClick={runBulkExport} className="px-2.5 py-1 rounded-md bg-muted text-foreground text-[10px] font-medium hover:bg-muted/80 transition-colors flex items-center gap-1">
            <Download className="w-3 h-3" /> CSV
          </button>

          <div className="relative">
            <button type="button" onClick={() => setBulkDupeMenu((v) => !v)} className="px-2.5 py-1 rounded-md bg-muted text-foreground text-[10px] font-medium hover:bg-muted/80 transition-colors flex items-center gap-1">
              <Copy className="w-3 h-3" /> Nusxa
            </button>
            {bulkDupeMenu && (
              <div className="absolute left-0 top-full mt-1 z-30 bg-card border border-border rounded-lg shadow-lg p-2.5 min-w-40">
                <div className="flex items-center gap-2">
                  <input type="number" min={1} max={100} value={bulkDupeCount} onChange={(e) => setBulkDupeCount(Math.max(1, Math.min(100, Number(e.target.value) || 1)))} className="w-16 px-2 py-1 text-[11px] rounded-md bg-background border border-border text-foreground font-bold focus:ring-2 focus:ring-ring/20" />
                  <span className="text-[10px] text-muted-foreground">tadan</span>
                  <button type="button" onClick={runBulkDuplicate} className="px-2.5 py-1 rounded-md bg-foreground text-background text-[10px] font-semibold">
                    Nusxalash
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="w-px h-4 bg-border" />

          <button type="button" onClick={() => setBulkDeleteOpen(true)} className="px-2.5 py-1 rounded-md bg-destructive text-destructive-foreground text-[10px] font-semibold hover:bg-destructive/90 transition-all flex items-center gap-1">
            <Trash2 className="w-3 h-3" /> O'chirish
          </button>
        </div>
      )}

      {bulkPriceOpen && selectedIds.length > 0 && (
        <div className="p-3 rounded-xl bg-card border border-border flex flex-wrap items-center gap-2" role="dialog" aria-label="Ommaviy narx">
          <span className="text-[11px] font-semibold">{selectedIds.length} ta mahsulot narxi:</span>
          <input type="number" min={0} step={1000} value={bulkPriceValue} onChange={(e) => setBulkPriceValue(e.target.value)} placeholder="250000" className="w-36 px-2.5 py-1.5 text-xs rounded-lg bg-background border border-border font-semibold" />
          <button type="button" onClick={runBulkPrice} disabled={bulkBusy || !bulkPriceValue} className="px-3 py-1.5 rounded-lg bg-foreground text-background text-[11px] font-semibold disabled:opacity-40">Qo‘llash</button>
          <button type="button" onClick={() => setBulkPriceOpen(false)} className="px-3 py-1.5 text-[11px] text-muted-foreground hover:text-foreground">Bekor</button>
        </div>
      )}

      {bulkStockOpen && selectedIds.length > 0 && (
        <div className="p-3 rounded-xl bg-card border border-border flex flex-wrap items-center gap-2" role="dialog" aria-label="Ommaviy zaxira">
          <span className="text-[11px] font-semibold">{selectedIds.length} ta mahsulot soni:</span>
          <input type="number" min={0} step={1} value={bulkStockValue} onChange={(e) => setBulkStockValue(e.target.value)} placeholder="10" className="w-24 px-2.5 py-1.5 text-xs rounded-lg bg-background border border-border font-semibold" />
          <button type="button" onClick={runBulkStock} disabled={bulkBusy || bulkStockValue === ''} className="px-3 py-1.5 rounded-lg bg-foreground text-background text-[11px] font-semibold disabled:opacity-40">Qo‘llash</button>
          <button type="button" onClick={() => setBulkStockOpen(false)} className="px-3 py-1.5 text-[11px] text-muted-foreground hover:text-foreground">Bekor</button>
        </div>
      )}

      {bulkDiscountOpen && selectedIds.length > 0 && (
        <div className="p-3 rounded-xl bg-card border border-border flex flex-wrap items-center gap-2" role="dialog" aria-label="Ommaviy chegirma">
          <span className="text-[11px] font-semibold">{selectedIds.length} ta mahsulotga chegirma (%):</span>
          <input type="number" min={1} max={90} value={bulkDiscountPct} onChange={(e) => setBulkDiscountPct(e.target.value)} className="w-20 px-2.5 py-1.5 text-xs rounded-lg bg-background border border-border font-semibold" />
          <button type="button" onClick={runBulkDiscount} disabled={bulkBusy} className="px-3 py-1.5 rounded-lg bg-foreground text-background text-[11px] font-semibold disabled:opacity-40">Qo‘llash</button>
          <button type="button" onClick={() => setBulkDiscountOpen(false)} className="px-3 py-1.5 text-[11px] text-muted-foreground hover:text-foreground">Bekor</button>
        </div>
      )}

      {/* Status Banner */}
      {batchStatus && (
        <div className={`px-3 py-2 rounded-lg border text-[11px] font-medium flex items-center gap-2 ${
          batchStatus.ok
            ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-300'
            : 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300'
        }`}>
        <CheckCircle2 className="w-3.5 h-3.5" />
        {batchStatus.text}
      </div>
      )}

      {/* Products Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {filteredProducts.length > 0 ? (
          <div className="overflow-x-auto max-h-[70vh]">
            <table className="w-full text-left text-xs border-collapse admin-table-sticky">
              <thead>
                <tr className="border-b border-border text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/30">
                  <th className="py-2.5 pl-4 pr-2 w-8">
                    <input type="checkbox" checked={allVisibleSelected} onChange={toggleSelectAll} aria-label="Barchasini tanlash" className="w-3.5 h-3.5 rounded cursor-pointer accent-foreground" />
                  </th>
                  <th className="py-2.5 pr-3">Mahsulot</th>
                  <th className="py-2.5 px-3 hidden sm:table-cell">Kategoriya</th>
                  <th className="py-2.5 px-3">Narx</th>
                  <th className="py-2.5 px-3 hidden md:table-cell">Zaxira</th>
                  <th className="py-2.5 px-3 text-center hidden lg:table-cell">Belgilar</th>
                  <th className="py-2.5 px-3 text-center">Holat</th>
                  <th className="py-2.5 px-3 hidden xl:table-cell text-right">Yangilangan</th>
                  <th className="py-2.5 pr-4 pl-3 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {paginatedProducts.map((p) => {
                  const isPublished = p.published !== false;
                  const checked = selectedIds.includes(p.id);
                  return (
                    <tr key={p.id} className={`admin-table-row ${!isPublished ? 'opacity-60' : ''} ${checked ? 'bg-muted/30' : ''}`}>
                      <td className="py-2.5 pl-4 pr-2">
                        <input type="checkbox" checked={checked} onChange={() => toggleSelect(p.id)} aria-label={`${p.name} tanlash`} className="w-3.5 h-3.5 rounded cursor-pointer accent-foreground" />
                      </td>
                      <td className="py-2.5 pr-3">
                        <div className="flex items-center gap-2.5">
                          <img src={p.images[0] || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=200'} alt="" className="w-9 h-9 rounded-lg object-cover border border-border shrink-0" referrerPolicy="no-referrer" loading="lazy" />
                          <div className="min-w-0">
                            <Link to={`/admin/products/${p.id}`} className="font-medium text-foreground hover:text-foreground/80 transition-colors block truncate max-w-[180px] sm:max-w-xs">
                              {p.name}
                            </Link>
                            <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-muted-foreground">
                              <span className="font-mono">{p.sku}</span>
                              {p.brand && (<span className="bg-muted px-1 py-0.5 rounded text-[9px] font-medium truncate max-w-[90px]">{p.brand}</span>)}
                              {(p.images?.length ?? 0) > 1 && (
                                <span className="bg-muted px-1 py-0.5 rounded text-[9px] font-medium">{p.images?.length} rasm</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-2.5 px-3 text-muted-foreground hidden sm:table-cell">
                        {p.categoryName || p.category}
                      </td>

                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-foreground tabular-nums">
                          {formatPrice(p.price)}
                        </div>
                        {p.originalPrice && p.originalPrice > p.price && (
                          <div className="text-[10px] text-red-500 flex items-center gap-1">
                            <span className="line-through text-muted-foreground">{formatPrice(p.originalPrice)}</span>
                            <span>-{Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)}%</span>
                          </div>
                        )}
                      </td>

                      <td className="py-2.5 px-3 hidden md:table-cell">
                        <button type="button" onClick={() => updateProductStock(p.id, !p.inStock)} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium transition-colors ${p.inStock ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300' : 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300'}`}>
                          <span className={`w-1 h-1 rounded-full ${p.inStock ? 'bg-emerald-500' : 'bg-red-500'}`} />
                          {p.inStock ? `${p.stockCount ?? 1} dona` : 'Tugagan'}
                        </button>
                      </td>

                      <td className="py-2.5 px-3 text-center hidden lg:table-cell">
                        <div className="inline-flex items-center gap-0.5 bg-muted p-0.5 rounded-md">
                          <button type="button" onClick={() => toggleProductFeatured(p.id)} title={p.isFeatured ? "Mashhurlardan chiqarish" : "Mashhur qilish"} className={`p-1 rounded transition-colors ${p.isFeatured ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                            <Star className="w-3 h-3" />
                          </button>
                          <button type="button" onClick={() => toggleProductNew(p.id)} title={p.isNew ? "Yangilik belgisini olish" : "Yangi deb belgilash"} className={`p-1 rounded transition-colors ${p.isNew ? 'bg-rose-500 text-white' : 'text-muted-foreground hover:text-foreground'}`}>
                            <Sparkle className="w-3 h-3" />
                          </button>
                        </div>
                      </td>

                      <td className="py-2.5 px-3 text-center">
                        <button type="button" onClick={() => toggleProductPublished(p.id)} className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition-all ${isPublished ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300' : 'bg-muted text-muted-foreground'}`}>
                          {isPublished ? 'Faol' : 'Qoralama'}
                        </button>
                      </td>

                      <td className="py-2.5 px-3 hidden xl:table-cell text-right text-[10px] text-muted-foreground whitespace-nowrap">
                        {p.updatedAt ? new Date(p.updatedAt).toLocaleDateString('uz-UZ', { day: '2-digit', month: 'short' }) : '—'}
                      </td>

                      <td className="py-2.5 pr-4 pl-3 text-right">
                        <div className="flex items-center justify-end gap-0.5">
                          <a href={`/products/${p.id}`} target="_blank" rel="noreferrer" title="Saytda ko'rish" className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                            <Eye className="w-3.5 h-3.5" />
                          </a>
                          <button type="button" onClick={() => duplicateProduct(p.id)} title="Nusxa olish" className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <Link to={`/admin/products/${p.id}`} title="Tahrirlash" className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                            <Edit className="w-3.5 h-3.5" />
                          </Link>
                          <button type="button" onClick={() => setProductToDelete(p)} title="O'chirish" className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
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
            <Search className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-foreground">Hech qanday mahsulot topilmadi</h3>
            <p className="text-xs text-muted-foreground mt-1">Qidiruv so'zini o'zgartiring yoki filtrlarni tozalang.</p>
            <button type="button" onClick={clearFilters} className="mt-3 px-3 py-1.5 rounded-lg bg-muted text-xs font-medium text-foreground hover:bg-muted/80 transition-colors">
              Filtrlarni tozalash
            </button>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <div className="text-xs text-muted-foreground">
            Sahifa {currentPage} / {totalPages} — {filteredProducts.length} ta mahsulot
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum = i + 1;
              if (totalPages > 5) {
                if (currentPage <= 3) pageNum = i + 1;
                else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                else pageNum = currentPage - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-7 h-7 rounded-lg text-xs font-medium transition-all ${
                    currentPage === pageNum
                      ? 'bg-foreground text-background'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog isOpen={!!productToDelete} title="Mahsulotni o'chirish" message={`"${productToDelete?.name}" nomli mahsulotni rostdan ham o'chirmoqchimisiz?`} confirmLabel="Ha, o'chirilsin" onConfirm={handleDeleteConfirm} onCancel={() => setProductToDelete(null)} />

      {bulkConfirm && (
        <ConfirmDialog isOpen title={bulkLabels[bulkConfirm].title} message={`${bulkLabels[bulkConfirm].message} (${selectedIds.length} ta mahsulot)`} confirmLabel={bulkLabels[bulkConfirm].confirm} onConfirm={() => runBulkAction(bulkConfirm)} onCancel={() => setBulkConfirm(null)} />
      )}

      {bulkDeleteOpen && (
        <ConfirmDialog isOpen title="Ommaviy o'chirish" message={`${selectedIds.length} ta mahsulot butunlay o'chiriladi.`} confirmLabel="Ha, barchasini o'chirish" onConfirm={runBulkDelete} onCancel={() => setBulkDeleteOpen(false)} />
      )}
    </div>
  );
};

export default ProductsListPage;