import React from 'react';
import { HeroSection } from '../components/hero/HeroSection';
import { TrustStrip } from '../components/sections/TrustStrip';
import { FeaturedProducts } from '../components/products/FeaturedProducts';
import { CategoriesSection } from '../components/sections/CategoriesSection';
import { VideoDiscoverySection } from '../components/sections/VideoDiscoverySection';
import { NewAppArrivals } from '../components/sections/NewAppArrivals';
import { EditorialCampaign } from '../components/sections/EditorialCampaign';
import { ShoppingJourneySection } from '../components/sections/ShoppingJourneySection';
import { StoreLocation } from '../components/sections/StoreLocation';
import { FaqSection } from '../components/sections/FaqSection';
import { FinalCTASection } from '../components/sections/FinalCTASection';

export const HomePage: React.FC = () => {
  return (
    <main className="flex-grow space-y-0">
      <HeroSection />
      <TrustStrip />
      <FeaturedProducts />
      <CategoriesSection />
      <VideoDiscoverySection />
      <NewAppArrivals />
      <EditorialCampaign />
      <ShoppingJourneySection />
      <StoreLocation />
      <FaqSection />
      <FinalCTASection />
    </main>
  );
};