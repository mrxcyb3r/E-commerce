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
  ChevronRight,
  X,
  BarChart3,
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
      title: 'TAHLIL VA TASHHIS',
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
          label: 'Kategoriyalar',
          path: '/admin/categories',
          icon: FolderTree,
        },
        {
          label: 'Inventar & Zaxira',
          path: '/admin/inventory',
          icon: Boxes,
        },
      ],
    },
    {
      title: 'KONTENT VA MEDIA',
      items: [
        {
          label: 'Bosh sahifa (CMS)',
          path: '/admin/homepage',
          icon: Home,
        },
        {
          label: 'Jonli Vitrina / Feed',
          path: '/admin/feed',
          icon: Film,
          badge: (publishedVideos?.length ?? 0).toString(),
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
          label: 'Savol-Javoblar (FAQ)',
          path: '/admin/faq',
          icon: HelpCircle,
        },
      ],
    },
    {
      title: 'DO\'KON VA ALOQA',
      items: [
        {
          label: 'Do\'kon ma\'lumotlari',
          path: '/admin/store',
          icon: Store,
        },
        {
          label: 'Biz haqimizda (About)',
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
          label: 'Sozlamalar & Zaxira',
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
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-72 bg-neutral-900 text-white flex flex-col border-r border-neutral-800 transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-neutral-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-neutral-950 font-black text-sm flex items-center justify-center shadow-sm">
              E
            </div>
            <div>
              <div className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1.5">
                <span>{storeInfo.businessName}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-amber-400/20 text-amber-300">
                  CMS
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">Boshqaruv markazi</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Store Live Link */}
        <div className="p-3 border-b border-neutral-800 bg-neutral-950/40">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between px-3 py-2 rounded-xl bg-neutral-800/80 hover:bg-neutral-800 text-xs font-semibold text-neutral-300 hover:text-white transition-all group"
          >
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Saytni jonli ko'rish</span>
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-neutral-400 group-hover:text-white" />
          </a>
        </div>

        {/* Nav Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-neutral-800">
          {navSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              <div className="px-3 text-[10px] font-bold tracking-wider text-neutral-500 uppercase">
                {section.title}
              </div>
              <div className="space-y-0.5 mt-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.end}
                      onClick={() => onClose()}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                          isActive
                            ? 'bg-amber-500 text-neutral-950 font-bold shadow-sm'
                            : 'text-neutral-300 hover:text-white hover:bg-neutral-800/60'
                        }`
                      }
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-neutral-800 text-neutral-300 group-hover:bg-neutral-700">
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* User Footer & Logout */}
        <div className="p-3 border-t border-neutral-800 bg-neutral-950/60 shrink-0">
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-neutral-800/40">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-neutral-700 text-white font-bold text-xs flex items-center justify-center shrink-0">
                {user?.username?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-white truncate">
                  {user?.username || 'admin'}
                </p>
                <p className="text-[10px] text-neutral-400 truncate">Administrator</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              title="Chiqish"
              className="p-2 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-red-950/30 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
