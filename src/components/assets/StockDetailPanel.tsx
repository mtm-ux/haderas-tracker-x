import React, { useState, useEffect } from 'react';
import { StockQuote, PriceData } from '@/types';
import { stockService } from '@/services/stockService';
import { finnhubService } from '@/services/finnhubService';
import { coinGeckoService } from '@/services/coinGeckoService';
import { binanceService } from '@/services/binanceService';
import { resolveCoinGeckoId } from '@/utils/coinGeckoIds';
import { X, TrendingUp, TrendingDown, Zap, Activity } from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Loader } from '@/components/common/Loader';

interface StockDetailPanelProps {
  stock: StockQuote;
  onClose?: () => void;
}

export const StockDetailPanel: React.FC<StockDetailPanelProps> = ({
  stock,
  onClose,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [priceData, setPriceData] = useState<PriceData | null>(null);

  // Lade erweiterte Daten vom API
  useEffect(() => {
    const loadPriceData = async () => {
      setIsLoading(true);
      try {
        // Bestimme ob Crypto oder Stock
        const isCrypto = stockService.isCryptoSymbol(stock.symbol);
        let data: PriceData | null = null;

        if (isCrypto) {
          // Für Crypto: Primär Binance (schneller), Fallback CoinGecko
          data = await binanceService.getPriceBySymbol(stock.symbol);
          if (!data) {
            const coinId = await resolveCoinGeckoId(stock.symbol);
            if (coinId) {
              data = await coinGeckoService.getPrice(coinId);
            }
          }
        } else {
          // Für Stocks: Finnhub API
          data = await finnhubService.getPrice(stock.symbol);
        }

        if (data) {
          setPriceData(data);
        }
      } catch (error) {
        console.error('Error loading price data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPriceData();
  }, [stock]);

  const displayPrice = priceData?.price ?? stock.price;
  const displayChangePercent = priceData?.changePercent24h ?? stock.change_percent;
  const displayChangeValue = priceData?.change24h ?? stock.change_value;

  const changeColor = stockService.getChangeColor(displayChangePercent);
  const isPositive = displayChangePercent >= 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

  return (
    <div className="flex flex-col h-full bg-app-bg">
      {/* Header mit Close Button */}
      <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-app-border sticky top-0 bg-app-surface z-10">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl md:text-3xl font-bold text-app-text">
            {stock.symbol}
          </h2>
          <p className="text-sm text-app-muted mt-1">
            {stock.name}
          </p>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-app-border rounded-lg transition-colors flex-shrink-0"
            title="Close"
          >
            <X className="w-5 h-5 text-app-text" />
          </button>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader />
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Price Card */}
            <Card>
              <div className="space-y-6">
                {/* Current Price */}
                <div>
                  <p className="text-sm text-app-muted mb-2">Aktueller Preis</p>
                  <p className="text-4xl md:text-5xl font-bold text-app-text">
                    {stockService.formatPrice(displayPrice)}
                  </p>
                </div>

                {/* Change Info */}
                <div className={`flex items-center gap-3 p-4 rounded-lg bg-app-bg ${
                  isPositive ? 'border border-success/30' : 'border border-danger/30'
                }`}>
                  <div className={`p-2 rounded-lg ${
                    isPositive ? 'bg-success/20' : 'bg-danger/20'
                  }`}>
                    <TrendIcon className={`w-5 h-5 ${changeColor}`} />
                  </div>
                  <div className="flex-1">
                    <p className={`text-lg font-bold ${changeColor}`}>
                      {stockService.formatChangePercent(displayChangePercent)}
                    </p>
                    <p className="text-sm text-app-muted">
                      {isPositive ? 'Anstieg' : 'Rückgang'} ({stockService.formatChangeValue(displayChangeValue)})
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Extended Data */}
            {priceData && (
              <Card>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-app-text flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary-500" />
                    Markt-Daten
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    {/* High */}
                    <div className="p-3 bg-app-bg rounded-lg">
                      <p className="text-xs text-app-muted mb-1">Tageshoch</p>
                      <p className="text-lg font-semibold text-app-text">
                        {priceData.high24h ? stockService.formatPrice(priceData.high24h) : '–'}
                      </p>
                    </div>

                    {/* Low */}
                    <div className="p-3 bg-app-bg rounded-lg">
                      <p className="text-xs text-app-muted mb-1">Tagestief</p>
                      <p className="text-lg font-semibold text-app-text">
                        {priceData.low24h ? stockService.formatPrice(priceData.low24h) : '–'}
                      </p>
                    </div>

                    {/* Volume */}
                    <div className="p-3 bg-app-bg rounded-lg">
                      <p className="text-xs text-app-muted mb-1">Volumen (24h)</p>
                      <p className="text-lg font-semibold text-app-text">
                        {priceData.volume24h ? `${(priceData.volume24h / 1_000_000).toFixed(1)}M` : '–'}
                      </p>
                    </div>

                    {/* Market Cap */}
                    <div className="p-3 bg-app-bg rounded-lg">
                      <p className="text-xs text-app-muted mb-1">Markt-Cap</p>
                      <p className="text-lg font-semibold text-app-text">
                        {priceData.marketCap ? stockService.formatMarketCap(priceData.marketCap) : '–'}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Market Cap */}
            {priceData?.marketCap && (
              <Card>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-app-text flex items-center gap-2">
                    <Zap className="w-5 h-5 text-primary-500" />
                    Markt-Kapitalisierung
                  </h3>
                  <p className="text-2xl font-bold text-app-text">
                    {stockService.formatMarketCap(priceData.marketCap)}
                  </p>
                </div>
              </Card>
            )}

            {/* Fallback: If no API data */}
            {!priceData && !isLoading && (
              <Card>
                <div className="text-center py-6">
                  <p className="text-sm text-app-muted">
                    Erweiterte Markt-Daten konnten nicht geladen werden
                  </p>
                </div>
              </Card>
            )}

            {/* Info Card */}
            <Card>
              <div className="space-y-3 text-sm text-app-muted">
                <p>
                  ℹ️ Diese Daten werden in Echtzeit von Finnhub (Stocks) und CoinGecko (Crypto) abgerufen.
                </p>
                <p>
                  💡 Klicke auf den X-Button um zur Assets-Übersicht zurückzukehren.
                </p>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
