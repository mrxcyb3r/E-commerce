import React from 'react';
import { HeroSection } from '../components/hero/HeroSection';
import { CategorySection } from '../components/categories/CategorySection';
import { FeaturedProducts } from '../components/products/FeaturedProducts';
import { VideoDiscoverySection } from '../components/sections/VideoDiscoverySection';
import { WhyChooseUs } from '../components/sections/WhyChooseUs';
import { HowItWorks } from '../components/sections/HowItWorks';
import { StoreLocation } from '../components/sections/StoreLocation';
import { FaqSection } from '../components/sections/FaqSection';
import { ContactSection } from '../components/sections/ContactSection';
import { TrustBadges } from '../components/sections/TrustBadges';

export const HomePage: React.FC = () => {
  return (
    <div className="space-y-0">
      <HeroSection />
      <TrustBadges />
      <CategorySection />
      <FeaturedProducts />
      <VideoDiscoverySection />
      <WhyChooseUs />
      <HowItWorks />
      <StoreLocation />
      <FaqSection />
      <ContactSection />
    </div>
  );
};