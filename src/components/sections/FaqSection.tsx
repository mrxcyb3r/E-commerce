import React, { useState } from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { motion, AnimatePresence } from 'motion/react';

export const FaqSection: React.FC = () => {
  const { publishedFaq, homepageCms } = useStore();
  const [openId, setOpenId] = useState<string | null>(publishedFaq[0]?.id || null);

  const toggleItem = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="py-16 md:py-24 bg-white dark:bg-zinc-900 transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-center mb-12 space-y-2"
        >
          <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Savol-javoblar</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-zinc-900 dark:text-white font-['Outfit',sans-serif] tracking-tighter">
            {homepageCms.faqSectionTitle || "Ko'p beriladigan savollar"}
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-lg mx-auto font-normal">
            {homepageCms.faqSectionSubtitle || "Do'konimiz xizmati va mahsulotlar bo'yicha eng ko'p uchraydigan savollarga javoblar."}
          </p>
        </motion.div>

        {/* Accordion List */}
        <div className="space-y-3">
          {publishedFaq.map((item, index) => {
            const isOpen = openId === item.id;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggleItem(item.id)}
                  aria-expanded={isOpen}
                  className="w-full px-6 py-5 flex items-center justify-between gap-4 text-left transition-colors hover:bg-zinc-100/60 dark:hover:bg-zinc-800/80 focus:outline-none"
                >
                  <span className="text-sm sm:text-base font-black text-zinc-900 dark:text-white font-['Outfit',sans-serif] tracking-tight">
                    {item.question}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-full bg-white dark:bg-zinc-800 flex items-center justify-center shrink-0 border border-zinc-200 dark:border-zinc-700 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900' : 'text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                    >
                      <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed border-t border-zinc-200/40 dark:border-zinc-700/40 font-medium">
                        {item.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
