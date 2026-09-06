import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, ShoppingBag } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Reveal } from '../motion';

export const PromoBanner: React.FC = () => {
  const { homepageCms } = useStore();

  return (
    <section className="py-12 bg-white dark:bg-zinc-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="relative rounded-3xl overflow-hidden bg-zinc-900 dark:bg-zinc-800 text-white p-8 sm:p-12 lg:p-16 shadow-xl border border-zinc-800">
          {/* Background image overlay */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

          <div className="relative z-10 max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-black uppercase tracking-wider text-zinc-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Yangi to'plam</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter font-['Outfit',sans-serif] leading-tight">
              {homepageCms.promoBannerTitle || 'Yangi mahsulotlar keldi'}
            </h2>

            <p className="text-base sm:text-lg text-zinc-300 max-w-xl leading-relaxed font-normal">
              {homepageCms.promoBannerSubtitle || "Eng so'nggi mahsulotlarni birinchilardan bo'lib kashf eting. Do'konimizda mavjud barcha yangi liboslar va oyoq kiyimlar bilan tanishing."}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                to={homepageCms.promoBannerLink || '/products?sort=newest'}
                className="inline-flex items-center gap-2.5 px-7 py-4 rounded-xl font-black text-sm tracking-wide bg-white text-zinc-950 hover:bg-zinc-100 transition-all shadow-md group"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{homepageCms.promoBannerButtonText || 'Yangi mahsulotlarni ko\'rish'}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};
