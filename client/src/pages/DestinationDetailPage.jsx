import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { destinationsApi } from '../api/destinationsApi.js';
import ImageGallery from '../components/listings/ImageGallery.jsx';
import MapView from '../components/listings/MapView.jsx';
import ListingCard from '../components/listings/ListingCard.jsx';
import TourPackageCard from '../components/packages/TourPackageCard.jsx';
import ExperienceCard from '../components/experiences/ExperienceCard.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import {
  MapPin,
  Sparkles,
  Compass,
  Home,
  CheckCircle2,
  ChevronRight,
  ShieldAlert,
  ArrowLeft,
  ExternalLink,
  Users,
  Tag,
  ArrowRight,
} from 'lucide-react';

export default function DestinationDetailPage() {
  const { slug } = useParams();

  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sub-resource lists
  const [tourPackages, setTourPackages] = useState([]);
  const [packagesLoading, setPackagesLoading] = useState(false);

  const [experiences, setExperiences] = useState([]);
  const [experiencesLoading, setExperiencesLoading] = useState(false);

  const [stays, setStays] = useState([]);
  const [staysLoading, setStaysLoading] = useState(false);

  useEffect(() => {
    async function fetchDestinationData() {
      try {
        setLoading(true);
        setError(null);

        const data = await destinationsApi.getDestinationBySlug(slug);
        const dest = data.destination;
        setDestination(dest);

        // Concurrently fetch connected resources
        if (dest?._id || dest?.slug) {
          fetchConnectedPackages(dest.slug);
          fetchConnectedExperiences(dest.slug);
          fetchConnectedStays(dest.name);
        }
      } catch (err) {
        setError(err.message || 'Failed to load destination guide.');
      } finally {
        setLoading(false);
      }
    }

    async function fetchConnectedPackages(destSlug) {
      try {
        setPackagesLoading(true);
        const res = await destinationsApi.getDestinationPackages(destSlug);
        setTourPackages(res.packages || []);
      } catch (err) {
        console.error('Failed to load packages for destination:', err);
      } finally {
        setPackagesLoading(false);
      }
    }

    async function fetchConnectedExperiences(destSlug) {
      try {
        setExperiencesLoading(true);
        const res = await destinationsApi.getDestinationExperiences(destSlug);
        setExperiences(res.experiences || []);
      } catch (err) {
        console.error('Failed to load experiences for destination:', err);
      } finally {
        setExperiencesLoading(false);
      }
    }

    async function fetchConnectedStays(destName) {
      try {
        setStaysLoading(true);
        const res = await destinationsApi.getDestinationStays(destName);
        setStays(res.listings || []);
      } catch (err) {
        console.error('Failed to load stays for destination:', err);
      } finally {
        setStaysLoading(false);
      }
    }

    fetchDestinationData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  const scrollToStays = (e) => {
    e.preventDefault();
    const elem = document.getElementById('stays-section');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading curated destination guide..." />;
  }

  if (error || !destination) {
    return (
      <div className="text-center py-20 bg-vistaro-surface rounded-3xl border border-vistaro-border max-w-xl mx-auto my-12 space-y-4">
        <ShieldAlert className="w-12 h-12 text-vistaro-error mx-auto mb-2" />
        <h2 className="text-display-h2 text-vistaro-primary">Destination Not Found</h2>
        <p className="text-body-sm text-vistaro-secondary max-w-md mx-auto">{error || "The destination you requested doesn't exist or is currently unpublished."}</p>
        <Link
          to="/destinations"
          className="inline-flex items-center gap-2 bg-vistaro-accent hover:bg-vistaro-accent-hover text-white text-cta py-3 px-6 rounded-full transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Destinations
        </Link>
      </div>
    );
  }

  const galleryImages = [
    ...(destination.heroImage?.url ? [destination.heroImage] : []),
    ...(destination.galleryImages || []),
  ];

  const mapGeometry = {
    type: 'Point',
    coordinates: [
      destination.coordinates?.lng || 77.2090,
      destination.coordinates?.lat || 28.6139,
    ],
  };

  const locationLabel = destination.state
    ? `${destination.state}, ${destination.country || 'India'}`
    : (destination.country || 'India');

  return (
    <div className="w-full max-w-7xl mx-auto space-y-12 pb-20 text-vistaro-primary transition-colors duration-200">
      {/* 1. Breadcrumbs Navigation */}
      <nav className="flex items-center gap-2 text-body-sm text-vistaro-muted pt-2">
        <Link to="/" className="hover:text-vistaro-primary transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-vistaro-muted" />
        <Link to="/destinations" className="hover:text-vistaro-primary transition-colors">
          Destinations
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-vistaro-muted" />
        <span className="font-semibold text-vistaro-primary truncate max-w-[200px]">
          {destination.name}
        </span>
      </nav>

      {/* 2. Hero Header Showcase */}
      <div className="relative rounded-3xl overflow-hidden shadow-xl border border-vistaro-border bg-vistaro-surface text-white min-h-[380px] sm:min-h-[460px] flex items-end">
        <img
          src={destination.heroImage?.url || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80'}
          alt={destination.name}
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/20" />

        <div className="relative z-10 p-8 sm:p-12 space-y-5 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-caption text-white">
            <MapPin className="w-3.5 h-3.5 text-vistaro-accent" />
            {locationLabel}
          </div>

          <h1 className="text-display-hero text-white drop-shadow-md">
            {destination.name}
          </h1>

          <p className="text-body text-lg text-white/90 leading-relaxed drop-shadow-xs">
            {destination.shortTagline || destination.tagline}
          </p>

          <div className="pt-3 flex flex-wrap items-center gap-3.5">
            <a
              href="#stays-section"
              onClick={scrollToStays}
              className="inline-flex items-center gap-2 bg-vistaro-accent hover:bg-vistaro-accent-hover text-white text-cta py-3 px-6 rounded-full transition-all shadow-md cursor-pointer"
            >
              <Home className="w-4 h-4" /> Explore Stays in {destination.name}
            </a>

            <Link
              to="/destinations"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 text-cta py-3 px-5 rounded-full transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> All Destinations
            </Link>
          </div>
        </div>
      </div>

      {/* 3. Photo Gallery Display */}
      {galleryImages.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-display-h2 text-vistaro-primary">
              Photographic Preview
            </h2>
            <span className="text-caption text-vistaro-muted">
              {galleryImages.length} Curated {galleryImages.length === 1 ? 'Photo' : 'Photos'}
            </span>
          </div>
          <ImageGallery images={galleryImages} title={destination.name} />
        </div>
      )}

      {/* 4. Editorial Narrative & Explorer Insights (2-Column Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Full Editorial Description */}
        <div className="lg:col-span-2 bg-vistaro-surface border border-vistaro-border rounded-3xl p-8 sm:p-10 space-y-6 shadow-xs">
          <div className="flex items-center gap-2.5 pb-4 border-b border-vistaro-border">
            <div className="w-9 h-9 rounded-full bg-vistaro-secondary text-vistaro-accent flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-display-h2 text-vistaro-primary">The Vistaro Guide to {destination.name}</h2>
              <p className="text-muted">Curated editorial profile & regional character</p>
            </div>
          </div>

          <div className="text-vistaro-secondary leading-relaxed text-body whitespace-pre-line space-y-4">
            {destination.longDescription || destination.description || destination.shortTagline}
          </div>
        </div>

        {/* Right Column: Travel Tags & Persona Cards */}
        <div className="space-y-6">
          {/* Best For Card */}
          {destination.bestFor && destination.bestFor.length > 0 && (
            <div className="bg-vistaro-surface border border-vistaro-border rounded-3xl p-6 space-y-3.5 shadow-xs">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-vistaro-accent" />
                <h3 className="text-label text-vistaro-primary">
                  Recommended For
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {destination.bestFor.map((item, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-vistaro-secondary text-vistaro-accent text-2xs font-semibold border border-vistaro-border"
                  >
                    <CheckCircle2 className="w-3 h-3 text-vistaro-accent" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Identity & Vibe Tags */}
          {destination.identityTags && destination.identityTags.length > 0 && (
            <div className="bg-vistaro-surface border border-vistaro-border rounded-3xl p-6 space-y-3.5 shadow-xs">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-vistaro-muted" />
                <h3 className="text-label text-vistaro-primary">
                  Regional Vibe
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {destination.identityTags.map((item, idx) => (
                  <span
                    key={idx}
                    className="inline-block px-3 py-1.5 rounded-xl bg-vistaro-secondary text-vistaro-secondary text-2xs font-normal border border-vistaro-border"
                  >
                    #{item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Geography Summary Card */}
          <div className="bg-vistaro-secondary border border-vistaro-border rounded-3xl p-6 space-y-3 shadow-xs">
            <h3 className="text-label text-vistaro-primary">
              Quick Facts
            </h3>
            <div className="space-y-2 text-body-sm text-vistaro-secondary">
              <div className="flex justify-between py-1 border-b border-vistaro-border">
                <span className="text-muted">Region</span>
                <span className="font-semibold text-vistaro-primary">{destination.state || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-vistaro-border">
                <span className="text-muted">Country</span>
                <span className="font-semibold text-vistaro-primary">{destination.country || 'India'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted">Coordinates</span>
                <span className="font-semibold text-vistaro-primary">
                  {destination.coordinates?.lat?.toFixed(4)}° N, {destination.coordinates?.lng?.toFixed(4)}° E
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Interactive Leaflet Map Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-display-h2 text-vistaro-primary">
              Regional Geography & Map
            </h2>
            <p className="text-muted mt-0.5">
              Centered around {destination.name}, {locationLabel}
            </p>
          </div>
        </div>

        <MapView
          geometry={mapGeometry}
          title={destination.name}
          location={destination.state}
          country={destination.country}
        />
      </div>

      {/* 6. Tour Packages in Destination Section */}
      <div id="packages-section" className="space-y-6 pt-4 border-t border-vistaro-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-display-h2 text-vistaro-primary flex items-center gap-2">
              <Compass className="w-6 h-6 text-vistaro-rating" /> Curated Tour Packages in {destination.name}
            </h2>
            <p className="text-body-sm text-vistaro-muted mt-1">
              Multi-day guided itineraries, adventure expeditions, and cultural escapes crafted for {destination.name}.
            </p>
          </div>

          <Link
            to={`/tours?destination=${destination.slug}`}
            className="inline-flex items-center gap-1.5 text-cta text-vistaro-accent hover:text-vistaro-accent-hover transition-colors self-start sm:self-auto"
          >
            <span>View All Packages</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        {packagesLoading && (
          <div className="py-12 text-center text-vistaro-muted">
            <LoadingSpinner fullScreen={false} text={`Loading curated tour packages for ${destination.name}...`} />
          </div>
        )}

        {!packagesLoading && tourPackages.length === 0 && (
          <div className="text-center py-10 px-6 bg-vistaro-surface rounded-3xl border border-vistaro-border space-y-2">
            <Compass className="w-8 h-8 text-vistaro-rating mx-auto" />
            <h3 className="text-display-h3 text-vistaro-primary">
              New itineraries for {destination.name} are being prepared
            </h3>
            <p className="text-body-sm text-vistaro-secondary max-w-md mx-auto">
              Our travel specialists are finalizing new seasonal tour packages for {destination.name}.
            </p>
            <Link
              to="/tours"
              className="inline-block text-vistaro-accent hover:underline text-cta pt-1"
            >
              Explore all platform tour packages &rarr;
            </Link>
          </div>
        )}

        {!packagesLoading && tourPackages.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {tourPackages.map((pkg) => (
              <TourPackageCard key={pkg._id} pkg={pkg} />
            ))}
          </div>
        )}
      </div>

      {/* 7. Host-Led Experiences in Destination Section */}
      <div id="experiences-section" className="space-y-6 pt-4 border-t border-vistaro-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-display-h2 text-vistaro-primary flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-vistaro-accent" /> Host-Led Experiences in {destination.name}
            </h2>
            <p className="text-body-sm text-vistaro-muted mt-1">
              Immersive culinary walks, nature safaris, and artisan workshops led by local specialists in {destination.name}.
            </p>
          </div>

          <Link
            to={`/experiences?destination=${destination.slug}`}
            className="inline-flex items-center gap-1.5 text-cta text-vistaro-accent hover:text-vistaro-accent-hover transition-colors self-start sm:self-auto"
          >
            <span>View All Experiences</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        {experiencesLoading && (
          <div className="py-12 text-center text-vistaro-muted">
            <LoadingSpinner fullScreen={false} text={`Loading curated experiences for ${destination.name}...`} />
          </div>
        )}

        {!experiencesLoading && experiences.length === 0 && (
          <div className="text-center py-10 px-6 bg-vistaro-surface rounded-3xl border border-vistaro-border space-y-2">
            <Sparkles className="w-8 h-8 text-vistaro-accent mx-auto" />
            <h3 className="text-display-h3 text-vistaro-primary">
              New experiences for {destination.name} are coming soon
            </h3>
            <p className="text-body-sm text-vistaro-secondary max-w-md mx-auto">
              Our local hosts are currently crafting authentic immersion activities in {destination.name}.
            </p>
            <Link
              to="/experiences"
              className="inline-block text-vistaro-accent hover:underline text-cta pt-1"
            >
              Explore all platform experiences &rarr;
            </Link>
          </div>
        )}

        {!experiencesLoading && experiences.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {experiences.map((exp) => (
              <ExperienceCard key={exp._id} exp={exp} />
            ))}
          </div>
        )}
      </div>

      {/* 8. Stays in Destination Section */}
      <div id="stays-section" className="space-y-6 pt-4 border-t border-vistaro-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-display-h2 text-vistaro-primary flex items-center gap-2">
              <Home className="w-6 h-6 text-vistaro-accent" /> Stays in {destination.name}
            </h2>
            <p className="text-body-sm text-vistaro-muted mt-1">
              Hand-picked luxury villas, boutique homestays, and unique chalets located in and around {destination.name}.
            </p>
          </div>

          <Link
            to={`/search?q=${encodeURIComponent(destination.name)}`}
            className="inline-flex items-center gap-1.5 text-cta text-vistaro-accent hover:text-vistaro-accent-hover transition-colors self-start sm:self-auto"
          >
            <span>View All Search Results</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        {staysLoading && (
          <div className="py-12 text-center text-vistaro-muted">
            <LoadingSpinner fullScreen={false} text={`Searching available stays in ${destination.name}...`} />
          </div>
        )}

        {!staysLoading && stays.length === 0 && (
          <div className="text-center py-12 px-6 bg-vistaro-surface rounded-3xl border border-vistaro-border space-y-3">
            <Home className="w-10 h-10 text-vistaro-muted mx-auto" />
            <h3 className="text-display-h3 text-vistaro-primary">
              No directly matching properties listed in {destination.name} yet
            </h3>
            <p className="text-body-sm text-vistaro-secondary max-w-md mx-auto">
              We are currently onboarding exclusive private stays in {destination.name}. Explore all active Vistaro stays across other regions.
            </p>
            <Link
              to="/"
              className="inline-block bg-vistaro-accent hover:bg-vistaro-accent-hover text-white text-cta py-2.5 px-6 rounded-full transition-colors mt-2"
            >
              Explore All Vistaro Stays
            </Link>
          </div>
        )}

        {!staysLoading && stays.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {stays.map((listing) => (
              <ListingCard key={listing._id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
