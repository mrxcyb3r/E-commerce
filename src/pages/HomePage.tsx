import React from 'react';
import { HeroSection } from '../components/hero/HeroSection';
import { FeaturedCollection } from '../components/homepage/FeaturedCollection';
import { ShopByStyle } from '../components/homepage/ShopByStyle';
import { VideoFeed } from '../components/homepage/VideoFeed';
import { StoreExperience } from '../components/homepage/StoreExperience';

export const HomePage: React.FC = () => {
  return (
    <main className="flex-grow space-y-0">
      <HeroSection />
      <FeaturedCollection />
      <ShopByStyle />
      <VideoFeed />
      <StoreExperience />
    </main>
  );
};

export default HomePage;
