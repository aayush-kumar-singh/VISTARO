import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { destinationsApi } from '../api/destinationsApi.js';
import { listingsApi } from '../api/listingsApi.js';
import { tourPackagesApi } from '../api/tourPackagesApi.js';
import { experiencesApi } from '../api/experiencesApi.js';
import { searchApi } from '../api/searchApi.js';
import ImageGallery from '../components/listings/ImageGallery.jsx';
import MapView from '../components/listings/MapView.jsx';
import ListingCard from '../components/listings/ListingCard.jsx';
import TourPackageCard from '../components/packages/TourPackageCard.jsx';
import ExperienceCard from '../components/experiences/ExperienceCard.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import {
  ArrowLeft,
  MapPin,
  Sparkles,
  Compass,
  Search,
  Home,
  CheckCircle2,
  Tag,
  Users,
  Layers,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

export default function DestinationDetailPage() {
  const { slug } = useParams();
  const [destination, setDestination] = useState(null);
  const [stays, setStays] = useState([]);
  const [tourPackages, setTourPackages] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [staysLoading, setStaysLoading] = useState(false);
  const [packagesLoading, setPackagesLoading] = useState(false);
  const [experiencesLoading, setExperiencesLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchDestinationData() {
      try {
        setLoading(true);
        setError(null);
        const data = await destinationsApi.getDestinationBySlug(slug);
        
        if (!data || !data.destination) {
          setError('Destination not found.');
          return;
        }

        const dest = data.destination;
        setDestination(dest);

        // 1. Fetch stays linked via relational destination ID
        try {
          setStaysLoading(true);
          const staysData = await listingsApi.getListings({ destination: dest._id, limit: 12 });
          if (staysData && Array.isArray(staysData.listings) && staysData.listings.length > 0) {
            setStays(staysData.listings);
          } else {
            const searchData = await searchApi.search({ q: dest.name, limit: 8 });
            setStays(searchData.results || []);
          }
        } catch (staysErr) {
          console.warn('Error fetching stays for destination:', staysErr);
          setStays([]);
        } finally {
          setStaysLoading(false);
        }

        // 2. Fetch tour packages curated for this destination
        try {
          setPackagesLoading(true);
          const pkgData = await tourPackagesApi.getTourPackages({ destination: dest.slug });
          setTourPackages(pkgData.tourPackages || []);
        } catch (pkgErr) {
          console.warn('Error fetching tour packages for destination:', pkgErr);
          setTourPackages([]);
        } finally {
          setPackagesLoading(false);
        }

        // 3. Fetch host-led experiences curated for this destination
        try {
          setExperiencesLoading(true);
          const expData = await experiencesApi.getExperiences({ destination: dest.slug });
          setExperiences(expData.experiences || []);
        } catch (expErr) {
          console.warn('Error fetching experiences for destination:', expErr);
          setExperiences([]);
        } finally {
          setExperiencesLoading(false);
        }

      } catch (err) {
        setError(err.response?.data?.error || err.message || 'Failed to load destination guide.');
      } finally {
        setLoading(false);
      }
    }

    fetchDestinationData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  // Loading State
  if (loading) {
    return <LoadingSpinner fullScreen={false} text="Curating destination guide..." />;
  }

  // 404 / Error State (Clean error boundary without crashing)
  if (error || !destination) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 sm:p-12 bg-white border border-zinc-200 rounded-3xl text-center space-y-4 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-red-50 text-[#dc3545] flex items-center justify-center mx-auto shadow-inner border border-red-100">
          <Compass className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-zinc-900">Destination Not Found</h2>
        <p className="text-sm text-zinc-600 max-w-md mx-auto leading-relaxed">
          {error || `We couldn't locate a destination for "${slug}". It may have been deactivated or renamed.`}
        </p>
        <div className="pt-2 flex items-center justify-center gap-3">
          <Link
            to="/destinations"
            className="inline-flex items-center gap-2 bg-[#dc3545] hover:bg-[#b02a37] text-white text-xs sm:text-sm font-bold py-2.5 px-6 rounded-full transition-all shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" /> Browse All Destinations
          </Link>
          <Link
            to="/"
            className="bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs sm:text-sm font-semibold py-2.5 px-5 rounded-full transition-colors"
          >
            Home
          </Link>
        </div>
      </div>
    );
  }

  // Build combined images array for ImageGallery
  const galleryImages = [];
  if (destination.heroImage?.url) {
    galleryImages.push(destination.heroImage);
  }
  if (Array.isArray(destination.galleryImages)) {
    destination.galleryImages.forEach((img) => {
      if (img && img.url) galleryImages.push(img);
    });
  }

  const locationLabel = destination.state
    ? `${destination.state}, ${destination.country || 'India'}`
    : destination.country || 'India';

  const mapGeometry = {
    type: 'Point',
    coordinates: [
      destination.coordinates?.lng || 77.2090,
      destination.coordinates?.lat || 28.6139,
    ],
  };

  const scrollToStays = (e) => {
    e.preventDefault();
    const element = document.getElementById('stays-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-12 pb-20">
      {/* 1. Breadcrumbs Navigation */}
      <nav className="flex items-center gap-2 text-xs text-zinc-500 pt-2">
        <Link to="/" className="hover:text-zinc-900 transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
        <Link to="/destinations" className="hover:text-zinc-900 transition-colors">
          Destinations
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
        <span className="font-semibold text-zinc-900 truncate max-w-[200px]">
          {destination.name}
        </span>
      </nav>

      {/* 2. Hero Header Showcase */}
      <div className="relative rounded-3xl overflow-hidden shadow-xl border border-zinc-900 bg-zinc-950 text-white min-h-[380px] sm:min-h-[460px] flex items-end">
        <img
          src={destination.heroImage?.url || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80'}
          alt={destination.name}
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/20" />

        <div className="relative z-10 p-8 sm:p-12 space-y-5 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-semibold text-white">
            <MapPin className="w-3.5 h-3.5 text-[#dc3545]" />
            {locationLabel}
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white drop-shadow-md">
            {destination.name}
          </h1>

          <p className="text-base sm:text-xl text-zinc-200 leading-relaxed font-light drop-shadow-xs">
            {destination.shortTagline || destination.tagline}
          </p>

          <div className="pt-3 flex flex-wrap items-center gap-3.5">
            <a
              href="#stays-section"
              onClick={scrollToStays}
              className="inline-flex items-center gap-2 bg-[#dc3545] hover:bg-[#b02a37] text-white text-xs sm:text-sm font-bold py-3 px-6 rounded-full transition-all shadow-md cursor-pointer"
            >
              <Home className="w-4 h-4" /> Explore Stays in {destination.name}
            </a>

            <Link
              to="/destinations"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 text-xs sm:text-sm font-semibold py-3 px-5 rounded-full transition-colors"
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
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-900">
              Photographic Preview
            </h2>
            <span className="text-xs font-medium text-zinc-500">
              {galleryImages.length} Curated {galleryImages.length === 1 ? 'Photo' : 'Photos'}
            </span>
          </div>
          <ImageGallery images={galleryImages} title={destination.name} />
        </div>
      )}

      {/* 4. Editorial Narrative & Explorer Insights (2-Column Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Full Editorial Description */}
        <div className="lg:col-span-2 bg-white border border-zinc-200/90 rounded-3xl p-8 sm:p-10 space-y-6 shadow-xs">
          <div className="flex items-center gap-2.5 pb-4 border-b border-zinc-100">
            <div className="w-9 h-9 rounded-full bg-red-50 text-[#dc3545] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-zinc-900">The Vistaro Guide to {destination.name}</h2>
              <p className="text-xs text-zinc-500">Curated editorial profile & regional character</p>
            </div>
          </div>

          <div className="prose prose-zinc max-w-none text-zinc-700 leading-relaxed text-sm sm:text-base whitespace-pre-line space-y-4">
            {destination.longDescription || destination.description || destination.shortTagline}
          </div>
        </div>

        {/* Right Column: Travel Tags & Persona Cards */}
        <div className="space-y-6">
          {/* Best For Card */}
          {destination.bestFor && destination.bestFor.length > 0 && (
            <div className="bg-white border border-zinc-200/90 rounded-3xl p-6 space-y-3.5 shadow-xs">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#dc3545]" />
                <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">
                  Recommended For
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {destination.bestFor.map((item, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-50/80 text-[#dc3545] text-xs font-semibold border border-red-100"
                  >
                    <CheckCircle2 className="w-3 h-3 text-[#dc3545]" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Identity & Vibe Tags */}
          {destination.identityTags && destination.identityTags.length > 0 && (
            <div className="bg-white border border-zinc-200/90 rounded-3xl p-6 space-y-3.5 shadow-xs">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-zinc-500" />
                <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">
                  Regional Vibe
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {destination.identityTags.map((item, idx) => (
                  <span
                    key={idx}
                    className="inline-block px-3 py-1.5 rounded-xl bg-zinc-100 text-zinc-700 text-xs font-medium border border-zinc-200/60"
                  >
                    #{item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Geography Summary Card */}
          <div className="bg-gradient-to-br from-zinc-50 to-zinc-100/60 border border-zinc-200/90 rounded-3xl p-6 space-y-3 shadow-xs">
            <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">
              Quick Facts
            </h3>
            <div className="space-y-2 text-xs text-zinc-600">
              <div className="flex justify-between py-1 border-b border-zinc-200/60">
                <span className="text-zinc-500">Region</span>
                <span className="font-semibold text-zinc-800">{destination.state || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-200/60">
                <span className="text-zinc-500">Country</span>
                <span className="font-semibold text-zinc-800">{destination.country || 'India'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-zinc-500">Coordinates</span>
                <span className="font-semibold text-zinc-800">
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
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-900">
              Regional Geography & Map
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
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
      <div id="packages-section" className="space-y-6 pt-4 border-t border-zinc-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 flex items-center gap-2">
              <Compass className="w-6 h-6 text-amber-600" /> Curated Tour Packages in {destination.name}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1">
              Multi-day guided itineraries, adventure expeditions, and cultural escapes crafted for {destination.name}.
            </p>
          </div>

          <Link
            to={`/tours?destination=${destination.slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#dc3545] hover:text-[#b02a37] transition-colors self-start sm:self-auto"
          >
            <span>View All Packages</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        {packagesLoading && (
          <div className="py-12 text-center text-zinc-400">
            <LoadingSpinner fullScreen={false} text={`Loading curated tour packages for ${destination.name}...`} />
          </div>
        )}

        {!packagesLoading && tourPackages.length === 0 && (
          <div className="text-center py-10 px-6 bg-amber-50/50 rounded-3xl border border-amber-200/60 space-y-2">
            <Compass className="w-8 h-8 text-amber-600 mx-auto" />
            <h3 className="text-sm font-bold text-zinc-800">
              New itineraries for {destination.name} are being prepared
            </h3>
            <p className="text-xs text-zinc-500 max-w-md mx-auto">
              Our travel specialists are finalizing new seasonal tour packages for {destination.name}.
            </p>
            <Link
              to="/tours"
              className="inline-block text-[#dc3545] hover:underline text-xs font-bold pt-1"
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

      {/* 7. Host-Led Experiences in Destination Section (Phase 3) */}
      <div id="experiences-section" className="space-y-6 pt-4 border-t border-zinc-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-600" /> Host-Led Experiences in {destination.name}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1">
              Immersive culinary walks, nature safaris, and artisan workshops led by local specialists in {destination.name}.
            </p>
          </div>

          <Link
            to={`/experiences?destination=${destination.slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 hover:text-purple-900 transition-colors self-start sm:self-auto"
          >
            <span>View All Experiences</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        {experiencesLoading && (
          <div className="py-12 text-center text-zinc-400">
            <LoadingSpinner fullScreen={false} text={`Loading curated experiences for ${destination.name}...`} />
          </div>
        )}

        {!experiencesLoading && experiences.length === 0 && (
          <div className="text-center py-10 px-6 bg-purple-50/50 rounded-3xl border border-purple-200/60 space-y-2">
            <Sparkles className="w-8 h-8 text-purple-600 mx-auto" />
            <h3 className="text-sm font-bold text-zinc-800">
              New experiences for {destination.name} are coming soon
            </h3>
            <p className="text-xs text-zinc-500 max-w-md mx-auto">
              Our local hosts are currently crafting authentic immersion activities in {destination.name}.
            </p>
            <Link
              to="/experiences"
              className="inline-block text-purple-700 hover:underline text-xs font-bold pt-1"
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
      <div id="stays-section" className="space-y-6 pt-4 border-t border-zinc-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 flex items-center gap-2">
              <Home className="w-6 h-6 text-[#dc3545]" /> Stays in {destination.name}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1">
              Hand-picked luxury villas, boutique homestays, and unique chalets located in and around {destination.name}.
            </p>
          </div>

          <Link
            to={`/search?q=${encodeURIComponent(destination.name)}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#dc3545] hover:text-[#b02a37] transition-colors self-start sm:self-auto"
          >
            <span>View All Search Results</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        {staysLoading && (
          <div className="py-12 text-center text-zinc-400">
            <LoadingSpinner fullScreen={false} text={`Searching available stays in ${destination.name}...`} />
          </div>
        )}

        {!staysLoading && stays.length === 0 && (
          <div className="text-center py-12 px-6 bg-zinc-50 rounded-3xl border border-zinc-200 space-y-3">
            <Home className="w-10 h-10 text-zinc-400 mx-auto" />
            <h3 className="text-base font-bold text-zinc-800">
              No directly matching properties listed in {destination.name} yet
            </h3>
            <p className="text-xs text-zinc-500 max-w-md mx-auto">
              We are currently onboarding exclusive private stays in {destination.name}. Explore all active Vistaro stays across other regions.
            </p>
            <Link
              to="/"
              className="inline-block bg-[#dc3545] hover:bg-[#b02a37] text-white text-xs font-bold py-2.5 px-6 rounded-full transition-colors mt-2"
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
