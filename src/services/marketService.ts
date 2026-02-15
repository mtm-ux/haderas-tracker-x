import { coinGeckoService } from './coinGeckoService';
import { finnhubService } from './finnhubService';
import { binanceService } from './binanceService';
import { cryptoPanicService } from './cryptoPanicService';
import { Asset, PriceData, CandleData, SearchResult, NewsItem, TimeInterval } from '@/types';

class MarketService {
  /**
   * Sucht nach Assets (Crypto & Stocks)
   */
  async search(query: string): Promise<SearchResult[]> {
    const [cryptoResults, stockResults] = await Promise.all([
      coinGeckoService.search(query),
      finnhubService.search(query),
    ]);

    return [...cryptoResults, ...stockResults];
  }

  /**
   * Holt Preis-Daten für ein Asset
   */
  async getPrice(asset: Asset): Promise<PriceData | null> {
    if (asset.type === 'crypto') {
      return coinGeckoService.getPrice(asset.id);
    } else {
      return finnhubService.getPrice(asset.symbol);
    }
  }

  /**
   * Holt Kerzen-Daten für ein Asset
   */
  async getCandles(asset: Asset, interval: TimeInterval, endTime?: number): Promise<CandleData[]> {
    if (asset.type === 'crypto') {
      const binanceData = await binanceService.getCandles(asset, interval, endTime);

      // Fallback zu CoinGecko wenn Binance keine Daten hat (z.B. für Tokenized Stocks)
      if (binanceData.length === 0 && !endTime) {
        const daysMap: Record<TimeInterval, number> = {
          '1m': 1,
          '5m': 1,
          '15m': 3,
          '30m': 7,
          '1h': 14,
          '4h': 30,
          '1d': 365,
          '1w': 1095,
          '1M': 3650,
          'all': 3650,
        };
        return coinGeckoService.getCandles(asset.id, daysMap[interval] || 30);
      }

      return binanceData;
    } else {
      const resolution = finnhubService.getResolution(interval);
      const daysBack = finnhubService.getDaysBack(interval);
      return finnhubService.getCandles(asset.symbol, resolution, daysBack, endTime);
    }
  }

  /**
   * Holt News für ein Asset
   */
  async getNews(asset: Asset): Promise<NewsItem[]> {
    try {
      if (asset.type === 'crypto') {
        const cryptoNews = await cryptoPanicService.getNews([asset.symbol.toLowerCase()]);

        // Smarter Fallback: Wenn Crypto-News leer sind und es wie ein Stock-Ticker aussieht (z.B. tokenized Stocks)
        if (cryptoNews.length === 0 && asset.symbol.length <= 5) {
          const stockNews = await finnhubService.getNews(asset.symbol);
          if (stockNews.length > 0) return stockNews;
        }

        return cryptoNews;
      } else {
        return finnhubService.getNews(asset.symbol);
      }
    } catch (error) {
      console.error('MarketService news error:', error);
      return [];
    }
  }

  /**
   * Holt Top-Assets
   */
  async getTopAssets(limit: number = 50): Promise<SearchResult[]> {
    return coinGeckoService.getTopCoins(limit);
  }


  /**
   * Setzt Status-Callbacks für alle Services
   */
  setStatusCallbacks(callbacks: {
    coinGecko: (status: 'connected' | 'connecting' | 'error') => void;
    finnhub: (status: 'connected' | 'connecting' | 'error') => void;
    binance: (status: 'connected' | 'connecting' | 'error') => void;
    cryptoPanic: (status: 'connected' | 'connecting' | 'error') => void;
  }): void {
    coinGeckoService.setStatusCallback(callbacks.coinGecko);
    finnhubService.setStatusCallback(callbacks.finnhub);
    binanceService.setStatusCallback(callbacks.binance);
    cryptoPanicService.setStatusCallback(callbacks.cryptoPanic);
  }
}

export const marketService = new MarketService();
