import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Loader } from '@/components/common/Loader';
import { PriceFlash } from '@/components/common/PriceFlash';
import { useStore } from '@/store';
import { useLivePrice } from '@/hooks/useLivePrice';
import { formatCurrency, formatPercent, formatCompactNumber } from '@/utils/formatters';

export const MetricsWidget: React.FC = () => {
  const { selectedAsset } = useStore();
  const { priceData, isLoading } = useLivePrice(selectedAsset, 30000);

  if (!selectedAsset) {
    return (
      <Card title="Metriken" className="h-full">
        <div className="flex items-center justify-center h-full">
          <p className="text-app-muted text-sm">
            Wähle ein Asset aus
          </p>
        </div>
      </Card>
    );
  }

  if (isLoading && !priceData) {
    return (
      <Card title="Metriken" className="h-full">
        <div className="flex items-center justify-center h-full">
          <Loader size="md" />
        </div>
      </Card>
    );
  }

  if (!priceData) {
    return (
      <Card title="Metriken" className="h-full">
        <div className="flex items-center justify-center h-full">
          <p className="text-danger text-sm">
            Fehler beim Laden der Daten
          </p>
        </div>
      </Card>
    );
  }

  const isPositive = priceData.changePercent24h >= 0;

  return (
    <Card title="Metriken" className="h-full">
      <div className="space-y-4">
        {/* Current Price */}
        <div>
          <div className="text-xs text-app-muted mb-1">Aktueller Preis</div>
          <PriceFlash
            value={priceData.price}
            formatter={(val) => formatCurrency(val, 'USD')}
            className="text-2xl font-bold"
          />
        </div>

        {/* 24h Change */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-app-muted mb-1">24h Änderung</div>
            <div className="flex items-center gap-2">
              {isPositive ? (
                <TrendingUp className="w-4 h-4 text-success" />
              ) : (
                <TrendingDown className="w-4 h-4 text-danger" />
              )}
              <span className={`text-sm font-semibold ${isPositive ? 'text-success' : 'text-danger'}`}>
                {formatPercent(priceData.changePercent24h)}
              </span>
            </div>
          </div>
          <div>
            <div className="text-xs text-app-muted mb-1">24h Change ($)</div>
            <span className={`text-sm font-semibold ${isPositive ? 'text-success' : 'text-danger'}`}>
              {priceData.change24h > 0 ? '+' : ''}
              {formatCurrency(priceData.change24h, 'USD')}
            </span>
          </div>
        </div>

        {/* High / Low */}
        {priceData.high24h && priceData.low24h && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-app-muted mb-1">24h Hoch</div>
              <div className="text-sm font-semibold text-success">
                {formatCurrency(priceData.high24h, 'USD')}
              </div>
            </div>
            <div>
              <div className="text-xs text-app-muted mb-1">24h Tief</div>
              <div className="text-sm font-semibold text-danger">
                {formatCurrency(priceData.low24h, 'USD')}
              </div>
            </div>
          </div>
        )}

        {/* Market Cap & Volume */}
        {priceData.marketCap && (
          <div>
            <div className="text-xs text-app-muted mb-1">Market Cap</div>
            <div className="text-sm font-semibold text-app-text">
              {formatCompactNumber(priceData.marketCap, 'USD')}
            </div>
          </div>
        )}

        {priceData.volume24h && (
          <div>
            <div className="text-xs text-app-muted mb-1">24h Volumen</div>
            <div className="text-sm font-semibold text-app-text">
              {formatCompactNumber(priceData.volume24h, 'USD')}
            </div>
          </div>
        )}

        {/* Last Update */}
        <div className="pt-4 border-t border-app-border">
          <div className="text-xs text-app-muted">
            Aktualisiert: {new Date(priceData.lastUpdate).toLocaleTimeString('de-DE')}
          </div>
        </div>
      </div>
    </Card>
  );
};
