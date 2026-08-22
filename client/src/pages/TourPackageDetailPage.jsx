import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { tourPackagesApi } from '../api/tourPackagesApi.js';
import { bookingsApi } from '../api/bookingsApi.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useCurrency } from '../context/CurrencyContext.jsx';
import ImageGallery from '../components/listings/ImageGallery.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import ReviewCard from '../components/reviews/ReviewCard.jsx';
import ReviewForm from '../components/reviews/ReviewForm.jsx';
import StarRating from '../components/common/StarRating.jsx';
import {
  Clock,
  MapPin,
  Users,
  Compass,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Sparkles,
  Calendar,
  ExternalLink,
  Plus,
  Minus,
  Check,
  Star,
} from 'lucide-react';

export default function TourPackageDetailPage() {
  const { slug } = useParams();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();
  const location = useLocation();

  const [tourPackage, setTourPackage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Booking Widget State
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const [departureDate, setDepartureDate] = useState(tomorrowStr);
  const [travelers, setTravelers] = useState(2);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);

  const handleReviewAdded = (newReview) => {
    setTourPackage((prev) => ({
      ...prev,
      reviews: [newReview, ...(prev.reviews || [])],
    }));
  };

  const handleReviewDeleted = (reviewId) => {
    setTourPackage((prev) => ({
      ...prev,
      reviews: (prev.reviews || []).filter((r) => r._id !== reviewId),
    }));
  };

  const handleReplyUpdated = (reviewId, reply) => {
    setTourPackage((prev) => ({
      ...prev,
      reviews: (prev.reviews || []).map((r) =>
        r._id === reviewId ? { ...r, ownerReply: reply } : r
      ),
    }));
  };

  useEffect(() => {
    async function fetchPackageDetail() {
      try {
        setLoading(true);
        setError(null);

        const data = await tourPackagesApi.getTourPackageBySlug(slug);
        if (!data || !data.tourPackage) {
          setError('Tour package not found.');
          return;
        }

        setTourPackage(data.tourPackage);
      } catch (err) {
        setError(err.response?.data?.error || err.message || 'Failed to load tour package details.');
      } finally {
        setLoading(false);
      }
    }

    fetchPackageDetail();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  // Loading State
  if (loading) {
    return <LoadingSpinner fullScreen={false} text="Loading expedition details..." />;
  }

  // 404 / Error State
  if (error || !tourPackage) {
    return (
      <div className="w-full max-w-2xl mx-auto py-16 px-6 text-center space-y-6 animate-fade-in text-vistaro-primary">
        <div className="w-16 h-16 rounded-full bg-vistaro-secondary text-vistaro-error flex items-center justify-center mx-auto shadow-inner border border-vistaro-border">
          <Compass className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-display-h2 text-vistaro-primary">
            Tour Package Not Found
          </h1>
          <p className="text-body-sm text-vistaro-secondary max-w-md mx-auto leading-relaxed">
            The curated itinerary you are looking for might have been moved, deactivated, or does not exist.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            to="/tours"
            className="bg-vistaro-accent hover:bg-vistaro-accent-hover text-white text-cta py-3 px-6 rounded-full transition-colors shadow-xs"
          >
            Browse All Tour Packages
          </Link>
          <Link
            to="/destinations"
            className="bg-vistaro-secondary border border-vistaro-border hover:bg-vistaro-main text-vistaro-primary text-cta py-3 px-6 rounded-full transition-colors"
          >
            Explore Destinations
          </Link>
        </div>
      </div>
    );
  }

  const destination = tourPackage.destination || {};
  const destinationName = destination.name || 'India';
  const destinationSlug = destination.slug || '';

  // Prepare images for ImageGallery
  const allImages = [];
  if (tourPackage.coverImage?.url) {
    allImages.push(tourPackage.coverImage);
  }
  if (Array.isArray(tourPackage.galleryImages)) {
    tourPackage.galleryImages.forEach((img) => {
      if (img?.url && img.url !== tourPackage.coverImage?.url) {
        allImages.push(img);
      }
    });
  }
  if (allImages.length === 0) {
    allImages.push({
      url: 'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?auto=format&fit=crop&w=1200&q=80',
    });
  }

  const days = tourPackage.duration?.days || 1;
  const nights = tourPackage.duration?.nights || 0;
  const basePrice = tourPackage.price?.basePrice ?? tourPackage.basePrice ?? 0;

  const difficultyColors = {
    Easy: 'bg-vistaro-surface text-vistaro-success border-vistaro-success/40',
    Moderate: 'bg-vistaro-surface text-vistaro-accent border-vistaro-accent/40',
    Challenging: 'bg-vistaro-surface text-vistaro-rating border-vistaro-rating/40',
  };

  const reviews = tourPackage.reviews || [];
  const validRatings = reviews
    .map((r) => Number(r.rating))
    .filter((n) => !isNaN(n) && n > 0);
  const avgRating =
    validRatings.length > 0
      ? (validRatings.reduce((a, b) => a + b, 0) / validRatings.length).toFixed(1)
      : null;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 pb-16 animate-fade-in text-vistaro-primary transition-colors duration-200">

      {/* 1. Breadcrumbs & Back Nav */}
      <div className="flex flex-wrap items-center justify-between gap-4 text-body-sm">
        <div className="flex items-center gap-2 text-vistaro-muted overflow-x-auto no-scrollbar">
          <Link to="/" className="hover:text-vistaro-primary transition-colors">Home</Link>
          <span>/</span>
          <Link to="/tours" className="hover:text-vistaro-primary transition-colors">Tour Packages</Link>
          <span>/</span>
          {destinationSlug ? (
            <Link
              to={`/destinations/${destinationSlug}`}
              className="text-vistaro-accent font-semibold hover:underline"
            >
              {destinationName}
            </Link>
          ) : (
            <span>{destinationName}</span>
          )}
          <span>/</span>
          <span className="text-vistaro-primary font-bold truncate max-w-xs">{tourPackage.title}</span>
        </div>

        <Link
          to="/tours"
          className="inline-flex items-center gap-1 text-vistaro-secondary hover:text-vistaro-primary font-semibold text-cta transition-colors shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to all tours</span>
        </Link>
      </div>

      {/* 2. Header & Title Section */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {destinationSlug ? (
            <Link
              to={`/destinations/${destinationSlug}`}
              className="inline-flex items-center gap-1 bg-vistaro-secondary text-vistaro-accent hover:bg-vistaro-surface transition-colors text-caption px-3 py-1 rounded-full border border-vistaro-border shadow-2xs"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>{destinationName}, {destination.state || destination.country || 'India'}</span>
            </Link>
          ) : (
            <span className="inline-flex items-center gap-1 bg-vistaro-secondary text-vistaro-primary text-caption px-3 py-1 rounded-full border border-vistaro-border">
              <MapPin className="w-3.5 h-3.5 text-vistaro-accent" />
              {destinationName}
            </span>
          )}

          <span
            className={`text-caption px-3 py-1 rounded-full border ${difficultyColors[tourPackage.difficultyLevel] || difficultyColors.Moderate
              }`}
          >
            {tourPackage.difficultyLevel || 'Moderate'} Intensity
          </span>

          <span className="inline-flex items-center gap-1 text-caption px-3 py-1 rounded-full bg-vistaro-secondary text-vistaro-primary border border-vistaro-border">
            <ShieldCheck className="w-3.5 h-3.5 text-vistaro-success" />
            Curated Expedition
          </span>

          {avgRating && (
            <span className="inline-flex items-center gap-1.5 text-caption px-3 py-1 rounded-full bg-vistaro-secondary text-vistaro-rating border border-vistaro-border">
              <Star className="w-3.5 h-3.5 fill-vistaro-rating text-vistaro-rating" />
              <span>{avgRating}</span>
              <span className="text-muted">({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
            </span>
          )}
        </div>

        <h1 className="text-display-hero text-vistaro-primary">
          {tourPackage.title}
        </h1>

        {tourPackage.shortDescription && (
          <p className="text-body text-vistaro-secondary max-w-3xl leading-relaxed">
            {tourPackage.shortDescription}
          </p>
        )}
      </div>

      {/* 3. Image Gallery */}
      <ImageGallery images={allImages} title={tourPackage.title} />

      {/* 4. Quick Specs Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-vistaro-surface border border-vistaro-border rounded-3xl p-5 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-vistaro-secondary text-vistaro-rating flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-label text-vistaro-muted">Duration</div>
            <div className="text-body-sm font-semibold text-vistaro-primary">
              {days} Days / {nights} Nights
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-vistaro-secondary text-vistaro-accent flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-label text-vistaro-muted">Group Size</div>
            <div className="text-body-sm font-semibold text-vistaro-primary">
              Max {tourPackage.maxGroupSize || 12} Explorers
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-vistaro-secondary text-vistaro-success flex items-center justify-center shrink-0">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="text-label text-vistaro-muted">Difficulty</div>
            <div className="text-body-sm font-semibold text-vistaro-primary">
              {tourPackage.difficultyLevel || 'Moderate'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-vistaro-secondary text-vistaro-accent flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <div className="text-label text-vistaro-muted">Region</div>
            <div className="text-body-sm font-semibold text-vistaro-primary truncate">
              {destinationName}
            </div>
          </div>
        </div>
      </div>

      {/* 5. Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">

          {/* About The Expedition */}
          <div className="space-y-4">
            <h2 className="text-display-h2 text-vistaro-primary">
              About This Expedition
            </h2>
            <div className="text-body text-vistaro-secondary leading-relaxed whitespace-pre-line space-y-3">
              {tourPackage.longDescription || tourPackage.shortDescription || 'Experience a meticulously crafted travel journey.'}
            </div>
          </div>

          {/* Inclusions & Exclusions */}
          <div className="space-y-4 pt-4 border-t border-vistaro-border">
            <h2 className="text-display-h2 text-vistaro-primary">
              What’s Included & Excluded
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-vistaro-secondary border border-vistaro-border rounded-3xl p-6">

              {/* Inclusions */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-label text-vistaro-success">
                  <CheckCircle2 className="w-4 h-4 text-vistaro-success" />
                  <span>Included in Package</span>
                </div>
                {Array.isArray(tourPackage.inclusions) && tourPackage.inclusions.length > 0 ? (
                  <ul className="space-y-2 text-body-sm text-vistaro-secondary">
                    {tourPackage.inclusions.map((inc, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-vistaro-success font-bold">✓</span>
                        <span>{inc}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-body-sm text-vistaro-muted italic">Standard inclusions apply (accommodations, transfers, guide).</p>
                )}
              </div>

              {/* Exclusions */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-label text-vistaro-error">
                  <XCircle className="w-4 h-4 text-vistaro-error" />
                  <span>Not Included</span>
                </div>
                {Array.isArray(tourPackage.exclusions) && tourPackage.exclusions.length > 0 ? (
                  <ul className="space-y-2 text-body-sm text-vistaro-secondary">
                    {tourPackage.exclusions.map((exc, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-vistaro-error font-bold">✕</span>
                        <span>{exc}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-body-sm text-vistaro-muted italic">Personal expenses, optional gratuities, and airfare.</p>
                )}
              </div>

            </div>
          </div>

          {/* Day-by-Day Itinerary Section */}
          <div className="space-y-6 pt-4 border-t border-vistaro-border">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-display-h2 text-vistaro-primary flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-vistaro-rating" />
                  <span>Day-by-Day Expedition Itinerary</span>
                </h2>
                <p className="text-muted mt-0.5">
                  Detailed timeline, daily activities, meals, and overnight stops.
                </p>
              </div>

              {Array.isArray(tourPackage.itinerary) && tourPackage.itinerary.length > 0 && (
                <span className="inline-flex items-center gap-1.5 bg-vistaro-secondary text-vistaro-rating text-caption px-3 py-1 rounded-full border border-vistaro-border self-start sm:self-auto">
                  <Sparkles className="w-3.5 h-3.5 text-vistaro-rating" />
                  {tourPackage.itinerary.length} Days Planned
                </span>
              )}
            </div>

            {/* If itinerary is empty */}
            {(!Array.isArray(tourPackage.itinerary) || tourPackage.itinerary.length === 0) ? (
              <div className="bg-vistaro-surface border border-vistaro-border rounded-3xl p-6 sm:p-8 text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-vistaro-secondary text-vistaro-rating flex items-center justify-center mx-auto shadow-inner border border-vistaro-border">
                  <Calendar className="w-6 h-6" />
                </div>
                <div className="space-y-1.5 max-w-lg mx-auto">
                  <h3 className="text-display-h3 text-vistaro-primary">
                    Day-by-Day Itinerary Being Finalized
                  </h3>
                  <p className="text-body-sm text-vistaro-secondary leading-relaxed">
                    Our tour directors are putting the finishing touches on the minute-by-minute schedule for this {days}-day expedition. All scheduled stops, meals, and luxury stays are included as standard.
                  </p>
                </div>
              </div>
            ) : (
              /* Interactive Day-by-Day Timeline */
              <div className="space-y-4">
                {tourPackage.itinerary.map((day, idx) => {
                  const dayNum = day.dayNumber || idx + 1;
                  return (
                    <div
                      key={idx}
                      className="bg-vistaro-surface rounded-3xl border border-vistaro-border hover:border-vistaro-muted p-5 sm:p-6 shadow-xs transition-all space-y-3"
                    >
                      <div className="flex items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <span className="w-9 h-9 rounded-2xl bg-vistaro-accent text-white font-semibold text-xs flex items-center justify-center shrink-0 shadow-xs">
                            {String(dayNum).padStart(2, '0')}
                          </span>
                          <div>
                            <div className="text-label text-vistaro-rating tracking-wider">
                              Day {dayNum}
                            </div>
                            <h3 className="text-card-title text-vistaro-primary">
                              {day.title}
                            </h3>
                          </div>
                        </div>

                        {Array.isArray(day.activities) && day.activities.length > 0 && (
                          <span className="bg-vistaro-secondary text-vistaro-secondary border border-vistaro-border text-caption px-2.5 py-1 rounded-full shrink-0">
                            {day.activities.length} Highlight{day.activities.length !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>

                      {/* Day Description */}
                      {day.description && (
                        <p className="text-body text-vistaro-secondary leading-relaxed pl-12">
                          {day.description}
                        </p>
                      )}

                      {/* Activities Highlights List */}
                      {Array.isArray(day.activities) && day.activities.length > 0 && (
                        <div className="pl-12 pt-1 flex flex-wrap gap-2">
                          {day.activities.map((act, aIdx) => (
                            <span
                              key={aIdx}
                              className="inline-flex items-center gap-1 bg-vistaro-secondary border border-vistaro-border text-vistaro-primary text-caption px-2.5 py-1 rounded-xl"
                            >
                              <Sparkles className="w-3 h-3 text-vistaro-rating shrink-0" />
                              <span>{act}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Regional Destination Callout */}
          {destinationSlug && (
            <div className="bg-vistaro-secondary border border-vistaro-border text-vistaro-primary rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-md">
              <div className="space-y-1.5">
                <div className="text-label text-vistaro-accent">
                  Destination Guide
                </div>
                <h3 className="text-display-h3 text-vistaro-primary">
                  Discover more of {destinationName}
                </h3>
                <p className="text-body-sm text-vistaro-secondary max-w-md">
                  Explore curated boutique stays, travel insights, local identity tags, and maps for {destinationName}.
                </p>
              </div>
              <Link
                to={`/destinations/${destinationSlug}`}
                className="inline-flex items-center gap-2 bg-vistaro-accent hover:bg-vistaro-accent-hover text-white text-cta py-3 px-6 rounded-full transition-colors shrink-0 self-start sm:self-auto cursor-pointer"
              >
                <span>View Destination</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {/* Verified Explorer Reviews Section */}
          <div className="space-y-6 pt-6 border-t border-vistaro-border">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-display-h2 text-vistaro-primary flex items-center gap-2">
                  <Star className="w-6 h-6 fill-vistaro-rating text-vistaro-rating" />
                  <span>Verified Explorer Reviews</span>
                  {reviews.length > 0 && (
                    <span className="text-sm font-normal text-vistaro-muted">
                      ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
                    </span>
                  )}
                </h2>
                <p className="text-muted mt-0.5">
                  Authentic reviews from travelers who reserved this expedition.
                </p>
              </div>

              {avgRating && (
                <div className="flex items-center gap-2 self-start sm:self-auto bg-vistaro-surface border border-vistaro-border px-4 py-2 rounded-2xl">
                  <span className="text-display-h2 text-vistaro-rating">{avgRating}</span>
                  <div>
                    <StarRating rating={Math.round(Number(avgRating))} size="sm" />
                    <div className="text-label text-vistaro-muted">Overall Rating</div>
                  </div>
                </div>
              )}
            </div>

            {/* Review Submission Form */}
            <ReviewForm
              packageId={tourPackage._id}
              onReviewAdded={handleReviewAdded}
            />

            {/* Review Cards List */}
            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((rev) => (
                  <ReviewCard
                    key={rev._id}
                    review={rev}
                    packageId={tourPackage._id}
                    creatorId={tourPackage.createdBy?._id || tourPackage.createdBy}
                    onReviewDeleted={handleReviewDeleted}
                    onReplyUpdated={handleReplyUpdated}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-vistaro-surface border border-vistaro-border rounded-3xl p-8 text-center space-y-2">
                <Star className="w-8 h-8 text-vistaro-muted mx-auto" />
                <h4 className="text-display-h3 text-vistaro-primary">No explorer reviews yet</h4>
                <p className="text-body-sm text-vistaro-muted max-w-sm mx-auto">
                  Be the first verified explorer to embark on this journey and share your insights.
                </p>
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Sticky Pricing & Booking Widget */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-vistaro-surface border border-vistaro-border rounded-3xl p-6 shadow-lg space-y-6">

            {/* Price Header */}
            <div className="space-y-1 pb-4 border-b border-vistaro-border">
              <div className="text-label text-vistaro-muted">
                Starting base price
              </div>
              <div className="text-price text-3xl text-vistaro-primary flex items-baseline gap-1">
                <span>{formatPrice(basePrice)}</span>
                <span className="font-sans font-normal text-sm text-vistaro-muted"> / person</span>
              </div>
              <div className="text-caption text-vistaro-success font-semibold flex items-center gap-1 pt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Luxury stays & permits included
              </div>
            </div>

            {/* Quick Summary Specs */}
            <div className="space-y-2.5 text-body-sm text-vistaro-secondary">
              <div className="flex items-center justify-between">
                <span className="text-muted">Duration:</span>
                <span className="font-semibold text-vistaro-primary">{days} Days / {nights} Nights</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">Difficulty:</span>
                <span className="font-semibold text-vistaro-primary">{tourPackage.difficultyLevel || 'Moderate'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">Max Capacity:</span>
                <span className="font-semibold text-vistaro-primary">{tourPackage.maxGroupSize || 12} Explorers</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">Destination:</span>
                <span className="font-semibold text-vistaro-primary">{destinationName}</span>
              </div>
            </div>

            {/* INTERACTIVE BOOKING WIDGET */}
            {bookingSuccess ? (
              <div className="bg-vistaro-secondary border border-vistaro-border rounded-2xl p-5 text-center space-y-3 animate-fade-in">
                <div className="w-12 h-12 rounded-full bg-vistaro-surface text-vistaro-success border border-vistaro-border flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-display-h3 text-vistaro-primary">
                    Expedition Confirmed!
                  </h4>
                  <p className="text-body-sm text-vistaro-secondary mt-1">
                    Your {days}-day journey to {destinationName} starting on{' '}
                    <b>{new Date(bookingSuccess.checkIn).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</b> is reserved.
                  </p>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <Link
                    to="/profile"
                    className="w-full bg-vistaro-accent hover:bg-vistaro-accent-hover text-white text-cta py-2.5 rounded-full transition-colors"
                  >
                    View in My Trips
                  </Link>
                  <button
                    type="button"
                    onClick={() => setBookingSuccess(null)}
                    className="text-body-sm text-vistaro-muted hover:underline cursor-pointer"
                  >
                    Book another date
                  </button>
                </div>
              </div>
            ) : (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!user) {
                    navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
                    return;
                  }

                  if (!departureDate) {
                    showError('Please choose a departure date.');
                    return;
                  }

                  const maxCap = tourPackage.maxGroupSize || 12;
                  if (travelers > maxCap) {
                    showError(`Maximum group size is ${maxCap} explorers.`);
                    return;
                  }

                  try {
                    setBookingLoading(true);
                    const res = await bookingsApi.createPackageBooking(tourPackage._id, {
                      startDate: departureDate,
                      travelers,
                    });

                    showSuccess(res.message || 'Expedition booked successfully!');
                    setBookingSuccess(res.booking);
                  } catch (err) {
                    showError(err.response?.data?.error || err.message || 'Failed to complete booking.');
                  } finally {
                    setBookingLoading(false);
                  }
                }}
                className="space-y-4 pt-4 border-t border-vistaro-border text-body-sm"
              >
                {/* 1. Departure Date */}
                <div className="space-y-1">
                  <label className="block font-semibold text-vistaro-primary text-label">
                    Departure Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      min={tomorrowStr}
                      value={departureDate}
                      onChange={(e) => setDepartureDate(e.target.value)}
                      className="w-full bg-vistaro-secondary border border-vistaro-border rounded-xl px-3.5 py-2.5 text-body-sm font-medium text-vistaro-primary focus:outline-hidden focus:border-vistaro-accent cursor-pointer"
                      required
                    />
                  </div>
                </div>

                {/* 2. Travelers Counter */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-label font-semibold text-vistaro-primary">
                    <span>Travelers</span>
                    <span className="text-muted capitalize">Max {tourPackage.maxGroupSize || 12}</span>
                  </div>

                  <div className="flex items-center justify-between bg-vistaro-secondary border border-vistaro-border rounded-xl p-2">
                    <button
                      type="button"
                      onClick={() => setTravelers((prev) => Math.max(1, prev - 1))}
                      disabled={travelers <= 1}
                      className="w-8 h-8 rounded-lg bg-vistaro-surface border border-vistaro-border flex items-center justify-center text-vistaro-primary hover:bg-vistaro-secondary disabled:opacity-40 cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>

                    <div className="font-semibold text-body text-vistaro-primary">
                      {travelers} Explorer{travelers !== 1 ? 's' : ''}
                    </div>

                    <button
                      type="button"
                      onClick={() => setTravelers((prev) => Math.min(tourPackage.maxGroupSize || 12, prev + 1))}
                      disabled={travelers >= (tourPackage.maxGroupSize || 12)}
                      className="w-8 h-8 rounded-lg bg-vistaro-surface border border-vistaro-border flex items-center justify-center text-vistaro-primary hover:bg-vistaro-secondary disabled:opacity-40 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* 3. Price Breakdown */}
                {(() => {
                  const subtotal = travelers * basePrice;
                  const gst = Math.round(subtotal * 0.18);
                  const total = subtotal + gst;

                  return (
                    <div className="space-y-2 pt-3 border-t border-vistaro-border text-body-sm">
                      <div className="flex items-center justify-between text-vistaro-secondary">
                        <span>
                          {formatPrice(basePrice)} &times; {travelers} traveler{travelers !== 1 ? 's' : ''}
                        </span>
                        <span className="font-medium text-vistaro-primary">{formatPrice(subtotal)}</span>
                      </div>

                      <div className="flex items-center justify-between text-vistaro-secondary">
                        <span>Applicable GST (18%)</span>
                        <span className="font-medium text-vistaro-primary">{formatPrice(gst)}</span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-vistaro-border font-semibold text-body text-vistaro-primary">
                        <span>Total (INR)</span>
                        <span className="text-price text-lg text-vistaro-accent">{formatPrice(total)}</span>
                      </div>
                    </div>
                  );
                })()}

                {/* 4. Action Button */}
                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="w-full bg-vistaro-accent hover:bg-vistaro-accent-hover text-white text-cta py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg cursor-pointer disabled:opacity-50"
                >
                  {bookingLoading ? (
                    <span>Confirming Expedition...</span>
                  ) : !user ? (
                    <span>Log In to Reserve</span>
                  ) : (
                    <span>Reserve This Expedition</span>
                  )}
                </button>
              </form>
            )}

            {/* Guarantees */}
            <div className="pt-4 border-t border-vistaro-border space-y-2 text-caption text-vistaro-muted">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-vistaro-success shrink-0" />
                <span>100% Verified Local Operators</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-vistaro-rating shrink-0" />
                <span>Best Price & Flexible Rescheduling</span>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
