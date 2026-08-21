import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { experiencesApi } from '../api/experiencesApi.js';
import { destinationsApi } from '../api/destinationsApi.js';
import ExperienceCard from '../components/experiences/ExperienceCard.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import {
  Sparkles,
  MapPin,
  Compass,
  RefreshCw,
  Filter,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Camera,
  Heart,
  Utensils,
  Mountain,
} from 'lucide-react';

export default function ExperiencesListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedDestSlug = searchParams.get('destination') || '';
  const selectedCategory = searchParams.get('category') || 'all';

  const [experiences, setExperiences] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const categories = [
    'all',
    'Adventure',
    'Cultural',
    'Food & Drink',
    'Nature',
    'Wellness',
    'Photography',
    'Workshop',
  ];

  // Load active destinations for destination filter
  useEffect(() => {
    async function loadDestinations() {
      try {
        const data = await destinationsApi.getDestinations();
        setDestinations(data.destinations || []);
      } catch (e) {
        console.warn('Failed to load destinations for filter bar:', e);
      }
    }
    loadDestinations();
  }, []);

  // Fetch experiences based on selected destination and category
  const fetchExperiences = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {};
      if (selectedDestSlug) {
        params.destination = selectedDestSlug;
      }
      if (selectedCategory && selectedCategory !== 'all') {
        params.category = selectedCategory;
      }

      const data = await experiencesApi.getExperiences(params);
      setExperiences(data.experiences || []);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to load experiences.');
    } finally {
      setLoading(false);
    }
  }, [selectedDestSlug, selectedCategory]);

  useEffect(() => {
    fetchExperiences();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [fetchExperiences]);

  // Handle Destination Filter Click
  const handleDestinationSelect = (slug) => {
    const nextParams = new URLSearchParams(searchParams);
    if (!slug) {
      nextParams.delete('destination');
    } else {
      nextParams.set('destination', slug);
    }
    setSearchParams(nextParams);
  };

  // Handle Category Filter Click
  const handleCategorySelect = (cat) => {
    const nextParams = new URLSearchParams(searchParams);
    if (!cat || cat === 'all') {
      nextParams.delete('category');
    } else {
      nextParams.set('category', cat);
    }
    setSearchParams(nextParams);
  };

  const handleClearAllFilters = () => {
    setSearchParams({});
  };

  const hasActiveFilters = Boolean(selectedDestSlug || (selectedCategory && selectedCategory !== 'all'));

  return (
    <div className="w-full max-w-7xl mx-auto space-y-10 pb-16">
      
      {/* 1. Hero Banner */}
      <div className="relative bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 rounded-3xl p-8 sm:p-12 text-white overflow-hidden shadow-xl border border-zinc-800">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 bg-indigo-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-zinc-200">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            Curated Local Immersion
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Host-Led Handcrafted <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-amber-300">Experiences</span>
          </h1>

          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-2xl">
            Connect with passionate local guides, master artisans, and outdoor specialists for unforgettable short-format immersions, tasting trails, and cultural workshops.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-zinc-400">
            <span className="flex items-center gap-1.5 text-purple-300 font-semibold">
              <Sparkles className="w-4 h-4" /> Authentic Local Hosts
            </span>
            <span className="w-1 h-1 rounded-full bg-zinc-600" />
            <span>Small Group Sizes</span>
            <span className="w-1 h-1 rounded-full bg-zinc-600" />
            <span>Verified Quality & Safety</span>
          </div>
        </div>
      </div>

      {/* 2. Destination & Category Filter Bar */}
      <div className="space-y-4">
        
        {/* Destination Pills */}
        <div className="space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#dc3545]" />
            <span>Filter By Destination</span>
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              type="button"
              onClick={() => handleDestinationSelect('')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                !selectedDestSlug
                  ? 'bg-[#222222] text-white shadow-xs'
                  : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
              }`}
            >
              All Destinations
            </button>

            {destinations.map((d) => {
              const isSelected = selectedDestSlug === d.slug;
              return (
                <button
                  key={d._id}
                  type="button"
                  onClick={() => handleDestinationSelect(d.slug)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#dc3545] text-white shadow-xs'
                      : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
                  }`}
                >
                  <MapPin className="w-3 h-3" />
                  <span>{d.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Category Pills */}
        <div className="space-y-2 pt-2 border-t border-zinc-100">
          <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>Filter By Category</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat || (!searchParams.get('category') && cat === 'all');
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleCategorySelect(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-purple-700 text-white shadow-xs'
                      : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
                  }`}
                >
                  {cat === 'all' ? 'All Categories' : cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Filters Summary Bar */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between bg-purple-50/60 border border-purple-100 rounded-2xl px-4 py-2.5 text-xs text-purple-900">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Filtering by:</span>
              {selectedDestSlug && (
                <span className="bg-white text-zinc-800 font-bold px-2.5 py-0.5 rounded-full border border-purple-200 shadow-2xs">
                  {destinations.find((d) => d.slug === selectedDestSlug)?.name || selectedDestSlug}
                </span>
              )}
              {selectedCategory && selectedCategory !== 'all' && (
                <span className="bg-purple-600 text-white font-bold px-2.5 py-0.5 rounded-full shadow-2xs">
                  {selectedCategory}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={handleClearAllFilters}
              className="text-[#dc3545] font-bold hover:underline cursor-pointer text-xs"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* 3. Loading State */}
      {loading && (
        <LoadingSpinner fullScreen={false} text="Curating host-led experiences..." />
      )}

      {/* 4. Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-3xl p-8 sm:p-12 text-center space-y-4 max-w-lg mx-auto my-12 shadow-xs">
          <div className="w-14 h-14 rounded-full bg-red-100 text-[#dc3545] flex items-center justify-center mx-auto shadow-inner">
            <Sparkles className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-lg text-zinc-900">Unable to Load Experiences</h3>
          <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">{error}</p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={fetchExperiences}
              className="inline-flex items-center gap-2 bg-purple-700 hover:bg-purple-800 text-white text-xs sm:text-sm font-bold py-2.5 px-6 rounded-full transition-all cursor-pointer shadow-xs"
            >
              <RefreshCw className="w-4 h-4" /> Try Again
            </button>
            <Link
              to="/destinations"
              className="bg-white border border-zinc-300 hover:bg-zinc-100 text-zinc-700 text-xs sm:text-sm font-semibold py-2.5 px-5 rounded-full transition-colors"
            >
              Browse Destinations
            </Link>
          </div>
        </div>
      )}

      {/* 5. Empty State */}
      {!loading && !error && experiences.length === 0 && (
        <div className="text-center py-16 px-6 bg-zinc-50 rounded-3xl border border-zinc-200 max-w-xl mx-auto space-y-4">
          <div className="w-14 h-14 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
            <Sparkles className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-xl text-zinc-800">No Experiences Found</h3>
          <p className="text-xs sm:text-sm text-zinc-500 max-w-md mx-auto">
            {hasActiveFilters
              ? 'No experiences matched your selected destination and category filters. Try clearing your filters to explore all options.'
              : 'Our experience hosts are currently publishing new activities. Please check back soon!'}
          </p>
          <div className="pt-2 flex items-center justify-center gap-3">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearAllFilters}
                className="bg-[#222222] hover:bg-black text-white text-xs font-bold py-2.5 px-5 rounded-full transition-colors cursor-pointer"
              >
                View All Experiences
              </button>
            )}
            <Link
              to="/destinations"
              className="bg-[#dc3545] hover:bg-[#b02a37] text-white text-xs font-bold py-2.5 px-5 rounded-full transition-colors"
            >
              Explore Destinations
            </Link>
          </div>
        </div>
      )}

      {/* 6. Experiences Grid */}
      {!loading && !error && experiences.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {experiences.map((exp) => (
            <ExperienceCard key={exp._id} exp={exp} />
          ))}
        </div>
      )}

      {/* 7. Bottom Promotional Banner */}
      {!loading && !error && (
        <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 text-white rounded-3xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md border border-purple-800">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Looking for Multi-Day Tour Itineraries?
            </h3>
            <p className="text-xs sm:text-sm text-purple-200 max-w-xl">
              Discover comprehensive regional packages with luxury accommodations, private transfers, and end-to-end trip curation.
            </p>
          </div>

          <Link
            to="/tours"
            className="shrink-0 bg-white hover:bg-zinc-100 text-zinc-900 text-xs sm:text-sm font-extrabold py-3 px-6 rounded-full transition-all shadow-md flex items-center gap-2"
          >
            <Compass className="w-4 h-4 text-amber-600" />
            <span>Explore Tour Packages</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

    </div>
  );
}
