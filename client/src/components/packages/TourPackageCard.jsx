import React from 'react';
import { Link } from 'react-router-dom';
import { useCurrency } from '../../context/CurrencyContext.jsx';
import {
  Clock,
  MapPin,
  Users,
  Compass,
  ArrowRight,
  ShieldCheck,
  Sparkles,
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
    Easy: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Moderate: 'bg-blue-50 text-blue-700 border-blue-200',
    Challenging: 'bg-amber-50 text-amber-800 border-amber-200',
  };

  return (
    <div className="group bg-white rounded-3xl overflow-hidden border border-zinc-200 hover:border-zinc-300 hover:shadow-xl transition-all duration-300 flex flex-col h-full relative">
      
      {/* 1. Card Cover Image & Badges */}
      <div className="relative aspect-4/3 overflow-hidden bg-zinc-100">
        <img
          src={coverUrl}
          alt={pkg.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none">
          <span className="inline-flex items-center gap-1 bg-white/95 backdrop-blur-md text-zinc-900 text-[11px] font-extrabold px-3 py-1 rounded-full shadow-md">
            <MapPin className="w-3 h-3 text-[#dc3545]" />
            {destinationName}
          </span>

          <span
            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border backdrop-blur-md bg-white/90 ${
              difficultyColors[pkg.difficultyLevel] || difficultyColors.Moderate
            }`}
          >
            {pkg.difficultyLevel || 'Moderate'}
          </span>
        </div>

        {/* Bottom Duration Badge */}
        <div className="absolute bottom-3 left-3.5 flex items-center gap-1.5 text-white text-xs font-semibold drop-shadow-sm">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span>
            {days} Days {nights > 0 ? `· ${nights} Nights` : ''}
          </span>
        </div>
      </div>

      {/* 2. Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <h3 className="font-bold text-base sm:text-lg text-zinc-900 line-clamp-1 group-hover:text-[#dc3545] transition-colors">
            {pkg.title}
          </h3>

          <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
            {pkg.shortDescription || pkg.longDescription || 'An unforgettable curated expedition across iconic landscapes.'}
          </p>

          {/* Highlights / Inclusions Sneak Peek */}
          {Array.isArray(pkg.inclusions) && pkg.inclusions.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {pkg.inclusions.slice(0, 3).map((inc, i) => (
                <span
                  key={i}
                  className="bg-zinc-100 text-zinc-600 text-[10px] font-medium px-2 py-0.5 rounded-md"
                >
                  ✓ {inc}
                </span>
              ))}
              {pkg.inclusions.length > 3 && (
                <span className="text-[10px] text-zinc-400 font-semibold self-center">
                  +{pkg.inclusions.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* 3. Footer: Price & CTA */}
        <div className="pt-3 border-t border-zinc-100 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-wider font-bold text-zinc-400">
              Starting from
            </div>
            <div className="text-base font-extrabold text-zinc-900">
              {formatPrice(basePrice)}
              <span className="text-[11px] font-normal text-zinc-500"> / person</span>
            </div>
          </div>

          <Link
            to={`/tours/${pkg.slug}`}
            className="inline-flex items-center gap-1.5 bg-[#222222] hover:bg-[#dc3545] text-white text-xs font-bold py-2.5 px-4 rounded-full transition-all duration-300 shadow-xs hover:shadow-md group-hover:translate-x-0.5"
          >
            <span>View Tour</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

    </div>
  );
}
