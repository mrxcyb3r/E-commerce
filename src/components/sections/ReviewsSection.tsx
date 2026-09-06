import React, { useCallback, useEffect, useState } from 'react';
import { Star, CheckCircle2, MessageSquareQuote, ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

const AUTO_ADVANCE_MS = 6000;

export const ReviewsSection: React.FC = () => {
  const { publishedTestimonials, homepageCms } = useStore();
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);
  const reduceMotion = useReducedMotion();

  const reviews = publishedTestimonials;
  const count = reviews.length;

  const goTo = useCallback(
    (next: number, dir: number) => {
      if (count === 0) return;
      setDirection(dir);
      setIndex(((next % count) + count) % count);
    },
    [count],
  );

  const next = useCallback(() => goTo(index + 1, 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1, -1), [goTo, index]);

  useEffect(() => {
    if (reduceMotion || paused || count <= 1) return;
    const timer = setInterval(next, AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
  }, [reduceMotion, paused, count, next]);

  if (count === 0) return null;

  const review = reviews[index];

  return (
    <section className="py-16 md:py-24 bg-zinc-50/50 dark:bg-background transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-center max-w-2xl mx-auto mb-14 space-y-2"
        >
          <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            <MessageSquareQuote className="w-3.5 h-3.5" />
            <span>Mijozlarimiz fikrlari</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground font-['Outfit',sans-serif] tracking-tighter">
            {homepageCms.testimonialsSectionTitle || 'Xaridorlar nima deydi?'}
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 font-normal">
            {homepageCms.testimonialsSectionSubtitle || "Do'konimizga tashrif buyurib, mahsulotlarni tanlagan xaridorlarimizning haqqoniy taassurotlari."}
          </p>
        </motion.div>

        <div
          className="relative max-w-3xl mx-auto"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="relative min-h-[280px] sm:min-h-[240px]">
            <AnimatePresence mode="wait" custom={direction} initial={false}>
              <motion.figure
                key={review.id}
                custom={direction}
                initial={{ opacity: 0, x: reduceMotion ? 0 : direction * 48 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: reduceMotion ? 0 : direction * -48 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="bg-card rounded-3xl border border-border shadow-sm p-8 sm:p-10 flex flex-col items-center text-center"
              >
                <div className="flex items-center justify-center">
                  <span className="w-12 h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 flex items-center justify-center">
                    <MessageSquareQuote className="w-5 h-5 text-amber-500" />
                  </span>
                </div>

                <div className="flex items-center gap-1 mt-5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < review.rating
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-zinc-300 dark:text-zinc-700'
                      }`}
                    />
                  ))}
                </div>

                <blockquote className="mt-4 text-base sm:text-lg text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium max-w-xl">
                  "{review.comment}"
                </blockquote>

                <figcaption className="mt-6 pt-6 border-t border-zinc-100 dark:border-border flex items-center gap-3 w-full justify-center">
                  {review.avatar && (
                    <img
                      src={review.avatar}
                      alt={review.name}
                      className="w-12 h-12 rounded-full object-cover shrink-0 bg-zinc-100 dark:bg-zinc-800"
                    />
                  )}
                  <div className="text-left">
                    <div className="text-sm font-black text-foreground font-['Outfit',sans-serif]">
                      {review.name}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                      <CheckCircle2 className="w-3 h-3 shrink-0" />
                      <span>{review.role || review.location || "Do'konda xarid qilgan"}</span>
                    </div>
                    {review.purchasedProduct && (
                      <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                        {review.purchasedProduct}
                      </div>
                    )}
                  </div>
                </figcaption>
              </motion.figure>
            </AnimatePresence>
          </div>

          {count > 1 && (
            <>
              <button
                type="button"
                onClick={prev}
                aria-label="Avvalgi sharh"
                className="absolute left-0 sm:-left-16 top-1/2 -translate-y-1/2 translate-x-0 w-10 h-10 rounded-full bg-card border border-border shadow-sm flex items-center justify-center text-zinc-700 dark:text-zinc-300 hover:bg-zinc-900 hover:text-white dark:hover:bg-white dark:hover:text-zinc-950 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="Keyingi sharh"
                className="absolute right-0 sm:-right-16 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-card border border-border shadow-sm flex items-center justify-center text-zinc-700 dark:text-zinc-300 hover:bg-zinc-900 hover:text-white dark:hover:bg-white dark:hover:text-zinc-950 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {count > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            {reviews.map((r, i) => (
              <button
                key={r.id}
                type="button"
                aria-label={`${i + 1}-sharhni ko'rish`}
                aria-current={i === index}
                onClick={() => goTo(i, i > index ? 1 : -1)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === index
                    ? 'w-8 bg-zinc-900 dark:bg-white'
                    : 'w-2 bg-zinc-300 dark:bg-zinc-700 hover:bg-zinc-400 dark:hover:bg-zinc-600'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};