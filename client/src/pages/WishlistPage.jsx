import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { wishlistApi } from '../api/wishlistApi.js';
import { useAuth } from '../context/AuthContext.jsx';
import ListingCard from '../components/listings/ListingCard.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import { Heart, Compass, ArrowLeft } from 'lucide-react';

export default function WishlistPage() {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchWishlist() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await wishlistApi.getWishlist();
        setWishlist(data.wishlist || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchWishlist();
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white border border-zinc-200 rounded-3xl text-center space-y-4 shadow-sm">
        <Heart className="w-10 h-10 text-[#dc3545] mx-auto" />
        <h2 className="text-xl font-bold text-zinc-900">Sign in to view your wishlist</h2>
        <p className="text-sm text-zinc-500">You can create, view, or edit your saved wishlists once you've logged in.</p>
        <Link
          to="/login"
          className="inline-block bg-[#dc3545] hover:bg-[#b02a37] text-white text-sm font-bold py-3 px-6 rounded-full transition-colors"
        >
          Log In
        </Link>
      </div>
    );
  }

  const handleWishlistToggle = (listingId, inWishlist) => {
    if (!inWishlist) {
      setWishlist((prev) => prev.filter((item) => item._id !== listingId));
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
            <Heart className="w-6 h-6 fill-[#dc3545] text-[#dc3545]" /> My Wishlist
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            {wishlist.length} saved {wishlist.length === 1 ? 'property' : 'properties'}
          </p>
        </div>

        <Link
          to="/"
          className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full border border-zinc-300 hover:bg-zinc-100 text-zinc-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Explore Stays
        </Link>
      </div>

      {loading && <LoadingSpinner fullScreen text="Loading saved stays..." />}

      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center text-sm text-[#dc3545]">
          {error}
        </div>
      )}

      {!loading && !error && wishlist.length === 0 && (
        <div className="text-center py-20 px-4 bg-zinc-50 rounded-3xl border border-zinc-200">
          <Heart className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
          <h3 className="font-bold text-lg text-zinc-800">Your wishlist is empty</h3>
          <p className="text-sm text-zinc-500 max-w-md mx-auto mt-1 mb-6">
            As you search, tap the heart icon on any stay to save your favourite places here.
          </p>
          <Link
            to="/"
            className="inline-block bg-[#dc3545] hover:bg-[#b02a37] text-white text-xs font-bold py-3 px-6 rounded-full transition-colors shadow-sm"
          >
            Start Exploring
          </Link>
        </div>
      )}

      {!loading && !error && wishlist.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
          {wishlist.map((listing) => (
            <ListingCard
              key={listing._id}
              listing={listing}
              onWishlistToggle={handleWishlistToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}
