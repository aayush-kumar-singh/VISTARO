import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Globe, Mail, Phone, MapPin, Award, Users, ShieldCheck, ChevronRight, ArrowRight } from 'lucide-react';

export default function CompanyDetailsPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="w-full max-w-[1000px] mx-auto py-6 space-y-8 animate-fade-in text-[#222222]">
      
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-zinc-500">
        <Link to="/" className="hover:underline hover:text-zinc-900">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
        <span className="text-zinc-800 font-medium">Company Details</span>
      </nav>

      {/* Header Banner */}
      <div className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 text-white rounded-3xl p-8 sm:p-12 shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold text-red-200">
            <Building2 className="w-4 h-4 text-[#dc3545]" />
            <span>Corporate Disclosure</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            About Vistaro, Inc.
          </h1>
          <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
            Connecting travelers with extraordinary stays and authentic local hosts worldwide. Discover our company background, mission, and legal registrations.
          </p>
        </div>
      </div>

      {/* Key Metrics / Value Props */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-zinc-200 rounded-3xl p-6 text-center space-y-1 shadow-xs">
          <div className="text-2xl sm:text-3xl font-extrabold text-[#dc3545]">100%</div>
          <div className="font-bold text-sm text-zinc-900">Verified Stays</div>
          <div className="text-xs text-zinc-500">Curated and reviewed homes</div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-3xl p-6 text-center space-y-1 shadow-xs">
          <div className="text-2xl sm:text-3xl font-extrabold text-[#dc3545]">24 / 7</div>
          <div className="font-bold text-sm text-zinc-900">Host & Guest Support</div>
          <div className="text-xs text-zinc-500">Always here to assist your journeys</div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-3xl p-6 text-center space-y-1 shadow-xs">
          <div className="text-2xl sm:text-3xl font-extrabold text-[#dc3545]">5+</div>
          <div className="font-bold text-sm text-zinc-900">Global Currencies</div>
          <div className="text-xs text-zinc-500">Seamless localized conversions</div>
        </div>
      </div>

      {/* Corporate Information Card */}
      <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-10 shadow-xs space-y-6 text-sm text-zinc-700 leading-relaxed">
        <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
          <Award className="w-5 h-5 text-[#dc3545]" /> Legal Entity & Registration
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-zinc-50 p-6 rounded-2xl border border-zinc-200/80 text-xs sm:text-sm">
          <div className="space-y-3">
            <div>
              <span className="text-xs font-semibold text-zinc-400 block uppercase tracking-wider">Company Name</span>
              <span className="font-bold text-zinc-900">Vistaro Hospitality, Inc.</span>
            </div>
            <div>
              <span className="text-xs font-semibold text-zinc-400 block uppercase tracking-wider">Business ID / CIN</span>
              <span className="font-medium text-zinc-800">U55101CA2026PTC892100</span>
            </div>
            <div>
              <span className="text-xs font-semibold text-zinc-400 block uppercase tracking-wider">Platform Type</span>
              <span className="font-medium text-zinc-800">Online Marketplace & Hospitality Network</span>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-xs font-semibold text-zinc-400 block uppercase tracking-wider">Registered Global Headquarters</span>
              <span className="font-medium text-zinc-800 block">
                100 Horizon Boulevard, Suite 400<br />
                San Francisco, CA 94107, United States
              </span>
            </div>
            <div>
              <span className="text-xs font-semibold text-zinc-400 block uppercase tracking-wider">Contact Channels</span>
              <span className="font-medium text-zinc-800 block">
                Support: <b>contact@vistaro.com</b><br />
                Partnerships: <b>partners@vistaro.com</b>
              </span>
            </div>
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="space-y-3 pt-4 border-t border-zinc-100">
          <h3 className="font-bold text-base text-zinc-900">Our Mission</h3>
          <p>
            Vistaro was built on the belief that travel is most meaningful when it fosters genuine human connections. We empower homeowners to share their unique spaces while providing guests with transparent pricing, instant booking confirmation, and safe communication.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="pt-6 border-t border-zinc-100 flex flex-col sm:flex-row items-center gap-4">
          <Link
            to="/"
            className="w-full sm:w-auto bg-[#dc3545] hover:bg-[#b02a37] text-white text-xs font-bold py-3 px-6 rounded-full transition-all text-center flex items-center justify-center gap-2 shadow-xs"
          >
            <span>Explore Stays</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/privacy"
            className="w-full sm:w-auto bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold py-3 px-6 rounded-full transition-all text-center"
          >
            Trust & Safety
          </Link>
        </div>

      </div>

    </div>
  );
}
