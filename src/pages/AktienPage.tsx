import React, { useState } from 'react';
import { StockList } from '@/components/aktien/StockList';
import { StockDetailPanel } from '@/components/aktien/StockDetailPanel';
import { StockQuote } from '@/types';

export const AktienPage: React.FC = () => {
  const [selectedStock, setSelectedStock] = useState<StockQuote | null>(null);

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
