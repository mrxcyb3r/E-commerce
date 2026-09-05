import React, { useState } from 'react';
import { Mail, Send } from 'lucide-react';
import { useToast } from '../common/ToastProvider';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const NewsletterBand: React.FC = () => {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!EMAIL_PATTERN.test(email.trim())) {
      showToast("Iltimos, to'g'ri elektron pochta kiriting", 'error');
      return;
    }
    showToast("Obuna bo'ldingiz! Yangiliklarimizdan xabardor bo'lasiz", 'success');
    setEmail('');
  };

  return (
    <section id="newsletter" className="bg-zinc-900 dark:bg-zinc-950 border-b border-zinc-800 dark:border-zinc-900 py-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-400">
              <Mail className="w-4 h-4" />
              <span>Yangiliklar</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white font-['Outfit',sans-serif] tracking-tight">
              Yangi kolleksiyalardan birinchi bo'lib xabardor bo'ling
            </h2>
            <p className="text-sm text-zinc-400 font-normal">
              Chegirmalar va yangi mahsulotlar haqida birinchi bo\'lib biling.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 w-full lg:max-w-md" noValidate>
            <label htmlFor="newsletter-email" className="sr-only">
              Elektron pochta manzili
            </label>
            <input
              id="newsletter-email"
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@misol.uz"
              autoComplete="email"
              className="flex-1 px-4 py-3 rounded-xl bg-zinc-800/80 dark:bg-zinc-900 border border-zinc-700 dark:border-zinc-800 text-sm text-white placeholder:text-zinc-500 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/70"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white text-zinc-900 text-sm font-black hover:bg-zinc-200 transition-colors shadow-sm"
              aria-label="Yangiliklarga obuna bo'lish"
            >
              <Send className="w-4 h-4" />
              <span>Obuna bo\'lish</span>
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};