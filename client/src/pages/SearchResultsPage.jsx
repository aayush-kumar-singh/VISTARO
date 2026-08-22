import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { searchApi } from '../api/searchApi.js';
import ListingCard from '../components/listings/ListingCard.jsx';
import FilterModal from '../components/listings/FilterModal.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import { Search, SlidersHorizontal, ArrowUpDown, ChevronDown, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';

export default function SearchResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [results, setResults] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalResults: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  const query = searchParams.get('q') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const guests = searchParams.get('guests') || '';
  const checkIn = searchParams.get('checkIn') || '';
  const checkOut = searchParams.get('checkOut') || '';
  const sort = searchParams.get('sort') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const amenitiesParam = searchParams.getAll('amenities');

  const activeFilterCount =
    (minPrice ? 1 : 0) +
    (maxPrice ? 1 : 0) +
    (guests ? 1 : 0) +
    (checkIn ? 1 : 0) +
    (amenitiesParam.length > 0 ? amenitiesParam.length : 0);

  useEffect(() => {
    async function performSearch() {
      try {
        setLoading(true);
        setError(null);

        const params = {
          q: query,
          page,
          limit: 12,
        };

        if (minPrice) params.minPrice = minPrice;
        if (maxPrice) params.maxPrice = maxPrice;
        if (guests) params.guests = guests;
        if (checkIn) params.checkIn = checkIn;
        if (checkOut) params.checkOut = checkOut;
        if (sort) params.sort = sort;
        if (amenitiesParam.length > 0) {
          params.amenities = JSON.stringify(amenitiesParam);
        }

        const data = await searchApi.search(params);
        setResults(data.results || []);
        if (data.pagination) {
          setPagination(data.pagination);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    performSearch();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [query, minPrice, maxPrice, guests, checkIn, checkOut, sort, page, searchParams]);

  const handleApplyFilters = (filters) => {
    const newParams = new URLSearchParams(searchParams);

    if (filters.minPrice) newParams.set('minPrice', filters.minPrice);
    else newParams.delete('minPrice');

    if (filters.maxPrice) newParams.set('maxPrice', filters.maxPrice);
    else newParams.delete('maxPrice');

    if (filters.guests) newParams.set('guests', filters.guests);
    else newParams.delete('guests');

    if (filters.checkIn) newParams.set('checkIn', filters.checkIn);
    else newParams.delete('checkIn');

    if (filters.checkOut) newParams.set('checkOut', filters.checkOut);
    else newParams.delete('checkOut');

    newParams.delete('amenities');
    if (filters.selectedAmenities && filters.selectedAmenities.length > 0) {
      filters.selectedAmenities.forEach((a) => newParams.append('amenities', a));
    }

    newParams.delete('page');
    setSearchParams(newParams);
  };

  const handleSortChange = (newSort) => {
    const newParams = new URLSearchParams(searchParams);
    if (newSort) newParams.set('sort', newSort);
    else newParams.delete('sort');
    newParams.delete('page');
    setSearchParams(newParams);
    setIsSortOpen(false);
  };

  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    if (newPage === 1) {
      newParams.delete('page');
    } else {
      newParams.set('page', newPage.toString());
    }
    setSearchParams(newParams);
  };

  return (
    <div className="w-full space-y-6 text-vistaro-primary transition-colors duration-200">

      {/* Top Header & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-vistaro-border">
        <div>
          <h1 className="text-display-hero text-vistaro-primary">
            {query ? `Search results for "${query}"` : 'All Search Results'}
          </h1>
          <p className="text-body-sm text-vistaro-muted mt-1">
            {pagination.totalResults} {pagination.totalResults === 1 ? 'stay' : 'stays'} available
          </p>
        </div>

        {/* Filter and Sort actions */}
        <div className="flex items-center gap-2">
          {/* Filters Modal Trigger */}
          <button
            type="button"
            onClick={() => setFilterModalOpen(true)}
            className="flex items-center gap-1.5 text-cta px-3.5 py-2 rounded-full border border-vistaro-border bg-vistaro-surface hover:bg-vistaro-secondary text-vistaro-primary transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 bg-vistaro-accent text-white rounded-full text-caption flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Sort Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="flex items-center gap-1.5 text-cta px-3.5 py-2 rounded-full border border-vistaro-border bg-vistaro-surface hover:bg-vistaro-secondary text-vistaro-primary transition-colors cursor-pointer"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>Sort</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {isSortOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-vistaro-surface rounded-2xl shadow-xl border border-vistaro-border py-2 z-50 animate-fade-in divide-y divide-vistaro-border">
                <button
                  type="button"
                  onClick={() => handleSortChange('')}
                  className="w-full text-left px-4 py-2 text-nav-link hover:bg-vistaro-secondary text-vistaro-primary cursor-pointer"
                >
                  Featured
                </button>
                <button
                  type="button"
                  onClick={() => handleSortChange('price_asc')}
                  className="w-full text-left px-4 py-2 text-nav-link hover:bg-vistaro-secondary text-vistaro-primary cursor-pointer"
                >
                  Price: Low to High
                </button>
                <button
                  type="button"
                  onClick={() => handleSortChange('price_desc')}
                  className="w-full text-left px-4 py-2 text-nav-link hover:bg-vistaro-secondary text-vistaro-primary cursor-pointer"
                >
                  Price: High to Low
                </button>
                <button
                  type="button"
                  onClick={() => handleSortChange('newest')}
                  className="w-full text-left px-4 py-2 text-nav-link hover:bg-vistaro-secondary text-vistaro-primary cursor-pointer"
                >
                  Newest First
                </button>
              </div>
            )}
          </div>

          <Link
            to="/"
            className="flex items-center gap-1 text-cta px-3.5 py-2 rounded-full border border-vistaro-border bg-vistaro-surface hover:bg-vistaro-secondary text-vistaro-primary transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> All Listings
          </Link>
        </div>
      </div>

      {/* Filter Modal */}
      <FilterModal
        isOpen={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        initialFilters={{
          minPrice,
          maxPrice,
          guests,
          checkIn,
          checkOut,
          selectedAmenities: amenitiesParam,
        }}
        onApplyFilters={handleApplyFilters}
      />

      {/* Loading state */}
      {loading && <LoadingSpinner fullScreen text="Searching unique properties..." />}

      {/* Error state */}
      {error && !loading && (
        <div className="bg-vistaro-surface border border-vistaro-error/30 rounded-3xl p-8 text-center space-y-3 max-w-md mx-auto my-8">
          <div className="w-12 h-12 rounded-full bg-vistaro-secondary text-vistaro-error border border-vistaro-border flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-display-h3 text-vistaro-primary">Search Request Failed</h3>
          <p className="text-body-sm text-vistaro-secondary max-w-sm mx-auto">{error}</p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="bg-vistaro-accent hover:bg-vistaro-accent-hover text-white text-cta py-2.5 px-6 rounded-full transition-all cursor-pointer shadow-xs"
            >
              Retry Search
            </button>
            <Link
              to="/"
              className="bg-vistaro-secondary border border-vistaro-border hover:bg-vistaro-main text-vistaro-primary text-cta py-2.5 px-5 rounded-full transition-colors"
            >
              View All Stays
            </Link>
          </div>
        </div>
      )}

      {/* Empty Results */}
      {!loading && !error && results.length === 0 && (
        <div className="text-center py-16 px-4 bg-vistaro-surface rounded-3xl border border-vistaro-border">
          <Search className="w-12 h-12 text-vistaro-muted mx-auto mb-3" />
          <h3 className="text-display-h3 text-vistaro-primary">No exact matches found</h3>
          <p className="text-body text-vistaro-muted max-w-md mx-auto mt-1 mb-4">
            Try adjusting your search location, price bounds, or changing dates.
          </p>
          <Link
            to="/"
            className="inline-block bg-vistaro-accent hover:bg-vistaro-accent-hover text-white text-cta py-2.5 px-6 rounded-full transition-colors"
          >
            Explore All Places
          </Link>
        </div>
      )}

      {/* Results Grid */}
      {!loading && !error && results.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
            {results.map((listing) => (
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
                className="p-2 rounded-full border border-vistaro-border hover:bg-vistaro-secondary text-vistaro-primary disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1.5 px-2">
                {Array.from({ length: pagination.totalPages }).map((_, idx) => {
                  const pageNum = idx + 1;
                  const isCurrent = pageNum === pagination.currentPage;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-8 h-8 rounded-full text-nav-link transition-colors cursor-pointer ${isCurrent ? 'bg-vistaro-accent text-white' : 'text-vistaro-secondary hover:bg-vistaro-secondary'
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
                className="p-2 rounded-full border border-vistaro-border hover:bg-vistaro-secondary text-vistaro-primary disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}

    </div>
  );
}
