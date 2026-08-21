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
  Layers,
  ArrowRight,
  Info,
  Share2,
  Heart,
  ExternalLink,
  Lock,
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
      <div className="w-full max-w-2xl mx-auto py-16 px-6 text-center space-y-6 animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-red-50 text-[#dc3545] flex items-center justify-center mx-auto shadow-inner">
          <Compass className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900">
            Tour Package Not Found
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 max-w-md mx-auto leading-relaxed">
            The curated itinerary you are looking for might have been moved, deactivated, or does not exist.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            to="/tours"
            className="bg-[#222222] hover:bg-black text-white text-xs sm:text-sm font-bold py-3 px-6 rounded-full transition-colors shadow-xs"
          >
            Browse All Tour Packages
          </Link>
          <Link
            to="/destinations"
            className="bg-white border border-zinc-300 hover:bg-zinc-100 text-zinc-700 text-xs sm:text-sm font-bold py-3 px-6 rounded-full transition-colors"
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
    Easy: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    Moderate: 'bg-blue-50 text-blue-800 border-blue-200',
    Challenging: 'bg-amber-50 text-amber-900 border-amber-200',
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
    <div className="w-full max-w-7xl mx-auto space-y-8 pb-16 animate-fade-in text-[#222222]">
      
      {/* 1. Breadcrumbs & Back Nav */}
      <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2 text-zinc-500 overflow-x-auto no-scrollbar">
          <Link to="/" className="hover:text-zinc-900 transition-colors">Home</Link>
          <span>/</span>
          <Link to="/tours" className="hover:text-zinc-900 transition-colors">Tour Packages</Link>
          <span>/</span>
          {destinationSlug ? (
            <Link
              to={`/destinations/${destinationSlug}`}
              className="text-[#dc3545] font-semibold hover:underline"
            >
              {destinationName}
            </Link>
          ) : (
            <span>{destinationName}</span>
          )}
          <span>/</span>
          <span className="text-zinc-900 font-bold truncate max-w-xs">{tourPackage.title}</span>
        </div>

        <Link
          to="/tours"
          className="inline-flex items-center gap-1 text-zinc-600 hover:text-zinc-900 font-bold transition-colors shrink-0"
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
              className="inline-flex items-center gap-1 bg-red-50 text-[#dc3545] hover:bg-red-100 transition-colors text-xs font-extrabold px-3 py-1 rounded-full border border-red-200 shadow-2xs"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>{destinationName}, {destination.state || destination.country || 'India'}</span>
            </Link>
          ) : (
            <span className="inline-flex items-center gap-1 bg-zinc-100 text-zinc-800 text-xs font-bold px-3 py-1 rounded-full">
              <MapPin className="w-3.5 h-3.5 text-[#dc3545]" />
              {destinationName}
            </span>
          )}

          <span
            className={`text-xs font-bold px-3 py-1 rounded-full border ${
              difficultyColors[tourPackage.difficultyLevel] || difficultyColors.Moderate
            }`}
          >
            {tourPackage.difficultyLevel || 'Moderate'} Intensity
          </span>

          <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Curated Expedition
          </span>

          {avgRating && (
            <span className="inline-flex items-center gap-1.5 text-xs font-extrabold px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
              <span>{avgRating}</span>
              <span className="text-zinc-500 font-normal">({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
            </span>
          )}
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight leading-tight">
          {tourPackage.title}
        </h1>

        {tourPackage.shortDescription && (
          <p className="text-sm sm:text-base text-zinc-600 max-w-3xl leading-relaxed">
            {tourPackage.shortDescription}
          </p>
        )}
      </div>

      {/* 3. Image Gallery */}
      <ImageGallery images={allImages} title={tourPackage.title} />

      {/* 4. Quick Specs Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zinc-50 border border-zinc-200 rounded-3xl p-5 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-100/70 text-amber-700 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-zinc-400">Duration</div>
            <div className="text-xs sm:text-sm font-extrabold text-zinc-900">
              {days} Days / {nights} Nights
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-100/70 text-blue-700 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-zinc-400">Group Size</div>
            <div className="text-xs sm:text-sm font-extrabold text-zinc-900">
              Max {tourPackage.maxGroupSize || 12} Explorers
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100/70 text-emerald-700 flex items-center justify-center shrink-0">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-zinc-400">Difficulty</div>
            <div className="text-xs sm:text-sm font-extrabold text-zinc-900">
              {tourPackage.difficultyLevel || 'Moderate'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-red-100/70 text-[#dc3545] flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-zinc-400">Region</div>
            <div className="text-xs sm:text-sm font-extrabold text-zinc-900 truncate">
              {destinationName}
            </div>
          </div>
        </div>
      </div>

      {/* 5. Main Content Grid (65% Details / 35% Booking Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Details, Inclusions, and Placeholder Itinerary */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* About The Expedition */}
          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-900">
              About This Expedition
            </h2>
            <div className="text-xs sm:text-sm text-zinc-700 leading-relaxed whitespace-pre-line space-y-3">
              {tourPackage.longDescription || tourPackage.shortDescription || 'Experience a meticulously crafted travel journey.'}
            </div>
          </div>

          {/* Inclusions & Exclusions */}
          <div className="space-y-4 pt-4 border-t border-zinc-200">
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-900">
              What’s Included & Excluded
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-zinc-50/70 border border-zinc-200 rounded-3xl p-6">
              
              {/* Inclusions */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Included in Package</span>
                </div>
                {Array.isArray(tourPackage.inclusions) && tourPackage.inclusions.length > 0 ? (
                  <ul className="space-y-2 text-xs text-zinc-700">
                    {tourPackage.inclusions.map((inc, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-600 font-bold">✓</span>
                        <span>{inc}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-zinc-500 italic">Standard inclusions apply (accommodations, transfers, guide).</p>
                )}
              </div>

              {/* Exclusions */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-red-800 uppercase tracking-wider">
                  <XCircle className="w-4 h-4 text-red-600" />
                  <span>Not Included</span>
                </div>
                {Array.isArray(tourPackage.exclusions) && tourPackage.exclusions.length > 0 ? (
                  <ul className="space-y-2 text-xs text-zinc-700">
                    {tourPackage.exclusions.map((exc, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-red-500 font-bold">✕</span>
                        <span>{exc}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-zinc-500 italic">Personal expenses, optional gratuities, and airfare.</p>
                )}
              </div>

            </div>
          </div>

          {/* Day-by-Day Itinerary Section */}
          <div className="space-y-6 pt-4 border-t border-zinc-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-amber-600" />
                  <span>Day-by-Day Expedition Itinerary</span>
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Detailed timeline, daily activities, meals, and overnight stops.
                </p>
              </div>

              {Array.isArray(tourPackage.itinerary) && tourPackage.itinerary.length > 0 && (
                <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-900 text-[11px] font-bold px-3 py-1 rounded-full border border-amber-200 self-start sm:self-auto">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  {tourPackage.itinerary.length} Days Planned
                </span>
              )}
            </div>

            {/* If itinerary is empty (Backward Compatibility) */}
            {(!Array.isArray(tourPackage.itinerary) || tourPackage.itinerary.length === 0) ? (
              <div className="bg-gradient-to-br from-amber-50/40 via-white to-zinc-50 border border-amber-200/70 rounded-3xl p-6 sm:p-8 text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-inner">
                  <Calendar className="w-6 h-6" />
                </div>
                <div className="space-y-1.5 max-w-lg mx-auto">
                  <h3 className="font-extrabold text-base text-zinc-900">
                    Day-by-Day Itinerary Being Finalized
                  </h3>
                  <p className="text-xs text-zinc-600 leading-relaxed">
                    Our tour directors are putting the finishing touches on the minute-by-minute schedule for this {days}-day expedition. All scheduled stops, meals, and luxury stays are included as standard.
                  </p>
                </div>
              </div>
            ) : (
              /* Interactive Day-by-Day Timeline / Accordion */
              <div className="space-y-4">
                {tourPackage.itinerary.map((day, idx) => {
                  const dayNum = day.dayNumber || idx + 1;
                  return (
                    <div
                      key={idx}
                      className="bg-white rounded-3xl border border-zinc-200 hover:border-zinc-300 p-5 sm:p-6 shadow-xs transition-all space-y-3"
                    >
                      <div className="flex items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <span className="w-9 h-9 rounded-2xl bg-zinc-900 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-xs">
                            {String(dayNum).padStart(2, '0')}
                          </span>
                          <div>
                            <div className="text-[10px] uppercase font-bold text-amber-700 tracking-wider">
                              Day {dayNum}
                            </div>
                            <h3 className="font-extrabold text-sm sm:text-base text-zinc-900">
                              {day.title}
                            </h3>
                          </div>
                        </div>

                        {Array.isArray(day.activities) && day.activities.length > 0 && (
                          <span className="bg-zinc-100 text-zinc-600 text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0">
                            {day.activities.length} Highlight{day.activities.length !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>

                      {/* Day Description */}
                      {day.description && (
                        <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed pl-12">
                          {day.description}
                        </p>
                      )}

                      {/* Activities Highlights List */}
                      {Array.isArray(day.activities) && day.activities.length > 0 && (
                        <div className="pl-12 pt-1 flex flex-wrap gap-2">
                          {day.activities.map((act, aIdx) => (
                            <span
                              key={aIdx}
                              className="inline-flex items-center gap-1 bg-amber-50/70 border border-amber-200/80 text-amber-900 text-[11px] font-medium px-2.5 py-1 rounded-xl"
                            >
                              <Sparkles className="w-3 h-3 text-amber-600 shrink-0" />
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
            <div className="bg-zinc-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-md">
              <div className="space-y-1.5">
                <div className="text-[10px] uppercase font-bold tracking-wider text-[#dc3545]">
                  Destination Guide
                </div>
                <h3 className="text-lg font-bold text-white">
                  Discover more of {destinationName}
                </h3>
                <p className="text-xs text-zinc-300 max-w-md">
                  Explore curated boutique stays, travel insights, local identity tags, and maps for {destinationName}.
                </p>
              </div>
              <Link
                to={`/destinations/${destinationSlug}`}
                className="inline-flex items-center gap-2 bg-white hover:bg-zinc-100 text-zinc-900 text-xs font-bold py-3 px-6 rounded-full transition-colors shrink-0 self-start sm:self-auto"
              >
                <span>View Destination</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#dc3545]" />
              </Link>
            </div>
          )}

          {/* Verified Explorer Reviews Section */}
          <div className="space-y-6 pt-6 border-t border-zinc-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 flex items-center gap-2">
                  <Star className="w-6 h-6 fill-amber-400 text-amber-500" />
                  <span>Verified Explorer Reviews</span>
                  {reviews.length > 0 && (
                    <span className="text-sm font-normal text-zinc-500">
                      ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
                    </span>
                  )}
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Authentic reviews from travelers who reserved this expedition.
                </p>
              </div>

              {avgRating && (
                <div className="flex items-center gap-2 self-start sm:self-auto bg-amber-50/70 border border-amber-200 px-4 py-2 rounded-2xl">
                  <span className="text-2xl font-extrabold text-amber-900">{avgRating}</span>
                  <div>
                    <StarRating rating={Math.round(Number(avgRating))} size="sm" />
                    <div className="text-[10px] font-bold text-amber-700">Overall Rating</div>
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
              <div className="bg-zinc-50 border border-zinc-200 rounded-3xl p-8 text-center space-y-2">
                <Star className="w-8 h-8 text-zinc-300 mx-auto" />
                <h4 className="font-bold text-sm text-zinc-800">No explorer reviews yet</h4>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                  Be the first verified explorer to embark on this journey and share your insights.
                </p>
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Sticky Pricing & Booking Widget */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white border border-zinc-200 rounded-3xl p-6 shadow-lg space-y-6">
            
            {/* Price Header */}
            <div className="space-y-1 pb-4 border-b border-zinc-100">
              <div className="text-xs uppercase font-bold text-zinc-400">
                Starting base price
              </div>
              <div className="text-3xl font-extrabold text-zinc-900">
                {formatPrice(basePrice)}
                <span className="text-sm font-normal text-zinc-500"> / person</span>
              </div>
              <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 pt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Luxury stays & permits included
              </div>
            </div>

            {/* Quick Summary Specs */}
            <div className="space-y-2.5 text-xs text-zinc-600">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Duration:</span>
                <span className="font-bold text-zinc-900">{days} Days / {nights} Nights</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Difficulty:</span>
                <span className="font-bold text-zinc-900">{tourPackage.difficultyLevel || 'Moderate'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Max Capacity:</span>
                <span className="font-bold text-zinc-900">{tourPackage.maxGroupSize || 12} Explorers</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Destination:</span>
                <span className="font-bold text-zinc-900">{destinationName}</span>
              </div>
            </div>

            {/* INTERACTIVE BOOKING WIDGET (Part 2.8) */}
            {bookingSuccess ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center space-y-3 animate-fade-in">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-extrabold text-base text-zinc-900">
                    Expedition Confirmed!
                  </h4>
                  <p className="text-xs text-zinc-600 mt-1">
                    Your {days}-day journey to {destinationName} starting on{' '}
                    <b>{new Date(bookingSuccess.checkIn).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</b> is reserved.
                  </p>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <Link
                    to="/profile"
                    className="w-full bg-[#dc3545] hover:bg-[#b02a37] text-white text-xs font-bold py-2.5 rounded-full transition-colors"
                  >
                    View in My Trips
                  </Link>
                  <button
                    type="button"
                    onClick={() => setBookingSuccess(null)}
                    className="text-xs text-zinc-500 hover:underline cursor-pointer"
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
                className="space-y-4 pt-4 border-t border-zinc-100 text-xs"
              >
                {/* 1. Departure Date */}
                <div className="space-y-1">
                  <label className="block font-bold text-zinc-700 uppercase tracking-wider text-[11px]">
                    Departure Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      min={tomorrowStr}
                      value={departureDate}
                      onChange={(e) => setDepartureDate(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-zinc-800 focus:outline-hidden focus:border-[#dc3545] cursor-pointer"
                      required
                    />
                  </div>
                </div>

                {/* 2. Travelers Counter */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-bold text-zinc-700 uppercase tracking-wider">
                    <span>Travelers</span>
                    <span className="text-zinc-400 font-normal capitalize">Max {tourPackage.maxGroupSize || 12}</span>
                  </div>

                  <div className="flex items-center justify-between bg-zinc-50 border border-zinc-200 rounded-xl p-2">
                    <button
                      type="button"
                      onClick={() => setTravelers((prev) => Math.max(1, prev - 1))}
                      disabled={travelers <= 1}
                      className="w-8 h-8 rounded-lg bg-white border border-zinc-200 flex items-center justify-center text-zinc-700 hover:bg-zinc-100 disabled:opacity-40 cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>

                    <div className="font-extrabold text-sm text-zinc-900">
                      {travelers} Explorer{travelers !== 1 ? 's' : ''}
                    </div>

                    <button
                      type="button"
                      onClick={() => setTravelers((prev) => Math.min(tourPackage.maxGroupSize || 12, prev + 1))}
                      disabled={travelers >= (tourPackage.maxGroupSize || 12)}
                      className="w-8 h-8 rounded-lg bg-white border border-zinc-200 flex items-center justify-center text-zinc-700 hover:bg-zinc-100 disabled:opacity-40 cursor-pointer"
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
                    <div className="space-y-2 pt-3 border-t border-zinc-100 text-xs">
                      <div className="flex items-center justify-between text-zinc-600">
                        <span>
                          {formatPrice(basePrice)} &times; {travelers} traveler{travelers !== 1 ? 's' : ''}
                        </span>
                        <span className="font-semibold text-zinc-900">{formatPrice(subtotal)}</span>
                      </div>

                      <div className="flex items-center justify-between text-zinc-600">
                        <span>Applicable GST (18%)</span>
                        <span className="font-semibold text-zinc-900">{formatPrice(gst)}</span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-zinc-100 font-extrabold text-sm text-zinc-900">
                        <span>Total (INR)</span>
                        <span className="text-[#dc3545]">{formatPrice(total)}</span>
                      </div>
                    </div>
                  );
                })()}

                {/* 4. Action Button */}
                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="w-full bg-[#dc3545] hover:bg-[#b02a37] text-white font-bold py-3.5 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg cursor-pointer disabled:opacity-50"
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
            <div className="pt-4 border-t border-zinc-100 space-y-2 text-[11px] text-zinc-500">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>100% Verified Local Operators</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Best Price & Flexible Rescheduling</span>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
