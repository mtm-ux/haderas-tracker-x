/**
 * Formatiert Zahlen mit angemessener Präzision
 * Verwendet bis zu 9 Nachkommastellen für kleine Crypto-Werte
 */
export const formatNumber = (value: number | null | undefined, maxDecimals: number = 2): string => {
  if (value === null || value === undefined || isNaN(value)) return '---';
  if (value === 0) return '0';

  // Für sehr kleine Zahlen (< 0.01), verwende mehr Dezimalstellen
  if (Math.abs(value) < 0.01) {
    const decimals = Math.min(9, Math.ceil(-Math.log10(Math.abs(value))) + 2);
    return value.toFixed(decimals);
  }

  // Für Zahlen < 1, verwende 4 Dezimalstellen
  if (Math.abs(value) < 1) {
    return value.toFixed(4);
  }

  // Für größere Zahlen, verwende maxDecimals
  return value.toFixed(maxDecimals);
};

/**
 * Formatiert Geldbeträge mit Währungssymbol
 */
export const formatCurrency = (
  value: number | null | undefined,
  currency: string = 'USD',
  compact: boolean = false
): string => {
  if (value === null || value === undefined || isNaN(value)) return '---';

  if (compact && Math.abs(value) >= 1000) {
    return formatCompactNumber(value, currency);
  }

  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: (value !== 0 && Math.abs(value) < 0.01) ? 9 : 2,
  }).format(value);
};

/**
 * Formatiert große Zahlen in kompakter Form (1.2M, 3.4B, etc.)
 */
export const formatCompactNumber = (value: number | null | undefined, currency?: string): string => {
  if (value === null || value === undefined || isNaN(value)) return '---';
  if (value === 0) return currency ? formatCurrency(0, currency) : '0';

  const suffixes = ['', 'K', 'M', 'B', 'T'];
  const absValue = Math.abs(value);
  const tier = Math.floor(Math.log10(absValue) / 3);

  if (tier <= 0) {
    return currency ? formatCurrency(value, currency) : formatNumber(value);
  }

  const suffix = suffixes[tier] || '';
  const scale = Math.pow(10, tier * 3);
  const scaled = value / scale;

  const formatted = formatNumber(scaled, 2);
  return currency ? `${currency === 'USD' ? '$' : currency}${formatted}${suffix}` : `${formatted}${suffix}`;
};

/**
 * Formatiert Prozentsätze
 */
export const formatPercent = (value: number | null | undefined, decimals: number = 2): string => {
  if (value === null || value === undefined || isNaN(value)) return '---';
  return `${value > 0 ? '+' : ''}${value.toFixed(decimals)}%`;
};

/**
 * Formatiert Datum/Zeit
 */
export const formatDate = (timestamp: number | null | undefined, format: 'short' | 'long' = 'short'): string => {
  if (!timestamp) return '---';
  const date = new Date(timestamp);

  if (format === 'short') {
    return new Intl.DateTimeFormat('de-DE', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }

  return new Intl.DateTimeFormat('de-DE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

/**
 * Generiert eine eindeutige ID
 */
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Debounce-Funktion für Performance-Optimierung
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Ermittelt die Farbe basierend auf Wertänderung
 */
export const getChangeColor = (change: number | null | undefined): string => {
  if (change === null || change === undefined || isNaN(change) || change === 0) return 'text-app-text';
  if (change > 0) return 'text-success';
  return 'text-danger';
};
