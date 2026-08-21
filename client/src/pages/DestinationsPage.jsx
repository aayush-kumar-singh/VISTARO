import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { destinationsApi } from '../api/destinationsApi.js';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import { Compass, MapPin, Sparkles, ArrowRight, RefreshCw, Layers } from 'lucide-react';

export default function DestinationsPage() {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDestinations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await destinationsApi.getDestinations();
      setDestinations(data.destinations || []);
    } catch (err) {
      setError(err.message || 'Failed to load curated destinations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDestinations();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-10 pb-16">
      {/* 1. Header Banner */}
      <div className="relative bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 rounded-3xl p-8 sm:p-12 text-white overflow-hidden shadow-xl border border-zinc-800">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-[#dc3545]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-zinc-200">
            <Sparkles className="w-3.5 h-3.5 text-[#dc3545]" />
            Curated Escapes & Sanctuaries
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Discover India’s Most <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-rose-300 to-amber-300">Extraordinary Destinations</span>
          </h1>

          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-2xl">
            From misty Himalayan heights and high-altitude desert kingdoms to royal lake havelis and sun-kissed coastlines, explore our hand-curated universe of stay-worthy regions.
          </p>

          <div className="pt-2 flex items-center gap-4 text-xs text-zinc-400">
            <span className="flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-[#dc3545]" /> {destinations.length} Curated Regions
            </span>
            <span className="w-1 h-1 rounded-full bg-zinc-600" />
            <span>Verified Luxury Stays</span>
            <span className="w-1 h-1 rounded-full bg-zinc-600" />
            <span>100% Free Exploration</span>
          </div>
        </div>
      </div>

      {/* 2. Loading State */}
      {loading && (
        <LoadingSpinner fullScreen={false} text="Discovering curated destinations..." />
      )}

      {/* 3. Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-3xl p-8 sm:p-12 text-center space-y-4 max-w-lg mx-auto my-12 shadow-xs">
          <div className="w-14 h-14 rounded-full bg-red-100 text-[#dc3545] flex items-center justify-center mx-auto shadow-inner">
            <Compass className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-lg text-zinc-900">Unable to Load Destinations</h3>
          <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">{error}</p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={fetchDestinations}
              className="inline-flex items-center gap-2 bg-[#dc3545] hover:bg-[#b02a37] text-white text-xs sm:text-sm font-bold py-2.5 px-6 rounded-full transition-all cursor-pointer shadow-xs"
            >
              <RefreshCw className="w-4 h-4" /> Try Again
            </button>
            <Link
              to="/"
              className="bg-white border border-zinc-300 hover:bg-zinc-100 text-zinc-700 text-xs sm:text-sm font-semibold py-2.5 px-5 rounded-full transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      )}

      {/* 4. Empty State */}
      {!loading && !error && destinations.length === 0 && (
        <div className="text-center py-16 px-6 bg-zinc-50 rounded-3xl border border-zinc-200 max-w-xl mx-auto space-y-4">
          <div className="w-12 h-12 rounded-full bg-zinc-200 text-zinc-500 flex items-center justify-center mx-auto">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-xl text-zinc-800">No Destinations Found</h3>
          <p className="text-sm text-zinc-500 leading-relaxed">
            Our curators are currently onboarding new regions. Please check back shortly to explore our upcoming destination guides.
          </p>
          <Link
            to="/"
            className="inline-block bg-[#dc3545] hover:bg-[#b02a37] text-white text-xs sm:text-sm font-bold py-3 px-6 rounded-full transition-colors"
          >
            Explore All Stays
          </Link>
        </div>
      )}

      {/* 5. Destination Cards Grid (Responsive: 1 col mobile, 2 col tablet, 3 col desktop) */}
      {!loading && !error && destinations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {destinations.map((dest) => {
            const heroUrl = dest.heroImage?.url || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80';
            const locationLabel = dest.state ? `${dest.state}, ${dest.country || 'India'}` : (dest.country || 'India');

            return (
              <Link
                key={dest._id || dest.slug}
                to={`/destinations/${dest.slug}`}
                className="group flex flex-col bg-white border border-zinc-200/90 rounded-3xl overflow-hidden shadow-xs hover:shadow-xl hover:border-zinc-300 transition-all duration-300 transform hover:-translate-y-1"
              >
                {/* Image Container with Zoom Effect */}
                <div className="relative w-full aspect-[16/10] overflow-hidden bg-zinc-100">
                  <img
                    src={heroUrl}
                    alt={dest.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                  {/* Location Badge */}
                  <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white text-xs font-semibold">
                    <MapPin className="w-3.5 h-3.5 text-[#dc3545]" />
                    {locationLabel}
                  </div>

                  {/* Identity tag top-right */}
                  {dest.identityTags && dest.identityTags.length > 0 && (
                    <div className="absolute top-4 right-4 hidden sm:inline-flex px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-zinc-900 text-[11px] font-bold shadow-xs">
                      {dest.identityTags[0]}
                    </div>
                  )}

                  {/* Name overlay on bottom of image */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <h2 className="text-2xl font-bold text-white tracking-tight drop-shadow-md">
                      {dest.name}
                    </h2>
                  </div>
                </div>

                {/* Card Body */}
                <div className="flex-1 p-6 flex flex-col justify-between space-y-4">
                  {/* Tagline */}
                  <p className="text-sm text-zinc-600 leading-relaxed line-clamp-2">
                    {dest.shortTagline || dest.tagline}
                  </p>

                  {/* Best For Tags */}
                  {dest.bestFor && dest.bestFor.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                        Ideal for
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {dest.bestFor.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className="inline-block px-2.5 py-0.5 rounded-md bg-zinc-100 text-zinc-700 text-xs font-medium border border-zinc-200/60"
                          >
                            {tag}
                          </span>
                        ))}
                        {dest.bestFor.length > 3 && (
                          <span className="inline-block px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-500 text-xs font-medium">
                            +{dest.bestFor.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Card Action Link */}
                  <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-xs font-bold text-[#dc3545] group-hover:text-[#b02a37]">
                    <span>Explore Destination</span>
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
