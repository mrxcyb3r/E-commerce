import React, { Suspense, useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { AdminPageTransition } from './AdminPageTransition';
import { CommandPalette } from './CommandPalette';
import { NotificationCenter } from './NotificationCenter';
import { TableSkeleton } from './ui/LoadingSkeleton';
import { useAdminShortcuts, ADMIN_SHORTCUT_OPEN_NOTIFICATIONS } from '../../hooks/useAdminShortcuts';
import { SessionWarningBanner } from './SessionWarningBanner';

export const AdminLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  useAdminShortcuts();

  useEffect(() => {
    const onOpen = () => setNotificationsOpen(true);
    window.addEventListener(ADMIN_SHORTCUT_OPEN_NOTIFICATIONS, onOpen);
    return () => window.removeEventListener(ADMIN_SHORTCUT_OPEN_NOTIFICATIONS, onOpen);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground flex font-sans">
      <AdminSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <AdminHeader
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onOpenNotifications={() => setNotificationsOpen(true)}
        />
        <SessionWarningBanner />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1400px] w-full mx-auto min-w-0 overflow-x-clip">
          <Suspense fallback={<TableSkeleton columns={5} rows={6} />}>
            <AdminPageTransition>
              <Outlet />
            </AdminPageTransition>
          </Suspense>
        </main>
      </div>

      <CommandPalette />
      <NotificationCenter open={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
    </div>
  );
};
