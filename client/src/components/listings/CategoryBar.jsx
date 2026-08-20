import React, { useState, useRef, useEffect } from 'react';
import {
  Compass,
  Flame,
  Palmtree,
  Sprout,
  Sparkles,
  Snowflake,
  Sailboat,
  Coffee,
  SlidersHorizontal,
  ArrowUpDown,
  ChevronDown,
} from 'lucide-react';

const CATEGORIES = [
  { name: 'All', icon: Compass },
  { name: 'Trending', icon: Flame },
  { name: 'Beach', icon: Palmtree },
  { name: 'Farm', icon: Sprout },
  { name: 'OMG', icon: Sparkles },
  { name: 'Arctic', icon: Snowflake },
  { name: 'Lake', icon: Sailboat },
  { name: 'Bed & Breakfast', icon: Coffee },
];

export default function CategoryBar({
  selectedCategory = 'All',
  onSelectCategory,
  onOpenFilterModal,
  activeFilterCount = 0,
  sortOption = '',
  onSortChange,
}) {
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (sortRef.current && !sortRef.current.contains(e.target)) {
        setIsSortOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const sortLabels = {
    '': 'Featured',
    'price_asc': 'Price: Low to High',
    'price_desc': 'Price: High to Low',
    'newest': 'Newest First',
  };

  return (
    <div className="w-full flex items-center justify-between gap-4 py-3 mb-6 border-b border-zinc-100">
      
      {/* Category Icons Strip - Evenly Spread */}
      <div className="flex items-center justify-start sm:justify-evenly gap-4 overflow-x-auto no-scrollbar flex-1 py-1 px-1">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.name;

          return (
            <button
              key={cat.name}
              type="button"
              onClick={() => onSelectCategory(cat.name)}
              className={`flex flex-col items-center gap-1.5 pb-2 shrink-0 border-b-2 transition-all cursor-pointer group ${
                isSelected
                  ? 'border-[#222222] text-[#222222] opacity-100 font-semibold'
                  : 'border-transparent text-[#717171] hover:text-[#222222] hover:border-zinc-300 opacity-80 hover:opacity-100 font-medium'
              }`}
            >
              <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isSelected ? 'stroke-[2.2]' : 'stroke-[1.8]'}`} />
              <span className="text-xs tracking-tight whitespace-nowrap">{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Action Controls (Filters & Sort) */}
      <div className="flex items-center gap-2 shrink-0">
        
        {/* Filters Button */}
        {onOpenFilterModal && (
          <button
            type="button"
            onClick={onOpenFilterModal}
            className="flex items-center gap-2 border border-[#DDDDDD] hover:border-zinc-400 rounded-full px-3.5 py-2 text-xs font-semibold text-zinc-800 hover:shadow-xs transition-all cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-600" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#dc3545] text-white text-[10px] flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
        )}

        {/* Sort Dropdown */}
        {onSortChange && (
          <div className="relative" ref={sortRef}>
            <button
              type="button"
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="flex items-center gap-1.5 border border-[#DDDDDD] hover:border-zinc-400 rounded-full px-3.5 py-2 text-xs font-semibold text-zinc-800 hover:shadow-xs transition-all cursor-pointer"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-zinc-600" />
              <span>{sortLabels[sortOption] || 'Sort By'}</span>
              <ChevronDown className="w-3 h-3 text-zinc-500" />
            </button>

            {isSortOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-zinc-200 py-2 z-50 animate-fade-in divide-y divide-zinc-100">
                <button
                  type="button"
                  onClick={() => {
                    onSortChange('');
                    setIsSortOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-xs hover:bg-zinc-100 transition-colors ${
                    sortOption === '' ? 'font-bold text-[#dc3545] bg-red-50/50' : 'text-zinc-700'
                  }`}
                >
                  Featured
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSortChange('price_asc');
                    setIsSortOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-xs hover:bg-zinc-100 transition-colors ${
                    sortOption === 'price_asc' ? 'font-bold text-[#dc3545] bg-red-50/50' : 'text-zinc-700'
                  }`}
                >
                  Price: Low to High
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSortChange('price_desc');
                    setIsSortOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-xs hover:bg-zinc-100 transition-colors ${
                    sortOption === 'price_desc' ? 'font-bold text-[#dc3545] bg-red-50/50' : 'text-zinc-700'
                  }`}
                >
                  Price: High to Low
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSortChange('newest');
                    setIsSortOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-xs hover:bg-zinc-100 transition-colors ${
                    sortOption === 'newest' ? 'font-bold text-[#dc3545] bg-red-50/50' : 'text-zinc-700'
                  }`}
                >
                  Newest First
                </button>
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
}
