import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, ChevronRight, Navigation, Phone, Sparkles } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useBrand } from '../../hooks/useBrand';
import { useI18n } from '../../i18n/I18nContext';
import { Reveal } from '../motion';
import { fadeUp } from '../../lib/animations';

export const StoreExperience: React.FC = () => {
  const { storeInfo } = useStore();
  const { name: storeName } = useBrand();
  const { t } = useI18n();

  const storeImage = storeInfo?.logoUrl || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1920&q=80';

  const hours = storeInfo?.workingHoursDetail
    ? [
        { days: 'Hafta ichi', time: storeInfo.workingHoursDetail.weekdays },
        { days: 'Dam olish kunlari', time: storeInfo.workingHoursDetail.weekend },
      ].filter((h) => h.time)
    : storeInfo?.workingHours
      ? [{ days: t('pages', 'sections.locationDays'), time: storeInfo.workingHours }]
      : [];

  return (
    <section
      id="store-experience"
      className="section-padding bg-background dark:bg-background relative overflow-hidden"
      aria-labelledby="store-heading"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_80%_0%,_amber-500/3_0%,_transparent_60%)] dark:bg-[radial-gradient(ellipse_80%_60%_at_80%_0%,_amber-500/2_0%,_transparent_60%)]" aria-hidden="true" />

      <div className="relative z-10 max-w-full mx-auto px-6 sm:px-8 lg:px-12 xl:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          <div className="lg:col-span-7 relative">
            <Reveal
              variant={fadeUp}
              transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="relative aspect-[4/3] rounded-3xl overflow-hidden"
            >
              <div className="absolute inset-0">
                <img
                  src={storeImage}
                  alt={`${storeName} store`}
                  className="w-full h-full object-cover object-center"
                  loading="eager"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_center,_transparent_0%,_black/40_100%)]" />
              </div>

              <div className="absolute bottom-6 left-6 right-6">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-white text-[11px] font-black uppercase tracking-widest border border-white/20 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>{t('pages', 'sections.storeExperienceFlagship')}</span>
                </div>
                <h3 className="font-display font-black text-white"
                  style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', lineHeight: '1.1', letterSpacing: '-0.02em' }}>
                  {t('pages', 'sections.storeExperienceDesc', storeName)}
                </h3>
              </div>

              <div className="absolute top-6 right-6 flex flex-col gap-2">
                <button className="p-3 rounded-full bg-white/10 backdrop-blur-sm text-white/90 hover:bg-white/20 border border-white/20 transition-all" aria-label="Get directions">
                  <Navigation className="w-5 h-5" />
                </button>
                <button className="p-3 rounded-full bg-white/10 backdrop-blur-sm text-white/90 hover:bg-white/20 border border-white/20 transition-all" aria-label="Share location">
                  <Phone className="w-5 h-5" />
                </button>
              </div>
            </Reveal>
          </div>

          <div className="lg:col-span-5 space-y-8">
            <Reveal
              variant={fadeUp}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-800 border border-zinc-700 text-[11px] font-black uppercase tracking-widest text-zinc-400 mb-6">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>{t('pages', 'sections.storeExperienceEyebrow')}</span>
              </div>
              <h2
                id="store-heading"
                className="font-display font-black tracking-tightest text-white mb-6"
                style={{
                  fontSize: 'clamp(2rem, 4vw, 3rem)',
                  lineHeight: '1.05',
                  letterSpacing: '-0.03em',
                }}
              >
                {t('pages', 'sections.storeExperienceTitle')}
                <br />
                <span className="text-amber-500">{t('pages', 'sections.storeExperienceSubtitle')}</span>
              </h2>
            </Reveal>

            {hours.length > 0 && (
              <Reveal
                variant={fadeUp}
                transition={{ duration: 0.6, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <h3 className="font-display font-bold text-white mb-4">{t('pages', 'sections.storeExperienceOpeningHours')}</h3>
                <div className="space-y-3">
                  {hours.map((hour, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/50 border border-border hover:border-zinc-700 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-amber-500" />
                        <span className="font-medium text-white">{hour.days}</span>
                      </div>
                      <span className="text-zinc-300 font-medium">{hour.time}</span>
                    </div>
                  ))}
                </div>
              </Reveal>
            )}

            <Reveal
              variant={fadeUp}
              transition={{ duration: 0.6, delay: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="pt-4 border-t border-border"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <MapPin className="w-6 h-6 text-amber-500" />
                  <div>
                    <p className="text-zinc-400 text-sm">{t('pages', 'sections.storeExperienceFindUs')}</p>
                    <p className="font-medium text-white">{storeInfo?.address || ''}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    to="/location"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-accent text-accent-foreground font-black text-sm tracking-wider hover:bg-amber-400 shadow-lg shadow-amber-500/30 transition-all group"
                  >
                    {t('pages', 'sections.storeExperienceGetDirections')}
                    <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full glass-strong text-white font-semibold text-sm tracking-wide hover:bg-white/10 transition-all border border-white/10"
                  >
                    {t('pages', 'sections.storeExperienceContactUs')}
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StoreExperience;
