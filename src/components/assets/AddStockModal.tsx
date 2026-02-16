import React, { useState, useCallback } from 'react';
import { X, Plus, Search, Loader } from 'lucide-react';
import { StockQuote } from '@/types';
import { stockService } from '@/services/stockService';

interface AddStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (symbol: string) => void;
  currentSymbols: string[];
  availableStocks?: StockQuote[];
}

// Popular stocks for quick selection
const POPULAR_STOCKS: StockQuote[] = [
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    price: 192.34,
    change_percent: -1.24,
    change_value: -2.41,
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corp.',
    price: 415.21,
    change_percent: 2.15,
    change_value: 8.77,
  },
  {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    price: 178.92,
    change_percent: 0.45,
    change_value: 0.80,
  },
  {
    symbol: 'AMZN',
    name: 'Amazon.com Inc.',
    price: 201.44,
    change_percent: -0.82,
    change_value: -1.66,
  },
  {
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    price: 287.65,
    change_percent: 3.24,
    change_value: 8.99,
  },
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    price: 98456.23,
    change_percent: 4.32,
    change_value: 4081.12,
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    price: 3350.88,
    change_percent: 2.87,
    change_value: 93.42,
  },
  {
    symbol: 'NVDA',
    name: 'NVIDIA Corp.',
    price: 145.67,
    change_percent: 1.89,
    change_value: 2.71,
  },
];

export const AddStockModal: React.FC<AddStockModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  currentSymbols,
  availableStocks = POPULAR_STOCKS,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [customSymbol, setCustomSymbol] = useState('');
  const [searchResults, setSearchResults] = useState<StockQuote[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // API-based search
  const handleSearch = useCallback(
    async (query: string) => {
      setSearchQuery(query);
      
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const results = await stockService.searchStocks(query);
        // Filter out already added stocks
        const filtered = results.filter((stock) => !currentSymbols.includes(stock.symbol));
        setSearchResults(filtered);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    [currentSymbols]
  );

  const handleAddStock = useCallback(
    (symbol: string) => {
      const upper = symbol.toUpperCase().trim();
      if (upper && !currentSymbols.includes(upper)) {
        onAdd(upper);
        setCustomSymbol('');
        setSearchQuery('');
        setSearchResults([]);
      }
    },
    [currentSymbols, onAdd]
  );

  // Show popular stocks if no search, otherwise show search results
  const displayStocks = searchQuery ? searchResults : availableStocks.filter(
    (stock) => !currentSymbols.includes(stock.symbol)
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-app-surface border border-app-border rounded-t-lg md:rounded-lg w-full md:w-96 max-h-[80vh] overflow-hidden shadow-xl flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-app-surface border-b border-app-border flex items-center justify-between p-4 md:p-5 flex-shrink-0">
          <h2 className="text-lg md:text-xl font-bold text-app-text">Asset hinzufügen</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-app-bg rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-app-muted" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="p-4 md:p-5 space-y-4">
            {/* Search Input with API Integration */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-app-muted pointer-events-none" />
              {isSearching && (
                <div className="absolute right-3 top-2.5">
                  <Loader className="w-4 h-4 text-app-text animate-spin" />
                </div>
              )}
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Ticker oder Name suchen..."
                className="w-full pl-9 pr-9 px-3 py-2 bg-app-bg border border-app-border rounded-lg text-app-text placeholder-app-muted focus:outline-none focus:border-primary-500"
              />
            </div>

            {/* Custom Symbol Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={customSymbol}
                onChange={(e) => setCustomSymbol(e.target.value.toUpperCase())}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddStock(customSymbol);
                  }
                }}
                placeholder="Oder Ticker eingeben..."
                className="flex-1 px-3 py-2 bg-app-bg border border-app-border rounded-lg text-app-text placeholder-app-muted focus:outline-none focus:border-primary-500"
              />
              <button
                onClick={() => handleAddStock(customSymbol)}
                disabled={!customSymbol.trim()}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add</span>
              </button>
            </div>

            {/* Popular/Filtered Stocks */}
            <div>
              <h3 className="text-xs font-semibold text-app-muted mb-3 uppercase tracking-wider">
                {searchQuery ? 'Suchergebnisse' : 'Beliebte Assets'}
              </h3>

              {displayStocks.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-app-muted">
                    {searchQuery
                      ? 'Keine Assets gefunden. Gib einen Ticker ein.'
                      : 'Alle Assets sind bereits hinzugefügt.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {displayStocks.map((stock) => (
                    <button
                      key={stock.symbol}
                      onClick={() => handleAddStock(stock.symbol)}
                      className="w-full text-left px-3 py-2 rounded-lg bg-app-bg hover:bg-app-bg/80 border border-app-border transition-colors group"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-app-text text-sm">
                            {stock.symbol}
                          </div>
                          <div className="text-xs text-app-muted">{stock.name}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-app-text text-sm">
                            ${stock.price.toFixed(2)}
                          </div>
                          <div
                            className={`text-xs font-semibold ${stockService.getChangeColor(stock.change_percent)}`}
                          >
                            {stockService.formatChangePercent(stock.change_percent)}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-app-border p-4 md:p-5 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-sm font-semibold text-app-text border border-app-border rounded-lg hover:bg-app-bg transition-colors"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
};
