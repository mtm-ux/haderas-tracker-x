import React from 'react';
import { TrendAsset } from '@/lib/trends/types';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

interface TrendTableProps {
  assets: TrendAsset[];
  sortBy: 'trendScore' | 'change30d' | 'momentum' | 'volatility';
  sortOrder: 'asc' | 'desc';
  onSortChange: (sortBy: 'trendScore' | 'change30d' | 'momentum' | 'volatility', sortOrder: 'asc' | 'desc') => void;
}

export const TrendTable: React.FC<TrendTableProps> = ({
  assets,
  sortBy,
  sortOrder,
  onSortChange,
}) => {
  const SortIcon = ({
    column,
  }: {
    column: 'trendScore' | 'change30d' | 'momentum' | 'volatility';
  }) => {
    if (sortBy !== column) return <ChevronsUpDown className="w-4 h-4 text-app-muted" />;
    return sortOrder === 'desc' ? (
      <ChevronDown className="w-4 h-4 text-primary-500" />
    ) : (
      <ChevronUp className="w-4 h-4 text-primary-500" />
    );
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'very_positive':
        return 'bg-success/20 text-success';
      case 'positive':
        return 'bg-success/10 text-success';
      case 'neutral':
        return 'bg-app-bg text-app-muted';
      case 'negative':
        return 'bg-danger/10 text-danger';
      case 'very_negative':
        return 'bg-danger/20 text-danger';
      default:
        return '';
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-app-border">
            <th className="text-left py-3 px-4 font-semibold text-app-text">Asset</th>
            <th className="text-left py-3 px-4 font-semibold text-app-text">Land</th>
            <th className="text-left py-3 px-4 font-semibold text-app-text">Sektor</th>
            <th className="text-left py-3 px-4 font-semibold text-app-text">Klasse</th>
            <th
              className="text-center py-3 px-4 font-semibold text-app-text cursor-pointer hover:bg-app-bg/50"
              onClick={() =>
                onSortChange(
                  'trendScore',
                  sortBy === 'trendScore' && sortOrder === 'desc' ? 'asc' : 'desc'
                )
              }
            >
              <div className="flex items-center justify-center gap-2">
                Trend Score <SortIcon column="trendScore" />
              </div>
            </th>
            <th
              className="text-center py-3 px-4 font-semibold text-app-text cursor-pointer hover:bg-app-bg/50"
              onClick={() =>
                onSortChange(
                  'change30d',
                  sortBy === 'change30d' && sortOrder === 'desc' ? 'asc' : 'desc'
                )
              }
            >
              <div className="flex items-center justify-center gap-2">
                30D % <SortIcon column="change30d" />
              </div>
            </th>
            <th
              className="text-center py-3 px-4 font-semibold text-app-text cursor-pointer hover:bg-app-bg/50"
              onClick={() =>
                onSortChange(
                  'momentum',
                  sortBy === 'momentum' && sortOrder === 'desc' ? 'asc' : 'desc'
                )
              }
            >
              <div className="flex items-center justify-center gap-2">
                Momentum <SortIcon column="momentum" />
              </div>
            </th>
            <th
              className="text-center py-3 px-4 font-semibold text-app-text cursor-pointer hover:bg-app-bg/50"
              onClick={() =>
                onSortChange(
                  'volatility',
                  sortBy === 'volatility' && sortOrder === 'desc' ? 'asc' : 'desc'
                )
              }
            >
              <div className="flex items-center justify-center gap-2">
                Volatilität <SortIcon column="volatility" />
              </div>
            </th>
            <th className="text-center py-3 px-4 font-semibold text-app-text">Sentiment</th>
            <th className="text-center py-3 px-4 font-semibold text-app-text">Makro-Sens.</th>
          </tr>
        </thead>
        <tbody>
          {assets.map((asset) => (
            <tr
              key={asset.symbol}
              className="border-b border-app-border hover:bg-app-bg/30 transition-colors"
            >
              <td className="py-3 px-4">
                <div>
                  <div className="font-semibold text-app-text">{asset.symbol}</div>
                  <div className="text-xs text-app-muted">{asset.name}</div>
                </div>
              </td>
              <td className="py-3 px-4 text-app-text">{asset.country}</td>
              <td className="py-3 px-4 text-app-text">{asset.sector || '–'}</td>
              <td className="py-3 px-4 text-xs text-app-muted uppercase">{asset.assetClass}</td>
              <td className="py-3 px-4">
                <div className="text-center">
                  <div className="inline-block px-3 py-1 rounded-full bg-app-bg">
                    <span className="font-bold text-primary-500">
                      {asset.trendScore.toFixed(1)}
                    </span>
                  </div>
                </div>
              </td>
              <td className="py-3 px-4 text-center">
                <span
                  className={`font-semibold ${
                    (asset.change30dPercent || 0) >= 0 ? 'text-success' : 'text-danger'
                  }`}
                >
                  {(asset.change30dPercent || 0).toFixed(2)}%
                </span>
              </td>
              <td className="py-3 px-4 text-center">
                <span
                  className={`font-semibold ${
                    asset.momentum >= 0 ? 'text-success' : 'text-danger'
                  }`}
                >
                  {asset.momentum.toFixed(1)}
                </span>
              </td>
              <td className="py-3 px-4 text-center text-app-text">
                {asset.volatility.toFixed(1)}
              </td>
              <td className="py-3 px-4 text-center">
                <span
                  className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getSentimentColor(
                    asset.sentiment
                  )}`}
                >
                  {asset.sentiment.replace(/_/g, ' ')}
                </span>
              </td>
              <td className="py-3 px-4 text-center text-app-text">
                {asset.macroSensitivity.toFixed(1)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
