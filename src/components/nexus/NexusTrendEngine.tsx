import React, { useMemo, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { TrendAsset } from '@/types';
import { Card } from '@/components/common/Card';
import { ArrowUpDown, Filter, Activity, ScatterChart, Share2 } from 'lucide-react';

// Mock-Daten für Polymarket, Kalshi, Top-Aktien und Top-Kryptos
const mockAssets: TrendAsset[] = [
  {
    id: 'polymarket-fed-cut',
    name: 'Fed Rate Cut 2025',
    ticker: 'FEDCUT25',
    class: 'PREDICTION',
    category: 'Macro',
    subCategory: 'Rates',
    industryInterplay: ['US Banking', 'Growth Tech', 'High Yield Credit'],
    price: 0.64,
    volume_24h: 1_200_000,
    open_interest: 5_000_000,
    implied_probability: 0.64,
    rsi_14: 68,
    momentum_24h: 12,
    momentum_7d: 28,
    brier_score: 0.21,
    sentimentScore: 0.7,
    probabilityShift_24h: 0.08,
  },
  {
    id: 'kalshi-cpi-surprise',
    name: 'CPI Above 3% YoY',
    ticker: 'CPI3Y',
    class: 'PREDICTION',
    category: 'Macro',
    subCategory: 'Inflation',
    industryInterplay: ['Commodity Producers', 'REITs', 'Defensive Staples'],
    price: 0.42,
    volume_24h: 650_000,
    open_interest: 2_200_000,
    implied_probability: 0.42,
    rsi_14: 55,
    momentum_24h: 4,
    momentum_7d: 9,
    brier_score: 0.28,
    sentimentScore: 0.4,
    probabilityShift_24h: -0.03,
  },
  {
    id: 'stock-jpm',
    name: 'JPMorgan Chase & Co.',
    ticker: 'JPM',
    class: 'STOCK',
    category: 'Financials',
    subCategory: 'Banks',
    industryInterplay: ['Fed Rate Cut 2025', 'CPI Above 3% YoY'],
    price: 182.3,
    volume_24h: 18_500_000,
    open_interest: 0,
    implied_probability: undefined,
    rsi_14: 61,
    momentum_24h: 2.5,
    momentum_7d: 7.8,
    brier_score: undefined,
    sentimentScore: 0.55,
    probabilityShift_24h: 0.02,
  },
  {
    id: 'stock-msft',
    name: 'Microsoft Corp.',
    ticker: 'MSFT',
    class: 'STOCK',
    category: 'Information Technology',
    subCategory: 'Software',
    industryInterplay: ['AI Infrastructure', 'Cloud Spending', 'Election Outcome'],
    price: 415.2,
    volume_24h: 21_000_000,
    open_interest: 0,
    implied_probability: undefined,
    rsi_14: 73,
    momentum_24h: 3.2,
    momentum_7d: 11.4,
    brier_score: undefined,
    sentimentScore: 0.82,
    probabilityShift_24h: 0.01,
  },
  {
    id: 'crypto-eth',
    name: 'Ethereum',
    ticker: 'ETH',
    class: 'CRYPTO',
    category: 'LDACS: Smart Contracts',
    subCategory: 'Layer 1',
    industryInterplay: ['DeFi TVL', 'L2 Adoption', 'Real-World Assets'],
    price: 3350,
    volume_24h: 18_000_000_000,
    open_interest: 3_200_000_000,
    implied_probability: undefined,
    rsi_14: 66,
    momentum_24h: 5.5,
    momentum_7d: 19.3,
    brier_score: undefined,
    sentimentScore: 0.76,
    probabilityShift_24h: 0.0,
  },
  {
    id: 'crypto-aave',
    name: 'Aave',
    ticker: 'AAVE',
    class: 'CRYPTO',
    category: 'LDACS: DeFi',
    subCategory: 'Lending',
    industryInterplay: ['DeFi TVL', 'ETH Funding', 'Stablecoin Liquidity'],
    price: 142.7,
    volume_24h: 320_000_000,
    open_interest: 520_000_000,
    implied_probability: undefined,
    rsi_14: 59,
    momentum_24h: 7.1,
    momentum_7d: 23.2,
    brier_score: undefined,
    sentimentScore: 0.69,
    probabilityShift_24h: 0.01,
  },
];

function computeNexusScore(asset: TrendAsset): number {
  const volScore = Math.log10(asset.volume_24h + 1) / 6; // 0–~1
  const sentiment = asset.sentimentScore ?? 0.5;
  const probShift = Math.abs(asset.probabilityShift_24h ?? 0);

  return (
    0.4 * volScore +
    0.35 * sentiment +
    0.25 * Math.min(probShift * 5, 1) // starke Probability-Shifts stärker gewichten
  );
}

function formatNumber(n: number | undefined, digits = 2): string {
  if (n === undefined || Number.isNaN(n)) return '–';
  return n.toLocaleString(undefined, { maximumFractionDigits: digits });
}

function formatPercent(n: number | undefined, digits = 1): string {
  if (n === undefined || Number.isNaN(n)) return '–';
  return `${n.toFixed(digits)}%`;
}

export const NexusTrendEngine: React.FC = () => {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'nexusScore', desc: true }]);
  const [momentumFilter, setMomentumFilter] = useState(0);
  const [sectorFilter, setSectorFilter] = useState('');

  const enrichedData = useMemo(() => {
    return mockAssets.map((a) => ({
      ...a,
      nexusScore: computeNexusScore(a),
    }));
  }, []);

  const filteredData = useMemo(() => {
    return enrichedData.filter((asset) => {
      const passesMomentum = (asset.momentum_7d ?? 0) >= momentumFilter;
      const passesSector =
        !sectorFilter ||
        asset.category.toLowerCase().includes(sectorFilter.toLowerCase()) ||
        asset.subCategory.toLowerCase().includes(sectorFilter.toLowerCase());
      return passesMomentum && passesSector;
    });
  }, [enrichedData, momentumFilter, sectorFilter]);

  const columns = useMemo<ColumnDef<TrendAsset & { nexusScore: number }>[]>(
    () => [
      {
        id: 'asset',
        header: 'Asset',
        cell: ({ row }) => {
          const a = row.original;
          const badgeColor =
            a.class === 'STOCK'
              ? 'bg-blue-500/20 text-blue-300'
              : a.class === 'CRYPTO'
              ? 'bg-emerald-500/20 text-emerald-300'
              : 'bg-purple-500/20 text-purple-300';
          return (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-app-text">{a.ticker}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${badgeColor}`}>
                  {a.class}
                </span>
              </div>
              <span className="text-[11px] text-app-muted truncate">{a.name}</span>
            </div>
          );
        },
      },
      {
        accessorKey: 'category',
        header: 'Kategorie',
        cell: ({ row }) => {
          const a = row.original;
          return (
            <div className="flex items-center gap-2">
              <span className="text-xs text-app-text">{a.category}</span>
              <span className="text-[11px] text-app-muted">/ {a.subCategory}</span>
            </div>
          );
        },
      },
      {
        accessorKey: 'price',
        header: 'Preis',
        cell: ({ row }) => {
          const a = row.original;
          const isPrediction = a.class === 'PREDICTION';
          return (
            <div className="text-xs text-app-text">
              {isPrediction ? formatPercent((a.price ?? 0) * 100) : `$${formatNumber(a.price, 2)}`}
            </div>
          );
        },
      },
      {
        accessorKey: 'volume_24h',
        header: 'Vol. 24h',
        cell: ({ row }) => {
          const v = row.original.volume_24h;
          return (
            <div className="text-xs text-app-text">
              {v > 1_000_000_000
                ? `${(v / 1_000_000_000).toFixed(1)}B`
                : v > 1_000_000
                ? `${(v / 1_000_000).toFixed(1)}M`
                : formatNumber(v, 0)}
            </div>
          );
        },
      },
      {
        accessorKey: 'momentum_7d',
        header: 'Momentum 7d',
        cell: ({ row }) => (
          <div
            className={`text-xs ${
              (row.original.momentum_7d ?? 0) >= 0 ? 'text-success' : 'text-danger'
            }`}
          >
            {formatPercent(row.original.momentum_7d, 1)}
          </div>
        ),
      },
      {
        accessorKey: 'implied_probability',
        header: 'Impl. Prob.',
        cell: ({ row }) => (
          <div className="text-xs text-app-text">
            {row.original.implied_probability !== undefined
              ? formatPercent(row.original.implied_probability * 100, 1)
              : '–'}
          </div>
        ),
      },
      {
        accessorKey: 'nexusScore',
        header: 'NexusScore',
        cell: ({ row }) => {
          const score = row.original.nexusScore ?? 0;
          const color =
            score > 0.7 ? 'text-emerald-400' : score > 0.5 ? 'text-primary-300' : 'text-app-muted';
          return (
            <div className={`text-xs font-semibold ${color}`}>
              {(score * 100).toFixed(0)}
            </div>
          );
        },
      },
    ],
    [],
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const parentRef = React.useRef<HTMLDivElement | null>(null);
  const rowVirtualizer = useVirtualizer({
    count: table.getRowModel().rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 56,
    overscan: 5,
  });

  const rows = rowVirtualizer.getVirtualItems();

  // RRG: einfache Quadranten-Grafik auf Basis Momentum 7d (x) und RSI (y)
  const rrgPoints = filteredData.map((asset) => {
    const x = asset.momentum_7d ?? 0;
    const y = asset.rsi_14 ?? 50;
    return { asset, x, y };
  });

  // Sankey: Mock-Flow von Prediction Markets in GICS-Sektoren
  const sankeyFlows = [
    {
      source: 'Fed Rate Cut 2025',
      target: 'US Banking',
      value: 40,
    },
    {
      source: 'Fed Rate Cut 2025',
      target: 'Growth Tech',
      value: 25,
    },
    {
      source: 'CPI Above 3% YoY',
      target: 'REITs',
      value: 20,
    },
    {
      source: 'CPI Above 3% YoY',
      target: 'Staples',
      value: 15,
    },
  ];

  return (
    <div className="h-full overflow-y-auto p-3 md:p-6 space-y-4 md:space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary-400" />
            Nexus Trend Engine
          </h2>
          <p className="text-sm text-app-muted mt-1 max-w-2xl">
            Cross-Asset-Trend-Dashboard für Aktien, Krypto und Prediction Markets. Fokus auf
            Momentum, Rotationen und Interplays zwischen Makro-Events und Sektoren.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-2 md:items-center">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-app-muted" />
            <input
              type="number"
              value={momentumFilter}
              onChange={(e) => setMomentumFilter(Number(e.target.value) || 0)}
              className="w-20 bg-app-bg border border-app-border rounded px-2 py-1 text-xs text-app-text focus:outline-none focus:border-primary-500"
              placeholder="Momentum >"
            />
            <span className="text-[11px] text-app-muted">% 7d</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
              className="bg-app-bg border border-app-border rounded px-2 py-1 text-xs text-app-text placeholder-app-muted focus:outline-none focus:border-primary-500"
              placeholder="Filter GICS / LDACS..."
            />
          </div>
        </div>
      </div>

      {/* Trend-Matrix */}
      <Card
        title="Trend-Matrix"
        className="h-[340px] flex flex-col"
        action={
          <span className="text-[11px] text-app-muted flex items-center gap-1">
            <ArrowUpDown className="w-3 h-3" />
            Sortier- & filterbare TanStack Table mit Virtualisierung
          </span>
        }
      >
        <div className="flex-1 min-h-0 border border-app-border rounded-lg overflow-hidden bg-app-bg/60">
          <div className="grid grid-cols-[2fr_1.3fr_0.9fr_1fr_1fr_1fr_0.9fr] bg-app-surface text-[11px] text-app-muted border-b border-app-border">
            {table.getHeaderGroups().map((headerGroup) =>
              headerGroup.headers.map((header) => (
                <button
                  key={header.id}
                  className="flex items-center gap-1 px-3 py-2 border-r border-app-border last:border-r-0 hover:bg-app-bg/60"
                  onClick={header.column.getToggleSortingHandler()}
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              )),
            )}
          </div>
          <div ref={parentRef} className="h-[260px] overflow-y-auto">
            <div
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                position: 'relative',
              }}
            >
              {rows.map((virtualRow) => {
                const row = table.getRowModel().rows[virtualRow.index];
                return (
                  <div
                    key={row.id}
                    className="grid grid-cols-[2fr_1.3fr_0.9fr_1fr_1fr_1fr_0.9fr text-xs border-b border-app-border hover:bg-app-bg/60"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <div key={cell.id} className="px-3 py-2 border-r border-app-border last:border-r-0">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* RRG */}
        <Card
          title="Relative Rotation Graph (RRG)"
          className="h-[320px] flex flex-col"
          action={
            <span className="text-[11px] text-app-muted flex items-center gap-1">
              <ScatterChart className="w-3 h-3" />
              Momentum 7d (x) vs. RSI 14 (y)
            </span>
          }
        >
          <div className="flex-1 min-h-0 relative bg-app-bg/60 border border-app-border rounded-lg overflow-hidden">
            {/* Quadranten */}
            <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 pointer-events-none">
              <div className="border-r border-b border-app-border/60 bg-emerald-500/5" />
              <div className="border-b border-app-border/60 bg-primary-500/5" />
              <div className="border-r border-app-border/60 bg-yellow-500/5" />
              <div className="bg-red-500/5" />
            </div>
            {/* Labels */}
            <div className="absolute inset-2 text-[10px] text-app-muted pointer-events-none">
              <div className="flex justify-between">
                <span>Leading</span>
                <span>Improving</span>
              </div>
              <div className="flex justify-between mt-[45%]">
                <span>Lagging</span>
                <span>Weakening</span>
              </div>
            </div>
            {/* Punkte */}
            <div className="absolute inset-3">
              {rrgPoints.map(({ asset, x, y }) => {
                const normX = Math.max(-20, Math.min(30, x ?? 0));
                const normY = Math.max(20, Math.min(80, y ?? 50));
                const left = ((normX + 20) / 50) * 100;
                const bottom = ((normY - 20) / 60) * 100;

                const isPrediction = asset.class === 'PREDICTION';
                const color = isPrediction
                  ? 'bg-purple-400'
                  : asset.class === 'CRYPTO'
                  ? 'bg-emerald-400'
                  : 'bg-primary-400';

                return (
                  <div
                    key={asset.id}
                    className="absolute flex flex-col items-center"
                    style={{
                      left: `${left}%`,
                      bottom: `${bottom}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    <div className={`w-2.5 h-2.5 rounded-full shadow-md ${color}`} />
                    <span className="mt-1 text-[10px] text-app-muted">{asset.ticker}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Sankey Mock */}
        <Card
          title="Prediction → GICS-Flow (Sankey-Mockup)"
          className="h-[320px] flex flex-col"
          action={
            <span className="text-[11px] text-app-muted flex items-center gap-1">
              <Share2 className="w-3 h-3" />
              Volumen-Flüsse von Prediction Markets in Sektoren
            </span>
          }
        >
          <div className="flex-1 min-h-0 bg-app-bg/60 border border-app-border rounded-lg p-3 text-[11px] text-app-text">
            <div className="grid grid-cols-3 h-full gap-2">
              <div className="flex flex-col justify-between">
                {['Fed Rate Cut 2025', 'CPI Above 3% YoY'].map((src) => (
                  <div
                    key={src}
                    className="px-2 py-1 rounded bg-purple-500/20 text-purple-200 border border-purple-500/40"
                  >
                    {src}
                  </div>
                ))}
              </div>
              <div className="relative">
                {sankeyFlows.map((flow, idx) => (
                  <div
                    key={`${flow.source}-${flow.target}`}
                    className="absolute left-0 right-0 flex items-center"
                    style={{
                      top: `${10 + idx * 18}%`,
                    }}
                  >
                    <div
                      className="h-2 rounded-r-full bg-gradient-to-r from-purple-500/50 to-blue-400/60"
                      style={{ width: `${30 + flow.value}%` }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex flex-col justify-between items-end text-right">
                {['US Banking', 'Growth Tech', 'REITs', 'Staples'].map((tgt) => (
                  <div
                    key={tgt}
                    className="px-2 py-1 rounded bg-blue-500/20 text-blue-200 border border-blue-500/40"
                  >
                    {tgt}
                  </div>
                ))}
              </div>
            </div>
            <p className="mt-3 text-[10px] text-app-muted">
              Hinweis: Dies ist ein visuelles Mockup. Für echte Flows würdest du Volumen-Daten aus Polymarket,
              Kalshi & Co. mit sektorisierten Positionsdaten deiner Watchlist mappen.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

