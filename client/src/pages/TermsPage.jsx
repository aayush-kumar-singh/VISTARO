import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Scale, ChevronRight } from 'lucide-react';

export default function TermsPage() {
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
        <span className="text-vistaro-primary font-medium">Terms of Service</span>
      </nav>

      {/* Header Banner */}
      <div className="bg-vistaro-secondary border border-vistaro-border text-vistaro-primary rounded-3xl p-8 sm:p-12 shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 bg-vistaro-surface border border-vistaro-accent/30 px-3.5 py-1.5 rounded-full text-caption text-vistaro-accent">
            <Scale className="w-4 h-4 text-vistaro-accent" />
            <span>Legal Agreement</span>
          </div>
          <h1 className="text-display-hero text-3xl sm:text-4xl text-vistaro-primary">
            Vistaro Terms of Service
          </h1>
          <p className="text-body text-vistaro-secondary leading-relaxed">
            Please read these terms carefully before accessing or using the Vistaro marketplace and reservation services.
          </p>
          <div className="text-caption text-vistaro-muted pt-2">
            Effective Date: August 20, 2026 &middot; Version 2.1
          </div>
        </div>
      </div>

      {/* Terms Sections */}
      <div className="space-y-8 bg-vistaro-surface border border-vistaro-border rounded-3xl p-6 sm:p-10 shadow-xs leading-relaxed text-body text-vistaro-secondary">

        <section className="space-y-3">
          <h2 className="text-display-h3 text-xl text-vistaro-primary flex items-center gap-2">
            <span className="text-vistaro-accent font-sans font-bold">1.</span> Acceptance of Terms
          </h2>
          <p>
            By creating an account, browsing listings, publishing a space, or submitting a stay booking on Vistaro, you agree to be bound by these Terms of Service, our Privacy Policy, and all applicable municipal and federal regulations.
          </p>
        </section>

        <section className="space-y-3 pt-6 border-t border-vistaro-border">
          <h2 className="text-display-h3 text-xl text-vistaro-primary flex items-center gap-2">
            <span className="text-vistaro-accent font-sans font-bold">2.</span> Guest Bookings & Payment Terms
          </h2>
          <p>
            When booking a stay:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-vistaro-secondary text-body-sm">
            <li>Guests agree to pay the listed nightly rate plus applicable taxes (such as 18% GST).</li>
            <li>Bookings are confirmed immediately upon submission, and automated email confirmation receipts are dispatched.</li>
            <li>Guests agree to respect the maximum guest limits and ground rules established by the host.</li>
          </ul>
        </section>

        <section className="space-y-3 pt-6 border-t border-vistaro-border">
          <h2 className="text-display-h3 text-xl text-vistaro-primary flex items-center gap-2">
            <span className="text-vistaro-accent font-sans font-bold">3.</span> Host Responsibilities & Listing Accuracy
          </h2>
          <p>
            Hosts who list properties on Vistaro represent and warrant that:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-vistaro-secondary text-body-sm">
            <li>All photos, amenities, descriptions, and pricing accurately depict the property condition.</li>
            <li>The property complies with local residential, safety, and fire code requirements.</li>
            <li>Hosts agree to honor confirmed guest reservations without unreasonable unilateral cancellations.</li>
          </ul>
        </section>

        <section className="space-y-3 pt-6 border-t border-vistaro-border">
          <h2 className="text-display-h3 text-xl text-vistaro-primary flex items-center gap-2">
            <span className="text-vistaro-accent font-sans font-bold">4.</span> Cancellation & Refund Rules
          </h2>
          <p>
            Each listing clearly specifies one of three standardized cancellation tiers:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            <div className="bg-vistaro-secondary border border-vistaro-border rounded-2xl p-4 text-body-sm">
              <div className="font-semibold text-body-sm text-vistaro-primary mb-1">Flexible Policy</div>
              <p className="text-body-sm text-vistaro-secondary">Full 100% refund for cancellations made up to 48 hours prior to scheduled check-in.</p>
            </div>
            <div className="bg-vistaro-secondary border border-vistaro-border rounded-2xl p-4 text-body-sm">
              <div className="font-semibold text-body-sm text-vistaro-primary mb-1">Moderate Policy</div>
              <p className="text-body-sm text-vistaro-secondary">Full 100% refund up to 5 days before check-in; 50% refund thereafter.</p>
            </div>
            <div className="bg-vistaro-secondary border border-vistaro-border rounded-2xl p-4 text-body-sm">
              <div className="font-semibold text-body-sm text-vistaro-primary mb-1">Strict Policy</div>
              <p className="text-body-sm text-vistaro-secondary">50% refund for cancellations up to 7 days before check-in; non-refundable thereafter.</p>
            </div>
          </div>
        </section>

        <section className="space-y-3 pt-6 border-t border-vistaro-border">
          <h2 className="text-display-h3 text-xl text-vistaro-primary flex items-center gap-2">
            <span className="text-vistaro-accent font-sans font-bold">5.</span> Governing Law & Support
          </h2>
          <p>
            These terms are governed by the laws of California, United States. For disputes or resolution requests, please reach out to our legal department at <span className="font-semibold text-vistaro-primary">legal@vistaro.com</span>.
          </p>
        </section>

      </div>

    </div>
  );
}
