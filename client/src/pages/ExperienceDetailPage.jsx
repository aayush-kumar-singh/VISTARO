import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { experiencesApi } from '../api/experiencesApi.js';
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
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Calendar,
  ArrowRight,
  Info,
  Share2,
  Heart,
  ExternalLink,
  Star,
  MessageSquare,
  Lock,
  Plus,
  Minus,
  Check,
} from 'lucide-react';

export default function ExperienceDetailPage() {
  const { slug } = useParams();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();
  const location = useLocation();

  const [experience, setExperience] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Booking Engine State
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const [activityDate, setActivityDate] = useState(tomorrowStr);
  const [timeSlot, setTimeSlot] = useState('Morning (09:00 AM)');
  const [travelers, setTravelers] = useState(2);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);

  const handleReviewAdded = (newReview) => {
    setExperience((prev) => ({
      ...prev,
      reviews: [newReview, ...(prev.reviews || [])],
    }));
  };

  const handleReviewDeleted = (reviewId) => {
    setExperience((prev) => ({
      ...prev,
      reviews: (prev.reviews || []).filter((r) => r._id !== reviewId),
    }));
  };

  const handleReplyUpdated = (reviewId, reply) => {
    setExperience((prev) => ({
      ...prev,
      reviews: (prev.reviews || []).map((r) =>
        r._id === reviewId ? { ...r, ownerReply: reply } : r
      ),
    }));
  };

  useEffect(() => {
    async function fetchExperienceDetail() {
      try {
        setLoading(true);
        setError(null);

        const data = await experiencesApi.getExperienceBySlug(slug);
        if (!data || !data.experience) {
          setError('Experience not found.');
          return;
        }

        setExperience(data.experience);
      } catch (err) {
        setError(err.response?.data?.error || err.message || 'Failed to load experience details.');
      } finally {
        setLoading(false);
      }
    }

    fetchExperienceDetail();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  // Loading State
  if (loading) {
    return <LoadingSpinner fullScreen={false} text="Loading experience details..." />;
  }

  // 404 / Error State
  if (error || !experience) {
    return (
      <div className="w-full max-w-2xl mx-auto py-16 px-6 text-center space-y-6 animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-red-50 text-[#dc3545] flex items-center justify-center mx-auto shadow-inner">
          <Sparkles className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900">
            Experience Not Found
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 max-w-md mx-auto leading-relaxed">
            The host-led experience you are looking for might have been moved, deactivated, or does not exist.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            to="/experiences"
            className="bg-[#222222] hover:bg-black text-white text-xs sm:text-sm font-bold py-3 px-6 rounded-full transition-colors shadow-xs"
          >
            Browse All Experiences
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

  // Extract destination fields safely
  const destinationObj = typeof experience.destination === 'object' ? experience.destination : null;
  const destinationName = destinationObj?.name || 'India';
  const destinationSlug = destinationObj?.slug || '';
  const destinationState = destinationObj?.state || destinationObj?.country || 'India';

  const duration = experience.durationHours || 2;
  const basePrice = experience.price?.basePrice ?? experience.basePrice ?? 0;
  const maxGroupSize = experience.maxGroupSize || 10;
  const difficulty = experience.difficultyLevel || 'Easy';
  const category = experience.category || 'Adventure';

  // Format images for gallery
  const coverImageObj = experience.coverImage || { url: experience.image?.url || '' };
  const rawGallery = Array.isArray(experience.galleryImages) ? experience.galleryImages : [];
  const galleryImages = [
    coverImageObj,
    ...rawGallery.filter((img) => img?.url && img.url !== coverImageObj.url),
  ];

  const categoryColors = {
    Adventure: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Cultural: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    'Food & Drink': 'bg-amber-50 text-amber-800 border-amber-200',
    Nature: 'bg-teal-50 text-teal-700 border-teal-200',
    Wellness: 'bg-purple-50 text-purple-700 border-purple-200',
    Photography: 'bg-rose-50 text-rose-700 border-rose-200',
    Workshop: 'bg-blue-50 text-blue-700 border-blue-200',
  };

  const difficultyColors = {
    Easy: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Moderate: 'bg-blue-50 text-blue-700 border-blue-200',
    Challenging: 'bg-amber-50 text-amber-800 border-amber-200',
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 pb-20 animate-fade-in text-[#222222]">
      
      {/* 1. Top Breadcrumbs & Back Nav */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500">
          <Link to="/" className="hover:text-zinc-900 transition-colors">Vistaro</Link>
          <span>/</span>
          <Link to="/experiences" className="hover:text-zinc-900 transition-colors">Experiences</Link>
          <span>/</span>
          {destinationSlug ? (
            <Link to={`/destinations/${destinationSlug}`} className="hover:text-zinc-900 transition-colors">
              {destinationName}
            </Link>
          ) : (
            <span>{destinationName}</span>
          )}
          <span>/</span>
          <span className="text-zinc-900 truncate max-w-[200px] sm:max-w-xs">{experience.title}</span>
        </div>

        <Link
          to="/experiences"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-600 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Experiences</span>
        </Link>
      </div>

      {/* 2. Title & Key Badges Header */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`text-xs font-extrabold px-3 py-1 rounded-full border shadow-2xs ${
              categoryColors[category] || categoryColors.Adventure
            }`}
          >
            {category}
          </span>

          <span
            className={`text-xs font-bold px-3 py-1 rounded-full border shadow-2xs ${
              difficultyColors[difficulty] || difficultyColors.Easy
            }`}
          >
            {difficulty}
          </span>

          {destinationSlug && (
            <Link
              to={`/destinations/${destinationSlug}`}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#dc3545] bg-red-50 hover:bg-red-100 border border-red-200/60 px-3 py-1 rounded-full transition-colors shadow-2xs"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>{destinationName}, {destinationState}</span>
              <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
            </Link>
          )}
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 leading-tight">
          {experience.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500 pt-1">
          <div className="flex items-center gap-1.5 text-zinc-800 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>Hosted by <b className="text-zinc-900">@{experience.createdBy?.username || 'Vistaro Host'}</b></span>
          </div>
          <span className="w-1 h-1 rounded-full bg-zinc-300" />
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-zinc-400" />
            <span>{duration} {duration === 1 ? 'Hour' : 'Hours'} total duration</span>
          </div>
          <span className="w-1 h-1 rounded-full bg-zinc-300" />
          <div className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-zinc-400" />
            <span>Small group up to {maxGroupSize} guests</span>
          </div>
        </div>
      </div>

      {/* 3. Photo Gallery Display */}
      <ImageGallery images={galleryImages} title={experience.title} />

      {/* 4. Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start pt-4">
        
        {/* LEFT COLUMN: Editorial Details, Inclusions, Meeting Point, Reviews Placeholder */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Quick Facts Summary Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zinc-50 border border-zinc-200/90 rounded-3xl p-5 shadow-xs">
            <div className="space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Duration</div>
              <div className="text-sm font-extrabold text-zinc-900 flex items-center gap-1">
                <Clock className="w-4 h-4 text-purple-600" />
                <span>{duration} Hours</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Group Size</div>
              <div className="text-sm font-extrabold text-zinc-900 flex items-center gap-1">
                <Users className="w-4 h-4 text-blue-600" />
                <span>Max {maxGroupSize}</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Difficulty</div>
              <div className="text-sm font-extrabold text-zinc-900 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>{difficulty}</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Activity Type</div>
              <div className="text-sm font-extrabold text-zinc-900 flex items-center gap-1">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>{category}</span>
              </div>
            </div>
          </div>

          {/* About This Experience */}
          <div className="bg-white border border-zinc-200/90 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xs">
            <div className="flex items-center gap-2.5 pb-4 border-b border-zinc-100">
              <div className="w-9 h-9 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-zinc-900">About This Experience</h2>
                <p className="text-xs text-zinc-500">Overview, activity highlights, and host narrative</p>
              </div>
            </div>

            {experience.shortDescription && (
              <p className="text-sm sm:text-base font-semibold text-zinc-800 leading-relaxed italic border-l-4 border-purple-500 pl-4 py-1">
                "{experience.shortDescription}"
              </p>
            )}

            <div className="prose prose-zinc max-w-none text-zinc-700 leading-relaxed text-sm sm:text-base whitespace-pre-line space-y-4">
              {experience.longDescription || experience.description || experience.shortDescription}
            </div>
          </div>

          {/* What's Included */}
          {Array.isArray(experience.whatsIncluded) && experience.whatsIncluded.length > 0 && (
            <div className="bg-white border border-zinc-200/90 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xs">
              <div className="flex items-center gap-2.5 pb-4 border-b border-zinc-100">
                <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-zinc-900">What's Included</h2>
                  <p className="text-xs text-zinc-500">Equipment, refreshments, and guidance provided by your host</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {experience.whatsIncluded.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/60"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm font-medium text-zinc-800">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Meeting Point & Regional Context */}
          <div className="bg-white border border-zinc-200/90 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xs">
            <div className="flex items-center gap-2.5 pb-4 border-b border-zinc-100">
              <div className="w-9 h-9 rounded-full bg-red-50 text-[#dc3545] flex items-center justify-center">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-zinc-900">Meeting Point & Location</h2>
                <p className="text-xs text-zinc-500">Where to gather before your activity begins</p>
              </div>
            </div>

            <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-200/70 space-y-2">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#dc3545] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold text-zinc-900 text-sm">
                    {experience.meetingPoint || `${destinationName} Landmark`}
                  </div>
                  <div className="text-xs text-zinc-500">
                    Located in {destinationName}, {destinationState}. Exact coordinate directions and host contact will be sent upon booking.
                  </div>
                </div>
              </div>
            </div>

            {destinationSlug && (
              <div className="pt-2">
                <Link
                  to={`/destinations/${destinationSlug}`}
                  className="inline-flex items-center gap-2 text-xs font-bold text-[#dc3545] hover:underline"
                >
                  <span>Explore the complete Vistaro guide to {destinationName}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>

          {/* 7. Reviews Section (Phase 3 / Part 3.8) */}
          {(() => {
            const reviews = Array.isArray(experience.reviews) ? experience.reviews : [];
            const reviewCount = reviews.length;
            const avgRating =
              reviewCount > 0
                ? (reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / reviewCount).toFixed(1)
                : null;

            return (
              <div id="reviews-section" className="space-y-6 pt-4 border-t border-zinc-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
                  <div>
                    <h2 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
                      <Star className="w-6 h-6 fill-amber-400 text-amber-500" />
                      <span>
                        {avgRating ? `${avgRating} · ${reviewCount} ${reviewCount === 1 ? 'Review' : 'Reviews'}` : 'Guest Reviews'}
                      </span>
                    </h2>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Verified feedback from travelers who booked this experience
                    </p>
                  </div>

                  {avgRating && (
                    <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-3.5 py-1.5 rounded-full self-start sm:self-auto">
                      <StarRating rating={Number(avgRating)} />
                      <span className="text-xs font-bold text-amber-900">{avgRating} / 5</span>
                    </div>
                  )}
                </div>

                {/* Review Submission Form */}
                <ReviewForm
                  experienceId={experience._id}
                  onReviewAdded={handleReviewAdded}
                />

                {/* Reviews List */}
                {reviewCount === 0 ? (
                  <div className="text-center py-10 px-4 bg-zinc-50 rounded-3xl border border-zinc-200/80 space-y-2">
                    <MessageSquare className="w-8 h-8 text-zinc-400 mx-auto" />
                    <h4 className="text-sm font-bold text-zinc-800">
                      No reviews yet
                    </h4>
                    <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                      Be the first verified explorer to reserve and review this host-led immersion in {destinationName}!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {reviews.map((rev) => (
                      <ReviewCard
                        key={rev._id}
                        review={rev}
                        experienceId={experience._id}
                        creatorId={experience.createdBy?._id || experience.createdBy}
                        onReviewDeleted={handleReviewDeleted}
                        onReplyUpdated={handleReplyUpdated}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })()}

        </div>

        {/* RIGHT COLUMN: Sticky Booking Widget (Part 3.7) */}
        <div className="lg:col-span-1 lg:sticky lg:top-24 space-y-5">
          <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
            
            {/* Header: Starting Price */}
            <div className="pb-4 border-b border-zinc-100 flex items-baseline justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                  Experience Rate
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl sm:text-3xl font-extrabold text-zinc-900">
                    {formatPrice(basePrice)}
                  </span>
                  <span className="text-xs text-zinc-500 font-medium">/ person</span>
                </div>
              </div>

              <span className="text-[10px] font-extrabold bg-purple-50 text-purple-700 px-2.5 py-1 rounded-full border border-purple-200">
                Host-Led
              </span>
            </div>

            {/* Quick Experience Specs */}
            <div className="bg-zinc-50/70 border border-zinc-200/60 rounded-2xl p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Duration:</span>
                <span className="font-bold text-zinc-900">{duration} Hours</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Activity Type:</span>
                <span className="font-bold text-zinc-900">{category}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Max Capacity:</span>
                <span className="font-bold text-zinc-900">{maxGroupSize} Guests</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Meeting Point:</span>
                <span className="font-bold text-zinc-900 truncate max-w-[150px]">{experience.meetingPoint || destinationName}</span>
              </div>
            </div>

            {/* INTERACTIVE BOOKING WIDGET (Part 3.7) */}
            {bookingSuccess ? (
              <div className="bg-purple-50 border border-purple-200 rounded-2xl p-5 text-center space-y-3 animate-fade-in">
                <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-extrabold text-base text-zinc-900">
                    Experience Reserved!
                  </h4>
                  <p className="text-xs text-zinc-600 mt-1">
                    Your immersion for {bookingSuccess.guests} guest{bookingSuccess.guests > 1 ? 's' : ''} on{' '}
                    <b>{new Date(bookingSuccess.checkIn).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</b> is confirmed.
                  </p>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <Link
                    to="/profile"
                    className="w-full bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold py-2.5 rounded-full transition-colors shadow-xs"
                  >
                    View in My Trips
                  </Link>
                  <button
                    type="button"
                    onClick={() => setBookingSuccess(null)}
                    className="text-xs text-zinc-500 hover:underline cursor-pointer"
                  >
                    Book another session
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

                  if (!activityDate) {
                    showError('Please choose an activity date.');
                    return;
                  }

                  if (travelers > maxGroupSize) {
                    showError(`Maximum group size is ${maxGroupSize} guests.`);
                    return;
                  }

                  try {
                    setBookingLoading(true);
                    const res = await bookingsApi.createExperienceBooking(experience._id, {
                      activityDate,
                      travelers,
                      timeSlot,
                    });

                    showSuccess(res.message || 'Experience booked successfully!');
                    setBookingSuccess(res.booking);
                  } catch (err) {
                    showError(err.response?.data?.error || err.message || 'Failed to complete booking.');
                  } finally {
                    setBookingLoading(false);
                  }
                }}
                className="space-y-4 pt-4 border-t border-zinc-100 text-xs"
              >
                {/* 1. Activity Date */}
                <div className="space-y-1">
                  <label className="block font-bold text-zinc-700 uppercase tracking-wider text-[11px]">
                    Activity Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      min={tomorrowStr}
                      value={activityDate}
                      onChange={(e) => setActivityDate(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-zinc-800 focus:outline-hidden focus:border-purple-600 cursor-pointer"
                      required
                    />
                  </div>
                </div>

                {/* 2. Time Slot Selection */}
                <div className="space-y-1">
                  <label className="block font-bold text-zinc-700 uppercase tracking-wider text-[11px]">
                    Time Slot
                  </label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-medium text-zinc-800 focus:outline-hidden focus:border-purple-600 cursor-pointer"
                  >
                    <option value="Morning (09:00 AM)">Morning Session (09:00 AM)</option>
                    <option value="Afternoon (02:00 PM)">Afternoon Session (02:00 PM)</option>
                    <option value="Golden Hour / Twilight (04:30 PM)">Golden Hour / Twilight (04:30 PM)</option>
                  </select>
                </div>

                {/* 3. Guests / Participants Counter */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-bold text-zinc-700 uppercase tracking-wider">
                    <span>Participants</span>
                    <span className="text-zinc-400 font-normal capitalize">Max {maxGroupSize}</span>
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
                      {travelers} Guest{travelers !== 1 ? 's' : ''}
                    </div>

                    <button
                      type="button"
                      onClick={() => setTravelers((prev) => Math.min(maxGroupSize, prev + 1))}
                      disabled={travelers >= maxGroupSize}
                      className="w-8 h-8 rounded-lg bg-white border border-zinc-200 flex items-center justify-center text-zinc-700 hover:bg-zinc-100 disabled:opacity-40 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* 4. Real-time Price Breakdown */}
                {(() => {
                  const subtotal = travelers * basePrice;
                  const gst = Math.round(subtotal * 0.18);
                  const total = subtotal + gst;

                  return (
                    <div className="space-y-2 pt-3 border-t border-zinc-100 text-xs">
                      <div className="flex items-center justify-between text-zinc-600">
                        <span>
                          {formatPrice(basePrice)} &times; {travelers} guest{travelers !== 1 ? 's' : ''}
                        </span>
                        <span className="font-semibold text-zinc-900">{formatPrice(subtotal)}</span>
                      </div>

                      <div className="flex items-center justify-between text-zinc-600">
                        <span>Applicable GST (18%)</span>
                        <span className="font-semibold text-zinc-900">{formatPrice(gst)}</span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-zinc-100 font-extrabold text-sm text-zinc-900">
                        <span>Total (INR)</span>
                        <span className="text-purple-700">{formatPrice(total)}</span>
                      </div>
                    </div>
                  );
                })()}

                {/* 5. Action Button */}
                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="w-full bg-purple-700 hover:bg-purple-800 text-white font-bold py-3.5 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg cursor-pointer disabled:opacity-50"
                >
                  {bookingLoading ? (
                    <span>Confirming Reservation...</span>
                  ) : (
                    <>
                      <span>Reserve Experience</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <p className="text-[10px] text-center text-zinc-400">
                  Instant confirmation · Direct host communication included
                </p>
              </form>
            )}

            {/* Guarantee list */}
            <div className="pt-4 border-t border-zinc-100 space-y-2 text-xs text-zinc-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Free cancellation up to 24h before</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Certified local specialist guide</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>All essential equipment included</span>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
