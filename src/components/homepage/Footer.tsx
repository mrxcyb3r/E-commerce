import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Youtube, Send, Mail, MapPin, Phone, Clock, ChevronRight, Sparkles } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useBrand } from '../../hooks/useBrand';
import { Reveal } from '../motion';

export const Footer: React.FC = () => {
  const { storeInfo, categories } = useStore();
  const { name: storeName, tagline } = useBrand();

  const footerCategories = categories.filter((c) => c.is_visible).slice(0, 6);

  const navigation = {
    shop: [
      { label: 'New Arrivals', href: '/products?sort=newest' },
      { label: 'Trending', href: '/products?sort=trending' },
      { label: 'Best Sellers', href: '/products?sort=popular' },
      { label: 'Sale', href: '/products?sale=true' },
      { label: 'Gift Cards', href: '/gift-cards' },
    ],
    discover: [
      { label: 'Video Feed', href: '/feed' },
      { label: 'Collections', href: '/collections' },
      { label: 'Style Guide', href: '/style-guide' },
      { label: 'Lookbook', href: '/lookbook' },
      { label: 'Community', href: '/feed' },
    ],
    support: [
      { label: 'Contact Us', href: '/contact' },
      { label: 'Store Locator', href: '/location' },
      { label: 'FAQ', href: '/faq' },
      { label: 'Shipping Info', href: '/shipping' },
      { label: 'Returns', href: '/returns' },
    ],
    company: [
      { label: 'About Us', href: '/about' },
      { label: 'Careers', href: '/careers' },
      { label: 'Press', href: '/press' },
      { label: 'Sustainability', href: '/sustainability' },
      { label: 'Affiliate Program', href: '/affiliates' },
    ],
  };

  return (
    <footer
      id="footer"
      className="bg-background dark:bg-background border-t border-border relative overflow-hidden"
      role="contentinfo"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_0%,_amber-500/3_0%,_transparent_60%)] dark:bg-[radial-gradient(ellipse_60%_60%_at_50%_0%,_amber-500/2_0%,_transparent_60%)]" aria-hidden="true" />

      <div className="relative z-10 max-w-full mx-auto px-6 sm:px-8 lg:px-12 xl:px-16 py-16 lg:py-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-12 mb-16">
          <Reveal
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-2 space-y-6"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-zinc-950" />
              </div>
              <span className="font-display font-black text-white text-xl tracking-tight">{storeName}</span>
            </div>
            <p className="text-zinc-400 leading-relaxed max-w-xs text-base">
              {tagline || 'Premium fashion for modern living. Curated collections designed for everyday confidence.'}
            </p>

            <div className="flex items-center gap-4 pt-4 border-t border-border">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-full bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all" aria-label="Instagram">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-full bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all" aria-label="YouTube">
                <Youtube className="w-5 h-5" />
              </a>
              <a href="https://t.me" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-full bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all" aria-label="Telegram">
                <Send className="w-5 h-5" />
              </a>
              <a href="mailto:hello@example.com" className="p-2.5 rounded-full bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all" aria-label="Email">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </Reveal>

          <Reveal
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <nav aria-label="Shop">
              <h4 className="font-display font-bold text-white mb-4">Shop</h4>
              <ul className="space-y-3" role="list">
                {navigation.shop.map((item) => (
                  <li key={item.label}>
                    <Link
                      to={item.href}
                      className="text-zinc-400 hover:text-white transition-colors group inline-flex items-center gap-2 text-sm"
                    >
                      {item.label}
                      <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-amber-500 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </Reveal>

          <Reveal
            transition={{ duration: 0.6, delay: 0.25 }}
          >
            <nav aria-label="Discover">
              <h4 className="font-display font-bold text-white mb-4">Discover</h4>
              <ul className="space-y-3" role="list">
                {navigation.discover.map((item) => (
                  <li key={item.label}>
                    <Link
                      to={item.href}
                      className="text-zinc-400 hover:text-white transition-colors group inline-flex items-center gap-2 text-sm"
                    >
                      {item.label}
                      <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-amber-500 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </Reveal>

          <Reveal
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <nav aria-label="Support">
              <h4 className="font-display font-bold text-white mb-4">Support</h4>
              <ul className="space-y-3" role="list">
                {navigation.support.map((item) => (
                  <li key={item.label}>
                    <Link
                      to={item.href}
                      className="text-zinc-400 hover:text-white transition-colors group inline-flex items-center gap-2 text-sm"
                    >
                      {item.label}
                      <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-amber-500 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </Reveal>

          <Reveal
            transition={{ duration: 0.6, delay: 0.35 }}
          >
            <h4 className="font-display font-bold text-white mb-4">Visit Our Store</h4>
            <address className="space-y-4 text-zinc-400 not-italic">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <p className="leading-relaxed">{storeInfo?.address || 'Amir Temur Street 15, Tashkent, Uzbekistan'}</p>
              </div>
              <div className="flex items-center gap-3 pl-8">
                <Phone className="w-5 h-5 text-amber-500 shrink-0" />
                <a href={`tel:${storeInfo?.phone || '+998 71 200 00 00'}`} className="hover:text-white transition-colors">
                  {storeInfo?.phone || '+998 71 200 00 00'}
                </a>
              </div>
              <div className="flex items-center gap-3 pl-8">
                <Clock className="w-5 h-5 text-amber-500 shrink-0" />
                <div>
                  <p className="font-medium text-white">Mon-Fri: 10:00 - 22:00</p>
                  <p className="font-medium text-white">Sat: 10:00 - 23:00</p>
                  <p className="font-medium text-white">Sun: 11:00 - 21:00</p>
                </div>
              </div>
            </address>
          </Reveal>
        </div>

        <Reveal
          transition={{ duration: 0.5, delay: 0.5 }}
          className="pt-8 border-t border-border"
        >
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <p className="text-zinc-500 text-sm">
              © {new Date().getFullYear()} {storeName}. All rights reserved.
            </p>

            <div className="flex items-center gap-6">
              <Link to="/privacy" className="text-zinc-500 hover:text-white text-sm transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="text-zinc-500 hover:text-white text-sm transition-colors">Terms of Service</Link>
              <Link to="/cookies" className="text-zinc-500 hover:text-white text-sm transition-colors">Cookie Policy</Link>
            </div>

            <div className="flex items-center gap-3 text-zinc-500 text-sm">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Made with care in Uzbekistan
              </span>
            </div>
          </div>
        </Reveal>
      </div>
    </footer>
  );
};

export default Footer;
