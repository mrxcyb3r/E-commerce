import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { formatPrice, generateTelegramProductLink } from '../lib/utils';
import { useFavorites } from '../hooks/useFavorites';
import { track } from '../lib/analytics/client';
import { ProductGallery } from '../components/products/ProductGallery';
import { StoreVisitModal } from '../components/products/StoreVisitModal';
import { ProductCard } from '../components/products/ProductCard';
import { ShareModal } from '../components/common/ShareModal';
import { useDocumentMeta, formatSeoPrice } from '../hooks/useDocumentMeta';
import { useI18n } from '../i18n/I18nContext';
import { Product } from '../types/product';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  Send, 
  Store, 
  CheckCircle2, 
  AlertTriangle,
  PackageX,
  MapPin, 
  ChevronRight, 
  ArrowLeft,
  Share2,
  Truck,
  BadgeCheck,
  History,
  ShoppingBag,
} from 'lucide-react';

const VIEWED_KEY = 'prv_viewed_products';
const MAX_VIEWED = 8;

function readViewed(): string[] {
  try {
    const raw = localStorage.getItem(VIEWED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function writeViewed(ids: string[]) {
  try {
    localStorage.setItem(VIEWED_KEY, JSON.stringify(ids));
  } catch {
    /* ignore */
  }
}

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { products, storeInfo } = useStore();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { t } = useI18n();

  const product = products.find((p) => (p.id === id || p.slug === id) && p.published !== false);

  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [viewedProducts, setViewedProducts] = useState<Product[]>([]);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const mountedAt = useRef<number>(0);
  const maxScroll = useRef<number>(0);

  useEffect(() => {
    window.scrollTo(0, 0);
    maxScroll.current = 0;
    const onScroll = () => {
      const doc = document.documentElement;
      const scrolled = window.scrollY + window.innerHeight;
      const total = doc.scrollHeight;
      const pct = total > 0 ? Math.round((scrolled / total) * 100) : 0;
      if (pct > maxScroll.current) maxScroll.current = Math.min(100, pct);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    if (product) {
      if (product.sizes.length > 0) setSelectedSize(product.sizes[0]);
      if (product.colors.length > 0) setSelectedColor(product.colors[0].name);
      track('product_view', {
        productId: product.id,
        categoryId: product.category,
        uniquePerVisitor: true,
      });
      mountedAt.current = Date.now();
      const ids = readViewed();
      const next = [product.id, ...ids.filter((x) => x !== product.id)].slice(0, MAX_VIEWED);
      writeViewed(next);
      const found = next
        .map((pid) => products.find((p) => p.id === pid))
        .filter((p): p is Product => Boolean(p));
      setViewedProducts(found.filter((p) => p.id !== product.id));
    }
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (product && mountedAt.current > 0) {
        const dwellSec = Math.round((Date.now() - mountedAt.current) / 1000);
        if (dwellSec >= 1) {
          track('product_dwell', {
            productId: product.id,
            categoryId: product.category,
            metadata: { durationSec: dwellSec, maxScrollDepth: maxScroll.current },
          });
        }
      }
    };
  }, [id, product]);

  // Sticky buy bar: show after the main CTA scrolls up, hide again near the footer
  useEffect(() => {
    const onScroll = () => {
      const cta = document.getElementById('product-cta-anchor');
      if (!cta) return;
      const rect = cta.getBoundingClientRect();
      const doc = document.documentElement;
      const nearBottom = window.innerHeight + window.scrollY >= doc.scrollHeight - 240;
      setShowStickyBar(!nearBottom && rect.top < window.innerHeight * 0.25);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [product]);

  useDocumentMeta({
    title: product?.name ? product.name.replace(/^[^.]+\.\s*/, '') : t('pages', 'productDetail.metaTitle'),
    description: product
      ? t('pages', 'productDetail.metaDesc', product.name, formatSeoPrice(product.price), product.categoryName || storeInfo.businessCategory || 'barcha kolleksiyalar')
      : '',
    canonicalPath: product ? `/products/${product.slug || product.id}` : '/products',
    type: 'product',
    image: product?.images?.[0] || undefined,
    jsonLd: product
      ? {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: product.name,
          image: product.images || [],
          description: product.description || t('pages', 'productDetail.jsonldDesc', product.name, storeInfo.businessName),
          sku: product.sku,
          brand: { '@type': 'Brand', name: product.brand || storeInfo.businessName },
          category: product.categoryName,
          offers: {
            '@type': 'Offer',
            priceCurrency: 'UZS',
            price: String(product.price),
            availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            url: `${window.location.origin}/products/${product.slug || product.id}`,
            seller: { '@type': 'Store', name: storeInfo.businessName },
          },
        }
      : undefined,
  });

  if (!product) {
    return (
      <div className="pt-32 pb-24 max-w-2xl mx-auto px-4 text-center space-y-6">
        <h2 className="text-3xl font-black text-foreground font-display tracking-tight">
          {t('pages', 'productNotFound.heading')}
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {t('pages', 'productNotFound.desc')}
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-foreground text-background dark:bg-card dark:text-card-foreground font-black text-sm shadow-sm hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('pages', 'productNotFound.backToCatalog')}
        </Link>
      </div>
    );
  }

  const favorite = isFavorite(product.id);
  const telegramInquiryLink = generateTelegramProductLink(product, selectedSize, selectedColor);

  const relatedProducts = products.filter(
    (p) => p.category === product.category && p.id !== product.id
  ).slice(0, 4);

  const relatedIds = new Set(relatedProducts.map((p) => p.id));
  const frequentlyBought = products
    .filter(
      (p) =>
        p.category === product.category &&
        p.id !== product.id &&
        p.published !== false &&
        !relatedIds.has(p.id)
    )
    .slice(0, 3);

  const telegramInquiryLinkMobile = generateTelegramProductLink(product, selectedSize, selectedColor);

  const handleShare = () => {
    track('product_share', { productId: product.id, categoryId: product.category });
    setIsShareOpen(true);
  };

  return (
    <div className="pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Breadcrumb navigation */}
      <nav className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mb-8 overflow-x-auto whitespace-nowrap font-medium">
        <Link to="/" className="hover:text-foreground transition-colors">
          Asosiy
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/products" className="hover:text-foreground transition-colors">
          Mahsulotlar
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link
          to={`/products?category=${product.category}`}
          className="hover:text-foreground transition-colors"
        >
          {product.categoryName}
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="font-bold text-foreground truncate">
          {product.name}
        </span>
      </nav>

      {/* Main Grid: Gallery + Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
        {/* Left Column: Gallery (6 cols) */}
        <div className="lg:col-span-6">
          <ProductGallery
            images={product.images}
            productName={product.name}
            videoUrl={product.videoUrl}
            videoPosterUrl={product.videoPosterUrl}
          />
        </div>

        {/* Right Column: Product Information & Purchase CTAs (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Header & Badges */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                {product.categoryName} {product.brand ? `• ${product.brand}` : ''}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleShare}
                  className="p-2.5 rounded-xl border border-border text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors active:scale-90"
                  title={t('common', 'share')}
                  aria-label={t('common', 'share')}
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => toggleFavorite(product)}
                  className={`p-2.5 rounded-xl border transition-colors ${
                    favorite
                      ? 'bg-rose-50 border-rose-200 text-rose-500 dark:bg-rose-950/40 dark:border-rose-800'
                      : 'border-border text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                  title={favorite ? t('product', 'removeFav') : t('product', 'addFav')}
                  aria-label={favorite ? t('product', 'removeFav') : t('product', 'addFav')}
                >
                  <Heart className={`w-4 h-4 ${favorite ? 'fill-rose-500' : ''}`} />
                </button>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-foreground font-display tracking-tighter">
              {product.name}
            </h1>

            {/* Price Box */}
            <div className="flex items-baseline gap-3 pt-1">
              <span className="text-3xl sm:text-4xl font-black text-foreground font-display tracking-tight">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-lg text-zinc-400 line-through font-bold">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>

            {/* In stock badge */}
            <div className="flex items-center gap-3 pt-1">
              {!product.inStock ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-black text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-2.5 py-1 rounded-lg border border-red-200/60 dark:border-red-800/40 uppercase tracking-wider">
                  <PackageX className="w-3.5 h-3.5" />
                  <span>{t('product', 'soldOut')}</span>
                </span>
              ) : ((product.stockCount ?? 0) > 0 && (product.stockCount ?? 0) <= 3) ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-black text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-200/60 dark:border-amber-800/40 uppercase tracking-wider">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{t('product', 'lowStock')} ({product.stockCount} dona)</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-200/60 dark:border-emerald-800/40 uppercase tracking-wider">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{t('product', 'inStock')} {product.stockCount ? `(${product.stockCount} dona)` : ''}</span>
                </span>
              )}
              <span className="text-xs text-zinc-400 font-mono font-bold">
                {t('product', 'sku')} {product.sku}
              </span>
            </div>
          </div>

          <hr className="border-border" />

          {/* Color Selection */}
          {product.colors.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-black uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
                  {t('product', 'color')} <strong className="text-foreground font-black">{selectedColor}</strong>
                </span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {product.colors.map((c) => {
                  const isSelected = selectedColor === c.name;
                  return (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setSelectedColor(c.name)}
                      className={`group flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all ${
                        isSelected
                          ? 'border-zinc-900 dark:border-white bg-zinc-100 dark:bg-zinc-800 text-foreground shadow-xs'
                          : 'border-border text-zinc-600 dark:text-zinc-400 hover:border-zinc-400'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-zinc-300 dark:border-zinc-600 shrink-0"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span>{c.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Size Selection */}
          {product.sizes.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-black uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
                  {t('product', 'size')} <strong className="text-foreground font-black">{selectedSize}</strong>
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((sz) => {
                  const isSelected = selectedSize === sz;
                  return (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setSelectedSize(sz)}
                      className={`px-4 py-2 rounded-xl text-xs font-mono font-black border transition-all ${
                        isSelected
                          ? 'bg-foreground text-background border-foreground dark:bg-card dark:text-card-foreground dark:border-card shadow-xs'
                          : 'bg-card/80 border-border text-zinc-700 dark:text-zinc-300 hover:border-zinc-400'
                      }`}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Primary Action Buttons */}
          <div id="product-cta-anchor" className="space-y-3 pt-2">
            <button
              id="product-detail-visit-cta"
              type="button"
              onClick={() => setIsVisitModalOpen(true)}
              disabled={!product.inStock}
              className={`w-full flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl font-black text-base tracking-wide transition-all ${
                product.inStock
                  ? 'bg-foreground text-background dark:bg-card dark:text-card-foreground hover:bg-zinc-800 dark:hover:bg-zinc-100 shadow-md hover:shadow-lg'
                  : 'bg-zinc-200 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500 cursor-not-allowed shadow-none'
              }`}
            >
              <Store className="w-5 h-5" />
              <span>{product.inStock ? t('product', 'visitStore') : t('product', 'notAvailable')}</span>
            </button>

            <a
              href={telegramInquiryLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track('telegram_click', { productId: product.id })}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-sm font-bold bg-zinc-100 dark:bg-zinc-800 text-foreground hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              <Send className="w-4 h-4 text-blue-500" />
              <span>{t('product', 'askTelegram')}</span>
            </a>
          </div>

          {/* Trust badges + delivery info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            <div className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-border/60">
              <BadgeCheck className="w-5 h-5 text-zinc-700 dark:text-zinc-300 shrink-0" />
              <div>
                <div className="text-xs font-black text-foreground">{t('product', 'trustAuthentic')}</div>
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">{t('product', 'inStock')}</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-border/60">
              <Store className="w-5 h-5 text-zinc-700 dark:text-zinc-300 shrink-0" />
              <div>
                <div className="text-xs font-black text-foreground">{t('product', 'trustVisitStore')}</div>
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">{storeInfo.address}</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-border/60">
              <Truck className="w-5 h-5 text-zinc-700 dark:text-zinc-300 shrink-0" />
              <div>
                <div className="text-xs font-black text-foreground">{t('product', 'trustDelivery')}</div>
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">{t('product', 'localDelivery', storeInfo.city)}</div>
              </div>
            </div>
          </div>

          {/* Visit notice banner */}
          <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-border/60 space-y-2">
            <div className="flex items-center gap-2 text-xs font-black text-foreground">
              <MapPin className="w-4 h-4 text-zinc-700 dark:text-zinc-300 shrink-0" />
              <span>{storeInfo.address}</span>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
              {t('pages', 'productDetail.storeNote')}
            </p>
          </div>

          {/* Description & Features */}
          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-black uppercase tracking-wider text-foreground font-display">
              {t('product', 'description')}
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
              {product.description}
            </p>
            {product.details && product.details.length > 0 && (
              <ul className="space-y-2 pt-2 text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                {product.details.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Related Products Carousel */}
      {relatedProducts.length > 0 && (
        <div className="mt-24 pt-12 border-t border-border">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-foreground font-display tracking-tight">
                {t('product', 'similar')}
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5 font-medium">
                {t('product', 'similarDesc')}
              </p>
            </div>
            <Link
              to={`/products?category=${product.category}`}
              className="text-xs font-black text-foreground hover:underline uppercase tracking-wider"
            >
              {t('common', 'viewAllRight')}
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p, idx) => (
              <ProductCard key={p.id} product={p} index={idx} />
            ))}
          </div>
        </div>
      )}

      {/* Recently Viewed strip */}
      {viewedProducts.length > 0 && (
        <section className="mt-20 pt-12 border-t border-border">
          <h2 className="text-xl sm:text-2xl font-black text-foreground font-display tracking-tight mb-6 flex items-center gap-2">
            <History className="w-5 h-5 text-zinc-400 shrink-0" />
            {t('product', 'recentlyViewed')}
          </h2>
          <div className="flex gap-4 sm:gap-5 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x scrollbar-hidden">
            {viewedProducts.slice(0, 6).map((p, idx) => (
              <div key={p.id} className="w-44 sm:w-56 shrink-0 snap-start">
                <ProductCard product={p} index={idx} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Frequently Bought Together */}
      {frequentlyBought.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mt-20 pt-12 border-t border-border"
        >
          <h2 className="text-xl sm:text-2xl font-black text-foreground font-display tracking-tight mb-6 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-zinc-400" />
            {t('product', 'frequentlyBought')}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
            {frequentlyBought.map((p, idx) => (
              <ProductCard key={p.id} product={p} index={idx} />
            ))}
          </div>
        </motion.section>
      )}

      {/* Store Visit Modal */}
      <StoreVisitModal
        isOpen={isVisitModalOpen}
        onClose={() => setIsVisitModalOpen(false)}
        product={product}
        selectedSize={selectedSize}
        selectedColor={selectedColor}
      />

      {/* Share Modal */}
      <ShareModal
        open={isShareOpen}
        url={window.location.href}
        title={product.name}
        text={`${product.name} — ${formatPrice(product.price)} so'm`}
        onClose={() => setIsShareOpen(false)}
        onShare={(method) => track('product_share', { productId: product.id, categoryId: product.category, metadata: { method } })}
      />

      {/* Sticky Buy Bar (mobile) */}
      <AnimatePresence>
        {showStickyBar && (
          <motion.div
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 120, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="md:hidden fixed left-0 right-0 bottom-0 z-40 bg-card/90 backdrop-blur-xl border-t border-border shadow-[0_-8px_30px_rgba(0,0,0,0.08)] pb-[env(safe-area-inset-bottom)]"
            role="region"
            aria-label={t('product', 'visitStore')}
          >
            <div className="flex items-center gap-3 px-4 py-3">
              {product.images?.[0] ? (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-11 h-11 rounded-lg object-cover bg-zinc-100 dark:bg-zinc-800 border border-border shrink-0"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-11 h-11 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-border shrink-0 flex items-center justify-center">
                  <PackageX className="w-5 h-5 text-zinc-400" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-bold text-zinc-700 dark:text-zinc-300">{product.name}</div>
                <div className="text-base font-black text-foreground font-display tracking-tight">
                  {formatPrice(product.price)}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsVisitModalOpen(true)}
                  disabled={!product.inStock}
                  aria-label={t('product', 'visitStore')}
                  className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-black bg-foreground text-background dark:bg-card dark:text-card-foreground hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors active:scale-95"
                >
                  <Store className="w-4 h-4" />
                  <span className="hidden [@media(min-width:360px)]:inline">{t('product', 'visitStore')}</span>
                </button>
                <a
                  href={telegramInquiryLinkMobile}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => track('telegram_click', { productId: product.id })}
                  aria-label={t('product', 'askTelegram')}
                  className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-colors active:scale-95"
                >
                  <Send className="w-4 h-4" />
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
