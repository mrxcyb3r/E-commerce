import React from 'react';
import { Menu, Sun, Moon, Plus, ExternalLink } from 'lucide-react';
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
    feed: 'Jonli Feed / Videolar',
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
    <header className="sticky top-0 z-30 h-16 bg-background/90 backdrop-blur-md border-b border-border px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="p-2 rounded-xl text-muted-foreground hover:bg-muted lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Admin</span>
            <span>/</span>
            <span className="font-semibold text-foreground capitalize">
              {title}
            </span>
          </div>
          <h1 className="text-base sm:text-lg font-black text-foreground leading-none mt-0.5">
            {title}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Add Product Button */}
        <Link
          to="/admin/products/new"
          className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-xs shadow-sm transition-all active:scale-95"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>Yangi mahsulot</span>
        </Link>

        {/* Theme Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 rounded-xl text-muted-foreground hover:bg-muted transition-colors"
          title={theme === 'dark' ? 'Yorug\' rejim' : 'Qorong\'u rejim'}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-accent" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Public Store Link */}
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="p-2 rounded-xl text-muted-foreground hover:bg-muted transition-colors hidden xs:flex items-center gap-1.5 text-xs font-semibold"
          title="Jonli ko'reshga yangilash"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </header>
  );
};

export default AdminHeader;