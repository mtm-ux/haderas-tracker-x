import React, { useMemo } from 'react';
import { TimelineEvent } from '@/types';
import { Filter } from 'lucide-react';
import { timelineService } from '@/services/timelineService';

interface FilterBarProps {
  events: TimelineEvent[];
  selectedCategory: string | null;
  selectedYear: number | null;
  selectedAsset: string | null;
  onCategoryChange: (category: string | null) => void;
  onYearChange: (year: number | null) => void;
  onAssetChange: (asset: string | null) => void;
}

export const TimelineFilterBar: React.FC<FilterBarProps> = ({
  events,
  selectedCategory,
  selectedYear,
  selectedAsset,
  onCategoryChange,
  onYearChange,
  onAssetChange,
}) => {
  const categories = useMemo(() => timelineService.getCategories(events), [events]);
  const years = useMemo(() => timelineService.getUniqueYears(events), [events]);
  const assets = useMemo(() => timelineService.getUniqueAssets(events), [events]);

  return (
    <div className="flex flex-col md:flex-row gap-3 mb-6 p-4 bg-app-surface border border-app-border rounded-lg">
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-app-muted" />
        <span className="text-xs font-semibold text-app-text">Filter:</span>
      </div>

      {/* Category Filter */}
      <select
        value={selectedCategory || ''}
        onChange={(e) => onCategoryChange(e.target.value || null)}
        className="px-3 py-1 text-xs bg-app-bg border border-app-border rounded text-app-text focus:outline-none focus:border-primary-500"
      >
        <option value="">Alle Kategorien</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.label}
          </option>
        ))}
      </select>

      {/* Year Filter */}
      <select
        value={selectedYear || ''}
        onChange={(e) => onYearChange(e.target.value ? parseInt(e.target.value, 10) : null)}
        className="px-3 py-1 text-xs bg-app-bg border border-app-border rounded text-app-text focus:outline-none focus:border-primary-500"
      >
        <option value="">Alle Jahre</option>
        {years.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>

      {/* Asset Filter */}
      <select
        value={selectedAsset || ''}
        onChange={(e) => onAssetChange(e.target.value || null)}
        className="px-3 py-1 text-xs bg-app-bg border border-app-border rounded text-app-text focus:outline-none focus:border-primary-500"
      >
        <option value="">Alle Assets</option>
        {assets.map((asset) => (
          <option key={asset} value={asset}>
            {asset}
          </option>
        ))}
      </select>

      {/* Clear Filter Button */}
      {(selectedCategory || selectedYear || selectedAsset) && (
        <button
          onClick={() => {
            onCategoryChange(null);
            onYearChange(null);
            onAssetChange(null);
          }}
          className="px-3 py-1 text-xs bg-app-border text-app-muted hover:bg-app-border/80 rounded transition-colors"
        >
          Filter löschen
        </button>
      )}
    </div>
  );
};
