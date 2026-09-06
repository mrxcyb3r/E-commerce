import React, { useState, useEffect, useCallback } from 'react';

import { Link } from 'react-router-dom';

import { ChevronRight } from 'lucide-react';

import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from 'motion/react';

import { useStore } from '../../context/StoreContext';
import { useBrand } from '../../hooks/useBrand';
import { useI18n } from '../../i18n/I18nContext';

export const HeroSection: React.FC = () => {
  const { homepageSlides } = useStore();
  const { name: storeName } = useBrand();
  const { t } = useI18n();

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [dir, setDir] = useState(1);

  const { scrollY } = useScroll();

  const bgY = useTransform(scrollY, [0, 500], [0, 150]);

  const activeSlides = homepageSlides
    .filter((s) => s.active)
    .sort((a, b) => a.order - b.order);

  const go = useCallback(
    (next: number) => {
      if (activeSlides.length === 0) return;

      setIndex(
        ((next % activeSlides.length) + activeSlides.length) %
          activeSlides.length,
      );
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
      title: t('pages', 'home.heroFallbackTitle1'),
      badge: t('pages', 'home.heroFallbackBadge1'),
      imageUrl:
        'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1920&q=80',
      ctaText: t('pages', 'home.heroFallbackCta1'),
      ctaLink: '/products',
    },
    {
      id: 'fallback-2',
      title: t('pages', 'home.heroFallbackTitle2'),
      badge: t('pages', 'home.heroFallbackBadge2'),
      imageUrl:
        'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1920&q=80',
      ctaText: t('pages', 'home.heroFallbackCta2'),
      ctaLink: '/products',
    },
  ];

  const slides =
    activeSlides.length > 0 ? activeSlides : fallbackSlides;

  const slide = slides[index];

  const isInAppLink = slide.ctaLink.startsWith('/');
  const CtaComponent = isInAppLink ? Link : 'a';

  return (
    <section
      id="hero"
      className="relative h-[70vh] min-h-[480px] max-h-[700px] overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-label="Hero"
    >
      {/* Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{
              duration: 1,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className="absolute inset-0"
          >
            <motion.img
              src={slide.imageUrl}
              alt=""
              className="h-full w-full object-cover object-center"
              loading={index === 0 ? 'eager' : 'lazy'}
              referrerPolicy="no-referrer"
              style={{ y: bgY }}
            />
          </motion.div>
        </AnimatePresence>

        {/* Depth layers */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent" />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />

        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,black/40_100%)]" />
      </div>

      {/* 
        IMPORTANT:
        This wrapper is full width.
        The previous max-w-4xl was on the outer flex container,
        which prevented the content group from being centered
        across the complete hero width.
      */}
      <div className="relative z-10 flex h-full w-full items-center justify-center px-6 sm:px-8 lg:px-12 xl:px-16">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-center">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, y: 40 * dir }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 * dir }}
              transition={{
                duration: 0.6,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              className="flex w-full flex-col items-center justify-center text-center"
            >
              {/* Badge */}
              {slide.badge && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.1,
                    duration: 0.5,
                    ease: 'easeOut',
                  }}
                  className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/30 bg-background/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-foreground/90 backdrop-blur-sm"
                >
                  <span>{slide.badge}</span>
                </motion.div>
              )}

              {/* Hero title */}
              {slide.title && (
                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.2,
                    duration: 0.7,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                  className="mx-auto mb-6 max-w-2xl text-center font-display font-black text-white"
                  style={{
                    fontSize: 'clamp(2rem, 6vw, 3.5rem)',
                    lineHeight: '1.1',
                    letterSpacing: '-0.04em',
                  }}
                >
                  {slide.title}
                </motion.h1>
              )}

              {/* CTA buttons */}
              {slide.ctaLink && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.4,
                    duration: 0.5,
                    ease: [0.34, 1.56, 0.64, 1],
                  }}
                  className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row"
                >
                  <CtaComponent
                    to={isInAppLink ? slide.ctaLink : undefined}
                    href={isInAppLink ? undefined : slide.ctaLink}
                    target={isInAppLink ? undefined : '_blank'}
                    rel={
                      isInAppLink
                        ? undefined
                        : 'noopener noreferrer'
                    }
                    className="group inline-flex items-center justify-center gap-3 rounded-full bg-primary px-8 py-4 text-sm font-semibold tracking-wide text-primary-foreground transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/30"
                  >
                    <span>
                      {slide.ctaText ||
                        t(
                          'pages',
                          'home.heroFallbackCta1',
                        )}
                    </span>

                    <motion.div
                      whileHover={{ x: 4 }}
                      transition={{
                        type: 'spring',
                        stiffness: 400,
                        damping: 17,
                      }}
                    >
                      <ChevronRight className="h-5 w-5" />
                    </motion.div>
                  </CtaComponent>

                  <Link
                    to="/products"
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-border/30 bg-background/10 px-6 py-4 text-sm font-medium tracking-wide text-foreground transition-all duration-300 hover:bg-background/20"
                  >
                    {t(
                      'pages',
                      'home.heroViewAllProducts',
                    )}
                  </Link>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Slide indicators */}
      {slides.length > 1 && (
        <div
          className="absolute bottom-10 left-1/2 flex -translate-x-1/2 items-center gap-2"
          aria-label="Slide indicators"
        >
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
      )}

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          delay: 1.2,
          duration: 0.8,
          ease: 'easeOut',
        }}
        className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2"
        aria-hidden="true"
      />
    </section>
  );
};