import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { SectorRotation } from '@/lib/trends/types';

interface SectorRotationChartProps {
  data: SectorRotation[];
}

export const SectorRotationChart: React.FC<SectorRotationChartProps> = ({ data }) => {
  const chartData = useMemo(() => {
    return data.map((sector) => ({
      name: sector.sector,
      trendScore: Math.round(sector.score),
      momentum: Math.round(sector.momentum),
      return30d: Math.round(sector.averageReturn30d * 100) / 100,
      leadership: sector.leadership,
      assetCount: sector.assetsCount,
    }));
  }, [data]);

  const getLeadershipColor = (leadership: string): string => {
    switch (leadership) {
      case 'strong':
        return '#4CAF50'; // strong green
      case 'moderate':
        return '#FFC107'; // moderate yellow
      case 'weak':
        return '#F44336'; // weak red
      default:
        return '#9E9E9E';
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-lg font-semibold text-app-text">Sektor Rotation</h3>
        <p className="text-xs text-app-muted mt-1">
          Trend Scores und Momentum über Sektoren
        </p>
      </div>

      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis
              dataKey="name"
              stroke="currentColor"
              style={{ fontSize: '12px' }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              stroke="currentColor"
              style={{ fontSize: '12px' }}
              domain={[0, 100]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '4px',
              }}
              formatter={(value: any) => {
                if (typeof value === 'number') {
                  return value.toFixed(2);
                }
                return value;
              }}
              labelFormatter={(label) => `${label}`}
              cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
            />
            <Legend />
            <Bar dataKey="trendScore" fill="#2196F3" name="Trend Score" radius={[4, 4, 0, 0]} />
            <Bar dataKey="momentum" fill="#FF9800" name="Momentum" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-64 bg-app-bg rounded">
          <p className="text-app-muted">Keine Sektor Daten verfügbar</p>
        </div>
      )}

      {/* Details */}
      <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
        {chartData.map((sector) => (
          <div
            key={sector.name}
            className="flex items-center justify-between bg-app-bg rounded p-3 border border-app-border"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor: getLeadershipColor(sector.leadership),
                }}
              />
              <div>
                <p className="font-semibold text-app-text">{sector.name}</p>
                <p className="text-xs text-app-muted">
                  {sector.assetCount} Assets • Leadership: {sector.leadership}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-app-text">{sector.trendScore}</p>
              <p className="text-xs text-app-muted">
                {sector.return30d > 0 ? '+' : ''}{sector.return30d}%
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-app-muted">Strong Leadership</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-yellow-500" />
          <span className="text-app-muted">Moderate</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500" />
          <span className="text-app-muted">Weak</span>
        </div>
      </div>
    </div>
  );
};
