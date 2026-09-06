import React from 'react';
import { useStore } from '../../context/StoreContext';
import { MapPin, Clock, Phone, Send, ExternalLink } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';
import { track } from '../../lib/analytics/client';

export const StoreLocation: React.FC = () => {
  const { storeInfo } = useStore();
  const { t } = useI18n();

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${storeInfo.address || ''}`
  )}`;

  const yandexMapsUrl = `https://yandex.uz/maps/?text=${encodeURIComponent(
    `${storeInfo.address || ''}`
  )}`;

  // Build address line from configured components
  const addressLines = [];
  if (storeInfo.address) addressLines.push(storeInfo.address);
  if (storeInfo.city) addressLines.push(storeInfo.city);

  const fullAddress = addressLines.join(', ') || '';

  // Build hours string from configured components
  let hoursText = storeInfo.workingHours || '';
  if (storeInfo.workingHoursDetail) {
    const { weekdays, weekend, note } = storeInfo.workingHoursDetail;
    if (weekdays) hoursText += ` ${weekdays}`;
    if (weekend) hoursText += ` ${weekend}`;
    if (note) hoursText += ` ${note}`;
  }

  return (
    <section id="location" className="py-8 md:py-12 bg-card transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground font-display tracking-tighter">
            {t('pages', 'sections.locationTitle')}
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm mt-2">
            {t('pages', 'sections.locationSubtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Address & Contact */}
          <div className="space-y-4">
            {/* Address */}
            {fullAddress && (
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-zinc-600 dark:text-zinc-400 mt-1 shrink-0" />
                <span className="text-foreground flex-1 font-medium">
                  {fullAddress}
                </span>
              </div>
            )}

            {storeInfo.city && (
              <div className="flex items-center gap-1 text-sm text-zinc-500 dark:text-zinc-400">
                {storeInfo.city},
                <span>O'zbekiston</span>
              </div>
            )}

            {/* Hours */}
            {storeInfo.workingHours && (
              <div className="flex items-center gap-1 text-sm text-zinc-500 dark:text-zinc-400">
                <Clock className="w-3.5 h-3.5" />
                {storeInfo.workingHours}
              </div>
            )}

            {/* Phone */}
            {storeInfo.phone && (
              <div>
                <Phone className="w-4 h-4 text-zinc-600 dark:text-zinc-400 mt-0.5 shrink-0" />
                <a
                  href={`tel:${storeInfo.phoneRaw || storeInfo.phone}`}
                  onClick={() => track('phone_click')}
                  className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors font-bold"
                >
                  {storeInfo.phone}
                </a>
              </div>
            )}

            {/* Telegram */}
            {storeInfo.telegramUsername && (
              <div>
                <Send className="w-4 h-4 text-zinc-600 dark:text-zinc-400 mt-0.5 shrink-0" />
                <a
                  href={`https://t.me/${storeInfo.telegramUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                  title="Telegram orqali bog'lanish"
                >
                  {t('common', 'telegram')}
                </a>
              </div>
            )}
          </div>

          {/* Actions & Map */}
          <div className="space-y-3">
            {storeInfo.telegramUsername && (
              <a
                href={`https://t.me/${storeInfo.telegramUsername}/send`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl text-sm font-black tracking-wide bg-foreground text-background dark:bg-card dark:text-card-foreground shadow-sm"
                title="Telegram yozish"
              >
                <Send className="w-3.5 h-3.5" />
                {t('nav', 'telegramContact')}
              </a>
            )}

            {fullAddress && (
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl text-sm font-black tracking-wide bg-foreground text-background dark:bg-card dark:text-card-foreground shadow-sm"
                title="Xaritada ko'rish"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                {t('pages', 'sections.locationMap')}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
