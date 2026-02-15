export type AssetType = 'crypto' | 'stock';

export interface Asset {
  id: string;
  symbol: string;
  name: string;
  type: AssetType;
}

export interface PriceData {
  symbol: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  marketCap?: number;
  volume24h?: number;
  high24h?: number;
  low24h?: number;
  lastUpdate: number;
}

export interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export type TimeInterval = '5m' | '15m' | '1h' | '4h' | '1d' | '1w' | 'all';

export interface NewsItem {
  id: string;
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  imageUrl?: string;
  domain?: string;
}

export interface Watchlist {
  id: string;
  name: string;
  assets: Asset[];
  createdAt: number;
}

export interface DashboardLayout {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
}

export type ApiStatus = 'connected' | 'connecting' | 'error' | 'idle';

export interface ApiState {
  coinGecko: ApiStatus;
  finnhub: ApiStatus;
  binance: ApiStatus;
  cryptoPanic: ApiStatus;
}

export interface SearchResult extends Asset {
  marketCap?: number;
  price?: number;
}
