import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, Eye, CheckCircle2, ChevronRight } from 'lucide-react';

export default function PrivacyPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="w-full max-w-[1000px] mx-auto py-6 space-y-8 animate-fade-in text-vistaro-primary transition-colors duration-200">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-nav-link text-vistaro-muted">
        <Link to="/" className="hover:underline hover:text-vistaro-primary">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-vistaro-muted" />
        <span className="text-vistaro-primary font-medium">Privacy Policy</span>
      </nav>

      {/* Header Banner */}
      <div className="bg-vistaro-secondary border border-vistaro-border text-vistaro-primary rounded-3xl p-8 sm:p-12 shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 bg-vistaro-surface border border-vistaro-accent/30 px-3.5 py-1.5 rounded-full text-caption text-vistaro-accent">
            <Shield className="w-4 h-4 text-vistaro-accent" />
            <span>Privacy & Data Protection</span>
          </div>
          <h1 className="text-display-hero text-3xl sm:text-4xl text-vistaro-primary">
            Vistaro Privacy Policy
          </h1>
          <p className="text-body text-vistaro-secondary leading-relaxed">
            Your privacy is paramount. Learn how we collect, safeguard, and responsibly manage your personal information across the Vistaro platform.
          </p>
          <div className="text-caption text-vistaro-muted pt-2">
            Last Updated: August 20, 2026 &middot; Version 2.1
          </div>
        </div>
      </div>

      {/* Quick Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-vistaro-secondary border border-vistaro-border rounded-2xl p-5 space-y-2">
          <div className="w-9 h-9 rounded-xl bg-vistaro-surface border border-vistaro-border text-vistaro-accent flex items-center justify-center font-bold">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-display-h3 text-base text-vistaro-primary">End-to-End Encryption</h3>
          <p className="text-body-sm text-vistaro-secondary leading-relaxed">
            Your sensitive payment information and authentication sessions are securely encrypted with industry-standard protocols.
          </p>
        </div>

        <div className="bg-vistaro-secondary border border-vistaro-border rounded-2xl p-5 space-y-2">
          <div className="w-9 h-9 rounded-xl bg-vistaro-surface border border-vistaro-border text-vistaro-accent flex items-center justify-center font-bold">
            <Eye className="w-5 h-5" />
          </div>
          <h3 className="text-display-h3 text-base text-vistaro-primary">No Data Selling</h3>
          <p className="text-body-sm text-vistaro-secondary leading-relaxed">
            We never sell your personal data, travel history, or contact details to third-party advertisers or data brokers.
          </p>
        </div>

        <div className="bg-vistaro-secondary border border-vistaro-border rounded-2xl p-5 space-y-2">
          <div className="w-9 h-9 rounded-xl bg-vistaro-surface border border-vistaro-border text-vistaro-accent flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h3 className="text-display-h3 text-base text-vistaro-primary">Full User Control</h3>
          <p className="text-body-sm text-vistaro-secondary leading-relaxed">
            You can review, export, or permanently delete your account data and saved stays at any time from your profile.
          </p>
        </div>
      </div>

      {/* Privacy Content Sections */}
      <div className="space-y-8 bg-vistaro-surface border border-vistaro-border rounded-3xl p-6 sm:p-10 shadow-xs leading-relaxed text-body text-vistaro-secondary">

        <section className="space-y-3">
          <h2 className="text-display-h3 text-xl text-vistaro-primary flex items-center gap-2">
            <span className="text-vistaro-accent font-sans font-bold">1.</span> Information We Collect
          </h2>
          <p>
            When you browse, register, list spaces, or make reservations on Vistaro, we collect:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-vistaro-secondary text-body-sm">
            <li><b>Account Information:</b> Username, verified email address, profile picture, and encrypted password credentials.</li>
            <li><b>Listing & Property Data:</b> Location coordinates, photos, amenities, nightly pricing, and cancellation policy preferences submitted by hosts.</li>
            <li><b>Booking & Transaction Details:</b> Check-in/check-out dates, guest count, total cost, and automated confirmation receipts.</li>
            <li><b>Communication Data:</b> Messages exchanged through the Vistaro host-guest chat platform.</li>
          </ul>
        </section>

        <section className="space-y-3 pt-6 border-t border-vistaro-border">
          <h2 className="text-display-h3 text-xl text-vistaro-primary flex items-center gap-2">
            <span className="text-vistaro-accent font-sans font-bold">2.</span> How We Use Your Data
          </h2>
          <p>We use the collected information strictly for:</p>
          <ul className="list-disc pl-5 space-y-1.5 text-vistaro-secondary text-body-sm">
            <li>Facilitating reservations, payment receipt distribution, and booking confirmations.</li>
            <li>Enabling real-time communication between hosts and prospective guests.</li>
            <li>Accurate geocoding and interactive map rendering via Geoapify and OpenStreetMap.</li>
            <li>Detecting fraud, preventing NoSQL injection, and maintaining platform security.</li>
          </ul>
        </section>

        <section className="space-y-3 pt-6 border-t border-vistaro-border">
          <h2 className="text-display-h3 text-xl text-vistaro-primary flex items-center gap-2">
            <span className="text-vistaro-accent font-sans font-bold">3.</span> Cookies & Session Storage
          </h2>
          <p>
            Vistaro uses secure HTTP-only session cookies and local currency preferences to provide a seamless browsing experience. We do not employ intrusive tracking pixels.
          </p>
        </section>

        <section className="space-y-3 pt-6 border-t border-vistaro-border">
          <h2 className="text-display-h3 text-xl text-vistaro-primary flex items-center gap-2">
            <span className="text-vistaro-accent font-sans font-bold">4.</span> Contact Our Privacy Officer
          </h2>
          <p>
            If you have questions regarding this policy or wish to exercise your data access rights, please contact us at:
          </p>
          <div className="bg-vistaro-secondary border border-vistaro-border rounded-2xl p-4 text-body-sm space-y-1">
            <div className="font-semibold text-vistaro-primary">Vistaro Privacy & Compliance Team</div>
            <div className="text-vistaro-muted">Email: privacy@vistaro.com</div>
            <div className="text-vistaro-muted">Address: 100 Horizon Boulevard, Suite 400, San Francisco, CA 94107</div>
          </div>
        </section>

      </div>

    </div>
  );
}
