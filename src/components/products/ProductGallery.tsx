import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { ChevronLeft, ChevronRight, Play, Pause, Sparkles, Video as VideoIcon, AlertTriangle } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';

interface ProductGalleryProps {
  images: string[];
  productName: string;
  videoUrl?: string;
  videoPosterUrl?: string;
}

interface Slide {
  kind: 'image' | 'video';
  src: string;
}

interface ImageZoomProps {
  src: string;
  alt: string;
  enabled: boolean;
}

const ImageZoom: React.FC<ImageZoomProps> = ({ src, alt, enabled }) => {
  const { t } = useI18n();
  const ref = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });

  const handleMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const x = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100));
    setOrigin({ x, y });
    setZoom(true);
  }, []);

  return (
    <div
      ref={ref}
      className="w-full h-full"
      onMouseMove={enabled ? handleMove : undefined}
      onMouseEnter={() => enabled && setZoom(true)}
      onMouseLeave={() => setZoom(false)}
      aria-label={enabled && zoom ? t('product', 'zoomLabel') : undefined}
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover object-center will-change-transform"
        style={{
          transformOrigin: `${origin.x}% ${origin.y}%`,
          transform: enabled && zoom ? 'scale(1.8)' : 'scale(1)',
          transition: enabled ? 'transform 0.18s ease-out' : undefined,
        }}
        referrerPolicy="no-referrer"
      />
    </div>
  );
};

export const ProductGallery: React.FC<ProductGalleryProps> = ({ images, productName, videoUrl, videoPosterUrl }) => {
  const { t } = useI18n();
  const hasVideo = Boolean(videoUrl);
  const slides: Slide[] = hasVideo
    ? [{ kind: 'video', src: videoUrl as string }, ...images.map((src) => ({ kind: 'image' as const, src }))]
    : images.map((src) => ({ kind: 'image' as const, src }));

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduceMotion = useReducedMotion();
  const [finePointer] = useState<boolean>(
    () => typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches
  );

  const activeSlide = slides[selectedIndex] ?? slides[0];
  const nextSlide = useCallback(() => {
    setSelectedIndex((prev) => (prev + 1) % slides.length);
    setProgress(0);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setSelectedIndex((prev) => (prev - 1 + slides.length) % slides.length);
    setProgress(0);
  }, [slides.length]);

  const zoomEnabled = finePointer && !reduceMotion && activeSlide.kind === 'image';

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevSlide();
        setVideoError(false);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextSlide();
        setVideoError(false);
      }
    },
    [nextSlide, prevSlide]
  );

  const selectSlide = (index: number) => {
    setSelectedIndex(index);
    setProgress(0);
    setVideoError(false);
  };

  // 3-second Auto Slider Timer (pauses while a video title is active)
  const isOnVideo = hasVideo && selectedIndex === 0;
  useEffect(() => {
    if (!isAutoPlaying || isHovered || isOnVideo || slides.length <= 1) {
      setProgress(0);
      return;
    }

    const intervalTime = 50; // update progress every 50ms
    const totalTime = 3000; // 3 seconds per slide

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          nextSlide();
          return 0;
        }
        return prev + (intervalTime / totalTime) * 100;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isAutoPlaying, isHovered, isOnVideo, slides.length, nextSlide]);

  // Pause the video when it scrolls out of view / user switches slides
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isOnVideo) {
      video.pause();
    }
  }, [isOnVideo, selectedIndex]);

  return (
    <div className="space-y-4">
      <div
        className="relative aspect-[4/5] sm:aspect-square md:aspect-[4/5] rounded-3xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 shadow-xs group focus:outline-none"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onKeyDown={handleKeyDown}
        tabIndex={slides.length > 1 ? 0 : -1}
        role={slides.length > 1 ? 'group' : undefined}
        aria-label={slides.length > 1 ? 'Mahsulot rasmlar galereyasi' : undefined}
      >
        <AnimatePresence mode="wait">
          {activeSlide.kind === 'video' ? (
            <motion.div
              key="video"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full"
            >
              {videoError ? (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-zinc-400 bg-zinc-100 dark:bg-zinc-800">
                  <AlertTriangle className="w-8 h-8" />
                  <p className="text-xs font-semibold">Videoni o'qib bo'lmadi</p>
                </div>
              ) : (
                <video
                  key={videoUrl}
                  ref={videoRef}
                  src={videoUrl}
                  poster={videoPosterUrl || undefined}
                  className="w-full h-full object-contain"
                  controls
                  muted
                  playsInline
                  preload="metadata"
                  onError={() => setVideoError(true)}
                />
              )}
            </motion.div>
          ) : (
            <motion.div
              key={`slide-${selectedIndex}`}
              className="w-full h-full"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <ImageZoom
                src={activeSlide.src}
                alt={`${productName} - Rasm ${selectedIndex}`}
                enabled={zoomEnabled}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {slides.length > 1 && (
          <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
            {isOnVideo ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-bold border border-white/20">
                <VideoIcon className="w-3 h-3 text-amber-400" />
                <span>Video</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setIsAutoPlaying((prev) => !prev)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-[11px] font-bold border border-white/20 transition-all active:scale-95 shadow-md"
                title={isAutoPlaying ? "Avto-slayderni to'xtatish" : "Avto-slayderni yoqish (3s)"}
              >
                {isAutoPlaying && !isHovered ? (
                  <Pause className="w-3 h-3 text-amber-400" />
                ) : (
                  <Play className="w-3 h-3 text-white fill-white" />
                )}
                <span>{isAutoPlaying ? (isHovered ? "To'xtatildi" : "3s Avto") : "Avto: O'chiq"}</span>
              </button>
            )}
          </div>
        )}

        {slides.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => {
                prevSlide();
                setVideoError(false);
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all active:scale-90 shadow-lg"
              aria-label="Oldingi rasm"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => {
                nextSlide();
                setVideoError(false);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all active:scale-90 shadow-lg"
              aria-label="Keyingi rasm"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {slides.length > 1 && !isOnVideo && isAutoPlaying && !isHovered && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20 z-20">
            <div
              className="h-full bg-amber-400 transition-all ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {slides.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-1">
          {slides.map((slide, idx) =>
            slide.kind === 'video' ? (
              <button
                key="video-thumb"
                type="button"
                onClick={() => selectSlide(idx)}
                className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 shrink-0 transition-all flex items-center justify-center bg-zinc-900 ${
                  selectedIndex === idx
                    ? 'border-amber-500 dark:border-amber-400 shadow-md ring-2 ring-amber-500/20'
                    : 'border-transparent opacity-70 hover:opacity-100'
                }`}
                aria-label="Mahsulot videosi"
              >
                {videoPosterUrl ? (
                  <img src={videoPosterUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : null}
                <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <VideoIcon className="w-6 h-6 text-white" fill="white" />
                </span>
                {selectedIndex === idx && <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500" />}
              </button>
            ) : (
              <button
                key={`${idx}-${slide.src}`}
                type="button"
                onClick={() => selectSlide(idx)}
                className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 shrink-0 transition-all ${
                  selectedIndex === idx
                    ? 'border-amber-500 dark:border-amber-400 shadow-md ring-2 ring-amber-500/20'
                    : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <img
                  src={slide.src}
                  alt=""
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                {selectedIndex === idx && isAutoPlaying && !isHovered && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500" />
                )}
              </button>
            )
          )}
        </div>
      )}

      {hasVideo && slides.length === 1 && (
        <p className="text-[11px] text-neutral-400 flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-amber-500" /> Mahsulot videosi mavjud
        </p>
      )}
    </div>
  );
};