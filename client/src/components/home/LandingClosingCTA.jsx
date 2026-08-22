import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Compass } from 'lucide-react';
import { useScrollReveal } from '../../hooks/useScrollReveal.js';

export default function LandingClosingCTA() {
  const [sectionRef, isVisible] = useScrollReveal();

  return (
    <section
      ref={sectionRef}
      className={`w-full my-14 sm:my-20 text-vistaro-primary transition-all duration-500 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <div className="relative overflow-hidden rounded-3xl sm:rounded-[36px] bg-gradient-to-b from-vistaro-surface to-vistaro-secondary/30 border border-vistaro-border p-8 sm:p-14 md:p-16 text-center space-y-6 shadow-xs">
        {/* Subtle decorative glow badge */}
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-vistaro-accent/10 text-vistaro-accent mx-auto">
          <Compass className="w-6 h-6" />
        </div>

        {/* Editorial Headline in Fraunces */}
        <div className="space-y-3 max-w-2xl mx-auto">
          <h2 className="font-serif font-normal text-3xl sm:text-4xl md:text-5xl text-vistaro-primary tracking-tight leading-tight">
            Your Next Trip Starts Here
          </h2>
          <p className="font-sans text-xs sm:text-base text-vistaro-secondary max-w-xl mx-auto leading-relaxed">
            Browse our complete collection of verified boutique villas, regional destinations, guided expeditions, and local host immersions.
          </p>
        </div>

        {/* Single Confident Primary CTA */}
        <div className="pt-2 flex justify-center">
          <Link
            to="/explore"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'instant' });
            }}
            className="inline-flex items-center gap-2.5 bg-vistaro-accent hover:bg-vistaro-accent-hover text-white text-cta font-semibold py-3.5 sm:py-4 px-8 sm:px-10 min-h-[48px] rounded-full transition-all duration-200 shadow-sm hover:shadow-lg cursor-pointer group transform hover:-translate-y-0.5 touch-manipulation"
          >
            <span>Explore Everything</span>
            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
