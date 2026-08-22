import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { authApi } from '../../api/authApi.js';
import {
  ShieldCheck,
  Clock,
  AlertCircle,
  Building,
  KeyRound,
  Send,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

export default function HostAccessGate({ children, title = 'Host Privileges Required' }) {
  const { user, updateUser } = useAuth();
  const { showSuccess, showError } = useToast();

  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Not Logged In
  if (!user) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-vistaro-surface border border-vistaro-border rounded-3xl text-center space-y-4 shadow-sm text-vistaro-primary">
        <KeyRound className="w-10 h-10 text-vistaro-accent mx-auto" />
        <h2 className="text-display-h2 text-vistaro-primary">Sign in to list your stay</h2>
        <p className="text-body-sm text-vistaro-muted">
          You need to be logged into your Vistaro account to create and manage property listings.
        </p>
        <div className="pt-2">
          <Link
            to="/login"
            className="inline-block bg-vistaro-accent hover:bg-vistaro-accent-hover text-white text-cta py-3 px-6 rounded-full transition-colors cursor-pointer"
          >
            Log In
          </Link>
        </div>
      </div>
    );
  }

  // 2. Already Host or Admin -> render content directly
  if (user.role === 'host' || user.role === 'admin') {
    return children;
  }

  // 3. Standard User -> Host Access Gate & Application Form
  const status = user.hostRequestStatus || 'none';

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      showError('Please provide a brief reason or property description for your host request.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await authApi.requestHostAccess({ reason: reason.trim() });
      if (res.user) {
        updateUser(res.user);
      } else {
        updateUser({
          hostRequestStatus: 'pending',
          hostRequestReason: reason.trim(),
          hostRequestDate: new Date(),
        });
      }
      showSuccess(res.message || 'Host access request submitted for administrator review.');
      setReason('');
    } catch (err) {
      showError(err.response?.data?.error || err.message || 'Failed to submit host request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto my-12 p-8 sm:p-10 bg-vistaro-surface border border-vistaro-border rounded-3xl shadow-sm space-y-6 text-vistaro-primary animate-fade-in">
      <div className="flex items-center gap-3.5 pb-4 border-b border-vistaro-border">
        <div className="w-12 h-12 rounded-2xl bg-vistaro-secondary text-vistaro-accent border border-vistaro-border flex items-center justify-center shadow-xs">
          <Building className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-display-h2 text-xl sm:text-2xl text-vistaro-primary font-bold">
            {title}
          </h2>
          <p className="text-caption text-vistaro-muted mt-0.5">
            Verified Host Authorization Required
          </p>
        </div>
      </div>

      {/* State: Pending Review */}
      {status === 'pending' && (
        <div className="p-5 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-3">
          <div className="flex items-center gap-2 text-amber-500 font-semibold text-body-sm">
            <Clock className="w-4 h-4 animate-pulse" />
            <span>Host Application Under Review</span>
          </div>
          <p className="text-body-sm text-vistaro-secondary leading-relaxed">
            Your host request has been submitted to the Vistaro Administration team. An administrator will review your application shortly and grant listing publishing privileges.
          </p>
          {user.hostRequestReason && (
            <div className="p-3 bg-vistaro-surface/80 rounded-xl border border-amber-500/20 text-xs text-vistaro-muted">
              <span className="font-semibold text-vistaro-primary">Your Note: </span>
              "{user.hostRequestReason}"
            </div>
          )}
          {user.hostRequestDate && (
            <p className="text-caption text-vistaro-muted">
              Submitted on: {new Date(user.hostRequestDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>
      )}

      {/* State: Rejected */}
      {status === 'rejected' && (
        <div className="p-5 bg-vistaro-error/10 border border-vistaro-error/30 rounded-2xl space-y-3">
          <div className="flex items-center gap-2 text-vistaro-error font-semibold text-body-sm">
            <AlertCircle className="w-4 h-4" />
            <span>Host Application Not Approved</span>
          </div>
          <p className="text-body-sm text-vistaro-secondary leading-relaxed">
            An administrator has reviewed your previous application and declined host access. You may re-apply below with additional details about your hosting background or spaces.
          </p>
        </div>
      )}

      {/* State: None or Re-apply */}
      {status !== 'pending' && (
        <form onSubmit={handleSubmitRequest} className="space-y-4">
          <p className="text-body-sm text-vistaro-secondary leading-relaxed">
            To ensure the highest quality and guest safety, creating and publishing property listings on Vistaro requires verified Host privileges. Submit a quick request to receive publishing access from an administrator.
          </p>

          <div className="space-y-1.5">
            <label htmlFor="hostReason" className="text-label text-vistaro-primary">
              Why would you like to host on Vistaro? <span className="text-vistaro-muted font-normal">(Brief description of your property or experience)</span>
            </label>
            <textarea
              id="hostReason"
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. I manage 2 boutique beachfront villas in North Goa and would like to host verified travelers..."
              className="w-full px-4 py-3 rounded-2xl border border-vistaro-border bg-vistaro-secondary text-vistaro-primary text-body-sm focus:outline-hidden focus:border-vistaro-accent resize-none transition-colors"
              maxLength={500}
              required
            />
            <div className="flex justify-end text-caption text-vistaro-muted">
              {reason.length}/500
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <Link
              to="/"
              className="w-full sm:w-auto text-center px-6 py-2.5 rounded-full border border-vistaro-border text-vistaro-secondary hover:text-vistaro-primary text-body-sm font-semibold transition-colors"
            >
              Return Home
            </Link>

            <button
              type="submit"
              disabled={isSubmitting || !reason.trim()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-vistaro-accent hover:bg-vistaro-accent-hover text-white text-cta py-3 px-8 rounded-full transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Request Host Access</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {status === 'pending' && (
        <div className="pt-2 flex justify-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-nav-link text-vistaro-accent hover:underline"
          >
            Explore Vistaro Stays & Experiences while you wait &rarr;
          </Link>
        </div>
      )}
    </div>
  );
}
