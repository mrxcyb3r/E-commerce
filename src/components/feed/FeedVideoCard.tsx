import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  ShoppingBag, 
  ArrowRight, 
  Tag, 
  Sparkles, 
  AlertCircle,
  RotateCcw,
  Check,
  ChevronLeft,
  ChevronRight,
  Images,
  Heart,
  MessageCircle
} from 'lucide-react';
import { VideoItem } from '../../types/video';
import { useVideoFeed } from '../../context/VideoContext';
import { track } from '../../lib/analytics/client';
import { useFeedLikes, useFeedComments } from '../../hooks/useFeedSocial';
import { CommentsModal } from './CommentsModal';
import { motion, AnimatePresence } from 'motion/react';

interface FeedVideoCardProps {
  video: VideoItem;
  isActive: boolean;
  onSelect?: () => void;
  index: number;
  total: number;
}

export const FeedVideoCard: React.FC<FeedVideoCardProps> = ({
  video,
  isActive,
  index,
  total,
}) => {
  const isCollection = video.type === 'collection' || (video.images && video.images.length > 0 && !video.videoUrl);
  const collectionImages = video.images && video.images.length > 0 ? video.images : [video.posterUrl];

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Watch-time accumulation for real video engagement analytics.
  const watchAccum = useRef(0);
  const lastTick = useRef(-1);
  
  const { isMuted, toggleMute, getProductForVideo } = useVideoFeed();
  
  // Video Player state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [showPlayPulse, setShowPlayPulse] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Reset error state when video source changes (new card, new URL)
  useEffect(() => {
    setHasError(false);
    setIsLoading(true);
    setProgress(0);
  }, [video.videoUrl]);

  // Collection Slider state (3s timer)
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [isSlidePaused, setIsSlidePaused] = useState<boolean>(false);
  const [slideProgress, setSlideProgress] = useState<number>(0);

  const product = getProductForVideo(video.productId);

  // Social features: likes and comments
  const { likeCount, isLiked, toggleLike } = useFeedLikes(video.id);
  const { commentCount } = useFeedComments(video.id);
  const [showComments, setShowComments] = useState(false);

  // --- Collection 3-Second Automatic Slider Logic ---
  const handleNextSlide = useCallback(() => {
    setCurrentSlideIndex((prev) => (prev + 1) % collectionImages.length);
    setSlideProgress(0);
  }, [collectionImages.length]);

  const handlePrevSlide = useCallback(() => {
    setCurrentSlideIndex((prev) => (prev - 1 + collectionImages.length) % collectionImages.length);
    setSlideProgress(0);
  }, [collectionImages.length]);

  // Reset slide index when video becomes inactive
  useEffect(() => {
    if (!isActive) {
      setCurrentSlideIndex(0);
      setSlideProgress(0);
    }
  }, [isActive]);

  // 3s interval timer for collections with smooth visual progress
  useEffect(() => {
    if (!isCollection || !isActive || isSlidePaused) return;

    const intervalTime = 50; // ms update
    const totalDuration = 3000; // 3 seconds per slide

    const timer = setInterval(() => {
      setSlideProgress((prev) => {
        if (prev >= 100) {
          handleNextSlide();
          return 0;
        }
        return prev + (intervalTime / totalDuration) * 100;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isCollection, isActive, isSlidePaused, handleNextSlide]);

  // --- Video Playback Logic ---
  useEffect(() => {
    if (isCollection) return;

    const videoEl = videoRef.current;
    if (!videoEl) return;

    if (isActive) {
      videoEl.currentTime = 0;
      const playPromise = videoEl.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setIsLoading(false);
          })
          .catch((err) => {
            console.warn('Autoplay interrupted:', err);
            setIsPlaying(false);
          });
      }
    } else {
      videoEl.pause();
      setIsPlaying(false);
      setProgress(0);
    }
    if (!isActive) {
      watchAccum.current = 0;
      lastTick.current = -1;
    }
  }, [isActive, isCollection]);

  // Sync mute state for videos
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const duration = videoRef.current.duration || 1;
      setProgress((current / duration) * 100);
      watchAccum.current += lastTick.current >= 0 ? current - lastTick.current : 0;
      lastTick.current = current;
      if (watchAccum.current >= 5) {
        track('feed_watch', { feedId: video.id, metadata: { durationSec: Math.round(watchAccum.current) } });
        watchAccum.current = 0;
      }
    }
  };

  const togglePlayPause = (e?: React.MouseEvent) => {
    e?.stopPropagation();

    if (isCollection) {
      setIsSlidePaused((prev) => !prev);
      setShowPlayPulse(true);
      setTimeout(() => setShowPlayPulse(false), 600);
      return;
    }

    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }

    setShowPlayPulse(true);
    setTimeout(() => setShowPlayPulse(false), 600);
  };

  const handleMuteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleMute();
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/feed?v=${video.id}`;
    track('feed_share', { feedId: video.id, metadata: { url } });
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[100dvh] sm:h-[820px] max-w-md mx-auto flex items-center justify-center snap-start snap-always shrink-0 select-none overflow-hidden sm:rounded-3xl bg-zinc-950 shadow-2xl border border-zinc-800/80"
    >
      {/* Media Viewport Container */}
      <div 
        onClick={() => togglePlayPause()}
        className="relative w-full h-full cursor-pointer overflow-hidden flex items-center justify-center bg-zinc-950"
      >
        {isCollection ? (
          /* Image Collection Slider (Auto 3s) */
          <div className="relative w-full h-full">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentSlideIndex}
                src={collectionImages[currentSlideIndex]}
                alt={`${video.title} - Rasm ${currentSlideIndex + 1}`}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full h-full object-cover object-center"
                referrerPolicy="no-referrer"
              />
            </AnimatePresence>

            {/* Manual Slide Click Zones (Left / Right) */}
            <div
              onClick={(e) => {
                e.stopPropagation();
                handlePrevSlide();
              }}
              className="absolute left-0 top-16 bottom-28 w-1/4 z-15 hover:bg-white/5 transition-colors cursor-w-resize"
              title="Oldingi rasm"
            />
            <div
              onClick={(e) => {
                e.stopPropagation();
                handleNextSlide();
              }}
              className="absolute right-0 top-16 bottom-28 w-1/4 z-15 hover:bg-white/5 transition-colors cursor-e-resize"
              title="Keyingi rasm"
            />
          </div>
        ) : (
          /* Video area: always show poster as background; video layer on top when available */
          <div className="relative w-full h-full">
            {/* Poster / fallback background — always visible until video loads over it */}
            <img
              src={video.posterUrl}
              alt={video.title}
              className="absolute inset-0 w-full h-full object-cover object-center"
              referrerPolicy="no-referrer"
            />

            {/* Video element — rendered on top of poster; invisible until loaded */}
            <video
              ref={videoRef}
              src={video.videoUrl}
              poster={video.posterUrl}
              playsInline
              loop
              muted={isMuted}
              preload="metadata"
              onWaiting={() => setIsLoading(true)}
              onPlaying={() => {
                setIsLoading(false);
                setIsPlaying(true);
              }}
              onLoadedData={() => {
                setIsLoading(false);
                setHasError(false);
              }}
              onTimeUpdate={handleTimeUpdate}
              onError={() => {
                setHasError(true);
                setIsLoading(false);
              }}
              className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-500 ${
                hasError ? 'opacity-0' : 'opacity-100'
              }`}
            />

            {/* Error overlay — small banner over poster, not full-screen */}
            {hasError && (
              <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-25 bg-zinc-900/90 backdrop-blur-md border border-zinc-700/50 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-xl max-w-[280px] w-full pointer-events-auto">
                <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold text-white leading-snug">Video yuklanmadi</p>
                  <p className="text-[10px] text-zinc-400 leading-snug mt-0.5">Manzil yoki internetni tekshiring</p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setHasError(false);
                    setIsLoading(true);
                    if (videoRef.current) {
                      videoRef.current.load();
                    }
                  }}
                  className="shrink-0 p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 transition-colors"
                  title="Qayta urinish"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-zinc-300" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Top Vignette & Bottom Gradient for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90 pointer-events-none z-10" />

        {/* Pulse Play / Pause Icon Animation */}
        <AnimatePresence>
          {showPlayPulse && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1.1 }}
              exit={{ opacity: 0, scale: 1.3 }}
              transition={{ duration: 0.3 }}
              className="absolute z-20 w-16 h-16 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center pointer-events-none shadow-xl border border-white/20"
            >
              {isCollection ? (
                isSlidePaused ? <Pause className="w-8 h-8 fill-white" /> : <Play className="w-8 h-8 fill-white ml-1" />
              ) : isPlaying ? (
                <Play className="w-8 h-8 fill-white ml-1" />
              ) : (
                <Pause className="w-8 h-8 fill-white" />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Buffering Spinner for videos */}
        {!isCollection && isLoading && !hasError && (
          <div className="absolute z-20 flex items-center justify-center pointer-events-none">
            <div className="w-10 h-10 border-3 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        )}

        {/* Story-style Segmented Progress Bar for Collections (3s per slide) */}
        {isCollection && collectionImages.length > 1 && (
          <div className="absolute top-3 left-4 right-4 z-25 flex items-center gap-1.5 pointer-events-none">
            {collectionImages.map((_, sIdx) => {
              let fillPercent = 0;
              if (sIdx < currentSlideIndex) fillPercent = 100;
              else if (sIdx === currentSlideIndex) fillPercent = slideProgress;

              return (
                <div key={sIdx} className="h-1 flex-1 bg-white/25 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white transition-all ease-linear"
                    style={{ width: `${fillPercent}%` }}
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* Top Header Floating Controls */}
        <div className={`absolute ${isCollection && collectionImages.length > 1 ? 'top-6' : 'top-4'} left-4 right-4 z-20 flex items-center justify-between pointer-events-auto`}>
          {/* Badge & Index indicator */}
          <div className="flex items-center gap-2">
            {video.badge && (
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider shadow-sm backdrop-blur-md ${
                video.badge.type === 'new'
                  ? 'bg-amber-500 text-zinc-950'
                  : video.badge.type === 'sale'
                  ? 'bg-rose-500 text-white'
                  : video.badge.type === 'store'
                  ? 'bg-emerald-500 text-white'
                  : video.badge.type === 'lookbook'
                  ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-zinc-950'
                  : 'bg-white text-zinc-950'
              }`}>
                <Sparkles className="w-3 h-3" />
                <span>{video.badge.text}</span>
              </span>
            )}

            {isCollection ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md text-amber-300 text-[11px] font-mono font-bold border border-white/10">
                <Images className="w-3 h-3" />
                <span>{currentSlideIndex + 1}/{collectionImages.length} (3s)</span>
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md text-white/90 text-[11px] font-mono font-bold border border-white/10">
                {index + 1} / {total}
              </span>
            )}
          </div>

          {/* Quick Sound / Slide & Share Controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md text-white flex items-center justify-center transition-all active:scale-90 border border-white/10"
              aria-label="Ulashish"
              title="Havolani nusxalash"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Tag className="w-4 h-4" />}
            </button>

            {!isCollection && (
              <button
                type="button"
                onClick={handleMuteClick}
                className="w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md text-white flex items-center justify-center transition-all active:scale-90 border border-white/10"
                aria-label={isMuted ? 'Ovozni yoqish' : 'Ovozni o\'chirish'}
                title={isMuted ? 'Ovozni yoqish' : 'Ovozni o\'chirish'}
              >
                {isMuted ? (
                  <VolumeX className="w-4.5 h-4.5 text-zinc-300" />
                ) : (
                  <Volume2 className="w-4.5 h-4.5 text-amber-400" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Bottom Product Info & CTA Overlay */}
        <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 z-20 space-y-3 pointer-events-auto">
          {/* Like & Comment Buttons */}
          <div className="flex items-center gap-3 px-1">
            <button
              type="button"
              onClick={async (e) => {
                e.stopPropagation();
                const success = await toggleLike();
                if (success) track('feed_like', { feedId: video.id, metadata: { action: isLiked ? 'unlike' : 'like' } });
              }}
              className="inline-flex items-center gap-1.5 transition-all active:scale-90"
              aria-label={isLiked ? 'Yoqdi' : 'Yoqtirish'}
            >
              <Heart
                className={`w-6 h-6 drop-shadow-lg ${
                  isLiked ? 'text-rose-500 fill-rose-500' : 'text-white fill-white/20'
                }`}
              />
              <span className="text-xs font-bold text-white drop-shadow-md">
                {likeCount > 0 ? likeCount.toLocaleString('uz-UZ') : ''}
              </span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowComments(true);
                track('feed_comment_open', { feedId: video.id });
              }}
              className="inline-flex items-center gap-1.5 transition-all active:scale-90"
              aria-label="Izohlar"
            >
              <MessageCircle className="w-6 h-6 text-white fill-white/20 drop-shadow-lg" />
              <span className="text-xs font-bold text-white drop-shadow-md">
                {commentCount > 0 ? commentCount.toLocaleString('uz-UZ') : ''}
              </span>
            </button>
          </div>

          {/* Title and Description */}
          <div className="space-y-1 text-left px-1">
            <h3 className="text-base sm:text-lg font-black text-white drop-shadow-md font-['Outfit',sans-serif] leading-snug line-clamp-2">
              {video.title}
            </h3>
            {video.description && (
              <p className="text-xs text-zinc-300/90 line-clamp-2 leading-relaxed drop-shadow-sm font-medium">
                {video.description}
              </p>
            )}
          </div>

          {/* Connected Product Card OR General Lookbook CTA */}
          {product ? (
            <div className="bg-zinc-900/95 backdrop-blur-xl border border-white/15 p-3 sm:p-3.5 rounded-2xl shadow-xl flex items-center justify-between gap-3 text-left">
              {/* Product Thumbnail & Details */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-zinc-800 overflow-hidden shrink-0 border border-white/10">
                  <img
                    src={product.images?.[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-black text-white truncate font-['Outfit',sans-serif]">
                    {product.name}
                  </div>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-xs sm:text-sm font-black text-amber-400">
                      {new Intl.NumberFormat('uz-UZ').format(product.price)} so'm
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-[10px] text-zinc-400 line-through font-semibold">
                        {new Intl.NumberFormat('uz-UZ').format(product.originalPrice)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Direct View CTA */}
              <Link
                to={`/products/${product.id}`}
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-white text-zinc-950 hover:bg-zinc-100 text-xs font-black shrink-0 transition-all active:scale-95 shadow-md uppercase tracking-wider"
              >
                <span>Ko'rish</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            /* General Styling / Lookbook / Store Tour Banner */
            <div className="bg-zinc-900/90 backdrop-blur-xl border border-white/10 p-3 rounded-2xl shadow-lg flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-white/10 text-amber-400 flex items-center justify-center shrink-0">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-zinc-200 truncate">
                    Barcha yangi to'plamlar
                  </p>
                  <p className="text-[10px] text-zinc-400">
                    Katalogda barcha kiyimlarni ko'ring
                  </p>
                </div>
              </div>
              <Link
                to="/products"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white text-zinc-950 hover:bg-zinc-100 text-xs font-black shrink-0 transition-colors"
              >
                <span>Katalog</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {/* Minimalist Video Progress Bar (for videos only) */}
          {!isCollection && (
            <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      </div>

      <CommentsModal
        feedId={video.id}
        isOpen={showComments}
        onClose={() => setShowComments(false)}
      />
    </div>
  );
};
