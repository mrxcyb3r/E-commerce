import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  MapPin,
  Phone,
  Clock,
  Send,
  Instagram,
  ArrowUpRight,
  Sparkles,
  Mail,
  ExternalLink,
} from 'lucide-react';
import { useBrand } from '../../hooks/useBrand';
import { useStore } from '../../context/StoreContext';
import { track } from '../../lib/analytics/client';
import { useI18n } from '../../i18n/I18nContext';
import { Reveal, Stagger } from '../motion';

export const Footer: React.FC = () => {
  const storeInfo = useBrand();
  const { publishedCategories: categories } = useStore();
  const { t } = useI18n();

  const shopLinks = [
    { label: t('footer', 'allProducts'), href: '/products' },
    { label: t('footer', 'newArrivals'), href: '/products?sort=newest' },
    { label: t('footer', 'bestSellers'), href: '/products?sort=popular' },
    { label: t('footer', 'onSale'), href: '/products?sale=true' },
  ];

  const helpLinks = [
    { label: t('footer', 'contact'), href: '/contact' },
    { label: t('footer', 'faq'), href: '/faq' },
    { label: t('footer', 'shipping'), href: '/shipping' },
    { label: t('footer', 'returns'), href: '/returns' },
  ];

  return (
    <footer
      id="footer"
      className="bg-background border-t border-border"
      role="contentinfo"
    >
      {/* CTA Section */}
      <Reveal
        transition={{ duration: 0.6, delay: 0.1 }}
        className="py-20 lg:py-28 border-b border-border"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2
            className="font-display font-black text-foreground mb-4"
            style={{ fontSize: 'clamp(1.5rem, 4vw, 3rem)' }}
          >
            {t('footer', 'ctaTitle')}
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto mb-8">
            {t('footer', 'ctaDescription')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={storeInfo.telegram}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track('telegram_click')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-foreground text-background font-bold text-sm hover:opacity-90 transition-opacity"
            >
              <Send className="w-4 h-4" />
              {t('footer', 'visitStore')}
            </a>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border text-foreground font-bold text-sm hover:bg-muted transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              {t('footer', 'allProducts')}
            </Link>
          </div>
        </div>
      </Reveal>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          {/* Brand Column */}
          <Reveal transition={{ duration: 0.6, delay: 0.15 }} className="space-y-5">
            <Link to="/" className="flex items-center gap-2.5">
              {storeInfo.logoUrl ? (
                <img
                  src={storeInfo.logoUrl}
                  referrerPolicy="no-referrer"
                  alt=""
                  className="w-9 h-9 rounded-xl object-cover"
                />
              ) : (
                <div className="w-9 h-9 rounded-xl bg-foreground text-background flex items-center justify-center font-black text-base">
                  <ShoppingBag className="w-4 h-4" />
                </div>
              )}
              <span className="font-display font-black text-foreground text-xl tracking-tight">
                {storeInfo.name}
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              {storeInfo.tagline || t('footer', 'tagline')}. {t('footer', 'taglineDesc')}
            </p>
            <Stagger className="flex items-center gap-3 pt-2">
              {storeInfo.socialLinks.instagram && (
                <a
                  href={storeInfo.socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {storeInfo.telegram && (
                <a
                  href={storeInfo.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => track('telegram_click')}
                  className="w-10 h-10 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Telegram"
                >
                  <Send className="w-4 h-4" />
                </a>
              )}
              {storeInfo.email && (
                <a
                  href={`mailto:${storeInfo.email}`}
                  className="w-10 h-10 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Email"
                >
                  <Mail className="w-4 h-4" />
                </a>
              )}
            </Stagger>
          </Reveal>

          {/* Shop Column */}
          <Reveal transition={{ duration: 0.6, delay: 0.2 }} className="space-y-5">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
              {t('footer', 'sections')}
            </h3>
            <nav aria-label="Shop">
              <ul className="space-y-3" role="list">
                {shopLinks.map((item) => (
                  <li key={item.label}>
                    <Link
                      to={item.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    to="/feed"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {t('footer', 'videos')}
                  </Link>
                </li>
              </ul>
            </nav>
          </Reveal>

          {/* Help Column */}
          <Reveal transition={{ duration: 0.6, delay: 0.25 }} className="space-y-5">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
              {t('footer', 'help')}
            </h3>
            <nav aria-label="Help">
              <ul className="space-y-3" role="list">
                {helpLinks.map((item) => (
                  <li key={item.label}>
                    <Link
                      to={item.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </Reveal>

          {/* Connect Column */}
          <Reveal transition={{ duration: 0.6, delay: 0.3 }} className="space-y-5">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
              {t('footer', 'connect')}
            </h3>
            <ul className="space-y-3" role="list">
              <li className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 text-foreground shrink-0" />
                <span>{storeInfo.address}</span>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <Phone className="w-4 h-4 text-foreground shrink-0" />
                <a
                  href={`tel:${storeInfo.phoneRaw || storeInfo.phone}`}
                  onClick={() => track('phone_click')}
                  className="hover:text-foreground transition-colors font-bold"
                >
                  {storeInfo.phone}
                </a>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <Clock className="w-4 h-4 text-foreground shrink-0" />
                <span>{storeInfo.workingHours}</span>
              </li>
              {storeInfo.telegramUsername && (
                <li className="flex items-center gap-2.5 text-sm text-muted-foreground">
                  <Send className="w-4 h-4 text-foreground shrink-0" />
                  <a
                    href={storeInfo.telegram}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => track('telegram_click')}
                    className="inline-flex items-center gap-1 text-foreground font-bold hover:underline"
                  >
                    {storeInfo.telegramUsername}
                    <ArrowUpRight className="w-3 h-3" />
                  </a>
                </li>
              )}
            </ul>
          </Reveal>
        </div>
      </div>

      {/* Bottom Bar */}
      <Reveal
        transition={{ duration: 0.5, delay: 0.4 }}
        className="border-t border-border"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <p>
              &copy; {new Date().getFullYear()} {storeInfo.name}.{' '}
              {t('footer', 'allRights')}
            </p>
            <div className="flex items-center gap-4">
              <Link to="/privacy" className="hover:text-foreground transition-colors">
                {t('footer', 'privacy')}
              </Link>
              <Link to="/terms" className="hover:text-foreground transition-colors">
                {t('footer', 'terms')}
              </Link>
              <span className="inline-flex items-center gap-1 font-bold">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                {storeInfo.city}, O'zbekiston
              </span>
            </div>
          </div>
        </div>
      </Reveal>
    </footer>
  );
};

export default Footer;
