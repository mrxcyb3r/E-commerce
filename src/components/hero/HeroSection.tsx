import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, MapPin, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../../context/StoreContext';
import { useBrand } from '../../hooks/useBrand';

export const HeroSection: React.FC = () => {
  const { homepageCms, homepageSlides, publishedProducts, storeInfo } = useStore();
  const { name: storeName, primaryColor } = useBrand();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [dir, setDir] = useState(1);

  // Compute active slides before use
  const activeSlides = homepageSlides
    .filter((s) => s.active)
    .sort((a, b) => a.order - b.order);

  const go = useCallback(
    (next: number) => {
      if (activeSlides.length === 0) return;
      setIndex(((next % activeSlides.length) + activeSlides.length) % activeSlides.length);
    },
    [activeSlides.length],
  );

  useEffect(() => {
    if (activeSlides.length <= 1 || paused) return;
    const timer = window.setInterval(() => {
      setDir(1);
      setIndex((prev) => (prev + 1) % activeSlides.length);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [activeSlides.length, paused]);

  if (activeSlides.length === 0) {
    return (
      <section id="hero" className="relative pt-6 pb-6 md:pt-8 md:pb-8 overflow-hidden scroll-mt-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
            <div className="lg:col-span-7 space-y-4 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-extrabold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>{homepageCms.heroBadge || 'O\'zingizga mosini onlayn toping'}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter text-zinc-900 dark:text-white font-['Outfit',sans-serif] leading-[1.1]">
                {homepageCms.heroTitle || `Bugun kiyishingiz mumkin bo'lgan uslub.`}
                <span className="text-zinc-500 dark:text-zinc-400 block mt-1">
                  {homepageCms.heroSubtitle || "Mahsulotlarni onlayn ko'ring, narxi va o'lchamini tekshiring — mavjudligini aniqlashtirib, do'konga keling."}
                </span>
              </h1>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-3">
                <Link
                  to={homepageCms.heroPrimaryCtaLink || '/products'}
                  id="hero-primary-cta"
                  className="inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl font-black text-sm tracking-wide bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all shadow-md hover:shadow-lg group"
                >
                  <span>{homepageCms.heroPrimaryCtaText || "Mahsulotlarni ko'rish"}</span>
                  <Sparkles className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>

                <Link
                  to={homepageCms.heroSecondaryCtaLink || '/location'}
                  id="hero-secondary-cta"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-extrabold text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border-2 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-100 transition-colors"
                >
                  <span>{homepageCms.heroSecondaryCtaText || "Kategoriyalar"}</span>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden shadow-sm border border-zinc-200/80 dark:border-zinc-800/80 aspect-3/4 bg-zinc-100 dark:bg-zinc-800">
                <img
                  src={homepageCms.heroImage || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80"}
                  alt={"Zamonaviy kolleksiya"}
                  className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700 ease-out"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const slide = activeSlides[index];
  const isInAppLink = slide.ctaLink.startsWith('/');
  const ctaLink = isInAppLink ? (
    <Link
      to={slide.ctaLink}
      className="inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-xl font-black text-sm tracking-wide bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all shadow-md hover:shadow-lg group"
    >
      <span>{slide.ctaText || "Ko'rish"}</span>
      <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
    </Link>
  ) : (
    <a
      href={slide.ctaLink}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-xl font-black text-sm tracking-wide bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all shadow-md hover:shadow-lg group"
    >
      <span>{slide.ctaText || "Ko'rish"}</span>
      <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
    </a>
  );

  return (
    <section
      id="hero"
      className="relative pt-6 pb-6 md:pt-8 md:pb-8 overflow-hidden scroll-mt-6"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[260px] bg-zinc-200/40 dark:bg-zinc-800/30 blur-3xl rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, x: 40 * dir }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 * dir }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center"
            >
              <div className="lg:col-span-7 space-y-4 text-center lg:text-left">
                {slide.badge && (
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-extrabold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 shadow-2xs">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>{slide.badge}</span>
                  </div>
                )}

                {slide.title && (
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter text-zinc-900 dark:text-white font-['Outfit',sans-serif] leading-[1.1]">
                    {slide.title}
                  </h1>
                )}

                {slide.subtitle && (
                  <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-300 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                    {slide.subtitle}
                  </p>
                )}

                {slide.ctaLink && <div className="flex justify-center lg:justify-start">{ctaLink}</div>}
              </div>

              <div className="lg:col-span-5">
                <div className="relative mx-auto max-w-md lg:max-w-none">
                  <div className="relative rounded-2xl overflow-hidden shadow-sm border border-zinc-200/80 dark:border-zinc-800/80 aspect-3/4 bg-zinc-100 dark:bg-zinc-800">
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={slide.id}
                        initial={{ opacity: 0, scale: 1.02 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.45 }}
                        src={slide.mobileImageUrl || slide.imageUrl}
                        alt={slide.title || slide.badge || 'Promo banner'}
                        className="w-full h-full object-cover object-center"
                        loading={index > 1 ? 'lazy' : 'eager'}
                      />
                    </AnimatePresence>
                    <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent" />
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Controls */}
          {activeSlides.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => {
                  setDir(-1);
                  go(index - 1);
                }}
                aria-label="Oldingi banner"
                className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md text-zinc-700 dark:text-zinc-200 shadow-lg hover:bg-white dark:hover:bg-zinc-900 transition-colors z-10"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setDir(1);
                  go(index + 1);
                }}
                aria-label="Keyingi banner"
                className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md text-zinc-700 dark:text-zinc-200 shadow-lg hover:bg-white dark:hover:bg-zinc-900 transition-colors z-10"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-2 mt-4">
                {activeSlides.map((s, i) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setDir(i > index ? 1 : -1);
                      go(i);
                    }}
                    aria-label={`Banner ${i + 1}`}
                    className={`h-2 rounded-full transition-all ${
                      i === index ? 'w-5 bg-zinc-900 dark:bg-white' : 'w-2 bg-zinc-300 dark:bg-zinc-700 hover:bg-zinc-400'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};