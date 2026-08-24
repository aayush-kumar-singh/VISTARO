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
  ChevronDown,
  MapPin,
} from 'lucide-react';

export default function Navbar() {
  const { user, unreadCount, logout } = useAuth();
  const { currency, setCurrency, exchangeRates } = useCurrency();
  const { isDark, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isServicesNavOpen, setIsServicesNavOpen] = useState(false);
  const [isMobileServicesOpen, setIsMobileServicesOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Track window scroll position with hysteresis & requestAnimationFrame to eliminate jitter
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          setIsScrolled((prevScrolled) => {
            // Hysteresis: enter at > 70px, exit at < 20px to prevent flip-flop vibration
            if (!prevScrolled && currentScrollY > 70) {
              return true;
            } else if (prevScrolled && currentScrollY < 20) {
              return false;
            }
            return prevScrolled;
          });
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isServiceActive =
    location.pathname.startsWith('/destinations') ||
    location.pathname.startsWith('/tours') ||
    location.pathname.startsWith('/experiences');

  const desktopCurrencyRef = useRef(null);
  const mobileCurrencyRef = useRef(null);
  const userMenuRef = useRef(null);
  const mobileDrawerRef = useRef(null);
  const mobileMenuBtnRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      const clickedInsideDesktop = desktopCurrencyRef.current && desktopCurrencyRef.current.contains(event.target);
      const clickedInsideMobile = mobileCurrencyRef.current && mobileCurrencyRef.current.contains(event.target);
      if (!clickedInsideDesktop && !clickedInsideMobile) {
        setIsCurrencyOpen(false);
      }

      const clickedInsideDesktopUserMenu = userMenuRef.current && userMenuRef.current.contains(event.target);
      const clickedInsideMobileDrawer = mobileDrawerRef.current && mobileDrawerRef.current.contains(event.target);
      const clickedMobileMenuBtn = mobileMenuBtnRef.current && mobileMenuBtnRef.current.contains(event.target);

      if (!clickedInsideDesktopUserMenu && !clickedInsideMobileDrawer && !clickedMobileMenuBtn) {
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
    <header className={`sticky top-0 z-40 w-full bg-vistaro-surface border-b border-vistaro-border transition-shadow duration-300 ${isScrolled ? 'shadow-md bg-vistaro-surface/95 backdrop-blur-md' : 'shadow-xs'}`}>
      <div className="max-w-[1700px] mx-auto px-4 sm:px-8 md:px-10 lg:px-12 h-20 flex items-center justify-between gap-3 sm:gap-4">

        {/* 1. Left: Brand Logo & Explore / Services */}
        <div className="flex items-center gap-4 sm:gap-6 shrink-0">
          <Link
            to="/"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2 cursor-pointer shrink-0"
          >
            {/* Official Brand Logo */}
            <img
              src="/BrandLogo.png"
              alt="VISTARO Logo"
              className="w-9 h-9 object-contain"
            />
            <span className="text-brand-logo text-vistaro-primary">
              Vis<span className="text-vistaro-accent">taro</span>
            </span>
          </Link>

          {/* Links hide smoothly when scrolled into search-bar dominant mode */}
          <div className={`hidden lg:flex items-center gap-5 transition-all duration-300 ease-out transform-gpu ${isScrolled ? 'opacity-0 max-w-0 overflow-hidden pointer-events-none -translate-x-2' : 'opacity-100 max-w-xs translate-x-0'}`}>
            <Link
              to="/explore"
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`inline-flex items-center transition-colors ${location.pathname === '/explore' || location.pathname === '/listings' ? 'text-nav-link-active text-vistaro-primary' : 'text-nav-link text-vistaro-secondary hover:text-vistaro-accent'}`}
            >
              Explore
            </Link>

            {/* Services Option (Toggles Secondary Sub-Navbar) */}
            <button
              type="button"
              onClick={() => setIsServicesNavOpen((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                isServicesNavOpen || isServiceActive
                  ? 'text-nav-link-active text-vistaro-primary font-semibold'
                  : 'text-nav-link text-vistaro-secondary hover:text-vistaro-accent'
              }`}
            >
              <span>Services</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  isServicesNavOpen ? 'rotate-180 text-vistaro-accent' : 'text-vistaro-muted'
                }`}
              />
            </button>
          </div>
        </div>

        {/* 2. Middle: Morphing Search Bar (Transitions smoothly into whole search bar on scroll) */}
        <div
          className={`hidden md:flex flex-1 transition-all duration-300 ease-out mx-2 transform-gpu ${
            isScrolled
              ? 'max-w-lg lg:max-w-2xl'
              : 'max-w-xs md:max-w-sm lg:max-w-md lg:mx-auto'
          }`}
        >
          <form
            onSubmit={handleSearchSubmit}
            className={`w-full flex items-center bg-vistaro-surface border border-vistaro-border hover:border-vistaro-muted hover:shadow-md transition-all duration-300 rounded-full pl-4 pr-1.5 shadow-xs ${
              isScrolled ? 'py-2 ring-2 ring-vistaro-accent/20 shadow-md bg-vistaro-surface' : 'py-1.5'
            }`}
          >
            <Search className={`shrink-0 mr-2 transition-colors duration-300 ${isScrolled ? 'w-4 h-4 text-vistaro-accent' : 'w-4 h-4 text-vistaro-muted'}`} />
            <input
              type="text"
              placeholder={isScrolled ? 'Search destinations, luxury villas, tour packages, experiences...' : 'Search destinations, villas...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none text-body-sm text-vistaro-primary placeholder-vistaro-muted focus:outline-hidden"
            />
            <button
              type="submit"
              className="bg-vistaro-accent hover:bg-vistaro-accent-hover text-white p-2 rounded-full transition-all duration-200 shrink-0 flex items-center justify-center cursor-pointer shadow-xs hover:scale-105"
              aria-label="Submit search"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* 3. Right: Nav actions & User Menu (Desktop) with Animated Corner Theme Toggle */}
        <div className="hidden md:flex items-center gap-2.5 lg:gap-3.5 shrink-0">

          {user?.role === 'admin' && (
            <Link
              to="/admin"
              className="flex items-center gap-1.5 text-cta text-vistaro-accent bg-vistaro-secondary hover:bg-vistaro-main transition-colors py-2 px-4 rounded-full border border-vistaro-border shadow-2xs"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Portal</span>
            </Link>
          )}

          {/* Animated Theme Toggle Button (Corner Placement with Rotation & Scale Animation) */}
          <button
            type="button"
            onClick={toggleTheme}
            className="group relative p-2.5 rounded-full border border-vistaro-border bg-vistaro-surface hover:bg-vistaro-secondary text-vistaro-secondary hover:text-vistaro-primary transition-all duration-300 transform hover:scale-110 active:scale-95 cursor-pointer shadow-2xs hover:shadow-xs shrink-0"
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400 transform transition-transform duration-500 rotate-0 group-hover:rotate-90 group-hover:scale-110" />
            ) : (
              <Moon className="w-4 h-4 text-vistaro-accent transform transition-transform duration-500 rotate-0 group-hover:-rotate-45 group-hover:scale-110" />
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
            ref={mobileMenuBtnRef}
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

      {/* 2. Services Secondary Sub-Navbar (Appears when Services option is clicked or active) */}
      {isServicesNavOpen && (
        <div className="w-full bg-vistaro-surface border-t border-vistaro-border py-2.5 px-4 sm:px-8 md:px-10 lg:px-12 animate-fade-in shadow-2xs transition-all">
          <div className="max-w-[1700px] mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto py-0.5 no-scrollbar">
              <span className="text-2xs font-bold uppercase tracking-wider text-vistaro-muted shrink-0 hidden sm:inline-block pr-1">
                Services:
              </span>

              {/* Destination Guide */}
              <Link
                to="/destinations"
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all shrink-0 ${
                  location.pathname.startsWith('/destinations')
                    ? 'bg-vistaro-accent text-white shadow-xs'
                    : 'text-vistaro-secondary hover:text-vistaro-primary hover:bg-vistaro-secondary'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Destinations</span>
              </Link>

              {/* Tour Packages */}
              <Link
                to="/tours"
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all shrink-0 ${
                  location.pathname.startsWith('/tours')
                    ? 'bg-vistaro-accent text-white shadow-xs'
                    : 'text-vistaro-secondary hover:text-vistaro-primary hover:bg-vistaro-secondary'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Tour Packages</span>
              </Link>

              {/* Host Experiences */}
              <Link
                to="/experiences"
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all shrink-0 ${
                  location.pathname.startsWith('/experiences')
                    ? 'bg-vistaro-accent text-white shadow-xs'
                    : 'text-vistaro-secondary hover:text-vistaro-primary hover:bg-vistaro-secondary'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Host Experiences</span>
              </Link>
            </div>

            {/* Dismiss / Close sub-navbar button */}
            <button
              type="button"
              onClick={() => setIsServicesNavOpen(false)}
              className="p-1.5 rounded-full text-vistaro-muted hover:text-vistaro-primary hover:bg-vistaro-secondary transition-colors shrink-0 cursor-pointer"
              aria-label="Close services navbar"
              title="Close services navbar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 5. Mobile Full-Screen Navigation Drawer & Sheet */}
      {isUserMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden animate-fade-in">
          {/* Backdrop */}
          <div
            onClick={() => setIsUserMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          />

          {/* Slide-over Drawer Panel */}
          <div
            ref={mobileDrawerRef}
            className="relative ml-auto w-full max-w-sm bg-vistaro-surface h-dvh max-h-screen shadow-2xl flex flex-col z-10 overflow-y-auto overscroll-y-contain border-l border-vistaro-border touch-pan-y"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >

            {/* Drawer Header */}
            <div className="p-5 border-b border-vistaro-border flex items-center justify-between bg-vistaro-secondary shrink-0">
              <Link
                to="/"
                onClick={() => setIsUserMenuOpen(false)}
                className="flex items-center gap-2 text-brand-logo text-vistaro-primary"
              >
                <img
                  src="/BrandLogo.png"
                  alt="VISTARO Logo"
                  className="w-8 h-8 object-contain"
                />
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
            <div className="p-5 border-b border-vistaro-border bg-vistaro-surface shrink-0">
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-vistaro-accent text-white flex items-center justify-center font-semibold text-base shadow-xs shrink-0">
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
            <div className="p-4 flex items-center justify-between border-b border-vistaro-border shrink-0">
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
            <div className="p-4 space-y-1 border-b border-vistaro-border shrink-0">
              <div className="px-3 py-1 text-label text-vistaro-muted">
                Discover Vistaro
              </div>

              <Link
                to="/explore"
                onClick={() => {
                  setIsUserMenuOpen(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-nav-link text-vistaro-primary hover:bg-vistaro-secondary transition-colors"
              >
                <Compass className="w-5 h-5 text-vistaro-accent" />
                <span>Explore Stays & Villas</span>
              </Link>

              {/* Expandable Services Section in Mobile Drawer */}
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => setIsMobileServicesOpen(!isMobileServicesOpen)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-nav-link text-vistaro-primary hover:bg-vistaro-secondary transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-vistaro-accent" />
                    <span className="font-medium">Services</span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-vistaro-muted transition-transform duration-200 ${
                      isMobileServicesOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isMobileServicesOpen && (
                  <div className="pl-6 pr-2 space-y-1 animate-fade-in border-l-2 border-vistaro-border ml-4 my-1">
                    <Link
                      to="/destinations"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="flex items-center justify-between px-3 py-2 rounded-xl text-body-sm text-vistaro-primary hover:bg-vistaro-secondary"
                    >
                      <div className="flex items-center gap-2.5">
                        <MapPin className="w-4 h-4 text-vistaro-accent" />
                        <span>Destinations</span>
                      </div>
                      <span className="text-2xs px-2 py-0.5 rounded-full bg-vistaro-secondary text-vistaro-secondary">
                        6 Regions
                      </span>
                    </Link>

                    <Link
                      to="/tours"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="flex items-center justify-between px-3 py-2 rounded-xl text-body-sm text-vistaro-primary hover:bg-vistaro-secondary"
                    >
                      <div className="flex items-center gap-2.5">
                        <Compass className="w-4 h-4 text-vistaro-accent" />
                        <span>Tour Packages</span>
                      </div>
                      <span className="text-2xs px-2 py-0.5 rounded-full bg-vistaro-secondary text-vistaro-secondary">
                        Itineraries
                      </span>
                    </Link>

                    <Link
                      to="/experiences"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="flex items-center justify-between px-3 py-2 rounded-xl text-body-sm text-vistaro-primary hover:bg-vistaro-secondary"
                    >
                      <div className="flex items-center gap-2.5">
                        <Sparkles className="w-4 h-4 text-vistaro-accent" />
                        <span>Host Experiences</span>
                      </div>
                      <span className="text-2xs px-2 py-0.5 rounded-full bg-vistaro-secondary text-vistaro-secondary">
                        Handcrafted
                      </span>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Authenticated Navigation Links */}
            {user && (
              <div className="p-4 space-y-1 border-b border-vistaro-border shrink-0">
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
            <div className="p-4 space-y-2 border-b border-vistaro-border shrink-0">
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
              <div className="p-4 mt-auto shrink-0 pb-20">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl text-cta text-vistaro-error bg-vistaro-secondary hover:bg-vistaro-main transition-colors cursor-pointer border border-vistaro-border/60"
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
