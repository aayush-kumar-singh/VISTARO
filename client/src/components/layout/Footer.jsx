import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Sparkles } from 'lucide-react';
import { useToast } from '../../context/ToastContext.jsx';

export default function Footer() {
  const { showToast } = useToast();
  const [modalApp, setModalApp] = useState(null);

  const handleSocialClick = (appName) => {
    setModalApp(appName);
    showToast(`${appName} community coming soon!`, 'info');
  };

  return (
    <footer className="w-full bg-vistaro-secondary border-t border-vistaro-border mt-auto">
      <div className="max-w-[1700px] mx-auto px-4 sm:px-8 md:px-10 lg:px-12 py-10">

        {/* Social Icons */}
        <div className="flex justify-center items-center gap-6 mb-4 text-vistaro-secondary">
          <button
            type="button"
            onClick={() => handleSocialClick('Facebook')}
            className="hover:text-vistaro-accent transition-colors p-2 rounded-full hover:bg-vistaro-surface shadow-xs cursor-pointer border-none bg-transparent"
            aria-label="Facebook"
          >
            <svg className="w-5 h-5 fill-currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => handleSocialClick('Instagram')}
            className="hover:text-vistaro-accent transition-colors p-2 rounded-full hover:bg-vistaro-surface shadow-xs cursor-pointer border-none bg-transparent"
            aria-label="Instagram"
          >
            <svg className="w-5 h-5 fill-currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => handleSocialClick('LinkedIn')}
            className="hover:text-vistaro-accent transition-colors p-2 rounded-full hover:bg-vistaro-surface shadow-xs cursor-pointer border-none bg-transparent"
            aria-label="LinkedIn"
          >
            <svg className="w-5 h-5 fill-currentColor" viewBox="0 0 24 24">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
            </svg>
          </button>
        </div>

        {/* Copyright & Masthead */}
        <div className="text-center text-footer text-vistaro-secondary mb-4 flex items-center justify-center gap-1">
          <span>&copy; {new Date().getFullYear()} Vistaro, Inc. Crafted with</span>
          <Heart className="w-3.5 h-3.5 fill-vistaro-accent text-vistaro-accent" />
          <span>for explorers worldwide.</span>
        </div>

        {/* Functional Footer Links */}
        <div className="flex justify-center items-center gap-6 text-footer text-vistaro-muted">
          <Link
            to="/privacy"
            className="hover:underline hover:text-vistaro-primary transition-colors"
          >
            Privacy
          </Link>
          <span>&middot;</span>
          <Link
            to="/terms"
            className="hover:underline hover:text-vistaro-primary transition-colors"
          >
            Terms
          </Link>
          <span>&middot;</span>
          <Link
            to="/company"
            className="hover:underline hover:text-vistaro-primary transition-colors"
          >
            Company details
          </Link>
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
                Our official <b>{modalApp}</b> community is launching shortly. Follow us soon for exclusive travel perks, stay inspiration, and community stories!
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
