import React from 'react';
import { TrendFilters, Sentiment } from '@/lib/trends/types';
import { ChevronDown, X } from 'lucide-react';

interface FiltersProps {
  filters: TrendFilters;
  onFiltersChange: (filters: TrendFilters) => void;
  availableSectors?: string[];
  availableCountries?: string[];
  availableAssetClasses?: string[];
}

const SENTIMENTS: { value: Sentiment; label: string; color: string }[] = [
  { value: 'very_positive', label: 'Sehr positiv', color: 'bg-green-600' },
  { value: 'positive', label: 'Positiv', color: 'bg-green-500' },
  { value: 'neutral', label: 'Neutral', color: 'bg-yellow-500' },
  { value: 'negative', label: 'Negativ', color: 'bg-red-500' },
  { value: 'very_negative', label: 'Sehr negativ', color: 'bg-red-600' },
];

const DEFAULT_SECTORS = [
  'Technology',
  'Healthcare',
  'Financials',
  'Energy',
  'Consumer',
  'Industrials',
  'Materials',
  'Utilities',
  'Real Estate',
  'Communication',
];

const DEFAULT_COUNTRIES = [
  { code: 'US', name: 'USA' },
  { code: 'DE', name: 'Germany' },
  { code: 'GB', name: 'UK' },
  { code: 'JP', name: 'Japan' },
  { code: 'CN', name: 'China' },
  { code: 'IN', name: 'India' },
  { code: 'FR', name: 'France' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'SG', name: 'Singapore' },
];

const DEFAULT_ASSET_CLASSES = ['stock', 'crypto', 'fx', 'commodity', 'bond'];

export const Filters: React.FC<FiltersProps> = ({
  filters,
  onFiltersChange,
  availableSectors = DEFAULT_SECTORS,
  availableCountries = DEFAULT_COUNTRIES,
  availableAssetClasses = DEFAULT_ASSET_CLASSES,
}) => {
  const [expandedFilter, setExpandedFilter] = React.useState<string | null>(null);

  const toggleSector = (sector: string) => {
    const updated = filters.sectors.includes(sector)
      ? filters.sectors.filter((s) => s !== sector)
      : [...filters.sectors, sector];
    onFiltersChange({ ...filters, sectors: updated });
  };

  const toggleCountry = (country: string) => {
    const updated = filters.countries.includes(country)
      ? filters.countries.filter((c) => c !== country)
      : [...filters.countries, country];
    onFiltersChange({ ...filters, countries: updated });
  };

  const toggleAssetClass = (assetClass: string) => {
    const updated = filters.assetClasses.includes(assetClass as any)
      ? filters.assetClasses.filter((ac) => ac !== assetClass)
      : [...filters.assetClasses, assetClass as any];
    onFiltersChange({ ...filters, assetClasses: updated });
  };

  const toggleSentiment = (sentiment: Sentiment) => {
    const updated = filters.sentiments.includes(sentiment)
      ? filters.sentiments.filter((s) => s !== sentiment)
      : [...filters.sentiments, sentiment];
    onFiltersChange({ ...filters, sentiments: updated });
  };

  const updateTrendScoreRange = (min: number, max: number) => {
    onFiltersChange({
      ...filters,
      trendScoreRange: [Math.max(0, min), Math.min(100, max)],
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      sectors: [],
      countries: [],
      assetClasses: [],
      trendScoreRange: [0, 100],
      sentiments: [],
    });
  };

  const hasActiveFilters =
    filters.sectors.length > 0 ||
    filters.countries.length > 0 ||
    filters.assetClasses.length > 0 ||
    filters.sentiments.length > 0 ||
    filters.trendScoreRange[0] > 0 ||
    filters.trendScoreRange[1] < 100;

  return (
    <div className="space-y-4">
      {/* Filter Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-app-text">Filter</h3>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="flex items-center gap-1 text-xs text-app-primary hover:text-app-primary/80 transition-colors"
          >
            <X size={14} />
            Alle löschen
          </button>
        )}
      </div>

      {/* Trend Score Range */}
      <div className="bg-app-bg rounded border border-app-border">
        <button
          onClick={() => setExpandedFilter(expandedFilter === 'trendScore' ? null : 'trendScore')}
          className="w-full flex items-center justify-between p-3 hover:bg-app-bg/50 transition-colors"
        >
          <span className="font-semibold text-app-text">Trend Score Bereich</span>
          <ChevronDown
            size={18}
            className={`text-app-muted transition-transform ${
              expandedFilter === 'trendScore' ? 'rotate-180' : ''
            }`}
          />
        </button>
        {expandedFilter === 'trendScore' && (
          <div className="border-t border-app-border p-3 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-app-muted">Min: {filters.trendScoreRange[0]}</span>
              <span className="text-app-muted">Max: {filters.trendScoreRange[1]}</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={filters.trendScoreRange[0]}
              onChange={(e) =>
                updateTrendScoreRange(parseInt(e.target.value), filters.trendScoreRange[1])
              }
              className="w-full"
            />
            <input
              type="range"
              min="0"
              max="100"
              value={filters.trendScoreRange[1]}
              onChange={(e) =>
                updateTrendScoreRange(filters.trendScoreRange[0], parseInt(e.target.value))
              }
              className="w-full"
            />
          </div>
        )}
      </div>

      {/* Sectors */}
      <div className="bg-app-bg rounded border border-app-border">
        <button
          onClick={() => setExpandedFilter(expandedFilter === 'sectors' ? null : 'sectors')}
          className="w-full flex items-center justify-between p-3 hover:bg-app-bg/50 transition-colors"
        >
          <span className="font-semibold text-app-text">
            Sektoren
            {filters.sectors.length > 0 && (
              <span className="ml-2 text-xs bg-app-primary/20 text-app-primary rounded px-2 py-1">
                {filters.sectors.length}
              </span>
            )}
          </span>
          <ChevronDown
            size={18}
            className={`text-app-muted transition-transform ${
              expandedFilter === 'sectors' ? 'rotate-180' : ''
            }`}
          />
        </button>
        {expandedFilter === 'sectors' && (
          <div className="border-t border-app-border p-3 space-y-3">
            {/* Select All / Deselect All buttons */}
            <div className="flex gap-2 pb-2 border-b border-app-border">
              <button
                onClick={() =>
                  onFiltersChange({
                    ...filters,
                    sectors: filters.sectors.length === availableSectors.length ? [] : availableSectors,
                  })
                }
                className="text-xs px-2 py-1 rounded bg-app-primary/20 text-app-primary hover:bg-app-primary/30 transition-colors"
              >
                {filters.sectors.length === availableSectors.length ? 'Alle abwählen' : 'Alle auswählen'}
              </button>
            </div>
            {/* Sectors grid */}
            <div className="grid grid-cols-2 gap-2">
              {availableSectors.map((sector) => (
                <label key={sector} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.sectors.includes(sector)}
                    onChange={() => toggleSector(sector)}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm text-app-text">{sector}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Countries */}
      <div className="bg-app-bg rounded border border-app-border">
        <button
          onClick={() => setExpandedFilter(expandedFilter === 'countries' ? null : 'countries')}
          className="w-full flex items-center justify-between p-3 hover:bg-app-bg/50 transition-colors"
        >
          <span className="font-semibold text-app-text">
            Länder
            {filters.countries.length > 0 && (
              <span className="ml-2 text-xs bg-app-primary/20 text-app-primary rounded px-2 py-1">
                {filters.countries.length}
              </span>
            )}
          </span>
          <ChevronDown
            size={18}
            className={`text-app-muted transition-transform ${
              expandedFilter === 'countries' ? 'rotate-180' : ''
            }`}
          />
        </button>
        {expandedFilter === 'countries' && (
          <div className="border-t border-app-border p-3 space-y-3">
            {/* Select All / Deselect All buttons */}
            <div className="flex gap-2 pb-2 border-b border-app-border">
              <button
                onClick={() =>
                  onFiltersChange({
                    ...filters,
                    countries:
                      filters.countries.length === availableCountries.length
                        ? []
                        : availableCountries.map((c) => (typeof c === 'string' ? c : c.code)),
                  })
                }
                className="text-xs px-2 py-1 rounded bg-app-primary/20 text-app-primary hover:bg-app-primary/30 transition-colors"
              >
                {filters.countries.length === availableCountries.length ? 'Alle abwählen' : 'Alle auswählen'}
              </button>
            </div>
            {/* Countries grid */}
            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
              {availableCountries.map((country) => {
                const countryCode = typeof country === 'string' ? country : country.code;
                const countryName = typeof country === 'string' ? country : country.name;
                return (
                  <label key={countryCode} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.countries.includes(countryCode)}
                      onChange={() => toggleCountry(countryCode)}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm text-app-text">{countryName}</span>
                  </label>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Asset Classes */}
      <div className="bg-app-bg rounded border border-app-border">
        <button
          onClick={() =>
            setExpandedFilter(expandedFilter === 'assetClasses' ? null : 'assetClasses')
          }
          className="w-full flex items-center justify-between p-3 hover:bg-app-bg/50 transition-colors"
        >
          <span className="font-semibold text-app-text">
            Asset Klassen
            {filters.assetClasses.length > 0 && (
              <span className="ml-2 text-xs bg-app-primary/20 text-app-primary rounded px-2 py-1">
                {filters.assetClasses.length}
              </span>
            )}
          </span>
          <ChevronDown
            size={18}
            className={`text-app-muted transition-transform ${
              expandedFilter === 'assetClasses' ? 'rotate-180' : ''
            }`}
          />
        </button>
        {expandedFilter === 'assetClasses' && (
          <div className="border-t border-app-border p-3 space-y-3">
            {/* Select All / Deselect All buttons */}
            <div className="flex gap-2 pb-2 border-b border-app-border">
              <button
                onClick={() =>
                  onFiltersChange({
                    ...filters,
                    assetClasses:
                      filters.assetClasses.length === availableAssetClasses.length
                        ? []
                        : (availableAssetClasses as any[]),
                  })
                }
                className="text-xs px-2 py-1 rounded bg-app-primary/20 text-app-primary hover:bg-app-primary/30 transition-colors"
              >
                {filters.assetClasses.length === availableAssetClasses.length ? 'Alle abwählen' : 'Alle auswählen'}
              </button>
            </div>
            {/* Asset classes list */}
            <div className="space-y-2">
              {availableAssetClasses.map((assetClass) => (
                <label key={assetClass} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.assetClasses.includes(assetClass as any)}
                    onChange={() => toggleAssetClass(assetClass)}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm text-app-text capitalize">{assetClass}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sentiments */}
      <div className="bg-app-bg rounded border border-app-border">
        <button
          onClick={() => setExpandedFilter(expandedFilter === 'sentiments' ? null : 'sentiments')}
          className="w-full flex items-center justify-between p-3 hover:bg-app-bg/50 transition-colors"
        >
          <span className="font-semibold text-app-text">
            Sentiment
            {filters.sentiments.length > 0 && (
              <span className="ml-2 text-xs bg-app-primary/20 text-app-primary rounded px-2 py-1">
                {filters.sentiments.length}
              </span>
            )}
          </span>
          <ChevronDown
            size={18}
            className={`text-app-muted transition-transform ${
              expandedFilter === 'sentiments' ? 'rotate-180' : ''
            }`}
          />
        </button>
        {expandedFilter === 'sentiments' && (
          <div className="border-t border-app-border p-3 space-y-3">
            {/* Select All / Deselect All buttons */}
            <div className="flex gap-2 pb-2 border-b border-app-border">
              <button
                onClick={() =>
                  onFiltersChange({
                    ...filters,
                    sentiments:
                      filters.sentiments.length === SENTIMENTS.length
                        ? []
                        : SENTIMENTS.map((s) => s.value),
                  })
                }
                className="text-xs px-2 py-1 rounded bg-app-primary/20 text-app-primary hover:bg-app-primary/30 transition-colors"
              >
                {filters.sentiments.length === SENTIMENTS.length ? 'Alle abwählen' : 'Alle auswählen'}
              </button>
            </div>
            {/* Sentiments list */}
            <div className="space-y-2">
              {SENTIMENTS.map((sentiment) => (
                <label key={sentiment.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.sentiments.includes(sentiment.value)}
                    onChange={() => toggleSentiment(sentiment.value)}
                    className="w-4 h-4 rounded"
                  />
                  <div className={`w-3 h-3 rounded-full ${sentiment.color}`} />
                  <span className="text-sm text-app-text">{sentiment.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
