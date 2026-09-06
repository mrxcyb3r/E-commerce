import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';

export const AnnouncementBar: React.FC = () => {
  const announcement = 'Yangi mahsulotlar har hafta qo\'shiladi — yangilanishlarni birinchi bo\'lib ko\'ring';
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('announcementDismissed');
    if (stored === 'true') {
      setIsDismissed(true);
    }
  }, []);

  useEffect(() => {
    const handleStorage = () => {
      const stored = localStorage.getItem('announcementDismissed');
      if (stored === 'true') {
        setIsDismissed(true);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const dismiss = () => {
    setIsDismissed(true);
    try {
      localStorage.setItem('announcementDismissed', 'true');
    } catch {}
  };

  if (isDismissed || !announcement) {
    return null;
  }

  return (
    <div
      className="border-y border-border/20 bg-background text-zinc-400 px-4 sm:px-6 lg:px-8 py-2.5 text-sm font-medium transition-colors dark:bg-zinc-950/80 dark:text-zinc-400"
    >
      <div className="flex items-center gap-3 w-full">
        <span>{announcement}</span>
        <button
          onClick={dismiss}
          className="ml-auto flex items-center gap-1.5 text-[10px] font-black uppercase transition-colors"
          aria-label="Yop"
        >
          ✕
        </button>
      </div>
    </div>
  );
};