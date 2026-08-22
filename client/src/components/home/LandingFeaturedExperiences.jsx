import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { experiencesApi } from '../../api/experiencesApi.js';
import ExperienceCard from '../experiences/ExperienceCard.jsx';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useScrollReveal } from '../../hooks/useScrollReveal.js';

export default function LandingFeaturedExperiences() {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sectionRef, isVisible] = useScrollReveal();

  useEffect(() => {
    let isMounted = true;
    async function fetchFeaturedExperiences() {
      try {
        setLoading(true);
        // Server-side limit-based query
        const data = await experiencesApi.getExperiences({ featured: true, limit: 4 });
        if (isMounted) {
          setExperiences(data.experiences || data || []);
        }
      } catch (err) {
        console.error('Failed to load featured experiences:', err);
        if (isMounted) {
          setError(err.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchFeaturedExperiences();
    return () => {
      isMounted = false;
    };
  }, []);

  // Graceful empty degradation: if 0 featured experiences, hide section entirely
  if (!loading && (experiences.length === 0 || error)) {
    return null;
  }

  return (
    <section
      ref={sectionRef}
      className={`w-full my-12 sm:my-16 space-y-6 text-vistaro-primary transition-all duration-500 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-3 border-b border-vistaro-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 className="font-serif font-medium text-2xl sm:text-3xl text-vistaro-primary tracking-tight">
              Experiences Made Local
            </h2>
          </div>
          <p className="font-sans text-xs sm:text-sm text-vistaro-muted">
            Private chef dinners, traditional artisans, yoga retreats, and hidden trails led by verified local hosts.
          </p>
        </div>

        <Link
          to="/experiences"
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'instant' });
          }}
          className="text-cta text-xs text-vistaro-accent hover:underline inline-flex items-center gap-1 shrink-0 font-semibold self-start sm:self-auto"
        >
          <span>All Host Experiences</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Loading Skeletons */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={`exp-skeleton-${n}`}
              className="bg-vistaro-surface border border-vistaro-border/60 rounded-3xl overflow-hidden animate-pulse space-y-3 p-3"
            >
              <div className="w-full aspect-4/3 bg-vistaro-border/40 rounded-2xl" />
              <div className="h-4 bg-vistaro-border/40 rounded-md w-3/4" />
              <div className="h-3 bg-vistaro-border/40 rounded-md w-1/2" />
              <div className="h-4 bg-vistaro-border/40 rounded-md w-1/3 pt-1" />
            </div>
          ))}
        </div>
      )}

      {/* Cards Layout: 4-in-a-row on desktop, 2-per-row on tablet, horizontal scroll-snap on mobile */}
      {!loading && experiences.length > 0 && (
        <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0 py-1">
          {experiences.map((exp) => (
            <div
              key={`landing-featured-exp-${exp._id}`}
              className="min-w-[82vw] sm:min-w-0 snap-start shrink-0 sm:shrink"
            >
              <ExperienceCard exp={exp} />
            </div>
          ))}
        </div>
      )}

      {/* Section Bottom CTA */}
      {!loading && experiences.length > 0 && (
        <div className="pt-2 flex justify-center">
          <Link
            to="/experiences"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'instant' });
            }}
            className="inline-flex items-center gap-2 bg-vistaro-accent hover:bg-vistaro-accent-hover text-white text-cta font-semibold py-3 px-8 min-h-[46px] rounded-full transition-all duration-200 shadow-xs hover:shadow-md cursor-pointer group touch-manipulation"
          >
            <span>Explore More Experiences</span>
            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      )}
    </section>
  );
}
