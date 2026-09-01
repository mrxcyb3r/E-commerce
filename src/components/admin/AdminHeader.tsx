import React from 'react';
import { Menu, Sun, Moon, Plus, Sparkles, ExternalLink, Package } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { Link, useLocation } from 'react-router-dom';

interface AdminHeaderProps {
  onOpenSidebar: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ onOpenSidebar }) => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  // Generate breadcrumb from current path
  const pathParts = location.pathname.split('/').filter(Boolean);
  const currentSection = pathParts[1] || 'Dashboard';

  const sectionTitles: Record<string, string> = {
    products: 'Mahsulotlar',
    categories: 'Kategoriyalar',
    inventory: 'Inventar & Zaxira',
    homepage: 'Bosh sahifa (CMS)',
    feed: 'Jonli Vitrina / Feed',
    prompts: 'AI Prompt Library',
    testimonials: 'Mijozlar Sharhlari',
    faq: 'Savol-Javoblar (FAQ)',
    store: 'Do\'kon Sozlamalari',
    about: 'Biz haqimizda (About)',
    contact: 'Aloqa Sahifasi',
    settings: 'Tizim Sozlamalari',
  };

  const title = sectionTitles[currentSection] || 'Dashboard';

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="p-2 rounded-xl text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <span>Admin</span>
            <span>/</span>
            <span className="font-semibold text-neutral-700 dark:text-neutral-300 capitalize">
              {title}
            </span>
          </div>
          <h1 className="text-base sm:text-lg font-black text-neutral-900 dark:text-white leading-none mt-0.5">
            {title}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Add Product Button */}
        <Link
          to="/admin/products/new"
          className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold text-xs shadow-xs transition-all active:scale-95"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>Yangi mahsulot</span>
        </Link>

        {/* Theme Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 rounded-xl text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          title={theme === 'dark' ? 'Yorug\' rejim' : 'Qorong\'u rejim'}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Public Store Link */}
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="p-2 rounded-xl text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors hidden xs:flex items-center gap-1.5 text-xs font-semibold"
          title="Vitrinani yangi oynada ochish"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </header>
  );
};
