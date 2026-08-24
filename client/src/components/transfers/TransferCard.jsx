import React from 'react';
import { useCurrency } from '../../context/CurrencyContext.jsx';
import {
  Car,
  Users,
  Clock,
  MapPin,
  CheckCircle2,
  Compass,
  ArrowRight,
} from 'lucide-react';

export default function TransferCard({ transfer, onAddToPlan }) {
  const { formatPrice } = useCurrency();

  if (!transfer) return null;

  const basePrice = transfer.price?.basePrice ?? transfer.basePrice ?? 0;
  const imageUrl =
    transfer.coverImage?.url ||
    transfer.image?.url ||
    'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80';

  const formatTransferType = (type) => {
    if (!type) return 'Transfer';
    return type.replace(/-/g, ' ');
  };

  return (
    <div className="group bg-vistaro-surface border border-vistaro-border rounded-3xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between text-vistaro-primary">
      {/* 1. Image & Badges */}
      <div className="relative aspect-4/3 overflow-hidden bg-vistaro-secondary">
        <img
          src={imageUrl}
          alt={transfer.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="absolute top-3.5 left-3.5 flex flex-wrap gap-2 z-10">
          <span className="bg-black/70 backdrop-blur-md text-white text-caption font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-sm border border-white/10">
            <Car className="w-3.5 h-3.5 text-emerald-400" />
            <span>{transfer.vehicleType || 'SUV'}</span>
          </span>
          <span className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md text-vistaro-primary text-caption font-bold px-2.5 py-1 rounded-full capitalize shadow-sm border border-vistaro-border">
            {formatTransferType(transfer.transferType)}
          </span>
        </div>

        {/* Capacity Pill */}
        <div className="absolute bottom-3.5 right-3.5 z-10">
          <span className="bg-black/60 backdrop-blur-md text-white text-caption font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-vistaro-rating" />
            <span>Up to {transfer.capacity || 4} Pax</span>
          </span>
        </div>
      </div>

      {/* 2. Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <h3 className="font-bold text-base text-vistaro-primary line-clamp-1 group-hover:text-vistaro-accent transition-colors">
            {transfer.title}
          </h3>

          {/* Route details */}
          {(transfer.pickupLocation || transfer.dropLocation) && (
            <div className="space-y-1 py-1">
              {transfer.pickupLocation && (
                <div className="flex items-center gap-2 text-xs text-vistaro-secondary truncate">
                  <MapPin className="w-3.5 h-3.5 text-vistaro-accent shrink-0" />
                  <span className="truncate">From: <strong className="text-vistaro-primary">{transfer.pickupLocation}</strong></span>
                </div>
              )}
              {transfer.dropLocation && (
                <div className="flex items-center gap-2 text-xs text-vistaro-secondary truncate">
                  <ArrowRight className="w-3.5 h-3.5 text-vistaro-muted shrink-0 ml-0.5" />
                  <span className="truncate">To: <strong className="text-vistaro-primary">{transfer.dropLocation}</strong></span>
                </div>
              )}
            </div>
          )}

          {/* Duration info */}
          {transfer.estimatedDuration && (
            <div className="flex items-center gap-1.5 text-xs text-vistaro-muted font-medium">
              <Clock className="w-3.5 h-3.5 text-vistaro-muted" />
              <span>Est. {transfer.estimatedDuration}</span>
            </div>
          )}

          {/* Top Features */}
          {Array.isArray(transfer.includedFeatures) && transfer.includedFeatures.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {transfer.includedFeatures.slice(0, 3).map((feat, idx) => (
                <span
                  key={idx}
                  className="bg-vistaro-secondary text-vistaro-secondary border border-vistaro-border text-caption px-2 py-0.5 rounded-full flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                  <span className="truncate max-w-[130px]">{feat}</span>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 3. Footer: Price & Add to Plan Button */}
        <div className="pt-3 border-t border-vistaro-border flex items-center justify-between gap-3">
          <div>
            <div className="text-2xs uppercase tracking-wider text-vistaro-muted font-bold">Standard Rate</div>
            <div className="text-price text-lg text-vistaro-primary font-bold">
              {formatPrice(basePrice)}
              <span className="text-xs text-vistaro-muted font-normal ml-1">
                /{transfer.priceUnit === 'per-day' ? 'day' : transfer.priceUnit === 'per-hour' ? 'hr' : 'trip'}
              </span>
            </div>
          </div>

          {onAddToPlan && (
            <button
              type="button"
              onClick={() => onAddToPlan(transfer)}
              className="bg-vistaro-secondary hover:bg-vistaro-accent hover:text-white text-vistaro-primary border border-vistaro-border text-cta text-xs py-2 px-3.5 rounded-full transition-all duration-200 flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 shrink-0"
              title="Add this transfer to your curated travel plan"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Add to Plan</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
