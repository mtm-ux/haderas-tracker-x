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
import { CountryMomentum } from '@/lib/trends/types';

interface CountryMomentumChartProps {
  data: CountryMomentum[];
}

export const CountryMomentumChart: React.FC<CountryMomentumChartProps> = ({ data }) => {
  const chartData = useMemo(() => {
    return data.slice(0, 12).map((country) => ({
      name: country.country,
      code: country.code,
      score: Math.round(country.score),
      momentum: Math.round(country.momentum),
      avgReturn30d: Math.round(country.averageReturn30d * 100) / 100,
      geoRisk: country.geopoliticalRisk ? Math.round(country.geopoliticalRisk) : 0,
      assetCount: country.assetsCount,
    }));
  }, [data]);

  const getRiskColor = (risk: number): string => {
    if (risk >= 75) return '#F44336'; // high risk - red
    if (risk >= 50) return '#FF9800'; // medium risk - orange
    if (risk >= 25) return '#FFC107'; // moderate risk - yellow
    return '#4CAF50'; // low risk - green
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-lg font-semibold text-app-text">Länder Momentum</h3>
        <p className="text-xs text-app-muted mt-1">
          Top Länder nach Trend Score und geopolitischem Risiko
        </p>
      </div>

      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis
              dataKey="code"
              stroke="currentColor"
              style={{ fontSize: '12px' }}
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
            <Bar dataKey="score" fill="#00BCD4" name="Trend Score" radius={[4, 4, 0, 0]} />
            <Bar dataKey="momentum" fill="#4CAF50" name="Momentum" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-64 bg-app-bg rounded">
          <p className="text-app-muted">Keine Länder Daten verfügbar</p>
        </div>
      )}

      {/* Rankings */}
      <div className="grid grid-cols-1 gap-2 max-h-80 overflow-y-auto">
        {chartData.map((country, index) => (
          <div
            key={country.code}
            className="flex items-center justify-between bg-app-bg rounded p-3 border border-app-border hover:border-app-primary/50 transition-colors"
          >
            <div className="flex items-center gap-3 flex-1">
              <div className="w-6 h-6 flex items-center justify-center bg-app-primary/20 rounded font-semibold text-sm text-app-primary">
                {index + 1}
              </div>
              <div>
                <p className="font-semibold text-app-text">{country.name}</p>
                <p className="text-xs text-app-muted">{country.assetCount} Assets</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-semibold text-app-text">{country.score}</p>
                <p className="text-xs text-app-muted">Trend Score</p>
              </div>

              <div className="text-right">
                <p className={`font-semibold ${country.momentum >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {country.momentum >= 0 ? '+' : ''}{country.momentum}
                </p>
                <p className="text-xs text-app-muted">Momentum</p>
              </div>

              <div
                className="w-8 h-8 rounded flex items-center justify-center text-white text-xs font-bold"
                style={{ backgroundColor: getRiskColor(country.geoRisk) }}
                title={`Geopolitical Risk: ${country.geoRisk}%`}
              >
                {country.geoRisk}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Risk Legend */}
      <div className="flex flex-wrap gap-4 text-xs border-t border-app-border pt-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: '#F44336' }} />
          <span className="text-app-muted">Hohes Risiko (75+)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: '#FF9800' }} />
          <span className="text-app-muted">Mittleres Risiko (50-75)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: '#FFC107' }} />
          <span className="text-app-muted">Moderates Risiko (25-50)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: '#4CAF50' }} />
          <span className="text-app-muted">Niedriges Risiko (&lt;25)</span>
        </div>
      </div>
    </div>
  );
};
