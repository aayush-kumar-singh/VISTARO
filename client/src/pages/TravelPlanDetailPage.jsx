import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { travelPlansApi } from '../api/travelPlansApi.js';
import { destinationsApi } from '../api/destinationsApi.js';
import { useToast } from '../context/ToastContext.jsx';
import { useCurrency } from '../context/CurrencyContext.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import {
  Compass,
  ArrowLeft,
  Calendar,
  MapPin,
  Layers,
  Sparkles,
  Car,
  Plus,
  Clock,
  Trash2,
  ExternalLink,
  Edit3,
  Archive,
  Check,
  X,
  Home,
  Map,
  Users,
  ChevronRight,
  AlertCircle,
  FileText,
} from 'lucide-react';

export default function TravelPlanDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showError, showSuccess } = useToast();
  const { formatPrice } = useCurrency();

  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [removingId, setRemovingId] = useState(null);

  // Edit Plan State
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');
  const [editDestination, setEditDestination] = useState('');
  const [destinations, setDestinations] = useState([]);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    async function fetchPlan() {
      try {
        setLoading(true);
        setError(null);
        const data = await travelPlansApi.getPlanById(id);
        setPlan(data.plan);
        setEditTitle(data.plan.title || '');
        setEditStartDate(data.plan.startDate ? data.plan.startDate.split('T')[0] : '');
        setEditEndDate(data.plan.endDate ? data.plan.endDate.split('T')[0] : '');
        setEditDestination(data.plan.destination?._id || '');
      } catch (err) {
        setError(err.response?.data?.error || err.message || 'Failed to load travel plan.');
      } finally {
        setLoading(false);
      }
    }

    fetchPlan();
  }, [id]);

  useEffect(() => {
    async function loadDestinations() {
      try {
        const data = await destinationsApi.getDestinations();
        setDestinations(data.destinations || []);
      } catch (err) {
        console.warn('Failed to load destinations:', err);
      }
    }
    loadDestinations();
  }, []);

  const formatDateRange = (start, end) => {
    if (!start && !end) return 'Flexible Dates';
    const s = start ? new Date(start).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Open';
    const e = end ? new Date(end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Open';
    return `${s} – ${e}`;
  };

  const handleUpdatePlan = async (e) => {
    e.preventDefault();
    if (!editTitle.trim()) {
      showError('Please provide a title for your travel plan.');
      return;
    }
    if (editStartDate && editEndDate && editStartDate > editEndDate) {
      showError('Start date cannot be after end date.');
      return;
    }

    try {
      setUpdating(true);
      const res = await travelPlansApi.updatePlan(id, {
        title: editTitle.trim(),
        destination: editDestination || null,
        startDate: editStartDate || null,
        endDate: editEndDate || null,
      });

      setPlan(res.plan);
      setIsEditing(false);
      showSuccess('Travel plan updated successfully.');
    } catch (err) {
      showError(err.response?.data?.error || err.message || 'Failed to update plan.');
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleArchive = async () => {
    try {
      const res = await travelPlansApi.updatePlan(id, {
        isArchived: !plan.isArchived,
      });
      setPlan(res.plan);
      showSuccess(res.plan.isArchived ? 'Plan archived.' : 'Plan restored to active.');
    } catch (err) {
      showError(err.response?.data?.error || err.message || 'Failed to update plan.');
    }
  };

  const handleDeletePlan = async () => {
    if (!window.confirm(`Permanently delete "${plan.title}"? This cannot be undone.`)) {
      return;
    }

    try {
      await travelPlansApi.deletePlan(id, true);
      showSuccess('Travel plan deleted.');
      navigate('/travel-plans');
    } catch (err) {
      showError(err.response?.data?.error || err.message || 'Failed to delete plan.');
    }
  };

  const handleRemoveItem = async (itemSubDocId, itemTitle) => {
    if (!window.confirm(`Remove "${itemTitle || 'this item'}" from your travel plan?`)) {
      return;
    }

    try {
      setRemovingId(itemSubDocId);
      await travelPlansApi.removeItemFromPlan(id, itemSubDocId);
      showSuccess(`Removed "${itemTitle || 'item'}" from travel plan.`);
      setPlan((prev) => ({
        ...prev,
        items: (prev.items || []).filter((it) => it._id !== itemSubDocId),
      }));
    } catch (err) {
      showError(err.response?.data?.error || err.message || 'Failed to remove item.');
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen={false} text="Loading your travel plan..." />;
  }

  if (error || !plan) {
    return (
      <div className="max-w-lg mx-auto my-16 p-8 bg-red-500/10 border border-vistaro-error/20 rounded-3xl text-center space-y-4 shadow-xs text-vistaro-primary">
        <div className="w-12 h-12 rounded-full bg-red-500/20 text-vistaro-error flex items-center justify-center mx-auto">
          <Compass className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-bold text-vistaro-primary">Travel Plan Not Found</h3>
        <p className="text-xs text-vistaro-muted">{error || 'This plan does not exist or you do not have permission to view it.'}</p>
        <div className="pt-2">
          <Link
            to="/travel-plans"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-vistaro-accent text-white text-xs font-semibold hover:bg-vistaro-accent-hover transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Return to My Plans
          </Link>
        </div>
      </div>
    );
  }

  const items = plan.items || [];
  const stayItems = items.filter((it) => it.itemType === 'listing');
  const tourItems = items.filter((it) => it.itemType === 'tourPackage');
  const expItems = items.filter((it) => it.itemType === 'experience');
  const transferItems = items.filter((it) => it.itemType === 'transfer');

  const getItemLink = (item) => {
    if (!item.itemId) return '#';
    if (item.itemType === 'listing') return `/listings/${item.itemId._id || item.itemId}`;
    if (item.itemType === 'tourPackage') return `/tours/${item.itemId.slug || item.itemId._id || item.itemId}`;
    if (item.itemType === 'experience') return `/experiences/${item.itemId.slug || item.itemId._id || item.itemId}`;
    if (item.itemType === 'transfer') {
      const destSlug = item.itemId?.destination?.slug || (item.itemId?.destination && typeof item.itemId.destination === 'object' ? item.itemId.destination.slug : null);
      return destSlug ? `/destinations/${destSlug}#transfers-section` : '/';
    }
    return '#';
  };

  const getItemImage = (item) => {
    if (!item.itemId) return 'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?auto=format&fit=crop&w=800&q=80';
    if (item.itemId.coverImage?.url) return item.itemId.coverImage.url;
    if (item.itemId.image?.url) return item.itemId.image.url;
    if (Array.isArray(item.itemId.images) && item.itemId.images[0]?.url) return item.itemId.images[0].url;
    return 'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?auto=format&fit=crop&w=800&q=80';
  };

  const getItemSubtitle = (item) => {
    const obj = item.itemId;
    if (!obj) return null;
    if (item.itemType === 'listing') {
      return `${obj.location || ''}${obj.country ? ', ' + obj.country : ''}`;
    }
    if (item.itemType === 'tourPackage') {
      const days = obj.duration?.days || 1;
      const nights = obj.duration?.nights || 0;
      return `${days} Days / ${nights} Nights • ${obj.difficultyLevel || 'Moderate'} Intensity`;
    }
    if (item.itemType === 'experience') {
      return `${obj.category || 'Experience'} • ${obj.duration || 2} Hours • up to ${obj.maxGroupSize || 10} guests`;
    }
    if (item.itemType === 'transfer') {
      const vehicle = obj.vehicleType || 'Vehicle';
      const cap = obj.capacity || 4;
      const dur = obj.estimatedDuration ? ` • ${obj.estimatedDuration}` : '';
      const baseP = obj.price?.basePrice ?? obj.basePrice ?? 0;
      const rate = baseP ? ` • ${formatPrice(baseP)}/${obj.priceUnit === 'per-day' ? 'day' : 'trip'}` : '';
      return `${vehicle} (${cap} Pax)${dur}${rate}`;
    }
    return null;
  };

  const renderItemCard = (item) => {
    const itemObj = item.itemId || {};
    const title = itemObj.title || 'Planned Item';
    const imageUrl = getItemImage(item);
    const linkUrl = getItemLink(item);
    const subtitle = getItemSubtitle(item);

    return (
      <div
        key={item._id}
        className="group relative bg-vistaro-surface rounded-3xl border border-vistaro-border hover:border-vistaro-accent/40 hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden text-vistaro-primary"
      >
        {/* Item Image Preview */}
        <div className="relative aspect-4/3 w-full overflow-hidden bg-vistaro-secondary">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          <button
            type="button"
            onClick={() => handleRemoveItem(item._id, title)}
            disabled={removingId === item._id}
            className="absolute top-3 right-3 p-2 rounded-full bg-vistaro-surface/90 hover:bg-red-500/10 text-vistaro-muted hover:text-vistaro-error shadow-xs transition-colors cursor-pointer border border-vistaro-border/40"
            title="Remove from travel plan"
            aria-label="Remove item from travel plan"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
          <div className="space-y-1.5">
            <Link
              to={linkUrl}
              className="block font-serif font-medium text-base text-vistaro-primary hover:text-vistaro-accent transition-colors line-clamp-2 leading-snug"
            >
              {title}
            </Link>

            {subtitle && (
              <p className="text-xs text-vistaro-muted line-clamp-1">{subtitle}</p>
            )}

            {item.notes && (
              <div className="p-3 bg-vistaro-secondary rounded-2xl border border-vistaro-border text-xs text-vistaro-secondary flex items-start gap-2 mt-2">
                <FileText className="w-3.5 h-3.5 text-vistaro-accent shrink-0 mt-0.5" />
                <span className="leading-relaxed">{item.notes}</span>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-vistaro-border flex items-center justify-between text-xs">
            <Link
              to={linkUrl}
              className="inline-flex items-center gap-1 font-semibold text-vistaro-accent hover:underline"
            >
              <span>View Details</span>
              <ExternalLink className="w-3 h-3" />
            </Link>

            <span className="text-[11px] text-vistaro-muted">
              Added {new Date(item.addedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full space-y-8 pb-16 text-vistaro-primary">
      
      {/* 1. Navigation & Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to="/travel-plans"
          className="inline-flex items-center gap-2 text-xs font-semibold text-vistaro-muted hover:text-vistaro-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Plans
        </Link>

        <div className="flex items-center gap-2">
          {plan.isArchived && (
            <span className="text-xs font-semibold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 px-3 py-1 rounded-full">
              Archived Plan
            </span>
          )}
        </div>
      </div>

      {/* 2. Plan Header Card / Edit Form */}
      {isEditing ? (
        <form
          onSubmit={handleUpdatePlan}
          className="bg-vistaro-surface rounded-3xl border border-vistaro-border p-6 sm:p-8 shadow-xs space-y-5 animate-fade-in"
        >
          <div className="flex items-center justify-between border-b border-vistaro-border pb-4">
            <h3 className="text-lg font-serif font-medium text-vistaro-primary">Edit Travel Plan</h3>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="text-xs text-vistaro-muted hover:text-vistaro-primary underline cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-vistaro-primary">
                Plan Title *
              </label>
              <input
                type="text"
                required
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-vistaro-border text-xs font-medium text-vistaro-primary bg-vistaro-surface focus:outline-none focus:ring-2 focus:ring-vistaro-accent/30 focus:border-vistaro-accent"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-vistaro-primary">
                Primary Destination
              </label>
              <select
                value={editDestination}
                onChange={(e) => setEditDestination(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-vistaro-border text-xs font-medium text-vistaro-primary bg-vistaro-surface focus:outline-none focus:ring-2 focus:ring-vistaro-accent/30 focus:border-vistaro-accent"
              >
                <option value="">No Primary Destination (Multi-Destination)</option>
                {destinations.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name}, {d.state}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-vistaro-primary">
                  Start Date
                </label>
                <input
                  type="date"
                  value={editStartDate}
                  onChange={(e) => setEditStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-vistaro-border text-xs font-medium text-vistaro-primary bg-vistaro-surface focus:outline-none focus:ring-2 focus:ring-vistaro-accent/30 focus:border-vistaro-accent"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-vistaro-primary">
                  End Date
                </label>
                <input
                  type="date"
                  value={editEndDate}
                  onChange={(e) => setEditEndDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-vistaro-border text-xs font-medium text-vistaro-primary bg-vistaro-surface focus:outline-none focus:ring-2 focus:ring-vistaro-accent/30 focus:border-vistaro-accent"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-vistaro-border">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-5 py-2.5 rounded-full border border-vistaro-border text-xs font-semibold text-vistaro-primary hover:bg-vistaro-secondary transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updating}
              className="px-6 py-2.5 rounded-full bg-vistaro-accent hover:bg-vistaro-accent-hover text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>{updating ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-vistaro-surface rounded-3xl border border-vistaro-border p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                {plan.destination && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-vistaro-secondary text-vistaro-primary font-semibold text-xs border border-vistaro-border shadow-2xs">
                    <MapPin className="w-3.5 h-3.5 text-vistaro-accent" />
                    <span>{plan.destination.name}, {plan.destination.state}</span>
                  </span>
                )}
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-vistaro-muted bg-vistaro-secondary px-3 py-1 rounded-full border border-vistaro-border">
                  <Layers className="w-3.5 h-3.5 text-vistaro-accent" />
                  <span>{items.length} {items.length === 1 ? 'item' : 'items'} planned</span>
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-serif font-medium text-vistaro-primary tracking-tight">
                {plan.title}
              </h1>
            </div>

            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-vistaro-border text-xs font-semibold text-vistaro-primary hover:bg-vistaro-secondary transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-vistaro-muted" /> Edit
              </button>

              <button
                type="button"
                onClick={handleToggleArchive}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-vistaro-border text-xs font-semibold text-vistaro-primary hover:bg-vistaro-secondary transition-colors cursor-pointer"
              >
                <Archive className="w-3.5 h-3.5 text-vistaro-muted" />
                {plan.isArchived ? 'Restore' : 'Archive'}
              </button>

              <button
                type="button"
                onClick={handleDeletePlan}
                className="p-2 rounded-full border border-vistaro-error/30 text-vistaro-error hover:bg-red-500/10 transition-colors cursor-pointer"
                title="Delete travel plan"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Details Strip */}
          <div className="pt-4 border-t border-vistaro-border flex flex-wrap items-center gap-6 text-xs text-vistaro-muted">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-vistaro-accent" />
              <span className="font-semibold text-vistaro-primary">{formatDateRange(plan.startDate, plan.endDate)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-vistaro-muted" />
              <span>Created {new Date(plan.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. Empty State (When entire plan has 0 items) */}
      {items.length === 0 ? (
        <div className="text-center py-16 px-6 bg-vistaro-surface rounded-3xl border border-vistaro-border max-w-xl mx-auto space-y-4">
          <div className="w-14 h-14 rounded-full bg-vistaro-accent/10 text-vistaro-accent flex items-center justify-center mx-auto">
            <Sparkles className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-lg text-vistaro-primary">No Items in This Plan Yet</h3>
          <p className="text-xs text-vistaro-muted max-w-sm mx-auto leading-relaxed">
            Start building your dream itinerary! Explore boutique stays, curated multi-day tour packages, and host-led experiences to attach them here.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-vistaro-secondary hover:bg-vistaro-main text-vistaro-primary border border-vistaro-border text-xs font-semibold py-2.5 px-5 rounded-full transition-colors shadow-xs"
            >
              <Home className="w-3.5 h-3.5 text-vistaro-accent" /> Browse Stays
            </Link>
            <Link
              to="/tours"
              className="inline-flex items-center gap-2 bg-vistaro-secondary hover:bg-vistaro-main text-vistaro-primary border border-vistaro-border text-xs font-semibold py-2.5 px-5 rounded-full transition-colors"
            >
              <Map className="w-3.5 h-3.5 text-vistaro-accent" /> Tour Packages
            </Link>
            <Link
              to="/experiences"
              className="inline-flex items-center gap-2 bg-vistaro-accent hover:bg-vistaro-accent-hover text-white text-xs font-semibold py-2.5 px-5 rounded-full transition-colors shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" /> Experiences
            </Link>
          </div>
        </div>
      ) : (
        /* 4. Grouped Itinerary Sections */
        <div className="space-y-10">

          {/* Group 1: Stays & Villas */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-vistaro-secondary text-vistaro-accent flex items-center justify-center">
                  <Home className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg font-serif font-medium text-vistaro-primary tracking-tight">Stays & Villas</h2>
                  <p className="text-xs text-vistaro-muted">{stayItems.length} {stayItems.length === 1 ? 'stay' : 'stays'} reserved in plan</p>
                </div>
              </div>

              <Link
                to="/"
                className="inline-flex items-center gap-1 text-xs font-semibold text-vistaro-accent hover:underline"
              >
                <Plus className="w-3.5 h-3.5" /> Add Stays
              </Link>
            </div>

            {stayItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {stayItems.map(renderItemCard)}
              </div>
            ) : (
              <div className="p-6 bg-vistaro-secondary/50 rounded-2xl border border-dashed border-vistaro-border text-center text-xs text-vistaro-muted">
                No boutique stays added yet. <Link to="/" className="text-vistaro-accent font-semibold hover:underline">Explore stays</Link>
              </div>
            )}
          </div>

          {/* Group 2: Curated Tour Packages */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-vistaro-secondary text-vistaro-accent flex items-center justify-center">
                  <Map className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg font-serif font-medium text-vistaro-primary tracking-tight">Tour Packages & Expeditions</h2>
                  <p className="text-xs text-vistaro-muted">{tourItems.length} {tourItems.length === 1 ? 'package' : 'packages'} reserved in plan</p>
                </div>
              </div>

              <Link
                to="/tours"
                className="inline-flex items-center gap-1 text-xs font-semibold text-vistaro-accent hover:underline"
              >
                <Plus className="w-3.5 h-3.5" /> Add Tours
              </Link>
            </div>

            {tourItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {tourItems.map(renderItemCard)}
              </div>
            ) : (
              <div className="p-6 bg-vistaro-secondary/50 rounded-2xl border border-dashed border-vistaro-border text-center text-xs text-vistaro-muted">
                No tour packages added yet. <Link to="/tours" className="text-vistaro-accent font-semibold hover:underline">Explore multi-day tours</Link>
              </div>
            )}
          </div>

          {/* Group 3: Host-Led Experiences */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-vistaro-secondary text-vistaro-accent flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg font-serif font-medium text-vistaro-primary tracking-tight">Host-Led Experiences</h2>
                  <p className="text-xs text-vistaro-muted">{expItems.length} {expItems.length === 1 ? 'experience' : 'experiences'} reserved in plan</p>
                </div>
              </div>

              <Link
                to="/experiences"
                className="inline-flex items-center gap-1 text-xs font-semibold text-vistaro-accent hover:underline"
              >
                <Plus className="w-3.5 h-3.5" /> Add Experiences
              </Link>
            </div>

            {expItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {expItems.map(renderItemCard)}
              </div>
            ) : (
              <div className="p-6 bg-vistaro-secondary/50 rounded-2xl border border-dashed border-vistaro-border text-center text-xs text-vistaro-muted">
                No host experiences added yet. <Link to="/experiences" className="text-vistaro-accent font-semibold hover:underline">Explore experiences</Link>
              </div>
            )}
          </div>

          {/* Group 4: Private Transfers & Cabs (Phase 6 / Part 6.5) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-vistaro-secondary text-vistaro-accent flex items-center justify-center">
                  <Car className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg font-serif font-medium text-vistaro-primary tracking-tight">Private Transfers & Cabs</h2>
                  <p className="text-xs text-vistaro-muted">{transferItems.length} {transferItems.length === 1 ? 'transfer' : 'transfers'} reserved in plan</p>
                </div>
              </div>

              {plan.destination?.slug && (
                <Link
                  to={`/destinations/${plan.destination.slug}#transfers-section`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-vistaro-accent hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Transfers
                </Link>
              )}
            </div>

            {transferItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {transferItems.map(renderItemCard)}
              </div>
            ) : (
              <div className="p-6 bg-vistaro-secondary/50 rounded-2xl border border-dashed border-vistaro-border text-center text-xs text-vistaro-muted">
                No private transfers or chauffeured cabs attached yet.{' '}
                {plan.destination?.slug ? (
                  <Link to={`/destinations/${plan.destination.slug}#transfers-section`} className="text-vistaro-accent font-semibold hover:underline">
                    Explore transfers in {plan.destination.name}
                  </Link>
                ) : (
                  <span>Attach a destination to browse local transfer options.</span>
                )}
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
