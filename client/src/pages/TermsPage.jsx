import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, ShieldAlert, CheckCircle, Scale, AlertCircle, ChevronRight } from 'lucide-react';

export default function TermsPage() {
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
        <span className="text-zinc-800 font-medium">Terms of Service</span>
      </nav>

      {/* Header Banner */}
      <div className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 text-white rounded-3xl p-8 sm:p-12 shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold text-red-200">
            <Scale className="w-4 h-4 text-[#dc3545]" />
            <span>Legal Agreement</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Vistaro Terms of Service
          </h1>
          <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
            Please read these terms carefully before accessing or using the Vistaro marketplace and reservation services.
          </p>
          <div className="text-xs text-zinc-400 pt-2">
            Effective Date: August 20, 2026 &middot; Version 2.1
          </div>
        </div>
      </div>

      {/* Terms Sections */}
      <div className="space-y-8 bg-white border border-zinc-200 rounded-3xl p-6 sm:p-10 shadow-xs leading-relaxed text-sm text-zinc-700">
        
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
            <span className="text-[#dc3545]">1.</span> Acceptance of Terms
          </h2>
          <p>
            By creating an account, browsing listings, publishing a space, or submitting a stay booking on Vistaro, you agree to be bound by these Terms of Service, our Privacy Policy, and all applicable municipal and federal regulations.
          </p>
        </section>

        <section className="space-y-3 pt-6 border-t border-zinc-100">
          <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
            <span className="text-[#dc3545]">2.</span> Guest Bookings & Payment Terms
          </h2>
          <p>
            When booking a stay:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-zinc-600 text-xs sm:text-sm">
            <li>Guests agree to pay the listed nightly rate plus applicable taxes (such as 18% GST).</li>
            <li>Bookings are confirmed immediately upon submission, and automated email confirmation receipts are dispatched.</li>
            <li>Guests agree to respect the maximum guest limits and ground rules established by the host.</li>
          </ul>
        </section>

        <section className="space-y-3 pt-6 border-t border-zinc-100">
          <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
            <span className="text-[#dc3545]">3.</span> Host Responsibilities & Listing Accuracy
          </h2>
          <p>
            Hosts who list properties on Vistaro represent and warrant that:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-zinc-600 text-xs sm:text-sm">
            <li>All photos, amenities, descriptions, and pricing accurately depict the property condition.</li>
            <li>The property complies with local residential, safety, and fire code requirements.</li>
            <li>Hosts agree to honor confirmed guest reservations without unreasonable unilateral cancellations.</li>
          </ul>
        </section>

        <section className="space-y-3 pt-6 border-t border-zinc-100">
          <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
            <span className="text-[#dc3545]">4.</span> Cancellation & Refund Rules
          </h2>
          <p>
            Each listing clearly specifies one of three standardized cancellation tiers:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 text-xs">
              <div className="font-bold text-zinc-900 mb-1">Flexible Policy</div>
              <p className="text-zinc-600">Full 100% refund for cancellations made up to 48 hours prior to scheduled check-in.</p>
            </div>
            <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 text-xs">
              <div className="font-bold text-zinc-900 mb-1">Moderate Policy</div>
              <p className="text-zinc-600">Full 100% refund up to 5 days before check-in; 50% refund thereafter.</p>
            </div>
            <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 text-xs">
              <div className="font-bold text-zinc-900 mb-1">Strict Policy</div>
              <p className="text-zinc-600">50% refund for cancellations up to 7 days before check-in; non-refundable thereafter.</p>
            </div>
          </div>
        </section>

        <section className="space-y-3 pt-6 border-t border-zinc-100">
          <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
            <span className="text-[#dc3545]">5.</span> Governing Law & Support
          </h2>
          <p>
            These terms are governed by the laws of California, United States. For disputes or resolution requests, please reach out to our legal department at <span className="font-semibold text-zinc-900">legal@vistaro.com</span>.
          </p>
        </section>

      </div>

    </div>
  );
}
