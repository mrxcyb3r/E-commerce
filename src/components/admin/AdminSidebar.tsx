import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Boxes,
  Home,
  Film,
  Sparkles,
  MessageSquareQuote,
  HelpCircle,
  Store,
  Info,
  PhoneCall,
  Settings,
  LogOut,
  ExternalLink,
  X,
  BarChart3,
  MessageCircle,
  Heart,
  TrendingUp,
  ShoppingBag,
  Layers,
  Import as ImportIcon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { useVideoFeed } from '../../context/VideoContext';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, onClose }) => {
  const { logout, user } = useAuth();
  const { storeInfo, products, prompts } = useStore();
  const { publishedVideos } = useVideoFeed();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navSections = [
    {
      title: 'ASOSIY',
      items: [
        {
          label: 'Dashboard',
          path: '/admin',
          icon: LayoutDashboard,
          end: true,
        },
      ],
    },
    {
      title: 'TAHLIL',
      items: [
        {
          label: 'Analytics',
          path: '/admin/analytics',
          icon: BarChart3,
        },
      ],
    },
    {
      title: 'KATALOG',
      items: [
        {
          label: 'Mahsulotlar',
          path: '/admin/products',
          icon: Package,
          badge: products.length.toString(),
        },
        {
          label: 'Ommaviy yaratish',
          path: '/admin/products/bulk-create',
          icon: Layers,
        },
        {
          label: 'Import / Eksport',
          path: '/admin/products/import',
          icon: ImportIcon,
        },
        {
          label: 'Kategoriyalar',
          path: '/admin/categories',
          icon: FolderTree,
        },
        {
          label: 'Inventar',
          path: '/admin/inventory',
          icon: Boxes,
        },
      ],
    },
    {
      title: 'FEED',
      items: [
        {
          label: 'Video kutubxonasi',
          path: '/admin/feed',
          icon: Film,
          badge: (publishedVideos?.length ?? 0).toString(),
        },
        {
          label: 'Feed tahlili',
          path: '/admin/feed/analytics',
          icon: BarChart3,
        },
        {
          label: 'Yoqtirishlar',
          path: '/admin/feed/likes',
          icon: Heart,
        },
        {
          label: 'Izohlar',
          path: '/admin/comments',
          icon: MessageCircle,
        },
        {
          label: 'Video samaradorlik',
          path: '/admin/feed/performance',
          icon: TrendingUp,
        },
        {
          label: 'Mahsulot samaradorligi',
          path: '/admin/feed/products',
          icon: ShoppingBag,
        },
      ],
    },
    {
      title: 'KONTENT',
      items: [
        {
          label: 'Bosh sahifa (CMS)',
          path: '/admin/homepage',
          icon: Home,
        },
        {
          label: 'AI Prompt Library',
          path: '/admin/prompts',
          icon: Sparkles,
          badge: prompts.length.toString(),
        },
        {
          label: 'Mijozlar sharhlari',
          path: '/admin/testimonials',
          icon: MessageSquareQuote,
        },
        {
          label: 'Savol-Javoblar',
          path: '/admin/faq',
          icon: HelpCircle,
        },
      ],
    },
    {
      title: "DO'KON",
      items: [
        {
          label: "Do'kon ma'lumotlari",
          path: '/admin/store',
          icon: Store,
        },
        {
          label: 'Biz haqimizda',
          path: '/admin/about',
          icon: Info,
        },
        {
          label: 'Aloqa sahifasi',
          path: '/admin/contact',
          icon: PhoneCall,
        },
      ],
    },
    {
      title: 'TIZIM',
      items: [
        {
          label: 'Sozlamalar',
          path: '/admin/settings',
          icon: Settings,
        },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-card border-r border-border flex flex-col transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-14 px-5 flex items-center justify-between border-b border-border shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-foreground text-background font-bold text-xs flex items-center justify-center">
              {storeInfo.businessName?.charAt(0) || 'D'}
            </div>
            <div className="min-w-0">
              <div className="font-bold text-sm text-foreground truncate leading-tight">
                {storeInfo.businessName}
              </div>
              <p className="text-[10px] text-muted-foreground leading-tight">Commerce CMS</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted lg:hidden transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Store Live Link */}
        <div className="px-3 pt-3 pb-1">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/60 hover:bg-muted text-[11px] font-medium text-muted-foreground hover:text-foreground transition-all group"
          >
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              <span>Jonli ko'rish</span>
            </span>
            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-5 scrollbar-thin" aria-label="Admin navigation">
          {navSections.map((section, sIdx) => (
            <div key={sIdx}>
              <div className="px-3 mb-1.5 text-[10px] font-semibold tracking-widest text-muted-foreground/60 uppercase">
                {section.title}
              </div>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.end}
                      onClick={() => onClose()}
                      className={({ isActive }) =>
                        `admin-nav-item ${isActive ? 'admin-nav-item-active' : ''}`
                      }
                    >
                      <Icon className="w-4 h-4 shrink-0 opacity-70" />
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.badge && (
                        <span className="text-[10px] font-semibold text-muted-foreground tabular-nums">
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User Footer & Logout */}
        <div className="px-3 py-3 border-t border-border shrink-0">
          <div className="flex items-center justify-between px-2 py-1.5">
            <div className="flex items-center gap-2.5 overflow-hidden min-w-0">
              <div className="w-7 h-7 rounded-full bg-muted text-foreground font-semibold text-[11px] flex items-center justify-center shrink-0">
                {user?.username?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="truncate min-w-0">
                <p className="text-xs font-semibold text-foreground truncate leading-tight">
                  {user?.username || 'admin'}
                </p>
                <p className="text-[10px] text-muted-foreground truncate leading-tight">Administrator</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              title="Chiqish"
              className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
