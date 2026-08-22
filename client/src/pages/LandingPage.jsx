import React, { useEffect } from 'react';
import HeroSection from '../components/home/HeroSection.jsx';
import LandingFeaturedStays from '../components/home/LandingFeaturedStays.jsx';
import LandingFeaturedDestinations from '../components/home/LandingFeaturedDestinations.jsx';
import LandingFeaturedTours from '../components/home/LandingFeaturedTours.jsx';
import LandingFeaturedExperiences from '../components/home/LandingFeaturedExperiences.jsx';
import LandingClosingCTA from '../components/home/LandingClosingCTA.jsx';

export default function LandingPage() {
  useEffect(() => {
    document.title = 'Vistaro — Curated Sanctuaries & Transformative Journeys';
    const metaDescription = document.querySelector('meta[name="description"]');
    const originalContent = metaDescription ? metaDescription.getAttribute('content') : '';
    
    if (metaDescription) {
      metaDescription.setAttribute(
        'content',
        'Discover verified luxury villas, regional destinations, guided expeditions, and authentic local host immersions across India with Vistaro.'
      );
    }

    return () => {
      document.title = 'Vistaro — Find Your Perfect Stay';
      if (metaDescription && originalContent) {
        metaDescription.setAttribute('content', originalContent);
      }
    };
  }, []);

  return (
    <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-8 md:px-10 lg:px-12 text-vistaro-primary transition-colors duration-200">
      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Curated Stays Section */}
      <LandingFeaturedStays />

      {/* 3. Curated Destinations Section */}
      <LandingFeaturedDestinations />

      {/* 4. Curated Guided Expeditions Section */}
      <LandingFeaturedTours />

      {/* 5. Curated Host Experiences Section */}
      <LandingFeaturedExperiences />

      {/* 6. Single Confident Closing CTA */}
      <LandingClosingCTA />
    </div>
  );
}
