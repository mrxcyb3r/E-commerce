import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Home, Search } from 'lucide-react';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

export const NotFoundPage: React.FC = () => {
  useDocumentMeta({
    title: '404',
    description: 'Sahifa topilmadi',
  });

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="relative inline-flex justify-center">
          <span className="text-[120px] font-black leading-none tracking-tighter text-neutral-200 dark:text-neutral-800 font-['Outfit',sans-serif] select-none">
            404
          </span>
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <Search className="w-10 h-10 text-amber-500/60" />
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black text-neutral-900 dark:text-white font-['Outfit',sans-serif]">
            Sahifa topilmadi
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
            Ushbu sahifa mavjud emas yoki ko'chirilgan bo'lishi mumkin.
            Mahsulotlarimizni ko'rib chiqish uchun katalogga o'ting.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 text-sm font-black hover:bg-neutral-800 dark:hover:bg-zinc-100 transition-all active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Bosh sahifa</span>
          </Link>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 text-sm font-bold hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all active:scale-95"
          >
            <Home className="w-4 h-4" />
            <span>Katalog</span>
          </Link>
        </div>
      </div>
    </div>
  );
};