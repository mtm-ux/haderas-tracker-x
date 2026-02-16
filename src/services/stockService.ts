import { StockQuote, PriceData } from '@/types';
import { finnhubService } from './finnhubService';
import { coinGeckoService } from './coinGeckoService';

/**
 * Mock data für Entwicklung
 */
const MOCK_STOCK_DATA: Record<string, StockQuote> = {
  AAPL: {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    price: 192.34,
    change_percent: -1.24,
    change_value: -2.41,
    market_cap: 2_980_000_000_000,
    currency: 'USD',
  },
  MSFT: {
    symbol: 'MSFT',
    name: 'Microsoft Corp.',
    price: 415.21,
    change_percent: 2.15,
    change_value: 8.77,
    market_cap: 3_090_000_000_000,
    currency: 'USD',
  },
  GOOGL: {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    price: 178.92,
    change_percent: 0.45,
    change_value: 0.80,
    market_cap: 1_750_000_000_000,
    currency: 'USD',
  },
  AMZN: {
    symbol: 'AMZN',
    name: 'Amazon.com Inc.',
    price: 201.44,
    change_percent: -0.82,
    change_value: -1.66,
    market_cap: 2_100_000_000_000,
    currency: 'USD',
  },
  TSLA: {
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    price: 287.65,
    change_percent: 3.24,
    change_value: 8.99,
    market_cap: 920_000_000_000,
    currency: 'USD',
  },
  BTC: {
    symbol: 'BTC',
    name: 'Bitcoin',
    price: 98456.23,
    change_percent: 4.32,
    change_value: 4081.12,
    market_cap: 1_950_000_000_000,
    currency: 'USD',
  },
  ETH: {
    symbol: 'ETH',
    name: 'Ethereum',
    price: 3350.88,
    change_percent: 2.87,
    change_value: 93.42,
    market_cap: 402_000_000_000,
    currency: 'USD',
  },
  NVDA: {
    symbol: 'NVDA',
    name: 'NVIDIA Corp.',
    price: 145.67,
    change_percent: 1.89,
    change_value: 2.71,
    market_cap: 3_580_000_000_000,
    currency: 'USD',
  },
};

/**
 * Hilfsfunktion: Prüfe ob Symbol Crypto oder Stock ist
 */
function isCryptoSymbol(symbol: string): boolean {
  const cryptoSymbols = ['BTC', 'ETH', 'XRP', 'LTC', 'ADA', 'DOT', 'SOL', 'DOGE'];
  return cryptoSymbols.includes(symbol.toUpperCase());
}

/**
 * Konvertiere PriceData zu StockQuote Format
 */
function priceDataToQuote(priceData: PriceData, symbol: string): StockQuote {
  return {
    symbol: symbol,
    name: symbol,
    price: priceData.price,
    change_percent: priceData.changePercent24h,
    change_value: priceData.change24h,
    market_cap: priceData.marketCap,
    currency: 'USD',
  };
}

/**
 * Hole Mock Stock Quotes
 */
function getMockStockQuotes(symbols: string[]): StockQuote[] {
  return symbols
    .map((symbol) => MOCK_STOCK_DATA[symbol.toUpperCase()])
    .filter((stock) => stock !== undefined);
}

export const stockService = {
  /**
   * Fetch stock quotes für mehrere Symbole
   * Versucht echte APIs (Finnhub/CoinGecko), fällt zurück auf Mock
   */
  async fetchStocks(symbols: string[]): Promise<StockQuote[]> {
    if (!symbols.length) return [];

    try {
      const quotes: StockQuote[] = [];

      for (const symbol of symbols) {
        // Prüfe ob es Crypto ist (BTC, ETH, etc.)
        const isCrypto = isCryptoSymbol(symbol);

        if (isCrypto) {
          const priceData = await coinGeckoService.getPrice(symbol.toLowerCase());
          if (priceData) {
            quotes.push(priceDataToQuote(priceData, symbol));
            continue;
          }
        } else {
          const priceData = await finnhubService.getPrice(symbol);
          if (priceData) {
            quotes.push(priceDataToQuote(priceData, symbol));
            continue;
          }
        }

        // Fallback zu Mock-Daten für dieses Symbol
        const mockQuote = MOCK_STOCK_DATA[symbol.toUpperCase()];
        if (mockQuote) {
          quotes.push(mockQuote);
        }
      }

      return quotes.length > 0 ? quotes : getMockStockQuotes(symbols);
    } catch (error) {
      console.warn('API fetch failed, using mock data:', error);
      return getMockStockQuotes(symbols);
    }
  },

  /**
   * Search stocks by query mit echten APIs
   * Sucht in Finnhub (Stocks) und CoinGecko (Crypto)
   */
  async searchStocks(query: string): Promise<StockQuote[]> {
    if (!query || query.length < 1) return [];

    try {
      const [stockResults, cryptoResults] = await Promise.all([
        finnhubService.search(query),
        coinGeckoService.search(query),
      ]);

      const quotes: StockQuote[] = [];

      // Konvertiere Stock Results
      for (const result of stockResults) {
        const priceData = await finnhubService.getPrice(result.symbol);
        if (priceData) {
          quotes.push(priceDataToQuote(priceData, result.symbol));
        } else {
          quotes.push({
            symbol: result.symbol,
            name: result.name,
            price: 0,
            change_percent: 0,
            change_value: 0,
            currency: 'USD',
          });
        }
      }

      // Konvertiere Crypto Results
      for (const result of cryptoResults) {
        const priceData = await coinGeckoService.getPrice(result.id);
        if (priceData) {
          quotes.push(priceDataToQuote(priceData, result.symbol));
        } else {
          quotes.push({
            symbol: result.symbol,
            name: result.name,
            price: 0,
            change_percent: 0,
            change_value: 0,
            currency: 'USD',
          });
        }
      }

      return quotes.length > 0 ? quotes : this.mockSearch(query);
    } catch (error) {
      console.warn('Search failed, using mock search:', error);
      return this.mockSearch(query);
    }
  },

  /**
   * Mock search function für Fallback
   */
  mockSearch(query: string): StockQuote[] {
    const allMocks = getMockStockQuotes(
      ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'BTC', 'ETH', 'NVDA']
    );
    const q = query.toLowerCase();
    return allMocks.filter(
      (s) =>
        s.symbol.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q)
    );
  },

  /**
   * Format price change für Anzeige
   */
  formatChangePercent(percent: number): string {
    const sign = percent >= 0 ? '+' : '';
    return `${sign}${percent.toFixed(2)}%`;
  },

  /**
   * Format price change value für Anzeige
   */
  formatChangeValue(value: number): string {
    const sign = value >= 0 ? '+' : '';
    return `${sign}$${Math.abs(value).toFixed(2)}`;
  },

  /**
   * Format price kompakt
   */
  formatPrice(price: number): string {
    if (price >= 1000) {
      return `$${(price / 1000).toFixed(1)}k`;
    }
    return `$${price.toFixed(2)}`;
  },

  /**
   * Format market cap
   */
  formatMarketCap(marketCap?: number): string {
    if (!marketCap) return '–';
    if (marketCap >= 1_000_000_000_000) {
      return `$${(marketCap / 1_000_000_000_000).toFixed(1)}T`;
    }
    if (marketCap >= 1_000_000_000) {
      return `$${(marketCap / 1_000_000_000).toFixed(1)}B`;
    }
    if (marketCap >= 1_000_000) {
      return `$${(marketCap / 1_000_000).toFixed(1)}M`;
    }
    return `$${marketCap}`;
  },

  /**
   * Determine color class based on change
   */
  getChangeColor(changePercent: number): string {
    if (changePercent > 0) return 'text-success';
    if (changePercent < 0) return 'text-danger';
    return 'text-app-muted';
  },

  /**
   * Sort stocks by various criteria
   */
  sortStocks(
    stocks: StockQuote[],
    by: 'name' | 'price' | 'change' = 'name'
  ): StockQuote[] {
    const sorted = [...stocks];

    switch (by) {
      case 'price':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'change':
        sorted.sort((a, b) => b.change_percent - a.change_percent);
        break;
      case 'name':
      default:
        sorted.sort((a, b) => a.symbol.localeCompare(b.symbol));
        break;
    }

    return sorted;
  },

  /**
   * Check if symbol is cryptocurrency
   */
  isCryptoSymbol(symbol: string): boolean {
    return isCryptoSymbol(symbol);
  },
};
