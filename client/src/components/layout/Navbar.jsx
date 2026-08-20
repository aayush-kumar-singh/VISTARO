import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCurrency } from '../../context/CurrencyContext.jsx';
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
} from 'lucide-react';

export default function Navbar() {
  const { user, unreadCount, logout } = useAuth();
  const { currency, setCurrency, exchangeRates } = useCurrency();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const currencyRef = useRef(null);
  const userMenuRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (currencyRef.current && !currencyRef.current.contains(event.target)) {
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

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-[#DDDDDD] shadow-xs">
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
                fill="#dc3545"
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
            <span className="font-extrabold text-2xl tracking-tight text-[#222222]">
              Vis<span className="text-[#dc3545]">taro</span>
            </span>
          </Link>

          <Link
            to="/"
            className="hidden md:inline-flex items-center font-semibold text-[#222222] hover:text-[#dc3545] text-sm transition-colors"
          >
            Explore
          </Link>
        </div>

        {/* 2. Middle: Search Bar (Desktop & Tablet >= 768px) */}
        <div className="hidden md:flex flex-1 max-w-md mx-auto">
          <form
            onSubmit={handleSearchSubmit}
            className="w-full flex items-center bg-white border border-[#DDDDDD] hover:border-zinc-400 hover:shadow-md transition-all rounded-full py-1.5 pl-4 pr-1.5 shadow-xs"
          >
            <Search className="w-4 h-4 text-zinc-400 shrink-0 mr-2" />
            <input
              type="text"
              placeholder="Search destinations, villas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none text-sm text-[#222222] placeholder-zinc-400 focus:outline-hidden"
            />
            <button
              type="submit"
              className="bg-[#dc3545] hover:bg-[#b02a37] text-white p-2 rounded-full transition-colors shrink-0 flex items-center justify-center cursor-pointer shadow-xs"
              aria-label="Submit search"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* 3. Right: Nav actions & User Menu (Desktop) */}
        <div className="hidden md:flex items-center gap-4 shrink-0">
          
          <Link
            to="/listings/new"
            className="flex items-center gap-1.5 text-sm font-semibold text-[#222222] hover:text-[#dc3545] transition-colors py-2 px-3 rounded-full hover:bg-zinc-100"
          >
            <PlusCircle className="w-4 h-4 text-[#dc3545]" />
            <span>List on Vistaro</span>
          </Link>

          {/* Currency Switcher */}
          <div className="relative" ref={currencyRef}>
            <button
              onClick={() => setIsCurrencyOpen(!isCurrencyOpen)}
              className="flex items-center gap-1.5 text-xs font-semibold border border-zinc-300 hover:border-zinc-400 rounded-full px-3 py-1.5 hover:bg-zinc-50 transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-zinc-600" />
              <span>{currency} ({exchangeRates[currency]?.symbol || '₹'})</span>
            </button>

            {isCurrencyOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-zinc-200 py-2 z-50 animate-fade-in">
                <div className="px-3 py-1 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Select Currency
                </div>
                {Object.values(exchangeRates).map((c) => (
                  <button
                    key={c.code}
                    onClick={() => {
                      setCurrency(c.code);
                      setIsCurrencyOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left hover:bg-zinc-100 transition-colors ${
                      currency === c.code ? 'font-bold text-[#dc3545] bg-red-50/50' : 'text-zinc-700'
                    }`}
                  >
                    <span>{c.name} ({c.code})</span>
                    <span className="font-semibold text-zinc-500">{c.symbol}</span>
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
                className="text-sm font-semibold text-[#222222] hover:text-[#dc3545] py-2 px-3 rounded-full hover:bg-zinc-100 transition-colors"
              >
                Sign Up
              </Link>
              <Link
                to="/login"
                className="text-sm font-semibold bg-[#222222] hover:bg-black text-white py-2 px-4 rounded-full transition-colors shadow-xs"
              >
                Log In
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {/* Messages */}
              <Link
                to="/inbox"
                className="relative p-2 text-zinc-700 hover:text-zinc-900 rounded-full hover:bg-zinc-100 transition-colors"
                title="Messages"
              >
                <MessageSquare className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#dc3545] rounded-full border-2 border-white" />
                )}
              </Link>

              {/* Wishlist */}
              <Link
                to="/wishlist"
                className="p-2 text-zinc-700 hover:text-[#dc3545] rounded-full hover:bg-zinc-100 transition-colors"
                title="Wishlist"
              >
                <Heart className="w-5 h-5" />
              </Link>

              {/* Dashboard */}
              <Link
                to="/dashboard"
                className="p-2 text-zinc-700 hover:text-zinc-900 rounded-full hover:bg-zinc-100 transition-colors"
                title="Host Dashboard"
              >
                <LayoutDashboard className="w-5 h-5" />
              </Link>

              {/* User Dropdown Pill */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 border border-[#DDDDDD] hover:shadow-md rounded-full py-1.5 px-3.5 transition-all cursor-pointer"
                >
                  <Menu className="w-4 h-4 text-zinc-600" />
                  <div className="w-7 h-7 rounded-full bg-[#222222] text-white flex items-center justify-center font-bold text-xs">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-zinc-200 py-2 z-50 animate-fade-in divide-y divide-zinc-100">
                    <div className="px-4 py-2">
                      <p className="text-xs text-zinc-400">Signed in as</p>
                      <p className="text-sm font-bold text-zinc-900 truncate">{user.username}</p>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/profile"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100"
                      >
                        <UserIcon className="w-4 h-4 text-zinc-500" /> Profile & Trips
                      </Link>
                      <Link
                        to="/dashboard"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100"
                      >
                        <LayoutDashboard className="w-4 h-4 text-zinc-500" /> Host Dashboard
                      </Link>
                      <Link
                        to="/inbox"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100"
                      >
                        <MessageSquare className="w-4 h-4 text-zinc-500" /> Messages
                      </Link>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#dc3545] hover:bg-red-50 text-left font-medium"
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
          <button
            onClick={() => setIsMobileSearchOpen(true)}
            className="p-2.5 rounded-full border border-[#DDDDDD] text-zinc-700 hover:bg-zinc-100"
            aria-label="Open mobile search"
          >
            <Search className="w-4 h-4" />
          </button>

          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 border border-[#DDDDDD] rounded-full py-1 px-2.5 text-zinc-700"
              aria-label="Open navigation menu"
            >
              <Menu className="w-4 h-4" />
              {user ? (
                <div className="w-6 h-6 rounded-full bg-[#222222] text-white flex items-center justify-center font-bold text-xs">
                  {user.username.charAt(0).toUpperCase()}
                </div>
              ) : (
                <UserIcon className="w-5 h-5 text-zinc-500" />
              )}
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-zinc-200 py-2 z-50 animate-fade-in divide-y divide-zinc-100">
                <div className="py-1">
                  <Link
                    to="/"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-sm font-semibold text-zinc-800 hover:bg-zinc-100"
                  >
                    <Compass className="w-4 h-4 text-zinc-500" /> Explore
                  </Link>
                  <Link
                    to="/listings/new"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-sm font-semibold text-[#dc3545] hover:bg-red-50"
                  >
                    <PlusCircle className="w-4 h-4" /> List on Vistaro
                  </Link>
                </div>

                {!user ? (
                  <div className="py-1">
                    <Link
                      to="/signup"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="block px-4 py-2 text-sm font-bold text-[#dc3545] hover:bg-zinc-100"
                    >
                      Sign Up
                    </Link>
                    <Link
                      to="/login"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-zinc-800 hover:bg-zinc-100"
                    >
                      Log In
                    </Link>
                  </div>
                ) : (
                  <>
                    <div className="py-1">
                      <Link
                        to="/inbox"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100"
                      >
                        <MessageSquare className="w-4 h-4 text-zinc-500" /> Messages {unreadCount > 0 && `(${unreadCount})`}
                      </Link>
                      <Link
                        to="/dashboard"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100"
                      >
                        <LayoutDashboard className="w-4 h-4 text-zinc-500" /> Host Dashboard
                      </Link>
                      <Link
                        to="/wishlist"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100"
                      >
                        <Heart className="w-4 h-4 text-zinc-500" /> Wishlist
                      </Link>
                      <Link
                        to="/profile"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100"
                      >
                        <UserIcon className="w-4 h-4 text-zinc-500" /> {user.username}
                      </Link>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#dc3545] hover:bg-red-50 text-left font-medium"
                      >
                        <LogOut className="w-4 h-4" /> Log Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Mobile Search Overlay Modal */}
      {isMobileSearchOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col p-4 animate-fade-in md:hidden">
          <div className="bg-white rounded-3xl p-4 shadow-2xl mt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-zinc-900">Where to?</h3>
              <button
                onClick={() => setIsMobileSearchOpen(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-zinc-800"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSearchSubmit} className="space-y-4">
              <div className="flex items-center bg-zinc-100 rounded-2xl px-4 py-3 border border-zinc-200">
                <Search className="w-5 h-5 text-zinc-400 mr-3 shrink-0" />
                <input
                  type="search"
                  placeholder="Search destinations, villas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-sm text-zinc-900 placeholder-zinc-400 focus:outline-hidden"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#dc3545] hover:bg-[#b02a37] text-white font-bold py-3 rounded-2xl transition-colors shadow-sm text-sm"
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
