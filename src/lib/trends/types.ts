/**
 * Nexus Trend Engine - Type Definitions
 * Alle zentralen Typen für die Markttrend-Analyse
 */

export type AssetClass = 'stock' | 'crypto' | 'commodity' | 'fx' | 'bond';
export type Sentiment = 'very_negative' | 'negative' | 'neutral' | 'positive' | 'very_positive';
export type FearGreedCategory = 'extreme_fear' | 'fear' | 'neutral' | 'greed' | 'extreme_greed';
export type TrendDirection = 'strong_uptrend' | 'uptrend' | 'neutral' | 'downtrend' | 'strong_downtrend';

/**
 * Einzelnes Asset mit Trend-Score
 */
export interface TrendAsset {
  symbol: string;
  name: string;
  assetClass: AssetClass;
  country: string;
  sector?: string;
  
  // Preisdaten
  currentPrice: number;
  change7d: number;
  change30d: number;
  change7dPercent: number;
  change30dPercent: number;
  
  // Trend-Metriken
  trendScore: number; // 0-100
  trendDirection: TrendDirection;
  momentum: number; // -100 to 100
  volatility: number; // 0-100
  relativeStrength: number; // 0-100
  
  // Volumen & Sentiment
  volumeChange: number; // Prozent vs 30-Tage Durchschnitt
  volumeZScore: number;
  sentiment: Sentiment;
  sentimentScore: number; // -100 to 100
  
  // Makro-Sensitivität
  betaInflation: number;
  betaRates: number;
  macroSensitivity: number; // 0-100
  
  // Geopolitisches Risiko
  geopoliticalRisk: number; // 0-100
  countryRisk: number; // 0-100
  
  // Zeitstempel
  lastUpdate: number;
}

/**
 * Fear & Greed Index
 */
export interface FearGreedIndex {
  value: number; // 0-100
  category: FearGreedCategory;
  timestamp: number;
  
  // Komponenten
  marketMomentum: number;
  volatility: number;
  marketBreadth: number;
  safeHavenFlows: number;
  creditSpreadProxy: number;
  volumeExtremes: number;
  sentiment: number;
}

/**
 * Sektor-Rotation Daten
 */
export interface SectorRotation {
  sector: string;
  score: number; // 0-100
  momentum: number;
  leadership: 'strong' | 'moderate' | 'weak';
  assetsCount: number;
  averageReturn30d: number;
}

/**
 * Länder-Momentum Daten
 */
export interface CountryMomentum {
  country: string;
  code: string;
  score: number; // 0-100
  momentum: number;
  assetsCount: number;
  averageReturn30d: number;
  geopoliticalRisk: number;
}

/**
 * Assetklasse Vergleich
 */
export interface AssetClassComparison {
  assetClass: AssetClass;
  score: number; // 0-100
  momentum: number;
  volatility: number;
  return7d: number;
  return30d: number;
  averageVolume: number;
}

/**
 * Filter-Optionen
 */
export interface TrendFilters {
  sectors: string[];
  countries: string[];
  assetClasses: AssetClass[];
  marketCapRange?: [number, number]; // [min, max] in USD
  trendScoreRange: [number, number]; // [0, 100]
  sentiments: Sentiment[];
}

/**
 * Trend-Engine State
 */
export interface NexusTrendEngineState {
  assets: TrendAsset[];
  fearGreedIndex: FearGreedIndex | null;
  fearGreedIndices: {
    bitcoin: FearGreedIndex | null;
    ethereum: FearGreedIndex | null;
    crypto_market: FearGreedIndex | null;
    general_market: FearGreedIndex | null;
  };
  sectorRotation: SectorRotation[];
  countryMomentum: CountryMomentum[];
  assetClassComparison: AssetClassComparison[];
  
  isLoading: boolean;
  error: string | null;
  lastUpdate: number;
  
  activeFilters: TrendFilters;
  sortBy: 'trendScore' | 'change30d' | 'momentum' | 'volatility';
  sortOrder: 'asc' | 'desc';
}

/**
 * Raw Marktdaten von APIs
 */
export interface RawMarketData {
  symbol: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  volume24h?: number;
  marketCap?: number;
  high24h?: number;
  low24h?: number;
  beta?: number;
  pe?: number;
}

/**
 * Sentiment Daten von News/Social
 */
export interface SentimentData {
  symbol: string;
  newsCount: number;
  positiveSentiment: number; // percent
  negativeSentiment: number; // percent
  neutralSentiment: number; // percent
  socialBuzz: number; // 0-100
}
