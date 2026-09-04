import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Check,
  Star,
  Sparkle,
  Percent,
  Eye,
  Plus,
  X,
  Boxes,
  HelpCircle,
  Tag,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { ImageUploader } from '../../components/admin/ImageUploader';
import { VideoUploader } from '../../components/admin/VideoUploader';
import { deleteMediaObjects, MEDIA_BUCKETS } from '../../lib/supabase/storage';
import { Product } from '../../types/product';

const PRESET_SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '38', '39', '40', '41', '42', '43', '44', '45', 'Standart'];
const PRESET_COLORS = ['Qora', 'Oq', 'To\'q ko\'k', 'Kulrang', 'Jigarrang', 'Havorang', 'Bej', 'Yashil', 'Qizil', 'Xaki', 'Bordo'];

export const ProductEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, categories, addProduct, updateProduct } = useStore();

  const isNew = !id || id === 'new';
  const existingProduct = !isNew ? products.find((p) => p.id === id) : undefined;

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [sku, setSku] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [originalPrice, setOriginalPrice] = useState<number | undefined>(undefined);
  const [inStock, setInStock] = useState(true);
  const [stockCount, setStockCount] = useState<number>(10);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isNewBadge, setIsNewBadge] = useState(false);
  const [published, setPublished] = useState(true);
  const [images, setImages] = useState<string[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);
  const [customSize, setCustomSize] = useState('');
  const [colors, setColors] = useState<string[]>([]);
  const [customColor, setCustomColor] = useState('');
  const [material, setMaterial] = useState('');
  const [madeIn, setMadeIn] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Stable storage scope for media. New products get an id up-front so uploads
  // land under products/{id}/...; addProduct is told to reuse this id.
  const createScopeId = useRef(`prod-${Date.now()}`).current;
  const storageScope = existingProduct ? existingProduct.id : createScopeId;

  // Track uploaded objects this session for orphan cleanup if the admin
  // navigates away without saving (DB save would otherwise orphan them).
  const pendingUploadsRef = useRef<{ bucket: string; path: string }[]>([]);
  const savedRef = useRef(false);

  const recordUploaded = (media: { bucket: string; path: string }) => {
    pendingUploadsRef.current.push(media);
  };

  // Product video (optional)
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [videoPosterUrl, setVideoPosterUrl] = useState<string>('');

  useEffect(() => {
    return () => {
      if (!savedRef.current) {
        const pending = pendingUploadsRef.current.splice(0, pendingUploadsRef.current.length);
        for (const item of pending) {
          void deleteMediaObjects(item.bucket, [item.path]);
        }
      }
    };
  }, []);

  // Initialize data
  useEffect(() => {
    if (existingProduct) {
      setName(existingProduct.name);
      setSlug(existingProduct.slug || '');
      setSku(existingProduct.sku || '');
      setDescription(existingProduct.description || '');
      setCategory(existingProduct.category);
      setSubcategory(existingProduct.subcategory || '');
      setPrice(existingProduct.price || 0);
      setOriginalPrice(existingProduct.originalPrice);
      setInStock(existingProduct.inStock !== false);
      setStockCount(existingProduct.stockCount ?? 10);
      setIsFeatured(!!existingProduct.isFeatured);
      setIsNewBadge(!!existingProduct.isNew);
      setPublished(existingProduct.published !== false);
      setImages(existingProduct.images || []);
      setVideoUrl(existingProduct.videoUrl || '');
      setVideoPosterUrl(existingProduct.videoPosterUrl || '');
      setSizes(existingProduct.sizes || []);
      setColors((existingProduct.colors || []).map((c) => (typeof c === 'string' ? c : c.name)));
      setMaterial(existingProduct.material || '');
      setMadeIn(existingProduct.madeIn || '');
      setTags(existingProduct.tags || []);
    } else if (isNew) {
      // Defaults for brand new product
      if (categories.length > 0) {
        setCategory(categories[0].id);
      }
      setSku(`CLO-${Math.floor(1000 + Math.random() * 9000)}`);
      setSizes(['M', 'L', 'XL']);
      setColors(['Qora', 'To\'q ko\'k']);
      setMaterial('100% Paxta (Cotton)');
      setMadeIn('O\'zbekiston');
    }
  }, [existingProduct, isNew, categories]);

  // Auto-generate slug when name changes for new products
  const handleNameChange = (val: string) => {
    setName(val);
    if (isNew || !slug) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      setSlug(generated);
    }
  };

  const handleToggleSize = (s: string) => {
    if (sizes.includes(s)) {
      setSizes(sizes.filter((item) => item !== s));
    } else {
      setSizes([...sizes, s]);
    }
  };

  const handleAddCustomSize = () => {
    if (customSize.trim() && !sizes.includes(customSize.trim())) {
      setSizes([...sizes, customSize.trim()]);
      setCustomSize('');
    }
  };

  const handleToggleColor = (c: string) => {
    if (colors.includes(c)) {
      setColors(colors.filter((item) => item !== c));
    } else {
      setColors([...colors, c]);
    }
  };

  const handleAddCustomColor = () => {
    if (customColor.trim() && !colors.includes(customColor.trim())) {
      setColors([...colors, customColor.trim()]);
      setCustomColor('');
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim().toLowerCase())) {
      setTags([...tags, tagInput.trim().toLowerCase()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (t: string) => {
    setTags(tags.filter((item) => item !== t));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage("Mahsulot nomini kiritish shart.");
      return;
    }
    if (price <= 0) {
      setErrorMessage("Iltimos, haqiqiy narxni kiriting.");
      return;
    }

    const currentCatObj = categories.find((c) => c.id === category || c.slug === category);
    const categoryName = currentCatObj ? currentCatObj.name : category;

    const payload: Omit<Product, 'id'> = {
      name: name.trim(),
      slug: slug.trim() || name.toLowerCase().replace(/\s+/g, '-'),
      sku: sku.trim() || `SKU-${Date.now()}`,
      description: description.trim() || name,
      category,
      categoryName,
      subcategory: subcategory.trim() || undefined,
      price: Number(price),
      originalPrice: originalPrice && originalPrice > price ? Number(originalPrice) : undefined,
      inStock,
      stockCount: Number(stockCount),
      isFeatured,
      isNew: isNewBadge,
      published,
      details: existingProduct ? existingProduct.details : [],
      images,
      sizes,
      colors: colors.map((c) => ({ name: c, hex: '#18181b' })),
      material: material.trim() || undefined,
      madeIn: madeIn.trim() || undefined,
      tags,
      videoUrl: videoUrl.trim() || undefined,
      videoPosterUrl: videoPosterUrl.trim() || undefined,
    };

    if (isNew) {
      const created = addProduct(payload, storageScope);
      savedRef.current = true;
      pendingUploadsRef.current = [];
      setSavedSuccess(true);
      setTimeout(() => {
        navigate(`/admin/products/${created.id}`);
      }, 700);
    } else if (id) {
      updateProduct(id, payload);
      savedRef.current = true;
      pendingUploadsRef.current = [];
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-16 z-20 bg-neutral-100/90 dark:bg-neutral-950/90 backdrop-blur-md py-3 -mx-4 px-4 sm:-mx-6 sm:px-6">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/products"
            className="p-2 rounded-xl bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white border border-neutral-200 dark:border-neutral-700 transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-neutral-900 dark:text-white tracking-tight">
              {isNew ? 'Yangi Mahsulot Qo\'shish' : 'Mahsulotni Tahrirlash'}
            </h2>
            <p className="text-xs text-neutral-500">
              {isNew ? 'Do\'kon katalogiga yangi kiyim yoki poyabzal kiriting' : `ID: ${id}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {!isNew && existingProduct && (
            <a
              href={`/products/${existingProduct.id}`}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-bold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 transition-colors flex items-center gap-1.5"
            >
              <Eye className="w-4 h-4" />
              <span>Saytda ko'rish</span>
            </a>
          )}

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-black shadow-md transition-all active:scale-95 flex items-center gap-2"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4 stroke-[3] text-emerald-950" />
                <span>Saqlandi!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{isNew ? 'Mahsulotni yaratish' : 'O\'zgarishlarni saqlash'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-100 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 text-xs font-bold">
          {errorMessage}
        </div>
      )}

      {/* Main Grid: Form Sections (2 cols) & Preview/Status Sidebar (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Main Product Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card: Basic Information */}
          <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 shadow-xs space-y-5">
            <h3 className="text-sm font-extrabold text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-500" />
              <span>Asosiy Ma'lumotlar</span>
            </h3>

            {/* Product Name */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                Mahsulot Nomi <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Masalan: Erkaklar Premium Klassik Kostyum-Shim"
                className="w-full px-4 py-2.5 text-sm rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-medium"
              />
            </div>

            {/* Slug & SKU */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  URL Havola (Slug)
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="erkaklar-klassik-kostyum-shim"
                  className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Artikul / SKU Kodi
                </label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="CLO-2024"
                  className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Category & Subcategory */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Asosiy Kategoriya <span className="text-red-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-semibold"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Ichki Kategoriya / Turi
                </label>
                <input
                  type="text"
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                  placeholder="Masalan: Kostyum, Futbolka, Krossovka, Ko'ylak"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                Batafsil Tavsif va Xususiyatlar
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mahsulot haqida to'liq ma'lumot, matosi, qulayliklari va kiyilish uslubi..."
                className="w-full px-4 py-3 text-xs leading-relaxed rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-medium"
              />
            </div>
          </div>

          {/* Card: Images */}
          <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 shadow-xs space-y-6">
            <ImageUploader
              images={images}
              onChange={setImages}
              maxImages={8}
              label="Mahsulot Rasmlari"
              helperText="Kompyuterdan fayllarni tanlang — birinchi rasm asosiy rasm sifatida ko'rsatiladi (JPG, PNG, WebP; 5 MB gacha)."
              scope={storageScope}
              onUploaded={recordUploaded}
            />

            <div className="pt-5 border-t border-neutral-100 dark:border-neutral-800">
              <VideoUploader
                value={videoUrl || undefined}
                onChange={(url) => setVideoUrl(url || '')}
                poster={videoPosterUrl || undefined}
                onPosterChange={(url) => setVideoPosterUrl(url || '')}
                bucket={MEDIA_BUCKETS.PRODUCT_IMAGES}
                scope={storageScope}
                label="Mahsulot Videosi (ixtiyoriy)"
                helperText="Mahsulot katalog kartasida videoli ko'rsatiladi. MP4 yoki WebM faylni yuklang (100 MB gacha)."
                onUploaded={recordUploaded}
              />
            </div>
          </div>

          {/* Card: Pricing & Stock */}
          <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 shadow-xs space-y-5">
            <h3 className="text-sm font-extrabold text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Percent className="w-4 h-4 text-amber-500" />
              <span>Narx va Zaxira Sozlamalari</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Current Price */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Sotuv Narxi (so'm) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    min={0}
                    step={1000}
                    value={price || ''}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    placeholder="250000"
                    className="w-full px-4 py-2.5 text-sm font-extrabold rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs font-bold text-neutral-400 pointer-events-none">
                    so'm
                  </span>
                </div>
              </div>

              {/* Original Price (for Discount) */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Asl Narxi / Eski Narx (Chegirma uchun)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    value={originalPrice || ''}
                    onChange={(e) => setOriginalPrice(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="320000 (ixtiyoriy)"
                    className="w-full px-4 py-2.5 text-sm rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-medium"
                  />
                  <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs font-bold text-neutral-400 pointer-events-none">
                    so'm
                  </span>
                </div>
              </div>
            </div>

            {/* Discount Percentage Badge Preview */}
            {originalPrice && originalPrice > price && (
              <div className="p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900/50 flex items-center justify-between text-xs">
                <span className="font-bold text-teal-800 dark:text-teal-300">
                  Chegirma miqdori: -{Math.round(((originalPrice - price) / originalPrice) * 100)}%
                </span>
                <span className="text-teal-700 dark:text-teal-400 font-medium">
                  Mijoz {(originalPrice - price).toLocaleString('uz-UZ')} so'm tejaydi
                </span>
              </div>
            )}

            {/* Stock Count & InStock Toggle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                <div>
                  <span className="block text-xs font-extrabold text-neutral-900 dark:text-white">
                    Zaxirada Mavjud
                  </span>
                  <span className="text-[11px] text-neutral-500">
                    Mijozlar buyurtma bera oladi
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={inStock}
                  onChange={(e) => setInStock(e.target.checked)}
                  className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Qoldiq Soni (Dona)
                </label>
                <input
                  type="number"
                  min={0}
                  value={stockCount}
                  onChange={(e) => setStockCount(Number(e.target.value))}
                  placeholder="10"
                  className="w-full px-4 py-2.5 text-xs font-bold rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Card: Variants (Sizes, Colors, Material) */}
          <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 shadow-xs space-y-6">
            <h3 className="text-sm font-extrabold text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Tag className="w-4 h-4 text-amber-500" />
              <span>O'lchamlar, Ranglar va Mato</span>
            </h3>

            {/* Sizes */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-2">
                Mavjud O'lchamlar (Razmerlar)
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {PRESET_SIZES.map((sz) => {
                  const active = sizes.includes(sz);
                  return (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => handleToggleSize(sz)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        active
                          ? 'bg-amber-500 text-neutral-950 shadow-xs'
                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200'
                      }`}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>

              {/* Custom Size input */}
              <div className="flex items-center gap-2 max-w-xs">
                <input
                  type="text"
                  value={customSize}
                  onChange={(e) => setCustomSize(e.target.value)}
                  placeholder="Boshqa o'lcham (masalan, 46)"
                  className="px-3 py-1.5 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomSize();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddCustomSize}
                  className="px-3 py-1.5 rounded-xl bg-neutral-800 text-white text-xs font-bold hover:bg-neutral-700"
                >
                  + Qo'shish
                </button>
              </div>
            </div>

            {/* Colors */}
            <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800">
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-2">
                Mavjud Ranglar
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {PRESET_COLORS.map((clr) => {
                  const active = colors.includes(clr);
                  return (
                    <button
                      key={clr}
                      type="button"
                      onClick={() => handleToggleColor(clr)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        active
                          ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200'
                      }`}
                    >
                      {clr}
                    </button>
                  );
                })}
              </div>

              {/* Custom Color */}
              <div className="flex items-center gap-2 max-w-xs">
                <input
                  type="text"
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  placeholder="Boshqa rang (masalan, Qaymoqrang)"
                  className="px-3 py-1.5 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomColor();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddCustomColor}
                  className="px-3 py-1.5 rounded-xl bg-neutral-800 text-white text-xs font-bold hover:bg-neutral-700"
                >
                  + Qo'shish
                </button>
              </div>
            </div>

            {/* Material & Country of Origin */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Mato Tarkibi / Material
                </label>
                <input
                  type="text"
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  placeholder="100% Paxta, jun va elastan"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Ishlab Chiqarilgan Davlat
                </label>
                <input
                  type="text"
                  value={madeIn}
                  onChange={(e) => setMadeIn(e.target.value)}
                  placeholder="O'zbekiston, Turkiya, Italiya"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Column: Visibility, Badges & Live Mini Preview */}
        <div className="space-y-6">
          {/* Card: Status & Badges */}
          <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 shadow-xs space-y-4">
            <h3 className="text-sm font-extrabold text-neutral-900 dark:text-white uppercase tracking-wider">
              Ko'rinish va Belgilar
            </h3>

            {/* Published Switch */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
              <div>
                <span className="block text-xs font-extrabold text-neutral-900 dark:text-white">
                  Saytda Nashr Qilish
                </span>
                <span className="text-[11px] text-neutral-500">
                  {published ? 'Mijozlarga ko\'rinadi' : 'Qoralama holatida yashirin'}
                </span>
              </div>
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
              />
            </div>

            {/* Featured Switch */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500 text-neutral-950">
                  <Star className="w-4 h-4 fill-current" />
                </div>
                <div>
                  <span className="block text-xs font-extrabold text-neutral-900 dark:text-white">
                    Mashhur Mahsulot
                  </span>
                  <span className="text-[11px] text-neutral-500">
                    Bosh sahifada ko'rsatish
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
              />
            </div>

            {/* New Badge Switch */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-500 text-white">
                  <Sparkle className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-xs font-extrabold text-neutral-900 dark:text-white">
                    Yangi Kolleksiya
                  </span>
                  <span className="text-[11px] text-neutral-500">
                    "Yangi" belgisi qo'yiladi
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isNewBadge}
                onChange={(e) => setIsNewBadge(e.target.checked)}
                className="w-5 h-5 accent-rose-500 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Card: Search Tags */}
          <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 shadow-xs space-y-3">
            <h3 className="text-sm font-extrabold text-neutral-900 dark:text-white uppercase tracking-wider">
              Teglar va Kalit So'zlar
            </h3>
            <p className="text-xs text-neutral-500">
              Mijozlar qidirganda tez topilishi uchun kalit so'zlar kiriting.
            </p>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="masalan: to'y, yozgi, klassika"
                className="flex-1 px-3 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-2 rounded-xl bg-neutral-900 text-white text-xs font-bold hover:bg-neutral-800"
              >
                Qo'shish
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-2">
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-xs font-medium text-neutral-700 dark:text-neutral-300"
                >
                  <span>#{t}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(t)}
                    className="text-neutral-400 hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Mini Public Card Preview */}
          <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
              Jonli Kartochka Ko'rinishi
            </h3>

            <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden bg-white dark:bg-neutral-900 shadow-sm">
              <div className="relative aspect-4/3 bg-neutral-100 dark:bg-neutral-800">
                {images[0] ? (
                  <img
                    src={images[0]}
                    alt=""
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Boxes className="w-8 h-8 text-neutral-300 dark:text-neutral-600" />
                  </div>
                )}
                <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                  {isFeatured && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500 text-neutral-950 text-[10px] font-extrabold">
                      Mashhur
                    </span>
                  )}
                  {isNewBadge && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-extrabold">
                      Yangi
                    </span>
                  )}
                </div>
              </div>

              <div className="p-4 space-y-1.5">
                <span className="text-[10px] font-bold text-neutral-400 uppercase">
                  {subcategory || category}
                </span>
                <h4 className="text-xs font-bold text-neutral-900 dark:text-white line-clamp-1">
                  {name || 'Mahsulot nomi kiritilmagan'}
                </h4>
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-extrabold text-neutral-900 dark:text-white">
                    {(price || 0).toLocaleString('uz-UZ')} so'm
                  </span>
                  {originalPrice && originalPrice > price && (
                    <span className="text-[11px] text-neutral-400 line-through">
                      {originalPrice.toLocaleString('uz-UZ')} so'm
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};
