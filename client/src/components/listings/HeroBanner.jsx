import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight,
  Compass,
  Star,
  Globe,
  Flame,
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
    <div className="relative w-full rounded-3xl overflow-hidden mb-8 shadow-xl text-white bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border border-zinc-800">
      
      {/* Background Decorative Gradient Glows */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -ml-20 -mb-20 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 px-6 sm:px-10 lg:px-14 py-10 sm:py-14 lg:py-16 max-w-5xl">
        
        {/* Top Feature Pill */}
        <div className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 px-3.5 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md transition-all mb-4">
          <Sparkles className="w-3.5 h-3.5 text-[#dc3545]" />
          <span>Discover 1,000+ Verified Stays Worldwide</span>
          <span className="bg-[#dc3545] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            Public Access
          </span>
        </div>

        {/* Main Hero Headline */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight sm:leading-tight mb-4">
          Find Your Next <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#dc3545] to-rose-400">Extraordinary Stay</span>
        </h1>

        {/* Subtext */}
        <p className="text-xs sm:text-sm md:text-base text-zinc-300 max-w-2xl leading-relaxed mb-8">
          Browse luxury beachfront villas, cozy mountain cabins, and historic retreats freely. Search destinations, check live pricing, and explore traveler reviews without needing an account.
        </p>

        {/* Hero Interactive Search Form */}
        <form
          onSubmit={handleHeroSearch}
          className="bg-white/95 backdrop-blur-md p-2 rounded-2xl sm:rounded-full shadow-2xl border border-white/40 flex flex-col sm:flex-row items-center gap-2 max-w-2xl"
        >
          <div className="flex items-center gap-3 px-4 py-2 w-full sm:flex-1">
            <MapPin className="w-5 h-5 text-[#dc3545] shrink-0" />
            <input
              type="text"
              placeholder="Where are you travelling? (e.g. Goa, Paris, Alps...)"
              value={destinationQuery}
              onChange={(e) => setDestinationQuery(e.target.value)}
              className="w-full bg-transparent border-none text-xs sm:text-sm text-zinc-900 placeholder-zinc-400 focus:outline-hidden font-medium"
            />
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto bg-[#dc3545] hover:bg-[#b02a37] text-white text-xs sm:text-sm font-bold py-3.5 px-7 rounded-xl sm:rounded-full transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 shrink-0 cursor-pointer group"
          >
            <span>Explore Stays</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </form>

        {/* Trending Quick Suggestions */}
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1 mr-1">
            <Flame className="w-3.5 h-3.5 text-amber-500" /> Popular:
          </span>
          {trendingDestinations.map((dest, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => navigate(`/search?q=${encodeURIComponent(dest.query)}`)}
              className="text-[11px] font-medium bg-white/10 hover:bg-white/20 border border-white/15 rounded-full px-3 py-1 text-zinc-200 hover:text-white transition-all cursor-pointer"
            >
              {dest.label}
            </button>
          ))}
        </div>

        {/* Feature Badges Footer */}
        <div className="mt-8 pt-6 border-t border-zinc-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-zinc-400 text-xs">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#dc3545]" />
            <span className="text-zinc-300 font-medium">100% Free Browsing</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span className="text-zinc-300 font-medium">Verified Properties</span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="text-zinc-300 font-medium">Real Guest Reviews</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-blue-400" />
            <span className="text-zinc-300 font-medium">Instant Confirmation</span>
          </div>
        </div>

      </div>

    </div>
  );
}
