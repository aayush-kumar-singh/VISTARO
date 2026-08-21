import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { listingsApi } from '../api/listingsApi.js';
import ListingCard from '../components/listings/ListingCard.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import { Compass, ArrowLeft } from 'lucide-react';

export default function CategoryPage() {
  const { category } = useParams();
  const decodedCategory = decodeURIComponent(category || '');

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchCategoryListings() {
      try {
        setLoading(true);
        setError(null);
        const data = await listingsApi.getListings({ category: decodedCategory, limit: 30 });
        setListings(data.listings || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchCategoryListings();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [decodedCategory]);

  return (
    <div className="w-full space-y-6 text-vistaro-primary transition-colors duration-200">
      <div className="flex items-center justify-between pb-4 border-b border-vistaro-border">
        <div>
          <h1 className="text-2xl font-bold text-vistaro-primary">
            Stays in "{decodedCategory}"
          </h1>
          <p className="text-xs text-vistaro-muted mt-1">
            {listings.length} unique {listings.length === 1 ? 'property' : 'properties'} found
          </p>
        </div>

        <Link
          to="/"
          className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full border border-vistaro-border bg-vistaro-secondary hover:bg-vistaro-main text-vistaro-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> All Categories
        </Link>
      </div>

      {loading && <LoadingSpinner fullScreen text={`Discovering ${decodedCategory} stays...`} />}

      {error && !loading && (
        <div className="bg-vistaro-surface border border-vistaro-error/30 rounded-3xl p-8 text-center space-y-3 max-w-md mx-auto my-8">
          <div className="w-12 h-12 rounded-full bg-vistaro-secondary text-vistaro-error border border-vistaro-border flex items-center justify-center mx-auto">
            <Compass className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-vistaro-primary">Failed to Load Category</h3>
          <p className="text-xs text-vistaro-secondary max-w-sm mx-auto">{error}</p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="bg-vistaro-accent hover:bg-vistaro-accent-hover text-white text-xs font-bold py-2.5 px-6 rounded-full transition-all cursor-pointer shadow-xs"
            >
              Retry
            </button>
            <Link
              to="/"
              className="bg-vistaro-secondary border border-vistaro-border hover:bg-vistaro-main text-vistaro-primary text-xs font-bold py-2.5 px-5 rounded-full transition-colors"
            >
              All Categories
            </Link>
          </div>
        </div>
      )}

      {!loading && !error && listings.length === 0 && (
        <div className="text-center py-16 px-4 bg-vistaro-surface rounded-3xl border border-vistaro-border">
          <Compass className="w-12 h-12 text-vistaro-muted mx-auto mb-3" />
          <h3 className="font-bold text-lg text-vistaro-primary">No stays in "{decodedCategory}"</h3>
          <p className="text-sm text-vistaro-muted max-w-md mx-auto mt-1 mb-4">
            Browse all our featured homes across other destinations and categories.
          </p>
          <Link
            to="/"
            className="inline-block bg-vistaro-accent hover:bg-vistaro-accent-hover text-white text-xs font-bold py-2.5 px-6 rounded-full transition-colors"
          >
            Explore All Stays
          </Link>
        </div>
      )}

      {!loading && !error && listings.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
          {listings.map((listing) => (
            <ListingCard key={listing._id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
