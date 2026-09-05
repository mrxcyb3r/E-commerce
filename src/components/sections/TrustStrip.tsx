import React from 'react';
import { useStore } from '../../context/StoreContext';
import { useBrand } from '../../hooks/useBrand';
import { motion } from 'motion/react';
import { ShieldCheck, Ruler } from 'lucide-react';

export const TrustStrip: React.FC = () => {
  const { storeInfo, publishedProducts } = useStore();
  const { name: storeName, primaryColor } = useBrand();

  const items = [];

  // Narxlar ochiq - supported by showing real prices
  items.push({
    icon: <ShieldCheck />,
    title: 'Narxlar ochiq',
    sublabel: 'Barcha narxlar ochiq ko\'rsatilgan, yotanmagan ustamalar yo\'q.',
  });

  // O'lcham va rang ko'rsatilgan - from product data
  items.push({
    icon: <Ruler />,
    title: 'O\'lcham va ranglar',
    sublabel: 'Mavjud o\'lchamlar va ranglar mahsulot sahifasidagi',
  });

  // Do'konda ko'rib ko'rish mumkin - from store location
  if (storeInfo.address) {
    items.push({
      icon: <span className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-zinc-500 dark:text-zinc-400">🏪</span>,
      title: 'Mahalliy do\'kon',
      sublabel: "Do'konda ko'rib ko'rish imkoniyati mavjud.",
    });
  }

  // Telegram orqali bog'lanish - from store config
  if (storeInfo.telegramUsername) {
    items.push({
      icon: <span className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-zinc-500 dark:text-zinc-400">💬</span>,
      title: 'Telegram orqali bog\'lanish',
      sublabel: 'Telegram orqali savollaringizga tez javob beramiz.',
    });
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <section
      className="border-y border-zinc-200/20 bg-white dark:bg-zinc-900/50 transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-1.5 py-2.5 text-xs font-black uppercase tracking-wider">
          {items.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.08 }}
              className="flex items-center gap-2.5 flex-wrap"
            >
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0">
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-zinc-900 dark:text-white">{item.title}</p>
                <p className="text-zinc-500 dark:text-zinc-400 line-clamp-1">{item.sublabel}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};