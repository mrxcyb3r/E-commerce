import React from 'react';
import { Handshake } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useI18n } from '../../i18n/I18nContext';

export const BrandMarquee: React.FC = () => {
  const { homepageCms } = useStore();
  const { t } = useI18n();

  const brands = Array.isArray(homepageCms.brands)
    ? homepageCms.brands.filter((b) => typeof b === 'string' && b.trim().length > 0)
    : [];

  if (brands.length === 0) return null;

  const items = [...brands, ...brands];

  return (
    <section
      id="brand-strip"
      className="border-y border-border bg-zinc-50/50 dark:bg-background py-5 overflow-hidden transition-colors"
      aria-label={t('pages', 'sections.brandsAria')}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-6">
        <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400 shrink-0">
          <Handshake className="w-3.5 h-3.5" />
          {t('pages', 'sections.brandsLabel')}
        </span>
        <div className="relative flex-1 min-w-0 overflow-hidden">
          <div className="marquee-track items-center gap-12">
            {items.map((brand, index) => (
              <span
                key={`${brand}-${index}`}
                className="text-sm font-black text-zinc-400 dark:text-zinc-600 tracking-wide whitespace-nowrap uppercase"
              >
                {brand}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};