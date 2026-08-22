import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCurrency } from '../../context/CurrencyContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { wishlistApi } from '../../api/wishlistApi.js';
import { Heart, Star, Flame } from 'lucide-react';

export default function ListingCard({ listing, onWishlistToggle }) {
  const { user, updateUser } = useAuth();
  const { formatPrice } = useCurrency();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const isInitiallySaved = user?.wishlist?.some(
    (item) => (typeof item === 'string' ? item : item?._id) === listing._id
  );

  const [isSaved, setIsSaved] = useState(Boolean(isInitiallySaved));
  const [isAnimating, setIsAnimating] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Calculate average rating
  const reviews = listing.reviews || [];
  const validRatings = reviews
    .map((r) => (typeof r === 'object' ? r.rating : 0))
    .filter((r) => r > 0);
  const averageRating =
    validRatings.length > 0
      ? (validRatings.reduce((sum, r) => sum + r, 0) / validRatings.length).toFixed(2)
      : null;

  const isGuestFavourite = validRatings.length >= 3 && Number(averageRating) >= 4.8;
  const isNew = reviews.length === 0;

  const handleHeartClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setIsAnimating(true);
      const data = await wishlistApi.toggleWishlist(listing._id);
      setIsSaved(data.inWishlist);
      updateUser({ wishlist: data.wishlist });
      showSuccess(data.message);
      if (onWishlistToggle) onWishlistToggle(listing._id, data.inWishlist);
      setTimeout(() => setIsAnimating(false), 400);
    } catch (err) {
      showError(err.message);
      setIsAnimating(false);
    }
  };

  const primaryImage =
    listing.images?.[0]?.url ||
    listing.image?.url ||
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=60';

  return (
    <div className="group relative flex flex-col h-full bg-transparent">
      {/* 1. Image Container (1:1 aspect ratio) */}
      <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-vistaro-secondary mb-3 shadow-xs">
        <Link to={`/listings/${listing._id}`} className="block w-full h-full">
          <img
            src={imgError ? 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=60' : primaryImage}
            alt={listing.title}
            onError={() => setImgError(true)}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
          />
        </Link>

        {/* Top-Left Badge */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1 pointer-events-none">
          {listing.isTrending && (
            <div
              className="inline-flex items-center justify-center p-1.5 rounded-full bg-rose-500/95 backdrop-blur-xs text-white shadow-sm"
              title="Trending"
              aria-label="Trending"
            >
              <Flame className="w-3.5 h-3.5 fill-white" />
            </div>
          )}
          {!listing.isTrending && (
            isGuestFavourite ? (
              <div className="bg-vistaro-surface/95 backdrop-blur-xs text-vistaro-primary border border-vistaro-border text-caption px-2.5 py-1 rounded-full shadow-sm">
                Guest favourite
              </div>
            ) : isNew ? (
              <div className="bg-vistaro-accent text-white text-caption px-2 py-0.5 rounded-full shadow-sm">
                New
              </div>
            ) : null
          )}
        </div>

        {/* Top-Right Heart Button (min 40x40px touch area) */}
        <button
          type="button"
          onClick={handleHeartClick}
          className={`absolute top-2 right-2 z-10 w-10 h-10 flex items-center justify-center bg-transparent border-none cursor-pointer focus:outline-hidden ${isAnimating ? 'animate-heart-pop' : ''
            }`}
          aria-label={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <Heart
            className={`w-6 h-6 transition-colors drop-shadow-md ${isSaved
                ? 'fill-vistaro-accent text-vistaro-accent'
                : 'fill-black/30 text-white hover:text-vistaro-accent'
              }`}
          />
        </button>
      </div>

      {/* 2. Content Info */}
      <Link to={`/listings/${listing._id}`} className="flex flex-col flex-1 text-inherit no-underline">
        {/* Title + Rating Row */}
        <div className="flex items-center justify-between gap-2 w-full mb-0.5">
          <h3 className="text-card-title text-vistaro-primary truncate flex-1">
            {listing.title}
          </h3>

          <div className="flex items-center gap-1 shrink-0 text-rating text-vistaro-primary">
            <Star className="w-3.5 h-3.5 fill-vistaro-rating text-vistaro-rating" />
            <span>{averageRating ? averageRating : 'New'}</span>
          </div>
        </div>

        {/* Location Subtitle */}
        <p className="text-body-sm text-vistaro-secondary truncate mb-1">
          {listing.location}, {listing.country}
        </p>

        {/* Category tag */}
        {listing.category && (
          <p className="text-muted truncate mb-1">
            {listing.category} stay
          </p>
        )}

        {/* Price Row */}
        <p className="text-price text-lg text-vistaro-primary mt-auto pt-1 flex items-baseline gap-1">
          <span>{formatPrice(listing.price)}</span>
          <span className="font-sans font-normal text-xs text-vistaro-muted"> / night</span>
        </p>
      </Link>
    </div>
  );
}
