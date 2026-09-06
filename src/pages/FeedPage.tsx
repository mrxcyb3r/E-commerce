import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  ChevronUp,
  ChevronDown,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  Layers,
  Volume2,
  VolumeX
} from 'lucide-react';
import { useVideoFeed } from '../context/VideoContext';
import { track } from '../lib/analytics/client';
import { FeedVideoCard } from '../components/feed/FeedVideoCard';
import { FeedCategoryFilter } from '../types/video';
import { useI18n } from '../i18n/I18nContext';

export const FeedPage: React.FC = () => {
  const { t } = useI18n();
  const { publishedVideos, isMuted, toggleMute, getProductForVideo } = useVideoFeed();
  const [searchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<FeedCategoryFilter>('all');
  const [activeIndex, setActiveIndex] = useState<number>(0);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Filtered videos based on category
  const filteredVideos = useMemo(() => {
    if (selectedCategory === 'all') return publishedVideos;
    if (selectedCategory === 'new') {
      return publishedVideos.filter((v) => v.badge?.type === 'new');
    }
    if (selectedCategory === 'erkaklar') {
      return publishedVideos.filter((v) => v.category === 'erkaklar');
    }
    if (selectedCategory === 'ayollar') {
      return publishedVideos.filter((v) => v.category === 'ayollar');
    }
    if (selectedCategory === 'oyoq-kiyimlar') {
      return publishedVideos.filter((v) => v.category === 'oyoq-kiyimlar');
    }
    if (selectedCategory === 'aksessuarlar') {
      return publishedVideos.filter((v) => v.category === 'aksessuarlar');
    }
    return publishedVideos;
  }, [publishedVideos, selectedCategory]);

  // Jump to video if URL has ?v=vid_id
  useEffect(() => {
    const videoId = searchParams.get('v');
    if (videoId && filteredVideos.length > 0) {
      const targetIndex = filteredVideos.findIndex((v) => v.id === videoId);
      if (targetIndex !== -1) {
        setActiveIndex(targetIndex);
        setTimeout(() => {
          videoRefs.current[targetIndex]?.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      }
    }
  }, [searchParams, filteredVideos]);

  // Scroll to active index helper
  const scrollToIndex = useCallback((index: number) => {
    if (index >= 0 && index < filteredVideos.length) {
      setActiveIndex(index);
      videoRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [filteredVideos.length]);

  // IntersectionObserver for video scroll snapping
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          const index = Number(entry.target.getAttribute('data-index'));
          if (!isNaN(index)) {
            setActiveIndex(index);
          }
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, {
      root: container,
      threshold: [0.5, 0.75],
    });

    videoRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [filteredVideos]);

  // Keyboard navigation (ArrowUp, ArrowDown, Space, M)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault();
        scrollToIndex(Math.min(activeIndex + 1, filteredVideos.length - 1));
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault();
        scrollToIndex(Math.max(activeIndex - 1, 0));
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        toggleMute();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, filteredVideos.length, scrollToIndex, toggleMute]);

  const activeVideo = filteredVideos[activeIndex];
  const activeProduct = activeVideo ? getProductForVideo(activeVideo.productId) : undefined;

  useEffect(() => {
    if (activeVideo) {
      track('feed_view', { feedId: activeVideo.id, uniquePerVisitor: true });
    }
  }, [activeVideo]);

  return (
    <div className="pt-20 sm:pt-24 pb-12 min-h-screen bg-background text-white flex flex-col justify-center">
      {/* Top Floating Filter Bar */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Header Title */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-accent text-accent-foreground flex items-center justify-center font-black">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black font-['Outfit',sans-serif] tracking-tight">
                {t('feed', 'title')}
              </h1>
              <p className="text-xs text-zinc-400">
                {t('feed', 'subtitle')}
              </p>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('all');
                setActiveIndex(0);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black shrink-0 transition-all ${
                selectedCategory === 'all'
                  ? 'bg-card text-foreground shadow-md'
                  : 'bg-card text-muted-foreground hover:text-foreground border border-border'
              }`}
            >
              {t('feed', 'all')} ({publishedVideos.length})
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedCategory('new');
                setActiveIndex(0);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black shrink-0 transition-all ${
                selectedCategory === 'new'
                  ? 'bg-accent text-accent-foreground shadow-md'
                  : 'bg-card text-muted-foreground hover:text-foreground border border-border'
              }`}
            >
              {t('feed', 'new')}
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedCategory('erkaklar');
                setActiveIndex(0);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black shrink-0 transition-all ${
                selectedCategory === 'erkaklar'
                  ? 'bg-card text-foreground shadow-md'
                  : 'bg-card text-muted-foreground hover:text-foreground border border-border'
              }`}
            >
              {t('feed', 'clothing')}
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedCategory('oyoq-kiyimlar');
                setActiveIndex(0);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black shrink-0 transition-all ${
                selectedCategory === 'oyoq-kiyimlar'
                  ? 'bg-card text-foreground shadow-md'
                  : 'bg-card text-muted-foreground hover:text-foreground border border-border'
              }`}
            >
              {t('feed', 'footwear')}
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedCategory('aksessuarlar');
                setActiveIndex(0);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black shrink-0 transition-all ${
                selectedCategory === 'aksessuarlar'
                  ? 'bg-card text-foreground shadow-md'
                  : 'bg-card text-muted-foreground hover:text-foreground border border-border'
              }`}
            >
              {t('feed', 'accessories')}
            </button>
          </div>
        </div>
      </div>

      {/* Main Feed Interactive Container */}
      <div className="max-w-7xl mx-auto w-full px-2 sm:px-6 lg:px-8 flex-1 flex items-center justify-center">
        {filteredVideos.length === 0 ? (
          /* Empty state */
          <div className="text-center py-24 px-4 max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-card text-muted-foreground flex items-center justify-center mx-auto border border-border">
              <Layers className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-black font-['Outfit',sans-serif]">
                {t('feed', 'emptyTitle')}
              </h2>
              <p className="text-xs text-zinc-400">
                {t('feed', 'emptyDesc')}
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-foreground text-xs font-black transition-colors"
              >
                {t('feed', 'viewAll')}
              </button>
              <Link
                to="/products"
                className="px-5 py-2.5 rounded-xl bg-card text-foreground hover:bg-muted text-xs font-black transition-colors"
              >
                {t('feed', 'goToCatalog')}
              </Link>
            </div>
          </div>
        ) : (
          /* Centered Focused Feed Layout */
          <div className="w-full flex items-center justify-center gap-6 lg:gap-8 max-w-5xl mx-auto">
            {/* Center: Vertical Snapping Player */}
            <div className="relative flex items-center justify-center">
              {/* Up / Down Desktop Navigation Buttons */}
              <div className="hidden sm:flex flex-col gap-3 absolute -right-14 z-30">
                <button
                  type="button"
                  disabled={activeIndex === 0}
                  onClick={() => scrollToIndex(activeIndex - 1)}
                   className="w-11 h-11 rounded-full bg-card/90 hover:bg-muted disabled:opacity-20 disabled:pointer-events-none text-foreground border border-border flex items-center justify-center transition-all shadow-xl active:scale-90 backdrop-blur-md"
                   aria-label={t('feed', 'prevVideo')}
                   title={t('feed', 'prevVideoShort')}
                >
                  <ChevronUp className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  disabled={activeIndex === filteredVideos.length - 1}
                  onClick={() => scrollToIndex(activeIndex + 1)}
                   className="w-11 h-11 rounded-full bg-card/90 hover:bg-muted disabled:opacity-20 disabled:pointer-events-none text-foreground border border-border flex items-center justify-center transition-all shadow-xl active:scale-90 backdrop-blur-md"
                   aria-label={t('feed', 'nextVideo')}
                   title={t('feed', 'nextVideoShort')}
                >
                  <ChevronDown className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Snapping Container */}
              <div
                ref={containerRef}
                className="h-[100dvh] sm:h-[820px] w-full sm:w-[440px] overflow-y-scroll snap-y snap-mandatory scrollbar-none rounded-none sm:rounded-3xl shadow-2xl"
              >
                {filteredVideos.map((video, idx) => (
                  <div
                    key={video.id}
                    ref={(el) => {
                      videoRefs.current[idx] = el;
                    }}
                    data-index={idx}
                    className="w-full h-full snap-start snap-always flex items-center justify-center"
                  >
                    <FeedVideoCard
                      video={video}
                      isActive={idx === activeIndex}
                      index={idx}
                      total={filteredVideos.length}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Desktop Right Attached Product / Collection Showcase Panel (Compact & Clean) */}
            <div className="hidden lg:flex flex-col justify-between w-80 h-[780px] p-6 rounded-3xl bg-card/70 border border-border backdrop-blur-xl shadow-2xl">
              {activeProduct ? (
                <div className="space-y-5">
                  <div className="text-[11px] font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>{t('feed', 'productInVideo')}</span>
                  </div>

                  {/* Product Image */}
                  <div className="w-full h-60 rounded-2xl bg-zinc-800 overflow-hidden border border-zinc-700/60 shadow-lg group">
                    <img
                      src={activeProduct.images?.[0]}
                      alt={activeProduct.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <div className="space-y-1.5 text-left">
                    <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
                      {activeProduct.categoryName}
                    </span>
                    <h4 className="text-lg font-black text-white font-['Outfit',sans-serif] leading-tight">
                      {activeProduct.name}
                    </h4>
                    <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed">
                      {activeProduct.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-border">
                    <div className="text-xs text-zinc-400">{t('feed', 'price')}</div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-black text-amber-400">
                        {new Intl.NumberFormat('uz-UZ').format(activeProduct.price)} so'm
                      </span>
                      {activeProduct.originalPrice && activeProduct.originalPrice > activeProduct.price && (
                        <span className="text-xs text-zinc-500 line-through">
                          {new Intl.NumberFormat('uz-UZ').format(activeProduct.originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>

                  <Link
                    to={`/products/${activeProduct.id}`}
                    onClick={() => track('feed_product_click', { feedId: activeVideo?.id, productId: activeProduct.id })}
                    className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-card text-foreground hover:bg-muted text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95"
                  >
                    <span>{t('common', 'view')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : (
                <div className="space-y-5 my-auto text-center">
                  <div className="w-16 h-16 rounded-3xl bg-zinc-800/80 text-amber-400 flex items-center justify-center mx-auto border border-zinc-700/60 shadow-md">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-lg font-black text-white font-['Outfit',sans-serif]">
                      {t('feed', 'collectionsAndStyles')}
                    </h4>
                    <p className="text-xs text-zinc-400 leading-relaxed max-w-xs mx-auto">
                      {t('feed', 'catalogDesc')}
                    </p>
                  </div>
                  <Link
                    to="/products"
                    className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-black uppercase tracking-wider transition-colors border border-zinc-700"
                  >
                    <span>{t('nav', 'allProducts')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}

              {/* Bottom Sound & Store Note */}
              <div className="pt-4 border-t border-border flex items-center justify-between gap-3 text-xs">
                <button
                  type="button"
                  onClick={toggleMute}
                  className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors"
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-zinc-500" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
                  <span className="text-[11px] font-bold">{isMuted ? t('feed', 'soundOff') : t('feed', 'soundOn')}</span>
                </button>
                <span className="text-[11px] text-zinc-500 font-medium">
                  {t('feed', 'productOnStore')}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
