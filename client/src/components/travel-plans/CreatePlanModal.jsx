import React, { useState, useEffect } from 'react';
import { destinationsApi } from '../../api/destinationsApi.js';
import { travelPlansApi } from '../../api/travelPlansApi.js';
import { useToast } from '../../context/ToastContext.jsx';
import { X, MapPin, Calendar, Compass, Plus, Loader2 } from 'lucide-react';

export default function CreatePlanModal({ isOpen, onClose, onPlanCreated }) {
  const { showSuccess, showError } = useToast();
  const [destinations, setDestinations] = useState([]);
  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loadingDestinations, setLoadingDestinations] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    async function loadDestinations() {
      try {
        setLoadingDestinations(true);
        const data = await destinationsApi.getDestinations();
        if (isMounted) {
          setDestinations(data.destinations || []);
        }
      } catch (err) {
        console.warn('Failed to load destinations for modal:', err);
      } finally {
        if (isMounted) setLoadingDestinations(false);
      }
    }

    loadDestinations();
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      showError('Please give your travel plan a name.');
      return;
    }

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      showError('Start date cannot be after end date.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        title: title.trim(),
        destination: destination || null,
        startDate: startDate || null,
        endDate: endDate || null,
      };

      const res = await travelPlansApi.createPlan(payload);
      showSuccess(res.message || 'Travel plan created successfully!');
      
      // Reset form
      setTitle('');
      setDestination('');
      setStartDate('');
      setEndDate('');

      if (onPlanCreated) {
        onPlanCreated(res.plan);
      }
      onClose();
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to create travel plan.';
      showError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-lg bg-vistaro-surface rounded-3xl shadow-2xl border border-vistaro-border overflow-hidden z-10 animate-fade-in text-vistaro-primary">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-vistaro-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-vistaro-accent/10 text-vistaro-accent flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-medium text-vistaro-primary tracking-tight">Create Travel Plan</h2>
              <p className="text-xs text-vistaro-muted">Start designing your dream journey itinerary</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-vistaro-muted hover:text-vistaro-primary hover:bg-vistaro-secondary transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Plan Title */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-vistaro-primary">
              Plan Name <span className="text-vistaro-accent">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Ladakh Monasteries & High Passes, Goa Monsoon"
              className="w-full px-4 py-3 rounded-2xl border border-vistaro-border text-sm font-medium text-vistaro-primary placeholder-vistaro-muted focus:outline-none focus:ring-2 focus:ring-vistaro-accent/30 focus:border-vistaro-accent transition-all bg-vistaro-surface"
              autoFocus
            />
          </div>

          {/* Primary Destination (Optional) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-vistaro-primary flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-vistaro-accent" />
              <span>Primary Destination (Optional)</span>
            </label>
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              disabled={loadingDestinations}
              className="w-full px-4 py-3 rounded-2xl border border-vistaro-border text-sm font-medium text-vistaro-primary focus:outline-none focus:ring-2 focus:ring-vistaro-accent/30 focus:border-vistaro-accent transition-all bg-vistaro-surface cursor-pointer"
            >
              <option value="">-- Multi-Destination / Flexible --</option>
              {destinations.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}, {d.state}
                </option>
              ))}
            </select>
          </div>

          {/* Dates Range (Optional) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-vistaro-primary flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-vistaro-accent" />
              <span>Travel Dates (Optional)</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-vistaro-muted font-semibold block mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-vistaro-border text-xs font-medium text-vistaro-primary focus:outline-none focus:ring-2 focus:ring-vistaro-accent/30 focus:border-vistaro-accent transition-all bg-vistaro-surface"
                />
              </div>
              <div>
                <label className="text-[11px] text-vistaro-muted font-semibold block mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  min={startDate || undefined}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-vistaro-border text-xs font-medium text-vistaro-primary focus:outline-none focus:ring-2 focus:ring-vistaro-accent/30 focus:border-vistaro-accent transition-all bg-vistaro-surface"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-vistaro-border flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full border border-vistaro-border text-xs font-semibold text-vistaro-primary hover:bg-vistaro-secondary transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-vistaro-accent hover:bg-vistaro-accent-hover text-white text-xs font-semibold shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Plan...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Create Plan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
