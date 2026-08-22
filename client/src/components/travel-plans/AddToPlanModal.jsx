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
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Quick inline new plan creation
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newPlanTitle, setNewPlanTitle] = useState('');
  const [creatingPlan, setCreatingPlan] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    async function loadPlans() {
      try {
        setLoading(true);
        const data = await travelPlansApi.getPlans({ archived: 'false' });
        if (isMounted) {
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
        }
      } catch (err) {
        console.warn('Failed to load plans:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadPlans();
    return () => {
      isMounted = false;
    };
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
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[#171719]/10 overflow-hidden z-10 animate-fade-in text-[#171719]">
        
        {/* Header */}
        <div className="p-6 pb-4 border-b border-[#171719]/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-[#FF385C]/10 text-[#FF385C] flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-[#171719] tracking-tight">Add to Travel Plan</h2>
              <p className="text-xs text-[#A7A7AC]">Attach this item to your curated journey</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-zinc-400 hover:text-[#171719] hover:bg-zinc-100 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Item Preview Strip */}
        <div className="px-6 py-3 bg-zinc-50 border-b border-[#171719]/10 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#FF385C] bg-red-50 px-2 py-0.5 rounded-full">
              {itemTypeLabels[item.itemType] || item.itemType}
            </span>
            <h4 className="font-bold text-sm text-[#171719] truncate mt-1">{item.title}</h4>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {loading ? (
            <div className="py-12 text-center text-[#A7A7AC] space-y-2">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#FF385C]" />
              <p className="text-xs">Loading your travel plans...</p>
            </div>
          ) : (
            <>
              {/* If user has no plans yet */}
              {plans.length === 0 && !isCreatingNew ? (
                <div className="text-center py-6 space-y-3 bg-zinc-50 rounded-2xl border border-[#171719]/10 p-5">
                  <Compass className="w-8 h-8 text-[#A7A7AC] mx-auto" />
                  <h4 className="font-bold text-sm text-[#171719]">No Travel Plans Yet</h4>
                  <p className="text-xs text-[#A7A7AC]">Create your first travel plan to start saving stays and activities.</p>
                  <button
                    type="button"
                    onClick={() => setIsCreatingNew(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FF385C] text-white text-xs font-bold shadow-xs hover:bg-[#FF5A70] transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Create a Travel Plan
                  </button>
                </div>
              ) : isCreatingNew ? (
                /* Inline New Plan Form */
                <form onSubmit={handleCreateNewPlan} className="space-y-3 p-4 bg-zinc-50 rounded-2xl border border-[#171719]/10">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#171719]">New Plan Details</span>
                    <button
                      type="button"
                      onClick={() => setIsCreatingNew(false)}
                      className="text-xs text-[#A7A7AC] hover:text-[#171719] underline cursor-pointer"
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
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#171719]/15 text-xs font-medium text-[#171719] bg-white focus:outline-none focus:ring-2 focus:ring-[#FF385C]/30 focus:border-[#FF385C]"
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={creatingPlan}
                    className="w-full py-2.5 rounded-xl bg-[#151517] hover:bg-black text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {creatingPlan ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                    <span>Create & Select Plan</span>
                  </button>
                </form>
              ) : (
                /* Plan Selection List */
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#171719]">
                      Select Travel Plan
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsCreatingNew(true)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#FF385C] hover:underline cursor-pointer"
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
                              ? 'bg-zinc-100/70 border-zinc-200 opacity-60 cursor-not-allowed'
                              : isSelected
                              ? 'border-[#FF385C] bg-red-50/40 shadow-xs'
                              : 'border-[#171719]/10 hover:border-[#171719]/25 hover:bg-zinc-50'
                          }`}
                        >
                          <div className="min-w-0 space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-[#171719] truncate">{p.title}</span>
                              {p.destination && (
                                <span className="text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full font-semibold">
                                  {p.destination.name}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-[#A7A7AC] flex items-center gap-2">
                              <span className="flex items-center gap-1">
                                <Layers className="w-3 h-3 text-[#FF385C]" />
                                {p.items?.length || 0} items
                              </span>
                            </div>
                          </div>

                          {isAlreadyInPlan ? (
                            <span className="text-[10px] font-bold text-zinc-500 bg-zinc-200 px-2.5 py-1 rounded-full shrink-0">
                              Already Added
                            </span>
                          ) : isSelected ? (
                            <div className="w-5 h-5 rounded-full bg-[#FF385C] text-white flex items-center justify-center shrink-0">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full border border-zinc-300 shrink-0" />
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
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#171719]">
                    Custom Itinerary Notes (Optional)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Day 2 afternoon activity, stay 3 nights"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#171719]/15 text-xs font-medium text-[#171719] bg-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#FF385C]/30 focus:border-[#FF385C]"
                  />
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        {plans.length > 0 && !isCreatingNew && (
          <div className="p-6 pt-3 border-t border-[#171719]/10 flex items-center justify-end gap-3 bg-zinc-50/50">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full border border-[#171719]/15 text-xs font-bold text-[#171719] hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddItem}
              disabled={submitting || !selectedPlanId}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#FF385C] hover:bg-[#FF5A70] text-white text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
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
