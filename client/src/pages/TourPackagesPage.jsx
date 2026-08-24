import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { tourPackagesApi } from '../api/tourPackagesApi.js';
import { destinationsApi } from '../api/destinationsApi.js';
import TourPackageCard from '../components/packages/TourPackageCard.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import {
  Compass,
  MapPin,
  RefreshCw,
  Filter,
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
    <div className="w-full space-y-6 pb-16 text-vistaro-primary transition-colors duration-200">

      {/* 1. Clean Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-vistaro-border">
        <div>
          <h1 className="text-display-hero text-vistaro-primary">
            Curated Tour Packages
          </h1>
          <p className="text-body text-vistaro-muted mt-1">
            Expertly planned multi-day regional expeditions with luxury stays, verified local guides, and scenic transfers.
          </p>
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
              className={`px-4 py-2 rounded-full text-nav-link transition-all cursor-pointer whitespace-nowrap ${
                !selectedDestSlug
                  ? 'bg-vistaro-accent text-white shadow-xs'
                  : 'bg-vistaro-surface hover:bg-vistaro-secondary text-vistaro-primary border border-vistaro-border'
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
                  className={`px-4 py-2 rounded-full text-nav-link transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-vistaro-accent text-white shadow-xs'
                      : 'bg-vistaro-surface hover:bg-vistaro-secondary text-vistaro-primary border border-vistaro-border'
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
            <Filter className="w-3.5 h-3.5 text-vistaro-muted" />
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="bg-vistaro-surface border border-vistaro-border rounded-full px-3.5 py-1.5 text-nav-link text-vistaro-primary focus:outline-hidden focus:border-vistaro-accent cursor-pointer"
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
          <div className="flex items-center justify-between bg-vistaro-secondary border border-vistaro-border rounded-2xl px-4 py-2 text-body-sm text-vistaro-secondary">
            <span>
              Showing packages curated specifically for{' '}
              <b className="text-vistaro-primary capitalize">
                {destinations.find((d) => d.slug === selectedDestSlug)?.name || selectedDestSlug}
              </b>
            </span>
            <button
              type="button"
              onClick={() => handleDestinationSelect('')}
              className="text-vistaro-accent font-semibold text-cta hover:underline cursor-pointer"
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
        <div className="bg-vistaro-surface border border-vistaro-error/30 rounded-3xl p-8 sm:p-12 text-center space-y-4 max-w-lg mx-auto my-12 shadow-xs">
          <div className="w-14 h-14 rounded-full bg-vistaro-secondary text-vistaro-error flex items-center justify-center mx-auto shadow-inner">
            <Compass className="w-7 h-7" />
          </div>
          <h3 className="text-display-h3 text-vistaro-primary">Unable to Load Tour Packages</h3>
          <p className="text-body-sm text-vistaro-secondary leading-relaxed">{error}</p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={fetchPackages}
              className="inline-flex items-center gap-2 bg-vistaro-accent hover:bg-vistaro-accent-hover text-white text-cta py-2.5 px-6 rounded-full transition-all cursor-pointer shadow-xs"
            >
              <RefreshCw className="w-4 h-4" /> Try Again
            </button>
            <Link
              to="/destinations"
              className="bg-vistaro-secondary border border-vistaro-border hover:bg-vistaro-main text-vistaro-primary text-cta py-2.5 px-5 rounded-full transition-colors"
            >
              Browse Destinations
            </Link>
          </div>
        </div>
      )}

      {/* 5. Empty State */}
      {!loading && !error && filteredPackages.length === 0 && (
        <div className="text-center py-16 px-6 bg-vistaro-surface rounded-3xl border border-vistaro-border max-w-xl mx-auto space-y-4">
          <div className="w-14 h-14 rounded-full bg-vistaro-secondary text-vistaro-rating flex items-center justify-center mx-auto">
            <Compass className="w-7 h-7" />
          </div>
          <h3 className="text-display-h3 text-vistaro-primary">No Tour Packages Found</h3>
          <p className="text-body text-vistaro-muted max-w-md mx-auto">
            {selectedDestSlug
              ? 'There are currently no tour packages published for this destination. Try exploring other regions or clearing the filter.'
              : 'Our travel curators are currently crafting new regional itineraries. Please check back soon!'}
          </p>
          <div className="pt-2 flex items-center justify-center gap-3">
            {selectedDestSlug && (
              <button
                type="button"
                onClick={() => handleDestinationSelect('')}
                className="bg-vistaro-accent hover:bg-vistaro-accent-hover text-white text-cta py-2.5 px-5 rounded-full transition-colors cursor-pointer shadow-xs"
              >
                View All Packages
              </button>
            )}
            <Link
              to="/destinations"
              className="bg-vistaro-accent hover:bg-vistaro-accent-hover text-white text-cta py-2.5 px-5 rounded-full transition-colors shadow-xs"
            >
              Explore Destinations
            </Link>
          </div>
        </div>
      )}

      {/* 6. Tour Packages Grid */}
      {!loading && !error && filteredPackages.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between text-body-sm text-vistaro-muted">
            <span>Showing <b className="text-vistaro-primary">{filteredPackages.length}</b> tour package{filteredPackages.length !== 1 ? 's' : ''}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPackages.map((pkg) => (
              <TourPackageCard key={pkg._id} pkg={pkg} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
