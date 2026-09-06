import React from 'react';
import { Smartphone, CheckSquare, Store, ArrowRight } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';
import { Reveal } from '../motion';

export const HowItWorks: React.FC = () => {
  const { t } = useI18n();

  return (
    <section className="py-16 md:py-24 bg-white dark:bg-zinc-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <Reveal className="text-center max-w-2xl mx-auto mb-14 space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            <span>{t('pages', 'sections.howEyebrow')}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-zinc-900 dark:text-white font-['Outfit',sans-serif] tracking-tighter">
            {t('pages', 'sections.howTitle')}
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 font-normal">
            {t('pages', 'sections.howSubtitle')}
          </p>
        </Reveal>

        {/* Shopping Journey Steps */}
        <div className="grid max-w-4xl mx-auto grid-cols-1 gap-4">
          <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200/20 p-6 pt-8 pb-10 transition-colors">
            <div className="text-4xl font-black text-zinc-900 dark:text-white mb-4">01</div>
            <h3 className="font-black text-zinc-900 dark:text-white mb-2">Ko'ring</h3>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">
              {t('pages', 'sections.how1Desc')}
            </p>
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200/20 p-6 pt-8 pb-10 transition-colors">
            <div className="text-4xl font-black text-zinc-900 dark:text-white mb-4">02</div>
            <h3 className="font-black text-zinc-900 dark:text-white mb-2">Tanlang</h3>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">
              {t('pages', 'sections.how2Desc')}
            </p>
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200/20 p-6 pt-8 pb-10 transition-colors">
            <div className="text-4xl font-black text-zinc-900 dark:text-white mb-4">03</div>
            <h3 className="font-black text-zinc-900 dark:text-white mb-2">Bog'laning</h3>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">
              {t('pages', 'sections.how3Desc')}
            </p>
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200/20 p-6 pt-8 pb-10 transition-colors">
            <div className="text-4xl font-black text-zinc-900 dark:text-white mb-4">04</div>
            <h3 className="font-black text-zinc-900 dark:text-white mb-2">Do'konga keling</h3>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">
              {t('pages', 'sections.how4Desc')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
