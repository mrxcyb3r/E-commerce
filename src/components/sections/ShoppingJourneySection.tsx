import React from 'react';
import { motion } from 'motion/react';

export const ShoppingJourneySection: React.FC = () => {
  const steps = [
    {
      number: '01',
      title: 'Ko\'ring',
      description: 'Mahsulotlarni onlayn ko\'ring, kategoriya bo\'icha tanlang.',
    },
    {
      number: '02',
      title: 'Tanlang',
      description: 'Narx, o\'lcham va rangni tekshiring.',
    },
    {
      number: '03',
      title: "Bog'laning",
      description: 'Telegram yoki telefon orqali mavjudligini aniqlang.',
    },
    {
      number: '04',
      title: "Do'konga keling",
      description: 'Mahsulotni ko\'rib, kiyib ko\'ring va xarid qiling.',
    },
  ];

  return (
    <section id="shopping-journey" className="py-6 md:py-8 bg-white dark:bg-zinc-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-4">
          <div className="text-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white font-['Outfit',sans-serif] tracking-tighter">
              Qanday xarid qilinadi
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm font-normal">
              Qarindoshi do\'konga tashrif buyurish uchun oddiy, practical 4 qadam.
            </p>
          </div>

          {steps.map((step) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: (Number(step.number) - 1) * 0.1 }}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-black text-zinc-900 dark:text-white bg-zinc-100 dark:bg-zinc-800/30 transition-colors">
                {step.number}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-zinc-900 dark:text-white text-sm">
                  {step.title}
                </p>
                <p className="text-zinc-500 dark:text-zinc-400 text-xs">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};