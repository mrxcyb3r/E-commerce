import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, Pause, Heart, MessageSquare, Share2, Bookmark, ShoppingBag, ChevronRight, X } from 'lucide-react';
import { FeedVideoCard } from '../feed/FeedVideoCard';
import { useStore } from '../../context/StoreContext';
import { useVideoFeed } from '../../context/VideoContext';
import { motion, AnimatePresence } from 'motion/react';

export const VideoFeed: React.FC = () => {
  const { publishedVideos, videos } = useVideoFeed();
  const { publishedProducts } = useStore();
  const [activeIndex, setActiveIndex] = useState(0);
  const [showOverlay, setShowOverlay] = useState<{ video: any; product: any } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeVideos = publishedVideos
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const videosWithProducts = activeVideos.map((video) => {
    const product = video.productId ? publishedProducts.find((p) => p.id === video.productId) : null;
    return { video, product };
  }).filter((v) => v.video.videoUrl || (v.video.images?.length ?? 0) > 0);

  const goToVideo = useCallback((index: number) => {
    setActiveIndex((prev) => {
      const next = (index + videosWithProducts.length) % videosWithProducts.length;
      return next;
    });
  }, [videosWithProducts.length]);

  const handleWheel = useCallback((e: WheelEvent) => {
    if (e.deltaY > 50) goToVideo(activeIndex + 1);
    else if (e.deltaY < -50) goToVideo(activeIndex - 1);
  }, [activeIndex, goToVideo]);

  useEffect(() => {
    const container = containerRef.current;
    container?.addEventListener('wheel', handleWheel, { passive: true });
    return () => container?.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

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

  const current = videosWithProducts[activeIndex];

  return (
    <section
      id="video-feed"
      className="section-padding bg-zinc-950 dark:bg-black relative overflow-hidden"
      aria-labelledby="video-feed-heading"
      ref={containerRef}
      tabIndex={0}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_black_100%)] opacity-50" aria-hidden="true" />

      <div className="relative z-10 max-w-full mx-auto px-6 sm:px-8 lg:px-12 xl:px-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-800 border border-zinc-700 text-[11px] font-black uppercase tracking-widest text-zinc-400 mb-4">
              <Play className="w-3.5 h-3.5 text-amber-500" />
              <span>Shop Through Video</span>
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
              Watch.{' '}
              <span className="text-amber-500">Shop.</span>
              <span className="text-zinc-500 font-medium" style={{ fontSize: '0.4em' }}> Repeat</span>
            </h2>
            <p className="mt-3 text-zinc-400 max-w-xl text-lg leading-relaxed">
              Discover products in motion. Tap any video to explore details, variants, and buy instantly.
            </p>
          </div>

          <div className="flex items-center gap-3 self-end">
            <button
              onClick={() => goToVideo(activeIndex - 1)}
              className="p-3 rounded-full bg-zinc-800 border border-zinc-700 text-white/80 hover:bg-zinc-700 hover:text-white transition-all"
              aria-label="Previous video"
            >
              <ChevronRight className="w-5 h-5 rotate-180" />
            </button>
            <button
              onClick={() => goToVideo(activeIndex + 1)}
              className="p-3 rounded-full bg-amber-500 text-zinc-950 hover:bg-amber-400 shadow-lg shadow-amber-500/30 transition-all"
              aria-label="Next video"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        <div className="relative">
          <AnimatePresence mode="wait" custom={activeIndex}>
            <motion.div
              key={current.video.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="relative max-w-2xl mx-auto"
            >
              <FeedVideoCard
                video={current.video}
                isActive={true}
                index={activeIndex}
                total={videosWithProducts.length}
              />
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 flex items-center justify-center gap-2" role="tablist" aria-label="Video navigation">
            {videosWithProducts.map((v, i) => (
              <motion.button
                key={v.video.id}
                role="tab"
                aria-selected={i === activeIndex}
                aria-label={`Video ${i + 1}`}
                onClick={() => goToVideo(i)}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === activeIndex
                    ? 'w-10 bg-amber-500'
                    : 'w-2 bg-zinc-700 hover:bg-zinc-600'
                }`}
              />
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12 text-center"
        >
          <Link
            to="/feed"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full glass-strong text-white font-semibold text-sm tracking-wide hover:bg-white/10 transition-all border border-white/10 group"
          >
            Explore Full Video Feed
            <motion.div
              whileHover={{ x: 4 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              <ChevronRight className="w-5 h-5" />
            </motion.div>
          </Link>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-zinc-500 text-xs font-medium uppercase tracking-widest"
        aria-hidden="true"
      >
        <span>Scroll or use arrow keys to navigate</span>
        <motion.svg
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M12 5v14M19 12l-7 7-7-7" />
        </motion.svg>
      </motion.div>

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
              className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-zinc-950"
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
                  {(!showOverlay.video.videoUrl && showOverlay.video.images?.[0]) && (
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
                      <span className="inline-block px-3 py-1 text-[10px] font-black uppercase tracking-widest bg-amber-500 text-zinc-950 rounded-full mb-4">
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
                          {showOverlay.product.price.toLocaleString()} UZS
                        </span>
                        {showOverlay.product.originalPrice && showOverlay.product.originalPrice > showOverlay.product.price && (
                          <span className="font-display font-medium text-zinc-500 line-through text-xl">
                            {showOverlay.product.originalPrice.toLocaleString()} UZS
                          </span>
                        )}
                      </div>

                      <p className="text-zinc-400 mb-8 leading-relaxed max-w-md">
                        {showOverlay.product.description || 'Premium quality product from our latest collection.'}
                      </p>

                      <div className="flex flex-col sm:flex-row gap-3 mb-6">
                        <button className="flex-1 px-6 py-4 rounded-full bg-amber-500 text-zinc-950 font-black text-sm tracking-wider hover:bg-amber-400 shadow-lg shadow-amber-500/30 transition-all">
                          <ShoppingBag className="w-5 h-5 inline-block mr-2" />
                          Add to Cart
                        </button>
                        <Link
                          to={`/products/${showOverlay.product.id}`}
                          className="flex-1 px-6 py-4 rounded-full glass-strong text-white font-semibold text-sm tracking-wide text-center hover:bg-white/10 transition-all border border-white/10"
                        >
                          View Details
                        </Link>
                      </div>

                      <div className="flex items-center gap-4 pt-6 border-t border-zinc-800">
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