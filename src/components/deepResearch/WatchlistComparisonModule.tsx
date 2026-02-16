import React, { useMemo } from 'react';
import { DeepResearchItem, Watchlist } from '@/types';
import { useStore } from '@/store';

interface Props {
  item: DeepResearchItem;
}

export const WatchlistComparisonModule: React.FC<Props> = ({ item }) => {
  const { watchlists } = useStore();

  const peers = useMemo(() => {
    const activeWatchlist: Watchlist | undefined = watchlists[0];
    if (!activeWatchlist) return [];
    const others = activeWatchlist.assets.filter((a) => a.id !== item.asset.id);
    return others.slice(0, 5);
  }, [watchlists, item.asset.id]);

  return (
    <div className="h-full flex flex-col text-xs">
      <div className="mb-2 text-app-muted">
        📊 Watchlist-Vergleich – aktuelles Asset vs. 3–5 Peers (Mockup)
      </div>
      {peers.length === 0 ? (
        <p className="text-app-muted">
          Füge der aktiven Watchlist weitere Assets hinzu, um Vergleiche zu sehen.
        </p>
      ) : (
        <div className="overflow-x-auto border border-app-border rounded-lg bg-app-bg/60">
          <table className="min-w-full text-[11px]">
            <thead className="bg-app-surface">
              <tr>
                <th className="px-2 py-1 text-left font-semibold text-app-muted">Ticker</th>
                <th className="px-2 py-1 text-left font-semibold text-app-muted">Typ</th>
                <th className="px-2 py-1 text-left font-semibold text-app-muted">KGV (Mock)</th>
                <th className="px-2 py-1 text-left font-semibold text-app-muted">Umsatzw. (Mock)</th>
                <th className="px-2 py-1 text-left font-semibold text-app-muted">Marge (Mock)</th>
              </tr>
            </thead>
            <tbody>
              {[item.asset, ...peers].map((asset, idx) => (
                <tr key={asset.id} className={idx === 0 ? 'bg-primary-500/10' : ''}>
                  <td className="px-2 py-1 whitespace-nowrap font-semibold text-app-text">
                    {asset.symbol}
                  </td>
                  <td className="px-2 py-1 text-app-muted">
                    {asset.type === 'crypto' ? 'Crypto' : 'Aktie'}
                  </td>
                  <td className="px-2 py-1">
                    {15 + idx * 3}
                  </td>
                  <td className="px-2 py-1">
                    {10 + idx * 2}%
                  </td>
                  <td className="px-2 py-1">
                    {20 + idx * 4}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

