import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldX, ArrowLeft, LayoutDashboard } from 'lucide-react';

export const ForbiddenPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="relative inline-flex justify-center">
          <span className="text-[110px] font-black leading-none tracking-tighter text-zinc-200 dark:text-zinc-800 font-display select-none">
            403
          </span>
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-3xl bg-destructive/10 border border-destructive/20 flex items-center justify-center">
            <ShieldX className="w-9 h-9 text-destructive/70" />
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-black text-foreground font-display">
            Ruxsat yo‘q
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Bu bo‘limga kirish uchun yetarli huquqlaringiz yo‘q. Ruxsat
            so‘rovi uchun platforma egasiga murojaat qiling.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-foreground dark:bg-card text-background dark:text-card-foreground text-sm font-black hover:opacity-90 transition-all active:scale-95"
          >
            <LayoutDashboard className="w-4 h-4" />
            Boshqaruv paneliga
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl border border-border text-zinc-700 dark:text-zinc-200 text-sm font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            Do‘konga qaytish
          </Link>
        </div>
      </div>
    </div>
  );
};