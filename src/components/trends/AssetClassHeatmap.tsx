import React, { useMemo } from 'react';
import { AssetClassComparison } from '@/lib/trends/types';

interface AssetClassHeatmapProps {
  data: AssetClassComparison[];
}

interface HeatmapMetrics {
  name: string;
  class: string;
  score: number;
  momentum: number;
  volatility: number;
  return7d: number;
  return30d: number;
  volume: number;
}

export const AssetClassHeatmap: React.FC<AssetClassHeatmapProps> = ({ data }) => {
  const metrics = useMemo((): HeatmapMetrics[] => {
    return data.map((assetClass) => ({
      name: assetClass.assetClass.charAt(0).toUpperCase() + assetClass.assetClass.slice(1),
      class: assetClass.assetClass,
      score: Math.round(assetClass.score),
      momentum: Math.round(assetClass.momentum),
      volatility: Math.round(assetClass.volatility),
      return7d: Math.round(assetClass.return7d * 100) / 100,
      return30d: Math.round(assetClass.return30d * 100) / 100,
      volume: assetClass.averageVolume,
    }));
  }, [data]);

  const getHeatColor = (value: number, min: number, max: number, inverted = false): string => {
    const normalized = (value - min) / (max - min);
    const adjustedValue = inverted ? 1 - normalized : normalized;

    if (adjustedValue >= 0.75) return '#4CAF50'; // strong green
    if (adjustedValue >= 0.5) return '#8BC34A'; // green
    if (adjustedValue >= 0.25) return '#FFC107'; // yellow
    return '#F44336'; // red
  };

  const getMetricMinMax = (key: keyof HeatmapMetrics) => {
    const values = metrics.map((m) => m[key]).filter((v) => typeof v === 'number') as number[];
    return {
      min: Math.min(...values),
      max: Math.max(...values),
    };
  };

  const scoreRange = getMetricMinMax('score');
  const momentumRange = getMetricMinMax('momentum');
  const volatilityRange = getMetricMinMax('volatility');
  const return7dRange = getMetricMinMax('return7d');
  const return30dRange = getMetricMinMax('return30d');

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-lg font-semibold text-app-text">Asset Klassen Heatmap</h3>
        <p className="text-xs text-app-muted mt-1">
          Metriken über Aktien, Kryptowährungen, Forex und Rohstoffe
        </p>
      </div>

      {metrics.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-app-border bg-app-bg/50">
                <th className="text-left p-3 font-semibold text-app-text">Klasse</th>
                <th className="text-right p-3 font-semibold text-app-text">
                  Trend
                  <br />
                  <span className="text-xs text-app-muted font-normal">Score</span>
                </th>
                <th className="text-right p-3 font-semibold text-app-text">
                  Momentum
                  <br />
                  <span className="text-xs text-app-muted font-normal">-100 bis 100</span>
                </th>
                <th className="text-right p-3 font-semibold text-app-text">
                  Volatilität
                  <br />
                  <span className="text-xs text-app-muted font-normal">%</span>
                </th>
                <th className="text-right p-3 font-semibold text-app-text">
                  7D
                  <br />
                  <span className="text-xs text-app-muted font-normal">Return</span>
                </th>
                <th className="text-right p-3 font-semibold text-app-text">
                  30D
                  <br />
                  <span className="text-xs text-app-muted font-normal">Return</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {metrics.map((metric) => (
                <tr
                  key={metric.class}
                  className="border-b border-app-border hover:bg-app-bg/50 transition-colors"
                >
                  <td className="p-3">
                    <span className="font-semibold text-app-text">{metric.name}</span>
                  </td>

                  {/* Trend Score */}
                  <td className="p-3 text-right">
                    <div
                      className="inline-flex items-center justify-center w-12 h-8 rounded font-bold text-white text-sm"
                      style={{
                        backgroundColor: getHeatColor(
                          metric.score,
                          scoreRange.min,
                          scoreRange.max
                        ),
                      }}
                    >
                      {metric.score}
                    </div>
                  </td>

                  {/* Momentum */}
                  <td className="p-3 text-right">
                    <div
                      className="inline-flex items-center justify-center w-12 h-8 rounded font-bold text-white text-sm"
                      style={{
                        backgroundColor: metric.momentum >= 0
                          ? getHeatColor(metric.momentum, Math.max(0, momentumRange.min), momentumRange.max)
                          : getHeatColor(Math.abs(metric.momentum), 0, Math.abs(momentumRange.min)),
                      }}
                    >
                      {metric.momentum >= 0 ? '+' : ''}{metric.momentum}
                    </div>
                  </td>

                  {/* Volatility (inverted: lower is better) */}
                  <td className="p-3 text-right">
                    <div
                      className="inline-flex items-center justify-center w-12 h-8 rounded font-bold text-white text-sm"
                      style={{
                        backgroundColor: getHeatColor(
                          metric.volatility,
                          volatilityRange.min,
                          volatilityRange.max,
                          true // inverted
                        ),
                      }}
                    >
                      {metric.volatility}
                    </div>
                  </td>

                  {/* 7D Return */}
                  <td className="p-3 text-right">
                    <div
                      className={`inline-flex items-center justify-center w-12 h-8 rounded font-bold text-white text-sm`}
                      style={{
                        backgroundColor:
                          metric.return7d >= 0
                            ? getHeatColor(metric.return7d, Math.max(0, return7dRange.min), return7dRange.max)
                            : getHeatColor(Math.abs(metric.return7d), 0, Math.abs(return7dRange.min)),
                      }}
                    >
                      {metric.return7d >= 0 ? '+' : ''}{metric.return7d.toFixed(1)}%
                    </div>
                  </td>

                  {/* 30D Return */}
                  <td className="p-3 text-right">
                    <div
                      className="inline-flex items-center justify-center w-12 h-8 rounded font-bold text-white text-sm"
                      style={{
                        backgroundColor:
                          metric.return30d >= 0
                            ? getHeatColor(
                                metric.return30d,
                                Math.max(0, return30dRange.min),
                                return30dRange.max
                              )
                            : getHeatColor(Math.abs(metric.return30d), 0, Math.abs(return30dRange.min)),
                      }}
                    >
                      {metric.return30d >= 0 ? '+' : ''}{metric.return30d.toFixed(1)}%
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex items-center justify-center h-64 bg-app-bg rounded">
          <p className="text-app-muted">Keine Asset Klassen Daten verfügbar</p>
        </div>
      )}

      {/* Legend */}
      <div className="border-t border-app-border pt-4 grid grid-cols-2 gap-4 text-xs">
        <div>
          <p className="font-semibold text-app-text mb-2">Farbcodierung</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#4CAF50' }} />
              <span className="text-app-muted">Sehr gut (75%+)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#8BC34A' }} />
              <span className="text-app-muted">Gut (50-75%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#FFC107' }} />
              <span className="text-app-muted">Moderat (25-50%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#F44336' }} />
              <span className="text-app-muted">Schwach (&lt;25%)</span>
            </div>
          </div>
        </div>

        <div>
          <p className="font-semibold text-app-text mb-2">Metriken</p>
          <div className="space-y-2 text-app-muted">
            <p>• Trend Score: 0-100</p>
            <p>• Momentum: -100 bis +100</p>
            <p>• Volatilität: % täglich</p>
            <p>• Returns: % täglich</p>
          </div>
        </div>
      </div>
    </div>
  );
};
