import { ApiClient } from './apiClient';
import { CandleData, TimeInterval, Asset, PriceData } from '@/types';

class BinanceService {
    private client: ApiClient;

    constructor() {
        this.client = new ApiClient('https://api.binance.com/api/v3');
    }

    setStatusCallback(callback: (status: 'connected' | 'connecting' | 'error') => void): void {
        this.client.setStatusCallback(callback);
    }

    /**
     * Holt 24h Preis-Daten von Binance (Ticker 24hr)
     * Hinweis: Binance kennt keine CoinGecko-IDs, nur Trading-Pairs (z.B. BTCUSDT).
     */
    async getPrice(asset: Asset): Promise<PriceData | null> {
        return this.getPriceBySymbol(asset.symbol);
    }

    async getPriceBySymbol(symbol: string): Promise<PriceData | null> {
        try {
            const s = symbol.toUpperCase();
            const binanceSymbol = s.endsWith('USDT') ? s : `${s}USDT`;

            const response = await this.client.get<any>('/ticker/24hr', {
                params: { symbol: binanceSymbol },
            });

            if (!response) return null;

            const lastPrice = parseFloat(response.lastPrice);
            if (!Number.isFinite(lastPrice)) return null;

            const priceChange = parseFloat(response.priceChange);
            const priceChangePercent = parseFloat(response.priceChangePercent);
            const quoteVolume = parseFloat(response.quoteVolume);
            const highPrice = parseFloat(response.highPrice);
            const lowPrice = parseFloat(response.lowPrice);

            return {
                symbol: s,
                price: lastPrice,
                change24h: Number.isFinite(priceChange) ? priceChange : 0,
                changePercent24h: Number.isFinite(priceChangePercent) ? priceChangePercent : 0,
                volume24h: Number.isFinite(quoteVolume) ? quoteVolume : undefined,
                high24h: Number.isFinite(highPrice) ? highPrice : undefined,
                low24h: Number.isFinite(lowPrice) ? lowPrice : undefined,
                lastUpdate: Date.now(),
            };
        } catch (error) {
            // Für nicht vorhandene Paare (oder Rate-Limits) fallbacken wir später auf CoinGecko
            console.error('Binance price error:', error);
            return null;
        }
    }

    /**
     * Holt Kerzen-Daten (Klines) von Binance
     */
    async getCandles(asset: Asset, interval: TimeInterval, endTime?: number): Promise<CandleData[]> {
        try {
            // Map Asset Symbol to Binance Symbol (e.g. BTC -> BTCUSDT)
            const binanceSymbol = `${asset.symbol}USDT`;
            const binanceInterval = this.mapInterval(interval);

            const response = await this.client.get<any[][]>('/klines', {
                params: {
                    symbol: binanceSymbol,
                    interval: binanceInterval,
                    limit: 500,
                    endTime: endTime,
                },
            });

            if (!response || !Array.isArray(response) || response.length === 0) {
                return [];
            }

            return response.map((kline) => ({
                time: kline[0], // Open time
                open: parseFloat(kline[1]),
                high: parseFloat(kline[2]),
                low: parseFloat(kline[3]),
                close: parseFloat(kline[4]),
                volume: parseFloat(kline[5]),
            }));
        } catch (error) {
            console.error('Binance candles error:', error);
            return [];
        }
    }

    private mapInterval(interval: TimeInterval): string {
        const map: Record<TimeInterval, string> = {
            '1m': '1m',
            '5m': '5m',
            '15m': '15m',
            '30m': '30m',
            '1h': '1h',
            '4h': '4h',
            '1d': '1d',
            '1w': '1w',
            '1M': '1M',
            'all': '1M',
        };
        return map[interval] || '1h';
    }
}

export const binanceService = new BinanceService();
