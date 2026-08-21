import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { tourPackagesApi } from '../api/tourPackagesApi.js';
import { destinationsApi } from '../api/destinationsApi.js';
import TourPackageCard from '../components/packages/TourPackageCard.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import {
  Compass,
  MapPin,
  Sparkles,
  RefreshCw,
  Layers,
  Filter,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

export default function TourPackagesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedDestSlug = searchParams.get('destination') || '';

  const [tourPackages, setTourPackages] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');

  // Load active destinations for the filter bar
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

  // Fetch tour packages based on selected destination
  const fetchPackages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {};
      if (selectedDestSlug) {
        params.destination = selectedDestSlug;
      }

      const data = await tourPackagesApi.getTourPackages(params);
      setTourPackages(data.tourPackages || []);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to load tour packages.');
    } finally {
      setLoading(false);
    }
  }, [selectedDestSlug]);

  useEffect(() => {
    fetchPackages();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [fetchPackages]);

  // Handle Destination Filter Click
  const handleDestinationSelect = (slug) => {
    if (!slug) {
      searchParams.delete('destination');
    } else {
      searchParams.set('destination', slug);
    }
    setSearchParams(searchParams);
  };

  // Client-side difficulty filtering
  const filteredPackages = tourPackages.filter((pkg) => {
    if (selectedDifficulty === 'all') return true;
    return pkg.difficultyLevel === selectedDifficulty;
  });

  return (
    <div className="w-full max-w-7xl mx-auto space-y-10 pb-16">
      
      {/* 1. Hero Banner */}
      <div className="relative bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 rounded-3xl p-8 sm:p-12 text-white overflow-hidden shadow-xl border border-zinc-800">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 bg-[#dc3545]/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-zinc-200">
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            Curated Regional Expeditions
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Handcrafted Multi-Day <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-rose-300 to-red-400">Tour Packages</span>
          </h1>

          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-2xl">
            Immerse yourself in expertly planned journeys featuring luxury accommodations, certified local guides, scenic transfers, and unforgettable cultural moments.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-zinc-400">
            <span className="flex items-center gap-1.5 text-amber-300 font-semibold">
              <Sparkles className="w-4 h-4" /> All-Inclusive Itineraries
            </span>
            <span className="w-1 h-1 rounded-full bg-zinc-600" />
            <span>Verified Local Guides</span>
            <span className="w-1 h-1 rounded-full bg-zinc-600" />
            <span>Flexible Dates & Group Sizes</span>
          </div>
        </div>
      </div>

      {/* 2. Destination & Difficulty Filter Bar */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Destination Pills */}
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

          {/* Difficulty Dropdown */}
          <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
            <Filter className="w-3.5 h-3.5 text-zinc-400" />
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="bg-zinc-50 border border-zinc-200 rounded-full px-3.5 py-1.5 text-xs font-bold text-zinc-700 focus:outline-hidden focus:border-[#dc3545] cursor-pointer"
            >
              <option value="all">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Moderate">Moderate</option>
              <option value="Challenging">Challenging</option>
            </select>
          </div>

        </div>

        {/* Selected Destination Indicator banner if filtered */}
        {selectedDestSlug && (
          <div className="flex items-center justify-between bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-2 text-xs text-zinc-600">
            <span>
              Showing packages curated specifically for{' '}
              <b className="text-zinc-900 capitalize">
                {destinations.find((d) => d.slug === selectedDestSlug)?.name || selectedDestSlug}
              </b>
            </span>
            <button
              type="button"
              onClick={() => handleDestinationSelect('')}
              className="text-[#dc3545] font-bold hover:underline cursor-pointer"
            >
              Clear destination filter
            </button>
          </div>
        )}
      </div>

      {/* 3. Loading State */}
      {loading && (
        <LoadingSpinner fullScreen={false} text="Curating tour packages..." />
      )}

      {/* 4. Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-3xl p-8 sm:p-12 text-center space-y-4 max-w-lg mx-auto my-12 shadow-xs">
          <div className="w-14 h-14 rounded-full bg-red-100 text-[#dc3545] flex items-center justify-center mx-auto shadow-inner">
            <Compass className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-lg text-zinc-900">Unable to Load Tour Packages</h3>
          <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">{error}</p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={fetchPackages}
              className="inline-flex items-center gap-2 bg-[#dc3545] hover:bg-[#b02a37] text-white text-xs sm:text-sm font-bold py-2.5 px-6 rounded-full transition-all cursor-pointer shadow-xs"
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
      {!loading && !error && filteredPackages.length === 0 && (
        <div className="text-center py-16 px-6 bg-zinc-50 rounded-3xl border border-zinc-200 max-w-xl mx-auto space-y-4">
          <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <Compass className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-xl text-zinc-800">No Tour Packages Found</h3>
          <p className="text-xs sm:text-sm text-zinc-500 max-w-md mx-auto">
            {selectedDestSlug
              ? 'There are currently no tour packages published for this destination. Try exploring other regions or clearing the filter.'
              : 'Our travel curators are currently crafting new regional itineraries. Please check back soon!'}
          </p>
          <div className="pt-2 flex items-center justify-center gap-3">
            {selectedDestSlug && (
              <button
                type="button"
                onClick={() => handleDestinationSelect('')}
                className="bg-[#222222] hover:bg-black text-white text-xs font-bold py-2.5 px-5 rounded-full transition-colors cursor-pointer"
              >
                View All Packages
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

      {/* 6. Tour Packages Grid (1 / 2 / 3 Column Responsive Layout) */}
      {!loading && !error && filteredPackages.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span>Showing <b className="text-zinc-900">{filteredPackages.length}</b> tour package{filteredPackages.length !== 1 ? 's' : ''}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredPackages.map((pkg) => (
              <TourPackageCard key={pkg._id} pkg={pkg} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
