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
  Check,
} from 'lucide-react';

const CATEGORIES = [
  { name: 'All', icon: Compass, description: 'All stays' },
  { name: 'Trending', icon: Flame, description: 'Most popular' },
  { name: 'Beach', icon: Palmtree, description: 'Coastal & ocean' },
  { name: 'Farm', icon: Sprout, description: 'Countryside & farms' },
  { name: 'OMG', icon: Sparkles, description: 'Iconic architecture' },
  { name: 'Arctic', icon: Snowflake, description: 'Snow & glaciers' },
  { name: 'Lake', icon: Sailboat, description: 'Waterfront cabins' },
  { name: 'Bed & Breakfast', icon: Coffee, description: 'Cosy morning stays' },
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
  const [isMobileCategoryOpen, setIsMobileCategoryOpen] = useState(false);

  const sortRef = useRef(null);
  const mobileCatRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (sortRef.current && !sortRef.current.contains(e.target)) {
        setIsSortOpen(false);
      }
      if (mobileCatRef.current && !mobileCatRef.current.contains(e.target)) {
        setIsMobileCategoryOpen(false);
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

  const currentCategoryObj =
    CATEGORIES.find((c) => c.name === selectedCategory) || CATEGORIES[0];
  const CurrentCategoryIcon = currentCategoryObj.icon;

  return (
    <div className="w-full flex items-center justify-between gap-3 py-3 mb-6 border-b border-zinc-100">
      
      {/* ======================================================== */}
      {/* 1. MOBILE/SMALL SCREENS: Unique Corner Category Dropdown */}
      {/* ======================================================== */}
      <div className="relative md:hidden" ref={mobileCatRef}>
        <button
          type="button"
          onClick={() => setIsMobileCategoryOpen(!isMobileCategoryOpen)}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-full border text-xs font-bold transition-all shadow-xs cursor-pointer ${
            isMobileCategoryOpen || selectedCategory !== 'All'
              ? 'bg-zinc-900 text-white border-zinc-900 shadow-sm'
              : 'bg-white text-zinc-800 border-[#DDDDDD] hover:border-zinc-400'
          }`}
        >
          <CurrentCategoryIcon className={`w-4 h-4 ${selectedCategory !== 'All' ? 'text-[#dc3545]' : 'text-zinc-500'}`} />
          <span>{selectedCategory}</span>
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-200 ${
              isMobileCategoryOpen ? 'rotate-180 text-zinc-300' : 'text-zinc-500'
            }`}
          />
        </button>

        {/* Unique Corner Floating Sheet / Dropdown Menu */}
        {isMobileCategoryOpen && (
          <div className="absolute left-0 top-full mt-2 w-72 max-w-[85vw] bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-zinc-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-200">
            <div className="px-3 py-2 border-b border-zinc-100 mb-1 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Explore Categories
              </span>
              <span className="text-[10px] text-zinc-400 font-semibold">
                {CATEGORIES.length} options
              </span>
            </div>

            <div className="grid grid-cols-1 gap-1 max-h-72 overflow-y-auto no-scrollbar py-1">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.name;

                return (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => {
                      onSelectCategory(cat.name);
                      setIsMobileCategoryOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl transition-all text-left cursor-pointer ${
                      isSelected
                        ? 'bg-red-50 text-[#dc3545] font-bold'
                        : 'hover:bg-zinc-100 text-zinc-700 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'bg-[#dc3545] text-white shadow-xs'
                            : 'bg-zinc-100 text-zinc-600'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs">{cat.name}</div>
                        <div className="text-[10px] text-zinc-400 font-normal">
                          {cat.description}
                        </div>
                      </div>
                    </div>

                    {isSelected && <Check className="w-4 h-4 text-[#dc3545] shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 2. DESKTOP SCREENS: Evenly Spread Horizontal Icon Strip */}
      {/* ======================================================== */}
      <div className="hidden md:flex items-center justify-evenly gap-4 flex-1 py-1 px-1">
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
              <Icon
                className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                  isSelected ? 'stroke-[2.2]' : 'stroke-[1.8]'
                }`}
              />
              <span className="text-xs tracking-tight whitespace-nowrap">{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* ======================================================== */}
      {/* 3. Action Controls: Filters & Sort Dropdown */}
      {/* ======================================================== */}
      <div className="flex items-center gap-2 shrink-0">
        
        {/* Filters Button */}
        {onOpenFilterModal && (
          <button
            type="button"
            onClick={onOpenFilterModal}
            className="flex items-center gap-1.5 sm:gap-2 border border-[#DDDDDD] hover:border-zinc-400 rounded-full px-3 sm:px-3.5 py-2 text-xs font-semibold text-zinc-800 hover:shadow-xs transition-all cursor-pointer bg-white"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-600" />
            <span className="hidden xs:inline">Filters</span>
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
              className="flex items-center gap-1.5 border border-[#DDDDDD] hover:border-zinc-400 rounded-full px-3 sm:px-3.5 py-2 text-xs font-semibold text-zinc-800 hover:shadow-xs transition-all cursor-pointer bg-white"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-zinc-600" />
              <span className="hidden sm:inline">{sortLabels[sortOption] || 'Sort By'}</span>
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
