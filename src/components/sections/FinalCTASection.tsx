import React from 'react';
import { useStore } from '../../context/StoreContext';
import { useBrand } from '../../hooks/useBrand';
import { Sparkles, Phone } from 'lucide-react';

export const FinalCTASection: React.FC = () => {
  const { storeInfo } = useStore();
  const { name: storeName, telegram: storeTelegram, phone: storePhone, primaryColor } = useBrand();

  const eyebrow = 'Yoqtirgan mahsulotingiz bormi?';
  const heading = 'Kelishdan oldin mavjudligini aniqlashtiring — vaqtingizni tejaymiz.';
  const supportingCopy = 'Maxsus sihotga ega bo\'lgan mahsulotlar oldindan saqlanadi. Qaysi narsa qidirilayotgani haqingizni bilibrik — ajratmaq kutilmasin.';
  const ctaTelegramText = 'Telegram orqali yozish';
  const ctaPhoneText = 'Qo\'ng\'iroq qilish';

  return (
    <section id="final-cta" className="py-10 md:py-16 bg-white dark:bg-zinc-900 transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-zinc-950 dark:bg-zinc-900 rounded-2xl p-8 md:p-10 border border-zinc-200/20 dark:border-zinc-800/20">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <p className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-500 mb-4">
                <Sparkles className="w-3 h-3" />
                {eyebrow}
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-zinc-900 dark:text-white font-['Outfit',sans-serif] tracking-tighter leading-tight">
                {heading}
              </h2>
              <p className="text-zinc-500 dark:text-zinc-300 text-lg font-normal leading-relaxed mt-3">
                {supportingCopy}
              </p>
            </div>

            <div className="space-y-4">
              {storeTelegram && (
                <a
                  href={storeTelegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm tracking-wide bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 hover:bg-zinc-800 transition-all shadow-sm"
                  title="Telegram orqali yozish"
                >
                  <span>{ctaTelegramText}</span>
                  <span className="hidden sm:inline w-3.5 h-3.5" />
                </a>
              )}

              {storePhone && (
                <a
                  href={`tel:${storePhone}`}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm tracking-wide bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 hover:bg-zinc-800 transition-all shadow-sm"
                  title="Qo\'ng\'iroq qilish"
                >
                  <span>{ctaPhoneText}</span>
                  <Phone className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
