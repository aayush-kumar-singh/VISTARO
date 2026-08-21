import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { listingsApi } from '../api/listingsApi.js';
import ListingCard from '../components/listings/ListingCard.jsx';
import CategoryBar from '../components/listings/CategoryBar.jsx';
import FilterModal from '../components/listings/FilterModal.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import { Clock, ChevronLeft, ChevronRight, Compass } from 'lucide-react';

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalListings: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterModalOpen, setFilterModalOpen] = useState(false);

  const selectedCategory = searchParams.get('category') || 'All';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const sortOption = searchParams.get('sort') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const activeFilterCount = (minPrice ? 1 : 0) + (maxPrice ? 1 : 0);

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
        setRecentlyViewed((data.recentlyViewed || []).slice(0, 5));
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
          <h3 className="font-bold text-base text-vistaro-primary">Unable to load stays</h3>
          <p className="text-xs text-vistaro-secondary max-w-sm mx-auto">{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 bg-vistaro-accent hover:bg-vistaro-accent-hover text-white text-xs font-bold py-2.5 px-6 rounded-full transition-all cursor-pointer shadow-xs"
          >
            Retry Loading
          </button>
        </div>
      )}

      {/* Listings Grid */}
      {!loading && !error && listings.length === 0 && (
        <div className="text-center py-16 px-4 bg-vistaro-surface rounded-3xl border border-vistaro-border">
          <Compass className="w-12 h-12 text-vistaro-muted mx-auto mb-3" />
          <h3 className="font-bold text-lg text-vistaro-primary">No properties found</h3>
          <p className="text-sm text-vistaro-muted max-w-md mx-auto mt-1 mb-4">
            We couldn't find any stays matching your current filters. Try changing or clearing filters.
          </p>
          <button
            onClick={() => setSearchParams({})}
            className="bg-vistaro-accent hover:bg-vistaro-accent-hover text-white text-xs font-bold py-2.5 px-6 rounded-full transition-colors cursor-pointer shadow-xs"
          >
            Clear all filters
          </button>
        </div>
      )}

      {!loading && !error && listings.length > 0 && (
        <>
          {/* Responsive Grid: 1 col mobile, 2 col sm, 3 col md, 4 col lg, 5 col xl, 6 col 2xl */}
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
                      className={`w-8 h-8 rounded-full text-xs font-bold transition-colors cursor-pointer ${
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
                <h3 className="font-bold text-lg text-vistaro-primary">Recently Viewed Stays</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {recentlyViewed.map((listing) => (
                  <ListingCard key={`recent-${listing._id}`} listing={listing} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
