import React, { useState, useRef, useEffect } from 'react';
import {
  Compass,
  TrendingUp,
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
  { name: 'Trending', icon: TrendingUp, description: 'Most popular' },
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
    <div className="w-full flex items-center justify-between gap-3 py-3 mb-6 border-b border-vistaro-border transition-colors duration-200">

      {/* ======================================================== */}
      {/* 1. MOBILE/SMALL SCREENS: Unique Corner Category Dropdown */}
      {/* ======================================================== */}
      <div className="relative md:hidden" ref={mobileCatRef}>
        <button
          type="button"
          onClick={() => setIsMobileCategoryOpen(!isMobileCategoryOpen)}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-full border text-nav-link transition-all shadow-xs cursor-pointer ${isMobileCategoryOpen || selectedCategory !== 'All'
              ? 'bg-vistaro-accent text-white border-vistaro-accent shadow-sm'
              : 'bg-vistaro-surface text-vistaro-primary border-vistaro-border hover:border-vistaro-muted'
            }`}
        >
          <CurrentCategoryIcon className={`w-4 h-4 ${selectedCategory !== 'All' ? 'text-white' : 'text-vistaro-muted'}`} />
          <span>{selectedCategory}</span>
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-200 ${isMobileCategoryOpen ? 'rotate-180 text-white' : 'text-vistaro-muted'
              }`}
          />
        </button>

        {/* Unique Corner Floating Sheet / Dropdown Menu */}
        {isMobileCategoryOpen && (
          <div className="absolute left-0 top-full mt-2 w-72 max-w-[85vw] bg-vistaro-surface/95 backdrop-blur-md rounded-3xl shadow-2xl border border-vistaro-border p-2 z-50 animate-in fade-in zoom-in-95 duration-200">
            <div className="px-3 py-2 border-b border-vistaro-border mb-1 flex items-center justify-between">
              <span className="text-label text-vistaro-muted">
                Explore Categories
              </span>
              <span className="text-caption text-vistaro-muted font-semibold">
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
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl transition-all text-left cursor-pointer ${isSelected
                        ? 'bg-vistaro-secondary text-vistaro-accent font-semibold'
                        : 'hover:bg-vistaro-secondary text-vistaro-secondary hover:text-vistaro-primary font-normal'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${isSelected
                            ? 'bg-vistaro-accent text-white shadow-xs'
                            : 'bg-vistaro-main text-vistaro-secondary'
                          }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-body-sm font-semibold">{cat.name}</div>
                        <div className="text-2xs text-vistaro-muted font-normal">
                          {cat.description}
                        </div>
                      </div>
                    </div>

                    {isSelected && <Check className="w-4 h-4 text-vistaro-accent shrink-0" />}
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
              className={`flex flex-col items-center gap-1.5 pb-2 shrink-0 border-b-2 transition-all cursor-pointer group ${isSelected
                  ? 'border-vistaro-accent text-vistaro-accent opacity-100'
                  : 'border-transparent text-vistaro-muted hover:text-vistaro-primary hover:border-vistaro-border opacity-80 hover:opacity-100'
                }`}
            >
              <Icon
                className={`w-5 h-5 transition-transform group-hover:scale-110 ${isSelected ? 'stroke-[2.2]' : 'stroke-[1.8]'
                  }`}
              />
              <span className={`whitespace-nowrap ${isSelected ? 'text-nav-link-active' : 'text-nav-link'}`}>{cat.name}</span>
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
            className="flex items-center gap-1.5 sm:gap-2 border border-vistaro-border hover:border-vistaro-muted rounded-full px-3 sm:px-3.5 py-2 text-cta text-vistaro-primary hover:shadow-xs transition-all cursor-pointer bg-vistaro-surface hover:bg-vistaro-secondary"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-vistaro-secondary" />
            <span className="hidden xs:inline">Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-vistaro-accent text-white text-2xs flex items-center justify-center font-bold">
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
              className="flex items-center gap-1.5 border border-vistaro-border hover:border-vistaro-muted rounded-full px-3 sm:px-3.5 py-2 text-cta text-vistaro-primary hover:shadow-xs transition-all cursor-pointer bg-vistaro-surface hover:bg-vistaro-secondary"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-vistaro-secondary" />
              <span className="hidden sm:inline">{sortLabels[sortOption] || 'Sort By'}</span>
              <ChevronDown className="w-3 h-3 text-vistaro-muted" />
            </button>

            {isSortOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-vistaro-surface rounded-2xl shadow-xl border border-vistaro-border py-2 z-50 animate-fade-in divide-y divide-vistaro-border">
                <button
                  type="button"
                  onClick={() => {
                    onSortChange('');
                    setIsSortOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-body-sm hover:bg-vistaro-secondary transition-colors cursor-pointer ${sortOption === '' ? 'font-semibold text-vistaro-accent bg-vistaro-secondary' : 'text-vistaro-primary'
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
                  className={`w-full text-left px-4 py-2 text-body-sm hover:bg-vistaro-secondary transition-colors cursor-pointer ${sortOption === 'price_asc' ? 'font-semibold text-vistaro-accent bg-vistaro-secondary' : 'text-vistaro-primary'
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
                  className={`w-full text-left px-4 py-2 text-body-sm hover:bg-vistaro-secondary transition-colors cursor-pointer ${sortOption === 'price_desc' ? 'font-semibold text-vistaro-accent bg-vistaro-secondary' : 'text-vistaro-primary'
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
                  className={`w-full text-left px-4 py-2 text-body-sm hover:bg-vistaro-secondary transition-colors cursor-pointer ${sortOption === 'newest' ? 'font-semibold text-vistaro-accent bg-vistaro-secondary' : 'text-vistaro-primary'
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
