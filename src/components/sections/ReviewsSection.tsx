import React from 'react';
import { Star, CheckCircle2, MessageSquareQuote } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { motion } from 'motion/react';

export const ReviewsSection: React.FC = () => {
  const { testimonials, homepageCms } = useStore();

  return (
    <section className="py-16 md:py-24 bg-zinc-50/50 dark:bg-zinc-950 transition-colors">
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
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-zinc-900 dark:text-white font-['Outfit',sans-serif] tracking-tighter">
            {homepageCms.testimonialsSectionTitle || 'Xaridorlar nima deydi?'}
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 font-normal">
            {homepageCms.testimonialsSectionSubtitle || "Do'konimizga tashrif buyurib, mahsulotlarni tanlagan xaridorlarimizning haqqoniy taassurotlari."}
          </p>
        </motion.div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Rating Stars */}
                <div className="flex items-center gap-1">
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

                {/* Comment Text */}
                <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">
                  "{review.comment}"
                </p>
              </div>

              {/* Author & Verification */}
              <div className="pt-6 mt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-3">
                {review.avatar && (
                  <img
                    src={review.avatar}
                    alt={review.name}
                    className="w-10 h-10 rounded-full object-cover shrink-0 bg-zinc-100 dark:bg-zinc-800"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-black text-zinc-900 dark:text-white truncate font-['Outfit',sans-serif]">
                    {review.name}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                    <CheckCircle2 className="w-3 h-3 shrink-0" />
                    <span>{review.role || "Do'konda xarid qilgan"}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
