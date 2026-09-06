import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Search,
  Heart,
  Menu,
  X,
  MapPin,
  Send,
  ArrowRight,
  ShoppingBag,
  Sparkles,
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
  { id: 'feed', label: t('nav', 'videos'), sectionId: 'video-feed', path: '/feed' },
  { id: 'categories', label: t('nav', 'categories'), sectionId: 'categories', path: '/products?category=' },
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
  const [lastScrollY, setLastScrollY] = useState(0);
  const [navVisible, setNavVisible] = useState(true);
  const tickingRef = useRef(false);

  const { totalFavorites } = useFavorites();
  const location = useLocation();
  const navigate = useNavigate();

  const isHomePage = location.pathname === '/';
  const NAV_ITEMS = getNavItems(t);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 10);

      if (!tickingRef.current) {
        window.requestAnimationFrame(() => {
          if (scrollY > lastScrollY && scrollY > 100) {
            setNavVisible(false);
          } else {
            setNavVisible(true);
          }
          setLastScrollY(scrollY);
          tickingRef.current = false;
        });
        tickingRef.current = true;
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setSearchModalOpen(false);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!isHomePage) {
      if (location.pathname === '/products' || location.pathname.startsWith('/products?')) {
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

    const sectionIds = [
      'hero',
      'categories',
      'video-discovery',
      'about',
      'contact',
    ];

    const observers: IntersectionObserver[] = [];

    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -50% 0px',
      threshold: 0.05,
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        observer.observe(el);
      }
    });

    return () => {
      observer.disconnect();
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
      <header
        className={`fixed left-0 right-0 z-50 transition-all duration-300 pointer-events-none ${
          navVisible ? 'top-0' : '-translate-y-full'
        }`}
      >
        <div
          className={`pointer-events-auto mx-auto max-w-full px-4 sm:px-6 lg:px-8 transition-all duration-300 ${
            isScrolled
              ? 'bg-card/90 backdrop-blur-xl border-b border-border/60 shadow-lg shadow-zinc-950/40 py-2'
              : 'bg-transparent py-4'
          }`}
        >
          <div className="flex items-center justify-between gap-4">
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
                  className="w-8 h-8 rounded-xl object-cover shadow-xs transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="w-8 h-8 rounded-xl bg-foreground text-background dark:bg-card dark:text-card-foreground flex items-center justify-center font-black text-lg shadow-xs transition-transform duration-300 group-hover:scale-105">
                  <ShoppingBag className="w-4 h-4" />
                </div>
              )}
              <span className="font-display font-black text-sm tracking-tight text-foreground hidden sm:inline">
                {storeInfo.name}
              </span>
            </Link>

            <nav
              className="hidden lg:flex items-center gap-1"
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
                    className={`relative px-3 py-2 text-sm rounded-full font-medium transition-colors duration-200 ${
                      isActive
                        ? 'text-primary font-semibold'
                        : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute inset-0 -bottom-1.5 bg-primary/10 rounded-full height-0.5"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">{item.label}</span>
                  </a>
                );
              })}
            </nav>

            <div className="flex items-center gap-2 shrink-0">
              <button
                id="navbar-search-btn"
                type="button"
                onClick={() => setSearchModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 bg-card/80 hover:bg-zinc-100/80 dark:hover:bg-zinc-700/80 rounded-xl border border-border/80 transition-all shadow-sm backdrop-blur-sm"
                aria-label={t('nav', 'searchProducts')}
              >
                <Search className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                <span className="hidden sm:inline font-medium">{t('common', 'search')}...</span>
              </button>

              <Link
                to="/favorites"
                id="navbar-favorites-btn"
                className="relative inline-flex items-center justify-center w-10 h-10 rounded-xl border border-border/80 bg-card/80 hover:bg-zinc-100/80 dark:hover:bg-zinc-700/80 text-zinc-700 dark:text-zinc-200 transition-all shadow-sm backdrop-blur-sm"
                aria-label={t('nav', 'favoritesList')}
                title={t('nav', 'favoritesList')}
              >
                <Heart className={`w-5 h-5 ${totalFavorites > 0 ? 'text-rose-500 fill-rose-500' : ''}`} />
                {totalFavorites > 0 && (
                  <span className="absolute -top-1 -right-1 bg-foreground text-background dark:bg-card dark:text-card-foreground text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                    {totalFavorites > 99 ? '99+' : totalFavorites}
                  </span>
                )}
              </Link>

              <ThemeToggle />

              {storeInfo.telegram && (
                <a
                  href={storeInfo.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  id="navbar-telegram-cta"
                  onClick={() => track('telegram_click')}
                  className="hidden lg:inline-flex items-center gap-2 px-4 py-2 text-sm font-black tracking-wide bg-foreground text-background dark:bg-card dark:text-card-foreground rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all shadow-sm hover:shadow-md"
                >
                  <Send className="w-4 h-4" />
                  <span>{t('common', 'telegram')}</span>
                </a>
              )}

              <button
                id="mobile-menu-toggle-btn"
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl border border-border/80 bg-card/80 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100/80 dark:hover:bg-zinc-700/80 focus:outline-none shadow-sm backdrop-blur-sm"
                aria-label={mobileMenuOpen ? t('nav', 'closeMenu') : t('nav', 'openMenu')}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="fixed top-0 right-0 bottom-0 w-[88%] max-w-sm bg-white dark:bg-background p-6 pt-20 shadow-2xl flex flex-col justify-between border-l border-border overflow-y-auto"
            >
              <div className="space-y-6">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setSearchModalOpen(true);
                  }}
                  className="w-full flex items-center justify-between px-4 py-4 rounded-2xl bg-card text-zinc-700 dark:text-zinc-300 text-base font-medium border border-border"
                >
                  <span className="flex items-center gap-3">
                    <Search className="w-5 h-5 text-zinc-500" />
                    <span>{t('nav', 'searchProducts')}</span>
                  </span>
                  <ArrowRight className="w-5 h-5 text-zinc-400" />
                </button>

                <div className="space-y-2">
                  <div className="text-xs font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2 px-2">
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
                        className={`relative flex items-center justify-between px-4 py-3.5 rounded-2xl text-base font-medium transition-colors ${
                          isActive
                            ? 'text-foreground'
                            : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800'
                        }`}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="mobile-nav-indicator"
                            className="absolute inset-0 bg-primary/10 rounded-2xl"
                            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                          />
                        )}
                        <span className="relative z-10">{item.label}</span>
                        <ArrowRight className={`relative z-10 w-5 h-5 ${isActive ? 'text-primary' : 'text-zinc-400'}`} />
                      </a>
                    );
                  })}
                </div>

                <div className="pt-4 border-t border-zinc-100 dark:border-border space-y-3">
                  <Link
                    to="/favorites"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-4 py-3.5 rounded-2xl bg-card text-sm font-medium text-zinc-800 dark:text-zinc-200 border border-zinc-100 dark:border-zinc-700/50"
                  >
                    <span className="flex items-center gap-3">
                      <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                      {t('nav', 'favoritesList')}
                    </span>
                    <span className="px-3 py-1 text-xs font-black bg-zinc-200 dark:bg-zinc-700 text-foreground rounded-full">
                      {totalFavorites}
                    </span>
                  </Link>

                  <a
                    href={`tel:${storeInfo.phoneRaw || storeInfo.phone}`}
                    onClick={() => track('phone_click')}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400"
                  >
                    <span className="font-black text-zinc-900 dark:text-zinc-100">{t('nav', 'phone')}:</span>
                    <span>{storeInfo.phone}</span>
                  </a>

                  <div className="flex items-start gap-3 px-4 py-2 text-sm text-zinc-500 dark:text-zinc-400">
                    <MapPin className="w-5 h-5 shrink-0 mt-0.5 text-zinc-700 dark:text-zinc-300" />
                    <span>{storeInfo.address}</span>
                  </div>
                </div>
              </div>

              {storeInfo.telegram && (
                <div className="pt-6 border-t border-zinc-100 dark:border-border">
                  <a
                    href={storeInfo.telegram}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => track('telegram_click')}
                    className="w-full flex items-center justify-center gap-2 py-4 px-4 rounded-2xl text-base font-black tracking-wide bg-foreground text-background dark:bg-card dark:text-card-foreground shadow-md"
                  >
                    <Send className="w-5 h-5" />
                    {t('nav', 'telegramContact')}
                  </a>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <SearchModal isOpen={searchModalOpen} onClose={() => setSearchModalOpen(false)} />
    </>
  );
};

export default Navbar;