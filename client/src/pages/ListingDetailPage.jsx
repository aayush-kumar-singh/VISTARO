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
import {
  Share2,
  Heart,
  Edit3,
  Trash2,
  MessageSquare,
  Users,
  Wifi,
  Sparkles,
  ShieldCheck,
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
      <div className="text-center py-20 bg-zinc-50 rounded-3xl border border-zinc-200">
        <ShieldAlert className="w-12 h-12 text-[#dc3545] mx-auto mb-3" />
        <h2 className="text-xl font-bold text-zinc-900 mb-2">Property Not Found</h2>
        <p className="text-sm text-zinc-500 mb-6">{error || "The listing you requested doesn't exist or was removed."}</p>
        <Link
          to="/"
          className="bg-[#222222] hover:bg-black text-white text-xs font-bold py-3 px-6 rounded-full transition-colors"
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
    <div className="w-full max-w-[1180px] mx-auto space-y-6">
      
      {/* 1. Breadcrumb Navigation */}
      <nav className="flex items-center gap-1.5 text-xs text-zinc-500">
        <Link to="/" className="hover:underline hover:text-zinc-900">
          All Listings
        </Link>
        {listing.category && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
            <Link to={`/?category=${encodeURIComponent(listing.category)}`} className="hover:underline hover:text-zinc-900">
              {listing.category}
            </Link>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
        <span className="text-zinc-800 font-medium truncate max-w-xs">{listing.title}</span>
      </nav>

      {/* 2. Header Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#222222] tracking-tight">
            {listing.title}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 mt-1 flex items-center gap-1">
            <MapPin className="w-4 h-4 text-[#dc3545] shrink-0" />
            <span>{listing.location}, {listing.country}</span>
            {averageRating && (
              <>
                <span className="mx-1">&middot;</span>
                <Star className="w-3.5 h-3.5 fill-[#222222] text-[#222222]" />
                <span className="font-bold text-zinc-900">{averageRating}</span>
                <span className="text-zinc-500">({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
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
                className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-full border border-zinc-300 hover:bg-zinc-100 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit
              </Link>
              <button
                onClick={handleDeleteListing}
                disabled={isDeleting}
                className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-full border border-red-200 text-[#dc3545] hover:bg-red-50 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </>
          )}

          {/* Share */}
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-full border border-zinc-300 hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" /> Share
          </button>

          {/* Wishlist */}
          <button
            onClick={handleWishlistToggle}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-full border transition-colors cursor-pointer ${
              isSaved
                ? 'border-red-200 bg-red-50 text-[#dc3545]'
                : 'border-zinc-300 hover:bg-zinc-100 text-zinc-700'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-[#dc3545] text-[#dc3545]' : ''}`} />
            <span>{isSaved ? 'Saved' : 'Save'}</span>
          </button>
        </div>
      </div>

      {/* 3. Photo Gallery with Lightbox */}
      <ImageGallery images={listing.images || []} title={listing.title} />

      {/* 4. 2-Column Content Layout (Left: Details, Right: Sticky Booking Widget) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        
        {/* Left Column (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Host Info Banner */}
          <div className="flex items-center justify-between pb-6 border-b border-zinc-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#222222] text-white flex items-center justify-center font-bold text-lg">
                {listing.owner?.username ? listing.owner.username.charAt(0).toUpperCase() : 'H'}
              </div>
              <div>
                <h3 className="font-bold text-base text-zinc-900">
                  Hosted by @{listing.owner?.username || 'Host'}
                </h3>
                <p className="text-xs text-zinc-500">
                  Max capacity: {listing.maxGuests || 4} guests &middot; {listing.category} stay
                </p>
              </div>
            </div>

            {!isOwner && (
              <button
                onClick={handleContactHost}
                className="flex items-center gap-1.5 text-xs font-bold px-4 py-2.5 rounded-full border border-zinc-800 hover:bg-zinc-100 transition-colors cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#dc3545]" /> Contact Host
              </button>
            )}
          </div>

          {/* Description */}
          <div className="space-y-3 pb-6 border-b border-zinc-200">
            <h3 className="font-bold text-lg text-zinc-900">About this place</h3>
            <p className="text-sm text-zinc-700 leading-relaxed whitespace-pre-line">
              {listing.description}
            </p>
          </div>

          {/* Amenities */}
          <div className="space-y-4 pb-6 border-b border-zinc-200">
            <h3 className="font-bold text-lg text-zinc-900">What this place offers</h3>
            {listing.amenities && listing.amenities.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {listing.amenities.map((amenity, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-sm text-zinc-700">
                    <Sparkles className="w-4 h-4 text-[#dc3545]" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-400">Standard amenities provided by host.</p>
            )}
          </div>

          {/* Location Map */}
          <div className="space-y-4 pb-6 border-b border-zinc-200">
            <h3 className="font-bold text-lg text-zinc-900">Where you'll be</h3>
            <p className="text-sm text-zinc-600">{listing.location}, {listing.country}</p>
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
              <Star className="w-5 h-5 fill-[#222222] text-[#222222]" />
              <h3 className="font-bold text-xl text-zinc-900">
                {averageRating ? `${averageRating} · ` : ''}
                {reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'}
              </h3>
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
              <p className="text-xs text-zinc-500 italic">No reviews yet for this listing. Be the first to leave a review!</p>
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
        <div className="mt-16 pt-10 border-t border-zinc-200 space-y-6">
          <h3 className="font-bold text-xl text-zinc-900">
            Similar stays in "{listing.category || 'Trending'}"
          </h3>
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
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-zinc-200 space-y-5 relative">
            
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsContactModalOpen(false)}
              className="absolute right-5 top-5 p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {contactSuccess ? (
              /* Success State */
              <div className="text-center py-6 space-y-4 animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-extrabold text-zinc-900">Message Delivered!</h3>
                  <p className="text-xs sm:text-sm text-zinc-600 max-w-xs mx-auto">
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
                    className="w-full bg-[#dc3545] hover:bg-[#b02a37] text-white text-xs font-bold py-3 px-6 rounded-full transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Open Messages Inbox</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsContactModalOpen(false)}
                    className="w-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold py-3 px-6 rounded-full transition-colors cursor-pointer"
                  >
                    Back to Stay
                  </button>
                </div>
              </div>
            ) : (
              /* Message Form State */
              <form onSubmit={handleSendContactMessage} className="space-y-4">
                
                {/* Header info */}
                <div className="flex items-center gap-3.5 pb-4 border-b border-zinc-100">
                  <div className="w-12 h-12 rounded-full bg-[#222222] text-white flex items-center justify-center font-bold text-base uppercase shrink-0">
                    {(listing.owner?.username || 'H').charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-zinc-900">
                      Contact @{listing.owner?.username || 'Host'}
                    </h3>
                    <p className="text-xs text-zinc-500 truncate max-w-xs">
                      Inquiring about <span className="font-semibold text-zinc-700">{listing.title}</span>
                    </p>
                  </div>
                </div>

                {/* Prompt Suggestions */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
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
                        className="text-[11px] font-medium bg-zinc-50 hover:bg-red-50 hover:text-[#dc3545] border border-zinc-200 hover:border-red-200 rounded-full px-3 py-1 transition-all cursor-pointer text-zinc-600 text-left"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message Textarea */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
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
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl p-3.5 text-xs sm:text-sm focus:outline-hidden focus:bg-white focus:border-[#dc3545] transition-colors resize-none"
                    required
                    maxLength={1000}
                    disabled={isSendingContact}
                  />
                  <div className="flex items-center justify-between text-[10px] text-zinc-400 px-1">
                    <span>Be polite and respectful.</span>
                    <span>{contactMessage.length} / 1000</span>
                  </div>
                </div>

                {/* Error Banner */}
                {contactError && (
                  <div className="p-3 rounded-2xl bg-red-50 border border-red-200 flex items-center gap-2 text-xs text-[#dc3545] animate-fade-in">
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
                    className="bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold py-3 px-5 rounded-full transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSendingContact || !contactMessage.trim()}
                    className="bg-[#dc3545] hover:bg-[#b02a37] text-white text-xs font-bold py-3 px-6 rounded-full transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
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
