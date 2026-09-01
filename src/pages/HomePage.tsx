import React from 'react';
import { HeroSection } from '../components/hero/HeroSection';
import { TrustStats } from '../components/hero/TrustStats';
import { CategorySection } from '../components/categories/CategorySection';
import { FeaturedProducts } from '../components/products/FeaturedProducts';
import { VideoDiscoverySection } from '../components/sections/VideoDiscoverySection';
import { WhyChooseUs } from '../components/sections/WhyChooseUs';
import { HowItWorks } from '../components/sections/HowItWorks';
import { PromoBanner } from '../components/sections/PromoBanner';
import { ReviewsSection } from '../components/sections/ReviewsSection';
import { StoreLocation } from '../components/sections/StoreLocation';
import { FaqSection } from '../components/sections/FaqSection';
import { ContactSection } from '../components/sections/ContactSection';

export const HomePage: React.FC = () => {
  return (
    <div className="space-y-0">
      <HeroSection />
      <TrustStats />
      <CategorySection />
      <FeaturedProducts />
      <VideoDiscoverySection />
      <WhyChooseUs />
      <HowItWorks />
      <PromoBanner />
      <ReviewsSection />
      <StoreLocation />
      <FaqSection />
      <ContactSection />
    </div>
  );
};
