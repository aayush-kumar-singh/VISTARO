import React, { useState, useEffect } from 'react';
import { travelPlansApi } from '../../api/travelPlansApi.js';
import { destinationsApi } from '../../api/destinationsApi.js';
import { useToast } from '../../context/ToastContext.jsx';
import {
  Compass,
  X,
  Plus,
  Check,
  Calendar,
  MapPin,
  Layers,
  Loader2,
  AlertCircle,
} from 'lucide-react';

export default function AddToPlanModal({ isOpen, onClose, item }) {
  const { showSuccess, showError } = useToast();

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Quick inline new plan creation
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newPlanTitle, setNewPlanTitle] = useState('');
  const [creatingPlan, setCreatingPlan] = useState(false);

  const loadPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await travelPlansApi.getPlans({ archived: 'false' });
      const userPlans = data.plans || [];
      setPlans(userPlans);
      if (userPlans.length > 0 && !selectedPlanId) {
        // Select first available plan that doesn't already have this item
        const available = userPlans.find(
          (p) => !p.items?.some((it) => it.itemId === item?._id || it.itemId?._id === item?._id)
        );
        if (available) {
          setSelectedPlanId(available._id);
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to load travel plans.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    loadPlans();
  }, [isOpen, item]);

  if (!isOpen || !item) return null;

  const itemTypeLabels = {
    listing: 'Stay / Villa',
    tourPackage: 'Tour Package',
    experience: 'Host Experience',
    transfer: 'Private Transfer / Cab',
  };

  const handleCreateNewPlan = async (e) => {
    e.preventDefault();
    if (!newPlanTitle.trim()) {
      showError('Please enter a name for the new plan.');
      return;
    }

    try {
      setCreatingPlan(true);
      const destinationId =
        item.destination?._id || (typeof item.destination === 'string' ? item.destination : null);

      const res = await travelPlansApi.createPlan({
        title: newPlanTitle.trim(),
        destination: destinationId || null,
      });

      showSuccess(`Created plan "${res.plan.title}"!`);
      setPlans((prev) => [res.plan, ...prev]);
      setSelectedPlanId(res.plan._id);
      setIsCreatingNew(false);
      setNewPlanTitle('');
    } catch (err) {
      showError(err.response?.data?.error || err.message || 'Failed to create plan.');
    } finally {
      setCreatingPlan(false);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!selectedPlanId) {
      showError('Please select a travel plan to add this item to.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await travelPlansApi.addItemToPlan(selectedPlanId, {
        itemType: item.itemType,
        itemId: item._id,
        notes: notes.trim(),
      });

      showSuccess(res.message || 'Added to your travel plan!');
      setNotes('');
      onClose();
    } catch (err) {
      const errMsg = err.response?.data?.error || err.message || 'Failed to add item to plan.';
      showError(errMsg);
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

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-vistaro-surface rounded-3xl shadow-2xl border border-vistaro-border overflow-hidden z-10 animate-fade-in text-vistaro-primary">
        
        {/* Header */}
        <div className="p-6 pb-4 border-b border-vistaro-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-vistaro-accent/10 text-vistaro-accent flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-medium text-vistaro-primary tracking-tight">Add to Travel Plan</h2>
              <p className="text-xs text-vistaro-muted">Attach this item to your curated journey</p>
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

        {/* Item Preview Strip */}
        <div className="px-6 py-3 bg-vistaro-secondary/60 border-b border-vistaro-border flex items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-semibold tracking-wider text-vistaro-accent bg-vistaro-accent/10 px-2 py-0.5 rounded-full">
              {itemTypeLabels[item.itemType] || item.itemType}
            </span>
            <h4 className="font-semibold text-sm text-vistaro-primary truncate mt-1">{item.title}</h4>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {loading ? (
            <div className="py-12 text-center text-vistaro-muted space-y-2">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-vistaro-accent" />
              <p className="text-xs">Loading your travel plans...</p>
            </div>
          ) : error ? (
            <div className="text-center py-6 space-y-3 bg-red-500/10 rounded-2xl border border-vistaro-error/20 p-5">
              <AlertCircle className="w-8 h-8 text-vistaro-error mx-auto" />
              <h4 className="font-bold text-sm text-vistaro-primary">Unable to Load Plans</h4>
              <p className="text-xs text-vistaro-muted">{error}</p>
              <button
                type="button"
                onClick={loadPlans}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-vistaro-accent text-white text-xs font-semibold shadow-xs hover:bg-vistaro-accent-hover transition-colors cursor-pointer"
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              {/* If user has no plans yet */}
              {plans.length === 0 && !isCreatingNew ? (
                <div className="text-center py-6 space-y-3 bg-vistaro-secondary/50 rounded-2xl border border-vistaro-border p-5">
                  <Compass className="w-8 h-8 text-vistaro-muted mx-auto" />
                  <h4 className="font-bold text-sm text-vistaro-primary">No Travel Plans Yet</h4>
                  <p className="text-xs text-vistaro-muted">Create your first travel plan to start saving stays and activities.</p>
                  <button
                    type="button"
                    onClick={() => setIsCreatingNew(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-vistaro-accent text-white text-xs font-semibold shadow-xs hover:bg-vistaro-accent-hover transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Create a Travel Plan
                  </button>
                </div>
              ) : isCreatingNew ? (
                /* Inline New Plan Form */
                <form onSubmit={handleCreateNewPlan} className="space-y-3 p-4 bg-vistaro-secondary/50 rounded-2xl border border-vistaro-border">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-vistaro-primary">New Plan Details</span>
                    <button
                      type="button"
                      onClick={() => setIsCreatingNew(false)}
                      className="text-xs text-vistaro-muted hover:text-vistaro-primary underline cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={newPlanTitle}
                    onChange={(e) => setNewPlanTitle(e.target.value)}
                    placeholder="e.g. My Upcoming Vacation"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-vistaro-border text-xs font-medium text-vistaro-primary bg-vistaro-surface focus:outline-none focus:ring-2 focus:ring-vistaro-accent/30 focus:border-vistaro-accent"
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={creatingPlan}
                    className="w-full py-2.5 rounded-xl bg-vistaro-accent hover:bg-vistaro-accent-hover text-white text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {creatingPlan ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                    <span>Create & Select Plan</span>
                  </button>
                </form>
              ) : (
                /* Plan Selection List */
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold uppercase tracking-wider text-vistaro-primary">
                      Select Travel Plan
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsCreatingNew(true)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-vistaro-accent hover:underline cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> New Plan
                    </button>
                  </div>

                  <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                    {plans.map((p) => {
                      const isAlreadyInPlan = p.items?.some(
                        (it) => it.itemId === item._id || it.itemId?._id === item._id
                      );
                      const isSelected = selectedPlanId === p._id;

                      return (
                        <div
                          key={p._id}
                          onClick={() => {
                            if (!isAlreadyInPlan) setSelectedPlanId(p._id);
                          }}
                          className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                            isAlreadyInPlan
                              ? 'bg-vistaro-secondary/40 border-vistaro-border opacity-60 cursor-not-allowed'
                              : isSelected
                              ? 'border-vistaro-accent bg-vistaro-accent/10 shadow-xs'
                              : 'border-vistaro-border hover:border-vistaro-accent/40 hover:bg-vistaro-secondary/50'
                          }`}
                        >
                          <div className="min-w-0 space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-xs text-vistaro-primary truncate">{p.title}</span>
                              {p.destination && (
                                <span className="text-[10px] text-vistaro-primary bg-vistaro-secondary px-2 py-0.5 rounded-full font-semibold border border-vistaro-border">
                                  {p.destination.name}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-vistaro-muted flex items-center gap-2">
                              <span className="flex items-center gap-1">
                                <Layers className="w-3 h-3 text-vistaro-accent" />
                                {p.items?.length || 0} items
                              </span>
                            </div>
                          </div>

                          {isAlreadyInPlan ? (
                            <span className="text-[10px] font-semibold text-vistaro-muted bg-vistaro-secondary px-2.5 py-1 rounded-full shrink-0 border border-vistaro-border">
                              Already Added
                            </span>
                          ) : isSelected ? (
                            <div className="w-5 h-5 rounded-full bg-vistaro-accent text-white flex items-center justify-center shrink-0">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full border border-vistaro-border shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Optional Notes Input */}
              {plans.length > 0 && !isCreatingNew && (
                <div className="space-y-1.5 pt-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-vistaro-primary">
                    Custom Itinerary Notes (Optional)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Day 2 afternoon activity, stay 3 nights"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-vistaro-border text-xs font-medium text-vistaro-primary bg-vistaro-surface placeholder-vistaro-muted focus:outline-none focus:ring-2 focus:ring-vistaro-accent/30 focus:border-vistaro-accent"
                  />
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        {plans.length > 0 && !isCreatingNew && (
          <div className="p-6 pt-3 border-t border-vistaro-border flex items-center justify-end gap-3 bg-vistaro-secondary/40">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full border border-vistaro-border text-xs font-semibold text-vistaro-primary hover:bg-vistaro-secondary transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleAddItem}
              disabled={submitting || !selectedPlanId}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-vistaro-accent hover:bg-vistaro-accent-hover text-white text-xs font-semibold shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Adding to Plan...</span>
                </>
              ) : (
                <>
                  <Compass className="w-4 h-4" />
                  <span>Add to Plan</span>
                </>
              )}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
