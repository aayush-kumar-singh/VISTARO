import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../api/dashboardApi.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useCurrency } from '../context/CurrencyContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import HostAccessGate from '../components/auth/HostAccessGate.jsx';
import {
  Home,
  Coins,
  Users,
  PlusCircle,
  TrendingUp,
  LayoutDashboard,
} from 'lucide-react';

export default function HostDashboardPage() {
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const { showError } = useToast();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardApi.getDashboard();
      setDashboard(data);
    } catch (err) {
      setError(err.message);
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && (user.role === 'host' || user.role === 'admin')) {
      loadDashboard();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (!user || (user.role !== 'host' && user.role !== 'admin')) {
    return (
      <div className="max-w-3xl mx-auto py-4 text-vistaro-primary">
        <HostAccessGate title="Host Privileges Required for Dashboard" />
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading host analytics & reservations..." />;
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-vistaro-surface border border-vistaro-error/30 rounded-3xl text-center space-y-4 shadow-sm text-vistaro-primary">
        <div className="w-12 h-12 rounded-full bg-vistaro-secondary text-vistaro-error flex items-center justify-center mx-auto border border-vistaro-border">
          <LayoutDashboard className="w-6 h-6" />
        </div>
        <h2 className="text-display-h2 text-vistaro-primary">Dashboard Failed to Load</h2>
        <p className="text-body-sm text-vistaro-secondary">{error}</p>
        <div className="pt-2">
          <button
            type="button"
            onClick={loadDashboard}
            className="bg-vistaro-accent hover:bg-vistaro-accent-hover text-white text-cta py-3 px-6 rounded-full transition-colors cursor-pointer"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  const metrics = dashboard?.metrics || {
    totalProperties: 0,
    totalRevenue: 0,
    totalGuests: 0,
    occupancyRate: 0,
  };

  const listingStats = dashboard?.listingStats || [];
  const incomingBookings = dashboard?.incomingBookings || [];

  return (
    <div className="w-full space-y-8 text-vistaro-primary transition-colors duration-200">

      {/* 1. Header & Add Listing CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-vistaro-border">
        <div>
          <h1 className="text-display-hero text-2xl sm:text-3xl text-vistaro-primary flex items-center gap-2">
            <LayoutDashboard className="w-7 h-7 text-vistaro-accent" /> Host & Owner Dashboard
          </h1>
          <p className="text-body-sm text-vistaro-muted mt-1">
            Manage your properties, track revenue, and review upcoming guest trips.
          </p>
        </div>

        <Link
          to="/listings/new"
          className="inline-flex items-center gap-2 bg-vistaro-surface border border-vistaro-border hover:bg-vistaro-secondary text-vistaro-primary text-cta py-3 px-6 rounded-full transition-all shadow-xs shrink-0 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4 text-vistaro-accent" /> Add New Listing
        </Link>
      </div>

      {/* 2. KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Properties */}
        <div className="bg-vistaro-surface p-5 rounded-3xl border border-vistaro-border shadow-xs flex items-center justify-between">
          <div>
            <span className="text-label text-vistaro-muted">Properties</span>
            <div className="text-price text-3xl text-vistaro-primary mt-1">{metrics.totalProperties}</div>
            <span className="text-caption text-vistaro-muted mt-0.5 block">Active published stays</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-vistaro-secondary text-vistaro-accent border border-vistaro-border flex items-center justify-center">
            <Home className="w-6 h-6" />
          </div>
        </div>

        {/* Revenue */}
        <div className="bg-vistaro-surface p-5 rounded-3xl border border-vistaro-border shadow-xs flex items-center justify-between">
          <div>
            <span className="text-label text-vistaro-muted">Gross Earnings</span>
            <div className="text-price text-3xl text-vistaro-primary mt-1">{formatPrice(metrics.totalRevenue)}</div>
            <span className="text-caption text-vistaro-success font-semibold mt-0.5 block">From confirmed trips</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-vistaro-secondary text-vistaro-success border border-vistaro-border flex items-center justify-center">
            <Coins className="w-6 h-6" />
          </div>
        </div>

        {/* Upcoming Guests */}
        <div className="bg-vistaro-surface p-5 rounded-3xl border border-vistaro-border shadow-xs flex items-center justify-between">
          <div>
            <span className="text-label text-vistaro-muted">Upcoming Guests</span>
            <div className="text-price text-3xl text-vistaro-primary mt-1">{metrics.totalGuests}</div>
            <span className="text-caption text-vistaro-muted mt-0.5 block">{dashboard?.upcomingBookings?.length || 0} upcoming stay(s)</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-vistaro-secondary text-vistaro-accent border border-vistaro-border flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* 30-Day Occupancy */}
        <div className="bg-vistaro-surface p-5 rounded-3xl border border-vistaro-border shadow-xs flex items-center justify-between">
          <div>
            <span className="text-label text-vistaro-muted">30-Day Occupancy</span>
            <div className="text-price text-3xl text-vistaro-primary mt-1">{metrics.occupancyRate}%</div>
            <span className="text-caption text-vistaro-muted mt-0.5 block">Across all your listings</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-vistaro-secondary text-vistaro-rating border border-vistaro-border flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* 3. Per-Listing Performance Analytics */}
      <div className="bg-vistaro-surface rounded-3xl p-6 border border-vistaro-border shadow-xs space-y-4">
        <h3 className="text-display-h3 text-lg text-vistaro-primary">Listing Performance</h3>

        {listingStats.length === 0 ? (
          <p className="text-body-sm text-vistaro-muted py-4 text-center">No properties listed yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-vistaro-border text-vistaro-muted uppercase text-label">
                <tr>
                  <th className="pb-3">Stay</th>
                  <th className="pb-3">Location</th>
                  <th className="pb-3">Total Bookings</th>
                  <th className="pb-3">Upcoming</th>
                  <th className="pb-3">Revenue</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-vistaro-border font-medium text-vistaro-secondary">
                {listingStats.map((stat) => (
                  <tr key={stat.listing._id} className="hover:bg-vistaro-secondary/50 transition-colors">
                    <td className="py-3.5 pr-3 font-semibold text-vistaro-primary max-w-xs truncate">
                      {stat.listing.title}
                    </td>
                    <td className="py-3.5 pr-3 text-muted">{stat.listing.location}</td>
                    <td className="py-3.5 pr-3">{stat.totalBookings}</td>
                    <td className="py-3.5 pr-3 font-semibold text-vistaro-accent">{stat.upcomingBookings}</td>
                    <td className="py-3.5 pr-3 font-semibold text-vistaro-success">{formatPrice(stat.revenue)}</td>
                    <td className="py-3.5 text-right space-x-2">
                      <Link
                        to={`/listings/${stat.listing._id}`}
                        className="text-cta text-vistaro-accent hover:underline"
                      >
                        View
                      </Link>
                      <Link
                        to={`/listings/${stat.listing._id}/edit`}
                        className="text-cta text-vistaro-secondary hover:text-vistaro-primary hover:underline"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. Incoming Guest Reservations */}
      <div className="bg-vistaro-surface rounded-3xl p-6 border border-vistaro-border shadow-xs space-y-4">
        <h3 className="text-display-h3 text-lg text-vistaro-primary">Recent Guest Reservations</h3>

        {incomingBookings.length === 0 ? (
          <p className="text-body-sm text-vistaro-muted py-4 text-center">No guest reservations recorded yet.</p>
        ) : (
          <div className="divide-y divide-vistaro-border">
            {incomingBookings.map((b) => (
              <div key={b._id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-semibold text-body text-vistaro-primary">{b.listing?.title || 'Listing'}</h4>
                  <p className="text-body-sm text-vistaro-muted mt-0.5">
                    Guest: <b>@{b.user?.username || 'Guest'}</b> ({b.guests} guest{b.guests > 1 ? 's' : ''}) &middot;{' '}
                    {new Date(b.checkIn).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} &ndash;{' '}
                    {new Date(b.checkOut).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-price text-base text-vistaro-primary">{formatPrice(b.totalPrice)}</span>
                  <span
                    className={`text-caption px-2.5 py-0.5 rounded-full border border-vistaro-border ${
                      b.status === 'confirmed' ? 'bg-vistaro-surface text-vistaro-success' : 'bg-vistaro-surface text-vistaro-error'
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

    </div>
  );
}
