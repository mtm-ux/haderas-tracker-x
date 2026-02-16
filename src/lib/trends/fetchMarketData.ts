/**
 * Fetch Market Data für Nexus Trend Engine
 * Integriert mehrere Datenquellen (Finnhub, CoinGecko, FRED, etc.)
 */

import { finnhubService } from '@/services/finnhubService';
import { coinGeckoService } from '@/services/coinGeckoService';
import { 
  TrendAsset, 
  AssetClass,
  SectorRotation,
  CountryMomentum,
  AssetClassComparison,
} from './types';

import {
  calculateMomentum,
  calculateVolumeShift,
  calculateRelativeStrength,
  normalizeSentiment,
  calculateMacroSensitivity,
  calculateGeopoliticalRiskAdjustment,
  calculateTrendScore,
  determineTrendDirection,
} from './calculateTrendScore';

/**
 * Top Assets für Analyse
 */
const TOP_ASSETS = [
  { symbol: 'AAPL', name: 'Apple', class: 'stock' as AssetClass, country: 'US', sector: 'Technology' },
  { symbol: 'MSFT', name: 'Microsoft', class: 'stock' as AssetClass, country: 'US', sector: 'Technology' },
  { symbol: 'GOOGL', name: 'Alphabet', class: 'stock' as AssetClass, country: 'US', sector: 'Technology' },
  { symbol: 'AMZN', name: 'Amazon', class: 'stock' as AssetClass, country: 'US', sector: 'Consumer' },
  { symbol: 'TSLA', name: 'Tesla', class: 'stock' as AssetClass, country: 'US', sector: 'Automotive' },
  { symbol: 'NVDA', name: 'NVIDIA', class: 'stock' as AssetClass, country: 'US', sector: 'Technology' },
  { symbol: 'BTC', name: 'Bitcoin', class: 'crypto' as AssetClass, country: 'Global', sector: 'Crypto' },
  { symbol: 'ETH', name: 'Ethereum', class: 'crypto' as AssetClass, country: 'Global', sector: 'Crypto' },
  { symbol: 'EURUSD', name: 'EUR/USD', class: 'fx' as AssetClass, country: 'EU/US', sector: 'FX' },
  { symbol: 'GLD', name: 'Gold ETF', class: 'commodity' as AssetClass, country: 'Global', sector: 'Commodity' },
];

/**
 * Mock-Daten als Fallback
 */
function generateMockTrendAsset(asset: typeof TOP_ASSETS[0]): TrendAsset {
  const baseScore = 30 + Math.random() * 40;
  const momentum = -100 + Math.random() * 200;
  const change30dPercent = -10 + Math.random() * 20;
  
  return {
    symbol: asset.symbol,
    name: asset.name,
    assetClass: asset.class,
    country: asset.country,
    sector: asset.sector,
    
    currentPrice: 100 + Math.random() * 500,
    change7d: -5 + Math.random() * 10,
    change30d: -30 + Math.random() * 60,
    change7dPercent: (-5 + Math.random() * 10),
    change30dPercent: change30dPercent,
    
    trendScore: baseScore,
    trendDirection: baseScore > 60 ? 'strong_uptrend' : baseScore > 50 ? 'uptrend' : 'neutral',
    momentum,
    volatility: 20 + Math.random() * 40,
    relativeStrength: 30 + Math.random() * 40,
    
    volumeChange: -20 + Math.random() * 40,
    volumeZScore: -2 + Math.random() * 4,
    sentiment: ['very_positive', 'positive', 'neutral', 'negative', 'very_negative'][Math.floor(Math.random() * 5)] as any,
    sentimentScore: -70 + Math.random() * 140,
    
    betaInflation: 0.5,
    betaRates: -0.3,
    macroSensitivity: 30 + Math.random() * 40,
    
    geopoliticalRisk: 10 + Math.random() * 30,
    countryRisk: 5 + Math.random() * 20,
    
    lastUpdate: Date.now(),
  };
}

/**
 * Fetch Trend Assets mit erweiterten Metriken
 */
export async function fetchTrendAssets(): Promise<TrendAsset[]> {
  try {
    const assets: TrendAsset[] = [];
    let apiFailureCount = 0;

    for (const asset of TOP_ASSETS) {
      try {
        let priceData: any = null;

        // Fetch basiert auf Asset-Typ
        if (asset.class === 'crypto') {
          priceData = await coinGeckoService.getPrice(asset.symbol.toLowerCase());
        } else {
          priceData = await finnhubService.getPrice(asset.symbol);
        }

        // Fallback zu Mock-Daten wenn API nicht verfügbar
        if (!priceData) {
          apiFailureCount++;
          assets.push(generateMockTrendAsset(asset));
          continue;
        }

        // Berechne Trend-Metriken
        const momentum = calculateMomentum(
          priceData.changePercent24h || 0,
          priceData.change24h ? (priceData.change24h / priceData.price) * 100 : 0
        );

        const volumeShift = calculateVolumeShift(
          priceData.volume24h || 0,
          (priceData.volume24h || 0) * 0.9
        );

        const relativeStrength = calculateRelativeStrength(
          priceData.changePercent24h || 0,
          0
        );

        const sentimentData = normalizeSentiment(null);

        const macroSensitivity = calculateMacroSensitivity(
          priceData.beta || 1,
          priceData.beta || 1
        );

        const geopoliticalRiskAdjustment = calculateGeopoliticalRiskAdjustment(
          10,
          5
        );

        const trendScore = calculateTrendScore({
          momentum,
          volumeShift,
          relativeStrength,
          sentiment: sentimentData.score,
          macroSensitivity,
          geopoliticalRiskAdjustment,
        });

        assets.push({
          symbol: asset.symbol,
          name: asset.name,
          assetClass: asset.class,
          country: asset.country,
          sector: asset.sector,
          
          currentPrice: priceData.price || 0,
          change7d: priceData.change24h || 0,
          change30d: priceData.change24h ? priceData.change24h * 4 : 0,
          change7dPercent: priceData.changePercent24h || 0,
          change30dPercent: (priceData.changePercent24h || 0) * 4,
          
          trendScore,
          trendDirection: determineTrendDirection(trendScore, momentum - 50),
          momentum: momentum - 50,
          volatility: 50,
          relativeStrength,
          
          volumeChange: 0,
          volumeZScore: 0,
          sentiment: sentimentData.category,
          sentimentScore: sentimentData.score,
          
          betaInflation: 0.5,
          betaRates: -0.3,
          macroSensitivity,
          
          geopoliticalRisk: 10,
          countryRisk: 5,
          
          lastUpdate: Date.now(),
        });
      } catch (error) {
        console.error(`Error fetching data for ${asset.symbol}:`, error);
        apiFailureCount++;
        assets.push(generateMockTrendAsset(asset));
      }
    }

    // Log wenn APIs fehlgeschlagen sind
    if (apiFailureCount > 0) {
      console.warn(`${apiFailureCount} API calls failed, using mock data for these assets`);
    }

    return assets;
  } catch (error) {
    console.error('Error fetching trend assets:', error);
    // Fallback: Alle Assets mit Mock-Daten
    return TOP_ASSETS.map(asset => generateMockTrendAsset(asset));
  }
}

/**
 * Berechne Sektor-Rotationen
 */
export function calculateSectorRotations(assets: TrendAsset[]): SectorRotation[] {
  const sectorMap = new Map<string, { scores: number[]; assets: TrendAsset[]; returns: number[] }>();

  for (const asset of assets) {
    if (!asset.sector) continue;
    
    if (!sectorMap.has(asset.sector)) {
      sectorMap.set(asset.sector, { scores: [], assets: [], returns: [] });
    }
    
    const sector = sectorMap.get(asset.sector)!;
    sector.scores.push(asset.trendScore);
    sector.assets.push(asset);
    sector.returns.push(asset.change30dPercent || 0);
  }

  const rotations: SectorRotation[] = [];
  
  for (const [sector, data] of sectorMap) {
    const avgScore = data.scores.reduce((a, b) => a + b, 0) / data.scores.length;
    const avgReturn = data.returns.reduce((a, b) => a + b, 0) / data.returns.length;
    
    rotations.push({
      sector,
      score: avgScore,
      momentum: avgScore - 50,
      leadership: avgScore >= 60 ? 'strong' : avgScore >= 45 ? 'moderate' : 'weak',
      assetsCount: data.assets.length,
      averageReturn30d: avgReturn,
    });
  }

  return rotations.sort((a, b) => b.score - a.score);
}

/**
 * Berechne Länder-Momentum
 */
export function calculateCountryMomentum(assets: TrendAsset[]): CountryMomentum[] {
  const countryMap = new Map<string, { scores: number[]; assets: TrendAsset[]; returns: number[] }>();

  for (const asset of assets) {
    if (!countryMap.has(asset.country)) {
      countryMap.set(asset.country, { scores: [], assets: [], returns: [] });
    }
    
    const country = countryMap.get(asset.country)!;
    country.scores.push(asset.trendScore);
    country.assets.push(asset);
    country.returns.push(asset.change30dPercent || 0);
  }

  const momentum: CountryMomentum[] = [];
  
  for (const [country, data] of countryMap) {
    const avgScore = data.scores.reduce((a, b) => a + b, 0) / data.scores.length;
    const avgReturn = data.returns.reduce((a, b) => a + b, 0) / data.returns.length;
    
    momentum.push({
      country,
      code: country.substring(0, 2),
      score: avgScore,
      momentum: avgScore - 50,
      assetsCount: data.assets.length,
      averageReturn30d: avgReturn,
      geopoliticalRisk: country === 'US' ? 20 : country === 'EU' ? 30 : 50,
    });
  }

  return momentum.sort((a, b) => b.score - a.score);
}

/**
 * Berechne AssetKlasse Verglei
 */
export function calculateAssetClassComparison(assets: TrendAsset[]): AssetClassComparison[] {
  const classMap = new Map<AssetClass, { scores: number[]; assets: TrendAsset[]; returns: number[] }>();

  for (const asset of assets) {
    if (!classMap.has(asset.assetClass)) {
      classMap.set(asset.assetClass, { scores: [], assets: [], returns: [] });
    }
    
    const cls = classMap.get(asset.assetClass)!;
    cls.scores.push(asset.trendScore);
    cls.assets.push(asset);
    cls.returns.push(asset.change30dPercent || 0);
  }

  const comparisons: AssetClassComparison[] = [];
  
  for (const [assetClass, data] of classMap) {
    const avgScore = data.scores.reduce((a, b) => a + b, 0) / data.scores.length;
    const avgReturn = data.returns.reduce((a, b) => a + b, 0) / data.returns.length;
    
    comparisons.push({
      assetClass,
      score: avgScore,
      momentum: avgScore - 50,
      volatility: 50, // Mock
      return7d: avgReturn * 0.2,
      return30d: avgReturn,
      averageVolume: 1000000, // Mock
    });
  }

  return comparisons;
}
