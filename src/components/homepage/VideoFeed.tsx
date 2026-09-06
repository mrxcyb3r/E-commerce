import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Play,
  Pause,
  Heart,
  MessageSquare,
  Share2,
  Bookmark,
  ShoppingBag,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  X,
} from 'lucide-react';
import { FeedVideoCard } from '../feed/FeedVideoCard';
import { useStore } from '../../context/StoreContext';
import { useVideoFeed } from '../../context/VideoContext';
import { useI18n } from '../../i18n/I18nContext';
import { motion, AnimatePresence } from 'motion/react';
import { Reveal } from '../motion';
import { formatPrice } from '../../lib/utils';

export const VideoFeed: React.FC = () => {
  const { t } = useI18n();
  const { publishedVideos, videos } = useVideoFeed();
  const { publishedProducts } = useStore();
  const [activeIndex, setActiveIndex] = useState(0);
  const [showOverlay, setShowOverlay] = useState<{ video: any; product: any } | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const snapRef = useRef<HTMLDivElement>(null);

  const activeVideos = publishedVideos
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const videosWithProducts = activeVideos.map((video) => {
    const product = video.productId ? publishedProducts.find((p) => p.id === video.productId) : null;
    return { video, product };
  }).filter((v) => v.video.videoUrl || (v.video.images?.length ?? 0) > 0);

  const current = videosWithProducts[activeIndex];

  // IntersectionObserver to track active video in snap container
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || videosWithProducts.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            const idx = Number(entry.target.getAttribute('data-video-index'));
            if (!isNaN(idx)) setActiveIndex(idx);
          }
        }
      },
      { root: container, threshold: 0.6 }
    );

    const children = container.querySelectorAll('[data-video-index]');
    children.forEach((child) => observer.observe(child));
    return () => observer.disconnect();
  }, [videosWithProducts.length]);

  const goToVideo = useCallback((index: number) => {
    const next = (index + videosWithProducts.length) % videosWithProducts.length;
    setActiveIndex(next);
    const container = scrollContainerRef.current;
    if (container) {
      const child = container.querySelector(`[data-video-index="${next}"]`);
      child?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [videosWithProducts.length]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === ' ') {
      e.preventDefault();
      goToVideo(activeIndex + 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      goToVideo(activeIndex - 1);
    } else if (e.key === 'Escape') {
      setShowOverlay(null);
    }
  }, [activeIndex, goToVideo]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (videosWithProducts.length === 0) return null;

  const currentProduct = current?.product;

  return (
    <section
      id="video-feed"
      className="relative overflow-hidden min-h-screen"
      style={{
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 40%, #16213e 70%, #0a0a0a 100%)',
      }}
      aria-labelledby="video-feed-heading"
    >
      {/* Ambient glow effects */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-violet-500/5 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_rgba(0,0,0,0.4)_100%)]" />
      </div>

      {/* Header */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-4">
        <Reveal className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] font-black uppercase tracking-widest text-zinc-400 mb-4 backdrop-blur-sm">
              <Play className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>{t('pages', 'home.feedTitle')}</span>
            </div>
            <h2
              id="video-feed-heading"
              className="font-display font-black tracking-tightest text-white"
              style={{
                fontSize: 'clamp(2.25rem, 5vw, 4rem)',
                lineHeight: '1.02',
                letterSpacing: '-0.03em',
              }}
            >
              {t('pages', 'home.feedTitle')}
            </h2>
            <p className="mt-3 text-zinc-400 max-w-xl text-lg leading-relaxed">
              {t('pages', 'home.feedExplore')}
            </p>
          </div>

          <div className="flex items-center gap-3 self-end">
            <button
              onClick={() => goToVideo(activeIndex - 1)}
              className="p-3 rounded-full bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white transition-all backdrop-blur-sm"
              aria-label="Previous video"
            >
              <ChevronUp className="w-5 h-5" />
            </button>
            <button
              onClick={() => goToVideo(activeIndex + 1)}
              className="p-3 rounded-full bg-accent text-accent-foreground hover:bg-amber-400 shadow-lg shadow-amber-500/30 transition-all"
              aria-label="Next video"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>
        </Reveal>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div className="flex items-start justify-center gap-8">
          {/* Phone Mockup */}
          <div className="relative flex-shrink-0 w-full max-w-[320px] sm:max-w-[360px]">
            <div className="relative rounded-[2.5rem] border-[3px] border-zinc-700/80 bg-black p-2 shadow-2xl shadow-black/50">
              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[1px] w-28 h-7 bg-zinc-700/80 rounded-b-3xl z-30" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[1px] w-20 h-6 bg-black rounded-b-2xl z-31" />

              {/* Inner Screen */}
              <div className="relative rounded-[2rem] overflow-hidden bg-black" style={{ aspectRatio: '9/19.5' }}>
                {/* Top progress bar */}
                <div className="absolute top-0 left-0 right-0 z-30 h-[3px] bg-white/10">
                  <motion.div
                    className="h-full bg-amber-500 rounded-r-full"
                    initial={{ width: '0%' }}
                    animate={{ width: `${((activeIndex + 1) / videosWithProducts.length) * 100}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                </div>

                {/* Scrollable snap container */}
                <div
                  ref={scrollContainerRef}
                  className="snap-y snap-mandatory overflow-y-auto overflow-x-hidden h-full scroll-smooth"
                  style={{ scrollSnapType: 'y mandatory', WebkitOverflowScrolling: 'touch' }}
                >
                  {videosWithProducts.map((vp, i) => (
                    <div
                      key={vp.video.id}
                      data-video-index={i}
                      className="snap-start snap-always"
                      style={{ height: '100%', flexShrink: 0 }}
                    >
                      <FeedVideoCard
                        video={vp.video}
                        isActive={i === activeIndex}
                        index={i}
                        total={videosWithProducts.length}
                      />
                    </div>
                  ))}
                </div>

                {/* Video counter */}
                <div className="absolute bottom-3 left-3 z-20 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/10">
                  <span className="text-[11px] font-mono font-bold text-white/90">
                    {activeIndex + 1} / {videosWithProducts.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Scroll hint */}
            <div className="mt-4 flex flex-col items-center gap-1 text-zinc-500 text-xs font-medium">
              <span className="uppercase tracking-widest">{t('pages', 'home.feedExplore')}</span>
              <motion.svg
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 5v14M19 12l-7 7-7-7" />
              </motion.svg>
            </div>
          </div>

          {/* Desktop Side Panel — Product Info */}
          <AnimatePresence mode="wait">
            {currentProduct && (
              <motion.div
                key={currentProduct.id}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 40 }}
                transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="hidden lg:flex flex-col gap-5 w-[340px] sticky top-24"
              >
                {/* Product Card */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest bg-accent text-accent-foreground rounded-full">
                      {currentProduct.categoryName || t('pages', 'home.editorBadge')}
                    </span>
                    {currentProduct.originalPrice && currentProduct.originalPrice > currentProduct.price && (
                      <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest bg-rose-500 text-white rounded-full">
                        {Math.round(((currentProduct.originalPrice - currentProduct.price) / currentProduct.originalPrice) * 100)}% off
                      </span>
                    )}
                  </div>

                  <h3 className="font-display font-black text-white text-xl leading-tight">
                    {currentProduct.name}
                  </h3>

                  <div className="flex items-baseline gap-3">
                    <span className="font-display font-black text-white text-2xl">
                      {formatPrice(currentProduct.price)}
                    </span>
                    {currentProduct.originalPrice && currentProduct.originalPrice > currentProduct.price && (
                      <span className="font-display font-medium text-zinc-500 line-through text-lg">
                        {formatPrice(currentProduct.originalPrice)}
                      </span>
                    )}
                  </div>

                  {currentProduct.description && (
                    <p className="text-zinc-400 text-sm leading-relaxed line-clamp-3">
                      {currentProduct.description}
                    </p>
                  )}

                  <div className="flex flex-col gap-2.5 pt-2">
                    <button className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-accent text-accent-foreground font-black text-sm tracking-wide hover:bg-amber-400 shadow-lg shadow-amber-500/30 transition-all">
                      <ShoppingBag className="w-4 h-4" />
                      {t('product', 'shopNow')}
                    </button>
                    <Link
                      to={`/products/${currentProduct.id}`}
                      className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white/5 border border-white/10 text-white font-semibold text-sm tracking-wide hover:bg-white/10 transition-all"
                    >
                      {t('product', 'viewDetails')}
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center gap-2">
                  <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-zinc-300 text-sm font-medium hover:bg-white/10 hover:text-white transition-all">
                    <Heart className="w-4 h-4" />
                    {t('pages', 'home.feedSave')}
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-zinc-300 text-sm font-medium hover:bg-white/10 hover:text-white transition-all">
                    <Share2 className="w-4 h-4" />
                    {t('pages', 'home.feedShare')}
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-zinc-300 text-sm font-medium hover:bg-white/10 hover:text-white transition-all">
                    <MessageSquare className="w-4 h-4" />
                    {t('pages', 'home.feedComment')}
                  </button>
                </div>

                {/* Explore Link */}
                <Link
                  to="/feed"
                  className="flex items-center justify-center gap-3 px-6 py-3.5 rounded-full bg-white/5 border border-white/10 text-white font-semibold text-sm tracking-wide hover:bg-white/10 transition-all group"
                >
                  {t('pages', 'home.feedExplore')}
                  <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile dots (only on small screens where side panel is hidden) */}
        <div className="flex lg:hidden items-center justify-center gap-1.5 mt-6" role="tablist" aria-label="Video navigation">
          {videosWithProducts.map((v, i) => (
            <button
              key={v.video.id}
              role="tab"
              aria-selected={i === activeIndex}
              aria-label={`Video ${i + 1}`}
              onClick={() => goToVideo(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === activeIndex
                  ? 'w-8 bg-amber-500'
                  : 'w-1.5 bg-white/20 hover:bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Full-screen overlay (existing) */}
      <AnimatePresence>
        {showOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
            onClick={() => setShowOverlay(null)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="overlay-title"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
              className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-background"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowOverlay(null)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-zinc-900/80 backdrop-blur-sm text-white/80 hover:text-white hover:bg-zinc-800 transition-all"
                aria-label="Close"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
                <div className="relative aspect-video bg-black">
                  {showOverlay.video.videoUrl && (
                    <video
                      src={showOverlay.video.videoUrl}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  )}
                  {!showOverlay.video.videoUrl && showOverlay.video.images?.[0] && (
                    <img
                      src={showOverlay.video.images[0]}
                      alt={showOverlay.video.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                <div className="p-6 lg:p-10 overflow-y-auto max-h-[90vh]">
                  {showOverlay.product && (
                    <>
                      <span className="inline-block px-3 py-1 text-[10px] font-black uppercase tracking-widest bg-accent text-accent-foreground rounded-full mb-4">
                        {showOverlay.product.categoryName}
                      </span>

                      <h3
                        id="overlay-title"
                        className="font-display font-black text-white mb-4"
                        style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', lineHeight: '1.1', letterSpacing: '-0.02em' }}
                      >
                        {showOverlay.product.name}
                      </h3>

                      <div className="flex items-baseline gap-3 mb-6">
                        <span className="font-display font-black text-white text-2xl lg:text-3xl">
                          {formatPrice(showOverlay.product.price)}
                        </span>
                        {showOverlay.product.originalPrice && showOverlay.product.originalPrice > showOverlay.product.price && (
                          <span className="font-display font-medium text-zinc-500 line-through text-xl">
                            {formatPrice(showOverlay.product.originalPrice)}
                          </span>
                        )}
                      </div>

                      <p className="text-zinc-400 mb-8 leading-relaxed max-w-md">
                        {showOverlay.product.description || t('pages', 'home.feedPremiumQuality')}
                      </p>

                      <div className="flex flex-col sm:flex-row gap-3 mb-6">
                        <button className="flex-1 px-6 py-4 rounded-full bg-accent text-accent-foreground font-black text-sm tracking-wider hover:bg-amber-400 shadow-lg shadow-amber-500/30 transition-all">
                          <ShoppingBag className="w-5 h-5 inline-block mr-2" />
                          {t('pages', 'home.feedAddToCart')}
                        </button>
                        <Link
                          to={`/products/${showOverlay.product.id}`}
                          className="flex-1 px-6 py-4 rounded-full glass-strong text-white font-semibold text-sm tracking-wide text-center hover:bg-white/10 transition-all border border-white/10"
                        >
                          {t('product', 'viewDetails')}
                        </Link>
                      </div>

                      <div className="flex items-center gap-4 pt-6 border-t border-border">
                        <button className="p-2 rounded-full bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all" aria-label="Share">
                          <Share2 className="w-5 h-5" />
                        </button>
                        <button className="p-2 rounded-full bg-zinc-800 text-zinc-400 hover:text-rose-500 hover:bg-zinc-700 transition-all" aria-label="Save">
                          <Bookmark className="w-5 h-5" />
                        </button>
                        <button className="p-2 rounded-full bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all" aria-label="Comments">
                          <MessageSquare className="w-5 h-5" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default VideoFeed;
