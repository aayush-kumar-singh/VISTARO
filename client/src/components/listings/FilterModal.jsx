import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';

const AMENITY_OPTIONS = [
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

export default function FilterModal({
  isOpen,
  onClose,
  initialFilters = {},
  onApplyFilters,
}) {
  const [minPrice, setMinPrice] = useState(initialFilters.minPrice || '');
  const [maxPrice, setMaxPrice] = useState(initialFilters.maxPrice || '');
  const [guests, setGuests] = useState(initialFilters.guests || '');
  const [checkIn, setCheckIn] = useState(initialFilters.checkIn || '');
  const [checkOut, setCheckOut] = useState(initialFilters.checkOut || '');
  const [selectedAmenities, setSelectedAmenities] = useState(
    initialFilters.selectedAmenities || []
  );

  useEffect(() => {
    if (isOpen) {
      setMinPrice(initialFilters.minPrice || '');
      setMaxPrice(initialFilters.maxPrice || '');
      setGuests(initialFilters.guests || '');
      setCheckIn(initialFilters.checkIn || '');
      setCheckOut(initialFilters.checkOut || '');
      setSelectedAmenities(initialFilters.selectedAmenities || []);
    }
  }, [isOpen, initialFilters]);

  if (!isOpen) return null;

  const toggleAmenity = (amenity) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity]
    );
  };

  const handleReset = () => {
    setMinPrice('');
    setMaxPrice('');
    setGuests('');
    setCheckIn('');
    setCheckOut('');
    setSelectedAmenities([]);
  };

  const handleApply = () => {
    onApplyFilters({
      minPrice,
      maxPrice,
      guests,
      checkIn,
      checkOut,
      selectedAmenities,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-vistaro-surface rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-vistaro-border transition-colors duration-200">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-vistaro-border">
          <h2 className="text-lg font-bold text-vistaro-primary">Filters</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-vistaro-secondary text-vistaro-muted hover:text-vistaro-primary transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-vistaro-primary">

          {/* Price Range */}
          <div>
            <h3 className="text-sm font-bold text-vistaro-primary mb-3">Price range (per night)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-vistaro-muted mb-1">Minimum (₹)</label>
                <input
                  type="number"
                  placeholder="Min price"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full bg-vistaro-secondary border border-vistaro-border text-vistaro-primary rounded-xl px-3.5 py-2.5 text-sm focus:outline-hidden focus:border-vistaro-accent"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-vistaro-muted mb-1">Maximum (₹)</label>
                <input
                  type="number"
                  placeholder="Max price"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full bg-vistaro-secondary border border-vistaro-border text-vistaro-primary rounded-xl px-3.5 py-2.5 text-sm focus:outline-hidden focus:border-vistaro-accent"
                />
              </div>
            </div>
          </div>

          <hr className="border-vistaro-border" />

          {/* Guests */}
          <div>
            <h3 className="text-sm font-bold text-vistaro-primary mb-3">Guest capacity</h3>
            <div className="flex flex-wrap gap-2">
              {['', '1', '2', '3', '4', '5', '6+'].map((g) => {
                const isSelected = (g === '6+' ? '6' : g) === guests;
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGuests(g === '6+' ? '6' : g)}
                    className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all cursor-pointer ${isSelected
                        ? 'bg-vistaro-accent text-white border-vistaro-accent'
                        : 'border-vistaro-border text-vistaro-secondary hover:border-vistaro-muted bg-vistaro-surface hover:bg-vistaro-secondary'
                      }`}
                  >
                    {g === '' ? 'Any' : `${g} guest${g === '1' ? '' : 's'}`}
                  </button>
                );
              })}
            </div>
          </div>

          <hr className="border-vistaro-border" />

          {/* Dates */}
          <div>
            <h3 className="text-sm font-bold text-vistaro-primary mb-3">Stay Dates</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-vistaro-muted mb-1">Check-in</label>
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full bg-vistaro-secondary border border-vistaro-border text-vistaro-primary rounded-xl px-3.5 py-2 text-sm focus:outline-hidden focus:border-vistaro-accent cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-vistaro-muted mb-1">Check-out</label>
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full bg-vistaro-secondary border border-vistaro-border text-vistaro-primary rounded-xl px-3.5 py-2 text-sm focus:outline-hidden focus:border-vistaro-accent cursor-pointer"
                />
              </div>
            </div>
          </div>

          <hr className="border-vistaro-border" />

          {/* Amenities */}
          <div>
            <h3 className="text-sm font-bold text-vistaro-primary mb-3">Amenities</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {AMENITY_OPTIONS.map((amenity) => {
                const isChecked = selectedAmenities.includes(amenity);
                return (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => toggleAmenity(amenity)}
                    className={`flex items-center justify-between p-3 rounded-xl border text-xs font-medium text-left transition-all cursor-pointer ${isChecked
                        ? 'border-vistaro-accent bg-vistaro-secondary text-vistaro-accent font-semibold'
                        : 'border-vistaro-border text-vistaro-secondary hover:border-vistaro-muted bg-vistaro-surface hover:bg-vistaro-secondary'
                      }`}
                  >
                    <span>{amenity}</span>
                    <div
                      className={`w-4 h-4 rounded-md flex items-center justify-center border transition-colors ${isChecked
                          ? 'bg-vistaro-accent border-vistaro-accent text-white'
                          : 'border-vistaro-border'
                        }`}
                    >
                      {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-5 border-t border-vistaro-border bg-vistaro-secondary">
          <button
            type="button"
            onClick={handleReset}
            className="text-xs font-semibold text-vistaro-secondary hover:underline hover:text-vistaro-primary cursor-pointer"
          >
            Clear all
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="bg-vistaro-accent hover:bg-vistaro-accent-hover text-white text-xs font-bold py-2.5 px-6 rounded-full transition-colors shadow-xs cursor-pointer"
          >
            Show results
          </button>
        </div>

      </div>
    </div>
  );
}
