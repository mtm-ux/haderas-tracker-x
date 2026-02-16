import { coinGeckoService } from '@/services/coinGeckoService';

// CoinGecko arbeitet primär mit Coin-IDs (z.B. "bitcoin") statt Ticker-Symbolen (z.B. "BTC").
// Für häufige Coins halten wir eine kleine Map vor und fallen sonst auf CoinGecko Search zurück.
const COINGECKO_ID_BY_SYMBOL: Record<string, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  XRP: 'ripple',
  LTC: 'litecoin',
  ADA: 'cardano',
  DOT: 'polkadot',
  SOL: 'solana',
  DOGE: 'dogecoin',
};

const coinIdCache = new Map<string, string>();

export async function resolveCoinGeckoId(symbol: string): Promise<string | null> {
  const s = symbol.toUpperCase();

  const cached = coinIdCache.get(s);
  if (cached) return cached;

  const mapped = COINGECKO_ID_BY_SYMBOL[s];
  if (mapped) {
    coinIdCache.set(s, mapped);
    return mapped;
  }

  // Fallback: Suche bei CoinGecko und nimm den ersten Treffer mit passendem Symbol
  const results = await coinGeckoService.search(s);
  const match = results.find((r) => r.symbol?.toUpperCase() === s) ?? results[0];
  if (!match?.id) return null;

  coinIdCache.set(s, match.id);
  return match.id;
}
