import React, { useState } from 'react';
import Lightbox from './Lightbox.jsx';
import { Grid, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ImageGallery({ images = [], title = 'Listing' }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [mobileSlide, setMobileSlide] = useState(0);

  const displayImages = images.length > 0 ? images : [{ url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=60' }];

  const openLightbox = (index) => {
    setPhotoIndex(index);
    setLightboxOpen(true);
  };

  return (
    <div className="relative w-full mb-6">
      {/* 1. Desktop & Tablet Grid Layout (>= 768px) */}
      <div className="hidden md:block rounded-3xl overflow-hidden shadow-xs">
        {displayImages.length === 1 ? (
          <div
            onClick={() => openLightbox(0)}
            className="w-full h-[360px] md:h-[400px] cursor-pointer overflow-hidden group bg-zinc-100"
          >
            <img
              src={displayImages[0].url}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
            />
          </div>
        ) : (
          <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[380px] md:h-[410px]">
            {/* Primary large image (takes 2x2) */}
            <div
              onClick={() => openLightbox(0)}
              className="col-span-2 row-span-2 relative cursor-pointer overflow-hidden group"
            >
              <img
                src={displayImages[0].url}
                alt={`${title} 1`}
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
              />
            </div>

            {/* Sub-images (up to 4) */}
            {displayImages.slice(1, 5).map((img, idx) => {
              const actualIdx = idx + 1;
              const isLast = idx === 3 || actualIdx === displayImages.length - 1;

              return (
                <div
                  key={idx}
                  onClick={() => openLightbox(actualIdx)}
                  className="relative cursor-pointer overflow-hidden group h-[216px]"
                >
                  <img
                    src={img.url}
                    alt={`${title} ${actualIdx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                  />
                  {isLast && displayImages.length > 5 && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white font-bold text-lg backdrop-blur-xs">
                      +{displayImages.length - 5} more
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* View All Photos button */}
        {displayImages.length > 1 && (
          <button
            type="button"
            onClick={() => openLightbox(0)}
            className="absolute bottom-4 right-4 z-10 bg-white/95 backdrop-blur-xs hover:bg-white text-[#222222] font-semibold text-xs py-2 px-3.5 rounded-xl shadow-md border border-zinc-200 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Grid className="w-3.5 h-3.5 text-zinc-700" />
            <span>Show all {displayImages.length} photos</span>
          </button>
        )}
      </div>

      {/* 2. Mobile Carousel (< 768px) */}
      <div className="md:hidden relative aspect-4/3 rounded-2xl overflow-hidden shadow-xs bg-zinc-100">
        <img
          src={displayImages[mobileSlide]?.url}
          alt={title}
          onClick={() => openLightbox(mobileSlide)}
          className="w-full h-full object-cover cursor-zoom-in"
        />

        {displayImages.length > 1 && (
          <>
            <button
              onClick={() => setMobileSlide((prev) => (prev > 0 ? prev - 1 : displayImages.length - 1))}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 text-zinc-900 shadow-sm"
              aria-label="Previous photo"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMobileSlide((prev) => (prev < displayImages.length - 1 ? prev + 1 : 0))}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 text-zinc-900 shadow-sm"
              aria-label="Next photo"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/40 px-3 py-1 rounded-full backdrop-blur-xs">
              {displayImages.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    mobileSlide === idx ? 'bg-white scale-125' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Lightbox component */}
      <Lightbox
        images={displayImages}
        currentIndex={photoIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onPrev={() => setPhotoIndex((prev) => (prev > 0 ? prev - 1 : displayImages.length - 1))}
        onNext={(specificIndex) => {
          if (typeof specificIndex === 'number') {
            setPhotoIndex(specificIndex);
          } else {
            setPhotoIndex((prev) => (prev < displayImages.length - 1 ? prev + 1 : 0));
          }
        }}
      />
    </div>
  );
}
