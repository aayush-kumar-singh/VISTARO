import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  Calendar,
  MapPin,
  Layers,
  ArrowRight,
  Archive,
  Trash2,
  MoreVertical,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function TravelPlanCard({ plan, onArchive, onDelete, isArchivedView = false }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const formatDateRange = (start, end) => {
    if (!start && !end) return 'Flexible Dates';
    const s = start ? new Date(start).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Open';
    const e = end ? new Date(end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Open';
    return `${s} – ${e}`;
  };

  const calculateDays = (start, end) => {
    if (!start || !end) return null;
    const diff = Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24));
    return diff > 0 ? `${diff} Days` : null;
  };

  const durationStr = calculateDays(plan.startDate, plan.endDate);
  const itemsCount = plan.items?.length || 0;

  return (
    <div className="group relative bg-vistaro-surface rounded-3xl border border-vistaro-border hover:border-vistaro-accent/40 transition-all duration-300 shadow-xs hover:shadow-md flex flex-col justify-between overflow-hidden text-vistaro-primary">
      
      {/* Top Banner / Color Accent Strip */}
      <div className="h-1.5 w-full bg-gradient-to-r from-vistaro-accent via-amber-500 to-vistaro-rating" />

      <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
        
        {/* Header & Badges */}
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            
            {/* Destination Pill */}
            {plan.destination ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-vistaro-secondary text-vistaro-primary font-semibold text-xs border border-vistaro-border shadow-2xs">
                <MapPin className="w-3.5 h-3.5 text-vistaro-accent" />
                <span>{plan.destination.name || 'Destination'}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-vistaro-secondary text-vistaro-muted font-semibold text-xs border border-vistaro-border">
                <Compass className="w-3.5 h-3.5 text-vistaro-accent" />
                <span>Multi-Region</span>
              </span>
            )}

            {/* Item Count Badge */}
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-vistaro-muted bg-vistaro-secondary px-2.5 py-1 rounded-full border border-vistaro-border">
              <Layers className="w-3.5 h-3.5 text-vistaro-accent" />
              <span>{itemsCount} {itemsCount === 1 ? 'item' : 'items'}</span>
            </span>
          </div>

          {/* Plan Title */}
          <Link
            to={`/travel-plans/${plan._id}`}
            className="block group-hover:text-vistaro-accent transition-colors"
          >
            <h3 className="text-lg font-serif font-medium text-vistaro-primary line-clamp-2 leading-snug">
              {plan.title}
            </h3>
          </Link>
        </div>

        {/* Schedule & Metadata */}
        <div className="pt-2 border-t border-vistaro-border space-y-2">
          
          {/* Dates */}
          <div className="flex items-center justify-between text-xs text-vistaro-muted">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-vistaro-muted" />
              <span className="font-medium text-vistaro-primary">{formatDateRange(plan.startDate, plan.endDate)}</span>
            </span>
            {durationStr && (
              <span className="font-semibold text-[11px] px-2 py-0.5 rounded-full bg-vistaro-accent/10 text-vistaro-accent border border-vistaro-accent/20">
                {durationStr}
              </span>
            )}
          </div>

          {/* Created Date */}
          <div className="text-[11px] text-vistaro-muted flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>Created on {new Date(plan.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </div>

      </div>

      {/* Footer Action Bar */}
      <div className="p-4 bg-vistaro-secondary/60 border-t border-vistaro-border flex items-center justify-between gap-3">
        <Link
          to={`/travel-plans/${plan._id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-vistaro-primary group-hover:text-vistaro-accent transition-colors"
        >
          <span>View Itinerary</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>

        <div className="flex items-center gap-1.5">
          {!isArchivedView ? (
            <button
              type="button"
              onClick={() => onArchive && onArchive(plan._id)}
              className="p-1.5 rounded-full text-vistaro-muted hover:text-vistaro-rating hover:bg-vistaro-surface transition-colors"
              title="Archive Plan"
              aria-label="Archive plan"
            >
              <Archive className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onDelete && onDelete(plan._id, true)}
              className="p-1.5 rounded-full text-vistaro-muted hover:text-vistaro-error hover:bg-vistaro-surface transition-colors"
              title="Permanently Delete"
              aria-label="Permanently delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

    </div>
  );
}
