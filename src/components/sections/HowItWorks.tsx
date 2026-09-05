import React from 'react';
import { Smartphone, CheckSquare, Store, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useI18n } from '../../i18n/I18nContext';

export const HowItWorks: React.FC = () => {
  const { t } = useI18n();

  return (
    <section className="py-16 md:py-24 bg-white dark:bg-zinc-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-center max-w-2xl mx-auto mb-14 space-y-2"
        >
          <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            <span>{t('pages', 'sections.howEyebrow')}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-zinc-900 dark:text-white font-['Outfit',sans-serif] tracking-tighter">
            {t('pages', 'sections.howTitle')}
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 font-normal">
            {t('pages', 'sections.howSubtitle')}
          </p>
        </motion.div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          <motion.div
            key="01"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="relative p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-mono font-black text-zinc-900 dark:text-white px-2.5 py-1 bg-white dark:bg-zinc-900 rounded-md border border-zinc-200 dark:border-zinc-700 shadow-2xs">
                  {t('pages', 'sections.how1Title')}
                </span>
                <Smartphone className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white flex items-center justify-center border border-zinc-200 dark:border-zinc-700 shadow-xs">
                </Smartphone>
              </div>

              <h3 className="text-lg font-black text-zinc-900 dark:text-white font-['Outfit',sans-serif] mb-2">
                {t('pages', 'sections.how1Title')}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
                {t('pages', 'sections.how1Desc')}
              </p>
            </div>
          </motion.div>

          <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-zinc-300 dark:text-zinc-600 pointer-events-none">
            <ArrowRight className="w-6 h-6" />
          </div>

          <motion.div
            key="02"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="relative p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <CheckSquare className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white flex items-center justify-center border border-zinc-200 dark:border-zinc-700 shadow-xs">
                </CheckSquare>
              </div>

              <h3 className="text-lg font-black text-zinc-900 dark:text-white font-['Outfit',sans-serif] mb-2">
                {t('pages', 'sections.how2Title')}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
                {t('pages', 'sections.how2Desc')}
              </p>
            </div>
          </motion.div>

          <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-zinc-300 dark:text-zinc-600 pointer-events-none">
            <ArrowRight className="w-6 h-6" />
          </div>

          <motion.div
            key="03"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="relative p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <ArrowRight className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white flex items-center justify-center border border-zinc-200 dark:border-zinc-700 shadow-xs">
                </ArrowRight>
              </div>

              <h3 className="text-lg font-black text-zinc-900 dark:text-white font-['Outfit',sans-serif] mb-2">
                {t('pages', 'sections.how3Title')}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
                {t('pages', 'sections.how3Desc')}
              </p>
            </div>
          </motion.div>

          <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-zinc-300 dark:text-zinc-600 pointer-events-none">
            <ArrowRight className="w-6 h-6" />
          </div>

          <motion.div
            key="04"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="relative p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <Store className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white flex items-center justify-center border border-zinc-200 dark:border-zinc-700 shadow-xs">
                </Store>
              </div>

              <h3 className="text-lg font-black text-zinc-900 dark:text-white font-['Outfit',sans-serif] mb-2">
                {t('pages', 'sections.how4Title')}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
                {t('pages', 'sections.how4Desc')}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
