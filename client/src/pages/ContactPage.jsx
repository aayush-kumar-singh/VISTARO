import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { supportApi } from '../api/supportApi.js';
import {
  LifeBuoy,
  Send,
  CheckCircle2,
  AlertCircle,
  Mail,
  Phone,
  Clock,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  MessageSquare,
  HelpCircle,
} from 'lucide-react';

const CATEGORIES = [
  { id: 'General', label: 'General Inquiry', icon: HelpCircle },
  { id: 'Booking Issue', label: 'Booking & Payment', icon: MessageSquare },
  { id: 'Account', label: 'Account & Security', icon: ShieldCheck },
  { id: 'Feedback', label: 'Platform Feedback', icon: LifeBuoy },
  { id: 'Other', label: 'Other Inquiries', icon: Send },
];

export default function ContactPage() {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    category: 'General',
    message: '',
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [successData, setSuccessData] = useState(null);

  // Pre-fill user profile if logged in
  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        name: prev.name || user.name || user.username || '',
        email: prev.email || user.email || '',
      }));
    }
  }, [user]);

  // Client-side Validation
  const validateForm = () => {
    const errors = {};
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

    if (!form.name.trim() || form.name.trim().length < 2) {
      errors.name = 'Please enter your name (at least 2 characters).';
    }

    if (!form.email.trim() || !emailRegex.test(form.email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!form.subject.trim() || form.subject.trim().length < 3) {
      errors.subject = 'Please enter a subject (at least 3 characters).';
    }

    if (!form.message.trim() || form.message.trim().length < 10) {
      errors.message = 'Please provide a message with at least 10 characters.';
    } else if (form.message.trim().length > 3000) {
      errors.message = 'Message cannot exceed 3,000 characters.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError(null);

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      const res = await supportApi.submitContact(form);
      setSuccessData(res);
      showSuccess('Your message has been sent to Vistaro Support.');
    } catch (err) {
      const errMsg = err.response?.data?.error || err.message || 'Failed to submit inquiry. Please try again.';
      setServerError(errMsg);
      showError(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSuccessData(null);
    setServerError(null);
    setFieldErrors({});
    setForm({
      name: user?.name || user?.username || '',
      email: user?.email || '',
      subject: '',
      category: 'General',
      message: '',
    });
  };

  return (
    <div className="w-full space-y-8 pb-16 text-vistaro-primary transition-colors duration-200">
      
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-vistaro-border">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-vistaro-secondary text-vistaro-accent border border-vistaro-border flex items-center justify-center shadow-xs">
              <LifeBuoy className="w-5 h-5" />
            </div>
            <h1 className="text-display-hero text-2xl sm:text-3xl font-bold tracking-tight text-vistaro-primary">
              Contact Vistaro Support
            </h1>
          </div>
          <p className="text-body text-vistaro-muted">
            Have questions about reservations, travel planning, or platform security? Our concierge team is ready to assist.
          </p>
        </div>

        {user && (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-vistaro-secondary/70 border border-vistaro-border text-xs text-vistaro-secondary self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Logged in as <b>{user.username}</b></span>
          </div>
        )}
      </div>

      {/* 2. Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Form or Success Card (7 cols) */}
        <div className="lg:col-span-7 bg-vistaro-surface border border-vistaro-border rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
          
          {/* A. SUCCESS CONFIRMATION STATE */}
          {successData ? (
            <div className="space-y-6 text-center py-6 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h2 className="text-display-h2 text-2xl font-bold text-vistaro-primary">
                  Inquiry Received
                </h2>
                <p className="text-body text-vistaro-secondary max-w-md mx-auto leading-relaxed">
                  Thank you for reaching out, <b>{form.name}</b>. We have created ticket{' '}
                  <span className="font-mono font-bold text-vistaro-accent px-2 py-0.5 rounded bg-vistaro-secondary border border-vistaro-border">
                    #{successData.referenceNumber || 'SUPPORT'}
                  </span>{' '}
                  and dispatched a confirmation receipt to <b>{form.email}</b>.
                </p>
              </div>

              <div className="bg-vistaro-secondary/50 border border-vistaro-border rounded-2xl p-4 max-w-md mx-auto text-left space-y-2 text-xs">
                <div className="flex justify-between text-vistaro-muted">
                  <span>Topic:</span>
                  <span className="font-semibold text-vistaro-primary">{form.category}</span>
                </div>
                <div className="flex justify-between text-vistaro-muted">
                  <span>Subject:</span>
                  <span className="font-semibold text-vistaro-primary truncate max-w-[200px]">{form.subject}</span>
                </div>
                <div className="flex justify-between text-vistaro-muted">
                  <span>Expected Response:</span>
                  <span className="font-semibold text-emerald-500">Within 24 business hours</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-vistaro-accent hover:bg-vistaro-accent-hover text-white text-cta py-3 px-6 rounded-full transition-all shadow-xs cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" /> Send Another Inquiry
                </button>
                <Link
                  to="/"
                  className="w-full sm:w-auto inline-flex items-center justify-center bg-vistaro-secondary hover:bg-vistaro-main text-vistaro-primary border border-vistaro-border text-cta py-3 px-6 rounded-full transition-colors"
                >
                  Back to Homepage
                </Link>
              </div>
            </div>
          ) : (
            /* B. INTERACTIVE CONTACT FORM */
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              
              {/* Server Error Alert Banner */}
              {serverError && (
                <div className="p-4 rounded-2xl bg-vistaro-error/10 border border-vistaro-error/30 text-vistaro-error text-xs flex items-start gap-3 animate-fade-in">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-1">
                    <p className="font-semibold">Unable to submit inquiry</p>
                    <p className="opacity-90">{serverError}</p>
                  </div>
                </div>
              )}

              {/* Topic Category Selection Chips */}
              <div className="space-y-2">
                <label className="block text-label text-vistaro-primary font-bold text-xs">
                  Inquiry Topic *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CATEGORIES.map((cat) => {
                    const isSelected = form.category === cat.id;
                    const Icon = cat.icon;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setForm({ ...form, category: cat.id });
                          if (fieldErrors.category) setFieldErrors({ ...fieldErrors, category: null });
                        }}
                        className={`flex items-center gap-2 p-3 rounded-2xl border text-xs font-semibold transition-all cursor-pointer text-left ${
                          isSelected
                            ? 'bg-vistaro-accent text-white border-vistaro-accent shadow-xs'
                            : 'bg-vistaro-secondary/60 text-vistaro-secondary border-vistaro-border hover:border-vistaro-muted hover:text-vistaro-primary'
                        }`}
                      >
                        <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-vistaro-accent'}`} />
                        <span className="truncate">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Name & Email Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-label text-vistaro-primary mb-1.5 font-bold text-xs">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Priya Sharma"
                    value={form.name}
                    onChange={(e) => {
                      setForm({ ...form, name: e.target.value });
                      if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: null });
                    }}
                    className={`w-full bg-vistaro-secondary border text-vistaro-primary rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-hidden transition-colors ${
                      fieldErrors.name ? 'border-vistaro-error focus:border-vistaro-error' : 'border-vistaro-border focus:border-vistaro-accent'
                    }`}
                  />
                  {fieldErrors.name && (
                    <p className="text-vistaro-error text-[11px] mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {fieldErrors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-label text-vistaro-primary mb-1.5 font-bold text-xs">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. priya.sharma@example.com"
                    value={form.email}
                    onChange={(e) => {
                      setForm({ ...form, email: e.target.value });
                      if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: null });
                    }}
                    className={`w-full bg-vistaro-secondary border text-vistaro-primary rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-hidden transition-colors ${
                      fieldErrors.email ? 'border-vistaro-error focus:border-vistaro-error' : 'border-vistaro-border focus:border-vistaro-accent'
                    }`}
                  />
                  {fieldErrors.email && (
                    <p className="text-vistaro-error text-[11px] mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {fieldErrors.email}
                    </p>
                  )}
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-label text-vistaro-primary mb-1.5 font-bold text-xs">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Question regarding reservation #BK-1024 or date modification"
                  value={form.subject}
                  onChange={(e) => {
                    setForm({ ...form, subject: e.target.value });
                    if (fieldErrors.subject) setFieldErrors({ ...fieldErrors, subject: null });
                  }}
                  className={`w-full bg-vistaro-secondary border text-vistaro-primary rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-hidden transition-colors ${
                    fieldErrors.subject ? 'border-vistaro-error focus:border-vistaro-error' : 'border-vistaro-border focus:border-vistaro-accent'
                  }`}
                />
                {fieldErrors.subject && (
                  <p className="text-vistaro-error text-[11px] mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {fieldErrors.subject}
                  </p>
                )}
              </div>

              {/* Message */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-label text-vistaro-primary font-bold text-xs">
                    Detailed Message *
                  </label>
                  <span className={`text-[11px] font-mono ${form.message.length > 3000 ? 'text-vistaro-error font-bold' : 'text-vistaro-muted'}`}>
                    {form.message.length} / 3000
                  </span>
                </div>
                <textarea
                  rows={5}
                  required
                  placeholder="Please describe your inquiry, booking reference, or feedback with as much detail as possible..."
                  value={form.message}
                  onChange={(e) => {
                    setForm({ ...form, message: e.target.value });
                    if (fieldErrors.message) setFieldErrors({ ...fieldErrors, message: null });
                  }}
                  className={`w-full bg-vistaro-secondary border text-vistaro-primary rounded-xl p-4 text-xs font-medium focus:outline-hidden transition-colors ${
                    fieldErrors.message ? 'border-vistaro-error focus:border-vistaro-error' : 'border-vistaro-border focus:border-vistaro-accent'
                  }`}
                />
                {fieldErrors.message && (
                  <p className="text-vistaro-error text-[11px] mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {fieldErrors.message}
                  </p>
                )}
              </div>

              {/* Form Action Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-vistaro-accent hover:bg-vistaro-accent-hover text-white text-cta py-3.5 px-8 rounded-full transition-all shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Transmitting Inquiry...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Support Inquiry</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          )}

        </div>

        {/* Right Column: Support Resources & Channels (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Card 1: Direct Concierge Channels */}
          <div className="bg-vistaro-surface border border-vistaro-border rounded-3xl p-6 sm:p-7 space-y-5 shadow-xs">
            <h3 className="text-display-h3 text-lg font-bold text-vistaro-primary flex items-center gap-2">
              <Mail className="w-5 h-5 text-vistaro-accent" />
              <span>Direct Support Channels</span>
            </h3>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-vistaro-secondary/50 border border-vistaro-border">
                <Mail className="w-4 h-4 text-vistaro-accent shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-semibold text-vistaro-primary">Support Desk</p>
                  <p className="text-vistaro-muted">support@vistaro.com</p>
                  <p className="text-[11px] text-vistaro-secondary">General inquiries, feedback & billing</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-vistaro-secondary/50 border border-vistaro-border">
                <Phone className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-semibold text-vistaro-primary">Traveler Hotline</p>
                  <p className="text-vistaro-muted">+91 (0) 800-VISTARO</p>
                  <p className="text-[11px] text-vistaro-secondary">Available 09:00 AM – 09:00 PM IST (Mon – Sat)</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-vistaro-secondary/50 border border-vistaro-border">
                <Clock className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-semibold text-vistaro-primary">Emergency In-Trip Assistance</p>
                  <p className="text-vistaro-muted">24/7 dedicated dispatch</p>
                  <p className="text-[11px] text-vistaro-secondary">For guests currently on an active stay or tour</p>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Self-Service Resource Links */}
          <div className="bg-vistaro-surface border border-vistaro-border rounded-3xl p-6 sm:p-7 space-y-4 shadow-xs">
            <h3 className="text-display-h3 text-lg font-bold text-vistaro-primary flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-vistaro-accent" />
              <span>Helpful Self-Service Hub</span>
            </h3>

            <div className="space-y-2 text-xs">
              <Link
                to="/my-bookings"
                className="flex items-center justify-between p-3 rounded-2xl bg-vistaro-secondary/40 hover:bg-vistaro-secondary border border-vistaro-border transition-colors group"
              >
                <div>
                  <p className="font-semibold text-vistaro-primary">Manage My Bookings</p>
                  <p className="text-vistaro-muted text-[11px]">View receipts, check-in vouchers, or cancel</p>
                </div>
                <ArrowRight className="w-4 h-4 text-vistaro-muted group-hover:text-vistaro-accent group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/terms"
                className="flex items-center justify-between p-3 rounded-2xl bg-vistaro-secondary/40 hover:bg-vistaro-secondary border border-vistaro-border transition-colors group"
              >
                <div>
                  <p className="font-semibold text-vistaro-primary">Cancellation Policies & Terms</p>
                  <p className="text-vistaro-muted text-[11px]">Review refund schedules & guest rights</p>
                </div>
                <ArrowRight className="w-4 h-4 text-vistaro-muted group-hover:text-vistaro-accent group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/company"
                className="flex items-center justify-between p-3 rounded-2xl bg-vistaro-secondary/40 hover:bg-vistaro-secondary border border-vistaro-border transition-colors group"
              >
                <div>
                  <p className="font-semibold text-vistaro-primary">About Vistaro & Company Details</p>
                  <p className="text-vistaro-muted text-[11px]">Corporate registry and mission</p>
                </div>
                <ArrowRight className="w-4 h-4 text-vistaro-muted group-hover:text-vistaro-accent group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
