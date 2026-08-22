import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { bookingsApi } from '../api/bookingsApi.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useCurrency } from '../context/CurrencyContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  CreditCard,
  Compass,
  Home,
  Sparkles,
  ExternalLink,
  Info,
  CalendarCheck,
  AlertTriangle,
  Receipt,
  User as UserIcon,
} from 'lucide-react';

export default function BookingDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cancellation Modal state
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);

  const loadBooking = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await bookingsApi.getBookingById(id);
      if (data.success) {
        setBooking(data.booking);
      } else {
        setError(data.error || 'Reservation not found.');
      }
    } catch (err) {
      console.error('Failed to load booking detail:', err);
      setError(err.response?.data?.error || err.message || 'Unable to retrieve reservation.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadBooking();
    }
  }, [id]);

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading reservation details..." />;
  }

  if (error || !booking) {
    return (
      <div className="max-w-2xl mx-auto my-16 p-8 bg-vistaro-surface border border-vistaro-border rounded-3xl text-center space-y-5 shadow-sm text-vistaro-primary animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-vistaro-error/10 text-vistaro-error flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-display-h2 text-xl text-vistaro-primary">Reservation Not Found</h2>
          <p className="text-body-sm text-vistaro-muted mt-1.5 max-w-md mx-auto">
            {error || 'The requested booking could not be found or you do not have permission to view it.'}
          </p>
        </div>
        <div className="pt-2 flex items-center justify-center gap-3">
          <Link
            to="/my-bookings"
            className="inline-flex items-center gap-2 bg-vistaro-accent hover:bg-vistaro-accent-hover text-white text-cta py-2.5 px-6 rounded-full transition-colors cursor-pointer shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" /> Back to My Bookings
          </Link>
        </div>
      </div>
    );
  }

  // Calculate live cancellation refund preview
  const calculateRefundPreview = () => {
    const policy = booking.pricing?.policySnapshot || 'flexible';
    const checkInTime = new Date(booking.dates?.checkIn).getTime();
    const now = Date.now();
    const hoursUntilCheckIn = (checkInTime - now) / (1000 * 60 * 60);

    let percent = 0;
    if (policy === 'strict') {
      if (hoursUntilCheckIn >= 168) percent = 50;
      else percent = 0;
    } else if (policy === 'moderate') {
      if (hoursUntilCheckIn >= 120) percent = 100;
      else if (hoursUntilCheckIn >= 48) percent = 50;
      else percent = 0;
    } else {
      // Flexible
      if (hoursUntilCheckIn >= 48) percent = 100;
      else percent = 0;
    }

    const eligibleRefund = Math.round(((booking.pricing?.totalPrice || 0) * percent) / 100);
    return { percent, eligibleRefund, hoursUntilCheckIn: Math.max(0, Math.round(hoursUntilCheckIn)) };
  };

  const refundPreview = calculateRefundPreview();

  const handleConfirmCancel = async () => {
    try {
      setIsSubmittingCancel(true);
      const data = await bookingsApi.cancelBooking(booking._id, {
        reason: cancelReason,
      });

      if (data.success) {
        showSuccess(data.message || 'Reservation cancelled successfully.');
        setIsCancelModalOpen(false);
        setCancelReason('');
        loadBooking();
      }
    } catch (err) {
      console.error('Cancellation failed:', err);
      showError(err.response?.data?.error || err.message || 'Failed to cancel reservation.');
    } finally {
      setIsSubmittingCancel(false);
    }
  };

  const isStay = booking.bookingType === 'stay';
  const isPackage = booking.bookingType === 'package';
  const isExperience = booking.bookingType === 'experience';

  const checkInDate = new Date(booking.dates?.checkIn).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const checkOutDate = new Date(booking.dates?.checkOut).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="w-full space-y-8 pb-16 animate-fade-in text-vistaro-primary">
      {/* 1. Top Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-vistaro-border pb-4">
        <Link
          to="/my-bookings"
          className="inline-flex items-center gap-2 text-nav-link text-vistaro-secondary hover:text-vistaro-accent transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Bookings</span>
        </Link>

        <div className="flex items-center gap-3">
          <span className="text-caption text-vistaro-muted font-mono">
            REF: #{booking._id}
          </span>
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
              booking.status === 'upcoming'
                ? 'bg-vistaro-accent/10 text-vistaro-accent border-vistaro-accent/20'
                : booking.status === 'completed'
                ? 'bg-vistaro-secondary text-vistaro-muted border-vistaro-border'
                : 'bg-vistaro-error/10 text-vistaro-error border-vistaro-error/20'
            }`}
          >
            {booking.status === 'upcoming' && <CheckCircle2 className="w-3.5 h-3.5" />}
            {booking.status === 'completed' && <Clock className="w-3.5 h-3.5" />}
            {booking.status === 'cancelled' && <XCircle className="w-3.5 h-3.5" />}
            <span className="capitalize">{booking.status}</span>
          </span>
        </div>
      </div>

      {/* 2. Cancellation Banner (If Cancelled) */}
      {booking.isCancelled && (
        <div className="bg-vistaro-error/10 border border-vistaro-error/30 rounded-3xl p-6 shadow-xs space-y-3">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-full bg-vistaro-error/20 text-vistaro-error flex items-center justify-center shrink-0 mt-0.5">
              <XCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-display-h3 text-lg text-vistaro-error">Reservation Cancelled</h2>
              <p className="text-body-sm text-vistaro-primary">
                This booking was cancelled on{' '}
                <b>
                  {booking.cancellation?.cancelledAt
                    ? new Date(booking.cancellation.cancelledAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'record'}
                </b>
                .
              </p>
              <div className="flex flex-wrap gap-4 pt-2 text-body-sm">
                <div>
                  <span className="text-vistaro-muted">Refund Rate:</span>{' '}
                  <span className="font-bold text-vistaro-primary">{booking.cancellation?.refundPercentage || 0}%</span>
                </div>
                <div>
                  <span className="text-vistaro-muted">Refund Issued:</span>{' '}
                  <span className="font-bold text-vistaro-success">
                    {formatPrice(booking.cancellation?.refundAmount || 0)}
                  </span>
                </div>
                {booking.cancellation?.reason && (
                  <div className="w-full text-xs text-vistaro-secondary italic bg-vistaro-surface/50 p-2.5 rounded-xl border border-vistaro-border">
                    Reason: "{booking.cancellation.reason}"
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* LEFT / CENTER: Booking & Item Details (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Item Hero Card */}
          <div className="bg-vistaro-surface border border-vistaro-border rounded-3xl overflow-hidden shadow-xs">
            <div className="relative aspect-16/9 bg-vistaro-secondary overflow-hidden">
              <img
                src={booking.item?.coverImage}
                alt={booking.item?.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4">
                <span
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md border shadow-xs ${
                    isStay
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : isPackage
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                  }`}
                >
                  {isStay && <Home className="w-3.5 h-3.5" />}
                  {isPackage && <Compass className="w-3.5 h-3.5" />}
                  {isExperience && <Sparkles className="w-3.5 h-3.5" />}
                  <span>{booking.item?.typeLabel}</span>
                </span>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <h1 className="text-display-hero text-xl sm:text-2xl text-vistaro-primary">
                    {booking.item?.title}
                  </h1>
                  {booking.item?.location && (
                    <p className="text-body-sm text-vistaro-muted mt-1 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-vistaro-accent shrink-0" />
                      <span>{booking.item.location}</span>
                    </p>
                  )}
                </div>

                <Link
                  to={booking.item?.detailUrl}
                  className="inline-flex items-center gap-1.5 bg-vistaro-surface hover:bg-vistaro-secondary border border-vistaro-border text-vistaro-primary hover:text-vistaro-accent text-cta text-xs py-2 px-4 rounded-full transition-all shadow-xs shrink-0"
                >
                  <span>View Listing Page</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Host / Owner Info if present */}
              {booking.item?.hostOrOwner && (
                <div className="flex items-center gap-3 p-3 bg-vistaro-secondary rounded-2xl border border-vistaro-border text-body-sm">
                  <div className="w-8 h-8 rounded-full bg-vistaro-accent text-white flex items-center justify-center font-bold text-xs">
                    {booking.item.hostOrOwner.username?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="text-vistaro-muted">Hosted by </span>
                    <span className="font-semibold text-vistaro-primary">{booking.item.hostOrOwner.username}</span>
                  </div>
                </div>
              )}

              {/* Meeting Point / Check-In Instructions */}
              {booking.item?.meetingPoint && (
                <div className="p-4 bg-vistaro-secondary/60 rounded-2xl border border-vistaro-border space-y-1 text-body-sm">
                  <div className="text-label text-vistaro-primary font-semibold flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-vistaro-accent" />
                    <span>{isStay ? 'Property Address' : 'Meeting / Departure Point'}</span>
                  </div>
                  <p className="text-vistaro-secondary text-sm pl-5.5">
                    {booking.item.meetingPoint}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Schedule & Itinerary Box */}
          <div className="bg-vistaro-surface border border-vistaro-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
            <h2 className="text-display-h3 text-lg text-vistaro-primary flex items-center gap-2">
              <Calendar className="w-5 h-5 text-vistaro-accent" />
              <span>Reservation Schedule</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-vistaro-secondary rounded-2xl border border-vistaro-border space-y-1">
                <div className="text-caption text-vistaro-muted uppercase tracking-wider font-semibold">
                  {isExperience ? 'Activity Date' : 'Check-In / Departure'}
                </div>
                <div className="text-body font-bold text-vistaro-primary">
                  {checkInDate}
                </div>
                <div className="text-xs text-vistaro-secondary">
                  {isExperience ? 'Arrival: 15 mins prior' : 'From 2:00 PM'}
                </div>
              </div>

              {!isExperience && (
                <div className="p-4 bg-vistaro-secondary rounded-2xl border border-vistaro-border space-y-1">
                  <div className="text-caption text-vistaro-muted uppercase tracking-wider font-semibold">
                    Check-Out / Return
                  </div>
                  <div className="text-body font-bold text-vistaro-primary">
                    {checkOutDate}
                  </div>
                  <div className="text-xs text-vistaro-secondary">
                    Until 11:00 AM
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-vistaro-border text-body-sm">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-vistaro-muted" />
                <span className="text-vistaro-muted">Total Duration:</span>
                <span className="font-semibold text-vistaro-primary">{booking.dates?.durationSummary}</span>
              </div>

              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-vistaro-muted" />
                <span className="text-vistaro-muted">Party Size:</span>
                <span className="font-semibold text-vistaro-primary">{booking.guests?.label}</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Price Receipt, Cancellation Rules & Action (1 Col) */}
        <div className="space-y-6">
          {/* Price Breakdown Card */}
          <div className="bg-vistaro-surface border border-vistaro-border rounded-3xl p-6 space-y-5 shadow-xs">
            <h2 className="text-display-h3 text-lg text-vistaro-primary flex items-center gap-2">
              <Receipt className="w-5 h-5 text-vistaro-accent" />
              <span>Payment Receipt</span>
            </h2>

            <div className="space-y-2.5 text-body-sm border-b border-vistaro-border pb-4">
              <div className="flex items-center justify-between text-vistaro-secondary">
                <span>Base Fare</span>
                <span>{formatPrice(booking.pricing?.basePrice || 0)}</span>
              </div>
              <div className="flex items-center justify-between text-vistaro-secondary">
                <span>Goods & Services Tax (GST 18%)</span>
                <span>{formatPrice(booking.pricing?.gstPrice || 0)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <div className="text-2xs uppercase text-vistaro-muted font-semibold tracking-wider">
                  Total Paid
                </div>
                <div className="text-price text-2xl font-bold text-vistaro-primary">
                  {formatPrice(booking.pricing?.totalPrice || 0)}
                </div>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1 text-2xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20">
                  <ShieldCheck className="w-3 h-3" /> Paid in Full
                </span>
              </div>
            </div>
          </div>

          {/* Cancellation Policy & Action Card */}
          <div className="bg-vistaro-surface border border-vistaro-border rounded-3xl p-6 space-y-5 shadow-xs">
            <div className="flex items-center justify-between">
              <h2 className="text-display-h3 text-base text-vistaro-primary flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-vistaro-accent" />
                <span>Cancellation Policy</span>
              </h2>
              <span className="capitalize text-xs font-bold px-2.5 py-0.5 rounded-full bg-vistaro-secondary border border-vistaro-border text-vistaro-primary">
                {booking.pricing?.policySnapshot || 'flexible'}
              </span>
            </div>

            <div className="text-xs text-vistaro-secondary bg-vistaro-secondary p-3.5 rounded-2xl border border-vistaro-border space-y-2">
              {booking.pricing?.policySnapshot === 'strict' ? (
                <p>
                  <b>Strict Policy:</b> Full refund up to 7 days before departure/check-in (minus fees). 50% refund between 7 days and 48 hours. Non-refundable within 48 hours.
                </p>
              ) : booking.pricing?.policySnapshot === 'moderate' ? (
                <p>
                  <b>Moderate Policy:</b> 100% refund up to 5 days before check-in. 50% refund between 5 days and 48 hours. Non-refundable within 48 hours.
                </p>
              ) : (
                <p>
                  <b>Flexible Policy:</b> Full 100% refund for cancellations made at least 48 hours before check-in. Non-refundable after that.
                </p>
              )}

              {booking.status === 'upcoming' && (
                <div className="pt-2 border-t border-vistaro-border/60 text-vistaro-primary font-medium">
                  Current Notice: <b>{refundPreview.hoursUntilCheckIn} hours</b> &rarr; Eligible Refund:{' '}
                  <span className="font-bold text-vistaro-success">
                    {refundPreview.percent}% ({formatPrice(refundPreview.eligibleRefund)})
                  </span>
                </div>
              )}
            </div>

            {/* Cancel Action Button (If Upcoming) */}
            {booking.status === 'upcoming' && (
              <button
                type="button"
                onClick={() => setIsCancelModalOpen(true)}
                className="w-full bg-vistaro-error/10 hover:bg-vistaro-error hover:text-white text-vistaro-error border border-vistaro-error/30 text-cta py-3 px-4 rounded-2xl transition-all cursor-pointer shadow-xs flex items-center justify-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                <span>Cancel Reservation</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4. Cancellation Confirmation Modal */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-vistaro-surface rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-vistaro-border space-y-5 text-vistaro-primary animate-scale-up">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-vistaro-error/10 text-vistaro-error flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-display-h3 text-lg text-vistaro-primary">Cancel Reservation</h2>
                <p className="text-caption text-vistaro-muted">Confirmation & Refund Breakdown</p>
              </div>
            </div>

            <p className="text-body-sm text-vistaro-secondary">
              Are you sure you want to cancel your reservation for <b>{booking.item?.title}</b>?
            </p>

            {/* Live Refund Calculation Summary */}
            <div className="bg-vistaro-secondary p-4 rounded-2xl border border-vistaro-border space-y-2 text-body-sm">
              <div className="flex items-center justify-between">
                <span className="text-vistaro-muted">Policy Applied:</span>
                <span className="font-semibold capitalize text-vistaro-primary">{booking.pricing?.policySnapshot || 'flexible'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-vistaro-muted">Notice Given:</span>
                <span className="font-semibold text-vistaro-primary">{refundPreview.hoursUntilCheckIn} hours before start</span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-vistaro-border">
                <span className="font-semibold text-vistaro-primary">Refund Rate:</span>
                <span className="font-bold text-vistaro-success">{refundPreview.percent}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-vistaro-primary">Refund Amount:</span>
                <span className="font-bold text-vistaro-success text-base">
                  {formatPrice(refundPreview.eligibleRefund)}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-label text-vistaro-primary mb-1.5 font-medium">
                Reason for cancellation (optional)
              </label>
              <textarea
                rows={2}
                placeholder="Let the host know why plans changed..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full bg-vistaro-secondary border border-vistaro-border text-vistaro-primary rounded-xl p-3 text-body-sm focus:outline-hidden focus:bg-vistaro-surface focus:border-vistaro-accent"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsCancelModalOpen(false)}
                disabled={isSubmittingCancel}
                className="text-cta px-4 py-2.5 text-vistaro-secondary hover:text-vistaro-primary cursor-pointer"
              >
                Keep Reservation
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={isSubmittingCancel}
                className="bg-vistaro-error hover:bg-vistaro-accent-hover text-white text-cta px-6 py-2.5 rounded-full transition-colors cursor-pointer shadow-xs disabled:opacity-50"
              >
                {isSubmittingCancel ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
