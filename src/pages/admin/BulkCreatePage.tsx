import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ClipboardList,
  ImagePlus,
  Loader2,
  Plus,
  RefreshCcw,
  Settings,
  X,
  AlertTriangle,
  Layers,
  Banknote,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types/product';
import {
  MEDIA_BUCKETS,
  buildMediaPath,
  deleteMediaObjects,
  getPublicUrl,
  uploadMediaWithProgress,
  validateMediaFile,
} from '../../lib/supabase/storage';
import { formatPrice } from '../../lib/utils';

type Step = 'select' | 'settings' | 'review' | 'running' | 'done';

interface SelectedImage {
  key: string;
  file: File;
  previewUrl: string;
}

interface BulkItem {
  key: string;
  productId: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  categoryId: string;
  categoryName: string;
}

type ItemStatusKind = 'pending' | 'uploading' | 'created' | 'failed';

interface ItemStatus {
  status: ItemStatusKind;
  progress: number;
  error?: string;
}

interface SharedSettings {
  categoryId: string;
  price: string;
  originalPrice: string;
  inStock: boolean;
  stockCount: string;
  sizes: string[];
  colors: string[];
  tags: string;
  description: string;
  published: boolean;
  naming: 'filename' | 'prefix';
  prefix: string;
}

const PRESET_SIZES = ['S', 'M', 'L', 'XL', 'XS'];
const PRESET_COLORS = ['Qora', 'Oq', 'Ko\'k', 'Qizil', 'Yashil', 'Sariq'];
const CONCURRENCY = 3;

let keyCounter = 0;
const nextKey = () => `bulk-img-${Date.now()}-${++keyCounter}`;

function nameFromFile(fileName: string): string {
  const base = fileName.replace(/\.[^.]+$/, '');
  const words = base
    .split(/[-_.\s]+/)
    .map((w) => w.replace(/[^a-zA-Z0-9\u0400-\u04FF]+/g, ''))
    .filter(Boolean);
  if (words.length === 0) return 'Mahsulot';
  return words
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function errorMessage(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  if (/duplicate key/i.test(msg) && /slug/i.test(msg)) {
    return 'Bunday nom (slug) allaqachon band — nomni o\'zgartiring';
  }
  if (/duplicate key/i.test(msg)) return 'Takroriy ma\'lumot saqlanmoqchi — nomni tekshiring';
  if (/row-level security/i.test(msg)) return 'Ruxsat yetarli emas (RLS)';
  if (/network/i.test(msg) || /fetch/i.test(msg)) return 'Tarmoq xatosi — qayta urinib ko\'ring';
  return msg;
}

export function BulkCreatePage() {
  const { categories, products, insertBulkProduct, cleanupBulkProduct } = useStore();

  const [step, setStep] = useState<Step>('select');
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [selectionError, setSelectionError] = useState('');
  const [shared, setShared] = useState<SharedSettings>({
    categoryId: '',
    price: '',
    originalPrice: '',
    inStock: true,
    stockCount: '',
    sizes: [],
    colors: [],
    tags: '',
    description: '',
    published: true,
    naming: 'filename',
    prefix: '',
  });
  const [items, setItems] = useState<BulkItem[]>([]);
  const [statuses, setStatuses] = useState<Record<string, ItemStatus>>({});
  const [busy, setBusy] = useState(false);
  const runningRef = useRef(false);
  const touchedRef = useRef<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);
  const [dragging, setDragging] = useState(false);

  const catOptions = useMemo(() => categories, [categories]);

  useEffect(() => {
    const previews = selectedImages.map((s) => s.previewUrl);
    return () => {
      previews.forEach((u) => URL.revokeObjectURL(u));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addFiles = useCallback((files: FileList | File[]) => {
    const list = Array.from(files);
    if (list.length === 0) return;
    setSelectionError('');
    const added: SelectedImage[] = [];
    const rejected: string[] = [];
    list.forEach((file) => {
      const validation = validateMediaFile(file, 'image');
      if (!validation.ok) {
        rejected.push(`${file.name}: ${validation.error ?? 'Yaroqsiz rasm'}`);
        return;
      }
      added.push({ key: nextKey(), file, previewUrl: URL.createObjectURL(file) });
    });
    if (rejected.length > 0) {
      setSelectionError(`Quyidagi fayllar qabul qilinmadi: ${rejected.join(', ')}`);
    }
    if (added.length > 0) {
      setSelectedImages((prev) => [...prev, ...added]);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      dragDepth.current = 0;
      setDragging(false);
      addFiles(e.dataTransfer.files);
    },
    [addFiles]
  );

  const removeImage = useCallback((key: string) => {
    setSelectedImages((prev) => {
      const img = prev.find((s) => s.key === key);
      if (img) URL.revokeObjectURL(img.previewUrl);
      return prev.filter((s) => s.key !== key);
    });
  }, []);

  const buildItems = useCallback(() => {
    if (selectedImages.length === 0) {
      setSelectionError('Kamida bitta rasm tanlang.');
      return false;
    }
    const batchTs = Date.now();
    const usedSlugs = new Set<string>(products.map((p) => p.slug));
    const usePrefix = shared.naming === 'prefix' && shared.prefix.trim().length > 0;
    const newItems: BulkItem[] = selectedImages.map((img, i) => {
      const rawName = usePrefix ? `${shared.prefix.trim()} ${i + 1}` : nameFromFile(img.file.name);
      let slug = slugify(rawName) || `bulk-product-${i + 1}`;
      let n = 2;
      while (usedSlugs.has(slug) && n < 50) {
        slug = `${slugify(rawName) || `bulk-product-${i + 1}`}-${n++}`;
      }
      usedSlugs.add(slug);
      const cat = catOptions.find((c) => c.id === shared.categoryId);
      return {
        key: img.key,
        productId: `prod-bulk-${batchTs}-${i}`,
        name: rawName,
        slug,
        sku: `SKU-bulk-${batchTs}-${i}`,
        price: Number(shared.price) || 0,
        categoryId: shared.categoryId,
        categoryName: cat?.name ?? '',
      };
    });
    setItems(newItems);
    setStatuses({});
    touchedRef.current = new Set();
    setSelectionError('');
    return true;
  }, [selectedImages, shared, products, catOptions]);

  const goToSettings = () => {
    if (buildItems()) setStep('settings');
  };

  const updateItem = (key: string, patch: Partial<BulkItem>) => {
    touchedRef.current.add(key);
    setItems((prev) => prev.map((it) => (it.key === key ? { ...it, ...patch } : it)));
  };

  const syncSharedToRows = useCallback(
    (s: SharedSettings) => {
      const cat = catOptions.find((c) => c.id === s.categoryId);
      const priceN = Number(s.price);
      const priceValid = s.price !== '' && Number.isFinite(priceN) && priceN >= 0;
      setItems((prev) =>
        prev.map((it) =>
          touchedRef.current.has(it.key)
            ? it
            : {
                ...it,
                price: priceValid ? priceN : it.price,
                categoryId: s.categoryId,
                categoryName: cat?.name ?? '',
              }
        )
      );
    },
    [catOptions]
  );

  const handleSharedChange = (patch: Partial<SharedSettings>) => {
    const merged = { ...shared, ...patch };
    setShared(merged);
    syncSharedToRows(merged);
  };

  const reapplyShared = () => {
    touchedRef.current = new Set();
    syncSharedToRows(shared);
    const cat = catOptions.find((c) => c.id === shared.categoryId);
    const usePrefix = shared.naming === 'prefix' && shared.prefix.trim().length > 0;
    const usedSlugs = new Set<string>(products.map((p) => p.slug));
    setItems((prev) => {
      const next = [...prev];
      next.forEach((it, i) => {
        const rawName = usePrefix ? `${shared.prefix.trim()} ${i + 1}` : nameFromFile(selectedImages.find((s) => s.key === it.key)?.file.name ?? '');
        let slug = slugify(rawName) || `bulk-product-${i + 1}`;
        let n = 2;
        while (usedSlugs.has(slug) && n < 50) {
          slug = `${slugify(rawName) || `bulk-product-${i + 1}`}-${n++}`;
        }
        usedSlugs.add(slug);
        next[i] = { ...it, name: rawName, slug, price: Number(shared.price) || it.price, categoryId: shared.categoryId, categoryName: cat?.name ?? '' };
      });
      return next;
    });
  };

  const runAll = async (targets: BulkItem[]) => {
    if (runningRef.current) return;
    runningRef.current = true;
    setStep('running');
    setBusy(true);
    const list = targets.filter((t) => !statuses[t.key] || statuses[t.key]?.status !== 'created');
    if (list.length > 0) {
      let cursor = 0;
      const workers = Array.from(
        { length: Math.min(CONCURRENCY, list.length) },
        async () => {
          while (true) {
            const idx = cursor++;
            if (idx >= list.length) return;
            await createOne(list[idx]);
          }
        }
      );
      await Promise.all(workers);
    }
    setBusy(false);
    runningRef.current = false;
    setStep('done');
  };

  const createOne = async (item: BulkItem) => {
    setStatuses((prev) => ({ ...prev, [item.key]: { status: 'uploading', progress: 0 } }));
    let uploadedPath: string | undefined;
    try {
      const file = selectedImages.find((s) => s.key === item.key)?.file;
      if (!file) throw new Error('Rasm topilmadi');
      const path = buildMediaPath('image', item.productId, file);
      uploadedPath = path;
      const { publicUrl } = await uploadMediaWithProgress({
        bucket: MEDIA_BUCKETS.PRODUCT_IMAGES,
        path,
        file,
        onProgress: (p) =>
          setStatuses((prev) => ({ ...prev, [item.key]: { status: 'uploading', progress: p } })),
      });

      const cat = catOptions.find((c) => c.id === item.categoryId || c.slug === item.categoryId);
      const price = Number(item.price) || 0;
      const originalPrice = shared.originalPrice ? Number(shared.originalPrice) : undefined;
      const product: Product = {
        id: item.productId,
        name: item.name,
        slug: item.slug,
        sku: item.sku,
        description: shared.description.trim() || item.name,
        category: cat?.slug ?? item.categoryId,
        categoryName: cat?.name ?? item.categoryName,
        price,
        originalPrice: originalPrice && originalPrice > price && originalPrice !== price ? originalPrice : undefined,
        currency: 'uzs',
        inStock: shared.inStock,
        stockCount: shared.stockCount ? Number(shared.stockCount) : undefined,
        isNew: false,
        isFeatured: false,
        isOnSale: !!originalPrice && originalPrice > price,
        published: shared.published,
        images: [publicUrl],
        sizes: shared.sizes,
        colors: shared.colors.map((c) => ({ name: c, hex: '#18181b' })),
        tags: shared.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        stockStatus: shared.inStock ? 'mavjud' : 'tugagan',
        details: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await insertBulkProduct(product, cat?.id ?? null);
      setStatuses((prev) => ({ ...prev, [item.key]: { status: 'created', progress: 100 } }));
    } catch (err) {
      if (uploadedPath) {
        try {
          await deleteMediaObjects(MEDIA_BUCKETS.PRODUCT_IMAGES, [uploadedPath]);
        } catch {
          // best-effort cleanup
        }
      }
      try {
        await cleanupBulkProduct(item.productId);
      } catch {
        // best-effort cleanup
      }
      setStatuses((prev) => ({
        ...prev,
        [item.key]: { status: 'failed', progress: 0, error: errorMessage(err) },
      }));
    }
  };

  const retryFailed = () => {
    const failed = items.filter((it) => statuses[it.key]?.status === 'failed');
    if (failed.length > 0) runAll(failed);
  };

  const resetAll = () => {
    selectedImages.forEach((s) => URL.revokeObjectURL(s.previewUrl));
    setSelectedImages([]);
    setItems([]);
    setStatuses({});
    setSelectionError('');
    setShared((prev) => ({ ...prev, price: '', originalPrice: '' }));
    setStep('select');
  };

  const doneCount = items.filter((i) => statuses[i.key]?.status === 'created').length;
  const failedCount = items.filter((i) => statuses[i.key]?.status === 'failed').length;
  const totalCount = items.length;
  const overallPercent =
    totalCount > 0 ? Math.round(((doneCount + failedCount) / totalCount) * 100) : 0;

  const toggleSize = (s: string) =>
    setShared((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(s) ? prev.sizes.filter((x) => x !== s) : [...prev.sizes, s],
    }));
  const toggleColor = (c: string) =>
    setShared((prev) => ({
      ...prev,
      colors: prev.colors.includes(c) ? prev.colors.filter((x) => x !== c) : [...prev.colors, c],
    }));

  const inputCls =
    'w-full px-4 py-2.5 text-sm rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500';
  const labelCls = 'block text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground mb-1.5';
  const cardCls = 'p-6 rounded-3xl bg-card border border-border shadow-xs';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-amber-500" />
            Ommaviy mahsulot yaratish
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Ko\'plab dizaynlarni bitta narx/sozlama bilan alohida mahsulotga aylantirish
          </p>
        </div>
        <Link
          to="/admin/products"
          className="px-3.5 py-2.5 rounded-xl border border-border bg-card text-xs font-bold text-foreground text-foreground hover:bg-muted transition-colors flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          Mahsulotlar ro'yxati
        </Link>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider overflow-x-auto pb-1 w-full">
        {(
          [
            ['select', 'Rasm tanlash'],
            ['settings', 'Sozlamalar'],
            ['review', 'Tekshiruv'],
            ['done', 'Natija'],
          ] as [Step, string][]
        ).map(([s, label], i) => {
          const activeIdx = step === 'running' ? 2 : ['select', 'settings', 'review', 'done'].indexOf(step);
          const idx = ['select', 'settings', 'review', 'done'].indexOf(s);
          const state = idx < activeIdx || step === 'done' ? 'done' : idx === activeIdx ? 'active' : 'todo';
          return (
            <React.Fragment key={s}>
              {i > 0 && <div className="h-px flex-1 min-w-6 bg-muted bg-muted" />}
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border whitespace-nowrap shrink-0 ${
                  state === 'done'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400'
                    : state === 'active'
                    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400'
                    : 'bg-card border-border text-muted-foreground'
                }`}
              >
                {state === 'done' ? <Check className="w-3.5 h-3.5" /> : null}
                <span>{label}</span>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* STEP 1 — Select images */}
      {step === 'select' && (
        <div className={`${cardCls} space-y-4`}>
          <div
            role="button"
            tabIndex={0}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            onDragEnter={(e) => {
              e.preventDefault();
              dragDepth.current += 1;
              setDragging(true);
            }}
            onDragOver={(e) => e.preventDefault()}
            onDragLeave={(e) => {
              e.preventDefault();
              dragDepth.current -= 1;
              if (dragDepth.current <= 0) {
                dragDepth.current = 0;
                setDragging(false);
              }
            }}
            onDrop={handleDrop}
            className={`rounded-2xl border-2 border-dashed p-10 text-center cursor-pointer transition-colors ${
              dragging
                ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/30'
                : 'border-border hover:border-amber-400 bg-muted/60 bg-muted/40'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={(e) => {
                addFiles(e.target.files ?? []);
                e.target.value = '';
              }}
            />
            <ImagePlus className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm font-black text-foreground text-foreground">
              {dragging ? 'Rasmlarni qo\'yib yuboring' : 'Rasmlarni shu yerga tashlang yoki tanlang'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              JPG, PNG yoki WebP — har bir rasm maks. 5 MB. Har bir rasm alohida mahsulotga aylanadi.
            </p>
          </div>

          {selectionError && (
            <div className="flex items-start gap-2 text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200/60 dark:border-red-800/60 rounded-xl px-3.5 py-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{selectionError}</span>
            </div>
          )}

          {selectedImages.length > 0 && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {selectedImages.map((img) => (
                  <div
                    key={img.key}
                    className="group relative rounded-xl overflow-hidden border border-border bg-muted aspect-square"
                  >
                    <img
                      src={img.previewUrl}
                      alt={img.file.name}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      aria-label={`${img.file.name} o'chirish`}
                      onClick={() => removeImage(img.key)}
                      className="absolute top-1.5 right-1.5 w-7 h-7 rounded-lg bg-black/60 hover:bg-red-600 text-white flex items-center justify-center"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-0 inset-x-0 px-2 py-1 bg-gradient-to-t from-black/80 to-transparent">
                      <p className="text-[10px] font-bold text-white truncate">{img.file.name}</p>
                      <p className="text-[9px] text-white/70">{(img.file.size / 1024).toFixed(0)} KB</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <p className="text-xs font-bold text-muted-foreground">
                  {selectedImages.length} ta rasm tanlandi
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-2.5 rounded-xl border border-border bg-card text-xs font-bold text-foreground text-foreground hover:bg-muted transition-colors flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    Yana rasm qo\'shish
                  </button>
                  <button
                    type="button"
                    onClick={goToSettings}
                    className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-background text-xs font-extrabold shadow-sm transition-all active:scale-95 flex items-center gap-1.5"
                  >
                    Davom etish
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* STEP 2 — shared settings + per-item overrides */}
      {step === 'settings' && (
        <div className="space-y-5">
          {/* Shared settings */}
          <div className={`${cardCls} space-y-4`}>
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-black text-foreground">
                Umumiy sozlamalar (barcha mahsulotlarga qo'llanadi)
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className={labelCls}>Kategoriya</label>
                <select
                  className={inputCls}
                  value={shared.categoryId}
                  onChange={(e) => handleSharedChange({ categoryId: e.target.value })}
                >
                  <option value="">Kategoriya tanlang</option>
                  {catOptions.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Narx (so'm)</label>
                <div className="relative">
                  <Banknote className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    className={`${inputCls} pl-9`}
                    value={shared.price}
                    onChange={(e) => handleSharedChange({ price: e.target.value })}
                    placeholder="120000"
                  />
                </div>
              </div>
              <div>
                <label className={labelCls}>Eski narx (chegirma, ixtiyoriy)</label>
                <input
                  type="number"
                  min={0}
                  step={1000}
                  className={inputCls}
                  value={shared.originalPrice}
                  onChange={(e) => setShared((p) => ({ ...p, originalPrice: e.target.value }))}
                  placeholder="Masalan 150000"
                />
              </div>
              <div>
                <label className={labelCls}>Soni (ixtiyoriy)</label>
                <input
                  type="number"
                  min={0}
                  className={inputCls}
                  value={shared.stockCount}
                  onChange={(e) => setShared((p) => ({ ...p, stockCount: e.target.value }))}
                  placeholder="Masalan 10"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className={labelCls}>Nomi</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-bold text-foreground">
                    <input
                      type="radio"
                      checked={shared.naming === 'filename'}
                      onChange={() => setShared((p) => ({ ...p, naming: 'filename' }))}
                      className="accent-amber-500"
                    />
                    Fayl nomidan (black-shirt → Black Shirt)
                  </label>
                  <label className="flex items-center gap-2 text-xs font-bold text-foreground">
                    <input
                      type="radio"
                      checked={shared.naming === 'prefix'}
                      onChange={() => setShared((p) => ({ ...p, naming: 'prefix' }))}
                      className="accent-amber-500"
                    />
                    Prefiks + raqam (Yozgi ko'ylak 1, 2, 3…)
                  </label>
                  {shared.naming === 'prefix' && (
                    <input
                      className={inputCls}
                      value={shared.prefix}
                      onChange={(e) => setShared((p) => ({ ...p, prefix: e.target.value }))}
                      placeholder="Yozgi ko'ylak"
                    />
                  )}
                </div>
                <div>
                  <label className={labelCls}>Teglar (vergul bilan)</label>
                  <input
                    className={inputCls}
                    value={shared.tags}
                    onChange={(e) => setShared((p) => ({ ...p, tags: e.target.value }))}
                    placeholder="ko'ylak, yozgi, toza"
                  />
                </div>
                <div>
                  <label className={labelCls}>Tavsif (ixtiyoriy)</label>
                  <textarea
                    className={`${inputCls} min-h-20`}
                    value={shared.description}
                    onChange={(e) => setShared((p) => ({ ...p, description: e.target.value }))}
                    placeholder="Barcha mahsulotlarga qo'shiladigan qisqa tavsif"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={labelCls}>O'lchamlar</label>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_SIZES.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggleSize(s)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                          shared.sizes.includes(s)
                            ? 'bg-amber-500 border-amber-500 text-background'
                            : 'bg-card border-border text-foreground hover:border-amber-400'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Ranglar</label>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => toggleColor(c)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                          shared.colors.includes(c)
                            ? 'bg-amber-500 border-amber-500 text-background'
                            : 'bg-card border-border text-foreground hover:border-amber-400'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Holat</label>
                    <label className="flex items-center gap-2 text-xs font-bold text-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        checked={shared.inStock}
                        onChange={(e) => setShared((p) => ({ ...p, inStock: e.target.checked }))}
                        className="accent-amber-500"
                      />
                      Do'konda mavjud
                    </label>
                  </div>
                  <div>
                    <label className={labelCls}>Nashr</label>
                    <label className="flex items-center gap-2 text-xs font-bold text-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        checked={shared.published}
                        onChange={(e) => setShared((p) => ({ ...p, published: e.target.checked }))}
                        className="accent-amber-500"
                      />
                      Darhol ko'rinishda
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={reapplyShared}
                className="px-3.5 py-2 rounded-xl border border-border bg-card text-xs font-bold text-foreground text-foreground hover:bg-muted transition-colors flex items-center gap-1.5"
              >
                <RefreshCcw className="w-3.5 h-3.5" />
                Umumiy qiymatlarni yana qo'llash
              </button>
              <span className="text-[11px] text-muted-foreground">
                Ogohlantirish: bu barcha qatorlardagi nom/narx/kategoriyani qayta to'ldiradi.
              </span>
            </div>
          </div>

          {/* Per-item overrides */}
          <div className={`${cardCls} space-y-3`}>
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-black text-foreground">
                Alohida mahsulotlar ({items.length} ta)
              </h3>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Har bir rasm uchun nom, narx va kategoriyani alohida o'zgartirishingiz mumkin.
            </p>
            <div className="space-y-2">
              {items.map((it) => {
                const img = selectedImages.find((s) => s.key === it.key);
                return (
                  <div
                    key={it.key}
                    className="grid grid-cols-1 sm:grid-cols-[64px_1fr] lg:grid-cols-[64px_1fr_140px_140px] items-center gap-3 p-3 rounded-xl bg-muted bg-muted/60 border border-border"
                  >
                    <img
                      src={img?.previewUrl}
                      alt={it.name}
                      className="w-16 h-16 rounded-lg object-cover border border-border"
                    />
                    <input
                      className={`${inputCls} text-xs`}
                      value={it.name}
                      onChange={(e) => updateItem(it.key, { name: e.target.value })}
                      aria-label="Mahsulot nomi"
                    />
                    <input
                      type="number"
                      min={0}
                      step={1000}
                      className={`${inputCls} text-xs`}
                      value={it.price || ''}
                      onChange={(e) => updateItem(it.key, { price: Number(e.target.value) })}
                      aria-label="Narx"
                      placeholder="Narx"
                    />
                    <select
                      className={`${inputCls} text-xs`}
                      value={it.categoryId}
                      onChange={(e) =>
                        updateItem(it.key, {
                          categoryId: e.target.value,
                          categoryName: catOptions.find((c) => c.id === e.target.value)?.name ?? '',
                        })
                      }
                      aria-label="Kategoriya"
                    >
                      <option value="">Kategoriya</option>
                      {catOptions.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between gap-3 pt-2 flex-wrap">
              <Link
                to="/admin/products"
                className="px-3.5 py-2.5 rounded-xl border border-border bg-card text-xs font-bold text-foreground text-foreground hover:bg-muted transition-colors flex items-center gap-1.5"
              >
                <X className="w-4 h-4" />
                Bekor qilish
              </Link>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStep('select')}
                  className="px-3.5 py-2.5 rounded-xl border border-border bg-card text-xs font-bold text-foreground text-foreground hover:bg-muted transition-colors flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Ortga
                </button>
                <button
                  type="button"
                  onClick={() => setStep('review')}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-background text-xs font-extrabold shadow-sm transition-all active:scale-95 flex items-center gap-1.5"
                >
                  Tekshiruvga o'tish
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3 — review */}
      {step === 'review' && (
        <div className={`${cardCls} space-y-4`}>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h3 className="text-sm font-black text-foreground">
              {items.length} ta mahsulot yaratishga tayyor
            </h3>
            <span className="text-xs font-extrabold text-amber-600">
              Umumiy: {formatPrice(items.reduce((sum, it) => sum + (Number(it.price) || 0), 0))}
            </span>
          </div>

          {(() => {
            const unpriced = items.filter((it) => !(Number(it.price) > 0)).length;
            return unpriced > 0 ? (
              <div className="flex items-start gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/60 rounded-xl px-3.5 py-2.5">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{unpriced} ta mahsulotda narx kiritilmagan. Yaratishdan oldin narxni to'ldiring.</span>
              </div>
            ) : null;
          })()}

          <div className="max-h-96 overflow-y-auto space-y-2 pr-1">
            {items.map((it, i) => {
              const img = selectedImages.find((s) => s.key === it.key);
              const cat = catOptions.find((c) => c.id === it.categoryId);
              return (
                <div
                  key={it.key}
                  className="flex items-center gap-3 p-3 rounded-xl bg-muted bg-muted/60 border border-border"
                >
                  <span className="text-xs font-black text-muted-foreground w-5">{i + 1}.</span>
                  <img
                    src={img?.previewUrl}
                    alt={it.name}
                    className="w-12 h-12 rounded-lg object-cover border border-border"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-foreground truncate">{it.name}</p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {img?.file.name} · {cat?.name ?? 'Kategoriyasiz'}
                    </p>
                  </div>
                  <span className="text-xs font-black text-foreground whitespace-nowrap">
                    {formatPrice(Number(it.price) || 0)}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            {shared.description && (
              <p className="text-[11px] text-muted-foreground max-w-md truncate">
                Tavsif: {shared.description}
              </p>
            )}
            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={() => setStep('settings')}
                className="px-3.5 py-2.5 rounded-xl border border-border bg-card text-xs font-bold text-foreground text-foreground hover:bg-muted transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                Ortga
              </button>
              <button
                type="button"
                onClick={() => runAll(items)}
                disabled={items.some((it) => !(Number(it.price) > 0)) || busy}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-background text-xs font-extrabold shadow-sm transition-all active:scale-95 flex items-center gap-1.5 disabled:opacity-40 disabled:pointer-events-none"
              >
                <Layers className="w-4 h-4" />
                Barchasini yaratish ({items.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4 — running */}
      {step === 'running' && (
        <div className={`${cardCls} space-y-5`}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
              <h3 className="text-sm font-black text-foreground">
                Mahsulotlar yaratilmoqda...
              </h3>
            </div>
            <span className="text-sm font-black text-amber-600">
              {doneCount + failedCount} / {totalCount} · {overallPercent}%
            </span>
          </div>
          <div className="h-2.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-amber-500 transition-all duration-300"
              style={{ width: `${overallPercent}%` }}
            />
          </div>
          <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
            {items.map((it) => {
              const st = statuses[it.key] ?? { status: 'pending', progress: 0 };
              return (
                <div
                  key={it.key}
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-muted bg-muted/60 border border-border"
                >
                  {st.status === 'created' && <Check className="w-4 h-4 text-emerald-500 shrink-0" />}
                  {st.status === 'failed' && <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />}
                  {(st.status === 'uploading' || st.status === 'pending') && (
                    <Loader2
                      className={`w-4 h-4 text-amber-500 shrink-0 ${st.status === 'uploading' ? 'animate-spin' : ''}`}
                    />
                  )}
                  <span className="text-xs font-bold text-foreground text-foreground truncate flex-1">
                    {it.name}
                  </span>
                  {st.status === 'created' && (
                    <span className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400">Yaratildi</span>
                  )}
                  {st.status === 'failed' && (
                    <span className="text-[11px] font-extrabold text-red-500 truncate max-w-48" title={st.error}>
                      Xato: {st.error}
                    </span>
                  )}
                  {st.status === 'uploading' && (
                    <span className="text-[11px] font-extrabold text-amber-600">{st.progress}%</span>
                  )}
                  {st.status === 'pending' && (
                    <span className="text-[11px] font-bold text-muted-foreground">Navbatda</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 5 — done */}
      {step === 'done' && (
        <div className={`${cardCls} space-y-5`}>
          <div className="flex items-center gap-3">
            {failedCount === 0 ? (
              <Check className="w-8 h-8 text-emerald-500" />
            ) : (
              <AlertTriangle className="w-8 h-8 text-amber-500" />
            )}
            <div>
              <h3 className="text-base font-black text-foreground">
                {failedCount === 0 ? 'Barcha mahsulotlar yaratildi!' : 'Jarayon yakunlandi'}
              </h3>
              <p className="text-xs text-muted-foreground">
                {doneCount} ta muvaffaqiyatli
                {failedCount > 0 ? `, ${failedCount} ta xatolik bilan` : ''}
              </p>
            </div>
          </div>

          {doneCount > 0 && (
            <div className="flex flex-wrap gap-2">
              <Link
                to="/admin/products"
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-background text-xs font-extrabold shadow-sm transition-all active:scale-95 flex items-center gap-1.5"
              >
                Mahsulotlarni ko'rish
              </Link>
              <button
                type="button"
                onClick={() => window.open('/', '_blank')}
                className="px-4 py-2.5 rounded-xl border border-border bg-card text-xs font-bold text-foreground text-foreground hover:bg-muted transition-colors"
              >
                Saytni oyna ochish
              </button>
            </div>
          )}

          {failedCount > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                Xatoliklar ({failedCount})
              </h4>
              {items
                .filter((it) => statuses[it.key]?.status === 'failed')
                .map((it) => (
                  <div
                    key={it.key}
                    className="flex items-center gap-3 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200/60 dark:border-red-800/60"
                  >
                    <img
                      src={selectedImages.find((s) => s.key === it.key)?.previewUrl}
                      alt={it.name}
                      className="w-10 h-10 rounded-lg object-cover border border-red-200 dark:border-red-800"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-red-700 dark:text-red-300 truncate">{it.name}</p>
                      <p className="text-[11px] text-red-500 dark:text-red-400 truncate">
                        {statuses[it.key]?.error}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => createOne(it)}
                      disabled={busy}
                      className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-[11px] font-black disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <RefreshCcw className="w-3.5 h-3.5" />
                      Qayta urinish
                    </button>
                  </div>
                ))}
              <button
                type="button"
                onClick={retryFailed}
                disabled={busy}
                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-extrabold disabled:opacity-50 flex items-center gap-1.5"
              >
                <RefreshCcw className="w-4 h-4" />
                Barcha xatolarni qayta urinish
              </button>
            </div>
          )}

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={resetAll}
              className="px-3.5 py-2.5 rounded-xl border border-border bg-card text-xs font-bold text-foreground text-foreground hover:bg-muted transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Yana yaratish
            </button>
          </div>
        </div>
      )}
    </div>
  );
}