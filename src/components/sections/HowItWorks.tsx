import React from 'react';
import { Smartphone, CheckSquare, Heart, Store, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Onlayn ko\'ring',
      description: 'Mahsulotlarni istalgan vaqtda uyingizdan yoki yo\'lda bemalol ko\'rib chiqing.',
      icon: <Smartphone className="w-5 h-5" />,
    },
    {
      step: '02',
      title: 'Tanlang',
      description: 'Narx, o\'lcham va rang bo\'yicha o\'zingizga mos tanlovni aniqlang.',
      icon: <CheckSquare className="w-5 h-5" />,
    },
    {
      step: '03',
      title: 'Saqlang',
      description: 'Yoqtirgan mahsulotlaringizni sevimlilarga qo\'shib, ro\'yxat tuzing.',
      icon: <Heart className="w-5 h-5" />,
    },
    {
      step: '04',
      title: 'Do\'konga tashrif buyuring',
      description: 'Mahsulotni ko\'ring, sinab ko\'ring va ishonch bilan xarid qiling.',
      icon: <Store className="w-5 h-5" />,
    },
  ];

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
            <span>Oddiy va tushunarli</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-zinc-900 dark:text-white font-['Outfit',sans-serif] tracking-tighter">
            Qanday ishlaydi?
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 font-normal">
            Ortiqcha vaqt yo'qotmasdan, o'zingizga ma'qul xaridni 4 ta oddiy qadamda amalga oshiring.
          </p>
        </motion.div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((item, index) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="relative p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="text-xs font-mono font-black text-zinc-900 dark:text-white px-2.5 py-1 bg-white dark:bg-zinc-900 rounded-md border border-zinc-200 dark:border-zinc-700 shadow-2xs">
                    {item.step}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white flex items-center justify-center border border-zinc-200 dark:border-zinc-700 shadow-xs">
                    {item.icon}
                  </div>
                </div>

                <h3 className="text-lg font-black text-zinc-900 dark:text-white font-['Outfit',sans-serif] mb-2">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
                  {item.description}
                </p>
              </div>

              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-zinc-300 dark:text-zinc-600 pointer-events-none">
                  <ArrowRight className="w-6 h-6" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
