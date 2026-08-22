import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Sparkles, MessageCircle, Phone, Mail, Compass, Globe } from 'lucide-react';
import { useToast } from '../../context/ToastContext.jsx';

export default function Footer() {
  const { showToast } = useToast();
  const [modalApp, setModalApp] = useState(null);

  const handleSocialClick = (appName) => {
    setModalApp(appName);
    showToast(`${appName} community coming soon!`, 'info');
  };

  const handleDirectLineClick = (e) => {
    e.preventDefault();
    setModalApp('Direct Line');
    showToast('Direct phone helpline is launching very soon!', 'info');
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  return (
    <footer className="w-full bg-vistaro-secondary border-t border-vistaro-border mt-auto pb-24 md:pb-8">
      <div className="max-w-[1700px] mx-auto px-4 sm:px-8 md:px-10 lg:px-12 pt-12 pb-6">

        {/* 1. Main Footer 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 pb-10">

          {/* Column 1: Brand & Narrative */}
          <div className="space-y-4">
            <Link
              to="/"
              onClick={scrollToTop}
              className="inline-flex items-center gap-2.5 text-brand-logo text-vistaro-primary hover:opacity-90 transition-opacity"
            >
              <div className="w-9 h-9 rounded-2xl bg-vistaro-accent flex items-center justify-center text-white font-medium text-sm shadow-xs">
                V
              </div>
              <span className="font-serif font-bold text-xl tracking-tight">
                Vis<span className="text-vistaro-accent">taro</span>
              </span>
            </Link>

            <p className="text-xs sm:text-sm text-vistaro-secondary leading-relaxed max-w-sm">
              Experience the serene beauty of verified luxury stays, breathtaking landscapes, and warm hospitality across curated destinations worldwide.
            </p>

            <div className="pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-vistaro-accent/10 text-vistaro-accent border border-vistaro-accent/20 text-2xs font-bold uppercase tracking-widest">
                <Sparkles className="w-3 h-3 text-vistaro-accent" />
                <span>Established 2026</span>
              </span>
            </div>
          </div>

          {/* Column 2: Navigation Links */}
          <div className="space-y-4">
            <h3 className="font-serif font-semibold text-sm sm:text-base text-vistaro-primary tracking-wide">
              Navigation
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-vistaro-muted">
              <li>
                <Link
                  to="/explore"
                  onClick={scrollToTop}
                  className="hover:text-vistaro-primary hover:translate-x-1 transition-all inline-block"
                >
                  Explore Stays & Villas
                </Link>
              </li>
              <li>
                <Link
                  to="/destinations"
                  onClick={scrollToTop}
                  className="hover:text-vistaro-primary hover:translate-x-1 transition-all inline-block"
                >
                  Destinations Guide
                </Link>
              </li>
              <li>
                <Link
                  to="/tours"
                  onClick={scrollToTop}
                  className="hover:text-vistaro-primary hover:translate-x-1 transition-all inline-block"
                >
                  Tour Packages
                </Link>
              </li>
              <li>
                <Link
                  to="/experiences"
                  onClick={scrollToTop}
                  className="hover:text-vistaro-primary hover:translate-x-1 transition-all inline-block"
                >
                  Host Experiences
                </Link>
              </li>
              <li>
                <Link
                  to="/my-bookings"
                  onClick={scrollToTop}
                  className="hover:text-vistaro-primary hover:translate-x-1 transition-all inline-block"
                >
                  My Bookings
                </Link>
              </li>
              <li>
                <Link
                  to="/travel-plans"
                  onClick={scrollToTop}
                  className="hover:text-vistaro-primary hover:translate-x-1 transition-all inline-block"
                >
                  My Travel Plans
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Support & Policies */}
          <div className="space-y-4">
            <h3 className="font-serif font-semibold text-sm sm:text-base text-vistaro-primary tracking-wide">
              Support &amp; Policies
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-vistaro-muted">
              <li>
                <Link
                  to="/contact"
                  onClick={scrollToTop}
                  className="hover:text-vistaro-primary hover:translate-x-1 transition-all inline-block"
                >
                  Contact &amp; Support
                </Link>
              </li>
              <li>
                <Link
                  to="/cancellation-policy"
                  onClick={scrollToTop}
                  className="hover:text-vistaro-primary hover:translate-x-1 transition-all inline-block"
                >
                  Cancellation Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  onClick={scrollToTop}
                  className="hover:text-vistaro-primary hover:translate-x-1 transition-all inline-block"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  onClick={scrollToTop}
                  className="hover:text-vistaro-primary hover:translate-x-1 transition-all inline-block"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/company"
                  onClick={scrollToTop}
                  className="hover:text-vistaro-primary hover:translate-x-1 transition-all inline-block"
                >
                  Company Details
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Get in Touch & Socials */}
          <div className="space-y-4">
            <h3 className="font-serif font-semibold text-sm sm:text-base text-vistaro-primary tracking-wide">
              Get in Touch
            </h3>

            {/* Contact Pills */}
            <div className="space-y-2.5">
              <Link
                to="/contact"
                onClick={scrollToTop}
                className="flex items-center gap-3 p-2.5 rounded-2xl bg-vistaro-surface border border-vistaro-border hover:border-vistaro-accent/50 transition-colors shadow-2xs group"
              >
                <div className="w-8 h-8 rounded-xl bg-vistaro-secondary flex items-center justify-center text-vistaro-accent group-hover:scale-105 transition-transform shrink-0">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-2xs text-vistaro-muted font-medium">Chat &amp; Support</div>
                  <div className="text-xs font-semibold text-vistaro-primary truncate">+1 (800) 555-0199</div>
                </div>
              </Link>

              <button
                type="button"
                onClick={handleDirectLineClick}
                className="w-full text-left flex items-center gap-3 p-2.5 rounded-2xl bg-vistaro-surface border border-vistaro-border hover:border-vistaro-accent/50 transition-colors shadow-2xs group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-vistaro-secondary flex items-center justify-center text-vistaro-accent group-hover:scale-105 transition-transform shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-2xs text-vistaro-muted font-medium">Direct Line</div>
                  <div className="text-xs font-semibold text-vistaro-primary truncate">+1 (800) 555-0144</div>
                </div>
              </button>
            </div>

            {/* Social Icons Row (Facebook, Instagram, YouTube) */}
            <div className="flex items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => handleSocialClick('Facebook')}
                className="w-9 h-9 rounded-xl bg-vistaro-surface border border-vistaro-border flex items-center justify-center text-vistaro-secondary hover:text-vistaro-accent hover:border-vistaro-accent/50 hover:bg-vistaro-secondary transition-all cursor-pointer shadow-2xs"
                aria-label="Facebook"
              >
                <svg className="w-4 h-4 fill-currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </button>

              <button
                type="button"
                onClick={() => handleSocialClick('Instagram')}
                className="w-9 h-9 rounded-xl bg-vistaro-surface border border-vistaro-border flex items-center justify-center text-vistaro-secondary hover:text-vistaro-accent hover:border-vistaro-accent/50 hover:bg-vistaro-secondary transition-all cursor-pointer shadow-2xs"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4 fill-currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </button>

              <button
                type="button"
                onClick={() => handleSocialClick('YouTube')}
                className="w-9 h-9 rounded-xl bg-vistaro-surface border border-vistaro-border flex items-center justify-center text-vistaro-secondary hover:text-vistaro-accent hover:border-vistaro-accent/50 hover:bg-vistaro-secondary transition-all cursor-pointer shadow-2xs"
                aria-label="YouTube"
              >
                <svg className="w-4 h-4 fill-currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </button>
            </div>
          </div>

        </div>

        {/* 2. Bottom Copyright & Attribution Bar */}
        <div className="pt-6 border-t border-vistaro-border flex flex-col sm:flex-row items-center justify-between gap-4 text-2xs sm:text-xs text-vistaro-muted">
          <div className="flex items-center gap-2">
            <span>&copy; {new Date().getFullYear()} VISTARO, INC.</span>
            <span>&middot;</span>
            <span>ALL RIGHTS RESERVED.</span>
          </div>

          <div className="flex items-center gap-1.5 uppercase font-semibold tracking-wider text-vistaro-secondary">
            <span>CRAFTED WITH</span>
            <Heart className="w-3.5 h-3.5 fill-vistaro-accent text-vistaro-accent inline animate-pulse" />
            <span>BY <span className="text-vistaro-primary font-bold">AAYUSH</span></span>
          </div>
        </div>

      </div>

      {/* Coming Soon Modal Popup */}
      {modalApp && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-vistaro-surface rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl border border-vistaro-border space-y-4">

            {/* Header Icon */}
            <div className="w-14 h-14 rounded-2xl bg-vistaro-main text-vistaro-accent mx-auto flex items-center justify-center shadow-xs">
              <Sparkles className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-display-h3 text-vistaro-primary">
                Coming Soon!
              </h3>
              <p className="text-body-sm text-vistaro-secondary leading-relaxed">
                {modalApp === 'Direct Line'
                  ? 'Our direct 24/7 concierge phone helpline is launching very soon! In the meantime, please reach our team anytime via the Contact & Support page.'
                  : <>Our official <b>{modalApp}</b> community is launching shortly. Follow us soon for exclusive travel perks, stay inspiration, and community stories!</>}
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setModalApp(null)}
                className="w-full bg-vistaro-accent hover:bg-vistaro-accent-hover text-white text-cta py-3 px-6 rounded-full transition-all shadow-xs cursor-pointer"
              >
                Got it, thank you!
              </button>
            </div>

          </div>
        </div>
      )}
    </footer>
  );
}
