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

export type TimeInterval = '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d' | '1w' | '1M' | 'all';

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

export type DashboardLayouts = Partial<Record<'lg' | 'md' | 'sm' | 'xs' | 'xxs', DashboardLayout[]>>;

export interface AppUser {
  id: string;
  name: string;
  createdAt: number;
}

export type DeepResearchStatus = 'in_arbeit' | 'fragen' | 'erledigt' | 'gem';

export type SourceType = 'news' | 'report' | 'pdf' | 'video' | 'other';

export interface DeepResearchSource {
  id: string;
  url: string;
  title: string;
  date: string;
  type: SourceType;
  notes?: string;
}

export interface DeepResearchBacktestConfig {
  description: string;
  startDate: string;
  endDate: string;
  notes: string;
}

export interface DeepResearchChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface DeepResearchItem {
  id: string;
  userId: string;
  asset: Asset;
  status: DeepResearchStatus;
  /** Schnell-Notizen / Tabellen */
  notes: string;
  /** Longform-Analyse im Markdown-Format */
  longformMarkdown?: string;
  /** Sticky Notes, getrennt von der Hauptanalyse */
  stickyNotes?: string;
  /** Quellenliste pro Asset */
  sources?: DeepResearchSource[];
  /** Optional: Peer-Symbole für Vergleiche */
  watchlistPeers?: string[];
  /** Einfache Backtest-Konfiguration + Beschreibung */
  backtestConfig?: DeepResearchBacktestConfig;
  /** Persistente Chat-Historie mit dem AI-Assistenten */
  chatMessages?: DeepResearchChatMessage[];
  createdAt: number;
  updatedAt: number;
}

export type DeepResearchLayouts = DashboardLayouts;

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

// Nexus Trend Engine
export type TrendAssetClass = 'STOCK' | 'CRYPTO' | 'PREDICTION';

export interface TrendAsset {
  id: string;
  name: string;
  ticker: string;
  class: TrendAssetClass;
  category: string; // z.B. GICS Sector / LDACS Main
  subCategory: string; // z.B. Industry / L2-Kategorie
  industryInterplay: string[]; // Beschreibung der Cross-Asset-Verknüpfungen

  price: number;
  volume_24h: number;
  open_interest?: number;
  implied_probability?: number; // für Prediction Markets
  rsi_14?: number;
  momentum_24h?: number;
  momentum_7d?: number;
  brier_score?: number;

  nexusScore?: number;
  sentimentScore?: number;
  probabilityShift_24h?: number;
}

// Jahresstrahl - Timeline Events
export type EventCategory = 'macro' | 'earnings' | 'economic' | 'geopolitical' | 'central_bank' | 'other';

export interface PriceImpact {
  [symbol: string]: number; // Prozentuale Änderung
}

export interface TimelineEvent {
  id: string;
  date: string; // ISO 8601 format
  title: string;
  category: EventCategory;
  importance: 1 | 2 | 3 | 4 | 5; // Scale 1-5
  assets: string[]; // Asset symbols affected
  region: string; // "US" | "EU" | "APAC" etc.
  summary: string;
  description?: string;
  price_impact?: PriceImpact;
  source?: string;
}

export interface TimelineEventResponse {
  events: TimelineEvent[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
  };
}

// Aktienübersicht - Stock Watchlist
export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change_percent: number; // z.B. -1.24
  change_value: number; // z.B. -2.41
  market_cap?: number;
  currency?: string;
}

export interface StockWatchlist {
  id: string;
  name: string;
  displayName: string;
  symbols: string[];
  description?: string;
  createdAt: number;
  updatedAt: number;
}

export type StockWatchlistMap = Record<string, StockWatchlist>;
