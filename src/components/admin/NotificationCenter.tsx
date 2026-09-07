import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Image as ImageIcon,
  MapPin,
  Package,
  Phone,
  Store,
  X,
  XCircle,
  FolderTree,
  ArrowRight,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { relativeTime } from '../../lib/admin/relativeTime';
import { ADMIN_SHORTCUT_OPEN_NOTIFICATIONS } from '../../hooks/useAdminShortcuts';

const READ_KEY = 'admin-notifications-read-at';

interface Notice {
  id: string;
  title: string;
  desc: string;
  href: string;
  time?: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: string;
}

function readStored(): number {
  try {
    return Number(sessionStorage.getItem(READ_KEY) || 0);
  } catch {
    return 0;
  }
}

/**
 * Global notification drawer. Reuses StoreContext activity + live inventory
 * state — no polling, no duplicate notification system.
 * Read state persists for the session only (sessionStorage).
 */
export const NotificationCenter: React.FC<{
  open: boolean;
  onClose: () => void;
}> = ({ open, onClose }) => {
  const { products, categories, storeInfo, homepageSlides, activityLogs } = useStore();
  const [readAt, setReadAt] = useState<number>(() => readStored());

  useEffect(() => {
    const onOpen = () => {
      // Parent owns open state via header; this listener supports shortcuts
      // only when parent wires it — kept for symmetry with search.
    };
    window.addEventListener(ADMIN_SHORTCUT_OPEN_NOTIFICATIONS, onOpen);
    return () => window.removeEventListener(ADMIN_SHORTCUT_OPEN_NOTIFICATIONS, onOpen);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const notices: Notice[] = useMemo(() => {
    const list: Notice[] = [];
    const missingImages = products.filter((p) => !p.images || p.images.length === 0);
    const outOfStock = products.filter(
      (p) => !p.inStock || (p.stockCount !== undefined && p.stockCount <= 0)
    );
    const lowStock = products.filter(
      (p) => p.inStock && (p.stockCount ?? 0) > 0 && (p.stockCount ?? 0) <= 3
    );
    const emptyCategories = categories.filter((c) => {
      const count = products.filter(
        (p) => p.category === c.id || p.category === c.slug || p.categoryName === c.name
      ).length;
      return count === 0;
    });

    if (missingImages.length > 0)
      list.push({
        id: 'missing-images',
        title: `${missingImages.length} ta mahsulot rasmsiz`,
        desc: 'Mijozlar rasmsiz mahsulotni kam ko‘radi',
        href: '/admin/products',
        icon: ImageIcon,
        tone: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
      });
    if (outOfStock.length > 0)
      list.push({
        id: 'out-of-stock',
        title: `${outOfStock.length} ta mahsulot tugagan`,
        desc: 'Zaxirani yangilang yoki yashiring',
        href: '/admin/inventory',
        icon: XCircle,
        tone: 'bg-red-500/10 text-red-600 dark:text-red-400',
      });
    if (lowStock.length > 0)
      list.push({
        id: 'low-stock',
        title: `${lowStock.length} ta mahsulot kam qoldi (≤3)`,
        desc: 'Qayta zaxira qilish kerak',
        href: '/admin/inventory',
        icon: AlertTriangle,
        tone: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
      });
    if (emptyCategories.length > 0)
      list.push({
        id: 'empty-cats',
        title: `${emptyCategories.length} ta bo‘sh kategoriya`,
        desc: emptyCategories.slice(0, 2).map((c) => c.name).join(', '),
        href: '/admin/categories',
        icon: FolderTree,
        tone: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
      });
    if (homepageSlides.length > 0 && homepageSlides.filter((s) => s.active).length === 0)
      list.push({
        id: 'no-slides',
        title: 'Faol slayd yo‘q',
        desc: 'Bosh sahifa slayderi bo‘sh ko‘rinadi',
        href: '/admin/homepage',
        icon: Package,
        tone: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
      });
    if (!storeInfo.logoUrl)
      list.push({
        id: 'no-logo',
        title: 'Logo yuklanmagan',
        desc: 'Brend ishonchliligini oshiring',
        href: '/admin/store',
        icon: Store,
        tone: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      });
    if (!storeInfo.phoneNumbers?.[0] && !storeInfo.phone)
      list.push({
        id: 'no-phone',
        title: 'Telefon kiritilmagan',
        desc: 'Mijozlar bog‘lana olmaydi',
        href: '/admin/store',
        icon: Phone,
        tone: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
      });
    if (!storeInfo.address)
      list.push({
        id: 'no-address',
        title: 'Manzil kiritilmagan',
        desc: 'Xarita va tashrif uchun muhim',
        href: '/admin/store',
        icon: MapPin,
        tone: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
      });

    // Recent activity as system notices
    (activityLogs ?? []).slice(0, 4).forEach((l) => {
      list.push({
        id: l.id,
        title: l.description,
        desc: `${l.entity} · ${l.action}`,
        href: '/admin/analytics',
        time: l.timestamp,
        icon: CheckCircle2,
        tone: 'bg-muted text-muted-foreground',
      });
    });

    return list.slice(0, 12);
  }, [products, categories, storeInfo, homepageSlides, activityLogs]);

  const markAllRead = () => {
    const now = Date.now();
    setReadAt(now);
    try {
      sessionStorage.setItem(READ_KEY, String(now));
    } catch {
      // ignore
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80]" role="dialog" aria-modal="true" aria-label="Bildirishnomalar">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: 320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 320, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="fixed top-0 bottom-0 right-0 z-10 w-full max-w-sm bg-card border-l border-border flex flex-col shadow-2xl"
          >
            <div className="flex items-center gap-2 px-4 h-14 border-b border-border shrink-0">
              <Bell className="w-4 h-4 text-amber-500" aria-hidden="true" />
              <h2 className="text-sm font-bold">Bildirishnomalar</h2>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-muted">
                {notices.length}
              </span>
              <div className="ml-auto flex items-center gap-1">
                <button
                  type="button"
                  onClick={markAllRead}
                  className="px-2.5 py-1.5 text-[11px] font-semibold rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  Hammasini o‘qildi
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Bildirishnomalarni yopish"
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {notices.length === 0 ? (
                <div className="py-12 text-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" aria-hidden="true" />
                  <p className="text-xs font-semibold">Hammasi joyida!</p>
                  <p className="text-[11px] text-muted-foreground">E’tibor talab qiladigan holat yo‘q.</p>
                </div>
              ) : (
                notices.map((n) => {
                  const Icon = n.icon;
                  const isNew = n.time ? new Date(n.time).getTime() > readAt : true;
                  return (
                    <Link
                      key={n.id}
                      to={n.href}
                      onClick={onClose}
                      className="flex items-start gap-2.5 p-2.5 rounded-xl bg-muted/40 border border-border/50 hover:border-primary/30 hover:bg-muted/70 transition-all group"
                    >
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${n.tone}`}>
                        <Icon className="w-4 h-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-1.5">
                          <span className="block text-xs font-bold truncate flex-1">{n.title}</span>
                          {isNew && <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" aria-label="Yangi" />}
                        </span>
                        <span className="block text-[11px] text-muted-foreground truncate">{n.desc}</span>
                        <span className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-primary">
                          {n.time ? relativeTime(n.time) : 'Ko‘rish'} <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
                        </span>
                      </span>
                    </Link>
                  );
                })
              )}
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
};

export function useNotificationCount(): number {
  const { products, categories, storeInfo, homepageSlides } = useStore();
  return useMemo(() => {
    let n = 0;
    if (products.some((p) => !p.images || p.images.length === 0)) n += 1;
    if (products.some((p) => !p.inStock || (p.stockCount ?? 1) <= 0)) n += 1;
    if (products.some((p) => p.inStock && (p.stockCount ?? 0) > 0 && (p.stockCount ?? 0) <= 3)) n += 1;
    if (categories.some((c) => !products.some((p) => p.category === c.id || p.category === c.slug || p.categoryName === c.name))) n += 1;
    if (homepageSlides.length > 0 && homepageSlides.filter((s) => s.active).length === 0) n += 1;
    if (!storeInfo.logoUrl) n += 1;
    if (!storeInfo.phoneNumbers?.[0] && !storeInfo.phone) n += 1;
    if (!storeInfo.address) n += 1;
    return n;
  }, [products, categories, storeInfo, homepageSlides]);
}

export default NotificationCenter;
