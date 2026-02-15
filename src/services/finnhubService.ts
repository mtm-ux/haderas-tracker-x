import { ApiClient } from './apiClient';
import { PriceData, CandleData, SearchResult } from '@/types';

class FinnhubService {
  private client: ApiClient;
  private apiKey: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_FINNHUB_API_KEY || '';
    this.client = new ApiClient('https://finnhub.io/api/v1');
  }

  setStatusCallback(callback: (status: 'connected' | 'connecting' | 'error') => void): void {
    this.client.setStatusCallback(callback);
  }

  private getParams(): Record<string, string> {
    return { token: this.apiKey };
  }

  /**
   * Sucht nach Aktien
   */
  async search(query: string): Promise<SearchResult[]> {
    if (!this.apiKey || this.apiKey.includes('your_finnhub_api_key_here')) {
      console.warn('Finnhub API key not configured');
      return [];
    }

    try {
      const response = await this.client.get<{ result: any[] }>('/search', {
        params: {
          q: query,
          ...this.getParams(),
        },
      });

      if (!response || !response.result) return [];

      return response.result.slice(0, 10).map((stock: any) => ({
        id: stock.symbol || '',
        symbol: stock.symbol || '',
        name: stock.description || 'Unknown',
        type: 'stock' as const,
      }));
    } catch (error) {
      console.error('Finnhub search error:', error);
      return [];
    }
  }

  /**
   * Holt aktuelle Preis-Daten (Quote)
   */
  async getPrice(symbol: string): Promise<PriceData | null> {
    if (!this.apiKey || this.apiKey.includes('your_finnhub_api_key_here')) {
      console.warn('Finnhub API key not configured');
      return null;
    }

    try {
      const response = await this.client.get<any>('/quote', {
        params: {
          symbol: symbol,
          ...this.getParams(),
        },
      });

      if (!response || !response.c) {
        return null;
      }

      const current = response.c;
      const prevClose = response.pc || current;

      const change = current - prevClose;
      const changePercent = prevClose !== 0 ? (change / prevClose) * 100 : 0;

      return {
        symbol: symbol,
        price: current,
        change24h: change,
        changePercent24h: changePercent,
        high24h: response.h,
        low24h: response.l,
        volume24h: response.v,
        lastUpdate: Date.now(),
      };
    } catch (error) {
      console.error('Finnhub price error:', error);
      return null;
    }
  }

  /**
   * Holt Kerzen-Daten
   */
  async getCandles(
    symbol: string,
    resolution: string = 'D',
    daysBack: number = 30,
    endTime?: number
  ): Promise<CandleData[]> {
    if (!this.apiKey || this.apiKey.includes('your_finnhub_api_key_here')) {
      console.warn('Finnhub API key not configured');
      return [];
    }

    try {
      const to = endTime ? Math.floor(endTime / 1000) : Math.floor(Date.now() / 1000);
      const from = to - (daysBack * 86400);

      const response = await this.client.get<any>('/stock/candle', {
        params: {
          symbol: symbol,
          resolution: resolution,
          from: from,
          to: to,
          ...this.getParams(),
        },
      });

      if (!response || response.s !== 'ok' || !response.t) {
        // Fallback for weekend/closed market: if s is 'no_data', return empty but log it
        if (response?.s === 'no_data') {
          console.log(`Finnhub: No data for ${symbol} in range ${new Date(from * 1000).toLocaleDateString()} to ${new Date(to * 1000).toLocaleDateString()}`);
        }
        return [];
      }

      const candles: CandleData[] = [];
      for (let i = 0; i < response.t.length; i++) {
        candles.push({
          time: response.t[i] * 1000,
          open: response.o[i],
          high: response.h[i],
          low: response.l[i],
          close: response.c[i],
          volume: response.v[i],
        });
      }

      return candles;
    } catch (error) {
      console.error('Finnhub candles error:', error);
      return [];
    }
  }

  /**
   * Holt News für eine Aktie
   */
  async getNews(symbol: string): Promise<any[]> {
    if (!this.apiKey || this.apiKey.includes('your_finnhub_api_key_here')) {
      return [];
    }

    try {
      const to = new Date().toISOString().split('T')[0];
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - 30);
      const from = fromDate.toISOString().split('T')[0];

      const response = await this.client.get<any[]>('/company-news', {
        params: {
          symbol: symbol,
          from: from,
          to: to,
          ...this.getParams(),
        },
      });

      if (!response || !Array.isArray(response)) return [];

      return response.slice(0, 10).map((item: any) => ({
        id: (item.id || '').toString(),
        title: item.headline || 'No Title',
        url: item.url || '#',
        source: item.source || 'Unknown',
        publishedAt: new Date((item.datetime || Date.now() / 1000) * 1000).toISOString(),
        imageUrl: item.image,
      }));
    } catch (error) {
      console.error('Finnhub news error:', error);
      return [];
    }
  }

  /**
   * Konvertiert Zeitintervall zu Finnhub-Resolution
   * Supported: 1, 5, 15, 30, 60, D, W, M
   */
  getResolution(interval: string): string {
    const map: Record<string, string> = {
      '5m': '5',
      '15m': '15',
      '1h': '60',
      '4h': '60', // Fix: 240 is not supported, using 60m instead
      '1d': 'D',
      '1w': 'W',
      'all': 'M',
    };
    return map[interval] || 'D';
  }

  /**
   * Ermittelt die Anzahl der zurückliegenden Tage basierend auf Intervall
   */
  getDaysBack(interval: string): number {
    const map: Record<string, number> = {
      '5m': 4,   // Increased to bridge weekends
      '15m': 7,  // Increased to bridge weekends
      '1h': 14,
      '4h': 30,
      '1d': 180,
      '1w': 365,
      'all': 1825, // 5 Jahre
    };
    return map[interval] || 30;
  }
}

export const finnhubService = new FinnhubService();
