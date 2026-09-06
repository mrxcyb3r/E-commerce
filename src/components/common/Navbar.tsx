import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';

import {
  Link,
  useLocation,
  useNavigate,
} from 'react-router-dom';

import {
  Search,
  Heart,
  Menu,
  X,
  MapPin,
  Send,
  ArrowRight,
  ShoppingBag,
} from 'lucide-react';

import { useBrand } from '../../hooks/useBrand';
import { useFavorites } from '../../hooks/useFavorites';
import { track } from '../../lib/analytics/client';
import { ThemeToggle } from './ThemeToggle';
import { SearchModal } from './SearchModal';

import {
  motion,
  AnimatePresence,
} from 'motion/react';

import { useI18n } from '../../i18n/I18nContext';

interface NavItem {
  id: string;
  label: string;
  sectionId: string;
  path: string;
}

/**
 * IMPORTANT:
 * These section IDs must match the actual IDs rendered
 * by the homepage sections.
 */
const getNavItems = (
  t: (section: string, key: string) => string,
): NavItem[] => [
  {
    id: 'hero',
    label: t('nav', 'home'),
    sectionId: 'hero',
    path: '/',
  },
  {
    id: 'products',
    label: t('nav', 'products'),
    sectionId: 'products',
    path: '/products',
  },
  {
    id: 'feed',
    label: t('nav', 'videos'),
    sectionId: 'video-feed',
    path: '/feed',
  },
  {
    id: 'categories',
    label: t('nav', 'categories'),
    sectionId: 'categories',
    path: '/products?category=',
  },
  {
    id: 'about',
    label: t('nav', 'about'),
    sectionId: 'about',
    path: '/about',
  },
  {
    id: 'location',
    label: t('nav', 'location'),
    sectionId: 'location',
    path: '/location',
  },
  {
    id: 'contact',
    label: t('nav', 'contact'),
    sectionId: 'contact',
    path: '/contact',
  },
];

export const Navbar: React.FC = () => {
  const storeInfo = useBrand();
  const { t } = useI18n();

  const location = useLocation();
  const navigate = useNavigate();

  const { totalFavorites } = useFavorites();

  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] =
    useState<string>('hero');

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const [searchModalOpen, setSearchModalOpen] =
    useState(false);

  const [navVisible, setNavVisible] = useState(true);

  const navbarRef = useRef<HTMLElement>(null);

  /**
   * Stores the previous scroll position without causing
   * the scroll listener effect to recreate itself.
   */
  const lastScrollYRef = useRef(0);

  /**
   * Prevents multiple requestAnimationFrame callbacks.
   */
  const tickingRef = useRef(false);

  /**
   * Prevent scrollspy from immediately overriding the
   * active section while smooth scrolling after a click.
   */
  const programmaticScrollRef = useRef(false);

  const scrollTimeoutRef =
    useRef<ReturnType<typeof window.setTimeout> | null>(
      null,
    );

  const isHomePage = location.pathname === '/';

  const NAV_ITEMS = getNavItems(t);

  /**
   * -------------------------------------------------------
   * NAVBAR SHOW/HIDE + SCROLL STATE
   * -------------------------------------------------------
   */
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (!tickingRef.current) {
        window.requestAnimationFrame(() => {
          setIsScrolled(currentScrollY > 10);

          const previousScrollY =
            lastScrollYRef.current;

          /**
           * Always show navbar near the top.
           */
          if (currentScrollY <= 80) {
            setNavVisible(true);
          } else if (
            currentScrollY > previousScrollY + 4 &&
            currentScrollY > 120
          ) {
            setNavVisible(false);
          } else if (
            currentScrollY < previousScrollY - 4
          ) {
            setNavVisible(true);
          }

          lastScrollYRef.current = currentScrollY;
          tickingRef.current = false;
        });

        tickingRef.current = true;
      }
    };

    handleScroll();

    window.addEventListener(
      'scroll',
      handleScroll,
      { passive: true },
    );

    return () => {
      window.removeEventListener(
        'scroll',
        handleScroll,
      );
    };
  }, []);

  /**
   * -------------------------------------------------------
   * KEYBOARD SHORTCUTS
   * -------------------------------------------------------
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.metaKey || e.ctrlKey) &&
        e.key.toLowerCase() === 'k'
      ) {
        e.preventDefault();
        setSearchModalOpen((prev) => !prev);
      }

      if (e.key === 'Escape') {
        setSearchModalOpen(false);
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener(
      'keydown',
      handleKeyDown,
    );

    return () => {
      window.removeEventListener(
        'keydown',
        handleKeyDown,
      );
    };
  }, []);

  /**
   * -------------------------------------------------------
   * NON-HOMEPAGE ACTIVE STATE
   * -------------------------------------------------------
   */
  useEffect(() => {
    if (isHomePage) return;

    const pathname = location.pathname;

    if (
      pathname === '/products' ||
      pathname.startsWith('/products/')
    ) {
      setActiveSection('products');
      return;
    }

    if (
      pathname === '/feed' ||
      pathname === '/videos'
    ) {
      setActiveSection('feed');
      return;
    }

    if (pathname === '/about') {
      setActiveSection('about');
      return;
    }

    if (pathname === '/location') {
      setActiveSection('location');
      return;
    }

    if (pathname === '/contact') {
      setActiveSection('contact');
      return;
    }

    setActiveSection('');
  }, [
    isHomePage,
    location.pathname,
  ]);

  /**
   * -------------------------------------------------------
   * HOMEPAGE SCROLLSPY
   * -------------------------------------------------------
   *
   * Uses the actual DOM sections.
   *
   * Instead of allowing several IntersectionObserver entries
   * to randomly overwrite each other, we calculate which
   * visible section is closest to the navbar.
   */
  useEffect(() => {
    if (!isHomePage) return;

    const sections = NAV_ITEMS
      .map((item) => {
        const element =
          document.getElementById(
            item.sectionId,
          );

        if (!element) return null;

        return {
          item,
          element,
        };
      })
      .filter(
        (
          value,
        ): value is {
          item: NavItem;
          element: HTMLElement;
        } => value !== null,
      );

    if (sections.length === 0) return;

    const updateActiveSection = () => {
      if (programmaticScrollRef.current) {
        return;
      }

      const navbarHeight =
        navbarRef.current?.offsetHeight ?? 0;

      /**
       * The detection line sits below the navbar,
       * approximately in the upper third of the viewport.
       */
      const detectionPoint =
        navbarHeight +
        Math.min(
          180,
          window.innerHeight * 0.25,
        );

      let closestSection: string | null = null;
      let closestDistance = Infinity;

      for (const { item, element } of sections) {
        const rect =
          element.getBoundingClientRect();

        /**
         * Ignore sections that haven't entered the
         * viewport yet.
         */
        if (
          rect.bottom <= navbarHeight ||
          rect.top >= window.innerHeight
        ) {
          continue;
        }

        const distance = Math.abs(
          rect.top - detectionPoint,
        );

        if (distance < closestDistance) {
          closestDistance = distance;
          closestSection = item.id;
        }
      }

      /**
       * If nothing is currently intersecting, determine
       * the section based on scroll position.
       */
      if (!closestSection) {
        let previousSection: string | null = null;

        for (const { item, element } of sections) {
          const rect =
            element.getBoundingClientRect();

          if (
            rect.top <= detectionPoint
          ) {
            previousSection = item.id;
          }
        }

        if (previousSection) {
          closestSection = previousSection;
        }
      }

      if (closestSection) {
        setActiveSection(closestSection);
      }
    };

    let observer: IntersectionObserver | null =
      null;

    /**
     * IntersectionObserver wakes up the scrollspy
     * efficiently, while the calculation itself decides
     * which section is actually active.
     */
    observer =
      new IntersectionObserver(
        () => {
          updateActiveSection();
        },
        {
          root: null,
          rootMargin:
            '-90px 0px -45% 0px',
          threshold: [0, 0.05, 0.15, 0.3],
        },
      );

    sections.forEach(
      ({ element }) => {
        observer?.observe(element);
      },
    );

    /**
     * Initial state.
     */
    updateActiveSection();

    /**
     * Handle resize because navbar height and viewport
     * geometry can change.
     */
    window.addEventListener(
      'resize',
      updateActiveSection,
    );

    return () => {
      observer?.disconnect();

      window.removeEventListener(
        'resize',
        updateActiveSection,
      );
    };
  }, [
    isHomePage,
    NAV_ITEMS,
  ]);

  /**
   * -------------------------------------------------------
   * CLOSE MOBILE MENU AFTER ROUTE CHANGE
   * -------------------------------------------------------
   */
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  /**
   * -------------------------------------------------------
   * NAVIGATION
   * -------------------------------------------------------
   */
  const handleNavClick = useCallback(
    (
      e: React.MouseEvent<HTMLAnchorElement>,
      item: NavItem,
    ) => {
      /**
       * HOME PAGE
       *
       * All navbar items scroll to their actual section.
       */
      if (isHomePage) {
        e.preventDefault();

        const element =
          document.getElementById(
            item.sectionId,
          );

        if (!element) {
          /**
           * If a section is genuinely missing, don't
           * silently do nothing. Fall back to navigation
           * for pages such as /feed or /products.
           */
          if (item.path !== '/') {
            navigate(item.path);
          }

          setMobileMenuOpen(false);
          return;
        }

        /**
         * Immediately update the indicator so the user
         * gets instant feedback.
         */
        setActiveSection(item.id);

        /**
         * Prevent scrollspy from fighting the smooth
         * scroll animation.
         */
        programmaticScrollRef.current = true;

        if (scrollTimeoutRef.current) {
          window.clearTimeout(
            scrollTimeoutRef.current,
          );
        }

        const navbarHeight =
          navbarRef.current?.offsetHeight ?? 0;

        const extraSpacing = 16;

        const elementTop =
          element.getBoundingClientRect()
            .top +
          window.scrollY;

        const targetTop = Math.max(
          0,
          elementTop -
            navbarHeight -
            extraSpacing,
        );

        window.scrollTo({
          top: targetTop,
          behavior: 'smooth',
        });

        /**
         * Release the programmatic-scroll lock after
         * the smooth animation has had time to finish.
         */
        scrollTimeoutRef.current =
          window.setTimeout(() => {
            programmaticScrollRef.current =
              false;

            setActiveSection(item.id);
          }, 900);

        setMobileMenuOpen(false);

        return;
      }

      /**
       * ---------------------------------------------------
       * NON-HOMEPAGE
       * ---------------------------------------------------
       */

      if (item.id === 'hero') {
        e.preventDefault();
        navigate('/');
        setActiveSection('hero');
        setMobileMenuOpen(false);
        return;
      }

      /**
       * Normal route navigation.
       */
      setMobileMenuOpen(false);
    },
    [
      isHomePage,
      navigate,
    ],
  );

  /**
   * -------------------------------------------------------
   * LOGO CLICK
   * -------------------------------------------------------
   */
  const handleLogoClick = useCallback(
    (e: React.MouseEvent) => {
      if (!isHomePage) return;

      e.preventDefault();

      programmaticScrollRef.current = true;

      setActiveSection('hero');

      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });

      if (scrollTimeoutRef.current) {
        window.clearTimeout(
          scrollTimeoutRef.current,
        );
      }

      scrollTimeoutRef.current =
        window.setTimeout(() => {
          programmaticScrollRef.current =
            false;
          setActiveSection('hero');
        }, 900);
    },
    [isHomePage],
  );

  /**
   * Cleanup scroll timeout.
   */
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        window.clearTimeout(
          scrollTimeoutRef.current,
        );
      }
    };
  }, []);

  return (
    <>
      {/* ==================================================
          DESKTOP / MAIN NAVBAR
          ================================================== */}

      <header
        ref={navbarRef}
        className={`fixed left-0 right-0 top-0 z-50 pointer-events-none transition-transform duration-300 ease-out ${
          navVisible
            ? 'translate-y-0'
            : '-translate-y-full'
        }`}
      >
        <div
          className={`pointer-events-auto mx-auto w-full px-4 sm:px-6 lg:px-8 transition-all duration-300 ${
            isScrolled
              ? 'border-b border-border/60 bg-card/90 py-2 shadow-lg shadow-black/5 backdrop-blur-xl'
              : 'bg-transparent py-4'
          }`}
        >
          <div className="flex items-center justify-between gap-4">
            {/* ==================================================
                BRAND
                ================================================== */}

            <Link
              to="/"
              id="brand-logo-link"
              onClick={handleLogoClick}
              className="group flex shrink-0 items-center gap-2 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100"
              aria-label={`${storeInfo.name} ${t(
                'nav',
                'home',
              )}`}
            >
              {storeInfo.logoUrl ? (
                <img
                  src={storeInfo.logoUrl}
                  referrerPolicy="no-referrer"
                  alt=""
                  className="h-8 w-8 rounded-xl object-cover shadow-sm transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-foreground text-background shadow-sm transition-transform duration-300 group-hover:scale-105 dark:bg-card dark:text-card-foreground">
                  <ShoppingBag className="h-4 w-4" />
                </div>
              )}

              <span className="hidden font-display text-sm font-black tracking-tight text-foreground sm:inline">
                {storeInfo.name}
              </span>
            </Link>

            {/* ==================================================
                DESKTOP NAVIGATION
                ================================================== */}

            <nav
              className="hidden items-center gap-1 lg:flex"
              aria-label={t(
                'nav',
                'mainNavigation',
              )}
            >
              {NAV_ITEMS.map((item) => {
                const isActive =
                  activeSection === item.id;

                const linkHref = isHomePage
                  ? `#${item.sectionId}`
                  : item.path;

                return (
                  <a
                    key={item.id}
                    href={linkHref}
                    id={`nav-link-${item.id}`}
                    onClick={(e) =>
                      handleNavClick(
                        e,
                        item,
                      )
                    }
                    className={`relative isolate rounded-full px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                      isActive
                        ? 'text-primary'
                        : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                    }`}
                  >
                    {/* Animated active background */}
                    {isActive && (
                      <motion.span
                        layoutId="navbar-active-pill"
                        className="absolute inset-0 -z-10 rounded-full bg-primary/10"
                        transition={{
                          type: 'spring',
                          stiffness: 420,
                          damping: 32,
                          mass: 0.7,
                        }}
                      />
                    )}

                    {/* Animated bottom indicator */}
                    {isActive && (
                      <motion.span
                        layoutId="navbar-active-line"
                        className="absolute bottom-0 left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full bg-primary"
                        transition={{
                          type: 'spring',
                          stiffness: 420,
                          damping: 32,
                          mass: 0.7,
                        }}
                      />
                    )}

                    <span className="relative z-10 whitespace-nowrap">
                      {item.label}
                    </span>
                  </a>
                );
              })}
            </nav>

            {/* ==================================================
                ACTIONS
                ================================================== */}

            <div className="flex shrink-0 items-center gap-2">
              {/* Search */}
              <button
                id="navbar-search-btn"
                type="button"
                onClick={() =>
                  setSearchModalOpen(true)
                }
                className="flex items-center gap-2 rounded-xl border border-border/80 bg-card/80 px-4 py-2 text-sm font-medium text-zinc-600 shadow-sm backdrop-blur-sm transition-all hover:bg-zinc-100/80 dark:text-zinc-400 dark:hover:bg-zinc-700/80"
                aria-label={t(
                  'nav',
                  'searchProducts',
                )}
              >
                <Search className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />

                <span className="hidden font-medium sm:inline">
                  {t('common', 'search')}...
                </span>
              </button>

              {/* Favorites */}
              <Link
                to="/favorites"
                id="navbar-favorites-btn"
                className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border/80 bg-card/80 text-zinc-700 shadow-sm backdrop-blur-sm transition-all hover:bg-zinc-100/80 dark:text-zinc-200 dark:hover:bg-zinc-700/80"
                aria-label={t(
                  'nav',
                  'favoritesList',
                )}
                title={t(
                  'nav',
                  'favoritesList',
                )}
              >
                <Heart
                  className={`h-5 w-5 ${
                    totalFavorites > 0
                      ? 'fill-rose-500 text-rose-500'
                      : ''
                  }`}
                />

                {totalFavorites > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-[10px] font-black text-background shadow-sm dark:bg-card dark:text-card-foreground">
                    {totalFavorites > 99
                      ? '99+'
                      : totalFavorites}
                  </span>
                )}
              </Link>

              {/* Theme */}
              <ThemeToggle />

              {/* Telegram */}
              {storeInfo.telegram && (
                <a
                  href={storeInfo.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  id="navbar-telegram-cta"
                  onClick={() =>
                    track(
                      'telegram_click',
                    )
                  }
                  className="hidden items-center gap-2 rounded-xl bg-foreground px-4 py-2 text-sm font-black tracking-wide text-background shadow-sm transition-all hover:bg-zinc-800 hover:shadow-md dark:bg-card dark:text-card-foreground dark:hover:bg-zinc-100 lg:inline-flex"
                >
                  <Send className="h-4 w-4" />

                  <span>
                    {t(
                      'common',
                      'telegram',
                    )}
                  </span>
                </a>
              )}

              {/* Mobile menu */}
              <button
                id="mobile-menu-toggle-btn"
                type="button"
                onClick={() =>
                  setMobileMenuOpen(
                    (prev) => !prev,
                  )
                }
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border/80 bg-card/80 text-zinc-700 shadow-sm backdrop-blur-sm hover:bg-zinc-100/80 focus:outline-none dark:text-zinc-200 dark:hover:bg-zinc-700/80 lg:hidden"
                aria-label={
                  mobileMenuOpen
                    ? t(
                        'nav',
                        'closeMenu',
                      )
                    : t(
                        'nav',
                        'openMenu',
                      )
                }
                aria-expanded={
                  mobileMenuOpen
                }
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ====================================================
          MOBILE MENU
          ==================================================== */}

      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-[60] lg:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              onClick={() =>
                setMobileMenuOpen(
                  false,
                )
              }
              className="fixed inset-0 bg-background/80 backdrop-blur-sm"
            />

            {/* Drawer */}
            <motion.div
              initial={{
                x: '100%',
              }}
              animate={{
                x: 0,
              }}
              exit={{
                x: '100%',
              }}
              transition={{
                type: 'spring',
                damping: 28,
                stiffness: 280,
              }}
              className="fixed bottom-0 right-0 top-0 flex w-[88%] max-w-sm flex-col justify-between overflow-y-auto border-l border-border bg-white p-6 pt-20 shadow-2xl dark:bg-background"
            >
              <div className="space-y-6">
                {/* Mobile search */}
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(
                      false,
                    );
                    setSearchModalOpen(
                      true,
                    );
                  }}
                  className="flex w-full items-center justify-between rounded-2xl border border-border bg-card px-4 py-4 text-base font-medium text-zinc-700 dark:text-zinc-300"
                >
                  <span className="flex items-center gap-3">
                    <Search className="h-5 w-5 text-zinc-500" />

                    <span>
                      {t(
                        'nav',
                        'searchProducts',
                      )}
                    </span>
                  </span>

                  <ArrowRight className="h-5 w-5 text-zinc-400" />
                </button>

                {/* Sections */}
                <div className="space-y-2">
                  <div className="mb-2 px-2 text-xs font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                    {t(
                      'nav',
                      'sections',
                    )}
                  </div>

                  {NAV_ITEMS.map(
                    (item) => {
                      const isActive =
                        activeSection ===
                        item.id;

                      const linkHref =
                        isHomePage
                          ? `#${item.sectionId}`
                          : item.path;

                      return (
                        <a
                          key={item.id}
                          href={linkHref}
                          onClick={(e) =>
                            handleNavClick(
                              e,
                              item,
                            )
                          }
                          className={`relative flex items-center justify-between overflow-hidden rounded-2xl px-4 py-3.5 text-base font-medium transition-colors ${
                            isActive
                              ? 'text-foreground'
                              : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white'
                          }`}
                        >
                          {isActive && (
                            <motion.span
                              layoutId="mobile-active-section"
                              className="absolute inset-0 -z-0 rounded-2xl bg-primary/10"
                              transition={{
                                type: 'spring',
                                stiffness: 360,
                                damping: 30,
                              }}
                            />
                          )}

                          <span className="relative z-10">
                            {item.label}
                          </span>

                          <ArrowRight
                            className={`relative z-10 h-5 w-5 ${
                              isActive
                                ? 'text-primary'
                                : 'text-zinc-400'
                            }`}
                          />
                        </a>
                      );
                    },
                  )}
                </div>

                {/* Mobile utilities */}
                <div className="space-y-3 border-t border-zinc-100 pt-4 dark:border-border">
                  <Link
                    to="/favorites"
                    onClick={() =>
                      setMobileMenuOpen(
                        false,
                      )
                    }
                    className="flex items-center justify-between rounded-2xl border border-zinc-100 bg-card px-4 py-3.5 text-sm font-medium text-zinc-800 dark:border-zinc-700/50 dark:text-zinc-200"
                  >
                    <span className="flex items-center gap-3">
                      <Heart className="h-5 w-5 fill-rose-500 text-rose-500" />

                      {t(
                        'nav',
                        'favoritesList',
                      )}
                    </span>

                    <span className="rounded-full bg-zinc-200 px-3 py-1 text-xs font-black text-foreground dark:bg-zinc-700">
                      {totalFavorites}
                    </span>
                  </Link>

                  {/* Phone */}
                  <a
                    href={`tel:${
                      storeInfo.phoneRaw ||
                      storeInfo.phone
                    }`}
                    onClick={() =>
                      track(
                        'phone_click',
                      )
                    }
                    className="flex items-center gap-3 px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400"
                  >
                    <span className="font-black text-zinc-900 dark:text-zinc-100">
                      {t(
                        'nav',
                        'phone',
                      )}
                      :
                    </span>

                    <span>
                      {storeInfo.phone}
                    </span>
                  </a>

                  {/* Address */}
                  <div className="flex items-start gap-3 px-4 py-2 text-sm text-zinc-500 dark:text-zinc-400">
                    <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-zinc-700 dark:text-zinc-300" />

                    <span>
                      {storeInfo.address}
                    </span>
                  </div>
                </div>
              </div>

              {/* Telegram */}
              {storeInfo.telegram && (
                <div className="border-t border-zinc-100 pt-6 dark:border-border">
                  <a
                    href={
                      storeInfo.telegram
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() =>
                      track(
                        'telegram_click',
                      )
                    }
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-foreground px-4 py-4 text-base font-black tracking-wide text-background shadow-md dark:bg-card dark:text-card-foreground"
                  >
                    <Send className="h-5 w-5" />

                    {t(
                      'nav',
                      'telegramContact',
                    )}
                  </a>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Search */}
      <SearchModal
        isOpen={searchModalOpen}
        onClose={() =>
          setSearchModalOpen(false)
        }
      />
    </>
  );
};

export default Navbar;