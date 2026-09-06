import React from 'react';
import { ShieldCheck, Store, Ruler } from 'lucide-react';
import { Stagger } from '../motion';
import { staggerContainer, staggerItem } from '../../lib/animations';

const BENEFITS = [
  {
    icon: <ShieldCheck className="w-5 h-5" />,
    title: "Narxlar ochiq",
    sublabel: "Mahsulot narxini oldindan ko'ring.",
  },
  {
    icon: <Store className="w-5 h-5" />,
    title: "O'lcham va ranglar",
    sublabel: "Mavjud variantlarni mahsulot sahifasida tekshiring.",
  },
  {
    icon: <Ruler className="w-5 h-5" />,
    title: "Mahalliy do'kon",
    sublabel: "Mahsulotni kelib ko'rish va kiyib ko'rish mumkin.",
  },
];

export const TrustBadges: React.FC = () => {
  return (
    <section className="bg-zinc-50/50 dark:bg-background py-8 border-b border-border transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Stagger
          containerVariant={staggerContainer}
          itemVariant={staggerItem}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
        >
          {BENEFITS.map((item) => (
            <div
              key={item.title}
              className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5"
            >
              <div className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center text-foreground shrink-0">
                {item.icon}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-black text-foreground font-display leading-tight">
                  {item.title}
                </div>
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium leading-tight">
                  {item.sublabel}
                </div>
              </div>
            </div>
          ))}
        </Stagger>
      </div>
    </section>
  );
};
