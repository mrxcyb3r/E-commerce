import React, { useState } from 'react';
import { Mail, Send } from 'lucide-react';
import { useToast } from '../common/ToastProvider';
import { useI18n } from '../../i18n/I18nContext';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const NewsletterBand: React.FC = () => {
  const { showToast } = useToast();
  const { t } = useI18n();
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!EMAIL_PATTERN.test(email.trim())) {
      showToast(t('pages', 'sections.newsletterError'), 'error');
      return;
    }
    showToast(t('pages', 'sections.newsletterSuccess'), 'success');
    setEmail('');
  };

  return (
    <section id="newsletter" className="bg-foreground dark:bg-background border-b border-border dark:border-zinc-900 py-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-400">
              <Mail className="w-4 h-4" />
              <span>{t('pages', 'sections.newsletterEyebrow')}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-background font-display tracking-tight">
              {t('pages', 'sections.newsletterTitle')}
            </h2>
            <p className="text-sm text-zinc-400 font-normal">
              {t('pages', 'sections.newsletterSubtitle')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 w-full lg:max-w-md" noValidate>
            <label htmlFor="newsletter-email" className="sr-only">
              {t('pages', 'sections.newsletterSrLabel')}
            </label>
            <input
              id="newsletter-email"
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
               placeholder={t('pages', 'sections.newsletterPlaceholder')}
              autoComplete="email"
              className="flex-1 px-4 py-3 rounded-xl bg-zinc-800/80 dark:bg-card border border-zinc-700 dark:border-border text-sm text-white placeholder:text-zinc-500 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/70"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-card text-foreground text-sm font-black hover:bg-zinc-200 transition-colors shadow-sm"
              aria-label={t('pages', 'sections.newsletterButtonAria')}
            >
              <Send className="w-4 h-4" />
              <span>{t('pages', 'sections.newsletterButton')}</span>
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};