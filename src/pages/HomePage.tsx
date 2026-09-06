import React from 'react';
import { HeroSection } from '../components/hero/HeroSection';
import { TrendingNow } from '../components/homepage/TrendingNow';
import { VideoFeed } from '../components/homepage/VideoFeed';
import { FeaturedCollection } from '../components/homepage/FeaturedCollection';
import { NewArrivals } from '../components/homepage/NewArrivals';
import { ShopByStyle } from '../components/homepage/ShopByStyle';
import { Community } from '../components/homepage/Community';
import { StoreExperience } from '../components/homepage/StoreExperience';

export const HomePage: React.FC = () => {
  return (
    <main className="flex-grow space-y-0">
      <HeroSection />
      <TrendingNow />
      <VideoFeed />
      <FeaturedCollection />
      <NewArrivals />
      <ShopByStyle />
      <Community />
      <StoreExperience />
    </main>
  );
};

export default HomePage;