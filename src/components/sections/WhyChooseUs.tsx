import React from 'react';
import { Clock, Tag, Layers, Store, ThumbsUp } from 'lucide-react';
import { motion } from 'motion/react';
import { useI18n } from '../../i18n/I18nContext';

export const WhyChooseUs: React.FC = () => {
  const { t } = useI18n();

  return (
    <section id="about" className="py-16 md:py-24 bg-zinc-50/50 dark:bg-zinc-950 transition-colors scroll-mt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-center max-w-2xl mx-auto mb-14 space-y-2"
        >
          <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            <Clock className="w-3.5 h-3.5" />
            <span>{t('pages', 'sections.whyEyebrow')}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-zinc-900 dark:text-white font-['Outfit',sans-serif] tracking-tighter">
            {t('pages', 'sections.whyTitle')}
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 font-normal">
            {t('pages', 'sections.whySubtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Avval onlayn ko‘ring */}
          <motion.div
            key="feat-1"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs hover:shadow-md transition-shadow space-y-4"
          >
            <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border border-zinc-200 dark:border-zinc-700">
              <Clock className="w-6 h-6 text-zinc-900 dark:text-white" />
            </div>
            <h3 className="text-lg font-black text-zinc-900 dark:text-white font-['Outfit',sans-serif]">
              {t('pages', 'sections.how1Title')}
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
              {t('pages', 'sections.how1Desc')}
            </p>
          </motion.div>

          {/* Card 2: Narxini bilib oling */}
          <motion.div
            key="feat-2"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs hover:shadow-md transition-shadow space-y-4"
          >
            <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border border-zinc-200 dark:border-zinc-700">
              <Tag className="w-6 h-6 text-zinc-900 dark:text-white" />
            </div>
            <h3 className="text-lg font-black text-zinc-900 dark:text-white font-['Outfit',sans-serif]">
              {t('pages', 'sections.how2Title')}
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
              {t('pages', 'sections.how2Desc')}
            </p>
          </motion.div>

          {/* Card 3: Variantlarni tekshiring */}
          <motion.div
            key="feat-3"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs hover:shadow-md transition-shadow space-y-4"
          >
            <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border border-zinc-200 dark:border-zinc-700">
              <Layers className="w-6 h-6 text-zinc-900 dark:text-white" />
            </div>
            <h3 className="text-lg font-black text-zinc-900 dark:text-white font-['Outfit',sans-serif]">
              {t('pages', 'sections.how3Title')}
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
              {t('pages', 'sections.how3Desc')}
            </p>
          </motion.div>

          {/* Card 4: Kelganingizda tanlash oson */}
          <motion.div
            key="feat-4"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs hover:shadow-md transition-shadow space-y-4"
          >
            <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border border-zinc-200 dark:border-zinc-700">
              <Store className="w-6 h-6 text-zinc-900 dark:text-white" />
            </div>
            <h3 className="text-lg font-black text-zinc-900 dark:text-white font-['Outfit',sans-serif]">
              {t('pages', 'sections.how4Title')}
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
              {t('pages', 'sections.how4Desc')}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
