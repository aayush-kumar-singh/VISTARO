import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Lightbox({
  images = [],
  currentIndex = 0,
  isOpen = false,
  onClose,
  onPrev,
  onNext,
}) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onPrev, onNext]);

  if (!isOpen || images.length === 0) return null;

  const currentImg = images[currentIndex] || images[0];

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-fade-in select-none">
      
      {/* Top Bar with Counter & Close */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-50 text-white">
        <span className="text-caption text-vistaro-muted">
          {currentIndex + 1} / {images.length}
        </span>
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          aria-label="Close lightbox"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Main Image */}
      <div className="relative max-w-5xl max-h-[80vh] w-full flex items-center justify-center">
        <img
          src={currentImg.url}
          alt={`Photo ${currentIndex + 1}`}
          className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl"
        />

        {/* Previous Button */}
        {images.length > 1 && (
          <button
            onClick={onPrev}
            className="absolute left-2 sm:-left-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
            aria-label="Previous photo"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Next Button */}
        {images.length > 1 && (
          <button
            onClick={onNext}
            className="absolute right-2 sm:-right-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
            aria-label="Next photo"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Thumbnail Bar */}
      {images.length > 1 && (
        <div className="absolute bottom-4 flex items-center gap-2 overflow-x-auto max-w-md px-4 py-2 bg-black/60 backdrop-blur-md rounded-full border border-white/10">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => onNext(idx)}
              className={`w-10 h-10 rounded-lg overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                currentIndex === idx
                  ? 'border-vistaro-accent scale-105 opacity-100'
                  : 'border-transparent opacity-50 hover:opacity-80'
              }`}
            >
              <img src={img.url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

    </div>
  );
}
