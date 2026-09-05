import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Search,
  Heart,
  Menu,
  X,
  MapPin,
  Send,
  ArrowRight,
  ShoppingBag
} from 'lucide-react';
import { useBrand } from '../../hooks/useBrand';
import { useFavorites } from '../../hooks/useFavorites';
import { track } from '../../lib/analytics/client';
import { ThemeToggle } from './ThemeToggle';
import { SearchModal } from './SearchModal';
import { motion, AnimatePresence } from 'motion/react';
import { useI18n } from '../../i18n/I18nContext';

interface NavItem {
  id: string;
  label: string;
  sectionId: string;
  path: string;
}

const getNavItems = (t: (section: string, key: string) => string): NavItem[] => [
  { id: 'hero', label: t('nav', 'home'), sectionId: 'hero', path: '/' },
  { id: 'products', label: t('nav', 'products'), sectionId: 'products', path: '/products' },
  { id: 'feed', label: t('nav', 'videos'), sectionId: 'video-discovery', path: '/feed' },
  { id: 'about', label: t('nav', 'about'), sectionId: 'about', path: '/about' },
  { id: 'location', label: t('nav', 'location'), sectionId: 'location', path: '/location' },
  { id: 'contact', label: t('nav', 'contact'), sectionId: 'contact', path: '/contact' },
];

export const Navbar: React.FC = () => {
  const storeInfo = useBrand();
  const { t } = useI18n();
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('hero');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  const { totalFavorites } = useFavorites();
  const location = useLocation();
  const navigate = useNavigate();

  const isHomePage = location.pathname === '/';
  const NAV_ITEMS = getNavItems(t);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!isHomePage) {
      if (location.pathname.startsWith('/products')) {
        setActiveSection('products');
      } else if (location.pathname === '/feed' || location.pathname === '/videos') {
        setActiveSection('feed');
      } else if (location.pathname === '/about') {
        setActiveSection('about');
      } else if (location.pathname === '/location') {
        setActiveSection('location');
      } else if (location.pathname === '/contact') {
        setActiveSection('contact');
      } else {
        setActiveSection('');
      }
      return;
    }

    const sectionIds = ['hero', 'products', 'video-discovery', 'about', 'location', 'contact'];

    const observers: IntersectionObserver[] = [];

    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (entry.target.id === 'video-discovery') {
            setActiveSection('feed');
          } else {
            setActiveSection(entry.target.id);
          }
        }
      });
    };

    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -40% 0px',
      threshold: 0.1,
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        observer.observe(el);
      }
    });

    const handleScrollPrecision = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      if (scrollY < 150) {
        setActiveSection('hero');
        return;
      }

      if (scrollY + windowHeight >= documentHeight - 150) {
        setActiveSection('contact');
        return;
      }
    };

    window.addEventListener('scroll', handleScrollPrecision, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScrollPrecision);
    };
  }, [isHomePage, location.pathname]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleNavClick = useCallback((e: React.MouseEvent, item: NavItem) => {
    if (item.id === 'feed') {
      e.preventDefault();
      navigate('/feed');
      setActiveSection('feed');
      setMobileMenuOpen(false);
      return;
    }

    if (isHomePage) {
      e.preventDefault();
      const el = document.getElementById(item.sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        setActiveSection(item.id);
      } else if (item.id === 'hero') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setActiveSection('hero');
      }
    } else {
      if (item.id === 'hero') {
        e.preventDefault();
        navigate('/');
      }
    }
    setMobileMenuOpen(false);
  }, [isHomePage, navigate]);

  return (
    <>
      {/* Fixed Navbar Container */}
      <header
        className={`fixed left-0 right-0 z-50 transition-all duration-300 pointer-events-none ${
          isScrolled
            ? 'top-2 sm:top-3.5 px-3 sm:px-6 lg:px-8'
            : 'top-0 px-0'
        }`}
      >
        <div
          className={`pointer-events-auto max-w-7xl mx-auto transition-all duration-300 ${
            isScrolled
              ? 'rounded-xl sm:rounded-2xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-zinc-200/90 dark:border-zinc-800/90 shadow-sm shadow-zinc-950/5 dark:shadow-black/40 py-2 sm:py-2.5 px-3.5 sm:px-5'
              : 'w-full bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200/50 dark:border-zinc-800/50 py-3.5 sm:py-4 px-4 sm:px-6 lg:px-8'
          }`}
        >
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            {/* Brand Logo */}
            <Link
              to="/"
              id="brand-logo-link"
              onClick={(e) => {
                if (isHomePage) {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  setActiveSection('hero');
                }
              }}
              className="flex items-center gap-2 group focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100 rounded-xl shrink-0"
              aria-label={`${storeInfo.name} ${t('nav', 'home')}`}
            >
              {storeInfo.logoUrl ? (
                <img
                  src={storeInfo.logoUrl}
                  referrerPolicy="no-referrer"
                  alt=""
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl object-cover shadow-xs transition-transform duration-200 group-hover:scale-105"
                />
              ) : (
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center font-black text-lg shadow-xs transition-transform duration-200 group-hover:scale-105">
                  <ShoppingBag className="w-4.5 h-4.5" />
                </div>
              )}
              <div className="flex flex-col">
                <span className="font-black text-sm sm:text-base tracking-tighter text-zinc-900 dark:text-white font-['Outfit',sans-serif] leading-tight">
                  {storeInfo.name}
                </span>
                <span className="text-[8px] sm:text-[9px] tracking-widest uppercase font-black text-zinc-500 dark:text-zinc-400 hidden sm:block">
                  {storeInfo.tagline || storeInfo.businessCategory || t('footer', 'tagline')}
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav
              className="hidden md:flex items-center gap-2 p-1 bg-zinc-100/60 dark:bg-zinc-800/50 rounded-xl border border-zinc-200/50 dark:border-zinc-700/50"
              aria-label={t('nav', 'mainNavigation')}
            >
              {NAV_ITEMS.map((item) => {
                const isActive = activeSection === item.id;
                const linkHref = isHomePage ? `#${item.sectionId}` : item.path;

                return (
                  <a
                    key={item.id}
                    href={linkHref}
                    id={`nav-link-${item.id}`}
                    onClick={(e) => handleNavClick(e, item)}
                    className={`relative px-2.5 py-1.5 text-xs sm:text-sm rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'text-white dark:text-zinc-950 font-black bg-zinc-900 dark:bg-white shadow-xs'
                        : 'text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-zinc-700/60 font-bold'
                    }`}
                  >
                    {item.label}
                  </a>
                );
              })}
            </nav>

            {/* Right Action Icons & Controls */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Clean Quick Search Button */}
              <button
                id="navbar-search-btn"
                type="button"
                onClick={() => setSearchModalOpen(true)}
                className="flex items-center gap-2 px-2.5 sm:px-3 py-2 text-xs font-bold text-zinc-600 dark:text-zinc-400 bg-zinc-100/80 dark:bg-zinc-800/80 hover:bg-zinc-200/80 dark:hover:bg-zinc-700/80 rounded-xl border border-zinc-200 dark:border-zinc-800 transition-colors cursor-pointer shadow-2xs"
                aria-label={t('nav', 'searchProducts')}
              >
                <Search className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400" />
                <span className="hidden sm:inline font-bold">{t('common', 'search')}...</span>
              </button>

              {/* Favorites Link */}
              <Link
                to="/favorites"
                id="navbar-favorites-btn"
                className="relative inline-flex items-center justify-center w-9 h-9 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-800/80 hover:bg-zinc-100 dark:hover:bg-zinc-700/80 text-zinc-700 dark:text-zinc-200 transition-colors shadow-2xs"
                aria-label={t('nav', 'favoritesList')}
                title={t('nav', 'favoritesList')}
              >
                <Heart className={`w-4.5 h-4.5 ${totalFavorites > 0 ? 'text-rose-500 fill-rose-500' : ''}`} />
                {totalFavorites > 0 && (
                  <span className="absolute -top-1 -right-1 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-[10px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-xs">
                    {totalFavorites}
                  </span>
                )}
              </Link>

              {/* Working Dark / Light Theme Toggle */}
              <ThemeToggle />

              {/* Telegram Direct CTA (Desktop) */}
              {storeInfo.telegram && (
                <a
                  href={storeInfo.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  id="navbar-telegram-cta"
                  onClick={() => track('telegram_click')}
                  className="hidden lg:inline-flex items-center gap-2 px-3 py-2 text-xs font-black tracking-wide text-white bg-zinc-900 dark:bg-white dark:text-zinc-950 rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all shadow-xs hover:shadow-sm"
                >
                  <Send className="w-3 h-3.5" />
                  <span>{t('common', 'telegram')}</span>
                </a>
              )}

              {/* Mobile Menu Toggle Button */}
              <button
                id="mobile-menu-toggle-btn"
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 focus:outline-none shadow-2xs"
                aria-label={mobileMenuOpen ? t('nav', 'closeMenu') : t('nav', 'openMenu')}
              >
                {mobileMenuOpen ? <X className="w-4.5 h-4.5" /> : <Menu className="w-4.5 h-4.5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-zinc-950/60 backdrop-blur-xs"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-white dark:bg-zinc-900 p-8 pt-16 shadow-2xl flex flex-col justify-between border-l border-zinc-200 dark:border-zinc-800 overflow-y-auto"
            >
              <div className="space-y-6">
                {/* Search Bar in Mobile Menu */}
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setSearchModalOpen(true);
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-sm font-bold border border-zinc-200 dark:border-zinc-700"
                >
                  <span className="flex items-center gap-2.5">
                    <Search className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{t('nav', 'searchProducts')}</span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
                </button>

                {/* Section Links */}
                <div className="space-y-1">
                  <div className="text-xs font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2 px-3">
                    {t('nav', 'sections')}
                  </div>
                  {NAV_ITEMS.map((item) => {
                    const isActive = activeSection === item.id;
                    const linkHref = isHomePage ? `#${item.sectionId}` : item.path;

                    return (
                      <a
                        key={item.id}
                        href={linkHref}
                        onClick={(e) => handleNavClick(e, item)}
                        className={`flex items-center justify-between px-4 py-3 rounded-2xl text-base font-bold transition-colors ${
                          isActive
                            ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 font-black shadow-xs'
                            : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                        }`}
                      >
                        <span>{item.label}</span>
                        <ArrowRight className={`w-3.5 h-3.5 ${isActive ? 'text-zinc-300 dark:text-zinc-700' : 'text-zinc-400'}`} />
                      </a>
                    );
                  })}
                </div>

                {/* Quick Info */}
                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
                  <Link
                    to="/favorites"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 text-sm font-bold text-zinc-800 dark:text-zinc-200 border border-zinc-100 dark:border-zinc-700/50"
                  >
                    <span className="flex items-center gap-2.5">
                      <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                      {t('nav', 'favoritesList')}
                    </span>
                    <span className="px-2 py-0.5 text-xs font-black bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-white rounded-full">
                      {totalFavorites}
                    </span>
                  </Link>

                  <a
                    href={`tel:${storeInfo.phoneRaw || storeInfo.phone}`}
                    onClick={() => track('phone_click')}
                    className="flex items-center gap-2 px-4 py-2 text-xs text-zinc-600 dark:text-zinc-400"
                  >
                    <span className="font-black text-zinc-900 dark:text-zinc-100">{t('nav', 'phone')}:</span>
                    <span>{storeInfo.phone}</span>
                  </a>

                  <div className="flex items-start gap-2 px-4 py-1 text-xs text-zinc-500 dark:text-zinc-400">
                    <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-zinc-700 dark:text-zinc-300" />
                    <span>{storeInfo.address}</span>
                  </div>
                </div>
              </div>

              {/* Mobile CTA */}
              {storeInfo.telegram && (
                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <a
                    href={storeInfo.telegram}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => track('telegram_click')}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-sm font-black tracking-wide bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {t('nav', 'telegramContact')}
                  </a>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global Quick Search Modal */}
      <SearchModal isOpen={searchModalOpen} onClose={() => setSearchModalOpen(false)} />
    </>
  );
};