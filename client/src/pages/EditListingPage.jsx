import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { listingsApi } from '../api/listingsApi.js';
import { destinationsApi } from '../api/destinationsApi.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
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

export default function EditListingPage() {
  const { id } = useParams();
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
  const [amenities, setAmenities] = useState([]);

  const [existingImages, setExistingImages] = useState([]);
  const [deleteImages, setDeleteImages] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [listingData, destsData] = await Promise.all([
          listingsApi.getListingById(id),
          destinationsApi.getDestinations().catch(() => ({ destinations: [] }))
        ]);

        setDestinationsList(destsData.destinations || []);
        const l = listingData.listing;

        // Check ownership
        const ownerId = typeof l.owner === 'object' ? l.owner._id : l.owner;
        if (user && ownerId !== user._id && user.role !== 'admin') {
          showError('You do not have permission to edit this listing.');
          navigate(`/listings/${id}`);
          return;
        }

        setTitle(l.title || '');
        setDescription(l.description || '');
        setCategory(l.category || 'Trending');
        setDestination(l.destination?._id || l.destination || '');
        setPrice(l.price?.toString() || '');
        setMaxGuests(l.maxGuests?.toString() || '4');
        setCancellationPolicy(l.cancellationPolicy || 'flexible');
        setLocation(l.location || '');
        setCountry(l.country || '');
        setAmenities(l.amenities || []);
        setExistingImages(l.images || (l.image?.url ? [l.image] : []));
      } catch (err) {
        showError(err.message);
        navigate('/');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id, user]);

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading listing editor..." />;
  }

  const handleNewFileChange = (e) => {
    const files = Array.from(e.target.files);
    const activeExisting = existingImages.filter((img) => !deleteImages.includes(img.filename));
    const totalCount = activeExisting.length + newFiles.length + files.length;

    if (totalCount > 5) {
      showError('You can have a maximum of 5 photos per listing.');
      return;
    }

    const combined = [...newFiles, ...files];
    setNewFiles(combined);
    setNewPreviews(combined.map((f) => URL.createObjectURL(f)));
  };

  const removeExistingPhoto = (filename) => {
    setDeleteImages((prev) => [...prev, filename]);
  };

  const undoRemoveExistingPhoto = (filename) => {
    setDeleteImages((prev) => prev.filter((fn) => fn !== filename));
  };

  const removeNewFile = (idx) => {
    const updated = newFiles.filter((_, i) => i !== idx);
    setNewFiles(updated);
    setNewPreviews(updated.map((f) => URL.createObjectURL(f)));
  };

  const toggleAmenity = (item) => {
    setAmenities((prev) =>
      prev.includes(item) ? prev.filter((a) => a !== item) : [...prev, item]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const activeExisting = existingImages.filter((img) => !deleteImages.includes(img.filename));
    if (activeExisting.length + newFiles.length === 0) {
      showError('Listing must have at least one photo.');
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();

      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('category', category);
      formData.append('destination', destination || '');
      formData.append('price', price);
      formData.append('maxGuests', maxGuests);
      formData.append('cancellationPolicy', cancellationPolicy);
      formData.append('location', location.trim());
      formData.append('country', country.trim());
      formData.append('amenities', JSON.stringify(amenities));

      if (deleteImages.length > 0) {
        formData.append('deleteImages', JSON.stringify(deleteImages));
      }

      newFiles.forEach((file) => {
        formData.append('images', file);
      });

      await listingsApi.updateListing(id, formData);
      showSuccess('Listing updated successfully!');
      navigate(`/listings/${id}`);
    } catch (err) {
      showError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-4 text-vistaro-primary transition-colors duration-200">

      <Link
        to={`/listings/${id}`}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-vistaro-muted hover:text-vistaro-primary mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Cancel & Back to Listing
      </Link>

      <div className="bg-vistaro-surface rounded-3xl p-6 sm:p-10 border border-vistaro-border shadow-sm">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-vistaro-primary mb-2 tracking-tight">
          Edit your listing
        </h1>
        <p className="text-sm text-vistaro-muted mb-8">
          Update property photos, pricing, amenities, or stay description.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-vistaro-primary mb-1.5">
              Listing Title *
            </label>
            <input
              type="text"
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
                <option value="flexible">Flexible (100% refund up to 48 hrs)</option>
                <option value="moderate">Moderate (100% up to 5 days, 50% up to 48 hrs)</option>
                <option value="strict">Strict (50% refund up to 7 days)</option>
              </select>
            </div>
          </div>

          {/* Existing Photos Gallery */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-vistaro-primary mb-1.5">
              Current Photos
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {existingImages.map((img, idx) => {
                const isMarkedForDelete = deleteImages.includes(img.filename);

                return (
                  <div
                    key={idx}
                    className={`relative aspect-square rounded-2xl overflow-hidden border transition-all shadow-xs ${isMarkedForDelete ? 'opacity-30 border-vistaro-error scale-95' : 'border-vistaro-border'
                      }`}
                  >
                    <img src={img.url} alt="Photo" className="w-full h-full object-cover" />
                    {isMarkedForDelete ? (
                      <button
                        type="button"
                        onClick={() => undoRemoveExistingPhoto(img.filename)}
                        className="absolute inset-0 m-auto w-8 h-8 bg-vistaro-error text-white rounded-full flex items-center justify-center font-bold text-xs shadow-md"
                        title="Undo deletion"
                      >
                        Undo
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => removeExistingPhoto(img.filename)}
                        className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-vistaro-error text-white rounded-full transition-colors cursor-pointer"
                        title="Remove photo"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upload Additional Photos */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-vistaro-primary mb-1.5">
              Add New Photos
            </label>
            <div className="border-2 border-dashed border-vistaro-border hover:border-vistaro-accent rounded-3xl p-6 text-center bg-vistaro-secondary/60 transition-colors">
              <UploadCloud className="w-8 h-8 text-vistaro-muted mx-auto mb-1.5" />
              <p className="text-xs font-semibold text-vistaro-primary">Add up to 5 total photos</p>
              <label className="inline-block mt-3 bg-vistaro-surface border border-vistaro-border hover:bg-vistaro-secondary font-bold text-xs py-1.5 px-4 rounded-full cursor-pointer shadow-xs text-vistaro-primary transition-colors">
                <span>Browse Files</span>
                <input
                  type="file"
                  multiple
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={handleNewFileChange}
                  className="hidden"
                />
              </label>
            </div>

            {newPreviews.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-3">
                {newPreviews.map((src, idx) => (
                  <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-vistaro-success shadow-xs">
                    <img src={src} alt="New Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeNewFile(idx)}
                      className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-black text-white rounded-full"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <span className="absolute bottom-1 left-1 bg-vistaro-success text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                      New
                    </span>
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
          <div className="pt-4 border-t border-vistaro-border flex justify-end gap-3">
            <Link
              to={`/listings/${id}`}
              className="bg-vistaro-surface border border-vistaro-border hover:bg-vistaro-secondary text-vistaro-primary text-sm font-semibold py-3 px-6 rounded-full transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-vistaro-accent hover:bg-vistaro-accent-hover text-white text-sm font-bold py-3 px-8 rounded-full transition-all shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}
