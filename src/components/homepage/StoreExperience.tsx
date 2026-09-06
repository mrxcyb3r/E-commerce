import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Phone, ChevronRight, Navigation, Sparkles, Check, Star, Building2 } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useBrand } from '../../hooks/useBrand';
import { Reveal, Stagger } from '../motion';
import { fadeUp, staggerContainer, staggerItem } from '../../lib/animations';

export const StoreExperience: React.FC = () => {
  const { storeInfo } = useStore();
  const { name: storeName } = useBrand();
  const [activeImage, setActiveImage] = useState(0);

  const storeImages = [
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1920&q=80',
  ];

  const features = [
    { icon: Building2, title: 'Premium Fitting Rooms', description: 'Spacious, well-lit rooms with full-length mirrors and premium seating.' },
    { icon: Star, title: 'Personal Styling', description: 'Book a free styling session with our expert fashion consultants.' },
    { icon: Check, title: 'Instant Alterations', description: 'On-site tailoring for the perfect fit, completed while you shop.' },
    { icon: MapPin, title: 'Easy Parking', description: 'Dedicated customer parking with valet service available.' },
  ];

  const hours = [
    { days: 'Monday - Friday', time: '10:00 AM - 10:00 PM' },
    { days: 'Saturday', time: '10:00 AM - 11:00 PM' },
    { days: 'Sunday', time: '11:00 AM - 9:00 PM' },
  ];

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
                {storeImages.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt={`${storeName} store view ${i + 1}`}
                    className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-700 ${
                      i === activeImage ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                    loading={i === 0 ? 'eager' : 'lazy'}
                    referrerPolicy="no-referrer"
                  />
                ))}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_center,_transparent_0%,_black/40_100%)]" />
              </div>

              <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-white text-[11px] font-black uppercase tracking-widest border border-white/20 mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Flagship Store</span>
                  </div>
                  <h3 className="font-display font-black text-white"
                    style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', lineHeight: '1.1', letterSpacing: '-0.02em' }}>
                    Experience {storeName} in Person
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  {storeImages.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`w-2.5 h-2.5 rounded-full transition-all ${
                        i === activeImage
                          ? 'bg-white w-6'
                          : 'bg-white/40 hover:bg-white/60'
                      }`}
                      aria-label={`View image ${i + 1}`}
                      aria-current={i === activeImage ? 'true' : 'false'}
                    />
                  ))}
                </div>
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
                <span>Visit Us</span>
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
                More Than a Store.
                <br />
                <span className="text-amber-500">A Destination.</span>
              </h2>

            </Reveal>

            <Stagger
              containerVariant={staggerContainer}
              itemVariant={staggerItem}
              className="grid grid-cols-2 gap-4"
            >
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="p-5 rounded-2xl bg-zinc-900/50 border border-border hover:border-zinc-700 transition-all group"
                >
                  <feature.icon className="w-6 h-6 text-amber-500 mb-3 group-hover:scale-110 transition-transform" />
                  <h4 className="font-display font-bold text-white mb-2">{feature.title}</h4>
                  <p className="text-zinc-400 text-sm leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </Stagger>

            <Reveal
              variant={fadeUp}
              transition={{ duration: 0.6, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <h3 className="font-display font-bold text-white mb-4">Opening Hours</h3>
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

            <Reveal
              variant={fadeUp}
              transition={{ duration: 0.6, delay: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="pt-4 border-t border-border"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <MapPin className="w-6 h-6 text-amber-500" />
                  <div>
                    <p className="text-zinc-400 text-sm">Find Us</p>
                    <p className="font-medium text-white">{storeInfo?.address || 'Amir Temur Street 15, Tashkent'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    to="/location"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-accent text-accent-foreground font-black text-sm tracking-wider hover:bg-amber-400 shadow-lg shadow-amber-500/30 transition-all group"
                  >
                    Get Directions
                    <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full glass-strong text-white font-semibold text-sm tracking-wide hover:bg-white/10 transition-all border border-white/10"
                  >
                    Contact Us
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
