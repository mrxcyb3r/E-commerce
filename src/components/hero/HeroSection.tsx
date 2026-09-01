import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, MapPin, Eye, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { useStore } from '../../context/StoreContext';

export const HeroSection: React.FC = () => {
  const { homepageCms, storeInfo } = useStore();

  return (
    <section id="hero" className="relative pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden scroll-mt-28">
      {/* Subtle background ambient radial gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-zinc-200/40 dark:bg-zinc-800/30 blur-3xl rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Copy & Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="lg:col-span-7 space-y-6 text-center lg:text-left"
          >
            {/* Eyebrow badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-extrabold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{homepageCms.heroBadge || 'Zamonaviy xarid tajribasi'}</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter text-zinc-900 dark:text-white font-['Outfit',sans-serif] leading-[1.05]">
              {homepageCms.heroTitle || 'Kerakli mahsulotni toping.'}{' '}
              <span className="text-zinc-500 dark:text-zinc-400 block mt-1">
                {homepageCms.heroSubtitle || "Do'konga tayyor holda boring."}
              </span>
            </h1>

            {/* Supporting Text */}
            <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-300 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              {homepageCms.heroDescription || "Mahsulotlarni onlayn ko'ring, narxlarni oldindan bilib oling va o'zingizga mos tanlovni do'konimizdan toping."}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <Link
                to={homepageCms.heroPrimaryCtaLink || '/products'}
                id="hero-primary-cta"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-xl font-black text-sm tracking-wide bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all shadow-md hover:shadow-lg group"
              >
                <span>{homepageCms.heroPrimaryCtaText || "Mahsulotlarni ko'rish"}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Link>

              <Link
                to={homepageCms.heroSecondaryCtaLink || '/about'}
                id="hero-secondary-cta"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-extrabold text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border-2 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                <span>{homepageCms.heroSecondaryCtaText || "Biz haqimizda"}</span>
              </Link>
            </div>

            {/* Micro proof points */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Haqiqiy do'kon narxlari</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>O'lcham va ranglar aniq</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-zinc-800 dark:text-zinc-200 shrink-0" />
                <span>{storeInfo.city || 'Jizzax'}</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Premium Visual Showcase */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
            className="lg:col-span-5 relative"
          >
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Main Image Frame */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-zinc-200/80 dark:border-zinc-800/80 aspect-4/5 bg-zinc-100 dark:bg-zinc-800">
                <img
                  src={homepageCms.heroImage || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80"}
                  alt="Zamonaviy kolleksiya"
                  className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700 ease-out"
                />

                {/* Subtle dark gradient overlay at the bottom of image */}
                <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent" />

                {/* Overlaid caption inside image */}
                <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
                  <span className="text-xs font-black uppercase tracking-widest text-zinc-300">
                    Yangi mavsum
                  </span>
                  <p className="text-xl font-black tracking-tight font-['Outfit',sans-serif]">
                    Eng yangi to'plamlar do'konda
                  </p>
                  <p className="text-xs text-zinc-200 font-medium">
                    {storeInfo.address || 'Jizzax shahridagi manzilimizda'}
                  </p>
                </div>
              </div>

              {/* Floating Product Highlight Card (Top Right) */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="absolute -top-4 -right-4 sm:-right-6 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 flex items-center gap-3"
              >
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=200&q=80"
                    alt="Krossovka"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="text-xs font-black text-zinc-900 dark:text-white">
                    Premium Krossovka
                  </div>
                  <div className="text-xs font-extrabold text-zinc-800 dark:text-zinc-200">
                    399 000 so'm
                  </div>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                    Do'konda mavjud
                  </span>
                </div>
              </motion.div>

              {/* Floating Quick Feature Card (Bottom Left) */}
              <motion.div
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="absolute -bottom-4 -left-4 sm:-left-6 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md px-4 py-3 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 flex items-center gap-3"
              >
                <div className="w-9 h-9 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-black text-zinc-900 dark:text-white">
                    Onlayn ko'ring
                  </div>
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                    Do'konda kiyib xarid qiling
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
