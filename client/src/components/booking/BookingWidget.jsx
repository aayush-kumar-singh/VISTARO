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
      <div className="bg-white rounded-3xl p-6 border border-[#DDDDDD] shadow-lg sticky top-24">
        {/* Price Header */}
        <div className="flex items-baseline justify-between mb-4">
          <div>
            <span className="text-2xl font-bold text-[#222222]">{formatPrice(listing.price)}</span>
            <span className="text-sm text-[#717171]"> / night</span>
          </div>
          <span className="text-xs font-semibold text-zinc-500 capitalize bg-zinc-100 px-2.5 py-1 rounded-full">
            {policyType} policy
          </span>
        </div>

        {isOwner ? (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-xs font-medium mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>You are the host of this stay. Bookings cannot be placed on your own listing.</span>
          </div>
        ) : (
          <form onSubmit={handleOpenSummary} className="space-y-4">
            {/* Dates Input Box */}
            <div className="border border-zinc-300 rounded-2xl overflow-hidden focus-within:border-[#dc3545] transition-colors">
              <div className="grid grid-cols-2 divide-x divide-zinc-300">
                <div className="p-2.5 bg-zinc-50/50">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-0.5">
                    Check-in
                  </label>
                  <input
                    type="date"
                    min={todayStr}
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full bg-transparent text-xs font-semibold text-zinc-800 focus:outline-hidden cursor-pointer"
                    required
                  />
                </div>

                <div className="p-2.5 bg-zinc-50/50">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-0.5">
                    Check-out
                  </label>
                  <input
                    type="date"
                    min={checkIn || todayStr}
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full bg-transparent text-xs font-semibold text-zinc-800 focus:outline-hidden cursor-pointer"
                    required
                  />
                </div>
              </div>

              {/* Guests Selector */}
              <div className="border-t border-zinc-300 p-2.5 bg-zinc-50/50">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-0.5">
                  Guests
                </label>
                <select
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  className="w-full bg-transparent text-xs font-semibold text-zinc-800 focus:outline-hidden cursor-pointer"
                >
                  {Array.from({ length: listing.maxGuests || 4 }).map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1} guest{i > 0 ? 's' : ''} {i + 1 === (listing.maxGuests || 4) ? '(Max)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {hasConflict && (
              <div className="text-xs text-[#dc3545] font-semibold bg-red-50 p-2.5 rounded-xl border border-red-200">
                These dates are already booked. Please choose alternative dates.
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={hasConflict}
              className="w-full bg-[#dc3545] hover:bg-[#b02a37] text-white font-bold py-3.5 px-4 rounded-2xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm"
            >
              Reserve Stay
            </button>
          </form>
        )}

        {/* Pricing Breakdown */}
        {nights > 0 && !hasConflict && (
          <div className="mt-5 pt-4 border-t border-zinc-200 space-y-2 text-xs text-zinc-600">
            <div className="flex justify-between">
              <span>
                {formatPrice(listing.price)} &times; {nights} night{nights > 1 ? 's' : ''}
              </span>
              <span className="font-semibold text-zinc-900">{formatPrice(basePrice)}</span>
            </div>
            <div className="flex justify-between">
              <span>GST (18%)</span>
              <span className="font-semibold text-zinc-900">{formatPrice(gstPrice)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-zinc-900 pt-3 border-t border-zinc-200">
              <span>Total amount</span>
              <span className="text-[#dc3545]">{formatPrice(totalPrice)}</span>
            </div>
          </div>
        )}

        {/* Reassurance Badge */}
        <div className="mt-5 flex items-center justify-center gap-2 text-xs text-zinc-400">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>You can review all details before confirming</span>
        </div>
      </div>

      {/* ======================================================= */}
      {/* BOOKING SUMMARY MODAL (Review Details Before Confirming) */}
      {/* ======================================================= */}
      {showSummaryModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-zinc-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-zinc-200">
              <h2 className="text-lg font-bold text-zinc-900">Review your trip details</h2>
              <button
                type="button"
                onClick={() => setShowSummaryModal(false)}
                className="p-1.5 rounded-full hover:bg-zinc-100 text-zinc-500 transition-colors"
                aria-label="Close summary modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-zinc-800">
              
              {/* Property Summary Card */}
              <div className="flex items-center gap-4 bg-zinc-50 p-4 rounded-2xl border border-zinc-200/80">
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-zinc-200 shrink-0">
                  <img src={primaryImage} alt={listing.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#dc3545]">
                    {listing.category || 'Stay'}
                  </span>
                  <h3 className="font-bold text-sm text-zinc-900 truncate mt-0.5">
                    {listing.title}
                  </h3>
                  <p className="text-xs text-zinc-500 truncate mt-0.5">
                    {listing.location}, {listing.country}
                  </p>
                  <p className="text-xs text-zinc-400 mt-1">
                    Hosted by @{typeof listing.owner === 'object' ? listing.owner?.username : 'Host'}
                  </p>
                </div>
              </div>

              {/* Trip Schedule Grid */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Your reservation
                </h4>
                <div className="grid grid-cols-2 gap-3 bg-white p-3.5 rounded-2xl border border-zinc-200 text-xs">
                  <div>
                    <span className="text-zinc-400 block mb-0.5">Check-in</span>
                    <span className="font-bold text-zinc-900 block">{formattedCheckIn}</span>
                    <span className="text-[11px] text-zinc-500">After 2:00 PM</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block mb-0.5">Check-out</span>
                    <span className="font-bold text-zinc-900 block">{formattedCheckOut}</span>
                    <span className="text-[11px] text-zinc-500">By 11:00 AM</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs px-1 text-zinc-600">
                  <span>Duration: <b>{nights} night{nights > 1 ? 's' : ''}</b></span>
                  <span>Guests: <b>{guests} guest{guests > 1 ? 's' : ''}</b></span>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 pt-4 border-t border-zinc-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Price Breakdown
                </h4>
                <div className="space-y-2 text-xs text-zinc-600 bg-zinc-50 p-4 rounded-2xl border border-zinc-200/80">
                  <div className="flex justify-between">
                    <span>{formatPrice(listing.price)} &times; {nights} night{nights > 1 ? 's' : ''}</span>
                    <span className="font-semibold text-zinc-900">{formatPrice(basePrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST (18%)</span>
                    <span className="font-semibold text-zinc-900">{formatPrice(gstPrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-zinc-900 pt-2 border-t border-zinc-200">
                    <span>Total due</span>
                    <span className="text-[#dc3545] font-extrabold text-base">{formatPrice(totalPrice)}</span>
                  </div>
                </div>
              </div>

              {/* Cancellation Policy Snapshot */}
              <div className="space-y-2 pt-2 border-t border-zinc-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Cancellation Policy
                </h4>
                <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3.5 text-xs text-amber-900">
                  <span className="font-bold capitalize block mb-0.5">{policyType} Policy</span>
                  <p className="text-amber-800 leading-relaxed">
                    {policyDescriptions[policyType] || policyDescriptions.flexible}
                  </p>
                </div>
              </div>

              {/* Email Delivery confirmation */}
              <div className="flex items-center gap-2.5 text-xs text-zinc-500 bg-blue-50/60 p-3 rounded-2xl border border-blue-200/60">
                <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Booking confirmation & receipt will be sent to <b>{user?.email}</b></span>
              </div>

            </div>

            {/* Modal Footer Actions */}
            <div className="flex items-center justify-between p-5 border-t border-zinc-200 bg-zinc-50">
              <button
                type="button"
                onClick={() => setShowSummaryModal(false)}
                disabled={isSubmitting}
                className="text-xs font-semibold text-zinc-600 hover:text-zinc-900 px-4 py-2"
              >
                Edit details
              </button>

              <button
                type="button"
                onClick={handleFinalConfirm}
                disabled={isSubmitting}
                className="bg-[#dc3545] hover:bg-[#b02a37] text-white text-xs sm:text-sm font-bold py-3 px-6 rounded-full transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center gap-2 cursor-pointer"
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
