import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { BUSINESS_CONFIG } from '../config/business';
import { formatPrice, generateTelegramProductLink } from '../lib/utils';
import { useFavorites } from '../hooks/useFavorites';
import { track } from '../lib/analytics/client';
import { ProductGallery } from '../components/products/ProductGallery';
import { StoreVisitModal } from '../components/products/StoreVisitModal';
import { ProductCard } from '../components/products/ProductCard';
import { 
  Heart, 
  Send, 
  Store, 
  CheckCircle2, 
  MapPin, 
  Clock, 
  ChevronRight, 
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  Share2,
  Check
} from 'lucide-react';
import { motion } from 'motion/react';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { products } = useStore();
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorites();

  const product = products.find((p) => (p.id === id || p.slug === id) && p.published !== false);

  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (product) {
      if (product.sizes.length > 0) setSelectedSize(product.sizes[0]);
      if (product.colors.length > 0) setSelectedColor(product.colors[0].name);
      track('product_view', {
        productId: product.id,
        categoryId: product.category,
        uniquePerVisitor: true,
      });
    }
  }, [id, product]);

  if (!product) {
    return (
      <div className="pt-32 pb-24 max-w-2xl mx-auto px-4 text-center space-y-6">
        <h2 className="text-3xl font-black text-zinc-900 dark:text-white font-['Outfit',sans-serif] tracking-tight">
          Mahsulot topilmadi
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Ushbu mahsulot mavjud emas yoki o'chirilgan bo'lishi mumkin.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 font-black text-sm shadow-sm hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Katalogga qaytish
        </Link>
      </div>
    );
  }

  const favorite = isFavorite(product.id);
  const telegramInquiryLink = generateTelegramProductLink(product, selectedSize, selectedColor);

  const relatedProducts = products.filter(
    (p) => p.category === product.category && p.id !== product.id
  ).slice(0, 4);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Breadcrumb navigation */}
      <nav className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mb-8 overflow-x-auto whitespace-nowrap font-medium">
        <Link to="/" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
          Asosiy
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/products" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
          Mahsulotlar
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link
          to={`/products?category=${product.category}`}
          className="hover:text-zinc-900 dark:hover:text-white transition-colors"
        >
          {product.categoryName}
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="font-bold text-zinc-900 dark:text-white truncate">
          {product.name}
        </span>
      </nav>

      {/* Main Grid: Gallery + Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
        {/* Left Column: Gallery (6 cols) */}
        <div className="lg:col-span-6">
          <ProductGallery images={product.images} productName={product.name} />
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
                  className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  title="Havolani nusxalash"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => toggleFavorite(product)}
                  className={`p-2.5 rounded-xl border transition-colors ${
                    favorite
                      ? 'bg-rose-50 border-rose-200 text-rose-500 dark:bg-rose-950/40 dark:border-rose-800'
                      : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                  title={favorite ? "Sevimlilardan o'chirish" : "Sevimlilarga qo'shish"}
                >
                  <Heart className={`w-4 h-4 ${favorite ? 'fill-rose-500' : ''}`} />
                </button>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white font-['Outfit',sans-serif] tracking-tighter">
              {product.name}
            </h1>

            {/* Price Box */}
            <div className="flex items-baseline gap-3 pt-1">
              <span className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white font-['Outfit',sans-serif] tracking-tight">
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
              <span className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-200/60 dark:border-emerald-800/40 uppercase tracking-wider">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Do'konda mavjud {product.stockCount ? `(${product.stockCount} dona)` : ''}</span>
              </span>
              <span className="text-xs text-zinc-400 font-mono font-bold">
                Artikul: {product.sku}
              </span>
            </div>
          </div>

          <hr className="border-zinc-200 dark:border-zinc-800" />

          {/* Color Selection */}
          {product.colors.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-black uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
                  Rang: <strong className="text-zinc-900 dark:text-white font-black">{selectedColor}</strong>
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
                          ? 'border-zinc-900 dark:border-white bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs'
                          : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400'
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
                  O'lcham: <strong className="text-zinc-900 dark:text-white font-black">{selectedSize}</strong>
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
                          ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-950 dark:border-white shadow-xs'
                          : 'bg-white dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400'
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
          <div className="space-y-3 pt-2">
            <button
              id="product-detail-visit-cta"
              type="button"
              onClick={() => setIsVisitModalOpen(true)}
              className="w-full flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl font-black text-base bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all shadow-md hover:shadow-lg tracking-wide"
            >
              <Store className="w-5 h-5" />
              <span>Do'konda ko'rish</span>
            </button>

            <a
              href={telegramInquiryLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track('telegram_click', { productId: product.id })}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-sm font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              <Send className="w-4 h-4 text-blue-500" />
              <span>Telegram orqali sotuvchidan so'rash</span>
            </a>
          </div>

          {/* Visit notice banner */}
          <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60 space-y-2">
            <div className="flex items-center gap-2 text-xs font-black text-zinc-900 dark:text-white">
              <MapPin className="w-4 h-4 text-zinc-700 dark:text-zinc-300 shrink-0" />
              <span>{BUSINESS_CONFIG.address}</span>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
              Mahsulotni do'konimizga tashrif buyurib ko'rishingiz va o'zingizga mos o'lchamni tanlashingiz mumkin.
            </p>
          </div>

          {/* Description & Features */}
          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white font-['Outfit',sans-serif]">
              Tavsif va xususiyatlar
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
        <div className="mt-24 pt-12 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white font-['Outfit',sans-serif] tracking-tight">
                O'xshash mahsulotlar
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5 font-medium">
                Ushbu toifadagi boshqa mashhur variantlar
              </p>
            </div>
            <Link
              to={`/products?category=${product.category}`}
              className="text-xs font-black text-zinc-900 dark:text-white hover:underline uppercase tracking-wider"
            >
              Barchasini ko'rish →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p, idx) => (
              <ProductCard key={p.id} product={p} index={idx} />
            ))}
          </div>
        </div>
      )}

      {/* Store Visit Modal */}
      <StoreVisitModal
        isOpen={isVisitModalOpen}
        onClose={() => setIsVisitModalOpen(false)}
        product={product}
        selectedSize={selectedSize}
        selectedColor={selectedColor}
      />
    </div>
  );
};
