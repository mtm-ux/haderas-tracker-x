import React, { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickData } from 'lightweight-charts';
import { Card } from '@/components/common/Card';
import { Loader } from '@/components/common/Loader';
import { useStore } from '@/store';
import { useChartData } from '@/hooks/useChartData';
import { TimeInterval } from '@/types';

const intervals: { value: TimeInterval; label: string }[] = [
  { value: '5m', label: '5m' },
  { value: '15m', label: '15m' },
  { value: '1h', label: '1h' },
  { value: '4h', label: '4h' },
  { value: '1d', label: '1D' },
  { value: '1w', label: '1W' },
  { value: 'all', label: 'All' },
];

export const ChartWidget: React.FC = () => {
  const { selectedAsset, isDarkMode } = useStore();
  const [interval, setInterval] = useState<TimeInterval>('1d');
  const { candles, isLoading, isHistoryLoading, error, loadMore } = useChartData(selectedAsset, interval);

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);

  // Track chart instance for dependency effects
  const [chartInstance, setChartInstance] = useState<number>(0);

  // Refs for pagination to avoid closure staleness
  const candlesRef = useRef(candles);
  const loadMoreRef = useRef(loadMore);

  useEffect(() => {
    candlesRef.current = candles;
    loadMoreRef.current = loadMore;
  }, [candles, loadMore]);

  // Initialize/Re-initialize Chart Instance
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      layout: {
        background: { color: isDarkMode ? '#131722' : '#ffffff' },
        textColor: isDarkMode ? '#d1d4dc' : '#1e293b',
      },
      grid: {
        vertLines: { color: isDarkMode ? '#1e222d' : '#f1f5f9' },
        horzLines: { color: isDarkMode ? '#1e222d' : '#f1f5f9' },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: isDarkMode ? '#1e222d' : '#e2e8f0',
      },
      timeScale: {
        borderColor: isDarkMode ? '#1e222d' : '#e2e8f0',
        timeVisible: true,
      },
    });

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderUpColor: '#26a69a',
      borderDownColor: '#ef5350',
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    chartRef.current = chart;
    seriesRef.current = candlestickSeries;

    // Trigger data re-population and subscription
    setChartInstance(prev => prev + 1);

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (chartRef.current) {
          chartRef.current.applyOptions({
            width: entry.contentRect.width,
            height: entry.contentRect.height,
          });
        }
      }
    });
    resizeObserver.observe(chartContainerRef.current);

    return () => {
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
        seriesRef.current = null;
      }
    };
  }, [isDarkMode]);

  // Update Data & Subscriptions whenever chart instance or data changes
  useEffect(() => {
    if (!seriesRef.current || !chartRef.current || candles.length === 0) return;

    const data: CandlestickData[] = candles.map((candle) => ({
      time: (candle.time / 1000) as any,
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
    }));

    seriesRef.current.setData(data);

    // Initial fit content on fresh data load
    if (candles.length <= 500) {
      chartRef.current.timeScale().fitContent();
    }

    // Handle Pagination Subscription
    const handleVisibleRangeChange = (range: any) => {
      if (!range || !candlesRef.current.length) return;
      const firstCandleTime = candlesRef.current[0].time / 1000;
      if (range.from < firstCandleTime) {
        loadMoreRef.current();
      }
    };

    chartRef.current.timeScale().subscribeVisibleTimeRangeChange(handleVisibleRangeChange);

    return () => {
      if (chartRef.current) {
        chartRef.current.timeScale().unsubscribeVisibleTimeRangeChange(handleVisibleRangeChange);
      }
    };
  }, [candles, chartInstance]); // Important: runs whenever candles change OR chart is recreated

  if (!selectedAsset) {
    return (
      <Card title="Chart" className="h-full">
        <div className="flex items-center justify-center h-full">
          <p className="text-app-muted text-sm">
            Wähle ein Asset aus, um den Chart anzuzeigen
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
        <div className="flex items-center gap-1">
          {intervals.map((int) => (
            <button
              key={int.value}
              onClick={() => setInterval(int.value)}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${interval === int.value
                ? 'bg-primary-500 text-white'
                : 'text-app-muted hover:text-app-text hover:bg-app-bg'
                }`}
            >
              {int.label}
            </button>
          ))}
        </div>
      }
    >
      <div className="relative flex-1 min-h-[300px]">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-app-surface/50 z-10">
            <Loader size="lg" />
          </div>
        )}

        {isHistoryLoading && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-primary-500/80 text-white text-[10px] px-2 py-0.5 rounded-full z-10 animate-pulse">
            Lade Historie...
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-app-surface z-20 p-4">
            <div className="text-center">
              <p className="text-danger text-sm font-medium mb-2">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="text-xs text-primary-400 hover:underline"
              >
                Seite neu laden
              </button>
            </div>
          </div>
        )}

        {!isLoading && !error && candles.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-app-surface z-10">
            <p className="text-app-muted text-sm">Keine Daten für diesen Zeitraum verfügbar</p>
          </div>
        )}

        <div ref={chartContainerRef} className="w-full h-full" />
      </div>
    </Card>
  );
};
