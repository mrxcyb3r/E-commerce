import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Home, Search } from 'lucide-react';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { useI18n } from '../i18n/I18nContext';

export const NotFoundPage: React.FC = () => {
  const { t } = useI18n();
  useDocumentMeta({
    title: '404',
    description: t('pages', 'notFound.metaDesc'),
  });

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="relative inline-flex justify-center">
          <span className="text-[120px] font-black leading-none tracking-tighter text-zinc-200 dark:text-zinc-800 font-display select-none">
            404
          </span>
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <Search className="w-10 h-10 text-amber-500/60" />
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black text-foreground font-display">
            {t('pages', 'notFound.heading')}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
            {t('pages', 'notFound.desc')}
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-foreground dark:bg-card text-background dark:text-card-foreground text-sm font-black hover:opacity-90 transition-all active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('pages', 'notFound.home')}</span>
          </Link>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl border border-border text-zinc-700 dark:text-zinc-200 text-sm font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all active:scale-95"
          >
            <Home className="w-4 h-4" />
            <span>{t('pages', 'notFound.catalog')}</span>
          </Link>
        </div>
      </div>
    </div>
  );
};