import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { wishlistApi } from '../api/wishlistApi.js';
import { useAuth } from '../context/AuthContext.jsx';
import ListingCard from '../components/listings/ListingCard.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import { Heart, ArrowLeft } from 'lucide-react';

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
      <div className="max-w-md mx-auto my-16 p-8 bg-vistaro-surface border border-vistaro-border rounded-3xl text-center space-y-4 shadow-sm text-vistaro-primary">
        <Heart className="w-10 h-10 text-vistaro-accent mx-auto" />
        <h2 className="text-display-h2 text-vistaro-primary">Sign in to view your wishlist</h2>
        <p className="text-body text-vistaro-muted">You can create, view, or edit your saved wishlists once you've logged in.</p>
        <Link
          to="/login"
          className="inline-block bg-vistaro-accent hover:bg-vistaro-accent-hover text-white text-cta py-3 px-6 rounded-full transition-colors cursor-pointer"
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
    <div className="w-full space-y-6 text-vistaro-primary transition-colors duration-200">
      <div className="flex items-center justify-between pb-4 border-b border-vistaro-border">
        <div>
          <h1 className="text-display-hero text-vistaro-primary flex items-center gap-2">
            <Heart className="w-6 h-6 fill-vistaro-accent text-vistaro-accent" /> My Wishlist
          </h1>
          <p className="text-muted mt-1">
            {wishlist.length} saved {wishlist.length === 1 ? 'property' : 'properties'}
          </p>
        </div>

        <Link
          to="/"
          className="flex items-center gap-1.5 text-cta px-4 py-2 rounded-full border border-vistaro-border bg-vistaro-secondary hover:bg-vistaro-main text-vistaro-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Explore Stays
        </Link>
      </div>

      {loading && <LoadingSpinner fullScreen text="Loading saved stays..." />}

      {error && !loading && (
        <div className="bg-vistaro-surface border border-vistaro-error/30 rounded-3xl p-8 text-center space-y-3 max-w-md mx-auto my-8">
          <div className="w-12 h-12 rounded-full bg-vistaro-secondary text-vistaro-error flex items-center justify-center mx-auto border border-vistaro-border">
            <Heart className="w-6 h-6" />
          </div>
          <h3 className="text-display-h3 text-vistaro-primary">Failed to Load Wishlist</h3>
          <p className="text-body-sm text-vistaro-secondary max-w-sm mx-auto">{error}</p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="bg-vistaro-accent hover:bg-vistaro-accent-hover text-white text-cta py-2.5 px-6 rounded-full transition-all cursor-pointer shadow-xs"
            >
              Retry
            </button>
            <Link
              to="/"
              className="bg-vistaro-secondary border border-vistaro-border hover:bg-vistaro-main text-vistaro-primary text-cta py-2.5 px-5 rounded-full transition-colors"
            >
              Explore Stays
            </Link>
          </div>
        </div>
      )}

      {!loading && !error && wishlist.length === 0 && (
        <div className="text-center py-20 px-4 bg-vistaro-surface rounded-3xl border border-vistaro-border">
          <Heart className="w-12 h-12 text-vistaro-muted mx-auto mb-3" />
          <h3 className="text-display-h3 text-vistaro-primary">Your wishlist is empty</h3>
          <p className="text-body text-vistaro-muted max-w-md mx-auto mt-1 mb-6">
            As you search, tap the heart icon on any stay to save your favourite places here.
          </p>
          <Link
            to="/"
            className="inline-block bg-vistaro-accent hover:bg-vistaro-accent-hover text-white text-cta py-3 px-6 rounded-full transition-colors shadow-sm"
          >
            Start Exploring
          </Link>
        </div>
      )}

      {!loading && !error && wishlist.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
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
