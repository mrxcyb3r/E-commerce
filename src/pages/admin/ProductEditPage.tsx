import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Check,
  Star,
  Sparkle,
  Eye,
  X,
  Boxes,
  Tag,
  Layers,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { ImageUploader } from '../../components/admin/ImageUploader';
import { VideoUploader } from '../../components/admin/VideoUploader';
import { deleteMediaObjects, MEDIA_BUCKETS } from '../../lib/supabase/storage';
import { Product } from '../../types/product';

const PRESET_SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '38', '39', '40', '41', '42', '43', '44', '45', 'Standart'];
const PRESET_COLORS = ['Qora', 'Oq', "To'q ko'k", 'Kulrang', 'Jigarrang', 'Havorang', 'Bej', 'Yashil', 'Qizil', 'Xaki', 'Bordo'];

export const ProductEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, categories, addProduct, updateProduct } = useStore();

  const isNew = !id || id === 'new';
  const existingProduct = !isNew ? products.find((p) => p.id === id) : undefined;

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

  const createScopeId = useRef(`prod-${Date.now()}`).current;
  const storageScope = existingProduct ? existingProduct.id : createScopeId;
  const pendingUploadsRef = useRef<{ bucket: string; path: string }[]>([]);
  const savedRef = useRef(false);

  const recordUploaded = (media: { bucket: string; path: string }) => {
    pendingUploadsRef.current.push(media);
  };

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
      if (categories.length > 0) setCategory(categories[0].id);
      setSku(`CLO-${Math.floor(1000 + Math.random() * 9000)}`);
      setSizes(['M', 'L', 'XL']);
      setColors(["Qora", "To'q ko'k"]);
      setMaterial('100% Paxta (Cotton)');
      setMadeIn("O'zbekiston");
    }
  }, [existingProduct, isNew, categories]);

  const handleNameChange = (val: string) => {
    setName(val);
    if (isNew || !slug) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-'));
    }
  };

  const handleToggleSize = (s: string) => setSizes(sizes.includes(s) ? sizes.filter((item) => item !== s) : [...sizes, s]);
  const handleAddCustomSize = () => { if (customSize.trim() && !sizes.includes(customSize.trim())) { setSizes([...sizes, customSize.trim()]); setCustomSize(''); } };
  const handleToggleColor = (c: string) => setColors(colors.includes(c) ? colors.filter((item) => item !== c) : [...colors, c]);
  const handleAddCustomColor = () => { if (customColor.trim() && !colors.includes(customColor.trim())) { setColors([...colors, customColor.trim()]); setCustomColor(''); } };
  const handleAddTag = () => { if (tagInput.trim() && !tags.includes(tagInput.trim().toLowerCase())) { setTags([...tags, tagInput.trim().toLowerCase()]); setTagInput(''); } };
  const handleRemoveTag = (t: string) => setTags(tags.filter((item) => item !== t));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setErrorMessage("Mahsulot nomini kiritish shart."); return; }
    if (price <= 0) { setErrorMessage("Iltimos, haqiqiy narxni kiriting."); return; }

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
      setTimeout(() => navigate(`/admin/products/${created.id}`), 700);
    } else if (id) {
      updateProduct(id, payload);
      savedRef.current = true;
      pendingUploadsRef.current = [];
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Sticky Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sticky top-14 z-20 bg-background/90 backdrop-blur-xl py-3 -mx-4 px-4 sm:-mx-6 sm:px-6 border-b border-border/50">
        <div className="flex items-center gap-3">
          <Link to="/admin/products" className="p-1.5 rounded-lg bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-sm font-semibold text-foreground">
              {isNew ? "Yangi mahsulot" : "Mahsulotni tahrirlash"}
            </h1>
            <p className="text-[10px] text-muted-foreground">{isNew ? "Do'kon katalogiga yangi mahsulot qo'shish" : `ID: ${id}`}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isNew && existingProduct && (
            <a href={`/products/${existingProduct.id}`} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-lg border border-border bg-card text-[11px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" />
              Ko'rish
            </a>
          )}
          <button type="submit" className="px-4 py-1.5 rounded-lg bg-foreground text-background text-xs font-semibold hover:bg-foreground/90 transition-all active:scale-[0.98] flex items-center gap-1.5 shadow-sm">
            {savedSuccess ? (
              <><Check className="w-3.5 h-3.5" /><span>Saqlandi!</span></>
            ) : (
              <><Save className="w-3.5 h-3.5" /><span>{isNew ? 'Yaratish' : 'Saqlash'}</span></>
            )}
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20 text-destructive text-xs font-medium">
          {errorMessage}
        </div>
      )}

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Main Form */}
        <div className="lg:col-span-2 space-y-5">
          {/* Basic Information */}
          <div className="admin-section space-y-4">
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-muted-foreground" />
              Asosiy ma'lumotlar
            </h3>

            <div>
              <label className="block text-[11px] font-medium text-muted-foreground mb-1">Mahsulot nomi <span className="text-destructive">*</span></label>
              <input type="text" required value={name} onChange={(e) => handleNameChange(e.target.value)} placeholder="Masalan: Erkaklar Premium Kostyum-Shim" className="admin-input font-medium" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">URL havola (Slug)</label>
                <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="erkaklar-klassik-kostyum-shim" className="admin-input font-mono text-[11px]" />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">Artikul / SKU</label>
                <input type="text" value={sku} onChange={(e) => setSku(e.target.value)} placeholder="CLO-2024" className="admin-input font-mono text-[11px]" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">Kategoriya <span className="text-destructive">*</span></label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="admin-input font-medium">
                  {categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">Ichki kategoriya</label>
                <input type="text" value={subcategory} onChange={(e) => setSubcategory(e.target.value)} placeholder="Kostyum, Futbolka..." className="admin-input" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-muted-foreground mb-1">Tavsif</label>
              <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Mahsulot haqida to'liq ma'lumot..." className="admin-input text-[11px] leading-relaxed resize-none" />
            </div>
          </div>

          {/* Images */}
          <div className="admin-section">
            <ImageUploader images={images} onChange={setImages} maxImages={8} label="Mahsulot rasmlari" helperText="Birinchi rasm asosiy rasm sifatida ko'rsatiladi (JPG, PNG, WebP; 5 MB gacha)." scope={storageScope} onUploaded={recordUploaded} />
            <div className="mt-4 pt-4 border-t border-border">
              <VideoUploader value={videoUrl || undefined} onChange={(url) => setVideoUrl(url || '')} poster={videoPosterUrl || undefined} onPosterChange={(url) => setVideoPosterUrl(url || '')} bucket={MEDIA_BUCKETS.PRODUCT_IMAGES} scope={storageScope} label="Mahsulot videosi (ixtiyoriy)" helperText="MP4 yoki WebM faylni yuklang (100 MB gacha)." onUploaded={recordUploaded} />
            </div>
          </div>

          {/* Pricing & Stock */}
          <div className="admin-section space-y-4">
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
              <Tag className="w-3.5 h-3.5 text-muted-foreground" />
              Narx va zaxira
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">Sotuv narxi (so'm) <span className="text-destructive">*</span></label>
                <div className="relative">
                  <input type="number" required min={0} step={1000} value={price || ''} onChange={(e) => setPrice(Number(e.target.value))} placeholder="250000" className="admin-input font-semibold pr-12" />
                  <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-[11px] text-muted-foreground pointer-events-none">so'm</span>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">Asl narxi (chegirma uchun)</label>
                <div className="relative">
                  <input type="number" min={0} step={1000} value={originalPrice || ''} onChange={(e) => setOriginalPrice(e.target.value ? Number(e.target.value) : undefined)} placeholder="320000" className="admin-input pr-12" />
                  <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-[11px] text-muted-foreground pointer-events-none">so'm</span>
                </div>
              </div>
            </div>

            {originalPrice && originalPrice > price && (
              <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 text-[11px] flex items-center justify-between">
                <span className="font-medium text-emerald-700 dark:text-emerald-300">Chegirma: -{Math.round(((originalPrice - price) / originalPrice) * 100)}%</span>
                <span className="text-emerald-600 dark:text-emerald-400">Mijoz {(originalPrice - price).toLocaleString('uz-UZ')} so'm tejaydi</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-border">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <span className="block text-xs font-medium text-foreground">Zaxirada mavjud</span>
                  <span className="text-[10px] text-muted-foreground">Mijozlar buyurtma bera oladi</span>
                </div>
                <input type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} className="w-4 h-4 rounded cursor-pointer accent-foreground" />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">Qoldiq soni</label>
                <input type="number" min={0} value={stockCount} onChange={(e) => setStockCount(Number(e.target.value))} className="admin-input font-semibold" />
              </div>
            </div>
          </div>

          {/* Variants */}
          <div className="admin-section space-y-4">
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
              <Tag className="w-3.5 h-3.5 text-muted-foreground" />
              O'lchamlar, ranglar va mato
            </h3>

            <div>
              <label className="block text-[11px] font-medium text-muted-foreground mb-2">O'lchamlar</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {PRESET_SIZES.map((sz) => (
                  <button key={sz} type="button" onClick={() => handleToggleSize(sz)} className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${sizes.includes(sz) ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>
                    {sz}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1.5 max-w-xs">
                <input type="text" value={customSize} onChange={(e) => setCustomSize(e.target.value)} placeholder="Boshqa o'lcham" className="admin-input text-[11px]" onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomSize(); } }} />
                <button type="button" onClick={handleAddCustomSize} className="px-2.5 py-1 rounded-md bg-muted text-[11px] font-medium text-foreground hover:bg-muted/80">+</button>
              </div>
            </div>

            <div className="pt-3 border-t border-border">
              <label className="block text-[11px] font-medium text-muted-foreground mb-2">Ranglar</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {PRESET_COLORS.map((clr) => (
                  <button key={clr} type="button" onClick={() => handleToggleColor(clr)} className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${colors.includes(clr) ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>
                    {clr}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1.5 max-w-xs">
                <input type="text" value={customColor} onChange={(e) => setCustomColor(e.target.value)} placeholder="Boshqa rang" className="admin-input text-[11px]" onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomColor(); } }} />
                <button type="button" onClick={handleAddCustomColor} className="px-2.5 py-1 rounded-md bg-muted text-[11px] font-medium text-foreground hover:bg-muted/80">+</button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-border">
              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">Mato tarkibi</label>
                <input type="text" value={material} onChange={(e) => setMaterial(e.target.value)} placeholder="100% Paxta" className="admin-input" />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">Ishlab chiqarilgan davlat</label>
                <input type="text" value={madeIn} onChange={(e) => setMadeIn(e.target.value)} placeholder="O'zbekiston" className="admin-input" />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Status & Preview */}
        <div className="space-y-5">
          {/* Status */}
          <div className="admin-section space-y-3">
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">Ko'rinish</h3>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50">
              <div>
                <span className="block text-xs font-medium text-foreground">Nashr qilish</span>
                <span className="text-[10px] text-muted-foreground">{published ? "Mijozlarga ko'rinadi" : "Yashirin"}</span>
              </div>
              <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} className="w-4 h-4 rounded cursor-pointer accent-foreground" />
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-accent/5 border border-accent/20">
              <div className="flex items-center gap-2">
                <Star className="w-3.5 h-3.5 text-accent" />
                <div>
                  <span className="block text-xs font-medium text-foreground">Mashhur</span>
                  <span className="text-[10px] text-muted-foreground">Bosh sahifada</span>
                </div>
              </div>
              <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="w-4 h-4 rounded cursor-pointer accent-foreground" />
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40">
              <div className="flex items-center gap-2">
                <Sparkle className="w-3.5 h-3.5 text-rose-500" />
                <div>
                  <span className="block text-xs font-medium text-foreground">Yangi</span>
                  <span className="text-[10px] text-muted-foreground">"Yangi" belgisi</span>
                </div>
              </div>
              <input type="checkbox" checked={isNewBadge} onChange={(e) => setIsNewBadge(e.target.checked)} className="w-4 h-4 rounded cursor-pointer accent-foreground" />
            </div>
          </div>

          {/* Tags */}
          <div className="admin-section space-y-3">
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">Teglar</h3>
            <div className="flex items-center gap-1.5">
              <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="teg qo'shish..." className="admin-input text-[11px] flex-1" onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }} />
              <button type="button" onClick={handleAddTag} className="px-2.5 py-1 rounded-md bg-muted text-[11px] font-medium text-foreground hover:bg-muted/80">+</button>
            </div>
            <div className="flex flex-wrap gap-1">
              {tags.map((t) => (
                <span key={t} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-[10px] font-medium text-muted-foreground">
                  #{t}
                  <button type="button" onClick={() => handleRemoveTag(t)} className="text-muted-foreground/50 hover:text-destructive"><X className="w-2.5 h-2.5" /></button>
                </span>
              ))}
            </div>
          </div>

          {/* Live Preview */}
          <div className="admin-section space-y-2">
            <h3 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Jonli ko'rinish</h3>
            <div className="rounded-lg border border-border overflow-hidden bg-card">
              <div className="relative aspect-4/3 bg-muted">
                {images[0] ? (
                  <img src={images[0]} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><Boxes className="w-6 h-6 text-muted-foreground/30" /></div>
                )}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {isFeatured && <span className="px-1.5 py-0.5 rounded bg-accent text-accent-foreground text-[9px] font-bold">Mashhur</span>}
                  {isNewBadge && <span className="px-1.5 py-0.5 rounded bg-rose-500 text-white text-[9px] font-bold">Yangi</span>}
                </div>
              </div>
              <div className="p-2.5 space-y-1">
                <span className="text-[9px] font-medium text-muted-foreground uppercase">{subcategory || category}</span>
                <h4 className="text-[11px] font-semibold text-foreground line-clamp-1">{name || 'Nomi kiritilmagan'}</h4>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xs font-bold text-foreground">{(price || 0).toLocaleString('uz-UZ')} so'm</span>
                  {originalPrice && originalPrice > price && <span className="text-[10px] text-muted-foreground line-through">{originalPrice.toLocaleString('uz-UZ')}</span>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};
