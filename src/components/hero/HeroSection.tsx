import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../../context/StoreContext';
import { useBrand } from '../../hooks/useBrand';

export const HeroSection: React.FC = () => {
  const { homepageSlides, homepageCms } = useStore();
  const { name: storeName } = useBrand();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [dir, setDir] = useState(1);

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
    }, 7000);
    return () => window.clearInterval(timer);
  }, [activeSlides.length, paused]);

  const fallbackSlides = [
    {
      id: 'fallback-1',
      title: 'NEW SEASON',
      subtitle: 'Designed for everyday confidence.',
      badge: 'Spring 2025 Collection',
      imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1920&q=80',
      ctaText: 'Explore Collection',
      ctaLink: '/products',
    },
    {
      id: 'fallback-2',
      title: 'MOVE FREELY',
      subtitle: 'Premium streetwear for modern living.',
      badge: 'Core Essentials',
      imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1920&q=80',
      ctaText: 'Shop Now',
      ctaLink: '/products',
    },
  ];

  const slides = activeSlides.length > 0 ? activeSlides : fallbackSlides;

  const slide = slides[index];
  const isInAppLink = slide.ctaLink.startsWith('/');
  const CtaComponent = isInAppLink ? Link : 'a';

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-label="Hero"
    >
      <div className="absolute inset-0 -z-10">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="absolute inset-0"
          >
            <img
              src={slide.imageUrl}
              alt=""
              className="w-full h-full object-cover object-center"
              loading={index === 0 ? 'eager' : 'lazy'}
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_black/40_100%)]" />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent -z-10" aria-hidden="true" />

      <div className="relative z-10 w-full px-6 py-20 sm:px-8 lg:px-12 xl:px-16">
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, y: 40 * dir }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 * dir }}
              transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="flex flex-col items-center text-center"
            >
              {slide.badge && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.5, ease: 'easeOut' }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-strong text-xs font-semibold uppercase tracking-widest text-white/90 mb-6"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>{slide.badge}</span>
                </motion.div>
              )}

              {slide.title && (
                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="font-display font-black tracking-tightest text-white leading-[1.05] mb-6 max-w-4xl"
                  style={{
                    fontSize: 'clamp(3rem, 8vw, 7.5rem)',
                    lineHeight: '1.02',
                    letterSpacing: '-0.03em',
                  }}
                >
                  {slide.title.split(' ').map((word, i) => (
                    <span key={i} className="block">{word}</span>
                  ))}
                </motion.h1>
              )}

              {slide.subtitle && (
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35, duration: 0.6, ease: 'easeOut' }}
                  className="font-body text-white/80 max-w-xl mb-10"
                  style={{
                    fontSize: 'clamp(1.125rem, 2.5vw, 1.5rem)',
                    lineHeight: '1.6',
                    fontWeight: '400',
                    letterSpacing: '0.01em',
                  }}
                >
                  {slide.subtitle}
                </motion.p>
              )}

              {slide.ctaLink && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
                  className="flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                  <CtaComponent
                    to={isInAppLink ? slide.ctaLink : undefined}
                    href={isInAppLink ? undefined : slide.ctaLink}
                    target={isInAppLink ? undefined : '_blank'}
                    rel={isInAppLink ? undefined : 'noopener noreferrer'}
                    className="group inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-white text-zinc-950 font-black text-sm tracking-wider shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/50"
                  >
                    <span>{slide.ctaText || 'Explore Collection'}</span>
                    <motion.div
                      whileHover={{ x: 4 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                    >
                      <ChevronRight className="w-5 h-5" />
                    </motion.div>
                  </CtaComponent>

                  <Link
                    to="/products"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full glass-strong text-white/90 font-semibold text-sm tracking-wide hover:bg-white/10 hover:text-white transition-all duration-300 border border-white/20"
                  >
                    View All Products
                  </Link>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => {
              setDir(-1);
              go(index - 1);
            }}
            aria-label="Previous slide"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full glass-strong text-white/90 hover:bg-white/10 hover:text-white transition-all duration-300 shadow-lg"
            aria-hidden={paused}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            type="button"
            onClick={() => {
              setDir(1);
              go(index + 1);
            }}
            aria-label="Next slide"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full glass-strong text-white/90 hover:bg-white/10 hover:text-white transition-all duration-300 shadow-lg"
            aria-hidden={paused}
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-2" aria-label="Slide indicators">
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setDir(i > index ? 1 : -1);
                  go(i);
                }}
                aria-label={`Slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === index
                    ? 'w-8 bg-white'
                    : 'w-2 bg-white/40 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
        </>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.8, ease: 'easeOut' }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/60 text-xs font-medium uppercase tracking-widest"
        aria-hidden="true"
      >
        <span>Scroll to discover</span>
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
    </section>
  );
};