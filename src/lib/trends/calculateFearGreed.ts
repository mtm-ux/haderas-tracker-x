/**
 * Fear & Greed Index Calculation
 * 
 * Index Komponenten (alle zu 0-100 normalisiert, dann gemittelt):
 * 1. Market Momentum (20% Gewicht)
 * 2. Volatility (15% Gewicht)
 * 3. Market Breadth (15% Gewicht)
 * 4. Safe Haven Flows (10% Gewicht)
 * 5. Credit Spread Proxy (10% Gewicht)
 * 6. Volume Extremes (15% Gewicht)
 * 7. Sentiment (15% Gewicht)
 */

import { FearGreedIndex, FearGreedCategory } from './types';

export interface FearGreedInputs {
  // Market Momentum: Average return letzte 7 Tage
  marketMomentum: number; // prozent
  
  // Volatility: VIX equivalent oder StdDev letzte 30 Tage
  volatility: number; // prozent
  
  // Market Breadth: Prozent positive vs alle Assets
  marketBreathPositive: number; // 0-100
  
  // Safe Haven Flows: Geld in Bonds vs Stocks
  safeHavenRatio: number; // bonds/(bonds+stocks)
  
  // Credit Spread Proxy: High Yield vs Treasury (BBB-10Y spread)
  creditSpreadBasisPoints: number;
  
  // Volume: Durchschnitt vs normal
  volumeRatio: number;
  
  // Sentiment: News + Social kombiniert
  sentimentScore: number; // -100 to 100
}

const WEIGHTS = {
  marketMomentum: 0.20,
  volatility: 0.15,
  marketBreadth: 0.15,
  safeHavenFlows: 0.10,
  creditSpread: 0.10,
  volumeExtremes: 0.15,
  sentiment: 0.15,
};

/**
 * Normalisiere Market Momentum zu 0-100
 * Positive Momentum = höherer Score (Greed)
 */
function calculateMarketMomentumScore(momentum: number): number {
  // -20% bis +20% ist normales Range
  const normalized = Math.max(-20, Math.min(20, momentum));
  return ((normalized + 20) / 40) * 100;
}

/**
 * Normalisiere Volatilien zu 0-100
 * Höhere Volatilität = niedrigerer Score (Fear)
 */
function calculateVolatilityScore(volatility: number): number {
  // 10% bis 50% ist normales Range
  // 10% = 100 (low vol = greed)
  // 50% = 0 (high vol = fear)
  const normalized = Math.max(10, Math.min(50, volatility));
  return ((50 - normalized) / 40) * 100;
}

/**
 * Market Breadth Score (0-100)
 * Höher = mehr Assets steigen = Greed
 */
function calculateMarketBreadthScore(positivePercent: number): number {
  // Erwartet 0-100
  return positivePercent;
}

/**
 * Safe Haven Flows Score (0-100)
 * Höheres Ratio = mehr Bonds, weniger Greed
 */
function calculateSafeHavenScore(safeHavenRatio: number): number {
  // 30% Bonds = neutral (50)
  // 0% = 100 (allIn stocks, Greed)
  // 100% = 0 (allIn Bonds, Fear)
  return (1 - safeHavenRatio) * 100;
}

/**
 * Credit Spread Score
 * Höherer Spread = höheres Ausfallrisiko = Fear
 */
function calculateCreditSpreadScore(spreadBps: number): number {
  // 100 bps = neutral (50)
  // <50 bps = greed (80+)
  // >200 bps = fear (<30)
  const normalized = Math.max(50, Math.min(300, spreadBps));
  return ((300 - normalized) / 250) * 100;
}

/**
 * Volume Extremes Score
 * Hohe oder sehr niedrige Volumen deuten auf Extrema hin
 */
function calculateVolumeExtremesScore(volumeRatio: number): number {
  // 1.0 = normal (no extrema)
  // Abweichung nach oben oder unten = Extrema
  const deviation = Math.abs(volumeRatio - 1.0);
  
  if (deviation < 0.2) return 50; // Normal
  if (deviation < 0.5) return 30; // Moderate extreme
  return 0; // High extreme (fear/uncertainty)
}

/**
 * Sentiment Score (direkt 0-100)
 */
function calculateSentimentScore(sentimentScore: number): number {
  // -100 to +100 wird zu 0-100
  return ((sentimentScore + 100) / 2);
}

/**
 * Berechne Fear & Greed Index
 */
export function calculateFearGreedIndex(inputs: FearGreedInputs): FearGreedIndex {
  // Berechne alle Komponenten
  const marketMomentumScore = calculateMarketMomentumScore(inputs.marketMomentum);
  const volatilityScore = calculateVolatilityScore(inputs.volatility);
  const breadthScore = calculateMarketBreadthScore(inputs.marketBreathPositive);
  const safeHavenScore = calculateSafeHavenScore(inputs.safeHavenRatio);
  const creditSpreadScore = calculateCreditSpreadScore(inputs.creditSpreadBasisPoints);
  const volumeScore = calculateVolumeExtremesScore(inputs.volumeRatio);
  const sentimentScore = calculateSentimentScore(inputs.sentimentScore);
  
  // Gewichteter Durchschnitt
  const value =
    marketMomentumScore * WEIGHTS.marketMomentum +
    volatilityScore * WEIGHTS.volatility +
    breadthScore * WEIGHTS.marketBreadth +
    safeHavenScore * WEIGHTS.safeHavenFlows +
    creditSpreadScore * WEIGHTS.creditSpread +
    volumeScore * WEIGHTS.volumeExtremes +
    sentimentScore * WEIGHTS.sentiment;
  
  const finalValue = Math.max(0, Math.min(100, value));
  
  return {
    value: finalValue,
    category: categorizeFearGreed(finalValue),
    timestamp: Date.now(),
    marketMomentum: marketMomentumScore,
    volatility: volatilityScore,
    marketBreadth: breadthScore,
    safeHavenFlows: safeHavenScore,
    creditSpreadProxy: creditSpreadScore,
    volumeExtremes: volumeScore,
    sentiment: sentimentScore,
  };
}

/**
 * Kategorisiere Fear & Greed Wert
 */
function categorizeFearGreed(value: number): FearGreedCategory {
  if (value < 25) return 'extreme_fear';
  if (value < 45) return 'fear';
  if (value < 55) return 'neutral';
  if (value < 75) return 'greed';
  return 'extreme_greed';
}

/**
 * Beschreibung des Fear & Greed Index
 */
export function getFearGreedDescription(category: FearGreedCategory): string {
  const descriptions: Record<FearGreedCategory, string> = {
    extreme_fear: 'Extreme Angst - Markt-Überverkauf möglich',
    fear: 'Angst - Defensive Positionierung',
    neutral: 'Neutral - Ausgewogener Markt',
    greed: 'Gier - Offensive Positionierung',
    extreme_greed: 'Extreme Gier - Überaufkauf möglich',
  };
  
  return descriptions[category];
}
