import React from 'react';
import { useStore } from '../context/StoreContext';
import { WhyChooseUs } from '../components/sections/WhyChooseUs';
import { HowItWorks } from '../components/sections/HowItWorks';
import { StoreLocation } from '../components/sections/StoreLocation';
import { ShoppingBag, CheckCircle2, Store, Sparkles } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';

export const AboutPage: React.FC = () => {
  const { storeInfo, aboutCms } = useStore();
  const { t } = useI18n();

  return (
    <div className="pt-28 pb-20 space-y-16">
      {/* Hero Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>{t('pages', 'about.badge')}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-zinc-900 dark:text-white font-['Outfit',sans-serif] tracking-tighter">
            {aboutCms.title || `${storeInfo.name} — ${t('pages', 'about.titleFallback')}`}
          </h1>

          <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-300 leading-relaxed">
            {aboutCms.mainStory || t('pages', 'about.mainStoryFallback')}
          </p>
        </div>

        {/* Visual Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-zinc-900 dark:text-white font-['Outfit',sans-serif] tracking-tight">
              {t('pages', 'about.pillar1Title')}
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {t('pages', 'about.pillar1Desc')}
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center">
              <Store className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-zinc-900 dark:text-white font-['Outfit',sans-serif] tracking-tight">
              {t('pages', 'about.pillar2Title')}
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {t('pages', 'about.pillar2Desc', storeInfo.address)}
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-zinc-900 dark:text-white font-['Outfit',sans-serif] tracking-tight">
              {t('pages', 'about.pillar3Title')}
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {t('pages', 'about.pillar3Desc')}
            </p>
          </div>
        </div>
      </section>

      <WhyChooseUs />
      <HowItWorks />
      <StoreLocation />
    </div>
  );
};
