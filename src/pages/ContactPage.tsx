import React from 'react';
import { ContactSection } from '../components/sections/ContactSection';
import { StoreLocation } from '../components/sections/StoreLocation';
import { FaqSection } from '../components/sections/FaqSection';

export const ContactPage: React.FC = () => {
  return (
    <div className="pt-28 pb-20 space-y-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-zinc-900 dark:text-white font-['Outfit',sans-serif] tracking-tighter">
          Biz bilan bog'laning
        </h1>
        <p className="text-base text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
          Mahsulotlar haqida qo'shimcha ma'lumot olish yoki zaxirani bilish uchun biz bilan istalgan qulay usulda bog'lanishingiz mumkin.
        </p>
      </div>

      <ContactSection />
      <StoreLocation />
      <FaqSection />
    </div>
  );
};
