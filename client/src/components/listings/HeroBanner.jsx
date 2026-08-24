import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight,
  Star,
  Globe,
  Compass,
} from 'lucide-react';

export default function HeroBanner({ onExploreClick }) {
  const [destinationQuery, setDestinationQuery] = useState('');
  const navigate = useNavigate();

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (destinationQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(destinationQuery.trim())}`);
    } else if (onExploreClick) {
      onExploreClick();
    }
  };

  const trendingDestinations = [
    { label: '🏖️ Goa Beachfront', query: 'Goa' },
    { label: '🏔️ Manali Hills', query: 'Manali' },
    { label: '🏰 Udaipur Palaces', query: 'Udaipur' },
    { label: '🌴 Kerala Backwaters', query: 'Kerala' },
    { label: '⛰️ Swiss Chalets', query: 'Switzerland' },
  ];

  return (
    <div className="relative w-full rounded-3xl overflow-hidden mb-8 shadow-xl bg-vistaro-secondary border border-vistaro-border transition-colors duration-200">

      {/* Background Decorative Gradient Glows */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-vistaro-accent/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -ml-20 -mb-20 w-80 h-80 bg-vistaro-rating/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 px-6 sm:px-10 lg:px-14 py-10 sm:py-14 lg:py-16 max-w-5xl">

        {/* Top Feature Pill */}
        <div className="inline-flex items-center gap-2 bg-vistaro-surface/80 hover:bg-vistaro-surface border border-vistaro-border px-3.5 py-1.5 rounded-full text-caption backdrop-blur-md transition-all mb-4 text-vistaro-primary">
          <Sparkles className="w-3.5 h-3.5 text-vistaro-accent" />
          <span>Discover 1,000+ Verified Stays Worldwide</span>
          <span className="bg-vistaro-accent text-white text-caption px-2 py-0.5 rounded-full">
            Public Access
          </span>
        </div>

        {/* Main Hero Headline */}
        <h1 className="text-display-hero text-vistaro-primary mb-4">
          Find Your Next <span className="text-transparent bg-clip-text bg-gradient-to-r from-vistaro-accent to-vistaro-accent-hover">Extraordinary Stay</span>
        </h1>

        {/* Subtext */}
        <p className="text-body text-vistaro-secondary max-w-2xl mb-8">
          Browse luxury beachfront villas, cozy mountain cabins, and historic retreats freely. Search destinations, check live pricing, and explore traveler reviews without needing an account.
        </p>

        {/* Hero Interactive Search Form */}
        <form
          onSubmit={handleHeroSearch}
          className="bg-vistaro-surface/95 backdrop-blur-md p-2 rounded-2xl sm:rounded-full shadow-2xl border border-vistaro-border flex flex-col sm:flex-row items-center gap-2 max-w-2xl"
        >
          <div className="flex items-center gap-3 px-4 py-2 w-full sm:flex-1">
            <MapPin className="w-5 h-5 text-vistaro-accent shrink-0" />
            <input
              type="text"
              placeholder="Where are you travelling? (e.g. Goa, Paris, Alps...)"
              value={destinationQuery}
              onChange={(e) => setDestinationQuery(e.target.value)}
              className="w-full bg-transparent border-none text-body-sm text-vistaro-primary placeholder-vistaro-muted focus:outline-hidden font-normal"
            />
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto bg-vistaro-accent hover:bg-vistaro-accent-hover text-white text-cta py-3.5 px-7 rounded-xl sm:rounded-full transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 shrink-0 cursor-pointer group"
          >
            <span>Explore Stays</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </form>

        {/* Trending Quick Suggestions */}
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="text-label text-vistaro-muted flex items-center gap-1 mr-1">
            <Compass className="w-3.5 h-3.5 text-vistaro-accent" /> Popular:
          </span>
          {trendingDestinations.map((dest, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => navigate(`/search?q=${encodeURIComponent(dest.query)}`)}
              className="text-caption bg-vistaro-surface hover:bg-vistaro-secondary border border-vistaro-border rounded-full px-3 py-1 text-vistaro-primary transition-all cursor-pointer"
            >
              {dest.label}
            </button>
          ))}
        </div>

        {/* Feature Badges Footer */}
        <div className="mt-8 pt-6 border-t border-vistaro-border grid grid-cols-2 sm:grid-cols-4 gap-4 text-vistaro-secondary text-body-sm">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-vistaro-accent" />
            <span className="text-vistaro-primary font-medium">100% Free Browsing</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-vistaro-success" />
            <span className="text-vistaro-primary font-medium">Verified Properties</span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-vistaro-rating fill-vistaro-rating" />
            <span className="text-vistaro-primary font-medium">Real Guest Reviews</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-vistaro-accent" />
            <span className="text-vistaro-primary font-medium">Instant Confirmation</span>
          </div>
        </div>

      </div>

    </div>
  );
}
