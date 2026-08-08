import React from 'react';
import { Search, Filter, X, RefreshCw } from 'lucide-react';
import { FilterOptions, FoodCategory } from '../types.js';

interface FilterBarProps {
  filters: FilterOptions;
  onFilterChange: (updated: Partial<FilterOptions>) => void;
  onResetFilters: () => void;
  totalResults: number;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

const CATEGORIES: { label: string; value: string }[] = [
  { label: 'All Categories', value: 'all' },
  { label: '🍲 Cooked Meals', value: 'Cooked Meals' },
  { label: '🥖 Baked Goods', value: 'Baked Goods' },
  { label: '🍎 Fresh Produce', value: 'Fresh Produce' },
  { label: '🥫 Packaged & Pantry', value: 'Packaged/Pantry' },
  { label: '🥛 Dairy & Eggs', value: 'Dairy & Eggs' },
  { label: '🥤 Beverages', value: 'Beverages' },
  { label: '🍱 Other', value: 'Other' },
];

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  totalResults,
  onRefresh,
  isRefreshing,
}) => {
  const isFiltered =
    filters.search.trim() !== '' ||
    filters.category !== 'all' ||
    filters.status !== 'active';

  return (
    <div className="bg-white border-b border-[#EBE9E4] sticky top-18 z-20 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          
          {/* Search Input Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => onFilterChange({ search: e.target.value })}
              placeholder="Search e.g. Pasta, Bread, neighborhood address..."
              className="w-full pl-10 pr-9 py-2 rounded-xl border border-[#EBE9E4] bg-[#F9F9F7] text-sm text-[#2D3436] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#5A7D55]/20 focus:bg-white transition-all"
            />
            {filters.search && (
              <button
                onClick={() => onFilterChange({ search: '' })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Controls Row */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            
            {/* Category Dropdown */}
            <div className="flex items-center space-x-1">
              <select
                value={filters.category}
                onChange={(e) => onFilterChange({ category: e.target.value })}
                className="py-2 px-3 rounded-xl border border-[#EBE9E4] bg-[#F9F9F7] text-xs sm:text-sm font-medium text-stone-700 focus:outline-none focus:ring-2 focus:ring-[#5A7D55]/20 cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Selector Pills */}
            <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-[#EBE9E4] text-xs sm:text-sm">
              <button
                onClick={() => onFilterChange({ status: 'active' })}
                className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  filters.status === 'active'
                    ? 'bg-[#5A7D55] text-white shadow-2xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Available
              </button>
              <button
                onClick={() => onFilterChange({ status: 'all' })}
                className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  filters.status === 'all'
                    ? 'bg-[#2D3436] text-white shadow-2xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                All Posts
              </button>
              <button
                onClick={() => onFilterChange({ status: 'claimed' })}
                className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  filters.status === 'claimed'
                    ? 'bg-[#E98A4A] text-white shadow-2xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Claimed
              </button>
            </div>

            {/* Clear Filters Button */}
            {isFiltered && (
              <button
                onClick={onResetFilters}
                className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}

            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-2.5 rounded-xl border border-[#EBE9E4] bg-[#F9F9F7] text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
              title="Refresh listings"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#5A7D55]' : ''}`} />
            </button>
          </div>
        </div>

        {/* Results Info Bar */}
        <div className="mt-2.5 flex items-center justify-between text-xs text-stone-500">
          <span>
            Showing <strong className="text-[#2D3436]">{totalResults}</strong> food{' '}
            {totalResults === 1 ? 'listing' : 'listings'}
          </span>
          {isFiltered && (
            <span className="text-[#5A7D55] font-semibold bg-[#5A7D55]/10 px-2 py-0.5 rounded-full border border-[#5A7D55]/20">
              Filtered View
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
