import { useEffect, useState } from 'react';
import { Asset, PriceData } from '@/types';
import { marketService } from '@/services/marketService';
import { useStore } from '@/store';

/**
 * Hook für Live-Preis-Updates mit automatischer Aktualisierung
 */
export const useLivePrice = (asset: Asset | null, intervalMs: number = 30000) => {
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setPriceData: cachePrice, getPriceData } = useStore();

  useEffect(() => {
    if (!asset) {
      setPriceData(null);
      return;
    }

    // Reset state for new asset
    setPriceData(null);
    setError(null);

    // Prüfe Cache zuerst
    const cached = getPriceData(asset.id);
    if (cached && Date.now() - cached.lastUpdate < intervalMs) {
      setPriceData(cached);
    }

    let isMounted = true;

    const fetchPrice = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await marketService.getPrice(asset);
        if (isMounted && data) {
          setPriceData(data);
          cachePrice(asset.id, data);
        }
      } catch (err) {
        if (isMounted) {
          setError('Fehler beim Laden der Preis-Daten');
          console.error('Price fetch error:', err);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    // Initial fetch
    fetchPrice();

    // Setup interval
    const interval = setInterval(fetchPrice, intervalMs);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [asset?.id, intervalMs]);

  return { priceData, isLoading, error };
};
