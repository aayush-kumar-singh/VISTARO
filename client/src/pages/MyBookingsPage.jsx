import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { bookingsApi } from '../api/bookingsApi.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useCurrency } from '../context/CurrencyContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import {
  CalendarCheck,
  Calendar,
  Clock,
  MapPin,
  Users,
  Compass,
  Home,
  Sparkles,
  ArrowRight,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ShieldCheck,
  Filter,
  ExternalLink,
} from 'lucide-react';

export default function MyBookingsPage() {
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const { showError } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [bookings, setBookings] = useState([]);
  const [counts, setCounts] = useState({
    total: 0,
    upcoming: 0,
    completed: 0,
    cancelled: 0,
    stays: 0,
    packages: 0,
    experiences: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters state
  const activeStatus = searchParams.get('status') || 'all';
  const activeType = searchParams.get('type') || 'all';
  const [searchQuery, setSearchQuery] = useState('');

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {};
      if (activeStatus !== 'all') params.status = activeStatus;
      if (activeType !== 'all') params.type = activeType;

      const data = await bookingsApi.getMyBookings(params);
      if (data.success) {
        setBookings(data.bookings || []);
        if (data.counts) {
          setCounts(data.counts);
        }
      }
    } catch (err) {
      console.error('Failed to load my bookings:', err);
      setError(err.message || 'Unable to retrieve your bookings. Please try again.');
      showError(err.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [activeStatus, activeType]);

  const handleStatusChange = (status) => {
    const next = new URLSearchParams(searchParams);
    if (status === 'all') {
      next.delete('status');
    } else {
      next.set('status', status);
    }
    setSearchParams(next);
  };

  const handleTypeChange = (type) => {
    const next = new URLSearchParams(searchParams);
    if (type === 'all') {
      next.delete('type');
    } else {
      next.set('type', type);
    }
    setSearchParams(next);
  };

  // Client-side search filtering by item title or location
  const filteredBookings = useMemo(() => {
    if (!searchQuery.trim()) return bookings;
    const q = searchQuery.toLowerCase().trim();
    return bookings.filter(
      (b) =>
        b.item?.title?.toLowerCase().includes(q) ||
        b.item?.location?.toLowerCase().includes(q) ||
        b.item?.typeLabel?.toLowerCase().includes(q)
    );
  }, [bookings, searchQuery]);

  const getTypeBadgeDetails = (type) => {
    switch (type) {
      case 'stay':
        return {
          label: 'Stay / Villa',
          icon: Home,
          className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
        };
      case 'package':
        return {
          label: 'Tour Package',
          icon: Compass,
          className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
        };
      case 'experience':
        return {
          label: 'Host Experience',
          icon: Sparkles,
          className: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
        };
      default:
        return {
          label: 'Reservation',
          icon: CalendarCheck,
          className: 'bg-vistaro-secondary text-vistaro-secondary border-vistaro-border',
        };
    }
  };

  const getStatusBadgeDetails = (status) => {
    switch (status) {
      case 'upcoming':
        return {
          label: 'Upcoming',
          icon: CheckCircle2,
          className: 'bg-vistaro-accent/10 text-vistaro-accent border-vistaro-accent/20',
        };
      case 'completed':
        return {
          label: 'Completed',
          icon: Clock,
          className: 'bg-vistaro-secondary text-vistaro-muted border-vistaro-border',
        };
      case 'cancelled':
        return {
          label: 'Cancelled',
          icon: XCircle,
          className: 'bg-vistaro-error/10 text-vistaro-error border-vistaro-error/20',
        };
      default:
        return {
          label: status,
          icon: AlertCircle,
          className: 'bg-vistaro-secondary text-vistaro-secondary border-vistaro-border',
        };
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in text-vistaro-primary">
      {/* 1. Header Banner */}
      <div className="bg-vistaro-surface border border-vistaro-border rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-label text-vistaro-accent mb-1.5 font-medium tracking-wide uppercase text-xs">
            <CalendarCheck className="w-4 h-4" />
            <span>Unified Reservations Hub</span>
          </div>
          <h1 className="text-display-hero text-2xl sm:text-3xl text-vistaro-primary">
            My Bookings
          </h1>
          <p className="text-body text-vistaro-muted mt-1 max-w-2xl">
            View, track, and manage all your reserved boutique villas, multi-day expeditions, and host-led local experiences in one place.
          </p>
        </div>

        {/* Quick Summary Pill */}
        <div className="flex items-center gap-3 bg-vistaro-secondary px-5 py-3 rounded-2xl border border-vistaro-border shrink-0">
          <div className="w-10 h-10 rounded-xl bg-vistaro-accent text-white flex items-center justify-center font-bold text-lg shadow-xs">
            {counts.total}
          </div>
          <div>
            <div className="text-label text-vistaro-primary font-semibold">Total Reservations</div>
            <div className="text-caption text-vistaro-muted">
              {counts.upcoming} upcoming &middot; {counts.completed} past
            </div>
          </div>
        </div>
      </div>

      {/* 2. Filter & Search Controls */}
      <div className="space-y-4">
        {/* Status Navigation Tabs */}
        <div className="flex items-center justify-between gap-4 flex-wrap border-b border-vistaro-border pb-3">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {[
              { id: 'all', label: 'All Bookings', count: counts.total },
              { id: 'upcoming', label: 'Upcoming', count: counts.upcoming },
              { id: 'completed', label: 'Completed', count: counts.completed },
              { id: 'cancelled', label: 'Cancelled', count: counts.cancelled },
            ].map((tab) => {
              const isActive = activeStatus === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleStatusChange(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-nav-link text-sm font-medium transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-vistaro-accent text-white shadow-xs'
                      : 'bg-vistaro-surface border border-vistaro-border text-vistaro-secondary hover:bg-vistaro-secondary hover:text-vistaro-primary'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-2xs px-2 py-0.5 rounded-full font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-vistaro-secondary text-vistaro-muted'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Search */}
          <div className="relative min-w-[240px] flex-1 sm:flex-initial">
            <Search className="w-4 h-4 text-vistaro-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title or destination..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-vistaro-surface border border-vistaro-border rounded-full pl-9 pr-4 py-2 text-body-sm text-vistaro-primary placeholder-vistaro-muted focus:outline-hidden focus:border-vistaro-accent"
            />
          </div>
        </div>

        {/* Type Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          <div className="text-caption text-vistaro-muted font-medium flex items-center gap-1 mr-1 shrink-0">
            <Filter className="w-3.5 h-3.5" /> Type:
          </div>
          {[
            { id: 'all', label: 'All Types', icon: CalendarCheck, count: counts.total },
            { id: 'stay', label: 'Stays & Villas', icon: Home, count: counts.stays },
            { id: 'package', label: 'Tour Packages', icon: Compass, count: counts.packages },
            { id: 'experience', label: 'Host Experiences', icon: Sparkles, count: counts.experiences },
          ].map((typeTab) => {
            const Icon = typeTab.icon;
            const isSelected = activeType === typeTab.id;
            return (
              <button
                key={typeTab.id}
                onClick={() => handleTypeChange(typeTab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-vistaro-primary text-white dark:bg-white dark:text-vistaro-primary font-semibold shadow-xs'
                    : 'bg-vistaro-surface border border-vistaro-border text-vistaro-secondary hover:bg-vistaro-secondary hover:text-vistaro-primary'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{typeTab.label}</span>
                <span className="opacity-70 text-2xs">({typeTab.count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Main Content Area */}
      {loading ? (
        <div className="py-20">
          <LoadingSpinner fullScreen={false} text="Loading your reservations..." />
        </div>
      ) : error ? (
        <div className="bg-vistaro-surface border border-vistaro-error/30 rounded-3xl p-8 text-center space-y-4 max-w-lg mx-auto shadow-sm">
          <div className="w-12 h-12 rounded-full bg-vistaro-error/10 text-vistaro-error flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-display-h3 text-lg text-vistaro-primary">Unable to load reservations</h3>
          <p className="text-body-sm text-vistaro-secondary">{error}</p>
          <button
            onClick={fetchBookings}
            className="inline-flex items-center gap-2 bg-vistaro-accent hover:bg-vistaro-accent-hover text-white text-cta py-2.5 px-6 rounded-full transition-colors cursor-pointer"
          >
            Retry Loading
          </button>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="bg-vistaro-surface border border-vistaro-border rounded-3xl p-12 text-center space-y-5 max-w-2xl mx-auto shadow-xs">
          <div className="w-16 h-16 rounded-full bg-vistaro-secondary flex items-center justify-center mx-auto border border-vistaro-border text-vistaro-muted">
            <Calendar className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-display-h3 text-xl text-vistaro-primary">No reservations found</h3>
            <p className="text-body-sm text-vistaro-muted mt-1.5 max-w-md mx-auto">
              {searchQuery
                ? `No bookings matched your search query "${searchQuery}". Try adjusting your filters.`
                : activeStatus === 'cancelled'
                ? 'You do not have any cancelled bookings in your history.'
                : activeStatus === 'completed'
                ? 'You do not have any past completed trips yet.'
                : 'You have no upcoming reservations. Ready to embark on your next Himalayan retreat or coastal expedition?'}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-vistaro-accent hover:bg-vistaro-accent-hover text-white text-cta py-2.5 px-5 rounded-full transition-all shadow-xs"
            >
              <Home className="w-4 h-4" /> Explore Stays
            </Link>
            <Link
              to="/tours"
              className="inline-flex items-center gap-2 bg-vistaro-surface border border-vistaro-border hover:bg-vistaro-secondary text-vistaro-primary text-cta py-2.5 px-5 rounded-full transition-all"
            >
              <Compass className="w-4 h-4 text-amber-500" /> Browse Tours
            </Link>
            <Link
              to="/experiences"
              className="inline-flex items-center gap-2 bg-vistaro-surface border border-vistaro-border hover:bg-vistaro-secondary text-vistaro-primary text-cta py-2.5 px-5 rounded-full transition-all"
            >
              <Sparkles className="w-4 h-4 text-purple-500" /> Host Experiences
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBookings.map((booking) => {
            const typeBadge = getTypeBadgeDetails(booking.bookingType);
            const statusBadge = getStatusBadgeDetails(booking.status);
            const TypeIcon = typeBadge.icon;
            const StatusIcon = statusBadge.icon;

            const checkInFormatted = new Date(booking.dates?.checkIn).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });
            const checkOutFormatted = new Date(booking.dates?.checkOut).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });

            return (
              <div
                key={booking._id}
                className="bg-vistaro-surface border border-vistaro-border hover:border-vistaro-muted/60 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                {/* 1. Top Media Header */}
                <div>
                  <div className="relative aspect-16/9 bg-vistaro-secondary overflow-hidden">
                    <img
                      src={booking.item?.coverImage}
                      alt={booking.item?.title || 'Booking cover'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />

                    {/* Type Badge (Top Left) */}
                    <div className="absolute top-3 left-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md border shadow-xs ${typeBadge.className}`}
                      >
                        <TypeIcon className="w-3.5 h-3.5" />
                        <span>{typeBadge.label}</span>
                      </span>
                    </div>

                    {/* Status Badge (Top Right) */}
                    <div className="absolute top-3 right-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md border shadow-xs ${statusBadge.className}`}
                      >
                        <StatusIcon className="w-3.5 h-3.5" />
                        <span>{statusBadge.label}</span>
                      </span>
                    </div>
                  </div>

                  {/* 2. Card Content Body */}
                  <div className="p-5 space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg text-vistaro-primary group-hover:text-vistaro-accent transition-colors line-clamp-1">
                        <Link to={booking.item?.detailUrl}>
                          {booking.item?.title}
                        </Link>
                      </h3>
                      {booking.item?.location && (
                        <p className="text-body-sm text-vistaro-muted mt-1 flex items-center gap-1.5 line-clamp-1">
                          <MapPin className="w-3.5 h-3.5 shrink-0 text-vistaro-accent" />
                          <span>{booking.item.location}</span>
                        </p>
                      )}
                    </div>

                    {/* Itinerary / Date Metadata Box */}
                    <div className="bg-vistaro-secondary/70 rounded-2xl p-3.5 border border-vistaro-border space-y-2 text-body-sm text-vistaro-secondary">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-vistaro-muted flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {booking.bookingType === 'experience' ? 'Date & Time' : 'Travel Dates'}
                        </span>
                        <span className="font-medium text-vistaro-primary">
                          {booking.dates?.durationSummary}
                        </span>
                      </div>

                      <div className="text-xs font-semibold text-vistaro-primary">
                        {booking.bookingType === 'experience'
                          ? checkInFormatted
                          : `${checkInFormatted} → ${checkOutFormatted}`}
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1 border-t border-vistaro-border/60">
                        <span className="flex items-center gap-1 text-vistaro-muted">
                          <Users className="w-3.5 h-3.5" /> {booking.guests?.label}
                        </span>
                        <span className="flex items-center gap-1 text-vistaro-muted">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="capitalize">{booking.pricing?.policySnapshot || 'flexible'}</span>
                        </span>
                      </div>
                    </div>

                    {/* Refund info banner if cancelled */}
                    {booking.isCancelled && booking.cancellation && (
                      <div className="bg-vistaro-error/10 border border-vistaro-error/20 rounded-xl p-2.5 text-xs text-vistaro-error space-y-0.5">
                        <div className="font-semibold">Cancelled Reservation</div>
                        <div>
                          Refund: {booking.cancellation.refundPercentage}% ({formatPrice(booking.cancellation.refundAmount || 0)})
                        </div>
                        {booking.cancellation.reason && (
                          <div className="italic text-2xs opacity-80">
                            Reason: "{booking.cancellation.reason}"
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. Footer Price & Navigation */}
                <div className="p-5 pt-0 border-t border-vistaro-border mt-2">
                  <div className="flex items-center justify-between pt-4">
                    <div>
                      <div className="text-2xs uppercase text-vistaro-muted font-medium tracking-wide">
                        Total Paid
                      </div>
                      <div className="text-price text-lg font-bold text-vistaro-primary">
                        {formatPrice(booking.pricing?.totalPrice || 0)}
                      </div>
                    </div>

                    <Link
                      to={`/my-bookings/${booking._id}`}
                      className="inline-flex items-center gap-1.5 bg-vistaro-accent hover:bg-vistaro-accent-hover text-white text-cta text-xs py-2 px-4 rounded-full transition-all shadow-xs"
                    >
                      <span>Manage Booking</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
