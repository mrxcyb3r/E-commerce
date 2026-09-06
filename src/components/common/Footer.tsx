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

  return (
    <footer
      id="footer"
      className="bg-background border-t border-border"
      role="contentinfo"
    >
      {/* CTA Section */}
      <Reveal
        transition={{ duration: 0.6, delay: 0.1 }}
        className="py-12 lg:py-16 border-b border-border"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2
            className="font-display font-black text-foreground mb-4"
            style={{ fontSize: 'clamp(1.5rem, 4vw, 3rem)' }}
          >
            {t('footer', 'ctaTitle')}
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto mb-6">
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
          {/* Brand Column */}
          <div className="space-y-4">
            {storeInfo.logoUrl ? (
              <Link to="/" className="flex items-center gap-2.5">
                <img
                  src={storeInfo.logoUrl}
                  referrerPolicy="no-referrer"
                  alt=""
                  className="w-8 h-8 rounded-xl object-cover"
                />
                <span className="font-display font-black text-foreground text-lg tracking-tight">
                  {storeInfo.name}
                </span>
              </Link>
            ) : (
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-4 h-4" />
                <span className="font-display font-black text-foreground text-lg tracking-tight">
                  {storeInfo.name}
                </span>
              </div>
            )}
            <p className="text-sm text-muted-foreground leading-relaxed">
              {storeInfo.tagline || t('footer', 'tagline')}. {t('footer', 'taglineDesc')}
            </p>
          </div>

          {/* Shop Column */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">
              {t('footer', 'sections')}
            </h3>
            <nav aria-label="Shop" className="mt-2">
              <ul className="space-y-2" role="list">
                <li>
                  <Link
                    to="/products"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {t('footer', 'allProducts')}
                  </Link>
                </li>
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
          </div>

          {/* Connect Column */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">
              {t('footer', 'connect')}
            </h3>
            <div className="space-y-3">
              {storeInfo.address && (
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-foreground shrink-0 mt-0.5" />
                  <span>{storeInfo.address}</span>
                </div>
              )}

              {storeInfo.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-foreground shrink-0" />
                  <a
                    href={`tel:${storeInfo.phoneRaw || storeInfo.phone}`}
                    onClick={() => track('phone_click')}
                    className="font-bold hover:text-foreground transition-colors"
                  >
                    {storeInfo.phone}
                  </a>
                </div>
              )}

              {storeInfo.workingHours && (
                <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                  <Clock className="w-3.5 h-3.5 shrink-0" />
                  <span>{storeInfo.workingHours}</span>
                </div>
              )}

              {storeInfo.telegramUsername && (
                <div className="flex items-center gap-2">
                  <Send className="w-3.5 h-3.5 text-foreground shrink-0" />
                  <a
                    href={storeInfo.telegram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold hover:text-foreground transition-colors"
                  >
                    {storeInfo.telegramUsername}
                  </a>
                </div>
              )}

              {storeInfo.instagramUsername && (
                <div className="flex items-center gap-2">
                  <Instagram className="w-3.5 h-3.5 text-foreground shrink-0" />
                  <a
                    href={storeInfo.instagramUsername}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold hover:text-foreground transition-colors"
                  >
                    {storeInfo.instagramUsername}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border pt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <p>
              &copy; {new Date().getFullYear()} {storeInfo.name}.{' '}
              {t('footer', 'allRights')}
            </p>
            <div className="flex items-center gap-3">
              <Link to="/privacy" className="hover:text-foreground transition-colors">
                {t('footer', 'privacy')}
              </Link>
              <Link to="/terms" className="hover:text-foreground transition-colors">
                {t('footer', 'terms')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
