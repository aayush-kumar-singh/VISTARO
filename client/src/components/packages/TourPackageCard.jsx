import React from 'react';
import { Link } from 'react-router-dom';
import { useCurrency } from '../../context/CurrencyContext.jsx';
import {
  Clock,
  MapPin,
  ArrowRight,
} from 'lucide-react';

export default function TourPackageCard({ pkg }) {
  const { formatPrice } = useCurrency();

  const coverUrl =
    pkg.coverImage?.url ||
    pkg.image?.url ||
    'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?auto=format&fit=crop&w=800&q=80';

  const destinationName =
    typeof pkg.destination === 'object' ? pkg.destination?.name : 'India';

  const days = pkg.duration?.days || 1;
  const nights = pkg.duration?.nights || 0;
  const basePrice = pkg.price?.basePrice ?? pkg.basePrice ?? 0;

  const difficultyColors = {
    Easy: 'bg-vistaro-surface text-vistaro-success border-vistaro-success/40',
    Moderate: 'bg-vistaro-surface text-vistaro-accent border-vistaro-accent/40',
    Challenging: 'bg-vistaro-surface text-vistaro-rating border-vistaro-rating/40',
  };

  return (
    <div className="group bg-vistaro-surface rounded-3xl overflow-hidden border border-vistaro-border hover:border-vistaro-muted hover:shadow-xl transition-all duration-300 flex flex-col h-full relative">

      {/* 1. Card Cover Image & Badges */}
      <div className="relative aspect-4/3 overflow-hidden bg-vistaro-secondary">
        <img
          src={coverUrl}
          alt={pkg.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none">
          <span className="inline-flex items-center gap-1 bg-vistaro-surface/95 backdrop-blur-md text-vistaro-primary border border-vistaro-border text-caption px-3 py-1 rounded-full shadow-md">
            <MapPin className="w-3 h-3 text-vistaro-accent" />
            {destinationName}
          </span>

          <span
            className={`text-caption px-2.5 py-0.5 rounded-full border backdrop-blur-md ${difficultyColors[pkg.difficultyLevel] || difficultyColors.Moderate
              }`}
          >
            {pkg.difficultyLevel || 'Moderate'}
          </span>
        </div>

        {/* Bottom Duration Badge */}
        <div className="absolute bottom-3 left-3.5 flex items-center gap-1.5 text-white text-body-sm font-semibold drop-shadow-sm">
          <Clock className="w-3.5 h-3.5 text-vistaro-rating" />
          <span>
            {days} Days {nights > 0 ? `· ${nights} Nights` : ''}
          </span>
        </div>
      </div>

      {/* 2. Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <h3 className="text-card-title text-vistaro-primary line-clamp-1 group-hover:text-vistaro-accent transition-colors">
            {pkg.title}
          </h3>

          <p className="text-body-sm text-vistaro-secondary line-clamp-2 leading-relaxed">
            {pkg.shortDescription || pkg.longDescription || 'An unforgettable curated expedition across iconic landscapes.'}
          </p>

          {/* Highlights / Inclusions Sneak Peek */}
          {Array.isArray(pkg.inclusions) && pkg.inclusions.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {pkg.inclusions.slice(0, 3).map((inc, i) => (
                <span
                  key={i}
                  className="bg-vistaro-secondary text-vistaro-secondary border border-vistaro-border text-2xs font-normal px-2 py-0.5 rounded-md"
                >
                  ✓ {inc}
                </span>
              ))}
              {pkg.inclusions.length > 3 && (
                <span className="text-2xs text-vistaro-muted font-medium self-center">
                  +{pkg.inclusions.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* 3. Footer: Price & CTA */}
        <div className="pt-3 border-t border-vistaro-border flex items-center justify-between">
          <div>
            <div className="text-label text-vistaro-muted">
              Starting from
            </div>
            <div className="text-price text-lg text-vistaro-primary flex items-baseline gap-1">
              <span>{formatPrice(basePrice)}</span>
              <span className="font-sans font-normal text-xs text-vistaro-muted"> / person</span>
            </div>
          </div>

          <Link
            to={`/tours/${pkg.slug}`}
            className="inline-flex items-center gap-1.5 bg-vistaro-accent hover:bg-vistaro-accent-hover text-white text-cta py-2.5 px-4 rounded-full transition-all duration-300 shadow-xs hover:shadow-md group-hover:translate-x-0.5 cursor-pointer"
          >
            <span>View Tour</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

    </div>
  );
}
