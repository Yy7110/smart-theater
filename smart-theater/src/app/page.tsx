"use client";

import HeroSection from "@/components/home/HeroSection";
import FeaturedShows from "@/components/home/FeaturedShows";
import StatsSection from "@/components/home/StatsSection";
import UpcomingSection from "@/components/home/UpcomingSection";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturedShows />
      <StatsSection />
      <UpcomingSection />
    </>
  );
}
