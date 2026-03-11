import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface FilterBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  sortBy: 'newest' | 'helpful';
  onSortChange: (sort: 'newest' | 'helpful') => void;
}

/**
 * FilterBar Component
 * Provides search, category filtering, and sorting functionality
 * Categories: All | Product | Strategy | Market Insight | Tool | Other
 * Sort: Newest (default) | Most Helpful
 */
export default function FilterBar({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  sortBy,
  onSortChange,
}: FilterBarProps) {
  const categories = ['Product', 'Strategy', 'Market Insight', 'Tool', 'Other'];

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
        <Input
          placeholder="Search reflections by keywords…"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 focus:ring-emerald-500 focus:border-emerald-500"
        />
      </div>

      {/* Category Filter & Sort */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        {/* Category Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onCategoryChange(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              selectedCategory === null
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
            aria-pressed={selectedCategory === null}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onCategoryChange(selectedCategory === cat ? null : cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
              aria-pressed={selectedCategory === cat}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sort Dropdown */}
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as 'newest' | 'helpful')}
          className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm font-medium hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          aria-label="Sort reflections"
        >
          <option value="newest">Newest</option>
          <option value="helpful">Most Helpful</option>
        </select>
      </div>
    </div>
  );
}
