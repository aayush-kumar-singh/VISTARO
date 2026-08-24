import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { destinationsApi } from '../api/destinationsApi.js';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import { Compass, MapPin, ArrowRight, RefreshCw, Layers } from 'lucide-react';

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
    <div className="w-full space-y-6 pb-16 text-vistaro-primary transition-colors duration-200">
      {/* 1. Clean Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-vistaro-border">
        <div>
          <h1 className="text-display-hero text-vistaro-primary">
            Curated Destinations
          </h1>
          <p className="text-body text-vistaro-muted mt-1">
            Explore {destinations.length > 0 ? destinations.length : 'hand-curated'} regions across India with verified luxury stays and authentic local experiences.
          </p>
        </div>
      </div>

      {/* 2. Loading State */}
      {loading && (
        <LoadingSpinner fullScreen={false} text="Discovering curated destinations..." />
      )}

      {/* 3. Error State */}
      {error && !loading && (
        <div className="bg-vistaro-surface border border-vistaro-error/30 rounded-3xl p-8 sm:p-12 text-center space-y-4 max-w-lg mx-auto my-12 shadow-xs">
          <div className="w-14 h-14 rounded-full bg-vistaro-secondary text-vistaro-error flex items-center justify-center mx-auto shadow-inner">
            <Compass className="w-7 h-7" />
          </div>
          <h3 className="text-display-h3 text-vistaro-primary">Unable to Load Destinations</h3>
          <p className="text-body-sm text-vistaro-secondary leading-relaxed">{error}</p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={fetchDestinations}
              className="inline-flex items-center gap-2 bg-vistaro-accent hover:bg-vistaro-accent-hover text-white text-cta py-2.5 px-6 rounded-full transition-all cursor-pointer shadow-xs"
            >
              <RefreshCw className="w-4 h-4" /> Try Again
            </button>
            <Link
              to="/"
              className="bg-vistaro-secondary border border-vistaro-border hover:bg-vistaro-main text-vistaro-primary text-cta py-2.5 px-5 rounded-full transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      )}

      {/* 4. Empty State */}
      {!loading && !error && destinations.length === 0 && (
        <div className="text-center py-16 px-6 bg-vistaro-surface rounded-3xl border border-vistaro-border max-w-xl mx-auto space-y-4">
          <div className="w-12 h-12 rounded-full bg-vistaro-secondary text-vistaro-muted flex items-center justify-center mx-auto">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-display-h3 text-vistaro-primary">No Destinations Found</h3>
          <p className="text-body text-vistaro-muted leading-relaxed">
            Our curators are currently onboarding new regions. Please check back shortly to explore our upcoming destination guides.
          </p>
          <Link
            to="/"
            className="inline-block bg-vistaro-accent hover:bg-vistaro-accent-hover text-white text-cta py-3 px-6 rounded-full transition-colors shadow-xs"
          >
            Explore All Stays
          </Link>
        </div>
      )}

      {/* 5. Destination Cards Grid */}
      {!loading && !error && destinations.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {destinations.map((dest) => {
            const heroUrl = dest.heroImage?.url || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80';
            const locationLabel = dest.state ? `${dest.state}, ${dest.country || 'India'}` : (dest.country || 'India');

            return (
              <Link
                key={dest._id || dest.slug}
                to={`/destinations/${dest.slug}`}
                className="group flex flex-col bg-vistaro-surface border border-vistaro-border rounded-3xl overflow-hidden shadow-xs hover:shadow-xl hover:border-vistaro-muted transition-all duration-300 transform hover:-translate-y-1"
              >
                {/* Image Container with Zoom Effect */}
                <div className="relative w-full aspect-4/3 overflow-hidden bg-vistaro-secondary">
                  <img
                    src={heroUrl}
                    alt={dest.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                  {/* Location Badge */}
                  <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white text-caption">
                    <MapPin className="w-3.5 h-3.5 text-vistaro-accent" />
                    {locationLabel}
                  </div>

                  {/* Identity tag top-right */}
                  {dest.identityTags && dest.identityTags.length > 0 && (
                    <div className="absolute top-4 right-4 hidden sm:inline-flex px-2.5 py-1 rounded-full bg-vistaro-surface/90 backdrop-blur-md text-vistaro-primary border border-vistaro-border text-caption shadow-xs">
                      {dest.identityTags[0]}
                    </div>
                  )}

                  {/* Name overlay on bottom of image */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <h2 className="text-card-title text-2xl text-white tracking-tight drop-shadow-md">
                      {dest.name}
                    </h2>
                  </div>
                </div>

                {/* Card Body */}
                <div className="flex-1 p-6 flex flex-col justify-between space-y-4">
                  {/* Tagline */}
                  <p className="text-body text-vistaro-secondary leading-relaxed line-clamp-2">
                    {dest.shortTagline || dest.tagline}
                  </p>

                  {/* Best For Tags */}
                  {dest.bestFor && dest.bestFor.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-label text-vistaro-muted">
                        Ideal for
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {dest.bestFor.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className="inline-block px-2.5 py-0.5 rounded-md bg-vistaro-secondary text-vistaro-secondary text-2xs font-normal border border-vistaro-border"
                          >
                            {tag}
                          </span>
                        ))}
                        {dest.bestFor.length > 3 && (
                          <span className="inline-block px-2 py-0.5 rounded-md bg-vistaro-secondary text-vistaro-muted text-2xs font-normal border border-vistaro-border">
                            +{dest.bestFor.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Card Action Link */}
                  <div className="pt-2 border-t border-vistaro-border flex items-center justify-between text-cta text-vistaro-accent group-hover:text-vistaro-accent-hover">
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
