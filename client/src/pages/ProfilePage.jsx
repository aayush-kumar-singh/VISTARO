import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi.js';
import { bookingsApi } from '../api/bookingsApi.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useCurrency } from '../context/CurrencyContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import {
  User,
  Plane,
  Clock,
  Home,
  CalendarCheck,
  Settings,
  KeyRound,
  FileText,
} from 'lucide-react';

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuth();
  const { formatPrice } = useCurrency();
  const { showSuccess, showError } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('upcoming');
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Bio state
  const [bio, setBio] = useState('');
  const [isSavingBio, setIsSavingBio] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Cancellation Modal state
  const [cancellingBooking, setCancellingBooking] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);

  useEffect(() => {
    if (location.hash === '#upcoming') setActiveTab('upcoming');
    else if (location.hash === '#past') setActiveTab('past');
    else if (location.hash === '#hosted') setActiveTab('hosted');
    else if (location.hash === '#incoming') setActiveTab('incoming');
    else if (location.hash === '#settings') setActiveTab('settings');
  }, [location.hash]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await authApi.getProfile();
      setProfileData(data);
      setBio(data.user?.bio || '');
    } catch (err) {
      setError(err.message);
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadProfile();
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-vistaro-surface border border-vistaro-border rounded-3xl text-center space-y-4 shadow-sm text-vistaro-primary">
        <User className="w-10 h-10 text-vistaro-accent mx-auto" />
        <h2 className="text-display-h2 text-vistaro-primary">Sign in to view your profile</h2>
        <p className="text-body text-vistaro-muted">Access your upcoming trips, hosted properties, and account settings.</p>
        <Link
          to="/login"
          className="inline-block bg-vistaro-accent hover:bg-vistaro-accent-hover text-white text-cta py-3 px-6 rounded-full transition-colors cursor-pointer"
        >
          Log In
        </Link>
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading your account profile..." />;
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-vistaro-surface border border-vistaro-error/30 rounded-3xl text-center space-y-4 shadow-sm text-vistaro-primary">
        <div className="w-12 h-12 rounded-full bg-vistaro-secondary text-vistaro-error flex items-center justify-center mx-auto border border-vistaro-border">
          <User className="w-6 h-6" />
        </div>
        <h2 className="text-display-h2 text-vistaro-primary">Profile Loading Failed</h2>
        <p className="text-body-sm text-vistaro-secondary">{error}</p>
        <div className="pt-2">
          <button
            type="button"
            onClick={loadProfile}
            className="bg-vistaro-accent hover:bg-vistaro-accent-hover text-white text-cta py-3 px-6 rounded-full transition-colors cursor-pointer"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  const handleUpdateBio = async (e) => {
    e.preventDefault();
    try {
      setIsSavingBio(true);
      const data = await authApi.updateProfile({ bio });
      updateUser({ bio: data.user.bio });
      showSuccess(data.message);
    } catch (err) {
      showError(err.message);
    } finally {
      setIsSavingBio(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      setIsChangingPassword(true);
      const data = await authApi.changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      showSuccess(data.message);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      logout();
      navigate('/login');
    } catch (err) {
      showError(err.message);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancellingBooking) return;
    try {
      setIsSubmittingCancel(true);
      const data = await bookingsApi.cancelBooking(cancellingBooking._id, {
        reason: cancelReason,
      });
      showSuccess(data.message);
      setCancellingBooking(null);
      setCancelReason('');
      loadProfile();
    } catch (err) {
      showError(err.message);
    } finally {
      setIsSubmittingCancel(false);
    }
  };

  const upcomingTrips = profileData?.upcomingTrips || [];
  const pastTrips = profileData?.pastTrips || [];
  const hostedListings = profileData?.hostedListings || [];
  const incomingBookings = profileData?.incomingBookings || [];

  return (
    <div className="w-full space-y-8 text-vistaro-primary transition-colors duration-200">

      {/* 1. Profile Banner Header */}
      <div className="bg-vistaro-secondary rounded-3xl p-6 sm:p-8 border border-vistaro-border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-vistaro-accent text-white flex items-center justify-center font-semibold text-2xl sm:text-3xl shadow-sm">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-display-hero text-2xl sm:text-3xl text-vistaro-primary">
              {user.username}
            </h1>
            <p className="text-body-sm text-vistaro-secondary mt-0.5 flex items-center gap-2">
              <span>{user.email}</span>
              {user.googleId && (
                <span className="bg-vistaro-surface text-vistaro-accent border border-vistaro-border text-caption px-2 py-0.5 rounded-full">
                  Google Linked
                </span>
              )}
            </p>
            {user.bio && (
              <p className="text-body-sm text-vistaro-muted mt-2 italic max-w-md">"{user.bio}"</p>
            )}
          </div>
        </div>

        {user.role === 'admin' && (
          <Link
            to="/admin"
            className="inline-flex items-center justify-center gap-2 bg-vistaro-accent hover:bg-vistaro-accent-hover text-white text-cta py-3 px-6 rounded-full transition-all shadow-xs shrink-0 cursor-pointer"
          >
            Admin Console
          </Link>
        )}
      </div>

      {/* 2. Navigation Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-vistaro-border pb-2">
        {[
          { id: 'upcoming', label: `Upcoming Trips (${upcomingTrips.length})`, icon: Plane },
          { id: 'past', label: `History (${pastTrips.length})`, icon: Clock },
          { id: 'hosted', label: `My Listings (${hostedListings.length})`, icon: Home },
          { id: 'incoming', label: `Guest Bookings (${incomingBookings.length})`, icon: CalendarCheck },
          { id: 'settings', label: 'Settings', icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-nav-link transition-all shrink-0 cursor-pointer ${isActive
                  ? 'bg-vistaro-accent text-white shadow-xs'
                  : 'bg-vistaro-surface border border-vistaro-border text-vistaro-secondary hover:bg-vistaro-secondary hover:text-vistaro-primary'
                }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Tab Contents */}

      {/* TAB: Upcoming Trips */}
      {activeTab === 'upcoming' && (
        <div className="space-y-4">
          {upcomingTrips.length === 0 ? (
            <div className="text-center py-16 bg-vistaro-surface rounded-3xl border border-vistaro-border">
              <Plane className="w-10 h-10 text-vistaro-muted mx-auto mb-2" />
              <h3 className="text-display-h3 text-base text-vistaro-primary">No upcoming trips</h3>
              <p className="text-body-sm text-vistaro-muted max-w-sm mx-auto mt-1 mb-4">
                Time to dust off your bags and start planning your next getaway.
              </p>
              <Link
                to="/"
                className="inline-block bg-vistaro-accent hover:bg-vistaro-accent-hover text-white text-cta py-2.5 px-6 rounded-full transition-colors"
              >
                Start Exploring
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcomingTrips.map((trip) => {
                const isExperience = trip.bookingType === 'experience' || !!trip.experience;
                const isPackage = trip.bookingType === 'package' || !!trip.tourPackage;
                const tripTitle = isExperience
                  ? trip.experience?.title
                  : isPackage
                    ? trip.tourPackage?.title
                    : trip.listing?.title;
                const tripImage = isExperience
                  ? (trip.experience?.coverImage?.url || trip.experience?.image?.url)
                  : isPackage
                    ? (trip.tourPackage?.coverImage?.url || trip.tourPackage?.image?.url)
                    : (trip.listing?.images?.[0]?.url || trip.listing?.image?.url);
                const detailUrl = isExperience
                  ? `/experiences/${trip.experience?.slug}`
                  : isPackage
                    ? `/tours/${trip.tourPackage?.slug}`
                    : `/listings/${trip.listing?._id}`;

                const checkInDate = new Date(trip.checkIn).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
                const checkOutDate = new Date(trip.checkOut).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

                return (
                  <div
                    key={trip._id}
                    className="bg-vistaro-surface rounded-2xl border border-vistaro-border overflow-hidden shadow-xs flex flex-col sm:flex-row"
                  >
                    <div className="sm:w-44 h-40 sm:h-auto bg-vistaro-secondary shrink-0">
                      <img
                        src={tripImage || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=60'}
                        alt={tripTitle || 'Trip'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-semibold text-body text-vistaro-primary truncate">
                            {tripTitle || (isExperience ? 'Experience' : isPackage ? 'Tour Package' : 'Stay')}
                          </h4>
                          <span className={`text-caption px-2 py-0.5 rounded-full border border-vistaro-border ${isExperience
                              ? 'bg-vistaro-surface text-vistaro-accent'
                              : isPackage
                                ? 'bg-vistaro-surface text-vistaro-rating'
                                : 'bg-vistaro-surface text-vistaro-success'
                            }`}>
                            {isExperience ? 'Experience' : isPackage ? 'Tour Package' : 'Confirmed'}
                          </span>
                        </div>
                        <p className="text-body-sm text-vistaro-muted mt-1">
                          {isExperience ? `Date: ${checkInDate}` : `${checkInDate} – ${checkOutDate} (${trip.nights} night${trip.nights > 1 ? 's' : ''})`}
                        </p>
                        <p className="text-body-sm text-vistaro-muted mt-0.5">
                          {trip.guests} {isExperience ? 'participant' : isPackage ? 'traveler' : 'guest'}{trip.guests > 1 ? 's' : ''} &middot; Total: <span className="text-price text-sm text-vistaro-primary">{formatPrice(trip.totalPrice)}</span>
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-vistaro-border">
                        <Link
                          to={detailUrl}
                          className="text-cta text-vistaro-accent hover:underline"
                        >
                          {isExperience ? 'View experience details' : isPackage ? 'View expedition details' : 'View stay details'}
                        </Link>
                        <button
                          onClick={() => setCancellingBooking(trip)}
                          className="text-cta text-vistaro-muted hover:text-vistaro-accent underline cursor-pointer"
                        >
                          Cancel trip
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB: History */}
      {activeTab === 'past' && (
        <div className="space-y-4">
          {pastTrips.length === 0 ? (
            <div className="text-center py-16 bg-vistaro-surface rounded-3xl border border-vistaro-border">
              <Clock className="w-10 h-10 text-vistaro-muted mx-auto mb-2" />
              <h3 className="text-display-h3 text-base text-vistaro-primary">No past trips</h3>
              <p className="text-body-sm text-vistaro-muted">Your completed and cancelled reservations will appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pastTrips.map((trip) => {
                const isCancelled = trip.status === 'cancelled';
                const isExperience = trip.bookingType === 'experience' || !!trip.experience;
                const isPackage = trip.bookingType === 'package' || !!trip.tourPackage;
                const tripTitle = isExperience
                  ? trip.experience?.title
                  : isPackage
                    ? trip.tourPackage?.title
                    : trip.listing?.title;
                const tripImage = isExperience
                  ? (trip.experience?.coverImage?.url || trip.experience?.image?.url)
                  : isPackage
                    ? (trip.tourPackage?.coverImage?.url || trip.tourPackage?.image?.url)
                    : (trip.listing?.images?.[0]?.url || trip.listing?.image?.url);

                const checkInDate = new Date(trip.checkIn).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
                const checkOutDate = new Date(trip.checkOut).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

                return (
                  <div
                    key={trip._id}
                    className="bg-vistaro-surface rounded-2xl border border-vistaro-border p-4 shadow-xs flex items-center gap-4"
                  >
                    <div className="w-20 h-20 rounded-xl bg-vistaro-secondary shrink-0 overflow-hidden">
                      <img
                        src={tripImage || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=60'}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-semibold text-body text-vistaro-primary truncate">
                          {tripTitle || (isExperience ? 'Experience' : isPackage ? 'Tour Package' : 'Past Stay')}
                        </h4>
                        <span
                          className={`text-caption px-2 py-0.5 rounded-full border border-vistaro-border ${isCancelled
                              ? 'bg-vistaro-surface text-vistaro-error'
                              : isExperience
                                ? 'bg-vistaro-surface text-vistaro-accent'
                                : isPackage
                                  ? 'bg-vistaro-surface text-vistaro-rating'
                                  : 'bg-vistaro-surface text-vistaro-muted'
                            }`}
                        >
                          {isCancelled ? 'Cancelled' : isExperience ? 'Experience' : isPackage ? 'Tour Package' : 'Completed'}
                        </span>
                      </div>
                      <p className="text-body-sm text-vistaro-muted mt-1">
                        {isExperience ? `Date: ${checkInDate}` : `${checkInDate} – ${checkOutDate}`}
                      </p>
                      {isCancelled && trip.cancellation?.refundPercentage !== undefined && (
                        <p className="text-body-sm font-semibold text-vistaro-success mt-0.5">
                          Refunded: {trip.cancellation.refundPercentage}% ({formatPrice(trip.cancellation.refundAmount || 0)})
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB: My Listings */}
      {activeTab === 'hosted' && (
        <div className="space-y-4">
          {hostedListings.length === 0 ? (
            <div className="text-center py-16 bg-vistaro-surface rounded-3xl border border-vistaro-border">
              <Home className="w-10 h-10 text-vistaro-muted mx-auto mb-2" />
              <h3 className="text-display-h3 text-base text-vistaro-primary">You haven't listed any spaces yet</h3>
              <p className="text-body-sm text-vistaro-muted max-w-sm mx-auto mt-1 mb-4">
                {user.role === 'admin'
                  ? 'Publish and manage verified property listings across Vistaro.'
                  : 'You do not manage any property listings.'}
              </p>
              {user.role === 'admin' ? (
                <Link
                  to="/listings/new"
                  className="inline-block bg-vistaro-accent hover:bg-vistaro-accent-hover text-white text-cta py-2.5 px-6 rounded-full transition-colors"
                >
                  Create First Listing
                </Link>
              ) : (
                <Link
                  to="/"
                  className="inline-block bg-vistaro-surface border border-vistaro-border hover:bg-vistaro-secondary text-vistaro-primary text-cta py-2.5 px-6 rounded-full transition-colors"
                >
                  Explore Stays
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {hostedListings.map((l) => (
                <div key={l._id} className="bg-vistaro-surface rounded-2xl border border-vistaro-border overflow-hidden shadow-xs flex flex-col">
                  <div className="aspect-4/3 bg-vistaro-secondary relative">
                    <img
                      src={l.images?.[0]?.url || l.image?.url}
                      alt={l.title}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-2 right-2 bg-vistaro-main/80 text-vistaro-primary border border-vistaro-border text-caption px-2 py-0.5 rounded-full backdrop-blur-xs">
                      {l.category}
                    </span>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-semibold text-body text-vistaro-primary truncate">{l.title}</h4>
                      <p className="text-body-sm text-vistaro-muted mt-0.5">{l.location}, {l.country}</p>
                      <p className="text-body-sm font-semibold text-vistaro-primary mt-1">{formatPrice(l.price)} / night</p>
                    </div>
                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-vistaro-border">
                      <Link to={`/listings/${l._id}`} className="text-cta text-vistaro-secondary hover:text-vistaro-primary hover:underline">
                        View
                      </Link>
                      <Link to={`/listings/${l._id}/edit`} className="text-cta text-vistaro-accent hover:underline">
                        Edit
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: Guest Bookings */}
      {activeTab === 'incoming' && (
        <div className="space-y-4">
          {incomingBookings.length === 0 ? (
            <div className="text-center py-16 bg-vistaro-surface rounded-3xl border border-vistaro-border">
              <CalendarCheck className="w-10 h-10 text-vistaro-muted mx-auto mb-2" />
              <h3 className="text-display-h3 text-base text-vistaro-primary">No guest bookings yet</h3>
              <p className="text-body-sm text-vistaro-muted">Reservations made on your hosted stays will appear here.</p>
            </div>
          ) : (
            <div className="divide-y divide-vistaro-border bg-vistaro-surface rounded-2xl border border-vistaro-border overflow-hidden shadow-xs">
              {incomingBookings.map((b) => (
                <div key={b._id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-caption font-semibold text-vistaro-accent">{b.listing?.title || 'Property'}</span>
                    <h4 className="font-semibold text-body text-vistaro-primary mt-0.5">
                      Guest: @{b.user?.username || 'Guest'} ({b.guests} guest{b.guests > 1 ? 's' : ''})
                    </h4>
                    <p className="text-body-sm text-vistaro-muted mt-1">
                      {new Date(b.checkIn).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} &ndash; {new Date(b.checkOut).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} &middot; {b.nights} night(s)
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-price text-sm text-vistaro-primary block">{formatPrice(b.totalPrice)}</span>
                    <span
                      className={`inline-block text-caption px-2.5 py-0.5 rounded-full mt-1 border border-vistaro-border ${b.status === 'confirmed' ? 'bg-vistaro-surface text-vistaro-success' : 'bg-vistaro-surface text-vistaro-error'
                        }`}
                    >
                      {b.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: Settings */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Bio Form */}
          <form onSubmit={handleUpdateBio} className="bg-vistaro-surface rounded-3xl p-6 border border-vistaro-border shadow-xs space-y-4">
            <h3 className="text-display-h3 text-base text-vistaro-primary flex items-center gap-2">
              <FileText className="w-4 h-4 text-vistaro-accent" /> About You (Bio)
            </h3>
            <textarea
              rows={4}
              maxLength={300}
              placeholder="Tell guests and hosts a little about yourself, your travels, and interests..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full bg-vistaro-secondary border border-vistaro-border text-vistaro-primary rounded-2xl p-3.5 text-body-sm focus:outline-hidden focus:bg-vistaro-surface focus:border-vistaro-accent"
            />
            <div className="flex items-center justify-between text-body-sm text-vistaro-muted">
              <span>{300 - bio.length} characters left</span>
              <button
                type="submit"
                disabled={isSavingBio}
                className="bg-vistaro-accent hover:bg-vistaro-accent-hover text-white text-cta py-2 px-5 rounded-full transition-colors cursor-pointer"
              >
                {isSavingBio ? 'Saving...' : 'Save Bio'}
              </button>
            </div>
          </form>

          {/* Change Password Form */}
          {!user.googleId ? (
            <form onSubmit={handleChangePassword} className="bg-vistaro-surface rounded-3xl p-6 border border-vistaro-border shadow-xs space-y-4">
              <h3 className="text-display-h3 text-base text-vistaro-primary flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-vistaro-accent" /> Change Password
              </h3>
              <input
                type="password"
                placeholder="Current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-vistaro-secondary border border-vistaro-border text-vistaro-primary rounded-2xl px-4 py-2.5 text-body-sm focus:outline-hidden focus:bg-vistaro-surface focus:border-vistaro-accent"
                required
              />
              <input
                type="password"
                placeholder="New password (min 6 characters)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-vistaro-secondary border border-vistaro-border text-vistaro-primary rounded-2xl px-4 py-2.5 text-body-sm focus:outline-hidden focus:bg-vistaro-surface focus:border-vistaro-accent"
                required
                minLength={6}
              />
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-vistaro-secondary border border-vistaro-border text-vistaro-primary rounded-2xl px-4 py-2.5 text-body-sm focus:outline-hidden focus:bg-vistaro-surface focus:border-vistaro-accent"
                required
                minLength={6}
              />
              <div className="text-right">
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="bg-vistaro-accent hover:bg-vistaro-accent-hover text-white text-cta py-2.5 px-6 rounded-full transition-colors cursor-pointer"
                >
                  {isChangingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-vistaro-surface rounded-3xl p-6 border border-vistaro-border flex flex-col items-center justify-center text-center space-y-2">
              <KeyRound className="w-8 h-8 text-vistaro-muted" />
              <h4 className="text-display-h3 text-sm text-vistaro-primary">Google Linked Account</h4>
              <p className="text-body-sm text-vistaro-muted max-w-xs">
                Your account is authenticated via Google. Password change is handled directly through your Google account.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Cancellation Modal */}
      {cancellingBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-vistaro-surface rounded-3xl max-w-md w-full p-6 shadow-2xl border border-vistaro-border space-y-4 text-vistaro-primary">
            <h3 className="text-display-h3 text-lg text-vistaro-primary">Cancel Reservation</h3>
            <p className="text-body-sm text-vistaro-secondary">
              Are you sure you want to cancel your stay at <b>{cancellingBooking.listing?.title}</b>?
            </p>

            <div className="bg-vistaro-secondary p-3.5 rounded-2xl border border-vistaro-border text-body-sm text-vistaro-secondary space-y-1">
              <p><b>Policy:</b> {cancellingBooking.policySnapshot || 'flexible'}</p>
              <p>Refunds are automatically calculated and returned to your original payment method in 3–5 business days.</p>
            </div>

            <div>
              <label className="block text-label text-vistaro-primary mb-1">Reason for cancellation (optional)</label>
              <textarea
                rows={2}
                placeholder="Let the host know why plans changed..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full bg-vistaro-secondary border border-vistaro-border text-vistaro-primary rounded-xl p-2.5 text-body-sm focus:outline-hidden focus:bg-vistaro-surface focus:border-vistaro-accent"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCancellingBooking(null)}
                className="text-cta px-4 py-2 text-vistaro-secondary hover:text-vistaro-primary cursor-pointer"
              >
                Keep Reservation
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={isSubmittingCancel}
                className="bg-vistaro-error hover:bg-vistaro-accent-hover text-white text-cta px-5 py-2.5 rounded-full transition-colors cursor-pointer"
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
