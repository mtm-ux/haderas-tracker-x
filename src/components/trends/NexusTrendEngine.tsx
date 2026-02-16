import React, { useState, useEffect } from 'react';
import { NexusTrendEngineState, TrendFilters } from '@/lib/trends/types';
import { fetchTrendAssets, calculateSectorRotations, calculateCountryMomentum, calculateAssetClassComparison } from '@/lib/trends/fetchMarketData';
import { calculateFearGreedIndex } from '@/lib/trends/calculateFearGreed';
import { cnnFearGreedService } from '@/services/cnnFearGreedService';
import { Loader } from '@/components/common/Loader';
import { Card } from '@/components/common/Card';
import { TrendTable } from './TrendTable';
import { FearGreedGauge } from './FearGreedGauge';
import { SectorRotationChart } from './SectorRotationChart';
import { CountryMomentumChart } from './CountryMomentumChart';
import { AssetClassHeatmap } from './AssetClassHeatmap';
import { Filters } from './Filters';
import { TrendingUp, Zap, BarChart3 } from 'lucide-react';

const DEFAULT_FILTERS: TrendFilters = {
  sectors: [],
  countries: [],
  assetClasses: [],
  sentiments: [],
  trendScoreRange: [0, 100],
};

const DEFAULT_STATE: NexusTrendEngineState = {
  assets: [],
  fearGreedIndex: null,
  fearGreedIndices: {
    bitcoin: null,
    ethereum: null,
    crypto_market: null,
    general_market: null,
  },
  sectorRotation: [],
  countryMomentum: [],
  assetClassComparison: [],
  isLoading: true,
  error: null,
  lastUpdate: 0,
  activeFilters: DEFAULT_FILTERS,
  sortBy: 'trendScore',
  sortOrder: 'desc',
};

export const NexusTrendEngine: React.FC = () => {
  const [state, setState] = useState<NexusTrendEngineState>(DEFAULT_STATE);

  // Load market data on mount
  useEffect(() => {
    const loadData = async () => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        // Fetch assets
        const assets = await fetchTrendAssets();

        // Calculate derived data
        const sectorRotation = calculateSectorRotations(assets);
        const countryMomentum = calculateCountryMomentum(assets);
        const assetClassComparison = calculateAssetClassComparison(assets);

        // Fetch multiple Fear & Greed Indizes
        const [bitcoinFG, ethereumFG, cryptoFG, generalFG] = await Promise.all([
          cnnFearGreedService.getFearGreedIndex('bitcoin'),
          cnnFearGreedService.getFearGreedIndex('ethereum'),
          cnnFearGreedService.getFearGreedIndex('crypto_market'),
          cnnFearGreedService.getFearGreedIndex('general_market'),
        ]);

        // Create FearGreedIndex objects for each
        const createFGIndex = (value: number) =>
          calculateFearGreedIndex({
            marketMomentum: value > 50 ? 5.2 : -5.2,
            volatility: 18.5,
            marketBreathPositive: 50 + (value - 50) * 0.5,
            safeHavenRatio: 0.35,
            creditSpreadBasisPoints: 150,
            volumeRatio: 1.2,
            sentimentScore: value - 50,
          });

        const fearGreedIndices = {
          bitcoin: bitcoinFG ? { ...createFGIndex(bitcoinFG.value), value: bitcoinFG.value, category: bitcoinFG.category.toLowerCase().replace(' ', '_') as any } : null,
          ethereum: ethereumFG ? { ...createFGIndex(ethereumFG.value), value: ethereumFG.value, category: ethereumFG.category.toLowerCase().replace(' ', '_') as any } : null,
          crypto_market: cryptoFG ? { ...createFGIndex(cryptoFG.value), value: cryptoFG.value, category: cryptoFG.category.toLowerCase().replace(' ', '_') as any } : null,
          general_market: generalFG ? { ...createFGIndex(generalFG.value), value: generalFG.value, category: generalFG.category.toLowerCase().replace(' ', '_') as any } : null,
        };

        setState((prev) => ({
          ...prev,
          assets,
          sectorRotation,
          countryMomentum,
          assetClassComparison,
          fearGreedIndices: fearGreedIndices as any,
          fearGreedIndex: fearGreedIndices.bitcoin, // Default: Bitcoin
          isLoading: false,
          lastUpdate: Date.now(),
        }));
      } catch (error) {
        console.error('Error loading trend data:', error);
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: 'Fehler beim Laden der Trend-Daten',
        }));
      }
    };

    loadData();
  }, []);

  // Apply filters to assets
  const filteredAssets = state.assets.filter((asset) => {
    if (state.activeFilters.sectors.length > 0 && asset.sector && !state.activeFilters.sectors.includes(asset.sector)) {
      return false;
    }
    if (state.activeFilters.countries.length > 0 && !state.activeFilters.countries.includes(asset.country)) {
      return false;
    }
    if (state.activeFilters.assetClasses.length > 0 && !state.activeFilters.assetClasses.includes(asset.assetClass)) {
      return false;
    }
    if (state.activeFilters.trendScoreRange) {
      const [min, max] = state.activeFilters.trendScoreRange;
      if (asset.trendScore < min || asset.trendScore > max) {
        return false;
      }
    }
    if (state.activeFilters.sentiments.length > 0 && !state.activeFilters.sentiments.includes(asset.sentiment)) {
      return false;
    }
    return true;
  });

  // Sort assets
  const sortedAssets = [...filteredAssets].sort((a, b) => {
    let aVal = 0,
      bVal = 0;

    switch (state.sortBy) {
      case 'trendScore':
        aVal = a.trendScore;
        bVal = b.trendScore;
        break;
      case 'change30d':
        aVal = a.change30dPercent || 0;
        bVal = b.change30dPercent || 0;
        break;
      case 'momentum':
        aVal = a.momentum;
        bVal = b.momentum;
        break;
      case 'volatility':
        aVal = a.volatility;
        bVal = b.volatility;
        break;
    }

    return state.sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
  });

  return (
    <div className="h-full overflow-y-auto p-3 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl md:text-4xl font-bold text-app-text flex items-center gap-3">
          <Zap className="w-8 h-8 text-primary-500" />
          Nexus Trend Engine
        </h1>
        <p className="text-sm text-app-muted">
          Institutionelle Marktanalyse-Engine zur Identifikation globaler Trendrotationen
        </p>
        {state.lastUpdate > 0 && (
          <p className="text-xs text-app-muted">
            Aktualisiert: {new Date(state.lastUpdate).toLocaleTimeString('de-DE')}
          </p>
        )}
      </div>

      {state.isLoading ? (
        <div className="flex items-center justify-center h-96">
          <Loader />
        </div>
      ) : state.error ? (
        <Card className="border-danger bg-danger/10">
          <p className="text-danger">{state.error}</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Fear & Greed Index */}
          {(state.fearGreedIndices && Object.values(state.fearGreedIndices).some(fg => fg !== null)) && (
            <Card>
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-app-text flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-primary-500" />
                    Fear & Greed Index
                  </h2>
                  <FearGreedGauge indices={state.fearGreedIndices} />
                </div>
              </div>
            </Card>
          )}

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sektor Rotation */}
            {state.sectorRotation.length > 0 && (
              <Card>
                <h3 className="text-lg font-bold text-app-text mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary-500" />
                  Sektor-Rotation
                </h3>
                <SectorRotationChart data={state.sectorRotation} />
              </Card>
            )}

            {/* Country Momentum */}
            {state.countryMomentum.length > 0 && (
              <Card>
                <h3 className="text-lg font-bold text-app-text mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary-500" />
                  Länder-Momentum
                </h3>
                <CountryMomentumChart data={state.countryMomentum} />
              </Card>
            )}
          </div>

          {/* Asset Class Heatmap */}
          {state.assetClassComparison.length > 0 && (
            <Card>
              <h3 className="text-lg font-bold text-app-text mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary-500" />
                Assetklassen-Vergleich
              </h3>
              <AssetClassHeatmap data={state.assetClassComparison} />
            </Card>
          )}

          {/* Filters */}
          <Card>
            <h3 className="text-lg font-bold text-app-text mb-4">Filter</h3>
            <Filters
              filters={state.activeFilters}
              onFiltersChange={(filters: TrendFilters) =>
                setState((prev) => ({ ...prev, activeFilters: filters }))
              }
              availableSectors={['Technology', 'Healthcare', 'Financials', 'Energy', 'Consumer', 'Industrials', 'Materials', 'Utilities', 'Real Estate', 'Communication']}
              availableCountries={['USA', 'Germany', 'UK', 'Japan', 'China', 'India', 'France', 'Canada', 'Australia', 'Singapore']}
              availableAssetClasses={['stock', 'crypto', 'fx', 'commodity', 'bond']}
            />
          </Card>

          {/* Trend Table */}
          <Card>
            <h3 className="text-lg font-bold text-app-text mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary-500" />
              Trend-Rankings ({sortedAssets.length} Assets)
            </h3>
            <TrendTable
              assets={sortedAssets}
              sortBy={state.sortBy}
              sortOrder={state.sortOrder}
              onSortChange={(sortBy: typeof state.sortBy, sortOrder: typeof state.sortOrder) =>
                setState((prev) => ({ ...prev, sortBy, sortOrder }))
              }
            />
          </Card>
        </div>
      )}
    </div>
  );
};
