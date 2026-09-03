import React from 'react';
import { 
  MapPin, 
  Clock, 
  Phone, 
  Send, 
  Navigation, 
  ExternalLink,
  Store,
  Check
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { track } from '../../lib/analytics/client';
import { motion } from 'motion/react';

export const StoreLocation: React.FC = () => {
  const { storeInfo } = useStore();

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${storeInfo.address}`
  )}`;

  const yandexMapsUrl = `https://yandex.uz/maps/?text=${encodeURIComponent(
    `${storeInfo.address}`
  )}`;

  return (
    <section id="location" className="py-16 md:py-24 bg-white dark:bg-zinc-900 transition-colors scroll-mt-28">
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
            <Store className="w-3.5 h-3.5" />
            <span>Tashrif buyuring</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-zinc-900 dark:text-white font-['Outfit',sans-serif] tracking-tighter">
            Bizning do'konimiz
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 font-normal">
            Sizni do'konimizda kutib olishdan mamnunmiz. Mahsulotlarni bevosita ko'ring, kiyib ko'ring va xarid qiling.
          </p>
        </motion.div>

        {/* Store Card & Map Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Details Card (5 cols) */}
          <motion.div
            initial={{ opacity: 0, x: -15 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="lg:col-span-5 bg-zinc-50 dark:bg-zinc-800/60 p-6 sm:p-8 rounded-3xl border border-zinc-200 dark:border-zinc-700 flex flex-col justify-between space-y-8"
          >
            <div className="space-y-6">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-400">
                  Manzil
                </span>
                <div className="flex items-start gap-3 mt-2">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 flex items-center justify-center text-zinc-900 dark:text-white shrink-0 border border-zinc-200 dark:border-zinc-700 shadow-2xs">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-base sm:text-lg font-black text-zinc-900 dark:text-white font-['Outfit',sans-serif]">
                      {storeInfo.address}
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
                      {storeInfo.landmark}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <span className="text-xs font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-400">
                  Ish vaqti
                </span>
                <div className="flex items-start gap-3 mt-2">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 flex items-center justify-center text-zinc-900 dark:text-white shrink-0 border border-zinc-200 dark:border-zinc-700 shadow-2xs">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-base font-black text-zinc-900 dark:text-white font-['Outfit',sans-serif]">
                      {storeInfo.workingHours}
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 space-y-0.5 font-medium">
                      <div>{storeInfo.workingHoursDetail?.weekdays || 'Har kuni 08:30 - 20:30'}</div>
                      <div>{storeInfo.workingHoursDetail?.weekend || 'Shanba - Yakshanba: 08:30 - 21:00'}</div>
                      <div className="text-emerald-600 dark:text-emerald-400 font-bold">
                        ✓ {storeInfo.workingHoursDetail?.note || 'Dam olish kunlarisiz xizmatingizdamiz'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <span className="text-xs font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-400">
                  Tezkor aloqa
                </span>
                <div className="flex items-center gap-3 mt-2">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 flex items-center justify-center text-zinc-900 dark:text-white shrink-0 border border-zinc-200 dark:border-zinc-700 shadow-2xs">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <a
                      href={`tel:${storeInfo.phoneRaw || storeInfo.phone}`}
                      onClick={() => track('phone_click')}
                      className="text-base font-black text-zinc-900 dark:text-white hover:underline font-['Outfit',sans-serif]"
                    >
                      {storeInfo.phone}
                    </a>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                      Savollar va mahsulot zaxirasini bilish uchun
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-4 border-t border-zinc-200 dark:border-zinc-700">
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track('directions_click', { metadata: { via: 'google-maps' } })}
                className="w-full flex items-center justify-center gap-2 py-4 px-4 rounded-xl text-sm font-black tracking-wide bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors shadow-sm"
              >
                <Navigation className="w-4 h-4" />
                <span>Xaritada ko'rish</span>
              </a>

              <div className="grid grid-cols-2 gap-2.5">
                <a
                  href={storeInfo.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => track('telegram_click')}
                  className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs font-black bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Telegram</span>
                </a>
                <a
                  href={`tel:${storeInfo.phoneRaw || storeInfo.phone}`}
                  onClick={() => track('phone_click')}
                  className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs font-black bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Qo'ng'iroq</span>
                </a>
              </div>
            </div>
          </motion.div>

          {/* Visual Interactive Map / Location Box (7 cols) */}
          <motion.div
            initial={{ opacity: 0, x: 15 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="lg:col-span-7 relative min-h-[380px] lg:min-h-[460px] rounded-3xl overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 shadow-sm flex flex-col"
          >
            {/* Map Canvas Visual Mock with Map Pin & Route graphics */}
            <div className="absolute inset-0 bg-[#e8ece9] dark:bg-[#18181b] overflow-hidden">
              {/* Stylized vector map grid background */}
              <svg className="w-full h-full opacity-40 dark:opacity-20" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid-pattern)" />
                {/* Simulated streets */}
                <path d="M 0 150 Q 200 180 400 120 T 800 200" fill="none" stroke="currentColor" strokeWidth="16" className="text-zinc-300 dark:text-zinc-700" />
                <path d="M 250 0 Q 300 200 280 500" fill="none" stroke="currentColor" strokeWidth="12" className="text-zinc-300 dark:text-zinc-700" />
                <path d="M 0 350 L 800 320" fill="none" stroke="currentColor" strokeWidth="10" className="text-zinc-300 dark:text-zinc-700" />
              </svg>

              {/* Pin Centered Card */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                {/* Pulse Ring */}
                <div className="relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-zinc-900 dark:bg-white opacity-40" />
                  <div className="relative z-10 w-14 h-14 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center shadow-2xl border-2 border-white dark:border-zinc-900">
                    <Store className="w-7 h-7" />
                  </div>
                </div>

                {/* Pin Tooltip */}
                <div className="mt-3 px-4 py-2 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-700 text-center whitespace-nowrap">
                  <div className="text-xs font-black text-zinc-900 dark:text-white font-['Outfit',sans-serif]">
                    {storeInfo.name} Do'koni
                  </div>
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                    {storeInfo.city}
                  </div>
                </div>
              </div>
            </div>

            {/* Overlaid Map Controls */}
            <div className="relative z-10 mt-auto p-4 sm:p-6 bg-gradient-to-t from-white/95 dark:from-zinc-900/95 via-white/80 dark:via-zinc-900/80 to-transparent flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-zinc-600 dark:text-zinc-300 text-center sm:text-left">
                <span className="font-bold text-zinc-900 dark:text-white">Mo'ljal:</span> {storeInfo.landmark}
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => track('directions_click', { metadata: { via: 'google-maps' } })}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-700 flex items-center gap-1 shadow-xs"
                >
                  <span>Google Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href={yandexMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => track('directions_click', { metadata: { via: 'yandex-maps' } })}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-700 flex items-center gap-1 shadow-xs"
                >
                  <span>Yandex Xarita</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
