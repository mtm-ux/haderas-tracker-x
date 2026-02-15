import { ApiClient } from './apiClient';
import { CandleData, TimeInterval, Asset } from '@/types';

class BinanceService {
    private client: ApiClient;

    constructor() {
        this.client = new ApiClient('https://api.binance.com/api/v3');
    }

    setStatusCallback(callback: (status: 'connected' | 'connecting' | 'error') => void): void {
        this.client.setStatusCallback(callback);
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
            '5m': '5m',
            '15m': '15m',
            '1h': '1h',
            '4h': '4h',
            '1d': '1d',
            '1w': '1w',
            'all': '1M', // 'all' wird auf monatlich gemappt für Binance
        };
        return map[interval] || '1h';
    }
}

export const binanceService = new BinanceService();
