import { ApiClient } from './apiClient';
import { PriceData, CandleData, SearchResult } from '@/types';

class CoinGeckoService {
  private client: ApiClient;

  constructor() {
    this.client = new ApiClient('https://api.coingecko.com/api/v3');
  }

  setStatusCallback(callback: (status: 'connected' | 'connecting' | 'error') => void): void {
    this.client.setStatusCallback(callback);
  }

  /**
   * Sucht nach Crypto-Assets
   */
  async search(query: string): Promise<SearchResult[]> {
    try {
      const response = await this.client.get<{ coins: any[] }>('/search', {
        params: { query },
      });

      if (!response || !response.coins) return [];

      return response.coins.slice(0, 10).map((coin: any) => ({
        id: coin.id,
        symbol: coin.symbol?.toUpperCase() || 'UNKNOWN',
        name: coin.name || 'Unknown',
        type: 'crypto' as const,
        marketCap: coin.market_cap_rank,
      }));
    } catch (error) {
      console.error('CoinGecko search error:', error);
      return [];
    }
  }

  /**
   * Holt aktuelle Preis-Daten für ein Asset
   */
  async getPrice(coinId: string): Promise<PriceData | null> {
    try {
      const response = await this.client.get<any>(`/coins/${coinId}`, {
        params: {
          localization: false,
          tickers: false,
          market_data: true,
          community_data: false,
          developer_data: false,
        },
      });

      if (!response || !response.market_data) {
        return null;
      }

      const marketData = response.market_data;

      return {
        symbol: (response.symbol || '').toUpperCase(),
        price: marketData.current_price?.usd || 0,
        change24h: marketData.price_change_24h || 0,
        changePercent24h: marketData.price_change_percentage_24h || 0,
        marketCap: marketData.market_cap?.usd,
        volume24h: marketData.total_volume?.usd,
        high24h: marketData.high_24h?.usd,
        low24h: marketData.low_24h?.usd,
        lastUpdate: Date.now(),
      };
    } catch (error) {
      console.error('CoinGecko price error:', error);
      return null;
    }
  }

  /**
   * Holt historische Kerzen-Daten
   */
  async getCandles(
    coinId: string,
    days: number = 1
  ): Promise<CandleData[]> {
    try {
      const response = await this.client.get<{ prices: number[][] }>(
        `/coins/${coinId}/market_chart`,
        {
          params: {
            vs_currency: 'usd',
            days: days,
            interval: days <= 1 ? 'hourly' : 'daily',
          },
        }
      );

      const prices = response?.prices;
      if (!prices || prices.length === 0) return [];

      const intervalMs = days <= 1 ? 3600000 : 86400000; // 1h oder 1d

      const candleMap = new Map<number, CandleData>();

      for (const [timestamp, price] of prices) {
        if (timestamp === undefined || price === undefined) continue;
        const roundedTime = Math.floor(timestamp / intervalMs) * intervalMs;

        const existing = candleMap.get(roundedTime);
        if (!existing) {
          candleMap.set(roundedTime, {
            time: roundedTime,
            open: price,
            high: price,
            low: price,
            close: price,
          });
        } else {
          existing.high = Math.max(existing.high, price);
          existing.low = Math.min(existing.low, price);
          existing.close = price;
        }
      }

      return Array.from(candleMap.values()).sort((a, b) => a.time - b.time);
    } catch (error) {
      console.error('CoinGecko candles error:', error);
      return [];
    }
  }

  /**
   * Holt die Top Crypto-Assets nach Market Cap
   */
  async getTopCoins(limit: number = 50): Promise<SearchResult[]> {
    try {
      const response = await this.client.get<any[]>('/coins/markets', {
        params: {
          vs_currency: 'usd',
          order: 'market_cap_desc',
          per_page: limit,
          page: 1,
        },
      });

      if (!response || !Array.isArray(response)) return [];

      return response.map((coin: any) => ({
        id: coin.id,
        symbol: (coin.symbol || '').toUpperCase(),
        name: coin.name || 'Unknown',
        type: 'crypto' as const,
        marketCap: coin.market_cap,
        price: coin.current_price,
      }));
    } catch (error) {
      console.error('CoinGecko top coins error:', error);
      return [];
    }
  }
}

export const coinGeckoService = new CoinGeckoService();
