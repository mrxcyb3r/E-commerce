import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useBrand } from '../../hooks/useBrand';
import { Reveal } from '../motion';

export const EditorialCampaign: React.FC = () => {
  const { storeInfo, homepageCms } = useStore();
  const { name: storeName, primaryColor } = useBrand();

  const eyebrow = 'Yangi viewport';
  const heading = 'Har kuni kiyishga mos tanlov.';
  const description = 'Ish uchun, sayr uchun va oddiy kunlar uchun — bir joyda yig\'ilgan qulay va sifatli mahsulotlar.';
  const ctaText = 'Kolleksiyani ko\'rish';

  // Use store-configured image, hero image, or logo as campaign image
  let campaignImage = '';
  if (storeInfo.logoUrl) {
    campaignImage = storeInfo.logoUrl;
  } else if (homepageCms?.heroImage) {
    campaignImage = homepageCms.heroImage;
  } else {
    campaignImage = 'https://images.unsplash.com/photo-1500695160351-6891d255e0e2?auto=format&fit=crop&w=1200&q=80';
  }

  return (
    <section id="campaign" className="py-10 md:py-16 bg-card transition-colors scroll-mt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-6 items-center">
          <Reveal className="space-y-3">
            <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-500">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{eyebrow}</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground font-display tracking-tighter">
              {heading}
            </h2>

            <p className="text-zinc-600 dark:text-zinc-400 text-lg font-normal leading-relaxed">
              {description}
            </p>

            <div className="mt-4">
              <Link
                to="/products"
                className={`inline-flex items-center gap-2.5 px-6 py-3 rounded-xl font-black text-sm tracking-wide ${
                  primaryColor ? `bg-${primaryColor} text-white` : 'bg-zinc-900 text-white'
                } hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all shadow-sm hover:shadow-md group`}
              >
                <span>{ctaText}</span>
                <Sparkles className="w-3.5 h-3.5" />
              </Link>
            </div>
          </Reveal>

          {/* Campaign image or product showcase */}
          <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-sm dark:shadow-zinc-800">
            <img
              src={campaignImage}
              alt={eyebrow}
              className="w-full h-full object-cover transition-transform duration-500 ease-out"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/30 to-transparent opacity-80 dark:from-zinc-900 dark:via-zinc-950/50" />
          </div>
        </div>
      </div>
    </section>
  );
};
