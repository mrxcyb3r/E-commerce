import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Film,
  BarChart3,
  Store,
  Settings,
  LogOut,
  ExternalLink,
  X,
  ChevronDown,
  ChevronRight,
  Send,
  ShoppingCart,
  ScanLine,
  Boxes,
  MessageSquare,
  Sparkles,
  Quote,
  HelpCircle,
  Info,
  Phone,
  Rocket,
  ListOrdered,
  Megaphone,
  Wrench,
  Activity,
  TrendingUp,
  Users,
  ShieldCheck,
  ScrollText,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { can, Capability } from '../../lib/admin/permissions';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  end?: boolean;
  description?: string;
  requires?: Capability;
}

interface NavSection {
  title: string;
  items: NavItem[];
  defaultOpen?: boolean;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, onClose }) => {
  const { logout, user } = useAuth();
  const { storeInfo } = useStore();
  const navigate = useNavigate();
  const [openSections, setOpenSections] = React.useState<Record<string, boolean>>({
    'KATALOG': true,
    'SAVDO': true,
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSection = (title: string) => {
    setOpenSections(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const navSections: NavSection[] = [
    {
      title: 'UMUMIY',
      items: [
        { label: 'Boshqaruv', path: '/admin', icon: LayoutDashboard, end: true, description: 'Asosiy overview', requires: 'dashboard' },
        { label: 'Sozlash', path: '/admin/onboarding', icon: Rocket, description: '10 daqiqada', requires: 'store' },
      ],
    },
    {
      title: 'KATALOG',
      defaultOpen: true,
      items: [
        { label: 'Mahsulotlar', path: '/admin/products', icon: Package, requires: 'products' },
        { label: 'Kategoriyalar', path: '/admin/categories', icon: FolderTree, requires: 'categories' },
        { label: 'Inventar', path: '/admin/inventory', icon: Boxes, requires: 'inventory' },
        { label: 'E‘tibor markazi', path: '/admin/operations', icon: Wrench, description: 'holatlar', requires: 'inventory' },
      ],
    },
    {
      title: 'SAVDO',
      defaultOpen: true,
      items: [
        { label: 'Buyurtmalar', path: '/admin/orders', icon: ShoppingCart, requires: 'orders' },
        { label: 'Do‘konda sotuv', path: '/admin/in-store-sale', icon: ScanLine, requires: 'orders' },
        { label: 'Xarid sessiyalari', path: '/admin/buy-sessions', icon: ListOrdered, description: 'boshqaruv', requires: 'buySessions' },
        { label: 'Aktsiyalar', path: '/admin/campaigns', icon: Megaphone, requires: 'campaigns' },
        { label: 'Izohlar', path: '/admin/comments', icon: MessageSquare, requires: 'feed' },
      ],
    },
    {
      title: 'KONTENT',
      items: [
        { label: 'Video / Feed', path: '/admin/feed', icon: Film, requires: 'feed' },
        { label: 'Bosh sahifa CMS', path: '/admin/homepage', icon: Send, requires: 'homepage' },
        { label: 'AI Promptlar', path: '/admin/prompts', icon: Sparkles, requires: 'prompts' },
        { label: 'Sharhlar', path: '/admin/testimonials', icon: Quote, requires: 'store' },
        { label: 'Savol-Javoblar', path: '/admin/faq', icon: HelpCircle, requires: 'store' },
        { label: 'Biz haqimizda', path: '/admin/about', icon: Info, requires: 'store' },
        { label: 'Aloqa sahifasi', path: '/admin/contact', icon: Phone, requires: 'store' },
      ],
    },
    {
      title: 'ANALITIKA',
      items: [
        { label: 'Tahlil', path: '/admin/analytics', icon: BarChart3, requires: 'analytics' },
        { label: 'Mahsulot tahlili', path: '/admin/products/performance', icon: TrendingUp, description: '7/14/30 kun', requires: 'products' },
        { label: 'Xaridor qiziqishi', path: '/admin/analytics/interest', icon: Users, requires: 'analytics' },
      ],
    },
    {
      title: "DO'KON",
      items: [
        { label: "Do'kon sozlamalari", path: '/admin/store', icon: Store, requires: 'store' },
        { label: 'Faoliyat tarixi', path: '/admin/activity', icon: Activity, requires: 'activity' },
      ],
    },
    {
      title: 'TIZIM',
      items: [
        { label: 'Sozlamalar', path: '/admin/settings', icon: Settings, requires: 'settings' },
      ],
    },
    {
      title: 'XAVFSIZLIK',
      items: [
        { label: 'Xodimlar va takliflar', path: '/admin/users', icon: Users, requires: 'users' },
        { label: 'Hisob xavfsizligi', path: '/admin/security', icon: ShieldCheck, requires: 'settings' },
        { label: 'Audit jurnali', path: '/admin/audit', icon: ScrollText, requires: 'settings' },
      ],
    },
  ];

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-card border-r border-border flex flex-col transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="h-14 px-5 flex items-center justify-between border-b border-border shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-foreground text-background font-bold text-xs flex items-center justify-center">
              {storeInfo.businessName?.charAt(0) || 'D'}
            </div>
            <div className="min-w-0">
              <div className="font-bold text-sm text-foreground truncate leading-tight">
                {storeInfo.businessName}
              </div>
              <p className="text-[10px] text-muted-foreground leading-tight">Boshqaruv paneli</p>
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

        <div className="px-3 pt-3 pb-1">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/60 hover:bg-muted text-[11px] font-medium text-muted-foreground hover:text-foreground transition-all group"
          >
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              <span>Do'koni ko'rish</span>
            </span>
            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4 scrollbar-thin" aria-label="Admin navigation">
          {navSections.map((section) => {
            const isOpen = openSections[section.title] ?? section.defaultOpen ?? false;
            const items = section.items.filter((i) => !i.requires || can(user?.role, i.requires));
            const hasItems = items.length > 0;
            if (!hasItems) return null;

            return (
              <div key={section.title}>
                <button
                  type="button"
                  onClick={() => hasItems && toggleSection(section.title)}
                  className="w-full flex items-center justify-between px-3 mb-1.5 text-[10px] font-semibold tracking-widest text-muted-foreground/60 uppercase hover:text-muted-foreground transition-colors"
                >
                  {section.title}
                  {hasItems && (
                    isOpen
                      ? <ChevronDown className="w-3 h-3" />
                      : <ChevronRight className="w-3 h-3" />
                  )}
                </button>
                {isOpen && (
                  <div className="space-y-0.5">
                    {items.map((item) => {
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
                          {item.description && (
                            <span className="text-[9px] font-medium opacity-60">{item.description}</span>
                          )}
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

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
                <p className="text-[10px] text-muted-foreground truncate leading-tight">
                  {user?.isOwner ? 'Platforma egasi' : 'Administrator'}
                </p>
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
