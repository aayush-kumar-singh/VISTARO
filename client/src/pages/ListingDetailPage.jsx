import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { listingsApi } from '../api/listingsApi.js';
import { wishlistApi } from '../api/wishlistApi.js';
import { inboxApi } from '../api/inboxApi.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import ImageGallery from '../components/listings/ImageGallery.jsx';
import MapView from '../components/listings/MapView.jsx';
import BookingWidget from '../components/booking/BookingWidget.jsx';
import ReviewCard from '../components/reviews/ReviewCard.jsx';
import ReviewForm from '../components/reviews/ReviewForm.jsx';
import ListingCard from '../components/listings/ListingCard.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import AddToPlanModal from '../components/travel-plans/AddToPlanModal.jsx';
import {
  Share2,
  Heart,
  Edit3,
  Trash2,
  MessageSquare,
  Compass,
  Sparkles,
  Star,
  MapPin,
  ChevronRight,
  ShieldAlert,
  X,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
} from 'lucide-react';

export default function ListingDetailPage() {
  const { id } = useParams();
  const { user, updateUser } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const [listing, setListing] = useState(null);
  const [activeBookings, setActiveBookings] = useState([]);
  const [similarListings, setSimilarListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactMessage, setContactMessage] = useState('');
  const [isSendingContact, setIsSendingContact] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactError, setContactError] = useState('');
  const [conversationId, setConversationId] = useState(null);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);

  useEffect(() => {
    async function fetchListing() {
      try {
        setLoading(true);
        setError(null);
        const data = await listingsApi.getListingById(id);
        setListing(data.listing);
        setActiveBookings(data.activeBookings || []);
        setSimilarListings(data.similarListings || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchListing();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading property details..." />;
  }

  if (error || !listing) {
    return (
      <div className="text-center py-20 bg-vistaro-surface rounded-3xl border border-vistaro-border">
        <ShieldAlert className="w-12 h-12 text-vistaro-error mx-auto mb-3" />
        <h2 className="text-display-h2 text-vistaro-primary mb-2">Property Not Found</h2>
        <p className="text-body-sm text-vistaro-secondary mb-6">{error || "The listing you requested doesn't exist or was removed."}</p>
        <Link
          to="/"
          className="bg-vistaro-accent hover:bg-vistaro-accent-hover text-white text-cta py-3 px-6 rounded-full transition-colors cursor-pointer"
        >
          Back to all listings
        </Link>
      </div>
    );
  }

  const isOwner = user && listing.owner && (
    (typeof listing.owner === 'object' ? listing.owner._id : listing.owner) === user._id
  );

  const isSaved = user?.wishlist?.some(
    (item) => (typeof item === 'string' ? item : item?._id) === listing._id
  );

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: listing.title,
          text: `Check out ${listing.title} on Vistaro!`,
          url: window.location.href,
        });
      } catch (err) {
        // Ignored if cancelled
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      showSuccess('Link copied to clipboard!');
    }
  };

  const handleWishlistToggle = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      const data = await wishlistApi.toggleWishlist(listing._id);
      updateUser({ wishlist: data.wishlist });
      showSuccess(data.message);
    } catch (err) {
      showError(err.message);
    }
  };

  const handleContactHost = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setIsContactModalOpen(true);
    setContactSuccess(false);
    setContactError('');
    setContactMessage('');
  };

  const handleSendContactMessage = async (e) => {
    e.preventDefault();
    if (!contactMessage.trim() || isSendingContact) return;

    try {
      setIsSendingContact(true);
      setContactError('');
      const convData = await inboxApi.startConversation(listing._id);
      const convId = convData.conversation?._id;
      setConversationId(convId);

      await inboxApi.sendMessage(convId, contactMessage.trim());
      setContactSuccess(true);
      showSuccess('Message delivered to host!');
    } catch (err) {
      const errMsg = err.response?.data?.error || err.message || 'Failed to send message to host.';
      setContactError(errMsg);
      showError(errMsg);
    } finally {
      setIsSendingContact(false);
    }
  };

  const handleDeleteListing = async () => {
    if (!window.confirm('Are you sure you want to delete this listing permanently?')) return;
    try {
      setIsDeleting(true);
      await listingsApi.deleteListing(listing._id);
      showSuccess('Listing deleted successfully.');
      navigate('/');
    } catch (err) {
      showError(err.message);
      setIsDeleting(false);
    }
  };

  const handleReviewAdded = (newReview) => {
    setListing((prev) => ({
      ...prev,
      reviews: [newReview, ...(prev.reviews || [])],
    }));
  };

  const handleReviewDeleted = (reviewId) => {
    setListing((prev) => ({
      ...prev,
      reviews: (prev.reviews || []).filter((r) => r._id !== reviewId),
    }));
  };

  const handleReplyUpdated = (reviewId, reply) => {
    setListing((prev) => ({
      ...prev,
      reviews: (prev.reviews || []).map((r) =>
        r._id === reviewId ? { ...r, ownerReply: reply } : r
      ),
    }));
  };

  const reviews = listing.reviews || [];
  const validRatings = reviews
    .map((r) => (typeof r === 'object' ? r.rating : 0))
    .filter((r) => r > 0);
  const averageRating =
    validRatings.length > 0
      ? (validRatings.reduce((sum, r) => sum + r, 0) / validRatings.length).toFixed(2)
      : null;

  return (
    <div className="w-full max-w-[1180px] mx-auto space-y-6 text-vistaro-primary transition-colors duration-200">

      {/* 1. Breadcrumb Navigation */}
      <nav className="flex items-center gap-1.5 text-body-sm text-vistaro-muted">
        <Link to="/" className="hover:underline hover:text-vistaro-primary">
          All Listings
        </Link>
        {listing.category && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-vistaro-muted" />
            <Link to={`/?category=${encodeURIComponent(listing.category)}`} className="hover:underline hover:text-vistaro-primary">
              {listing.category}
            </Link>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5 text-vistaro-muted" />
        <span className="text-vistaro-primary font-medium truncate max-w-xs">{listing.title}</span>
      </nav>

      {/* 2. Header Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-display-hero text-vistaro-primary">
            {listing.title}
          </h1>
          <p className="text-body-sm text-vistaro-secondary mt-1 flex items-center gap-1">
            <MapPin className="w-4 h-4 text-vistaro-accent shrink-0" />
            <span>{listing.location}, {listing.country}</span>
            {averageRating && (
              <>
                <span className="mx-1">&middot;</span>
                <Star className="w-3.5 h-3.5 fill-vistaro-rating text-vistaro-rating" />
                <span className="text-rating text-vistaro-primary">{averageRating}</span>
                <span className="text-muted">({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
              </>
            )}
          </p>
        </div>

        {/* Actions buttons */}
        <div className="flex items-center gap-2">
          {/* Owner controls */}
          {isOwner && (
            <>
              <Link
                to={`/listings/${listing._id}/edit`}
                className="flex items-center gap-1.5 text-cta px-3.5 py-2 rounded-full border border-vistaro-border hover:bg-vistaro-secondary text-vistaro-primary transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit
              </Link>
              <button
                onClick={handleDeleteListing}
                disabled={isDeleting}
                className="flex items-center gap-1.5 text-cta px-3.5 py-2 rounded-full border border-vistaro-error/30 text-vistaro-error hover:bg-vistaro-secondary transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </>
          )}

          {/* Share */}
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 text-cta px-3.5 py-2 rounded-full border border-vistaro-border hover:bg-vistaro-secondary text-vistaro-primary transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" /> Share
          </button>

          {/* Add to Travel Plan */}
          <button
            onClick={() => {
              if (!user) {
                navigate('/login');
                return;
              }
              setIsPlanModalOpen(true);
            }}
            className="flex items-center gap-1.5 text-cta px-3.5 py-2 rounded-full border border-vistaro-border hover:bg-vistaro-secondary text-vistaro-primary transition-colors cursor-pointer"
            title="Add to Travel Plan"
          >
            <Compass className="w-3.5 h-3.5 text-[#FF385C]" />
            <span>Add to Plan</span>
          </button>

          {/* Wishlist */}
          <button
            onClick={handleWishlistToggle}
            className={`flex items-center gap-1.5 text-cta px-3.5 py-2 rounded-full border transition-colors cursor-pointer ${isSaved
                ? 'border-vistaro-accent bg-vistaro-secondary text-vistaro-accent'
                : 'border-vistaro-border hover:bg-vistaro-secondary text-vistaro-secondary hover:text-vistaro-primary'
              }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-vistaro-accent text-vistaro-accent' : ''}`} />
            <span>{isSaved ? 'Saved' : 'Save'}</span>
          </button>
        </div>
      </div>

      {/* Add to Travel Plan Modal */}
      <AddToPlanModal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        item={listing ? { ...listing, itemType: 'listing' } : null}
      />

      {/* 3. Photo Gallery with Lightbox */}
      <ImageGallery images={listing.images || []} title={listing.title} />

      {/* 4. 2-Column Content Layout (Left: Details, Right: Sticky Booking Widget) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

        {/* Left Column (7 cols) */}
        <div className="lg:col-span-7 space-y-8">

          {/* Host Info Banner */}
          <div className="flex items-center justify-between pb-6 border-b border-vistaro-border">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-vistaro-accent text-white flex items-center justify-center font-semibold text-lg">
                {listing.owner?.username ? listing.owner.username.charAt(0).toUpperCase() : 'H'}
              </div>
              <div>
                <h3 className="text-display-h3 text-vistaro-primary">
                  Hosted by @{listing.owner?.username || 'Host'}
                </h3>
                <p className="text-muted">
                  Max capacity: {listing.maxGuests || 4} guests &middot; {listing.category} stay
                </p>
              </div>
            </div>

            {!isOwner && (
              <button
                onClick={handleContactHost}
                className="flex items-center gap-1.5 text-cta px-4 py-2.5 rounded-full border border-vistaro-border hover:bg-vistaro-secondary text-vistaro-primary transition-colors cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5 text-vistaro-accent" /> Contact Host
              </button>
            )}
          </div>

          {/* Description */}
          <div className="space-y-3 pb-6 border-b border-vistaro-border">
            <h2 className="text-display-h2 text-vistaro-primary">About this place</h2>
            <p className="text-body text-vistaro-secondary leading-relaxed whitespace-pre-line">
              {listing.description}
            </p>
          </div>

          {/* Amenities */}
          <div className="space-y-4 pb-6 border-b border-vistaro-border">
            <h2 className="text-display-h2 text-vistaro-primary">What this place offers</h2>
            {listing.amenities && listing.amenities.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {listing.amenities.map((amenity, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-body-sm text-vistaro-secondary">
                    <Sparkles className="w-4 h-4 text-vistaro-accent" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted">Standard amenities provided by host.</p>
            )}
          </div>

          {/* Location Map */}
          <div className="space-y-4 pb-6 border-b border-vistaro-border">
            <h2 className="text-display-h2 text-vistaro-primary">Where you'll be</h2>
            <p className="text-body-sm text-vistaro-secondary">{listing.location}, {listing.country}</p>
            <MapView
              geometry={listing.geometry}
              title={listing.title}
              location={listing.location}
              country={listing.country}
            />
          </div>

          {/* Reviews Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 fill-vistaro-rating text-vistaro-rating" />
              <h2 className="text-display-h2 text-vistaro-primary">
                {averageRating ? `${averageRating} · ` : ''}
                {reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'}
              </h2>
            </div>

            {/* Review Form */}
            {!isOwner && (
              <ReviewForm listingId={listing._id} onReviewAdded={handleReviewAdded} />
            )}

            {/* Reviews List */}
            {reviews.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {reviews.map((rev) => (
                  <ReviewCard
                    key={rev._id}
                    review={rev}
                    listingId={listing._id}
                    listingOwnerId={typeof listing.owner === 'object' ? listing.owner?._id : listing.owner}
                    onReviewDeleted={handleReviewDeleted}
                    onReplyUpdated={handleReplyUpdated}
                  />
                ))}
              </div>
            ) : (
              <p className="text-body-sm text-vistaro-muted italic">No reviews yet for this listing. Be the first to leave a review!</p>
            )}
          </div>

        </div>

        {/* Right Column (5 cols) - Sticky Booking Widget */}
        <div className="lg:col-span-5">
          <BookingWidget listing={listing} activeBookings={activeBookings} />
        </div>

      </div>

      {/* 5. Similar Listings Section */}
      {similarListings.length > 0 && (
        <div className="mt-16 pt-10 border-t border-vistaro-border space-y-6">
          <h2 className="text-display-h2 text-vistaro-primary">
            Similar stays in "{listing.category || 'Trending'}"
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {similarListings.map((sim) => (
              <ListingCard key={sim._id} listing={sim} />
            ))}
          </div>
        </div>
      )}

      {/* Contact Host Modal */}
      {isContactModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-vistaro-surface rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-vistaro-border space-y-5 relative text-vistaro-primary">

            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsContactModalOpen(false)}
              className="absolute right-5 top-5 p-1.5 rounded-full text-vistaro-muted hover:text-vistaro-primary hover:bg-vistaro-secondary transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {contactSuccess ? (
              /* Success State */
              <div className="text-center py-6 space-y-4 animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-vistaro-secondary text-vistaro-success flex items-center justify-center mx-auto shadow-xs">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-display-h3 text-vistaro-primary">Message Delivered!</h3>
                  <p className="text-body-sm text-vistaro-secondary max-w-xs mx-auto">
                    Your message was sent to <b>@{listing.owner?.username || 'the host'}</b>. You can continue the conversation in your messages inbox.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsContactModalOpen(false);
                      if (conversationId) navigate(`/inbox?conv=${conversationId}`);
                      else navigate('/inbox');
                    }}
                    className="w-full bg-vistaro-accent hover:bg-vistaro-accent-hover text-white text-cta py-3 px-6 rounded-full transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Open Messages Inbox</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsContactModalOpen(false)}
                    className="w-full bg-vistaro-secondary hover:bg-vistaro-main text-vistaro-primary border border-vistaro-border text-cta py-3 px-6 rounded-full transition-colors cursor-pointer"
                  >
                    Back to Stay
                  </button>
                </div>
              </div>
            ) : (
              /* Message Form State */
              <form onSubmit={handleSendContactMessage} className="space-y-4">

                {/* Header info */}
                <div className="flex items-center gap-3.5 pb-4 border-b border-vistaro-border">
                  <div className="w-12 h-12 rounded-full bg-vistaro-accent text-white flex items-center justify-center font-semibold text-base uppercase shrink-0">
                    {(listing.owner?.username || 'H').charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-display-h3 text-vistaro-primary">
                      Contact @{listing.owner?.username || 'Host'}
                    </h3>
                    <p className="text-muted truncate max-w-xs">
                      Inquiring about <span className="font-semibold text-vistaro-primary">{listing.title}</span>
                    </p>
                  </div>
                </div>

                {/* Prompt Suggestions */}
                <div className="space-y-1.5">
                  <label className="text-label text-vistaro-muted">
                    Quick Suggestions
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'Is early check-in possible?',
                      'Can we store our luggage before check-in?',
                      'Is dedicated parking included?',
                      'Is Wi-Fi fast enough for video calls?',
                    ].map((prompt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setContactMessage(prompt)}
                        className="text-caption font-normal bg-vistaro-secondary hover:bg-vistaro-surface hover:text-vistaro-accent border border-vistaro-border hover:border-vistaro-accent rounded-full px-3 py-1 transition-all cursor-pointer text-vistaro-secondary text-left"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message Textarea */}
                <div className="space-y-1.5">
                  <label className="text-label text-vistaro-muted">
                    Your Message
                  </label>
                  <textarea
                    rows={4}
                    value={contactMessage}
                    onChange={(e) => {
                      setContactMessage(e.target.value);
                      if (contactError) setContactError('');
                    }}
                    placeholder={`Hello @${listing.owner?.username || 'Host'}, I have a question about this stay...`}
                    className="w-full bg-vistaro-secondary border border-vistaro-border text-vistaro-primary rounded-2xl p-3.5 text-body-sm focus:outline-hidden focus:bg-vistaro-surface focus:border-vistaro-accent transition-colors resize-none"
                    required
                    maxLength={1000}
                    disabled={isSendingContact}
                  />
                  <div className="flex items-center justify-between text-caption text-vistaro-muted px-1">
                    <span>Be polite and respectful.</span>
                    <span>{contactMessage.length} / 1000</span>
                  </div>
                </div>

                {/* Error Banner */}
                {contactError && (
                  <div className="p-3 rounded-2xl bg-vistaro-secondary border border-vistaro-error/30 flex items-center gap-2 text-body-sm text-vistaro-error animate-fade-in">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span className="flex-1 font-medium">{contactError}</span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsContactModalOpen(false)}
                    disabled={isSendingContact}
                    className="bg-vistaro-secondary hover:bg-vistaro-main text-vistaro-primary border border-vistaro-border text-cta py-3 px-5 rounded-full transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSendingContact || !contactMessage.trim()}
                    className="bg-vistaro-accent hover:bg-vistaro-accent-hover text-white text-cta py-3 px-6 rounded-full transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isSendingContact ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending Message...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Inquiry</span>
                      </>
                    )}
                  </button>
                </div>

              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
