import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCurrency } from '../../context/CurrencyContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import {
  Search,
  ArrowRight,
  PlusCircle,
  Globe,
  MessageSquare,
  LayoutDashboard,
  Heart,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  Compass,
  Shield,
  Sun,
  Moon,
  Sparkles,
  CalendarCheck,
} from 'lucide-react';

export default function Navbar() {
  const { user, unreadCount, logout } = useAuth();
  const { currency, setCurrency, exchangeRates } = useCurrency();
  const { isDark, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const desktopCurrencyRef = useRef(null);
  const mobileCurrencyRef = useRef(null);
  const userMenuRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      const clickedInsideDesktop = desktopCurrencyRef.current && desktopCurrencyRef.current.contains(event.target);
      const clickedInsideMobile = mobileCurrencyRef.current && mobileCurrencyRef.current.contains(event.target);
      if (!clickedInsideDesktop && !clickedInsideMobile) {
        setIsCurrencyOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsMobileSearchOpen(false);
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = async () => {
    setIsUserMenuOpen(false);
    setIsMobileSearchOpen(false);
    setSearchQuery('');
    await logout();
    const protectedPaths = ['/admin', '/listings/new', '/profile', '/inbox', '/dashboard'];
    if (protectedPaths.some((p) => location.pathname.startsWith(p))) {
      navigate('/', { replace: true });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-vistaro-surface border-b border-vistaro-border shadow-xs transition-colors duration-200">
      <div className="max-w-[1700px] mx-auto px-4 sm:px-8 md:px-10 lg:px-12 h-20 flex items-center justify-between gap-4">

        {/* 1. Left: Brand Logo & Explore */}
        <div className="flex items-center gap-6 shrink-0">
          <Link to="/" className="flex items-center gap-2 group">
            {/* SVG Logo */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 44 44"
              className="w-9 h-9 transform group-hover:scale-105 transition-transform"
              aria-hidden="true"
            >
              <path
                d="M22 4C15.373 4 10 9.373 10 16c0 9 12 24 12 24s12-15 12-24c0-6.627-5.373-12-12-12z"
                fill="var(--vistaro-accent)"
              />
              <polyline
                points="16,13 22,20 28,13"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="22" cy="16" r="3.5" fill="white" opacity="0.9" />
            </svg>
            <span className="text-brand-logo text-vistaro-primary">
              Vis<span className="text-vistaro-accent">taro</span>
            </span>
          </Link>

          <Link
            to="/"
            className={`hidden md:inline-flex items-center transition-colors ${location.pathname === '/' ? 'text-nav-link-active text-vistaro-primary' : 'text-nav-link text-vistaro-secondary hover:text-vistaro-accent'}`}
          >
            Explore
          </Link>

          <Link
            to="/destinations"
            className={`hidden md:inline-flex items-center transition-colors ${location.pathname.startsWith('/destinations') ? 'text-nav-link-active text-vistaro-primary' : 'text-nav-link text-vistaro-secondary hover:text-vistaro-accent'}`}
          >
            Destinations
          </Link>

          <Link
            to="/tours"
            className={`hidden md:inline-flex items-center transition-colors ${location.pathname.startsWith('/tours') ? 'text-nav-link-active text-vistaro-primary' : 'text-nav-link text-vistaro-secondary hover:text-vistaro-accent'}`}
          >
            Tours
          </Link>

          <Link
            to="/experiences"
            className={`hidden md:inline-flex items-center transition-colors ${location.pathname.startsWith('/experiences') ? 'text-nav-link-active text-vistaro-primary' : 'text-nav-link text-vistaro-secondary hover:text-vistaro-accent'}`}
          >
            Experiences
          </Link>
        </div>

        {/* 2. Middle: Search Bar (Desktop & Tablet >= 768px) */}
        <div className="hidden md:flex flex-1 max-w-md mx-auto">
          <form
            onSubmit={handleSearchSubmit}
            className="w-full flex items-center bg-vistaro-surface border border-vistaro-border hover:border-vistaro-muted hover:shadow-md transition-all rounded-full py-1.5 pl-4 pr-1.5 shadow-xs"
          >
            <Search className="w-4 h-4 text-vistaro-muted shrink-0 mr-2" />
            <input
              type="text"
              placeholder="Search destinations, villas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none text-body-sm text-vistaro-primary placeholder-vistaro-muted focus:outline-hidden"
            />
            <button
              type="submit"
              className="bg-vistaro-accent hover:bg-vistaro-accent-hover text-white p-2 rounded-full transition-colors shrink-0 flex items-center justify-center cursor-pointer shadow-xs"
              aria-label="Submit search"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* 3. Right: Nav actions & User Menu (Desktop) */}
        <div className="hidden md:flex items-center gap-4 shrink-0">

          {user?.role === 'admin' && (
            <Link
              to="/admin"
              className="flex items-center gap-1.5 text-cta text-vistaro-accent bg-vistaro-secondary hover:bg-vistaro-main transition-colors py-2 px-4 rounded-full border border-vistaro-border shadow-2xs"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Portal</span>
            </Link>
          )}

          {/* Theme Toggle Button (Desktop) */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-full border border-vistaro-border hover:bg-vistaro-secondary text-vistaro-secondary hover:text-vistaro-primary transition-colors cursor-pointer"
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-vistaro-rating" />
            ) : (
              <Moon className="w-4 h-4 text-vistaro-secondary" />
            )}
          </button>

          {/* Currency Switcher */}
          <div className="relative" ref={desktopCurrencyRef}>
            <button
              onClick={() => setIsCurrencyOpen(!isCurrencyOpen)}
              className="flex items-center gap-1.5 text-nav-link border border-vistaro-border hover:border-vistaro-muted rounded-full px-3 py-1.5 hover:bg-vistaro-secondary text-vistaro-primary transition-colors cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-vistaro-secondary" />
              <span>{currency} ({exchangeRates[currency]?.symbol || '₹'})</span>
            </button>

            {isCurrencyOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-vistaro-surface rounded-2xl shadow-xl border border-vistaro-border py-2 z-50 animate-fade-in">
                <div className="px-3 py-1 text-label text-vistaro-muted">
                  Select Currency
                </div>
                {Object.values(exchangeRates).map((c) => (
                  <button
                    key={c.code}
                    onClick={() => {
                      setCurrency(c.code);
                      setIsCurrencyOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-body-sm text-left hover:bg-vistaro-secondary transition-colors cursor-pointer ${currency === c.code ? 'font-semibold text-vistaro-accent bg-vistaro-secondary' : 'text-vistaro-primary'
                      }`}
                  >
                    <span>{c.name} ({c.code})</span>
                    <span className="text-body-sm font-semibold text-vistaro-muted">{c.symbol}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Menu / Auth buttons */}
          {!user ? (
            <div className="flex items-center gap-2">
              <Link
                to="/signup"
                className="text-nav-link text-vistaro-primary hover:text-vistaro-accent py-2 px-3 rounded-full hover:bg-vistaro-secondary transition-colors"
              >
                Sign Up
              </Link>
              <Link
                to="/login"
                className="text-cta bg-vistaro-accent hover:bg-vistaro-accent-hover text-white py-2 px-4 rounded-full transition-colors shadow-xs"
              >
                Log In
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {/* Messages */}
              <Link
                to="/inbox"
                className="relative p-2 text-vistaro-secondary hover:text-vistaro-primary rounded-full hover:bg-vistaro-secondary transition-colors"
                title="Messages"
              >
                <MessageSquare className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-vistaro-accent rounded-full border-2 border-vistaro-surface" />
                )}
              </Link>

              {/* Wishlist */}
              <Link
                to="/wishlist"
                className="p-2 text-vistaro-secondary hover:text-vistaro-accent rounded-full hover:bg-vistaro-secondary transition-colors"
                title="Wishlist"
              >
                <Heart className="w-5 h-5" />
              </Link>

              {/* Dashboard */}
              <Link
                to="/dashboard"
                className="p-2 text-vistaro-secondary hover:text-vistaro-primary rounded-full hover:bg-vistaro-secondary transition-colors"
                title="Host Dashboard"
              >
                <LayoutDashboard className="w-5 h-5" />
              </Link>

              {/* User Dropdown Pill */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 border border-vistaro-border hover:shadow-md rounded-full py-1.5 px-3.5 transition-all cursor-pointer"
                >
                  <Menu className="w-4 h-4 text-vistaro-secondary" />
                  <div className="w-7 h-7 rounded-full bg-vistaro-accent text-white flex items-center justify-center font-semibold text-2xs">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-vistaro-surface rounded-2xl shadow-xl border border-vistaro-border py-2 z-50 animate-fade-in divide-y divide-vistaro-border">
                    <div className="px-4 py-2">
                      <p className="text-muted">Signed in as</p>
                      <p className="text-body-sm font-semibold text-vistaro-primary truncate">{user.username}</p>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/my-bookings"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-body-sm text-vistaro-primary hover:bg-vistaro-secondary font-medium"
                      >
                        <CalendarCheck className="w-4 h-4 text-vistaro-accent" /> My Bookings
                      </Link>
                      <Link
                        to="/travel-plans"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-body-sm text-vistaro-primary hover:bg-vistaro-secondary"
                      >
                        <Compass className="w-4 h-4 text-vistaro-muted" /> Travel Plans
                      </Link>
                      <Link
                        to="/profile"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-body-sm text-vistaro-primary hover:bg-vistaro-secondary"
                      >
                        <UserIcon className="w-4 h-4 text-vistaro-muted" /> Profile & Trips
                      </Link>
                      <Link
                        to="/dashboard"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-body-sm text-vistaro-primary hover:bg-vistaro-secondary"
                      >
                        <LayoutDashboard className="w-4 h-4 text-vistaro-muted" /> Host Dashboard
                      </Link>
                      <Link
                        to="/inbox"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-body-sm text-vistaro-primary hover:bg-vistaro-secondary"
                      >
                        <MessageSquare className="w-4 h-4 text-vistaro-muted" /> Messages
                      </Link>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-body-sm text-vistaro-error hover:bg-vistaro-secondary text-left font-medium cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" /> Log Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 4. Mobile Nav Controls (< 768px) */}
        <div className="flex md:hidden items-center gap-2">
          {/* Mobile Currency Switcher Button */}
          <div className="relative" ref={mobileCurrencyRef}>
            <button
              onClick={() => setIsCurrencyOpen(!isCurrencyOpen)}
              className="flex items-center gap-1 text-nav-link border border-vistaro-border rounded-full px-2.5 py-1.5 hover:bg-vistaro-secondary text-vistaro-primary transition-colors cursor-pointer"
              aria-label="Change currency"
            >
              <Globe className="w-3.5 h-3.5 text-vistaro-secondary" />
              <span>{currency}</span>
            </button>

            {isCurrencyOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-vistaro-surface rounded-2xl shadow-xl border border-vistaro-border py-2 z-50 animate-fade-in">
                <div className="px-3 py-1 text-label text-vistaro-muted">
                  Select Currency
                </div>
                {Object.values(exchangeRates).map((c) => (
                  <button
                    key={c.code}
                    onClick={() => {
                      setCurrency(c.code);
                      setIsCurrencyOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-body-sm text-left hover:bg-vistaro-secondary transition-colors cursor-pointer ${currency === c.code ? 'font-semibold text-vistaro-accent bg-vistaro-secondary' : 'text-vistaro-primary'
                      }`}
                  >
                    <span>{c.name} ({c.code})</span>
                    <span className="text-body-sm font-semibold text-vistaro-muted">{c.symbol}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => setIsMobileSearchOpen(true)}
            className="p-2 rounded-full border border-vistaro-border text-vistaro-secondary hover:bg-vistaro-secondary cursor-pointer"
            aria-label="Open mobile search"
          >
            <Search className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsUserMenuOpen(true)}
            className="flex items-center gap-1.5 border border-vistaro-border rounded-full py-1 px-2.5 text-vistaro-secondary hover:bg-vistaro-secondary cursor-pointer"
            aria-label="Open navigation drawer"
          >
            <Menu className="w-4 h-4" />
            {user ? (
              <div className="w-6 h-6 rounded-full bg-vistaro-accent text-white flex items-center justify-center font-semibold text-2xs">
                {user.username.charAt(0).toUpperCase()}
              </div>
            ) : (
              <UserIcon className="w-4 h-4 text-vistaro-muted" />
            )}
          </button>
        </div>

      </div>

      {/* 5. Mobile Full-Screen Navigation Drawer & Sheet */}
      {isUserMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden animate-fade-in">
          {/* Backdrop */}
          <div
            onClick={() => setIsUserMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          />

          {/* Slide-over Drawer Panel */}
          <div className="relative ml-auto w-full max-w-sm bg-vistaro-surface h-full shadow-2xl flex flex-col z-10 overflow-y-auto border-l border-vistaro-border">

            {/* Drawer Header */}
            <div className="p-5 border-b border-vistaro-border flex items-center justify-between bg-vistaro-secondary">
              <Link
                to="/"
                onClick={() => setIsUserMenuOpen(false)}
                className="flex items-center gap-2 text-brand-logo text-vistaro-primary"
              >
                <div className="w-8 h-8 rounded-full bg-vistaro-accent flex items-center justify-center text-white font-medium text-sm">
                  V
                </div>
                <span>Vis<span className="text-vistaro-accent">taro</span></span>
              </Link>
              <button
                onClick={() => setIsUserMenuOpen(false)}
                className="p-2 rounded-full text-vistaro-muted hover:text-vistaro-primary hover:bg-vistaro-surface transition-colors cursor-pointer"
                aria-label="Close drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User Greeting / Auth Banner */}
            <div className="p-5 border-b border-vistaro-border bg-vistaro-surface">
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-vistaro-accent text-white flex items-center justify-center font-semibold text-base shadow-xs">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="text-body-sm text-vistaro-muted">Welcome back</div>
                    <div className="font-semibold text-body text-vistaro-primary truncate">@{user.username}</div>
                    <div className="text-body-sm text-vistaro-muted truncate">{user.email}</div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <h3 className="text-card-title text-vistaro-primary">Explore extraordinary journeys</h3>
                    <p className="text-body-sm text-vistaro-muted">Sign in to book stays, packages, and host experiences.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Link
                      to="/login"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="text-center text-cta py-2.5 px-4 rounded-xl border border-vistaro-border text-vistaro-primary hover:bg-vistaro-secondary transition-colors"
                    >
                      Log In
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="text-center text-cta py-2.5 px-4 rounded-xl bg-vistaro-accent hover:bg-vistaro-accent-hover text-white transition-colors shadow-xs"
                    >
                      Sign Up
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Theme Toggle Section in Drawer */}
            <div className="p-4 flex items-center justify-between border-b border-vistaro-border">
              <span className="text-nav-link text-vistaro-primary">Theme Appearance</span>
              <button
                type="button"
                onClick={toggleTheme}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-vistaro-border bg-vistaro-secondary text-nav-link text-vistaro-primary transition-colors cursor-pointer"
              >
                {isDark ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-vistaro-rating" />
                    <span>Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-vistaro-secondary" />
                    <span>Dark Mode</span>
                  </>
                )}
              </button>
            </div>

            {/* Core Discovery Navigation Links */}
            <div className="p-4 space-y-1 border-b border-vistaro-border">
              <div className="px-3 py-1 text-label text-vistaro-muted">
                Discover Vistaro
              </div>

              <Link
                to="/"
                onClick={() => setIsUserMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-nav-link text-vistaro-primary hover:bg-vistaro-secondary transition-colors"
              >
                <Compass className="w-5 h-5 text-vistaro-accent" />
                <span>Explore Stays & Villas</span>
              </Link>

              <Link
                to="/destinations"
                onClick={() => setIsUserMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-2xl text-nav-link text-vistaro-primary hover:bg-vistaro-secondary transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-vistaro-accent" />
                  <span>Destinations Guide</span>
                </div>
                <span className="text-caption px-2 py-0.5 rounded-full bg-vistaro-secondary text-vistaro-secondary">
                  6 Regions
                </span>
              </Link>

              <Link
                to="/tours"
                onClick={() => setIsUserMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-2xl text-nav-link text-vistaro-primary hover:bg-vistaro-secondary transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Compass className="w-5 h-5 text-vistaro-accent" />
                  <span>Tour Packages</span>
                </div>
                <span className="text-caption px-2 py-0.5 rounded-full bg-vistaro-secondary text-vistaro-secondary">
                  Itineraries
                </span>
              </Link>

              <Link
                to="/experiences"
                onClick={() => setIsUserMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-2xl text-nav-link text-vistaro-primary hover:bg-vistaro-secondary transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-vistaro-accent" />
                  <span>Host Experiences</span>
                </div>
                <span className="text-caption px-2 py-0.5 rounded-full bg-vistaro-secondary text-vistaro-secondary">
                  Handcrafted
                </span>
              </Link>
            </div>

            {/* Authenticated Navigation Links */}
            {user && (
              <div className="p-4 space-y-1 border-b border-vistaro-border">
                <div className="px-3 py-1 text-label text-vistaro-muted">
                  My Account
                </div>

                <Link
                  to="/my-bookings"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-nav-link text-vistaro-primary hover:bg-vistaro-secondary transition-colors font-medium"
                >
                  <CalendarCheck className="w-5 h-5 text-vistaro-accent" />
                  <span>My Bookings</span>
                </Link>

                <Link
                  to="/travel-plans"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-nav-link text-vistaro-primary hover:bg-vistaro-secondary transition-colors"
                >
                  <Compass className="w-5 h-5 text-vistaro-muted" />
                  <span>My Travel Plans</span>
                </Link>

                <Link
                  to="/profile"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-nav-link text-vistaro-primary hover:bg-vistaro-secondary transition-colors"
                >
                  <UserIcon className="w-5 h-5 text-vistaro-muted" />
                  <span>Profile & Trips</span>
                </Link>

                <Link
                  to="/dashboard"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-nav-link text-vistaro-primary hover:bg-vistaro-secondary transition-colors"
                >
                  <LayoutDashboard className="w-5 h-5 text-vistaro-success" />
                  <span>Host Dashboard</span>
                </Link>

                <Link
                  to="/inbox"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2.5 rounded-2xl text-nav-link text-vistaro-primary hover:bg-vistaro-secondary transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-5 h-5 text-vistaro-muted" />
                    <span>Messages</span>
                  </div>
                  {unreadCount > 0 && (
                    <span className="text-caption px-2 py-0.5 rounded-full bg-vistaro-secondary text-vistaro-accent">
                      {unreadCount} new
                    </span>
                  )}
                </Link>

                <Link
                  to="/wishlist"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-nav-link text-vistaro-primary hover:bg-vistaro-secondary transition-colors"
                >
                  <Heart className="w-5 h-5 text-vistaro-accent" />
                  <span>Saved Wishlist</span>
                </Link>

                {user.role === 'admin' && (
                  <>
                    <div className="pt-2">
                      <div className="px-3 py-1 text-label text-vistaro-accent">
                        Admin Tools
                      </div>
                      <Link
                        to="/admin"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-cta text-vistaro-accent bg-vistaro-secondary hover:bg-vistaro-main transition-colors"
                      >
                        <Shield className="w-5 h-5 text-vistaro-accent" />
                        <span>Admin Control Console</span>
                      </Link>
                      <Link
                        to="/listings/new"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-nav-link text-vistaro-primary hover:bg-vistaro-secondary transition-colors mt-1"
                      >
                        <PlusCircle className="w-5 h-5 text-vistaro-success" />
                        <span>Create New Listing</span>
                      </Link>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Currency Selector Section */}
            <div className="p-4 space-y-2 border-b border-vistaro-border">
              <div className="px-3 text-label text-vistaro-muted">
                Display Currency
              </div>
              <div className="grid grid-cols-4 gap-1.5 px-1">
                {Object.values(exchangeRates).map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => setCurrency(c.code)}
                    className={`py-2 px-1 rounded-xl text-caption transition-all text-center cursor-pointer ${currency === c.code
                      ? 'bg-vistaro-accent text-white shadow-xs'
                      : 'bg-vistaro-secondary text-vistaro-primary hover:bg-vistaro-main'
                      }`}
                  >
                    <div>{c.code}</div>
                    <div className="text-2xs opacity-75">{c.symbol}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Footer / Log Out */}
            {user && (
              <div className="p-4 mt-auto">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-cta text-vistaro-error bg-vistaro-secondary hover:bg-vistaro-main transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out of Vistaro</span>
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Mobile Search Overlay Modal */}
      {isMobileSearchOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col p-4 animate-fade-in md:hidden">
          <div className="bg-vistaro-surface rounded-3xl p-4 shadow-2xl mt-4 border border-vistaro-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-display-h3 text-vistaro-primary">Where to?</h3>
              <button
                onClick={() => setIsMobileSearchOpen(false)}
                className="p-1 rounded-full text-vistaro-muted hover:text-vistaro-primary cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSearchSubmit} className="space-y-4">
              <div className="flex items-center bg-vistaro-secondary rounded-2xl px-4 py-3 border border-vistaro-border">
                <Search className="w-5 h-5 text-vistaro-muted mr-3 shrink-0" />
                <input
                  type="search"
                  placeholder="Search destinations, villas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-body-sm text-vistaro-primary placeholder-vistaro-muted focus:outline-hidden"
                  autoFocus
                />
              </div>

              <div className="flex flex-wrap gap-2 text-body-sm">
                <span className="text-muted font-semibold self-center">Popular:</span>
                {['Goa', 'Ladakh', 'Kalimpong', 'Kasol', 'Munnar', 'Udaipur'].map((dest) => (
                  <button
                    key={dest}
                    type="button"
                    onClick={() => {
                      setSearchQuery(dest);
                      setIsMobileSearchOpen(false);
                      navigate(`/search?q=${encodeURIComponent(dest)}`);
                    }}
                    className="bg-vistaro-secondary hover:bg-vistaro-main text-vistaro-primary px-3 py-1 rounded-full text-caption cursor-pointer border border-vistaro-border"
                  >
                    {dest}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                className="w-full bg-vistaro-accent hover:bg-vistaro-accent-hover text-white text-cta py-3 rounded-2xl transition-colors shadow-sm cursor-pointer"
              >
                Search Places
              </button>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
