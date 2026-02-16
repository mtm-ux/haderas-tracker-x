import React, { useState } from 'react';
import { FearGreedIndex, FearGreedCategory } from '@/lib/trends/types';
import { getFearGreedDescription } from '@/lib/trends/calculateFearGreed';
import { FearGreedAssetType } from '@/services/cnnFearGreedService';

interface FearGreedGaugeProps {
  indices: Record<FearGreedAssetType, FearGreedIndex | null>;
}

const ASSET_OPTIONS: { value: FearGreedAssetType; label: string; color: string }[] = [
  { value: 'bitcoin', label: '₿ Bitcoin', color: 'bg-orange-500/20 text-orange-400' },
  { value: 'ethereum', label: '◆ Ethereum', color: 'bg-purple-500/20 text-purple-400' },
  { value: 'crypto_market', label: '🔗 Crypto', color: 'bg-blue-500/20 text-blue-400' },
  { value: 'general_market', label: '📊 Markt', color: 'bg-green-500/20 text-green-400' },
];

export const FearGreedGauge: React.FC<FearGreedGaugeProps> = ({ indices }) => {
  const [selectedAsset, setSelectedAsset] = useState<FearGreedAssetType>('bitcoin');
  const index = indices[selectedAsset];

  if (!index) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-8">
        <p className="text-app-muted">Laden...</p>
      </div>
    );
  }

  const getColor = (category: FearGreedCategory) => {
    switch (category) {
      case 'extreme_fear':
        return '#ef5350'; // red
      case 'fear':
        return '#ff9800'; // orange
      case 'neutral':
        return '#ffc107'; // amber
      case 'greed':
        return '#8bc34a'; // green
      case 'extreme_greed':
        return '#00bcd4'; // cyan
      default:
        return '#607d8b';
    }
  };

  const rotation = (index.value / 100) * 180 - 90; // -90 to 90 degrees

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      {/* Asset Selection Tabs */}
      <div className="flex gap-2 flex-wrap justify-center w-full">
        {ASSET_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => setSelectedAsset(option.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedAsset === option.value
                ? 'bg-app-primary text-white scale-110'
                : `${option.color} hover:scale-105`
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Gauge */}
      <div className="relative w-48 h-24">
        {/* Background arc */}
        <svg width="200" height="120" viewBox="0 0 200 120" className="absolute inset-0">
          {/* Fear section */}
          <path
            d="M 20 100 A 80 80 0 0 1 50 35"
            fill="none"
            stroke="#ef5350"
            strokeWidth="8"
            opacity="0.3"
          />
          {/* Neutral section */}
          <path
            d="M 50 35 A 80 80 0 0 1 150 35"
            fill="none"
            stroke="#ffc107"
            strokeWidth="8"
            opacity="0.3"
          />
          {/* Greed section */}
          <path
            d="M 150 35 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#8bc34a"
            strokeWidth="8"
            opacity="0.3"
          />

          {/* Needle */}
          <line
            x1="100"
            y1="100"
            x2="100"
            y2="25"
            stroke={getColor(index.category)}
            strokeWidth="3"
            style={{
              transform: `rotate(${rotation}deg)`,
              transformOrigin: '100px 100px',
              transition: 'transform 0.5s ease-out',
            }}
          />

          {/* Center circle */}
          <circle cx="100" cy="100" r="6" fill={getColor(index.category)} />
        </svg>

        {/* Value */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
          <span className="text-2xl font-bold" style={{ color: getColor(index.category) }}>
            {index.value.toFixed(0)}
          </span>
        </div>
      </div>

      {/* Labels */}
      <div className="flex justify-between w-48 text-xs text-app-muted px-2">
        <span>Extreme Angst</span>
        <span>Neutral</span>
        <span>Extreme Gier</span>
      </div>

      {/* Category and description */}
      <div className="text-center space-y-2">
        <div
          className="inline-block px-4 py-2 rounded-full font-semibold text-white"
          style={{ backgroundColor: getColor(index.category) }}
        >
          {index.category.replace(/_/g, ' ').toUpperCase()}
        </div>
        <p className="text-sm text-app-muted max-w-xs">
          {getFearGreedDescription(index.category)}
        </p>
      </div>

      {/* Components */}
      <div className="grid grid-cols-2 gap-3 w-full max-w-sm text-xs">
        <div className="bg-app-bg rounded p-2">
          <p className="text-app-muted mb-1">Momentum</p>
          <p className="font-bold text-app-text">{index.marketMomentum.toFixed(0)}</p>
        </div>
        <div className="bg-app-bg rounded p-2">
          <p className="text-app-muted mb-1">Volatilität</p>
          <p className="font-bold text-app-text">{index.volatility.toFixed(0)}</p>
        </div>
        <div className="bg-app-bg rounded p-2">
          <p className="text-app-muted mb-1">Marktbreite</p>
          <p className="font-bold text-app-text">{index.marketBreadth.toFixed(0)}</p>
        </div>
        <div className="bg-app-bg rounded p-2">
          <p className="text-app-muted mb-1">Sentiment</p>
          <p className="font-bold text-app-text">{index.sentiment.toFixed(0)}</p>
        </div>
        <div className="bg-app-bg rounded p-2">
          <p className="text-app-muted mb-1">Credit Spread</p>
          <p className="font-bold text-app-text">{index.creditSpreadProxy.toFixed(0)}</p>
        </div>
        <div className="bg-app-bg rounded p-2">
          <p className="text-app-muted mb-1">Volume</p>
          <p className="font-bold text-app-text">{index.volumeExtremes.toFixed(0)}</p>
        </div>
      </div>
    </div>
  );
};
