import React, { useState, useEffect } from 'react';
import { StockList } from '@/components/assets/StockList';
import { StockDetailPanel } from '@/components/assets/StockDetailPanel';
import { StockQuote } from '@/types';
import { useStore } from '@/store';

export const AssetsPage: React.FC = () => {
  const { selectedAsset } = useStore();
  const [selectedStock, setSelectedStock] = useState<StockQuote | null>(null);

  // Wenn ein Asset aus der Watchlist ausgewählt wurde, setze es
  useEffect(() => {
    if (selectedAsset) {
      setSelectedStock({
        symbol: selectedAsset.symbol,
        name: selectedAsset.name,
        price: 0,
        change_percent: 0,
        change_value: 0,
      });
    }
  }, [selectedAsset]);

  return (
    <div className="flex h-full w-full">
      {/* Stock List - Links */}
      <div className={`flex-1 transition-all duration-300 ${
        selectedStock ? 'md:border-r md:border-app-border' : ''
      }`}>
        <StockList 
          watchlistId="default" 
          onStockClick={setSelectedStock}
        />
      </div>

      {/* Detail Panel - Rechts (nur auf Desktop oder wenn Modal) */}
      {selectedStock && (
        <div className={`
          fixed md:relative inset-0 md:inset-auto z-50 md:z-auto
          w-full md:w-1/2 lg:w-2/5 h-full
          bg-app-bg md:bg-inherit
          animate-in slide-in-from-right duration-300
        `}>
          <StockDetailPanel
            stock={selectedStock}
            onClose={() => setSelectedStock(null)}
          />
        </div>
      )}
    </div>
  );
};
