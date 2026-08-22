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
    <div className="group relative bg-white rounded-3xl border border-[#171719]/10 hover:border-[#171719]/25 transition-all duration-300 shadow-xs hover:shadow-md flex flex-col justify-between overflow-hidden text-[#171719]">
      
      {/* Top Banner / Color Accent Strip */}
      <div className="h-2 w-full bg-gradient-to-r from-[#FF385C] via-purple-500 to-[#171719]" />

      <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
        
        {/* Header & Badges */}
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            
            {/* Destination Pill */}
            {plan.destination ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-bold text-xs border border-blue-100 shadow-2xs">
                <MapPin className="w-3.5 h-3.5" />
                <span>{plan.destination.name || 'Destination'}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 text-[#A7A7AC] font-semibold text-xs border border-[#171719]/10">
                <Compass className="w-3.5 h-3.5 text-[#FF385C]" />
                <span>Multi-Region</span>
              </span>
            )}

            {/* Item Count Badge */}
            <span className="inline-flex items-center gap-1 text-xs font-bold text-zinc-500 bg-zinc-50 px-2.5 py-1 rounded-full border border-zinc-200">
              <Layers className="w-3.5 h-3.5 text-[#FF385C]" />
              <span>{itemsCount} {itemsCount === 1 ? 'item' : 'items'}</span>
            </span>
          </div>

          {/* Plan Title */}
          <Link
            to={`/travel-plans/${plan._id}`}
            className="block group-hover:text-[#FF385C] transition-colors"
          >
            <h3 className="text-lg font-extrabold text-[#171719] line-clamp-2 leading-snug">
              {plan.title}
            </h3>
          </Link>
        </div>

        {/* Schedule & Metadata */}
        <div className="pt-2 border-t border-[#171719]/5 space-y-2">
          
          {/* Dates */}
          <div className="flex items-center justify-between text-xs text-[#A7A7AC]">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-zinc-400" />
              <span className="font-medium text-[#171719]">{formatDateRange(plan.startDate, plan.endDate)}</span>
            </span>
            {durationStr && (
              <span className="font-bold text-[11px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                {durationStr}
              </span>
            )}
          </div>

          {/* Created Date */}
          <div className="text-[11px] text-[#A7A7AC] flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>Created on {new Date(plan.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </div>

      </div>

      {/* Footer Action Bar */}
      <div className="p-4 bg-zinc-50/70 border-t border-[#171719]/10 flex items-center justify-between gap-3">
        <Link
          to={`/travel-plans/${plan._id}`}
          className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#171719] hover:text-[#FF385C] transition-colors"
        >
          <span>View Itinerary</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>

        <div className="flex items-center gap-1.5">
          {!isArchivedView ? (
            <button
              type="button"
              onClick={() => onArchive && onArchive(plan._id)}
              className="p-1.5 rounded-full text-zinc-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
              title="Archive Plan"
              aria-label="Archive plan"
            >
              <Archive className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onDelete && onDelete(plan._id, true)}
              className="p-1.5 rounded-full text-zinc-400 hover:text-[#FF385C] hover:bg-red-50 transition-colors"
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
