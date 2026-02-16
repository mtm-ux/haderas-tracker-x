import React from 'react';
import { DeepResearchItem } from '@/types';

interface Props {
  item: DeepResearchItem;
  onChange: (config: DeepResearchItem['backtestConfig']) => void;
}

export const BacktestModule: React.FC<Props> = ({ item, onChange }) => {
  const config = item.backtestConfig ?? {
    description: '',
    startDate: '',
    endDate: '',
    notes: '',
  };

  return (
    <div className="h-full flex flex-col text-xs">
      <div className="mb-2 text-app-muted">
        📈 Backtest-Mockup – Verhalten deiner Strategie in der Vergangenheit (Konzept)
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <input
          type="text"
          placeholder="Strategie-Beschreibung"
          value={config.description}
          onChange={(e) => onChange({ ...config, description: e.target.value })}
          className="col-span-2 bg-app-bg border border-app-border rounded px-2 py-1 text-xs text-app-text placeholder-app-muted focus:outline-none focus:border-primary-500"
        />
        <input
          type="date"
          value={config.startDate}
          onChange={(e) => onChange({ ...config, startDate: e.target.value })}
          className="bg-app-bg border border-app-border rounded px-2 py-1 text-xs text-app-text placeholder-app-muted focus:outline-none focus:border-primary-500"
        />
        <input
          type="date"
          value={config.endDate}
          onChange={(e) => onChange({ ...config, endDate: e.target.value })}
          className="bg-app-bg border border-app-border rounded px-2 py-1 text-xs text-app-text placeholder-app-muted focus:outline-none focus:border-primary-500"
        />
        <textarea
          placeholder="Annahmen, Regeln, Risikoparameter..."
          value={config.notes}
          onChange={(e) => onChange({ ...config, notes: e.target.value })}
          className="col-span-2 bg-app-bg border border-app-border rounded px-2 py-1 text-xs text-app-text placeholder-app-muted focus:outline-none focus:border-primary-500 min-h-[80px] resize-none"
        />
      </div>

      {/* Einfaches Chart-Mockup */}
      <div className="flex-1 min-h-[120px] border border-app-border rounded-lg bg-gradient-to-tr from-emerald-500/10 via-primary-500/10 to-red-500/10 relative overflow-hidden">
        <div className="absolute inset-3 flex items-end gap-2">
          {Array.from({ length: 16 }).map((_, idx) => (
            <div
              key={idx}
              className="flex-1 bg-primary-500/40 rounded-t"
              style={{ height: `${40 + Math.sin(idx / 2) * 20 + idx}%` }}
            />
          ))}
        </div>
        <div className="absolute left-2 top-2 text-[10px] text-app-muted">
          Simulierter Equity-Verlauf (Mock)
        </div>
      </div>
    </div>
  );
};

