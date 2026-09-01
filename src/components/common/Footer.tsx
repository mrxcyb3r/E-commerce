import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingBag, 
  MapPin, 
  Phone, 
  Clock, 
  Send, 
  Instagram, 
  Facebook, 
  ArrowUpRight,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const Footer: React.FC = () => {
  const { storeInfo, categories } = useStore();

  return (
    <footer className="bg-zinc-100 dark:bg-zinc-900/90 text-zinc-800 dark:text-zinc-200 border-t border-zinc-200 dark:border-zinc-800 pt-16 pb-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-12 border-b border-zinc-200 dark:border-zinc-800">
          {/* Col 1 & 2: Brand Information */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5 group inline-flex">
              <div className="w-9 h-9 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center font-black text-base shadow-xs">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <span className="font-black text-2xl tracking-tighter text-zinc-900 dark:text-white font-['Outfit',sans-serif]">
                {storeInfo.name}
              </span>
            </Link>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-sm leading-relaxed font-normal">
              {storeInfo.description || 'Zamonaviy kiyim-kechak va poyabzallar do\'koni'}. Onlayn ko'ring, tanlang va do'konga kelib qulay xarid qiling.
            </p>
            
            <div className="pt-2 flex items-center gap-3">
              <a
                href={storeInfo.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-700 dark:text-zinc-300 hover:text-blue-500 hover:border-blue-500 transition-colors"
                aria-label="Telegram"
              >
                <Send className="w-4 h-4" />
              </a>
              {storeInfo.instagram && (
                <a
                  href={storeInfo.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-700 dark:text-zinc-300 hover:text-pink-500 hover:border-pink-500 transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {storeInfo.facebook && (
                <a
                  href={storeInfo.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-700 dark:text-zinc-300 hover:text-blue-600 hover:border-blue-600 transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              )}
            </div>

            <div className="pt-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40 text-xs font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>Haqiqiy narxlar va mahalliy do'kon kafolati</span>
              </div>
            </div>
          </div>

          {/* Col 3: Navigation Links */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
              Bo'limlar
            </h3>
            <ul className="space-y-2.5 text-sm font-medium">
              <li>
                <Link to="/" className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                  Asosiy sahifa
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                  Barcha mahsulotlar
                </Link>
              </li>
              <li>
                <Link to="/feed" className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors flex items-center gap-1.5 font-bold">
                  <span>Videolar</span>
                  <span className="px-1.5 py-0.2 text-[9px] font-black uppercase bg-amber-400 text-zinc-950 rounded">Reels</span>
                </Link>
              </li>
              <li>
                <Link to="/favorites" className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                  Sevimlilar
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                  Biz haqimizda
                </Link>
              </li>
              <li>
                <Link to="/location" className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                  Do'kon manzili
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                  Bog'lanish
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Dynamic Categories */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
              Toifalar
            </h3>
            <ul className="space-y-2.5 text-sm font-medium">
              {categories.slice(0, 5).map((cat) => (
                <li key={cat.id}>
                  <Link to={`/products?category=${cat.id}`} className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 5: Store & Contacts */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
              Do'kon aloqasi
            </h3>
            <ul className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400 font-medium">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-zinc-900 dark:text-zinc-100 shrink-0 mt-0.5" />
                <span>{storeInfo.address}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-zinc-900 dark:text-zinc-100 shrink-0" />
                <span>{storeInfo.workingHours}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-zinc-900 dark:text-zinc-100 shrink-0" />
                <a
                  href={`tel:${storeInfo.phoneRaw || storeInfo.phone}`}
                  className="hover:text-zinc-900 dark:hover:text-white transition-colors font-bold"
                >
                  {storeInfo.phone}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Send className="w-4 h-4 text-zinc-900 dark:text-zinc-100 shrink-0" />
                <a
                  href={storeInfo.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-zinc-900 dark:text-white font-bold hover:underline"
                >
                  {storeInfo.telegramUsername}
                  <ArrowUpRight className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 dark:text-zinc-500 font-medium">
          <div>
            © 2026 {storeInfo.name}. Barcha huquqlar himoyalangan.
          </div>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1 font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Sifatli va qulay xarid
            </span>
            <span>•</span>
            <span>{storeInfo.city}, O'zbekiston</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
