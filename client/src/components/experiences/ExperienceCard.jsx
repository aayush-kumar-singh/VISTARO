import React from 'react';
import { Link } from 'react-router-dom';
import { useCurrency } from '../../context/CurrencyContext.jsx';
import {
  Clock,
  MapPin,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

export default function ExperienceCard({ exp }) {
  const { formatPrice } = useCurrency();

  const coverUrl =
    exp.coverImage?.url ||
    exp.image?.url ||
    'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80';

  const destinationName =
    typeof exp.destination === 'object' ? exp.destination?.name : 'Curated';

  const duration = exp.durationHours || 2;
  const basePrice = exp.price?.basePrice ?? exp.basePrice ?? 0;

  return (
    <div className="group bg-vistaro-surface rounded-3xl overflow-hidden border border-vistaro-border hover:border-vistaro-muted hover:shadow-xl transition-all duration-300 flex flex-col h-full relative">

      {/* 1. Card Cover Image & Floating Badges */}
      <div className="relative aspect-4/3 overflow-hidden bg-vistaro-secondary">
        <img
          src={coverUrl}
          alt={exp.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

        {/* Top Floating Badges */}
        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none">
          <span className="inline-flex items-center gap-1 bg-vistaro-surface/95 backdrop-blur-md text-vistaro-primary border border-vistaro-border text-[11px] font-extrabold px-3 py-1 rounded-full shadow-md">
            <MapPin className="w-3 h-3 text-vistaro-accent" />
            {destinationName}
          </span>

          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-vistaro-border backdrop-blur-md bg-vistaro-surface/90 text-vistaro-primary shadow-xs">
            {exp.category || 'Adventure'}
          </span>
        </div>

        {/* Bottom Duration & Difficulty Badges */}
        <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between text-white text-xs font-semibold drop-shadow-sm">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-vistaro-rating" />
            <span>{duration} {duration === 1 ? 'Hour' : 'Hours'}</span>
          </div>

          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-md text-white border border-white/20">
            {exp.difficultyLevel || 'Easy'}
          </span>
        </div>
      </div>

      {/* 2. Card Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <h3 className="font-bold text-base sm:text-lg text-vistaro-primary line-clamp-1 group-hover:text-vistaro-accent transition-colors">
            {exp.title}
          </h3>

          <p className="text-xs text-vistaro-secondary line-clamp-2 leading-relaxed">
            {exp.shortDescription || exp.longDescription || 'An immersive local experience led by passionate hosts.'}
          </p>

          {/* Highlights / Whats Included Sneak Peek */}
          {Array.isArray(exp.whatsIncluded) && exp.whatsIncluded.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {exp.whatsIncluded.slice(0, 2).map((inc, i) => (
                <span
                  key={i}
                  className="bg-vistaro-secondary text-vistaro-primary border border-vistaro-border text-[10px] font-medium px-2 py-0.5 rounded-md flex items-center gap-1"
                >
                  <CheckCircle2 className="w-2.5 h-2.5 text-vistaro-accent shrink-0" />
                  <span className="truncate max-w-[130px]">{inc}</span>
                </span>
              ))}
              {exp.whatsIncluded.length > 2 && (
                <span className="text-[10px] text-vistaro-muted font-semibold self-center">
                  +{exp.whatsIncluded.length - 2} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* 3. Card Footer: Pricing & CTA */}
        <div className="pt-3 border-t border-vistaro-border flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] font-medium text-vistaro-muted block uppercase tracking-wider">
              Starting From
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-extrabold text-vistaro-primary">
                {formatPrice(basePrice)}
              </span>
              <span className="text-[11px] text-vistaro-muted font-normal">/ person</span>
            </div>
          </div>

          <Link
            to={`/experiences/${exp.slug}`}
            className="inline-flex items-center gap-1.5 bg-vistaro-accent hover:bg-vistaro-accent-hover text-white text-xs font-bold py-2.5 px-4 rounded-full transition-all shadow-xs cursor-pointer"
          >
            <span>Explore</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

    </div>
  );
}
