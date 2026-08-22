import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, ArrowRight, Home, Globe, Compass, Sparkles, MapPin } from 'lucide-react';

export default function HeroSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/explore');
    }
  };

  return (
    <section className="relative w-full min-h-[460px] sm:min-h-[560px] md:min-h-[640px] flex items-center justify-center overflow-hidden rounded-3xl sm:rounded-[36px] my-2 sm:my-5 border border-vistaro-border/60 shadow-lg">
      {/* Background Image with Cinematic Dark Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1920&q=80"
          alt="Vistaro Luxury Sanctuary"
          className="w-full h-full object-cover object-center transform scale-105"
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
        {/* Subtle dark gradient overlay for optimal legibility across both themes */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/55 to-black/35 backdrop-blur-[0.5px]" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-8 py-8 sm:py-14 md:py-16 text-center text-white space-y-5 sm:space-y-7 animate-fade-in">
        
        {/* Subtle Category Scope Chips */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2.5 text-xs">
          {[
            { label: 'Stays', icon: Home, to: '/explore' },
            { label: 'Destinations', icon: Globe, to: '/destinations' },
            { label: 'Tours', icon: Compass, to: '/tours' },
            { label: 'Experiences', icon: Sparkles, to: '/experiences' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                to={item.to}
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'instant' });
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[34px] sm:min-h-[36px] rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white/90 hover:text-white transition-colors backdrop-blur-md text-[11px] sm:text-xs font-medium tracking-wide touch-manipulation"
              >
                <Icon className="w-3 h-3 text-vistaro-accent" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Editorial Headline in Fraunces */}
        <div className="space-y-2.5 sm:space-y-4">
          <h1 className="font-serif font-normal text-2xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tight leading-[1.18] text-white drop-shadow-sm">
            Curated Sanctuaries &amp; Transformative Journeys
          </h1>
          <p className="font-sans text-white/85 text-xs sm:text-sm md:text-base max-w-2xl mx-auto font-normal leading-relaxed">
            Discover verified luxury villas, multi-day guided expeditions, and authentic local host immersions across iconic landscapes.
          </p>
        </div>

        {/* Search Bar */}
        <div className="w-full max-w-2xl mx-auto pt-2">
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center bg-white/95 dark:bg-vistaro-surface/95 backdrop-blur-md border border-white/40 dark:border-vistaro-border rounded-full p-1.5 sm:p-2 shadow-2xl transition-all focus-within:ring-2 focus-within:ring-vistaro-accent"
          >
            <div className="flex items-center pl-3 sm:pl-4 pr-2 text-vistaro-muted shrink-0">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-vistaro-accent" />
            </div>
            <input
              type="text"
              placeholder="Search destinations, villas, expeditions, experiences..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none text-xs sm:text-sm md:text-base text-vistaro-primary placeholder-vistaro-muted focus:outline-hidden py-2 px-1 font-sans"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-1.5 bg-vistaro-accent hover:bg-vistaro-accent-hover text-white text-xs sm:text-sm font-semibold py-2.5 sm:py-3 px-5 sm:px-6 min-h-[44px] rounded-full transition-all duration-200 shrink-0 cursor-pointer shadow-md touch-manipulation"
              aria-label="Search Vistaro"
            >
              <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Search</span>
              <ArrowRight className="w-3.5 h-3.5 hidden sm:inline" />
            </button>
          </form>
        </div>

        {/* Discovery Subtitle Note */}
        <p className="text-white/60 text-2xs sm:text-xs tracking-wider uppercase font-medium">
          Handcrafted luxury travel · Verified hosts &amp; licensed local guides
        </p>

      </div>
    </section>
  );
}
