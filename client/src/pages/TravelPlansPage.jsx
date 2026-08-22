import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { travelPlansApi } from '../api/travelPlansApi.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import TravelPlanCard from '../components/travel-plans/TravelPlanCard.jsx';
import CreatePlanModal from '../components/travel-plans/CreatePlanModal.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import {
  Compass,
  Plus,
  Layers,
  RefreshCw,
  Archive,
  ArrowLeft,
  Sparkles,
  Calendar,
  MapPin,
} from 'lucide-react';

export default function TravelPlansPage() {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'archived'
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {};
      if (activeTab === 'archived') {
        params.archived = 'true';
      }

      const data = await travelPlansApi.getPlans(params);
      setPlans(data.plans || []);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to load travel plans.');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handlePlanCreated = (newPlan) => {
    if (activeTab === 'active') {
      setPlans((prev) => [newPlan, ...prev]);
    } else {
      setActiveTab('active');
    }
  };

  const handleArchive = async (planId) => {
    try {
      await travelPlansApi.deletePlan(planId, false);
      showSuccess('Travel plan archived.');
      setPlans((prev) => prev.filter((p) => p._id !== planId));
    } catch (err) {
      showError(err.response?.data?.error || err.message || 'Failed to archive plan.');
    }
  };

  const handleDeletePermanent = async (planId) => {
    if (!window.confirm('Are you sure you want to permanently delete this travel plan? This action cannot be undone.')) {
      return;
    }

    try {
      await travelPlansApi.deletePlan(planId, true);
      showSuccess('Travel plan permanently deleted.');
      setPlans((prev) => prev.filter((p) => p._id !== planId));
    } catch (err) {
      showError(err.response?.data?.error || err.message || 'Failed to delete plan.');
    }
  };

  return (
    <div className="w-full space-y-8 pb-16 text-vistaro-primary">
      
      {/* 1. Page Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#171719]/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF385C]/10 text-[#FF385C] text-xs font-bold mb-2">
            <Compass className="w-3.5 h-3.5" />
            <span>Itinerary & Trip Planner</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171719] tracking-tight">
            My Travel Plans
          </h1>
          <p className="text-xs sm:text-sm text-[#A7A7AC] mt-1 max-w-2xl">
            Curate custom journeys by assembling luxury stays, multi-day tour itineraries, and host experiences into unified plans.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-2 bg-[#FF385C] hover:bg-[#FF5A70] text-white text-xs sm:text-sm font-bold py-3 px-6 rounded-full shadow-xs transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Plan</span>
        </button>
      </div>

      {/* 2. Tab Navigation Strip */}
      <div className="flex items-center gap-2 border-b border-[#171719]/10 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'active'
              ? 'bg-[#151517] text-white shadow-xs'
              : 'text-[#A7A7AC] hover:text-[#171719] hover:bg-zinc-100'
          }`}
        >
          Active Plans
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('archived')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'archived'
              ? 'bg-[#151517] text-white shadow-xs'
              : 'text-[#A7A7AC] hover:text-[#171719] hover:bg-zinc-100'
          }`}
        >
          <Archive className="w-3.5 h-3.5" />
          <span>Archived</span>
        </button>
      </div>

      {/* 3. Loading State */}
      {loading && (
        <LoadingSpinner fullScreen={false} text="Loading your travel plans..." />
      )}

      {/* 4. Error State */}
      {error && !loading && (
        <div className="bg-red-500/10 border border-[#FF385C]/20 rounded-3xl p-8 sm:p-12 text-center space-y-4 max-w-lg mx-auto my-8 shadow-xs">
          <div className="w-14 h-14 rounded-full bg-red-500/20 text-[#FF385C] flex items-center justify-center mx-auto shadow-inner">
            <Compass className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-lg text-[#171719]">Unable to Load Travel Plans</h3>
          <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">{error}</p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={fetchPlans}
              className="inline-flex items-center gap-2 bg-[#FF385C] hover:bg-[#FF5A70] text-white text-xs sm:text-sm font-bold py-2.5 px-6 rounded-full transition-all cursor-pointer shadow-xs"
            >
              <RefreshCw className="w-4 h-4" /> Try Again
            </button>
          </div>
        </div>
      )}

      {/* 5. Empty State */}
      {!loading && !error && plans.length === 0 && (
        <div className="text-center py-16 px-6 bg-white rounded-3xl border border-[#171719]/10 max-w-xl mx-auto space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-[#FF385C]/10 text-[#FF385C] flex items-center justify-center mx-auto">
            <Compass className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-xl text-[#171719]">
            {activeTab === 'active' ? 'No Travel Plans Created Yet' : 'No Archived Plans Found'}
          </h3>
          <p className="text-xs sm:text-sm text-[#A7A7AC] max-w-md mx-auto leading-relaxed">
            {activeTab === 'active'
              ? 'Start organizing your upcoming getaways by creating a travel plan and adding boutique stays, tour itineraries, and local experiences.'
              : 'You have no archived plans at this time.'}
          </p>
          {activeTab === 'active' && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center gap-2 bg-[#FF385C] hover:bg-[#FF5A70] text-white text-xs sm:text-sm font-bold py-3 px-6 rounded-full shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create Your First Plan</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* 6. Plans Grid */}
      {!loading && !error && plans.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <TravelPlanCard
              key={plan._id}
              plan={plan}
              onArchive={handleArchive}
              onDelete={handleDeletePermanent}
              isArchivedView={activeTab === 'archived'}
            />
          ))}
        </div>
      )}

      {/* 7. Create Plan Modal */}
      <CreatePlanModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onPlanCreated={handlePlanCreated}
      />

    </div>
  );
}
