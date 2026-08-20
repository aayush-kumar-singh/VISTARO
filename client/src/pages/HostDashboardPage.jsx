import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../api/dashboardApi.js';
import { bookingsApi } from '../api/bookingsApi.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useCurrency } from '../context/CurrencyContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import {
  Home,
  Coins,
  Users,
  CalendarCheck,
  PlusCircle,
  TrendingUp,
  LayoutDashboard,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

export default function HostDashboardPage() {
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const { showSuccess, showError } = useToast();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await dashboardApi.getDashboard();
      setDashboard(data);
    } catch (err) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadDashboard();
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white border border-zinc-200 rounded-3xl text-center space-y-4 shadow-sm">
        <LayoutDashboard className="w-10 h-10 text-[#dc3545] mx-auto" />
        <h2 className="text-xl font-bold text-zinc-900">Host Dashboard</h2>
        <p className="text-sm text-zinc-500">Sign in to view your properties, track earnings, and manage reservations.</p>
        <Link
          to="/login"
          className="inline-block bg-[#dc3545] hover:bg-[#b02a37] text-white text-sm font-bold py-3 px-6 rounded-full transition-colors"
        >
          Log In
        </Link>
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading host analytics & reservations..." />;
  }

  const metrics = dashboard?.metrics || {
    totalProperties: 0,
    totalRevenue: 0,
    totalGuests: 0,
    occupancyRate: 0,
  };

  const myListings = dashboard?.myListings || [];
  const listingStats = dashboard?.listingStats || [];
  const incomingBookings = dashboard?.incomingBookings || [];

  return (
    <div className="w-full space-y-8">
      
      {/* 1. Header & Add Listing CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#222222] tracking-tight flex items-center gap-2">
            <LayoutDashboard className="w-7 h-7 text-[#dc3545]" /> Host & Owner Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Manage your properties, track revenue, and review upcoming guest trips.
          </p>
        </div>

        <Link
          to="/listings/new"
          className="inline-flex items-center gap-2 bg-[#222222] hover:bg-black text-white text-xs sm:text-sm font-bold py-3 px-6 rounded-full transition-all shadow-xs shrink-0 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4 text-[#dc3545]" /> Add New Listing
        </Link>
      </div>

      {/* 2. KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Properties */}
        <div className="bg-white p-5 rounded-3xl border border-zinc-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Properties</span>
            <h3 className="text-2xl font-extrabold text-zinc-900 mt-1">{metrics.totalProperties}</h3>
            <span className="text-xs text-zinc-400 mt-0.5 block">Active published stays</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#dc3545] flex items-center justify-center">
            <Home className="w-6 h-6" />
          </div>
        </div>

        {/* Revenue */}
        <div className="bg-white p-5 rounded-3xl border border-zinc-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Gross Earnings</span>
            <h3 className="text-2xl font-extrabold text-zinc-900 mt-1">{formatPrice(metrics.totalRevenue)}</h3>
            <span className="text-xs text-emerald-600 font-semibold mt-0.5 block">From confirmed trips</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Coins className="w-6 h-6" />
          </div>
        </div>

        {/* Upcoming Guests */}
        <div className="bg-white p-5 rounded-3xl border border-zinc-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Upcoming Guests</span>
            <h3 className="text-2xl font-extrabold text-zinc-900 mt-1">{metrics.totalGuests}</h3>
            <span className="text-xs text-zinc-400 mt-0.5 block">{dashboard?.upcomingBookings?.length || 0} upcoming stay(s)</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* 30-Day Occupancy */}
        <div className="bg-white p-5 rounded-3xl border border-zinc-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">30-Day Occupancy</span>
            <h3 className="text-2xl font-extrabold text-zinc-900 mt-1">{metrics.occupancyRate}%</h3>
            <span className="text-xs text-zinc-400 mt-0.5 block">Across all your listings</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* 3. Per-Listing Performance Analytics */}
      <div className="bg-white rounded-3xl p-6 border border-zinc-200 shadow-xs space-y-4">
        <h3 className="text-lg font-bold text-zinc-900">Listing Performance</h3>

        {listingStats.length === 0 ? (
          <p className="text-xs text-zinc-500 py-4 text-center">No properties listed yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-zinc-200 text-zinc-400 uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="pb-3">Stay</th>
                  <th className="pb-3">Location</th>
                  <th className="pb-3">Total Bookings</th>
                  <th className="pb-3">Upcoming</th>
                  <th className="pb-3">Revenue</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 font-medium text-zinc-700">
                {listingStats.map((stat) => (
                  <tr key={stat.listing._id} className="hover:bg-zinc-50 transition-colors">
                    <td className="py-3.5 pr-3 font-bold text-zinc-900 max-w-xs truncate">
                      {stat.listing.title}
                    </td>
                    <td className="py-3.5 pr-3 text-zinc-500">{stat.listing.location}</td>
                    <td className="py-3.5 pr-3">{stat.totalBookings}</td>
                    <td className="py-3.5 pr-3 font-semibold text-blue-600">{stat.upcomingBookings}</td>
                    <td className="py-3.5 pr-3 font-bold text-emerald-600">{formatPrice(stat.revenue)}</td>
                    <td className="py-3.5 text-right space-x-2">
                      <Link
                        to={`/listings/${stat.listing._id}`}
                        className="text-[#dc3545] hover:underline font-semibold"
                      >
                        View
                      </Link>
                      <Link
                        to={`/listings/${stat.listing._id}/edit`}
                        className="text-zinc-600 hover:underline font-semibold"
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
      <div className="bg-white rounded-3xl p-6 border border-zinc-200 shadow-xs space-y-4">
        <h3 className="text-lg font-bold text-zinc-900">Recent Guest Reservations</h3>

        {incomingBookings.length === 0 ? (
          <p className="text-xs text-zinc-500 py-4 text-center">No guest reservations recorded yet.</p>
        ) : (
          <div className="divide-y divide-zinc-100">
            {incomingBookings.map((b) => (
              <div key={b._id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-sm text-zinc-900">{b.listing?.title || 'Listing'}</h4>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Guest: <b>@{b.user?.username || 'Guest'}</b> ({b.guests} guest{b.guests > 1 ? 's' : ''}) &middot;{' '}
                    {new Date(b.checkIn).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} &ndash;{' '}
                    {new Date(b.checkOut).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-sm text-zinc-900">{formatPrice(b.totalPrice)}</span>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      b.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
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
