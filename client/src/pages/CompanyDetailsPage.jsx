import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Award, ChevronRight, ArrowRight } from 'lucide-react';

export default function CompanyDetailsPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="w-full max-w-[1000px] mx-auto py-6 space-y-8 animate-fade-in text-vistaro-primary transition-colors duration-200">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-vistaro-muted">
        <Link to="/" className="hover:underline hover:text-vistaro-primary">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-vistaro-muted" />
        <span className="text-vistaro-primary font-medium">Company Details</span>
      </nav>

      {/* Header Banner */}
      <div className="bg-vistaro-secondary border border-vistaro-border text-vistaro-primary rounded-3xl p-8 sm:p-12 shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 bg-vistaro-surface border border-vistaro-accent/30 px-3.5 py-1.5 rounded-full text-xs font-semibold text-vistaro-accent">
            <Building2 className="w-4 h-4 text-vistaro-accent" />
            <span>Corporate Disclosure</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-vistaro-primary">
            About Vistaro, Inc.
          </h1>
          <p className="text-vistaro-secondary text-sm sm:text-base leading-relaxed">
            Connecting travelers with extraordinary stays and authentic local hosts worldwide. Discover our company background, mission, and legal registrations.
          </p>
        </div>
      </div>

      {/* Key Metrics / Value Props */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-vistaro-surface border border-vistaro-border rounded-3xl p-6 text-center space-y-1 shadow-xs">
          <div className="text-2xl sm:text-3xl font-extrabold text-vistaro-accent">100%</div>
          <div className="font-bold text-sm text-vistaro-primary">Verified Stays</div>
          <div className="text-xs text-vistaro-muted">Curated and reviewed homes</div>
        </div>

        <div className="bg-vistaro-surface border border-vistaro-border rounded-3xl p-6 text-center space-y-1 shadow-xs">
          <div className="text-2xl sm:text-3xl font-extrabold text-vistaro-accent">24 / 7</div>
          <div className="font-bold text-sm text-vistaro-primary">Host & Guest Support</div>
          <div className="text-xs text-vistaro-muted">Always here to assist your journeys</div>
        </div>

        <div className="bg-vistaro-surface border border-vistaro-border rounded-3xl p-6 text-center space-y-1 shadow-xs">
          <div className="text-2xl sm:text-3xl font-extrabold text-vistaro-accent">5+</div>
          <div className="font-bold text-sm text-vistaro-primary">Global Currencies</div>
          <div className="text-xs text-vistaro-muted">Seamless localized conversions</div>
        </div>
      </div>

      {/* Corporate Information Card */}
      <div className="bg-vistaro-surface border border-vistaro-border rounded-3xl p-6 sm:p-10 shadow-xs space-y-6 text-sm text-vistaro-secondary leading-relaxed">
        <h2 className="text-lg font-bold text-vistaro-primary flex items-center gap-2">
          <Award className="w-5 h-5 text-vistaro-accent" /> Legal Entity & Registration
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-vistaro-secondary p-6 rounded-2xl border border-vistaro-border text-xs sm:text-sm">
          <div className="space-y-3">
            <div>
              <span className="text-xs font-semibold text-vistaro-muted block uppercase tracking-wider">Company Name</span>
              <span className="font-bold text-vistaro-primary">Vistaro Hospitality, Inc.</span>
            </div>
            <div>
              <span className="text-xs font-semibold text-vistaro-muted block uppercase tracking-wider">Business ID / CIN</span>
              <span className="font-medium text-vistaro-primary">U55101CA2026PTC892100</span>
            </div>
            <div>
              <span className="text-xs font-semibold text-vistaro-muted block uppercase tracking-wider">Platform Type</span>
              <span className="font-medium text-vistaro-primary">Online Marketplace & Hospitality Network</span>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-xs font-semibold text-vistaro-muted block uppercase tracking-wider">Registered Global Headquarters</span>
              <span className="font-medium text-vistaro-primary block">
                100 Horizon Boulevard, Suite 400<br />
                San Francisco, CA 94107, United States
              </span>
            </div>
            <div>
              <span className="text-xs font-semibold text-vistaro-muted block uppercase tracking-wider">Contact Channels</span>
              <span className="font-medium text-vistaro-primary block">
                Support: <b>contact@vistaro.com</b><br />
                Partnerships: <b>partners@vistaro.com</b>
              </span>
            </div>
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="space-y-3 pt-4 border-t border-vistaro-border">
          <h3 className="font-bold text-base text-vistaro-primary">Our Mission</h3>
          <p>
            Vistaro was built on the belief that travel is most meaningful when it fosters genuine human connections. We empower homeowners to share their unique spaces while providing guests with transparent pricing, instant booking confirmation, and safe communication.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="pt-6 border-t border-vistaro-border flex flex-col sm:flex-row items-center gap-4">
          <Link
            to="/"
            className="w-full sm:w-auto bg-vistaro-accent hover:bg-vistaro-accent-hover text-white text-xs font-bold py-3 px-6 rounded-full transition-all text-center flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            <span>Explore Stays</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/privacy"
            className="w-full sm:w-auto bg-vistaro-surface border border-vistaro-border hover:bg-vistaro-secondary text-vistaro-primary text-xs font-bold py-3 px-6 rounded-full transition-all text-center cursor-pointer"
          >
            Trust & Safety
          </Link>
        </div>

      </div>

    </div>
  );
}
