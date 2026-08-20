import React from 'react';
import { Star } from 'lucide-react';

export default function StarRating({ rating = 5, maxStars = 5, size = 'sm', interactive = false, onChange }) {
  const [hoverRating, setHoverRating] = React.useState(0);

  const starSizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const currentSize = starSizes[size] || starSizes.sm;

  return (
    <div className="inline-flex items-center gap-0.5">
      {Array.from({ length: maxStars }).map((_, index) => {
        const starValue = index + 1;
        const isFilled = (hoverRating || rating) >= starValue;

        return (
          <button
            key={index}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange && onChange(starValue)}
            onMouseEnter={() => interactive && setHoverRating(starValue)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'} p-0.5 border-none bg-transparent flex items-center justify-center`}
          >
            <Star
              className={`${currentSize} ${
                isFilled
                  ? 'fill-[#222222] text-[#222222]'
                  : 'fill-transparent text-zinc-300'
              } transition-colors`}
            />
          </button>
        );
      })}
    </div>
  );
}
