import React from 'react';
import { Menu, Sun, Moon, ExternalLink } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useLocation } from 'react-router-dom';

interface AdminHeaderProps {
  onOpenSidebar: () => void;
}

const sectionTitles: Record<string, string> = {
  products: 'Mahsulotlar',
  categories: 'Kategoriyalar',
  inventory: 'Inventar',
  homepage: 'Bosh sahifa CMS',
  feed: 'Feed',
  prompts: 'AI Promptlar',
  testimonials: 'Sharhlar',
  faq: 'Savol-Javoblar',
  store: "Do'kon",
  about: 'Biz haqimizda',
  contact: 'Aloqa',
  settings: 'Sozlamalar',
  analytics: 'Analytics',
  comments: 'Izohlar',
  likes: 'Yoqtirishlar',
  performance: 'Samaradorlik',
};

export const AdminHeader: React.FC<AdminHeaderProps> = ({ onOpenSidebar }) => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const pathParts = location.pathname.split('/').filter(Boolean);
  const currentSection = pathParts[1] || '';
  const title = sectionTitles[currentSection] || 'Dashboard';

  return (
    <header className="sticky top-0 z-30 h-14 bg-background/80 backdrop-blur-xl border-b border-border px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="font-medium">Admin</span>
          <span className="text-muted-foreground/40">/</span>
          <span className="font-semibold text-foreground">{title}</span>
        </div>
        <h1 className="sm:hidden text-sm font-semibold text-foreground">{title}</h1>
      </div>

      <div className="flex items-center gap-1">
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors hidden sm:flex items-center gap-1.5 text-xs font-medium"
          title="Do'koni ko'rish"
        >
          <ExternalLink className="w-4 h-4" />
        </a>

        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          title={theme === 'dark' ? "Yorug' rejim" : "Qorong'u rejim"}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;
