import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Play, Pause, Sparkles } from 'lucide-react';

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({ images, productName }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [progress, setProgress] = useState(0);

  const nextSlide = useCallback(() => {
    setSelectedIndex((prev) => (prev + 1) % images.length);
    setProgress(0);
  }, [images.length]);

  const prevSlide = useCallback(() => {
    setSelectedIndex((prev) => (prev - 1 + images.length) % images.length);
    setProgress(0);
  }, [images.length]);

  // 3-second Auto Slider Timer
  useEffect(() => {
    if (!isAutoPlaying || isHovered || images.length <= 1) {
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
  }, [isAutoPlaying, isHovered, images.length, nextSlide]);

  return (
    <div className="space-y-4">
      {/* Main Feature Image Container */}
      <div 
        className="relative aspect-[4/5] sm:aspect-square md:aspect-[4/5] rounded-3xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 shadow-xs group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={selectedIndex}
            src={images[selectedIndex] || images[0]}
            alt={`${productName} - Rasm ${selectedIndex + 1}`}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full object-cover object-center"
            referrerPolicy="no-referrer"
          />
        </AnimatePresence>

        {/* 3s Auto-Play Toggle & Status Badge */}
        {images.length > 1 && (
          <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
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
          </div>
        )}

        {/* Manual Navigation Arrows (Hover visible) */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={prevSlide}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all active:scale-90 shadow-lg"
              aria-label="Oldingi rasm"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={nextSlide}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all active:scale-90 shadow-lg"
              aria-label="Keyingi rasm"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* 3s Smooth Progress Bar (Bottom of Image) */}
        {images.length > 1 && isAutoPlaying && !isHovered && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20 z-20">
            <div
              className="h-full bg-amber-400 transition-all ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Thumbnails list */}
      {images.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-1">
          {images.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setSelectedIndex(idx);
                setProgress(0);
              }}
              className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 shrink-0 transition-all ${
                selectedIndex === idx
                  ? 'border-amber-500 dark:border-amber-400 shadow-md ring-2 ring-amber-500/20'
                  : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <img
                src={img}
                alt=""
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              {selectedIndex === idx && isAutoPlaying && !isHovered && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
