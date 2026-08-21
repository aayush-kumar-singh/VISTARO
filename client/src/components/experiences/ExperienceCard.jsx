import React from 'react';
import { Link } from 'react-router-dom';
import { useCurrency } from '../../context/CurrencyContext.jsx';
import {
  Clock,
  MapPin,
  Users,
  Sparkles,
  ArrowRight,
  ShieldCheck,
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

  const categoryColors = {
    Adventure: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Cultural: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    'Food & Drink': 'bg-amber-50 text-amber-800 border-amber-200',
    Nature: 'bg-teal-50 text-teal-700 border-teal-200',
    Wellness: 'bg-purple-50 text-purple-700 border-purple-200',
    Photography: 'bg-rose-50 text-rose-700 border-rose-200',
    Workshop: 'bg-blue-50 text-blue-700 border-blue-200',
  };

  const difficultyColors = {
    Easy: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Moderate: 'bg-blue-50 text-blue-700 border-blue-200',
    Challenging: 'bg-amber-50 text-amber-800 border-amber-200',
  };

  return (
    <div className="group bg-white rounded-3xl overflow-hidden border border-zinc-200 hover:border-zinc-300 hover:shadow-xl transition-all duration-300 flex flex-col h-full relative">
      
      {/* 1. Card Cover Image & Floating Badges */}
      <div className="relative aspect-4/3 overflow-hidden bg-zinc-100">
        <img
          src={coverUrl}
          alt={exp.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

        {/* Top Floating Badges */}
        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none">
          <span className="inline-flex items-center gap-1 bg-white/95 backdrop-blur-md text-zinc-900 text-[11px] font-extrabold px-3 py-1 rounded-full shadow-md">
            <MapPin className="w-3 h-3 text-[#dc3545]" />
            {destinationName}
          </span>

          <span
            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border backdrop-blur-md bg-white/90 shadow-xs ${
              categoryColors[exp.category] || categoryColors.Adventure
            }`}
          >
            {exp.category || 'Adventure'}
          </span>
        </div>

        {/* Bottom Duration & Difficulty Badges */}
        <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between text-white text-xs font-semibold drop-shadow-sm">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-purple-300" />
            <span>{duration} {duration === 1 ? 'Hour' : 'Hours'}</span>
          </div>

          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-md text-zinc-200 border border-white/20">
            {exp.difficultyLevel || 'Easy'}
          </span>
        </div>
      </div>

      {/* 2. Card Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <h3 className="font-bold text-base sm:text-lg text-zinc-900 line-clamp-1 group-hover:text-purple-700 transition-colors">
            {exp.title}
          </h3>

          <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
            {exp.shortDescription || exp.longDescription || 'An immersive local experience led by passionate hosts.'}
          </p>

          {/* Highlights / Whats Included Sneak Peek */}
          {Array.isArray(exp.whatsIncluded) && exp.whatsIncluded.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {exp.whatsIncluded.slice(0, 2).map((inc, i) => (
                <span
                  key={i}
                  className="bg-purple-50/70 text-purple-800 text-[10px] font-medium px-2 py-0.5 rounded-md flex items-center gap-1"
                >
                  <CheckCircle2 className="w-2.5 h-2.5 text-purple-600 shrink-0" />
                  <span className="truncate max-w-[130px]">{inc}</span>
                </span>
              ))}
              {exp.whatsIncluded.length > 2 && (
                <span className="text-[10px] text-zinc-400 font-semibold self-center">
                  +{exp.whatsIncluded.length - 2} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* 3. Card Footer: Pricing & CTA */}
        <div className="pt-3 border-t border-zinc-100 flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] font-medium text-zinc-400 block uppercase tracking-wider">
              Starting From
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-extrabold text-zinc-900">
                {formatPrice(basePrice)}
              </span>
              <span className="text-[11px] text-zinc-400 font-normal">/ person</span>
            </div>
          </div>

          <Link
            to={`/experiences/${exp.slug}`}
            className="inline-flex items-center gap-1.5 bg-zinc-900 hover:bg-black text-white text-xs font-bold py-2.5 px-4 rounded-full transition-all group-hover:bg-purple-700 shadow-xs cursor-pointer"
          >
            <span>Explore</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

    </div>
  );
}
