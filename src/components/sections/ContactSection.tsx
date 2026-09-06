import React, { useState } from 'react';
import { Send, Phone, MapPin, CheckCircle2, MessageSquare, AlertCircle } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { track } from '../../lib/analytics/client';
import { useI18n } from '../../i18n/I18nContext';
import { Reveal } from '../motion';

export const ContactSection: React.FC = () => {
  const { storeInfo, contactCms } = useStore();
  const { t } = useI18n();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    message: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name.trim()) {
      newErrors.name = t('pages', 'sections.contactErrName');
    }
    if (!formData.phone.trim()) {
      newErrors.phone = t('pages', 'sections.contactErrPhone');
    } else if (formData.phone.replace(/\D/g, '').length < 9) {
      newErrors.phone = t('pages', 'sections.contactErrPhoneFull');
    }
    if (!formData.message.trim()) {
      newErrors.message = t('pages', 'sections.contactErrMessage');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    // Simulate brief network submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 600);
  };

  const handleSendTelegram = () => {
    const text = `${t('pages', 'sections.contactTgHello')}%0A%0A` +
      `${t('pages', 'sections.contactTgName')}${formData.name}%0A` +
      `${t('pages', 'sections.contactTgPhone')}${formData.phone}%0A` +
      `${t('pages', 'sections.contactTgMessage')}${formData.message}`;
    track('contact_click', { metadata: { via: 'telegram-form' } });
    window.open(`${storeInfo.telegram}?text=${text}`, '_blank');
  };

  return (
    <section id="contact" className="py-16 md:py-24 bg-zinc-50/50 dark:bg-background transition-colors scroll-mt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center max-w-2xl mx-auto mb-14 space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{t('pages', 'sections.contactEyebrow')}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground font-display tracking-tighter">
            {contactCms.title || t('pages', 'sections.contactHeading')}
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 font-normal">
            {contactCms.subtitle || t('pages', 'sections.contactSubtitleFallback')}
          </p>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Contact Details Column (5 cols) */}
          <Reveal className="lg:col-span-5 space-y-6">
            <div className="bg-card p-6 rounded-2xl border border-border space-y-6">
              <h3 className="text-xl font-black text-foreground font-display tracking-tight">
                {t('pages', 'sections.contactDirect')}
              </h3>

              <div className="space-y-4">
                <a
                  href={storeInfo.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => track('telegram_click')}
                  className="flex items-center gap-3.5 p-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <Send className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">{t('pages', 'sections.contactViaTelegram')}</div>
                    <div className="text-sm font-black text-foreground group-hover:underline">
                      {storeInfo.telegramUsername}
                    </div>
                  </div>
                </a>

                <a
                  href={`tel:${storeInfo.phoneRaw || storeInfo.phone}`}
                  onClick={() => track('phone_click')}
                  className="flex items-center gap-3.5 p-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">{t('pages', 'sections.contactPhone')}</div>
                    <div className="text-sm font-black text-foreground group-hover:underline">
                      {storeInfo.phone}
                    </div>
                  </div>
                </a>

                <div className="flex items-center gap-3.5 p-3 rounded-xl">
                  <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">{t('pages', 'sections.contactAddress')}</div>
                    <div className="text-sm font-bold text-foreground">
                      {storeInfo.address}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-foreground dark:bg-secondary text-background p-6 rounded-2xl space-y-2 border border-border">
              <div className="text-xs font-black uppercase tracking-wider text-zinc-400">
                {t('pages', 'sections.contactQuick')}
              </div>
              <p className="text-sm text-zinc-300 leading-relaxed font-medium">
                {contactCms.supportNote || t('pages', 'sections.contactSupport')}
              </p>
            </div>
          </Reveal>

          {/* Form Column (7 cols) */}
          <Reveal className="lg:col-span-7 bg-card p-6 sm:p-8 rounded-3xl border border-border shadow-xs">
            {isSubmitted ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-foreground font-display tracking-tight">
                  {t('pages', 'sections.contactReceived')}
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-md mx-auto font-medium">
                  {t('pages', 'sections.contactThanks', formData.name)}
                </p>

                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleSendTelegram}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-black bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-xs"
                  >
                    <Send className="w-4 h-4" />
                    {t('pages', 'sections.contactSendViaTelegram')}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsSubmitted(false);
                      setFormData({ name: '', phone: '', message: '' });
                    }}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-black bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                  >
                    {t('pages', 'sections.contactNewMessage')}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <h3 className="text-xl font-black text-foreground font-display tracking-tight">
                  {t('pages', 'sections.contactLeave')}
                </h3>

                {/* Name */}
                <div>
                  <label
                    htmlFor="contact-name"
                    className="block text-xs font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5"
                  >
                    {t('pages', 'sections.contactName')} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      if (errors.name) setErrors({ ...errors, name: '' });
                    }}
                    placeholder={t('pages', 'sections.contactNamePlaceholder')}
                    className={`w-full px-4 py-3.5 rounded-xl border text-sm bg-zinc-50 dark:bg-zinc-800/80 text-foreground placeholder-zinc-400 focus:outline-none focus:ring-2 ${
                      errors.name
                        ? 'border-rose-500 focus:ring-rose-500'
                        : 'border-border focus:ring-zinc-900 dark:focus:ring-zinc-100'
                    }`}
                  />
                  {errors.name && (
                    <p className="flex items-center gap-1 text-xs text-rose-500 mt-1 font-bold">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label
                    htmlFor="contact-phone"
                    className="block text-xs font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5"
                  >
                    {t('pages', 'sections.contactPhoneLabel')} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="contact-phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => {
                      setFormData({ ...formData, phone: e.target.value });
                      if (errors.phone) setErrors({ ...errors, phone: '' });
                    }}
                    placeholder="+998 90 123 45 67"
                    className={`w-full px-4 py-3.5 rounded-xl border text-sm bg-zinc-50 dark:bg-zinc-800/80 text-foreground placeholder-zinc-400 focus:outline-none focus:ring-2 ${
                      errors.phone
                        ? 'border-rose-500 focus:ring-rose-500'
                        : 'border-border focus:ring-zinc-900 dark:focus:ring-zinc-100'
                    }`}
                  />
                  {errors.phone && (
                    <p className="flex items-center gap-1 text-xs text-rose-500 mt-1 font-bold">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.phone}
                    </p>
                  )}
                </div>

                {/* Message */}
                <div>
                  <label
                    htmlFor="contact-message"
                    className="block text-xs font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5"
                  >
                    {t('pages', 'sections.contactMessage')} <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    id="contact-message"
                    rows={4}
                    value={formData.message}
                    onChange={(e) => {
                      setFormData({ ...formData, message: e.target.value });
                      if (errors.message) setErrors({ ...errors, message: '' });
                    }}
                    placeholder={t('pages', 'sections.contactMessagePlaceholder')}
                    className={`w-full px-4 py-3.5 rounded-xl border text-sm bg-zinc-50 dark:bg-zinc-800/80 text-foreground placeholder-zinc-400 focus:outline-none focus:ring-2 resize-none ${
                      errors.message
                        ? 'border-rose-500 focus:ring-rose-500'
                        : 'border-border focus:ring-zinc-900 dark:focus:ring-zinc-100'
                    }`}
                  />
                  {errors.message && (
                    <p className="flex items-center gap-1 text-xs text-rose-500 mt-1 font-bold">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.message}
                    </p>
                  )}
                </div>

                {/* Submit button */}
                <button
                  id="contact-submit-btn"
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 px-6 rounded-xl font-black text-sm tracking-wide bg-foreground text-background dark:bg-card dark:text-card-foreground hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors shadow-sm disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <span>{t('pages', 'sections.contactSending')}</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>{t('pages', 'sections.contactSend')}</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
};
