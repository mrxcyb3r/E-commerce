import React from 'react';
import { ShieldCheck, Store, RotateCcw, Ruler } from 'lucide-react';
import { motion } from 'motion/react';

const GUARANTEES = [
  {
    icon: <ShieldCheck className="w-5 h-5" />,
    title: "Haqiqiy kafolat",
    sublabel: 'Faqat original mahsulotlar',
  },
  {
    icon: <Store className="w-5 h-5" />,
    title: "Mahalliy do'kon",
    sublabel: 'Kiyib ko\'rish imkoniyati',
  },
  {
    icon: <RotateCcw className="w-5 h-5" />,
    title: 'Oson qaytarish',
    sublabel: 'Yoqmagan narsani qaytaring',
  },
  {
    icon: <Ruler className="w-5 h-5" />,
    title: "O'lcham almashinuvi",
    sublabel: 'Bepul o\'lcham almashtirish',
  },
];

export const TrustBadges: React.FC = () => {
  return (
    <section className="bg-zinc-50/50 dark:bg-zinc-950 py-8 border-b border-zinc-200 dark:border-zinc-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {GUARANTEES.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: index * 0.08 }}
              className="flex items-center gap-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 px-4 py-3.5"
            >
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-900 dark:text-white shrink-0">
                {item.icon}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-black text-zinc-900 dark:text-white font-['Outfit',sans-serif] leading-tight">
                  {item.title}
                </div>
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium leading-tight">
                  {item.sublabel}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};