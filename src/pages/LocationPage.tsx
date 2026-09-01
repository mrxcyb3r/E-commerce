import React from 'react';
import { StoreLocation } from '../components/sections/StoreLocation';
import { FaqSection } from '../components/sections/FaqSection';
import { ContactSection } from '../components/sections/ContactSection';
import { BUSINESS_CONFIG } from '../config/business';
import { MapPin, Navigation, Clock, Phone } from 'lucide-react';

export const LocationPage: React.FC = () => {
  return (
    <div className="pt-28 pb-20 space-y-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-zinc-900 dark:text-white font-['Outfit',sans-serif] tracking-tighter">
          Do'konimiz manzili
        </h1>
        <p className="text-base text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
          Bizning do'konimizga tashrif buyuring va sifatli mahsulotlarni qulay sharoitda kiyib ko'ring.
        </p>
      </div>

      <StoreLocation />
      <FaqSection />
      <ContactSection />
    </div>
  );
};
