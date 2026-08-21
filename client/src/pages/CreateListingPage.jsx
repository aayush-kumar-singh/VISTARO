import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { listingsApi } from '../api/listingsApi.js';
import { destinationsApi } from '../api/destinationsApi.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { UploadCloud, X, ArrowLeft, Check } from 'lucide-react';

const CATEGORIES = [
  'Beach',
  'Farm',
  'OMG',
  'Arctic',
  'Trending',
  'Lake',
  'Bed & Breakfast',
];

const AMENITIES_LIST = [
  'Wifi',
  'Air Conditioning',
  'Pool',
  'Free Parking',
  'Kitchen',
  'TV',
  'Pet Friendly',
  'Dedicated Workspace',
  'Gym',
  'BBQ Grill',
];

export default function CreateListingPage() {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Trending');
  const [destination, setDestination] = useState('');
  const [destinationsList, setDestinationsList] = useState([]);
  const [price, setPrice] = useState('');
  const [maxGuests, setMaxGuests] = useState('4');
  const [cancellationPolicy, setCancellationPolicy] = useState('flexible');
  const [location, setLocation] = useState('');
  const [country, setCountry] = useState('');
  const [amenities, setAmenities] = useState(['Wifi']);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadDestinations() {
      try {
        const data = await destinationsApi.getDestinations();
        setDestinationsList(data.destinations || []);
      } catch (err) {
        console.warn('Could not load destinations list:', err);
      }
    }
    loadDestinations();
  }, []);

  // Require login
  if (!user) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-vistaro-surface border border-vistaro-border rounded-3xl text-center space-y-4 shadow-sm text-vistaro-primary">
        <h2 className="text-xl font-bold text-vistaro-primary">Sign in to list your stay</h2>
        <p className="text-sm text-vistaro-muted">You need to be logged into your Vistaro account to create and manage listings.</p>
        <Link
          to="/login"
          className="inline-block bg-vistaro-accent hover:bg-vistaro-accent-hover text-white text-sm font-bold py-3 px-6 rounded-full transition-colors cursor-pointer"
        >
          Log In
        </Link>
      </div>
    );
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + selectedFiles.length > 5) {
      showError('You can upload a maximum of 5 photos per listing.');
      return;
    }

    const combined = [...selectedFiles, ...files].slice(0, 5);
    setSelectedFiles(combined);

    const newPreviews = combined.map((file) => URL.createObjectURL(file));
    setPreviews(newPreviews);
  };

  const removeSelectedFile = (idx) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== idx);
    setSelectedFiles(updatedFiles);
    const updatedPreviews = updatedFiles.map((file) => URL.createObjectURL(file));
    setPreviews(updatedPreviews);
  };

  const toggleAmenity = (item) => {
    setAmenities((prev) =>
      prev.includes(item) ? prev.filter((a) => a !== item) : [...prev, item]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedFiles.length === 0) {
      showError('Please upload at least one photo for your property.');
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();

      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('category', category);
      formData.append('destination', destination);
      formData.append('price', price);
      formData.append('maxGuests', maxGuests);
      formData.append('cancellationPolicy', cancellationPolicy);
      formData.append('location', location.trim());
      formData.append('country', country.trim());
      formData.append('amenities', JSON.stringify(amenities));

      selectedFiles.forEach((file) => {
        formData.append('images', file);
      });

      const data = await listingsApi.createListing(formData);
      showSuccess('Property listed successfully!');
      navigate(`/listings/${data.listing._id}`);
    } catch (err) {
      showError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-4 text-vistaro-primary transition-colors duration-200">

      {/* Back button */}
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-vistaro-muted hover:text-vistaro-primary mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Cancel & Back to Explore
      </Link>

      <div className="bg-vistaro-surface rounded-3xl p-6 sm:p-10 border border-vistaro-border shadow-sm">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-vistaro-primary mb-2 tracking-tight">
          List your space on Vistaro
        </h1>
        <p className="text-sm text-vistaro-muted mb-8">
          Fill in details about your home to publish your listing to travellers worldwide.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-vistaro-primary mb-1.5">
              Listing Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Luxury Beachfront Villa with Private Infinity Pool"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-vistaro-secondary border border-vistaro-border text-vistaro-primary rounded-2xl px-4 py-3 text-sm focus:outline-hidden focus:bg-vistaro-surface focus:border-vistaro-accent transition-colors"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-vistaro-primary mb-1.5">
              Description *
            </label>
            <textarea
              rows={4}
              placeholder="Describe your space, amenities, ambiance, and what makes it special..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-vistaro-secondary border border-vistaro-border text-vistaro-primary rounded-2xl px-4 py-3 text-sm focus:outline-hidden focus:bg-vistaro-surface focus:border-vistaro-accent transition-colors"
              required
            />
          </div>

          {/* Category, Destination & Price */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-vistaro-primary mb-1.5">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-vistaro-secondary border border-vistaro-border text-vistaro-primary rounded-2xl px-4 py-3 text-sm focus:outline-hidden focus:bg-vistaro-surface focus:border-vistaro-accent cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-vistaro-primary mb-1.5">
                Destination (Optional)
              </label>
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full bg-vistaro-secondary border border-vistaro-border text-vistaro-primary rounded-2xl px-4 py-3 text-sm focus:outline-hidden focus:bg-vistaro-surface focus:border-vistaro-accent cursor-pointer"
              >
                <option value="">None / Other</option>
                {destinationsList.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name} {d.state ? `(${d.state})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-vistaro-primary mb-1.5">
                Price per night (₹ INR) *
              </label>
              <input
                type="number"
                min="0"
                placeholder="e.g. 2500"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-vistaro-secondary border border-vistaro-border text-vistaro-primary rounded-2xl px-4 py-3 text-sm focus:outline-hidden focus:bg-vistaro-surface focus:border-vistaro-accent transition-colors"
                required
              />
            </div>
          </div>

          {/* Location & Country */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-vistaro-primary mb-1.5">
                City / Location *
              </label>
              <input
                type="text"
                placeholder="e.g. Candolim, Goa"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-vistaro-secondary border border-vistaro-border text-vistaro-primary rounded-2xl px-4 py-3 text-sm focus:outline-hidden focus:bg-vistaro-surface focus:border-vistaro-accent transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-vistaro-primary mb-1.5">
                Country *
              </label>
              <input
                type="text"
                placeholder="e.g. India"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full bg-vistaro-secondary border border-vistaro-border text-vistaro-primary rounded-2xl px-4 py-3 text-sm focus:outline-hidden focus:bg-vistaro-surface focus:border-vistaro-accent transition-colors"
                required
              />
            </div>
          </div>

          {/* Max Guests & Cancellation Policy */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-vistaro-primary mb-1.5">
                Max Guests
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={maxGuests}
                onChange={(e) => setMaxGuests(e.target.value)}
                className="w-full bg-vistaro-secondary border border-vistaro-border text-vistaro-primary rounded-2xl px-4 py-3 text-sm focus:outline-hidden focus:bg-vistaro-surface focus:border-vistaro-accent transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-vistaro-primary mb-1.5">
                Cancellation Policy
              </label>
              <select
                value={cancellationPolicy}
                onChange={(e) => setCancellationPolicy(e.target.value)}
                className="w-full bg-vistaro-secondary border border-vistaro-border text-vistaro-primary rounded-2xl px-4 py-3 text-sm focus:outline-hidden focus:bg-vistaro-surface focus:border-vistaro-accent cursor-pointer"
              >
                <option value="flexible">Flexible (100% refund up to 48 hrs before check-in)</option>
                <option value="moderate">Moderate (100% up to 5 days, 50% up to 48 hrs)</option>
                <option value="strict">Strict (50% refund up to 7 days before check-in)</option>
              </select>
            </div>
          </div>

          {/* Photos Upload */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-vistaro-primary mb-1.5">
              Property Photos (Up to 5) *
            </label>

            {/* Dropzone */}
            <div className="border-2 border-dashed border-vistaro-border hover:border-vistaro-accent rounded-3xl p-6 text-center bg-vistaro-secondary/60 transition-colors">
              <UploadCloud className="w-10 h-10 text-vistaro-muted mx-auto mb-2" />
              <p className="text-sm font-semibold text-vistaro-primary">Drag & drop photos here, or browse files</p>
              <p className="text-xs text-vistaro-muted mt-0.5">JPEG, PNG, WebP (Max 5MB each, up to 5 photos)</p>

              <label className="inline-block mt-4 bg-vistaro-surface border border-vistaro-border hover:bg-vistaro-secondary font-bold text-xs py-2 px-4 rounded-full cursor-pointer shadow-xs text-vistaro-primary transition-colors">
                <span>Select Photos</span>
                <input
                  type="file"
                  multiple
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            {/* Previews */}
            {previews.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4">
                {previews.map((src, idx) => (
                  <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-vistaro-border group shadow-xs">
                    <img src={src} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeSelectedFile(idx)}
                      className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-black text-white rounded-full transition-colors cursor-pointer"
                      aria-label="Remove photo"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    {idx === 0 && (
                      <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                        Cover
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Amenities */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-vistaro-primary mb-2">
              Select Amenities
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {AMENITIES_LIST.map((item) => {
                const isChecked = amenities.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleAmenity(item)}
                    className={`flex items-center justify-between p-3 rounded-2xl border text-xs font-medium transition-all cursor-pointer ${isChecked
                        ? 'border-vistaro-accent bg-vistaro-secondary text-vistaro-accent font-semibold'
                        : 'border-vistaro-border text-vistaro-secondary hover:border-vistaro-muted bg-vistaro-surface'
                      }`}
                  >
                    <span>{item}</span>
                    <div
                      className={`w-4 h-4 rounded-md flex items-center justify-center border ${isChecked ? 'bg-vistaro-accent border-vistaro-accent text-white' : 'border-vistaro-border'
                        }`}
                    >
                      {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-vistaro-border flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-vistaro-accent hover:bg-vistaro-accent-hover text-white text-sm font-bold py-3 px-8 rounded-full transition-all shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'Creating Listing...' : 'Publish Listing'}
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}
