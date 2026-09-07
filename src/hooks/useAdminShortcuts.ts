import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const ADMIN_SHORTCUT_OPEN_SEARCH = 'admin:open-search';
export const ADMIN_SHORTCUT_OPEN_NOTIFICATIONS = 'admin:open-notifications';

function emit(name: string) {
  window.dispatchEvent(new CustomEvent(name));
}

/**
 * Global admin keyboard shortcuts. No new navigation system —
 * reuses react-router navigation only.
 * - Ctrl/Cmd+K: command palette
 * - G then D/P/O/H/S: dashboard/products/orders/homepage/store
 * - "/": command palette (search focus)
 * - Esc: handled per-dialog (focus trap / close)
 */
export function useAdminShortcuts() {
  const navigate = useNavigate();

  useEffect(() => {
    let pendingG = false;
    let gTimer: ReturnType<typeof setTimeout> | null = null;

    const resetG = () => {
      pendingG = false;
      if (gTimer) clearTimeout(gTimer);
      gTimer = null;
    };

    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing =
        !!target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);

      // Ctrl/Cmd+K — global search
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        emit(ADMIN_SHORTCUT_OPEN_SEARCH);
        resetG();
        return;
      }

      if (typing) {
        resetG();
        return;
      }

      // "/" focuses search
      if (e.key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        emit(ADMIN_SHORTCUT_OPEN_SEARCH);
        resetG();
        return;
      }

      // G-prefix navigation
      if (e.key.toLowerCase() === 'g' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        pendingG = true;
        if (gTimer) clearTimeout(gTimer);
        gTimer = setTimeout(resetG, 800);
        return;
      }

      if (pendingG && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const k = e.key.toLowerCase();
        const routes: Record<string, string> = {
          d: '/admin',
          p: '/admin/products',
          o: '/admin/orders',
          h: '/admin/homepage',
          s: '/admin/store',
          a: '/admin/analytics',
          i: '/admin/inventory',
          c: '/admin/categories',
          f: '/admin/feed',
        };
        if (routes[k]) {
          e.preventDefault();
          navigate(routes[k]);
        }
        resetG();
      }
    };

    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      if (gTimer) clearTimeout(gTimer);
    };
  }, [navigate]);
}

export function openAdminSearch() {
  emit(ADMIN_SHORTCUT_OPEN_SEARCH);
}

export function openAdminNotifications() {
  emit(ADMIN_SHORTCUT_OPEN_NOTIFICATIONS);
}
