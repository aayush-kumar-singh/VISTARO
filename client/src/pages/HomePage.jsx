import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { listingsApi } from '../api/listingsApi.js';
import { destinationsApi } from '../api/destinationsApi.js';
import { tourPackagesApi } from '../api/tourPackagesApi.js';
import { experiencesApi } from '../api/experiencesApi.js';
import ListingCard from '../components/listings/ListingCard.jsx';
import DestinationCard from '../components/destinations/DestinationCard.jsx';
import TourPackageCard from '../components/packages/TourPackageCard.jsx';
import ExperienceCard from '../components/experiences/ExperienceCard.jsx';
import CategoryBar from '../components/listings/CategoryBar.jsx';
import FilterModal from '../components/listings/FilterModal.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Compass,
  Star,
  Flame,
  MapPin,
  Sparkles,
  ArrowRight,
  Home as HomeIcon,
} from 'lucide-react';

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalListings: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterModalOpen, setFilterModalOpen] = useState(false);

  // Curation state
  const [featuredStays, setFeaturedStays] = useState([]);
  const [featuredDestinations, setFeaturedDestinations] = useState([]);
  const [featuredPackages, setFeaturedPackages] = useState([]);
  const [featuredExperiences, setFeaturedExperiences] = useState([]);
  const [trendingItems, setTrendingItems] = useState({
    stays: [],
    destinations: [],
    packages: [],
    experiences: [],
  });
  const [trendingTab, setTrendingTab] = useState('all'); // 'all' | 'stays' | 'tours' | 'experiences' | 'destinations'

  const selectedCategory = searchParams.get('category') || 'All';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const sortOption = searchParams.get('sort') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const isFiltered =
    (selectedCategory && selectedCategory !== 'All') ||
    Boolean(minPrice) ||
    Boolean(maxPrice) ||
    Boolean(sortOption) ||
    currentPage > 1;

  const activeFilterCount = (minPrice ? 1 : 0) + (maxPrice ? 1 : 0);

  // Fetch Main Paginated Listings
  useEffect(() => {
    async function fetchListings() {
      try {
        setLoading(true);
        setError(null);

        const params = {
          page: currentPage,
          limit: 12,
        };

        if (selectedCategory && selectedCategory !== 'All') {
          params.category = selectedCategory;
        }
        if (minPrice) params.minPrice = minPrice;
        if (maxPrice) params.maxPrice = maxPrice;
        if (sortOption) params.sort = sortOption;

        const data = await listingsApi.getListings(params);
        setListings(data.listings || []);
        setRecentlyViewed((data.recentlyViewed || []).slice(0, 6));
        if (data.pagination) {
          setPagination(data.pagination);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchListings();
  }, [selectedCategory, minPrice, maxPrice, sortOption, currentPage]);

  // Fetch Curated Content (Featured & Trending)
  useEffect(() => {
    async function fetchCuration() {
      try {
        const [
          featStaysRes,
          featDestRes,
          featPkgRes,
          featExpRes,
          trendStaysRes,
          trendDestRes,
          trendPkgRes,
          trendExpRes,
        ] = await Promise.allSettled([
          listingsApi.getListings({ featured: true, limit: 6 }),
          destinationsApi.getDestinations({ featured: true, limit: 6 }),
          tourPackagesApi.getTourPackages({ featured: true, limit: 6 }),
          experiencesApi.getExperiences({ featured: true, limit: 6 }),
          listingsApi.getListings({ trending: true, limit: 4 }),
          destinationsApi.getDestinations({ trending: true, limit: 4 }),
          tourPackagesApi.getTourPackages({ trending: true, limit: 4 }),
          experiencesApi.getExperiences({ trending: true, limit: 4 }),
        ]);

        if (featStaysRes.status === 'fulfilled') {
          setFeaturedStays(featStaysRes.value.listings || featStaysRes.value || []);
        }
        if (featDestRes.status === 'fulfilled') {
          setFeaturedDestinations(featDestRes.value.destinations || featDestRes.value || []);
        }
        if (featPkgRes.status === 'fulfilled') {
          setFeaturedPackages(featPkgRes.value.tourPackages || featPkgRes.value || []);
        }
        if (featExpRes.status === 'fulfilled') {
          setFeaturedExperiences(featExpRes.value.experiences || featExpRes.value || []);
        }

        setTrendingItems({
          stays: trendStaysRes.status === 'fulfilled' ? (trendStaysRes.value.listings || trendStaysRes.value || []) : [],
          destinations: trendDestRes.status === 'fulfilled' ? (trendDestRes.value.destinations || trendDestRes.value || []) : [],
          packages: trendPkgRes.status === 'fulfilled' ? (trendPkgRes.value.tourPackages || trendPkgRes.value || []) : [],
          experiences: trendExpRes.status === 'fulfilled' ? (trendExpRes.value.experiences || trendExpRes.value || []) : [],
        });
      } catch (e) {
        console.error('Error loading curated homepage sections:', e);
      }
    }

    fetchCuration();
  }, []);

  const handleCategorySelect = (catName) => {
    const newParams = new URLSearchParams(searchParams);
    if (!catName || catName === 'All') {
      newParams.delete('category');
    } else {
      newParams.set('category', catName);
    }
    newParams.delete('page');
    setSearchParams(newParams);
  };

  const handleSortChange = (newSort) => {
    const newParams = new URLSearchParams(searchParams);
    if (newSort) {
      newParams.set('sort', newSort);
    } else {
      newParams.delete('sort');
    }
    newParams.delete('page');
    setSearchParams(newParams);
  };

  const handleApplyFilters = (filters) => {
    const newParams = new URLSearchParams(searchParams);
    if (filters.minPrice) newParams.set('minPrice', filters.minPrice);
    else newParams.delete('minPrice');

    if (filters.maxPrice) newParams.set('maxPrice', filters.maxPrice);
    else newParams.delete('maxPrice');

    newParams.delete('page');
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    if (newPage === 1) {
      newParams.delete('page');
    } else {
      newParams.set('page', newPage.toString());
    }
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalTrendingCount =
    trendingItems.stays.length +
    trendingItems.destinations.length +
    trendingItems.packages.length +
    trendingItems.experiences.length;

  return (
    <div className="w-full text-vistaro-primary transition-colors duration-200">
      {/* Category Strip & Filters */}
      <CategoryBar
        selectedCategory={selectedCategory}
        onSelectCategory={handleCategorySelect}
        onOpenFilterModal={() => setFilterModalOpen(true)}
        activeFilterCount={activeFilterCount}
        sortOption={sortOption}
        onSortChange={handleSortChange}
      />

      {/* Filter Modal */}
      <FilterModal
        isOpen={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        initialFilters={{ minPrice, maxPrice }}
        onApplyFilters={handleApplyFilters}
      />

      {/* Loading state */}
      {loading && <LoadingSpinner fullScreen text="Discovering extraordinary stays..." />}

      {/* Error state */}
      {error && !loading && (
        <div className="bg-vistaro-surface border border-vistaro-error/30 rounded-3xl p-8 text-center space-y-3 max-w-md mx-auto my-8">
          <div className="w-12 h-12 rounded-full bg-vistaro-secondary text-vistaro-error flex items-center justify-center mx-auto">
            <Compass className="w-6 h-6" />
          </div>
          <h3 className="text-display-h3 text-vistaro-primary">Unable to load stays</h3>
          <p className="text-body-sm text-vistaro-secondary max-w-sm mx-auto">{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 bg-vistaro-accent hover:bg-vistaro-accent-hover text-white text-cta py-2.5 px-6 rounded-full transition-all cursor-pointer shadow-xs"
          >
            Retry Loading
          </button>
        </div>
      )}

      {/* ============================================================ */}
      {/* 1. CURATED SECTIONS (Rendered on Home Landing View only) */}
      {/* ============================================================ */}
      {!loading && !error && !isFiltered && (
        <div className="space-y-16 mb-16">
          
          {/* A. FEATURED STAYS */}
          {featuredStays.length > 0 && (
            <section className="space-y-6 pt-2 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-3 border-b border-vistaro-border">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                      <Star className="w-4 h-4 fill-amber-500" />
                    </div>
                    <h2 className="text-display-h2 text-xl sm:text-2xl text-vistaro-primary font-bold">
                      Featured Stays & Retreats
                    </h2>
                  </div>
                  <p className="text-body-sm text-vistaro-muted">
                    Handpicked luxury villas, boutique retreats, and heritage estates.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newParams = new URLSearchParams(searchParams);
                    newParams.set('category', 'All');
                    setSearchParams(newParams);
                  }}
                  className="text-cta text-xs text-vistaro-accent hover:underline inline-flex items-center gap-1 cursor-pointer font-semibold"
                >
                  View All Stays <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                {featuredStays.slice(0, 6).map((listing) => (
                  <ListingCard key={`featured-stay-${listing._id}`} listing={listing} />
                ))}
              </div>
            </section>
          )}

          {/* B. TRENDING NOW SECTION */}
          {totalTrendingCount > 0 && (
            <section className="space-y-6 bg-vistaro-surface/50 border border-vistaro-border p-6 sm:p-8 rounded-3xl animate-fade-in shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-3 border-b border-vistaro-border">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                      <Flame className="w-4 h-4 fill-rose-500" />
                    </div>
                    <h2 className="text-display-h2 text-xl sm:text-2xl text-vistaro-primary font-bold">
                      Trending Now
                    </h2>
                  </div>
                  <p className="text-body-sm text-vistaro-muted">
                    Most popular destinations, stays, guided expeditions, and immersions buzzing right now.
                  </p>
                </div>

                {/* Trending Content Type Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-vistaro-secondary/70 rounded-full border border-vistaro-border text-xs">
                  {[
                    { id: 'all', label: 'All Trending' },
                    ...(trendingItems.stays.length > 0 ? [{ id: 'stays', label: `Stays (${trendingItems.stays.length})` }] : []),
                    ...(trendingItems.destinations.length > 0 ? [{ id: 'destinations', label: `Destinations (${trendingItems.destinations.length})` }] : []),
                    ...(trendingItems.packages.length > 0 ? [{ id: 'packages', label: `Tours (${trendingItems.packages.length})` }] : []),
                    ...(trendingItems.experiences.length > 0 ? [{ id: 'experiences', label: `Experiences (${trendingItems.experiences.length})` }] : []),
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setTrendingTab(tab.id)}
                      className={`px-3.5 py-1.5 rounded-full font-medium transition-all cursor-pointer whitespace-nowrap ${
                        trendingTab === tab.id
                          ? 'bg-vistaro-accent text-white shadow-xs'
                          : 'text-vistaro-secondary hover:text-vistaro-primary'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Trending Grid Container */}
              <div className="space-y-6">
                {(trendingTab === 'all' || trendingTab === 'stays') && trendingItems.stays.length > 0 && (
                  <div className="space-y-3">
                    {trendingTab === 'all' && (
                      <h3 className="text-label text-vistaro-muted uppercase tracking-wider text-[11px] font-bold">
                        Trending Stays
                      </h3>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                      {trendingItems.stays.map((s) => (
                        <ListingCard key={`trend-stay-${s._id}`} listing={s} />
                      ))}
                    </div>
                  </div>
                )}

                {(trendingTab === 'all' || trendingTab === 'destinations') && trendingItems.destinations.length > 0 && (
                  <div className="space-y-3">
                    {trendingTab === 'all' && (
                      <h3 className="text-label text-vistaro-muted uppercase tracking-wider text-[11px] font-bold">
                        Trending Destinations
                      </h3>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {trendingItems.destinations.map((d) => (
                        <DestinationCard key={`trend-dest-${d._id}`} destination={d} />
                      ))}
                    </div>
                  </div>
                )}

                {(trendingTab === 'all' || trendingTab === 'packages') && trendingItems.packages.length > 0 && (
                  <div className="space-y-3">
                    {trendingTab === 'all' && (
                      <h3 className="text-label text-vistaro-muted uppercase tracking-wider text-[11px] font-bold">
                        Trending Tour Packages
                      </h3>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {trendingItems.packages.map((p) => (
                        <TourPackageCard key={`trend-pkg-${p._id}`} pkg={p} />
                      ))}
                    </div>
                  </div>
                )}

                {(trendingTab === 'all' || trendingTab === 'experiences') && trendingItems.experiences.length > 0 && (
                  <div className="space-y-3">
                    {trendingTab === 'all' && (
                      <h3 className="text-label text-vistaro-muted uppercase tracking-wider text-[11px] font-bold">
                        Trending Experiences
                      </h3>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {trendingItems.experiences.map((e) => (
                        <ExperienceCard key={`trend-exp-${e._id}`} exp={e} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* C. FEATURED DESTINATIONS */}
          {featuredDestinations.length > 0 && (
            <section className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-3 border-b border-vistaro-border">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <h2 className="text-display-h2 text-xl sm:text-2xl text-vistaro-primary font-bold">
                      Featured Travel Destinations
                    </h2>
                  </div>
                  <p className="text-body-sm text-vistaro-muted">
                    Iconic gateway regions curated with verified stays, transfers, and host experiences.
                  </p>
                </div>
                <Link
                  to="/destinations"
                  className="text-cta text-xs text-vistaro-accent hover:underline inline-flex items-center gap-1 font-semibold"
                >
                  All Destinations <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredDestinations.slice(0, 6).map((dest) => (
                  <DestinationCard key={`featured-dest-${dest._id}`} destination={dest} />
                ))}
              </div>
            </section>
          )}

          {/* D. FEATURED TOUR PACKAGES */}
          {featuredPackages.length > 0 && (
            <section className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-3 border-b border-vistaro-border">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                      <Compass className="w-4 h-4" />
                    </div>
                    <h2 className="text-display-h2 text-xl sm:text-2xl text-vistaro-primary font-bold">
                      Featured Guided Expeditions
                    </h2>
                  </div>
                  <p className="text-body-sm text-vistaro-muted">
                    Multi-day itineraries curated with certified guides and seamless hospitality.
                  </p>
                </div>
                <Link
                  to="/tours"
                  className="text-cta text-xs text-vistaro-accent hover:underline inline-flex items-center gap-1 font-semibold"
                >
                  All Tour Packages <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {featuredPackages.slice(0, 4).map((pkg) => (
                  <TourPackageCard key={`featured-pkg-${pkg._id}`} pkg={pkg} />
                ))}
              </div>
            </section>
          )}

          {/* E. FEATURED HOST EXPERIENCES */}
          {featuredExperiences.length > 0 && (
            <section className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-3 border-b border-vistaro-border">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <h2 className="text-display-h2 text-xl sm:text-2xl text-vistaro-primary font-bold">
                      Featured Host Experiences
                    </h2>
                  </div>
                  <p className="text-body-sm text-vistaro-muted">
                    Immersive local culinary sessions, craft workshops, and guided nature trails.
                  </p>
                </div>
                <Link
                  to="/experiences"
                  className="text-cta text-xs text-vistaro-accent hover:underline inline-flex items-center gap-1 font-semibold"
                >
                  All Experiences <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {featuredExperiences.slice(0, 4).map((exp) => (
                  <ExperienceCard key={`featured-exp-${exp._id}`} exp={exp} />
                ))}
              </div>
            </section>
          )}

        </div>
      )}

      {/* ============================================================ */}
      {/* 2. MAIN CATALOG / SEARCH RESULTS GRID */}
      {/* ============================================================ */}
      {!loading && !error && (
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-vistaro-border">
            <div>
              <h2 className="text-display-h2 text-xl sm:text-2xl text-vistaro-primary font-bold">
                {isFiltered ? 'Matching Stays' : 'Explore All Stays & Accommodations'}
              </h2>
              <p className="text-body-sm text-vistaro-muted">
                {isFiltered
                  ? `Showing ${pagination.totalListings || listings.length} stays matching your criteria.`
                  : 'Browse our complete catalog of verified luxury villas and boutique properties.'}
              </p>
            </div>
            {isFiltered && (
              <button
                type="button"
                onClick={() => setSearchParams({})}
                className="text-cta text-xs text-vistaro-accent hover:underline font-semibold cursor-pointer"
              >
                Clear all filters
              </button>
            )}
          </div>

          {/* Empty State */}
          {listings.length === 0 && (
            <div className="text-center py-16 px-4 bg-vistaro-surface rounded-3xl border border-vistaro-border">
              <Compass className="w-12 h-12 text-vistaro-muted mx-auto mb-3" />
              <h3 className="text-display-h3 text-vistaro-primary">No properties found</h3>
              <p className="text-body text-vistaro-muted max-w-md mx-auto mt-1 mb-4">
                We couldn't find any stays matching your current filters. Try changing or clearing filters.
              </p>
              <button
                onClick={() => setSearchParams({})}
                className="bg-vistaro-accent hover:bg-vistaro-accent-hover text-white text-cta py-2.5 px-6 rounded-full transition-colors cursor-pointer shadow-xs"
              >
                Clear all filters
              </button>
            </div>
          )}

          {/* Listings Grid */}
          {listings.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
                {listings.map((listing) => (
                  <ListingCard key={listing._id} listing={listing} />
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    disabled={pagination.currentPage <= 1}
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    className="p-2 rounded-full border border-vistaro-border hover:bg-vistaro-secondary disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="w-4 h-4 text-vistaro-primary" />
                  </button>

                  <div className="flex items-center gap-1.5 px-2">
                    {Array.from({ length: pagination.totalPages }).map((_, idx) => {
                      const pageNum = idx + 1;
                      const isCurrent = pageNum === pagination.currentPage;

                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-8 h-8 rounded-full text-cta transition-colors cursor-pointer ${
                            isCurrent
                              ? 'bg-vistaro-accent text-white'
                              : 'text-vistaro-primary hover:bg-vistaro-secondary'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    disabled={pagination.currentPage >= pagination.totalPages}
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    className="p-2 rounded-full border border-vistaro-border hover:bg-vistaro-secondary disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    aria-label="Next page"
                  >
                    <ChevronRight className="w-4 h-4 text-vistaro-primary" />
                  </button>
                </div>
              )}

              {/* Recently Viewed Stays Section */}
              {recentlyViewed.length > 0 && (
                <div className="mt-16 pt-10 border-t border-vistaro-border">
                  <div className="flex items-center gap-2 mb-6">
                    <Clock className="w-5 h-5 text-vistaro-accent" />
                    <h3 className="text-display-h2 text-vistaro-primary">Recently Viewed Stays</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                    {recentlyViewed.map((listing) => (
                      <ListingCard key={`recent-${listing._id}`} listing={listing} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
