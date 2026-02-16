/**
 * Nexus Trend Score Calculation
 * 
 * TrendScore = w1*Momentum + w2*VolumeShift + w3*RelativeStrength + w4*Sentiment + w5*MacroSensitivity + w6*GeopoliticalRiskAdjustment
 * 
 * Alle Komponenten sind auf 0-100 normalisiert
 */

import { SentimentData } from './types';

// Gewichtungen für TrendScore (summe = 100)
const WEIGHTS = {
  momentum: 0.25,
  volumeShift: 0.20,
  relativeStrength: 0.20,
  sentiment: 0.15,
  macroSensitivity: 0.12,
  geopoliticalRisk: 0.08,
};

/**
 * Berechne Momentum (0-100)
 * Basiert auf 7-Tage und 30-Tage Returns
 */
export function calculateMomentum(change7d: number, change30d: number): number {
  // Beide Returns zusammenrechnen (30D hat höhere Gewichtung)
  const combinedReturn = change7d * 0.3 + change30d * 0.7;
  
  // Normalisiere auf 0-100
  // Annahme: -30% bis +30% ist normaler Range
  const normalized = Math.max(-30, Math.min(30, combinedReturn));
  return ((normalized + 30) / 60) * 100;
}

/**
 * Berechne Volume Shift Score (0-100)
 * Basiert auf Volumen vs 30-Tage Durchschnitt
 */
export function calculateVolumeShift(
  currentVolume: number,
  avgVolume: number
): number {
  if (avgVolume === 0) return 50; // Neutral wenn keine Daten
  
  const ratio = currentVolume / avgVolume;
  
  // Ratio von 0.5 bis 2.0 ist normal
  // Unter 0.5 oder über 2.0 ist extrem
  let zscore = 0;
  if (ratio < 1) {
    zscore = -((1 - ratio) / 0.5) * 100; // Negativ wenn weniger Volumen
  } else {
    zscore = ((ratio - 1) / 1) * 100; // Positiv wenn mehr Volumen
  }
  
  // Normalisiere auf 0-100
  return Math.max(0, Math.min(100, 50 + zscore * 0.5));
}

/**
 * Berechne Relative Strength vs Benchmark (0-100)
 */
export function calculateRelativeStrength(
  assetReturn: number,
  benchmarkReturn: number
): number {
  const outperformance = assetReturn - benchmarkReturn;
  
  // -10% bis +10% outperformance ist normaler Range
  const normalized = Math.max(-10, Math.min(10, outperformance));
  return ((normalized + 10) / 20) * 100;
}

/**
 * Normalisiere Sentiment zu 0-100
 */
export function normalizeSentiment(sentimentData: SentimentData | null): {
  score: number;
  category: 'very_negative' | 'negative' | 'neutral' | 'positive' | 'very_positive';
} {
  if (!sentimentData) {
    return { score: 50, category: 'neutral' };
  }
  
  const netSentiment = sentimentData.positiveSentiment - sentimentData.negativeSentiment;
  const score = 50 + (netSentiment / 2); // -100 bis +100 wird zu 0-100
  
  let category: 'very_negative' | 'negative' | 'neutral' | 'positive' | 'very_positive';
  if (score < 20) category = 'very_negative';
  else if (score < 40) category = 'negative';
  else if (score < 60) category = 'neutral';
  else if (score < 80) category = 'positive';
  else category = 'very_positive';
  
  return { score: Math.max(0, Math.min(100, score)), category };
}

/**
 * Berechne Makro-Sensitivität basiert auf Beta
 */
export function calculateMacroSensitivity(
  betaInflation: number,
  betaRates: number
): number {
  // Höhere Beta = höhere Sensitivität
  // Positive Beta zu Inflation ist schlecht, negative ist gut
  // Negative Beta zu Raten ist gut (sinken wenn Raten fallen), positive ist schlecht
  
  const inflationSensitivity = Math.max(0, Math.min(100, (betaInflation + 1) * 50));
  const rateSensitivity = Math.max(0, Math.min(100, (1 - betaRates) * 50));
  
  // Durchwchnitt der beiden
  return (inflationSensitivity + rateSensitivity) / 2;
}

/**
 * Berechne Geopolitisches Risiko Adjustment (0-100)
 * Höher = höheres Risiko = schlechter für Score
 */
export function calculateGeopoliticalRiskAdjustment(
  geopoliticalRisk: number,
  countryRisk: number
): number {
  // Average der beiden
  const avgRisk = (geopoliticalRisk + countryRisk) / 2;
  
  // Umkehren: höheres Risiko = niedrigerer Score
  return 100 - avgRisk;
}

/**
 * Berechne finalen TrendScore (0-100)
 */
export function calculateTrendScore(params: {
  momentum: number;
  volumeShift: number;
  relativeStrength: number;
  sentiment: number;
  macroSensitivity: number;
  geopoliticalRiskAdjustment: number;
}): number {
  const score =
    params.momentum * WEIGHTS.momentum +
    params.volumeShift * WEIGHTS.volumeShift +
    params.relativeStrength * WEIGHTS.relativeStrength +
    params.sentiment * WEIGHTS.sentiment +
    params.macroSensitivity * WEIGHTS.macroSensitivity +
    params.geopoliticalRiskAdjustment * WEIGHTS.geopoliticalRisk;
  
  return Math.max(0, Math.min(100, score));
}

/**
 * Bestimme Trend-Richtung basiert auf Score
 */
export function determineTrendDirection(
  score: number,
  momentum: number
): 'strong_uptrend' | 'uptrend' | 'neutral' | 'downtrend' | 'strong_downtrend' {
  if (score >= 75 && momentum > 0) return 'strong_uptrend';
  if (score >= 55 && momentum > 0) return 'uptrend';
  if (score >= 40 && score <= 60) return 'neutral';
  if (score < 45 && momentum < 0) return 'downtrend';
  if (score < 25 && momentum < 0) return 'strong_downtrend';
  
  // Default
  return 'neutral';
}
