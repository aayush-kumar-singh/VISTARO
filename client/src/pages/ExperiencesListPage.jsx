import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { experiencesApi } from '../api/experiencesApi.js';
import { destinationsApi } from '../api/destinationsApi.js';
import ExperienceCard from '../components/experiences/ExperienceCard.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import {
  Sparkles,
  MapPin,
  RefreshCw,
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
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-16 text-vistaro-primary transition-colors duration-200">

      {/* 1. Clean Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-vistaro-border">
        <div>
          <h1 className="text-display-hero text-vistaro-primary">
            Host-Led Experiences
          </h1>
          <p className="text-body text-vistaro-muted mt-1">
            Connect with passionate local guides, master artisans, and outdoor specialists for handcrafted immersions.
          </p>
        </div>
      </div>

      {/* 2. Destination & Category Filter Bar */}
      <div className="space-y-4">

        {/* Destination Pills */}
        <div className="space-y-2">
          <div className="text-label text-vistaro-muted flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-vistaro-accent" />
            <span>Filter By Destination</span>
          </div>

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
        </div>

        {/* Category Pills */}
        <div className="space-y-2 pt-2 border-t border-vistaro-border">
          <div className="text-label text-vistaro-muted flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-vistaro-accent" />
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
                  className={`px-3.5 py-1.5 rounded-full text-nav-link transition-all cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-vistaro-accent text-white shadow-xs'
                      : 'bg-vistaro-surface hover:bg-vistaro-secondary text-vistaro-primary border border-vistaro-border'
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
          <div className="flex items-center justify-between bg-vistaro-secondary border border-vistaro-border rounded-2xl px-4 py-2.5 text-body-sm text-vistaro-primary">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-vistaro-muted">Filtering by:</span>
              {selectedDestSlug && (
                <span className="bg-vistaro-surface text-vistaro-primary text-caption px-2.5 py-0.5 rounded-full border border-vistaro-border shadow-2xs">
                  {destinations.find((d) => d.slug === selectedDestSlug)?.name || selectedDestSlug}
                </span>
              )}
              {selectedCategory && selectedCategory !== 'all' && (
                <span className="bg-vistaro-accent text-white text-caption px-2.5 py-0.5 rounded-full shadow-2xs">
                  {selectedCategory}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={handleClearAllFilters}
              className="text-vistaro-accent font-semibold text-cta hover:underline cursor-pointer"
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
        <div className="bg-vistaro-surface border border-vistaro-error/30 rounded-3xl p-8 sm:p-12 text-center space-y-4 max-w-lg mx-auto my-12 shadow-xs">
          <div className="w-14 h-14 rounded-full bg-vistaro-secondary text-vistaro-error flex items-center justify-center mx-auto shadow-inner border border-vistaro-border">
            <Sparkles className="w-7 h-7" />
          </div>
          <h3 className="text-display-h3 text-vistaro-primary">Unable to Load Experiences</h3>
          <p className="text-body-sm text-vistaro-secondary leading-relaxed">{error}</p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={fetchExperiences}
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
      {!loading && !error && experiences.length === 0 && (
        <div className="text-center py-16 px-6 bg-vistaro-surface rounded-3xl border border-vistaro-border max-w-xl mx-auto space-y-4">
          <div className="w-14 h-14 rounded-full bg-vistaro-secondary text-vistaro-accent flex items-center justify-center mx-auto">
            <Sparkles className="w-7 h-7" />
          </div>
          <h3 className="text-display-h3 text-vistaro-primary">No Experiences Found</h3>
          <p className="text-body text-vistaro-muted max-w-md mx-auto">
            {hasActiveFilters
              ? 'No experiences matched your selected destination and category filters. Try clearing your filters to explore all options.'
              : 'Our experience hosts are currently publishing new activities. Please check back soon!'}
          </p>
          <div className="pt-2 flex items-center justify-center gap-3">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearAllFilters}
                className="bg-vistaro-accent hover:bg-vistaro-accent-hover text-white text-cta py-2.5 px-5 rounded-full transition-colors cursor-pointer shadow-xs"
              >
                View All Experiences
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

      {/* 6. Experiences Grid */}
      {!loading && !error && experiences.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {experiences.map((exp) => (
            <ExperienceCard key={exp._id} exp={exp} />
          ))}
        </div>
      )}

    </div>
  );
}
