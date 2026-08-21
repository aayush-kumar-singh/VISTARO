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
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">
            Stays in "{decodedCategory}"
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            {listings.length} unique {listings.length === 1 ? 'property' : 'properties'} found
          </p>
        </div>

        <Link
          to="/"
          className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full border border-zinc-300 hover:bg-zinc-100 text-zinc-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> All Categories
        </Link>
      </div>

      {loading && <LoadingSpinner fullScreen text={`Discovering ${decodedCategory} stays...`} />}

      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center space-y-3 max-w-md mx-auto my-8">
          <div className="w-12 h-12 rounded-full bg-red-100 text-[#dc3545] flex items-center justify-center mx-auto">
            <Compass className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-zinc-900">Failed to Load Category</h3>
          <p className="text-xs text-zinc-600 max-w-sm mx-auto">{error}</p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="bg-[#dc3545] hover:bg-[#b02a37] text-white text-xs font-bold py-2.5 px-6 rounded-full transition-all cursor-pointer shadow-xs"
            >
              Retry
            </button>
            <Link
              to="/"
              className="bg-white border border-zinc-300 hover:bg-zinc-100 text-zinc-700 text-xs font-bold py-2.5 px-5 rounded-full transition-colors"
            >
              All Categories
            </Link>
          </div>
        </div>
      )}

      {!loading && !error && listings.length === 0 && (
        <div className="text-center py-16 px-4 bg-zinc-50 rounded-3xl border border-zinc-200">
          <Compass className="w-12 h-12 text-zinc-400 mx-auto mb-3" />
          <h3 className="font-bold text-lg text-zinc-800">No stays in "{decodedCategory}"</h3>
          <p className="text-sm text-zinc-500 max-w-md mx-auto mt-1 mb-4">
            Browse all our featured homes across other destinations and categories.
          </p>
          <Link
            to="/"
            className="inline-block bg-[#dc3545] hover:bg-[#b02a37] text-white text-xs font-bold py-2.5 px-6 rounded-full transition-colors"
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
