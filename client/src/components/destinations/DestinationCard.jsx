import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ArrowRight, Star, Flame } from 'lucide-react';

export default function DestinationCard({ destination }) {
  if (!destination) return null;

  const heroUrl = destination.heroImage?.url || destination.image?.url || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80';
  const locationLabel = destination.state ? `${destination.state}, ${destination.country || 'India'}` : (destination.country || 'India');

  return (
    <Link
      to={`/destinations/${destination.slug || destination._id}`}
      className="group flex flex-col bg-vistaro-surface border border-vistaro-border rounded-3xl overflow-hidden shadow-xs hover:shadow-xl hover:border-vistaro-muted transition-all duration-300 transform hover:-translate-y-1"
    >
      {/* Image Container with Zoom Effect */}
      <div className="relative w-full aspect-16/10 overflow-hidden bg-vistaro-secondary">
        <img
          src={heroUrl}
          alt={destination.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30" />

        {/* Location Badge */}
        <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white text-caption">
          <MapPin className="w-3.5 h-3.5 text-vistaro-accent" />
          <span>{locationLabel}</span>
        </div>

        {/* Curation Badges top-right */}
        <div className="absolute top-4 right-4 flex items-center gap-1.5">
          {destination.isTrending && (
            <span
              className="inline-flex items-center justify-center p-1.5 rounded-full bg-rose-500/90 backdrop-blur-md text-white shadow-xs"
              title="Trending"
              aria-label="Trending"
            >
              <Flame className="w-3.5 h-3.5 fill-white" />
            </span>
          )}
        </div>

        {/* Name overlay on bottom of image */}
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-card-title text-xl sm:text-2xl text-white tracking-tight drop-shadow-md truncate">
            {destination.name}
          </h3>
        </div>
      </div>

      {/* Card Body */}
      <div className="flex-1 p-5 flex flex-col justify-between space-y-3">
        <p className="text-body-sm text-vistaro-secondary line-clamp-2 leading-relaxed">
          {destination.shortTagline || destination.tagline || 'Explore verified luxury villas, cultural tours, and local host experiences.'}
        </p>

        <div className="flex items-center justify-between pt-2 border-t border-vistaro-border text-xs">
          <span className="text-vistaro-muted font-medium">Gateway Hub</span>
          <span className="font-bold text-vistaro-accent group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
            Explore Region <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
