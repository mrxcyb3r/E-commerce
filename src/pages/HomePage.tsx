import React, { useEffect } from 'react';
import { HeroSection } from '../components/hero/HeroSection';
import { StoreExperience } from '../components/homepage/StoreExperience';
import { ProductsSection } from '../components/sections/ProductsSection';
import { CategoriesSection } from '../components/sections/CategoriesSection';
import { VideoDiscoverySection } from '../components/sections/VideoDiscoverySection';
import { StoreLocation } from '../components/sections/StoreLocation';
import { ContactSection } from '../components/sections/ContactSection';
import { track } from '../lib/analytics/client';

export const HomePage: React.FC = () => {
  const { storeInfo } = useStore();
  useEffect(() => {
    track('homepage_view', {
      hasAddress: !!storeInfo.address,
      hasPhone: !!storeInfo.phone,
      hasTelegram: !!storeInfo.telegramUsername,
    });
  }, [storeInfo]);
  return (
    <main className="flex-grow space-y-0">
      <HeroSection />
      <StoreExperience />
      <ProductsSection />
      <CategoriesSection />
      <VideoDiscoverySection />
      {storeInfo.address || storeInfo.phone ? (
        <StoreLocation />
      ) : null}
      {storeInfo.address || storeInfo.phone || storeInfo.telegramUsername ? (
        <ContactSection />
      ) : null}
    </main>
  );
};

export default HomePage;