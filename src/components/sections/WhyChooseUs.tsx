import React from 'react';
import { Clock, Tag, Layers, ThumbsUp, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

export const WhyChooseUs: React.FC = () => {
  const features = [
    {
      icon: <Clock className="w-6 h-6 text-zinc-900 dark:text-white" />,
      title: 'Vaqtingizni tejang',
      description: 'Mahsulotlarni uydan chiqmasdan onlayn ko\'rib chiqing va do\'konga kelganingizda qidirishga vaqt sarflamang.',
    },
    {
      icon: <Tag className="w-6 h-6 text-zinc-900 dark:text-white" />,
      title: 'Narxlarni oldindan ko\'ring',
      description: 'Barcha narxlar 100% shaffof va ochiq. Do\'konga kelganda narxlar bo\'yicha noaniqliklar bo\'lmaydi.',
    },
    {
      icon: <Layers className="w-6 h-6 text-zinc-900 dark:text-white" />,
      title: 'Ko\'proq tanlov',
      description: 'Barcha toifalar, o\'lchamlar va rang variantlarini bitta qulay platformada taqqoslang va tanlang.',
    },
    {
      icon: <ThumbsUp className="w-6 h-6 text-zinc-900 dark:text-white" />,
      title: 'Qulay xarid tajribasi',
      description: 'Mahalliy do\'konimizga tashrif buyurib, mahsulotni qo\'l bilan ushlab, kiyib ko\'rib ishonch bilan xarid qiling.',
    },
  ];

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
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Afzalliklarimiz</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-zinc-900 dark:text-white font-['Outfit',sans-serif] tracking-tighter">
            Nega bizni tanlashadi?
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 font-normal">
            Do'kondagi sifatli mahsulotlarni onlayn ko'rib, o'zingizga mosini tanlang.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs hover:shadow-md transition-shadow space-y-4"
            >
              <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border border-zinc-200 dark:border-zinc-700">
                {feature.icon}
              </div>
              <h3 className="text-lg font-black text-zinc-900 dark:text-white font-['Outfit',sans-serif]">
                {feature.title}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
