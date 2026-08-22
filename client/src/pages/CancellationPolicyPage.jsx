import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarX2,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Home,
  Compass,
  Zap,
  Car,
} from 'lucide-react';

export default function CancellationPolicyPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="w-full py-6 space-y-10 pb-16 animate-fade-in text-vistaro-primary transition-colors duration-200">
      
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-nav-link text-vistaro-muted">
        <Link to="/" className="hover:underline hover:text-vistaro-primary">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-vistaro-muted" />
        <span className="text-vistaro-primary font-medium">Cancellation Policy</span>
      </nav>

      {/* Header Banner */}
      <div className="bg-vistaro-secondary border border-vistaro-border text-vistaro-primary rounded-3xl p-8 sm:p-12 shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 bg-vistaro-surface border border-vistaro-accent/30 px-3.5 py-1.5 rounded-full text-caption text-vistaro-accent">
            <CalendarX2 className="w-4 h-4 text-vistaro-accent" />
            <span>Standardized Guest Protection</span>
          </div>
          <h1 className="text-display-hero text-3xl sm:text-4xl text-vistaro-primary font-bold">
            Vistaro Cancellation Policy
          </h1>
          <p className="text-body text-vistaro-secondary leading-relaxed">
            Transparent, tiered refund terms across stays, guided expeditions, and host experiences designed to protect both travelers and local hosts.
          </p>
          <div className="text-caption text-vistaro-muted pt-2">
            Last Updated: August 2026 &middot; Multi-Tier Refund Framework
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Tier 1: Flexible */}
        <div className="bg-vistaro-surface border border-vistaro-border rounded-3xl p-6 sm:p-7 space-y-4 shadow-xs relative flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                Tier 1
              </span>
              <Clock className="w-5 h-5 text-emerald-500" />
            </div>
            <h2 className="text-display-h2 text-2xl font-bold text-vistaro-primary">Flexible</h2>
            <p className="text-body-sm text-vistaro-secondary leading-relaxed">
              Ideal for spontaneous getaways and low-commitment reservations.
            </p>
            <div className="space-y-2 pt-2 text-xs">
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-medium space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> 100% Full Refund
                </p>
                <p className="text-[11px] opacity-90">Up to 48 hours before scheduled check-in or activity start.</p>
              </div>
              <div className="p-3 rounded-2xl bg-vistaro-secondary/60 border border-vistaro-border text-vistaro-muted space-y-1">
                <p className="font-semibold text-vistaro-primary flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-vistaro-error" /> 0% Refund
                </p>
                <p className="text-[11px]">Under 48 hours before check-in or after start time.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tier 2: Moderate */}
        <div className="bg-vistaro-surface border border-vistaro-border rounded-3xl p-6 sm:p-7 space-y-4 shadow-xs relative flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-sky-500/10 text-sky-500 border border-sky-500/20">
                Tier 2
              </span>
              <Clock className="w-5 h-5 text-sky-500" />
            </div>
            <h2 className="text-display-h2 text-2xl font-bold text-vistaro-primary">Moderate</h2>
            <p className="text-body-sm text-vistaro-secondary leading-relaxed">
              Balanced protection for curated villas and multi-day packages.
            </p>
            <div className="space-y-2 pt-2 text-xs">
              <div className="p-3 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-400 font-medium space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> 100% Full Refund
                </p>
                <p className="text-[11px] opacity-90">Up to 120 hours (5 full days) prior to start.</p>
              </div>
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-medium space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <RefreshCw className="w-4 h-4" /> 50% Partial Refund
                </p>
                <p className="text-[11px] opacity-90">Between 48 and 120 hours before check-in.</p>
              </div>
              <div className="p-3 rounded-2xl bg-vistaro-secondary/60 border border-vistaro-border text-vistaro-muted space-y-1">
                <p className="font-semibold text-vistaro-primary flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-vistaro-error" /> 0% Refund
                </p>
                <p className="text-[11px]">Under 48 hours before check-in.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tier 3: Strict */}
        <div className="bg-vistaro-surface border border-vistaro-border rounded-3xl p-6 sm:p-7 space-y-4 shadow-xs relative flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/10 text-rose-500 border border-rose-500/20">
                Tier 3
              </span>
              <Clock className="w-5 h-5 text-rose-500" />
            </div>
            <h2 className="text-display-h2 text-2xl font-bold text-vistaro-primary">Strict</h2>
            <p className="text-body-sm text-vistaro-secondary leading-relaxed">
              For high-demand peak villas and high-altitude guided expeditions.
            </p>
            <div className="space-y-2 pt-2 text-xs">
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 font-medium space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> 50% Partial Refund
                </p>
                <p className="text-[11px] opacity-90">Up to 168 hours (7 full days) prior to start.</p>
              </div>
              <div className="p-3 rounded-2xl bg-vistaro-secondary/60 border border-vistaro-border text-vistaro-muted space-y-1">
                <p className="font-semibold text-vistaro-primary flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-vistaro-error" /> 0% Refund
                </p>
                <p className="text-[11px]">Under 168 hours (7 days) before start or after departure.</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Multi-Service Breakdown Table */}
      <div className="bg-vistaro-surface border border-vistaro-border rounded-3xl p-6 sm:p-10 shadow-xs space-y-6">
        <div className="space-y-1">
          <h2 className="text-display-h2 text-2xl font-bold text-vistaro-primary">
            How Cancellation Applies Across Travel Categories
          </h2>
          <p className="text-body text-vistaro-secondary">
            Each booking snapshots its active policy tier at the time of reservation.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-vistaro-border text-vistaro-muted">
                <th className="pb-3 font-semibold">Service Type</th>
                <th className="pb-3 font-semibold">Default Policy</th>
                <th className="pb-3 font-semibold">Full Refund Window (100%)</th>
                <th className="pb-3 font-semibold">Partial Refund Window (50%)</th>
                <th className="pb-3 font-semibold">Non-Refundable Window (0%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-vistaro-border text-vistaro-secondary">
              <tr>
                <td className="py-4 font-semibold text-vistaro-primary flex items-center gap-2">
                  <Home className="w-4 h-4 text-vistaro-accent" /> Stays & Villas
                </td>
                <td className="py-4">Host-configured (Flexible / Moderate / Strict)</td>
                <td className="py-4 text-emerald-500 font-semibold">&ge; 48 hrs (Flexible) or &ge; 120 hrs (Moderate)</td>
                <td className="py-4 text-amber-500 font-semibold">48 – 120 hrs (Moderate) or &ge; 168 hrs (Strict)</td>
                <td className="py-4 text-rose-500 font-semibold">&lt; 48 hrs (&lt; 168 hrs on Strict)</td>
              </tr>
              <tr>
                <td className="py-4 font-semibold text-vistaro-primary flex items-center gap-2">
                  <Compass className="w-4 h-4 text-sky-500" /> Tour Packages
                </td>
                <td className="py-4">Flexible / Moderate (Expedition preparation)</td>
                <td className="py-4 text-emerald-500 font-semibold">&ge; 48 hrs (Flexible) or &ge; 120 hrs (Moderate)</td>
                <td className="py-4 text-amber-500 font-semibold">48 – 120 hrs (Moderate)</td>
                <td className="py-4 text-rose-500 font-semibold">&lt; 48 hrs</td>
              </tr>
              <tr>
                <td className="py-4 font-semibold text-vistaro-primary flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" /> Host Experiences
                </td>
                <td className="py-4">Flexible (Per-slot capacity)</td>
                <td className="py-4 text-emerald-500 font-semibold">&ge; 48 hrs prior to slot time</td>
                <td className="py-4 text-vistaro-muted">N/A (Full refund or none)</td>
                <td className="py-4 text-rose-500 font-semibold">&lt; 48 hrs</td>
              </tr>
              <tr>
                <td className="py-4 font-semibold text-vistaro-primary flex items-center gap-2">
                  <Car className="w-4 h-4 text-indigo-500" /> Transfers
                </td>
                <td className="py-4">Flexible (Transit itinerary)</td>
                <td className="py-4 text-emerald-500 font-semibold">&ge; 24 hrs prior to pickup</td>
                <td className="py-4 text-vistaro-muted">N/A</td>
                <td className="py-4 text-rose-500 font-semibold">&lt; 24 hrs</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Automated Refund Process Steps */}
      <div className="bg-vistaro-surface border border-vistaro-border rounded-3xl p-6 sm:p-10 shadow-xs space-y-6">
        <h2 className="text-display-h2 text-2xl font-bold text-vistaro-primary">
          Automated Refund & Processing Flow
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-vistaro-secondary">
          
          <div className="p-5 rounded-2xl bg-vistaro-secondary/50 border border-vistaro-border space-y-2">
            <div className="w-8 h-8 rounded-xl bg-vistaro-surface border border-vistaro-border text-vistaro-accent font-bold flex items-center justify-center">
              1
            </div>
            <h3 className="text-display-h3 text-sm font-bold text-vistaro-primary">Self-Service Request</h3>
            <p className="leading-relaxed">
              Navigate to <b>My Bookings</b>, click on your active reservation receipt, and select "Cancel Reservation".
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-vistaro-secondary/50 border border-vistaro-border space-y-2">
            <div className="w-8 h-8 rounded-xl bg-vistaro-surface border border-vistaro-border text-vistaro-accent font-bold flex items-center justify-center">
              2
            </div>
            <h3 className="text-display-h3 text-sm font-bold text-vistaro-primary">Instant Calculation</h3>
            <p className="leading-relaxed">
              Our automated engine calculates the exact eligible refund percentage against your check-in timestamp and releases your slot immediately.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-vistaro-secondary/50 border border-vistaro-border space-y-2">
            <div className="w-8 h-8 rounded-xl bg-vistaro-surface border border-vistaro-border text-vistaro-accent font-bold flex items-center justify-center">
              3
            </div>
            <h3 className="text-display-h3 text-sm font-bold text-vistaro-primary">Electronic Reimbursement</h3>
            <p className="leading-relaxed">
              An itemized cancellation receipt is emailed immediately. Eligible refunds credit back to your original payment method in <b>3–5 business days</b>.
            </p>
          </div>

        </div>
      </div>

      {/* Extenuating Circumstances & Support CTA */}
      <div className="bg-vistaro-secondary/60 border border-vistaro-border rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1.5 text-center sm:text-left">
          <h3 className="text-display-h3 text-lg font-bold text-vistaro-primary">
            Need special assistance with an urgent cancellation?
          </h3>
          <p className="text-body-sm text-vistaro-secondary">
            Severe weather warnings, official government travel advisories, or verified medical emergencies qualify for manual support review.
          </p>
        </div>
        <Link
          to="/contact"
          className="inline-flex items-center justify-center gap-2 bg-vistaro-accent hover:bg-vistaro-accent-hover text-white text-cta py-3 px-6 rounded-full transition-all shadow-xs shrink-0 cursor-pointer"
        >
          <span>Contact Concierge</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

    </div>
  );
}
