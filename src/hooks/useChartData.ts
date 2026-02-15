import { useEffect, useState, useCallback, useRef } from 'react';
import { Asset, CandleData, TimeInterval } from '@/types';
import { marketService } from '@/services/marketService';

/**
 * Hook für Chart-Daten mit Lazy Loading beim Intervall-Wechsel und Pagination
 */
export const useChartData = (asset: Asset | null, interval: TimeInterval) => {
  const [candles, setCandles] = useState<CandleData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use a ref to store current candles for the pagination logic without triggering dependency changes
  const candlesRef = useRef<CandleData[]>([]);
  useEffect(() => {
    candlesRef.current = candles;
  }, [candles]);

  const fetchCandles = useCallback(async (isInitial: boolean = true) => {
    if (!asset) return;

    if (isInitial) {
      setIsLoading(true);
      setError(null);
    } else {
      setIsHistoryLoading(true);
    }

    try {
      // Use ref to get the earliest candle time for pagination
      const currentCandles = candlesRef.current;
      const endTime = isInitial ? undefined : (currentCandles.length > 0 ? currentCandles[0].time - 1 : undefined);

      const data = await marketService.getCandles(asset, interval, endTime);

      if (data.length === 0 && !isInitial) {
        // No more historical data, stop trying to load more
        setIsHistoryLoading(false);
        return;
      }

      setCandles(prev => {
        if (isInitial) return data;

        // Merge and sort, ensuring no duplicates
        const existingIds = new Set(prev.map(c => c.time));
        const uniqueNewData = data.filter(c => !existingIds.has(c.time));

        if (uniqueNewData.length === 0) return prev;

        const combined = [...uniqueNewData, ...prev];
        return combined.sort((a, b) => a.time - b.time);
      });
    } catch (err) {
      if (isInitial) {
        setError('Fehler beim Laden der Chart-Daten');
      }
      console.error('Candles fetch error:', err);
    } finally {
      if (isInitial) {
        setIsLoading(false);
      } else {
        setIsHistoryLoading(false);
      }
    }
  }, [asset?.id, interval]); // No longer depends on candles.length

  useEffect(() => {
    if (!asset) {
      setCandles([]);
      return;
    }

    // Reset and fetch initial
    setCandles([]);
    fetchCandles(true);
  }, [asset?.id, interval, fetchCandles]); // Now correctly includes fetchCandles

  const loadMore = useCallback(() => {
    if (isLoading || isHistoryLoading) return;
    fetchCandles(false);
  }, [fetchCandles, isLoading, isHistoryLoading]);

  return { candles, isLoading, isHistoryLoading, error, loadMore };
};
