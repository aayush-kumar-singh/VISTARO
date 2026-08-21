import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCurrency } from '../../context/CurrencyContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { bookingsApi } from '../../api/bookingsApi.js';
import {
  Calendar,
  Users,
  ShieldCheck,
  AlertCircle,
  X,
  CheckCircle2,
  Clock,
  Mail,
  ArrowRight,
} from 'lucide-react';

export default function BookingWidget({ listing, activeBookings = [] }) {
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('1');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);

  const isOwner = user && listing?.owner && (
    (typeof listing.owner === 'object' ? listing.owner._id : listing.owner) === user._id
  );

  // Calculate nights and price
  const { nights, basePrice, gstPrice, totalPrice } = useMemo(() => {
    if (!checkIn || !checkOut) {
      return { nights: 0, basePrice: 0, gstPrice: 0, totalPrice: 0 };
    }

    const start = new Date(checkIn);
    const end = new Date(checkOut);

    if (end <= start) {
      return { nights: 0, basePrice: 0, gstPrice: 0, totalPrice: 0 };
    }

    const diffDays = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24));
    const base = diffDays * (listing.price || 0);
    const gst = Math.round(base * 0.18);
    const total = base + gst;

    return {
      nights: diffDays,
      basePrice: base,
      gstPrice: gst,
      totalPrice: total,
    };
  }, [checkIn, checkOut, listing.price]);

  // Check if chosen dates overlap with activeBookings
  const hasConflict = useMemo(() => {
    if (!checkIn || !checkOut || activeBookings.length === 0) return false;
    const start = new Date(checkIn);
    const end = new Date(checkOut);

    return activeBookings.some((b) => {
      const bStart = new Date(b.checkIn);
      const bEnd = new Date(b.checkOut);
      return start < bEnd && end > bStart;
    });
  }, [checkIn, checkOut, activeBookings]);

  // Step 1: Open Summary Modal
  const handleOpenSummary = (e) => {
    e.preventDefault();

    if (!user) {
      navigate('/login');
      return;
    }

    if (isOwner) {
      showError('You cannot book your own listing!');
      return;
    }

    if (!checkIn || !checkOut) {
      showError('Please select both check-in and check-out dates.');
      return;
    }

    if (nights <= 0) {
      showError('Check-out date must be after check-in date.');
      return;
    }

    if (hasConflict) {
      showError('Selected dates are no longer available. Please choose different dates.');
      return;
    }

    setShowSummaryModal(true);
  };

  // Step 2: Final Confirmation
  const handleFinalConfirm = async () => {
    try {
      setIsSubmitting(true);
      const data = await bookingsApi.createBooking(listing._id, {
        booking: {
          checkIn,
          checkOut,
          guests: parseInt(guests, 10),
        },
      });

      setShowSummaryModal(false);
      showSuccess(data.message || 'Booking confirmed! A receipt was sent to your email.');
      navigate('/profile#upcoming');
    } catch (err) {
      showError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const formattedCheckIn = checkIn
    ? new Date(checkIn).toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
    : '';

  const formattedCheckOut = checkOut
    ? new Date(checkOut).toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
    : '';

  const primaryImage =
    listing.images?.[0]?.url ||
    listing.image?.url ||
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=60';

  const policyDescriptions = {
    flexible: '100% refund up to 48 hours before check-in.',
    moderate: '100% refund up to 5 days before check-in, 50% refund thereafter.',
    strict: '50% refund up to 7 days before check-in.',
  };

  const policyType = listing.cancellationPolicy || 'flexible';

  return (
    <>
      <div className="bg-vistaro-surface rounded-3xl p-6 border border-vistaro-border shadow-lg sticky top-24 transition-colors duration-200">
        {/* Price Header */}
        <div className="flex items-baseline justify-between mb-4">
          <div>
            <span className="text-2xl font-bold text-vistaro-primary">{formatPrice(listing.price)}</span>
            <span className="text-sm text-vistaro-muted"> / night</span>
          </div>
          <span className="text-xs font-semibold text-vistaro-muted capitalize bg-vistaro-secondary px-2.5 py-1 rounded-full border border-vistaro-border">
            {policyType} policy
          </span>
        </div>

        {isOwner ? (
          <div className="p-4 bg-vistaro-secondary border border-vistaro-border rounded-2xl text-vistaro-rating text-xs font-medium mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-vistaro-rating" />
            <span>You are the host of this stay. Bookings cannot be placed on your own listing.</span>
          </div>
        ) : (
          <form onSubmit={handleOpenSummary} className="space-y-4">
            {/* Dates Input Box */}
            <div className="border border-vistaro-border rounded-2xl overflow-hidden focus-within:border-vistaro-accent transition-colors">
              <div className="grid grid-cols-2 divide-x divide-vistaro-border">
                <div className="p-2.5 bg-vistaro-secondary/50">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-vistaro-muted mb-0.5">
                    Check-in
                  </label>
                  <input
                    type="date"
                    min={todayStr}
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full bg-transparent text-xs font-semibold text-vistaro-primary focus:outline-hidden cursor-pointer"
                    required
                  />
                </div>

                <div className="p-2.5 bg-vistaro-secondary/50">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-vistaro-muted mb-0.5">
                    Check-out
                  </label>
                  <input
                    type="date"
                    min={checkIn || todayStr}
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full bg-transparent text-xs font-semibold text-vistaro-primary focus:outline-hidden cursor-pointer"
                    required
                  />
                </div>
              </div>

              {/* Guests Selector */}
              <div className="border-t border-vistaro-border p-2.5 bg-vistaro-secondary/50">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-vistaro-muted mb-0.5">
                  Guests
                </label>
                <select
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  className="w-full bg-transparent text-xs font-semibold text-vistaro-primary focus:outline-hidden cursor-pointer"
                >
                  {Array.from({ length: listing.maxGuests || 4 }).map((_, i) => (
                    <option key={i + 1} value={i + 1} className="bg-vistaro-surface text-vistaro-primary">
                      {i + 1} guest{i > 0 ? 's' : ''} {i + 1 === (listing.maxGuests || 4) ? '(Max)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {hasConflict && (
              <div className="text-xs text-vistaro-error font-semibold bg-vistaro-secondary p-2.5 rounded-xl border border-vistaro-error/30">
                These dates are already booked. Please choose alternative dates.
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={hasConflict}
              className="w-full bg-vistaro-accent hover:bg-vistaro-accent-hover text-white font-bold py-3.5 px-4 rounded-2xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm"
            >
              Reserve Stay
            </button>
          </form>
        )}

        {/* Pricing Breakdown */}
        {nights > 0 && !hasConflict && (
          <div className="mt-5 pt-4 border-t border-vistaro-border space-y-2 text-xs text-vistaro-secondary">
            <div className="flex justify-between">
              <span>
                {formatPrice(listing.price)} &times; {nights} night{nights > 1 ? 's' : ''}
              </span>
              <span className="font-semibold text-vistaro-primary">{formatPrice(basePrice)}</span>
            </div>
            <div className="flex justify-between">
              <span>GST (18%)</span>
              <span className="font-semibold text-vistaro-primary">{formatPrice(gstPrice)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-vistaro-primary pt-3 border-t border-vistaro-border">
              <span>Total amount</span>
              <span className="text-vistaro-accent">{formatPrice(totalPrice)}</span>
            </div>
          </div>
        )}

        {/* Reassurance Badge */}
        <div className="mt-5 flex items-center justify-center gap-2 text-xs text-vistaro-muted">
          <ShieldCheck className="w-4 h-4 text-vistaro-success" />
          <span>You can review all details before confirming</span>
        </div>
      </div>

      {/* ======================================================= */}
      {/* BOOKING SUMMARY MODAL (Review Details Before Confirming) */}
      {/* ======================================================= */}
      {showSummaryModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-vistaro-surface rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-vistaro-border">

            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-vistaro-border">
              <h2 className="text-lg font-bold text-vistaro-primary">Review your trip details</h2>
              <button
                type="button"
                onClick={() => setShowSummaryModal(false)}
                className="p-1.5 rounded-full hover:bg-vistaro-secondary text-vistaro-muted hover:text-vistaro-primary transition-colors cursor-pointer"
                aria-label="Close summary modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-vistaro-primary">

              {/* Property Summary Card */}
              <div className="flex items-center gap-4 bg-vistaro-secondary p-4 rounded-2xl border border-vistaro-border">
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-vistaro-main shrink-0">
                  <img src={primaryImage} alt={listing.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-vistaro-accent">
                    {listing.category || 'Stay'}
                  </span>
                  <h3 className="font-bold text-sm text-vistaro-primary truncate mt-0.5">
                    {listing.title}
                  </h3>
                  <p className="text-xs text-vistaro-muted truncate mt-0.5">
                    {listing.location}, {listing.country}
                  </p>
                  <p className="text-xs text-vistaro-muted mt-1">
                    Hosted by @{typeof listing.owner === 'object' ? listing.owner?.username : 'Host'}
                  </p>
                </div>
              </div>

              {/* Trip Schedule Grid */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-vistaro-muted">
                  Your reservation
                </h4>
                <div className="grid grid-cols-2 gap-3 bg-vistaro-surface p-3.5 rounded-2xl border border-vistaro-border text-xs">
                  <div>
                    <span className="text-vistaro-muted block mb-0.5">Check-in</span>
                    <span className="font-bold text-vistaro-primary block">{formattedCheckIn}</span>
                    <span className="text-[11px] text-vistaro-muted">After 2:00 PM</span>
                  </div>
                  <div>
                    <span className="text-vistaro-muted block mb-0.5">Check-out</span>
                    <span className="font-bold text-vistaro-primary block">{formattedCheckOut}</span>
                    <span className="text-[11px] text-vistaro-muted">By 11:00 AM</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs px-1 text-vistaro-secondary">
                  <span>Duration: <b className="text-vistaro-primary">{nights} night{nights > 1 ? 's' : ''}</b></span>
                  <span>Guests: <b className="text-vistaro-primary">{guests} guest{guests > 1 ? 's' : ''}</b></span>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 pt-4 border-t border-vistaro-border">
                <h4 className="text-xs font-bold uppercase tracking-wider text-vistaro-muted">
                  Price Breakdown
                </h4>
                <div className="space-y-2 text-xs text-vistaro-secondary bg-vistaro-secondary p-4 rounded-2xl border border-vistaro-border">
                  <div className="flex justify-between">
                    <span>{formatPrice(listing.price)} &times; {nights} night{nights > 1 ? 's' : ''}</span>
                    <span className="font-semibold text-vistaro-primary">{formatPrice(basePrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST (18%)</span>
                    <span className="font-semibold text-vistaro-primary">{formatPrice(gstPrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-vistaro-primary pt-2 border-t border-vistaro-border">
                    <span>Total due</span>
                    <span className="text-vistaro-accent font-extrabold text-base">{formatPrice(totalPrice)}</span>
                  </div>
                </div>
              </div>

              {/* Cancellation Policy Snapshot */}
              <div className="space-y-2 pt-2 border-t border-vistaro-border">
                <h4 className="text-xs font-bold uppercase tracking-wider text-vistaro-muted">
                  Cancellation Policy
                </h4>
                <div className="bg-vistaro-secondary border border-vistaro-border rounded-2xl p-3.5 text-xs text-vistaro-primary">
                  <span className="font-bold capitalize block mb-0.5 text-vistaro-accent">{policyType} Policy</span>
                  <p className="text-vistaro-secondary leading-relaxed">
                    {policyDescriptions[policyType] || policyDescriptions.flexible}
                  </p>
                </div>
              </div>

              {/* Email Delivery confirmation */}
              <div className="flex items-center gap-2.5 text-xs text-vistaro-secondary bg-vistaro-secondary p-3 rounded-2xl border border-vistaro-border">
                <Mail className="w-4 h-4 text-vistaro-accent shrink-0" />
                <span>Booking confirmation & receipt will be sent to <b className="text-vistaro-primary">{user?.email}</b></span>
              </div>

            </div>

            {/* Modal Footer Actions */}
            <div className="flex items-center justify-between p-5 border-t border-vistaro-border bg-vistaro-secondary">
              <button
                type="button"
                onClick={() => setShowSummaryModal(false)}
                disabled={isSubmitting}
                className="text-xs font-semibold text-vistaro-secondary hover:text-vistaro-primary px-4 py-2 cursor-pointer"
              >
                Edit details
              </button>

              <button
                type="button"
                onClick={handleFinalConfirm}
                disabled={isSubmitting}
                className="bg-vistaro-accent hover:bg-vistaro-accent-hover text-white text-xs sm:text-sm font-bold py-3 px-6 rounded-full transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                <span>{isSubmitting ? 'Confirming Stay...' : `Confirm & Pay ${formatPrice(totalPrice)}`}</span>
                {!isSubmitting && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
