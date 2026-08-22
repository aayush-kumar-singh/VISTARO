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
import AddToPlanModal from '../components/travel-plans/AddToPlanModal.jsx';
import {
  Clock,
  MapPin,
  Users,
  Sparkles,
  Compass,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  Star,
  MessageSquare,
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
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);

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
      <div className="w-full max-w-2xl mx-auto py-16 px-6 text-center space-y-6 animate-fade-in text-vistaro-primary">
        <div className="w-16 h-16 rounded-full bg-vistaro-secondary text-vistaro-error flex items-center justify-center mx-auto shadow-inner border border-vistaro-border">
          <Sparkles className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-display-h2 text-vistaro-primary">
            Experience Not Found
          </h1>
          <p className="text-body-sm text-vistaro-secondary max-w-md mx-auto leading-relaxed">
            The host-led experience you are looking for might have been moved, deactivated, or does not exist.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            to="/experiences"
            className="bg-vistaro-accent hover:bg-vistaro-accent-hover text-white text-cta py-3 px-6 rounded-full transition-colors shadow-xs"
          >
            Browse All Experiences
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

  return (
    <div className="w-full space-y-8 pb-20 animate-fade-in text-vistaro-primary transition-colors duration-200">

      {/* 1. Top Breadcrumbs & Back Nav */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-2 text-body-sm text-vistaro-muted">
          <Link to="/" className="hover:text-vistaro-primary transition-colors">Vistaro</Link>
          <span>/</span>
          <Link to="/experiences" className="hover:text-vistaro-primary transition-colors">Experiences</Link>
          <span>/</span>
          {destinationSlug ? (
            <Link to={`/destinations/${destinationSlug}`} className="hover:text-vistaro-primary transition-colors">
              {destinationName}
            </Link>
          ) : (
            <span>{destinationName}</span>
          )}
          <span>/</span>
          <span className="text-vistaro-primary truncate max-w-[200px] sm:max-w-xs">{experience.title}</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              if (!user) {
                navigate('/login', { state: { from: location } });
                return;
              }
              setIsPlanModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-vistaro-border hover:bg-vistaro-secondary text-vistaro-primary text-cta transition-colors cursor-pointer"
            title="Add to Travel Plan"
          >
            <Compass className="w-3.5 h-3.5 text-vistaro-accent" />
            <span>Add to Plan</span>
          </button>

          <Link
            to="/experiences"
            className="inline-flex items-center gap-1.5 text-cta text-vistaro-secondary hover:text-vistaro-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Experiences</span>
          </Link>
        </div>
      </div>

      {/* 2. Title & Key Badges Header */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="text-caption font-semibold px-3 py-1 rounded-full border shadow-2xs bg-vistaro-surface text-vistaro-accent border-vistaro-accent/40"
          >
            {category}
          </span>

          <span
            className="text-caption font-medium px-3 py-1 rounded-full border shadow-2xs bg-vistaro-surface text-vistaro-secondary border-vistaro-border"
          >
            {difficulty}
          </span>

          {destinationSlug && (
            <Link
              to={`/destinations/${destinationSlug}`}
              className="inline-flex items-center gap-1.5 text-caption bg-vistaro-secondary hover:bg-vistaro-surface border border-vistaro-border px-3 py-1 rounded-full transition-colors shadow-2xs"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>{destinationName}, {destinationState}</span>
              <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
            </Link>
          )}
        </div>

        <h1 className="text-display-hero text-vistaro-primary">
          {experience.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-body-sm text-vistaro-muted pt-1">
          <div className="flex items-center gap-1.5 text-vistaro-secondary font-medium">
            <Sparkles className="w-3.5 h-3.5 text-vistaro-accent" />
            <span>Hosted by <b className="text-vistaro-primary">@{experience.createdBy?.username || 'Vistaro Host'}</b></span>
          </div>
          <span className="w-1 h-1 rounded-full bg-vistaro-border" />
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-vistaro-muted" />
            <span>{duration} {duration === 1 ? 'Hour' : 'Hours'} total duration</span>
          </div>
          <span className="w-1 h-1 rounded-full bg-vistaro-border" />
          <div className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-vistaro-muted" />
            <span>Small group up to {maxGroupSize} guests</span>
          </div>
        </div>
      </div>

      {/* 3. Photo Gallery Display */}
      <ImageGallery images={galleryImages} title={experience.title} />

      {/* 4. Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start pt-4">

        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-8">

          {/* Quick Facts Summary Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-vistaro-surface border border-vistaro-border rounded-3xl p-5 shadow-xs">
            <div className="space-y-1">
              <div className="text-label text-vistaro-muted">Duration</div>
              <div className="text-body-sm font-semibold text-vistaro-primary flex items-center gap-1">
                <Clock className="w-4 h-4 text-vistaro-rating" />
                <span>{duration} Hours</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-label text-vistaro-muted">Group Size</div>
              <div className="text-body-sm font-semibold text-vistaro-primary flex items-center gap-1">
                <Users className="w-4 h-4 text-vistaro-accent" />
                <span>Max {maxGroupSize}</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-label text-vistaro-muted">Difficulty</div>
              <div className="text-body-sm font-semibold text-vistaro-primary flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-vistaro-success" />
                <span>{difficulty}</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-label text-vistaro-muted">Activity Type</div>
              <div className="text-body-sm font-semibold text-vistaro-primary flex items-center gap-1">
                <Sparkles className="w-4 h-4 text-vistaro-accent" />
                <span>{category}</span>
              </div>
            </div>
          </div>

          {/* About This Experience */}
          <div className="bg-vistaro-surface border border-vistaro-border rounded-3xl p-6 sm:p-8 space-y-5 shadow-xs">
            <div className="flex items-center gap-2.5 pb-4 border-b border-vistaro-border">
              <div className="w-9 h-9 rounded-full bg-vistaro-secondary text-vistaro-accent flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-display-h2 text-vistaro-primary">About This Experience</h2>
                <p className="text-muted">Overview, activity highlights, and host narrative</p>
              </div>
            </div>

            {experience.shortDescription && (
              <p className="text-body font-semibold text-vistaro-primary leading-relaxed italic border-l-4 border-vistaro-accent pl-4 py-1">
                "{experience.shortDescription}"
              </p>
            )}

            <div className="text-vistaro-secondary leading-relaxed text-body whitespace-pre-line space-y-4">
              {experience.longDescription || experience.description || experience.shortDescription}
            </div>
          </div>

          {/* What's Included */}
          {Array.isArray(experience.whatsIncluded) && experience.whatsIncluded.length > 0 && (
            <div className="bg-vistaro-surface border border-vistaro-border rounded-3xl p-6 sm:p-8 space-y-5 shadow-xs">
              <div className="flex items-center gap-2.5 pb-4 border-b border-vistaro-border">
                <div className="w-9 h-9 rounded-full bg-vistaro-secondary text-vistaro-success flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-display-h2 text-vistaro-primary">What's Included</h2>
                  <p className="text-muted">Equipment, refreshments, and guidance provided by your host</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {experience.whatsIncluded.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3.5 rounded-2xl bg-vistaro-secondary border border-vistaro-border"
                  >
                    <CheckCircle2 className="w-4 h-4 text-vistaro-success shrink-0 mt-0.5" />
                    <span className="text-body-sm font-medium text-vistaro-primary">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Meeting Point & Regional Context */}
          <div className="bg-vistaro-surface border border-vistaro-border rounded-3xl p-6 sm:p-8 space-y-5 shadow-xs">
            <div className="flex items-center gap-2.5 pb-4 border-b border-vistaro-border">
              <div className="w-9 h-9 rounded-full bg-vistaro-secondary text-vistaro-accent flex items-center justify-center">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-display-h2 text-vistaro-primary">Meeting Point & Location</h2>
                <p className="text-muted">Where to gather before your activity begins</p>
              </div>
            </div>

            <div className="bg-vistaro-secondary rounded-2xl p-4 border border-vistaro-border space-y-2">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-vistaro-accent shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="text-card-title text-vistaro-primary">
                    {experience.meetingPoint || `${destinationName} Landmark`}
                  </div>
                  <div className="text-body-sm text-vistaro-muted">
                    Located in {destinationName}, {destinationState}. Exact coordinate directions and host contact will be sent upon booking.
                  </div>
                </div>
              </div>
            </div>

            {destinationSlug && (
              <div className="pt-2">
                <Link
                  to={`/destinations/${destinationSlug}`}
                  className="inline-flex items-center gap-2 text-cta text-vistaro-accent hover:underline"
                >
                  <span>Explore the complete Vistaro guide to {destinationName}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>

          {/* Reviews Section */}
          {(() => {
            const reviews = Array.isArray(experience.reviews) ? experience.reviews : [];
            const reviewCount = reviews.length;
            const avgRating =
              reviewCount > 0
                ? (reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / reviewCount).toFixed(1)
                : null;

            return (
              <div id="reviews-section" className="space-y-6 pt-4 border-t border-vistaro-border">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
                  <div>
                    <h2 className="text-display-h2 text-vistaro-primary flex items-center gap-2">
                      <Star className="w-6 h-6 fill-vistaro-rating text-vistaro-rating" />
                      <span>
                        {avgRating ? `${avgRating} · ${reviewCount} ${reviewCount === 1 ? 'Review' : 'Reviews'}` : 'Guest Reviews'}
                      </span>
                    </h2>
                    <p className="text-muted mt-0.5">
                      Verified feedback from travelers who booked this experience
                    </p>
                  </div>

                  {avgRating && (
                    <div className="flex items-center gap-1.5 bg-vistaro-surface border border-vistaro-border px-3.5 py-1.5 rounded-full self-start sm:self-auto">
                      <StarRating rating={Number(avgRating)} />
                      <span className="text-rating text-vistaro-rating">{avgRating} / 5</span>
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
                  <div className="text-center py-10 px-4 bg-vistaro-surface rounded-3xl border border-vistaro-border space-y-2">
                    <MessageSquare className="w-8 h-8 text-vistaro-muted mx-auto" />
                    <h4 className="text-display-h3 text-vistaro-primary">
                      No reviews yet
                    </h4>
                    <p className="text-body-sm text-vistaro-muted max-w-sm mx-auto">
                      Be the first verified explorer to reserve and review this host-led immersion in {destinationName}!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(showAllReviews ? reviews : reviews.slice(0, 5)).map((rev) => (
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

                    {reviewCount > 5 && (
                      <div className="pt-2 flex justify-center">
                        <button
                          type="button"
                          onClick={() => setShowAllReviews(!showAllReviews)}
                          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-vistaro-border bg-vistaro-surface hover:bg-vistaro-secondary text-vistaro-primary text-body-sm font-semibold transition-colors duration-200 cursor-pointer shadow-xs"
                        >
                          {showAllReviews ? 'Show less' : `Show more (${reviewCount - 5} more)`}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })()}

        </div>

        {/* RIGHT COLUMN: Sticky Booking Widget */}
        <div className="lg:col-span-1 lg:sticky lg:top-24 space-y-5">
          <div className="bg-vistaro-surface border border-vistaro-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">

            {/* Header: Starting Price */}
            <div className="pb-4 border-b border-vistaro-border flex items-baseline justify-between">
              <div>
                <span className="text-label text-vistaro-muted block">
                  Experience Rate
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-price text-3xl text-vistaro-primary">
                    {formatPrice(basePrice)}
                  </span>
                  <span className="font-sans font-normal text-xs text-vistaro-muted"> / person</span>
                </div>
              </div>

              <span className="text-caption bg-vistaro-secondary text-vistaro-accent px-2.5 py-1 rounded-full border border-vistaro-border">
                Host-Led
              </span>
            </div>

            {/* Quick Experience Specs */}
            <div className="bg-vistaro-secondary border border-vistaro-border rounded-2xl p-3.5 space-y-2 text-body-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted">Duration:</span>
                <span className="font-semibold text-vistaro-primary">{duration} Hours</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">Activity Type:</span>
                <span className="font-semibold text-vistaro-primary">{category}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">Max Capacity:</span>
                <span className="font-semibold text-vistaro-primary">{maxGroupSize} Guests</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">Meeting Point:</span>
                <span className="font-semibold text-vistaro-primary truncate max-w-[150px]">{experience.meetingPoint || destinationName}</span>
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
                    Experience Reserved!
                  </h4>
                  <p className="text-body-sm text-vistaro-secondary mt-1">
                    Your immersion for {bookingSuccess.guests} guest{bookingSuccess.guests > 1 ? 's' : ''} on{' '}
                    <b>{new Date(bookingSuccess.checkIn).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</b> is confirmed.
                  </p>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <Link
                    to="/profile"
                    className="w-full bg-vistaro-accent hover:bg-vistaro-accent-hover text-white text-cta py-2.5 rounded-full transition-colors shadow-xs"
                  >
                    View in My Trips
                  </Link>
                  <button
                    type="button"
                    onClick={() => setBookingSuccess(null)}
                    className="text-body-sm text-vistaro-muted hover:underline cursor-pointer"
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
                className="space-y-4 pt-4 border-t border-vistaro-border text-body-sm"
              >
                {/* 1. Activity Date */}
                <div className="space-y-1">
                  <label className="block text-label text-vistaro-primary">
                    Activity Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      min={tomorrowStr}
                      value={activityDate}
                      onChange={(e) => setActivityDate(e.target.value)}
                      className="w-full bg-vistaro-secondary border border-vistaro-border rounded-xl px-3.5 py-2.5 text-body-sm font-medium text-vistaro-primary focus:outline-hidden focus:border-vistaro-accent cursor-pointer"
                      required
                    />
                  </div>
                </div>

                {/* 2. Time Slot Selection */}
                <div className="space-y-1">
                  <label className="block text-label text-vistaro-primary">
                    Time Slot
                  </label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full bg-vistaro-secondary border border-vistaro-border rounded-xl px-3 py-2 text-body-sm font-medium text-vistaro-primary focus:outline-hidden focus:border-vistaro-accent cursor-pointer"
                  >
                    <option value="Morning (09:00 AM)">Morning Session (09:00 AM)</option>
                    <option value="Afternoon (02:00 PM)">Afternoon Session (02:00 PM)</option>
                    <option value="Golden Hour / Twilight (04:30 PM)">Golden Hour / Twilight (04:30 PM)</option>
                  </select>
                </div>

                {/* 3. Guests / Participants Counter */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-label text-vistaro-primary">
                    <span>Participants</span>
                    <span className="text-muted capitalize">Max {maxGroupSize}</span>
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
                      {travelers} Guest{travelers !== 1 ? 's' : ''}
                    </div>

                    <button
                      type="button"
                      onClick={() => setTravelers((prev) => Math.min(maxGroupSize, prev + 1))}
                      disabled={travelers >= maxGroupSize}
                      className="w-8 h-8 rounded-lg bg-vistaro-surface border border-vistaro-border flex items-center justify-center text-vistaro-primary hover:bg-vistaro-secondary disabled:opacity-40 cursor-pointer"
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
                    <div className="space-y-2 pt-3 border-t border-vistaro-border text-body-sm">
                      <div className="flex items-center justify-between text-vistaro-secondary">
                        <span>
                          {formatPrice(basePrice)} &times; {travelers} guest{travelers !== 1 ? 's' : ''}
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

                {/* 5. Action Button */}
                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="w-full bg-vistaro-accent hover:bg-vistaro-accent-hover text-white text-cta py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg cursor-pointer disabled:opacity-50"
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

                <p className="text-caption text-center text-vistaro-muted">
                  Instant confirmation · Direct host communication included
                </p>
              </form>
            )}

            {/* Guarantee list */}
            <div className="pt-4 border-t border-vistaro-border space-y-2 text-body-sm text-vistaro-secondary">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-vistaro-success" />
                <span>Free cancellation up to 24h before</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-vistaro-success" />
                <span>Certified local specialist guide</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-vistaro-success" />
                <span>All essential equipment included</span>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Add to Travel Plan Modal */}
      <AddToPlanModal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        item={experience ? { ...experience, itemType: 'experience' } : null}
      />
    </div>
  );
}
