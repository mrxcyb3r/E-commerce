import React from 'react';
import { Menu, Sun, Moon, ExternalLink, Search, Bell } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useLocation } from 'react-router-dom';
import { openAdminSearch, openAdminNotifications } from '../../hooks/useAdminShortcuts';
import { useNotificationCount } from './NotificationCenter';

interface AdminHeaderProps {
  onOpenSidebar: () => void;
  onOpenNotifications?: () => void;
}

const sectionTitles: Record<string, string> = {
  products: 'Mahsulotlar',
  categories: 'Kategoriyalar',
  inventory: 'Inventar',
  homepage: 'Bosh sahifa CMS',
  feed: 'Videolar / Feed',
  prompts: 'AI Promptlar',
  testimonials: 'Sharhlar',
  faq: 'Savol-Javoblar',
  store: "Do'kon ma'lumotlari",
  about: 'Biz haqimizda',
  contact: 'Aloqa sahifasi',
  settings: 'Sozlamalar',
  analytics: 'Tahlil',
  comments: 'Izohlar',
  orders: 'Buyurtmalar',
};

export const AdminHeader: React.FC<AdminHeaderProps> = ({ onOpenSidebar, onOpenNotifications }) => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const notificationCount = useNotificationCount();

  const pathParts = location.pathname.split('/').filter(Boolean);
  const currentSection = pathParts[1] || '';
  const subSection = pathParts[2] || '';
  const subTitles: Record<string, string> = {
    new: 'Yangi',
    'bulk-create': 'Ommaviy yaratish',
    import: 'Import',
    analytics: 'Tahlil',
    likes: 'Layklar',
    performance: 'Samaradorlik',
    products: 'Mahsulotlar',
  };
  const title =
    currentSection === 'products' && subSection && subTitles[subSection]
      ? `Mahsulotlar / ${subTitles[subSection]}`
      : currentSection === 'feed' && subSection && subTitles[subSection]
        ? `Feed / ${subTitles[subSection]}`
        : sectionTitles[currentSection] || 'Boshqaruv';

  const handleBell = () => {
    if (onOpenNotifications) onOpenNotifications();
    else openAdminNotifications();
  };

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
          <span className="font-medium">Boshqaruv</span>
          <span className="text-muted-foreground/40">/</span>
          <span className="font-semibold text-foreground">{title}</span>
        </div>
        <h1 className="sm:hidden text-sm font-semibold text-foreground">{title}</h1>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={openAdminSearch}
          aria-label="Global qidiruv (Ctrl+K)"
          title="Qidiruv (Ctrl+K)"
          className="hidden sm:flex items-center gap-2 mr-1 pl-2.5 pr-1.5 py-1.5 rounded-lg bg-muted/60 border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors min-w-[180px]"
        >
          <Search className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span className="flex-1 text-left truncate">Qidirish…</span>
          <kbd className="admin-kbd">Ctrl K</kbd>
        </button>

        <button
          type="button"
          onClick={openAdminSearch}
          aria-label="Global qidiruv"
          className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors sm:hidden"
        >
          <Search className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={handleBell}
          aria-label={`Bildirishnomalar${notificationCount > 0 ? ` (${notificationCount} ta yangi)` : ''}`}
          title="Bildirishnomalar"
          className="relative p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <Bell className="w-4 h-4" />
          {notificationCount > 0 && (
            <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center tabular-nums">
              {notificationCount > 9 ? '9+' : notificationCount}
            </span>
          )}
        </button>

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
