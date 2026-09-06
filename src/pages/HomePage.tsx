import React from 'react';
import { HeroSection } from '../components/hero/HeroSection';
import { StoreExperience } from '../components/homepage/StoreExperience';
import { ProductsSection } from '../components/sections/ProductsSection';
import { CategoriesSection } from '../components/sections/CategoriesSection';
import { VideoDiscoverySection } from '../components/sections/VideoDiscoverySection';
import { StoreLocation } from '../components/sections/StoreLocation';
import { ContactSection } from '../components/sections/ContactSection';

export const HomePage: React.FC = () => {
  return (
    <main className="flex-grow space-y-0">
      <HeroSection />
      <StoreExperience />
      <ProductsSection />
      <CategoriesSection />
      <VideoDiscoverySection />
      <StoreLocation />
      <ContactSection />
    </main>
  );
};

export default HomePage;