import React, { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickData } from 'lightweight-charts';
import { Card } from '@/components/common/Card';
import { Loader } from '@/components/common/Loader';
import { useStore } from '@/store';
import { useChartData } from '@/hooks/useChartData';
import { TimeInterval } from '@/types';
import { TradingViewWidget } from './TradingViewWidget';
import { ChevronDown, BarChart2, Globe } from 'lucide-react';

const mainIntervals: { value: TimeInterval; label: string }[] = [
  { value: '1h', label: '1H' },
  { value: '4h', label: '4H' },
  { value: '1d', label: '1D' },
  { value: '1w', label: '1W' },
];

const extraIntervals: { value: TimeInterval; label: string }[] = [
  { value: '1m', label: '1m' },
  { value: '5m', label: '5m' },
  { value: '15m', label: '15m' },
  { value: '30m', label: '30m' },
  { value: '1M', label: '1M' },
  { value: 'all', label: 'Alle' },
];

export const ChartWidget: React.FC = () => {
  const { selectedAsset, isDarkMode } = useStore();
  const [interval, setInterval] = useState<TimeInterval>('1d');
  const [chartType, setChartType] = useState<'custom' | 'tradingview'>('custom');
  const [showIntervalMenu, setShowIntervalMenu] = useState(false);

  const { candles, isLoading, isHistoryLoading, error, loadMore } = useChartData(selectedAsset, interval);

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const [chartInstance, setChartInstance] = useState<number>(0);

  const candlesRef = useRef(candles);
  const loadMoreRef = useRef(loadMore);

  useEffect(() => {
    candlesRef.current = candles;
    loadMoreRef.current = loadMore;
  }, [candles, loadMore]);

  // Ensure chart type is appropriate for the asset
  useEffect(() => {
    if (selectedAsset?.type === 'stock') {
      setChartType('tradingview');
    } else {
      setChartType('custom');
    }
  }, [selectedAsset?.id]); // Only run when the asset actually changes

  // Initialize/Re-initialize Chart Instance
  useEffect(() => {
    if (!chartContainerRef.current || chartType !== 'custom') return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      layout: {
        background: { color: isDarkMode ? '#131722' : '#ffffff' },
        textColor: isDarkMode ? '#A0AEC0' : '#4A5568',
      },
      grid: {
        vertLines: { color: isDarkMode ? 'rgba(42, 46, 57, 0.5)' : '#EDF2F7' },
        horzLines: { color: isDarkMode ? 'rgba(42, 46, 57, 0.5)' : '#EDF2F7' },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: isDarkMode ? '#2D3748' : '#E2E8F0',
      },
      timeScale: {
        borderColor: isDarkMode ? '#2D3748' : '#E2E8F0',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderUpColor: '#22c55e',
      borderDownColor: '#ef4444',
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    });

    chartRef.current = chart;
    seriesRef.current = candlestickSeries;
    setChartInstance(prev => prev + 1);

    const handleVisibleRangeChange = (range: any) => {
      if (!range || !candlesRef.current.length) return;
      const timeScale = chart.timeScale();
      const visibleRange = timeScale.getVisibleRange();
      if (!visibleRange) return;

      const firstCandleTime = candlesRef.current[0].time / 1000;
      // Triggere Nachladen wenn der Benutzer nah am linken Rand ist
      if ((visibleRange.from as unknown as number) < firstCandleTime + (60 * 60 * 24)) { // 1 Tag Puffer
        loadMoreRef.current();
      }
    };

    chart.timeScale().subscribeVisibleTimeRangeChange(handleVisibleRangeChange);

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        chart.applyOptions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    resizeObserver.observe(chartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [isDarkMode, chartType]);

  // Update Data
  useEffect(() => {
    if (!seriesRef.current || !chartRef.current || candles.length === 0 || chartType !== 'custom') return;

    const data: CandlestickData[] = candles.map((candle) => ({
      time: (candle.time / 1000) as any,
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
    }));

    seriesRef.current.setData(data);

    if (candles.length <= 100) {
      chartRef.current.timeScale().fitContent();
    }
  }, [candles, chartInstance, chartType]);

  if (!selectedAsset) {
    return (
      <Card title="Markt Analyse" className="h-full">
        <div className="flex flex-col items-center justify-center h-full gap-4">
          <BarChart2 className="w-12 h-12 text-app-muted opacity-20" />
          <p className="text-app-muted text-sm px-6 text-center">
            Wähle ein Asset aus der Sidebar aus, um Live-Charts und historische Daten zu visualisieren.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card
      title={`${selectedAsset.symbol} - ${selectedAsset.name}`}
      className="h-full flex flex-col"
      noPadding
      action={
        <div className="flex items-center gap-2">
          {/* Chart Type Toggle */}
          <div className="flex items-center bg-app-bg rounded-lg p-0.5 mr-2">
            <button
              onClick={() => setChartType('custom')}
              className={`px-2 py-1 text-[10px] rounded transition-all ${chartType === 'custom' ? 'bg-primary-500 text-white shadow-sm' : 'text-app-muted hover:text-app-text'}`}
              title="Einfacher Chart"
            >
              Basics
            </button>
            <button
              onClick={() => setChartType('tradingview')}
              className={`px-2 py-1 text-[10px] rounded transition-all ${chartType === 'tradingview' ? 'bg-primary-500 text-white shadow-sm' : 'text-app-muted hover:text-app-text'}`}
              title="TradingView Pro"
            >
              Pro
            </button>
          </div>

          {/* Intervals */}
          {chartType === 'custom' && (
            <div className="flex items-center gap-1">
              {mainIntervals.map((int) => (
                <button
                  key={int.value}
                  onClick={() => setInterval(int.value)}
                  className={`px-2 py-1 text-xs font-medium rounded transition-colors ${interval === int.value
                    ? 'bg-primary-500/20 text-primary-400'
                    : 'text-app-muted hover:text-app-text hover:bg-app-bg'
                    }`}
                >
                  {int.label}
                </button>
              ))}

              <div className="relative">
                <button
                  onClick={() => setShowIntervalMenu(!showIntervalMenu)}
                  className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded transition-colors ${extraIntervals.some(i => i.value === interval)
                    ? 'bg-primary-500/20 text-primary-400'
                    : 'text-app-muted hover:text-app-text hover:bg-app-bg'
                    }`}
                >
                  {extraIntervals.find(i => i.value === interval)?.label || 'Mehr'}
                  <ChevronDown className={`w-3 h-3 transition-transform ${showIntervalMenu ? 'rotate-180' : ''}`} />
                </button>

                {showIntervalMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowIntervalMenu(false)} />
                    <div className="absolute top-full right-0 mt-1 w-24 bg-app-surface border border-app-border rounded-lg shadow-xl z-50 py-1">
                      {extraIntervals.map((int) => (
                        <button
                          key={int.value}
                          onClick={() => {
                            setInterval(int.value);
                            setShowIntervalMenu(false);
                          }}
                          className={`w-full px-3 py-1.5 text-left text-xs transition-colors ${interval === int.value ? 'bg-primary-500/10 text-primary-400' : 'text-app-text hover:bg-app-bg'
                            }`}
                        >
                          {int.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      }
    >
      <div className="relative flex-1 min-h-[400px]">
        {chartType === 'custom' ? (
          <>
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-app-surface/50 z-10 backdrop-blur-[1px]">
                <Loader size="lg" />
              </div>
            )}

            {isHistoryLoading && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-app-surface/90 border border-primary-500/30 text-primary-400 text-[10px] px-3 py-1 rounded-full z-10 shadow-lg flex items-center gap-2">
                <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
                Lade Historie...
              </div>
            )}

            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-app-surface/90 z-20 p-8 backdrop-blur-sm">
                <div className="text-center max-w-xs">
                  <Globe className="w-10 h-10 text-danger mx-auto mb-4 opacity-50" />
                  <p className="text-danger text-sm font-semibold mb-2">Finnhub Integration Fehler</p>
                  <p className="text-app-muted text-xs mb-4">
                    Aktiendaten konnten nicht geladen werden. Nutze den "Pro" Modus für TradingView Charts.
                  </p>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => setChartType('tradingview')}
                      className="px-4 py-2 bg-primary-500 text-white text-xs rounded-lg hover:bg-primary-600 transition-colors"
                    >
                      Zu TradingView (Pro) wechseln
                    </button>
                    <button
                      onClick={() => window.location.reload()}
                      className="text-[10px] text-app-muted hover:text-app-text underline transition-colors"
                    >
                      Seite neu laden
                    </button>
                  </div>
                </div>
              </div>
            )}

            {!isLoading && !error && candles.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-app-surface z-10">
                <div className="text-center">
                  <p className="text-app-muted text-sm mb-4">Keine Daten für diesen Zeitraum verfügbar</p>
                  <button
                    onClick={() => setChartType('tradingview')}
                    className="text-primary-400 text-xs hover:underline"
                  >
                    Alternative: TradingView Pro Chart
                  </button>
                </div>
              </div>
            )}

            <div ref={chartContainerRef} className="w-full h-full" />
          </>
        ) : (
          <TradingViewWidget
            symbol={selectedAsset.type === 'crypto' ? `BINANCE:${selectedAsset.symbol}USDT` : selectedAsset.symbol}
            theme={isDarkMode ? 'dark' : 'light'}
          />
        )}
      </div>
    </Card>
  );
};
