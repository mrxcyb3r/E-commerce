import React from 'react';
import { Clock, Tag, Layers, Store } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';
import { Reveal, Stagger } from '../motion';

export const WhyChooseUs: React.FC = () => {
  const { t } = useI18n();

  const features = [
    { icon: Clock, titleKey: 'sections.how1Title', descKey: 'sections.how1Desc' },
    { icon: Tag, titleKey: 'sections.how2Title', descKey: 'sections.how2Desc' },
    { icon: Layers, titleKey: 'sections.how3Title', descKey: 'sections.how3Desc' },
    { icon: Store, titleKey: 'sections.how4Title', descKey: 'sections.how4Desc' },
  ];

  return (
    <section id="about" className="py-16 md:py-24 bg-zinc-50/50 dark:bg-background transition-colors scroll-mt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center max-w-2xl mx-auto mb-14 space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            <Clock className="w-3.5 h-3.5" />
            <span>{t('pages', 'sections.whyEyebrow')}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground font-display tracking-tighter">
            {t('pages', 'sections.whyTitle')}
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 font-normal">
            {t('pages', 'sections.whySubtitle')}
          </p>
        </Reveal>

        <Stagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.titleKey}
                className="bg-card p-6 rounded-2xl border border-border shadow-xs hover:shadow-md transition-shadow space-y-4"
              >
                <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border border-border">
                  <Icon className="w-6 h-6 text-foreground" />
                </div>
                <h3 className="text-lg font-black text-foreground font-display">
                  {t('pages', f.titleKey)}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
                  {t('pages', f.descKey)}
                </p>
              </div>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
};
