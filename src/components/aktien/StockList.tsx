import React, { useState, useEffect, useMemo } from 'react';
import { StockQuote, StockWatchlist } from '@/types';
import { stockService } from '@/services/stockService';
import { watchlistStorage } from '@/utils/watchlistStorage';
import { StockItem } from './StockItem';
import { AddStockModal } from './AddStockModal';
import { Card } from '@/components/common/Card';
import { Loader } from '@/components/common/Loader';
import { Plus, TrendingUp, Zap, RefreshCw } from 'lucide-react';

interface StockListProps {
  watchlistId?: string;
  isLoading?: boolean;
  stocks?: StockQuote[];
  onStockClick?: (stock: StockQuote) => void;
}

export const StockList: React.FC<StockListProps> = ({
  watchlistId = 'default',
  isLoading: externalLoading = false,
  stocks: externalStocks,
  onStockClick,
}) => {
  const [watchlist, setWatchlist] = useState<StockWatchlist | null>(null);
  const [stocks, setStocks] = useState<StockQuote[]>(externalStocks || []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [draggedSymbol, setDraggedSymbol] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'change'>('name');
  const [isLoading, setIsLoading] = useState(externalLoading);

  // Load watchlist
  useEffect(() => {
    const loaded = watchlistStorage.getWatchlist(watchlistId);
    if (loaded) {
      setWatchlist(loaded);
    }
  }, [watchlistId]);

  // Load stocks from API with fallback to mock
  useEffect(() => {
    const loadStocks = async () => {
      if (!watchlist || externalStocks) return;
      
      setIsLoading(true);
      try {
        const data = await stockService.fetchStocks(watchlist.symbols);
        setStocks(data);
      } catch (error) {
        console.error('Error loading stocks:', error);
        setStocks([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadStocks();
  }, [watchlist?.symbols?.join(','), externalStocks]);

  // Sort stocks
  const sortedStocks = useMemo(
    () => stockService.sortStocks([...(externalStocks || stocks)], sortBy),
    [externalStocks, stocks, sortBy]
  );

  const stats = useMemo(
    () => ({
      up: sortedStocks.filter((s) => s.change_percent > 0).length,
      down: sortedStocks.filter((s) => s.change_percent < 0).length,
    }),
    [sortedStocks]
  );

  const handleAddStock = (symbol: string): void => {
    if (watchlist) {
      watchlistStorage.addSymbolToWatchlist(watchlistId, symbol);
      // Force reload by getting fresh watchlist
      const updated = watchlistStorage.getWatchlist(watchlistId);
      if (updated) {
        setWatchlist({ ...updated });
      }
    }
    setIsModalOpen(false);
  };

  const handleRemoveStock = (symbol: string): void => {
    if (watchlist) {
      watchlistStorage.removeSymbolFromWatchlist(watchlistId, symbol);
      const updated = watchlistStorage.getWatchlist(watchlistId);
      if (updated) {
        setWatchlist({ ...updated });
      }
      setStocks((prev) => prev.filter((s) => s.symbol !== symbol));
    }
  };

  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    symbol: string
  ): void => {
    setDraggedSymbol(symbol);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (
    e: React.DragEvent<HTMLDivElement>,
    targetSymbol: string
  ): void => {
    e.preventDefault();

    if (!draggedSymbol || draggedSymbol === targetSymbol || !watchlist) return;

    // Reorder symbols in watchlist
    const symbols = [...watchlist.symbols];
    const dragIndex = symbols.indexOf(draggedSymbol);
    const targetIndex = symbols.indexOf(targetSymbol);

    if (dragIndex === -1 || targetIndex === -1) return;

    // Swap positions
    [symbols[dragIndex], symbols[targetIndex]] = [symbols[targetIndex], symbols[dragIndex]];

    // Update storage and state
    watchlistStorage.reorderSymbols(watchlistId, symbols);
    setWatchlist((prev) => (prev ? { ...prev, symbols } : prev));

    setDraggedSymbol(null);
  };

  const handleRefresh = async (): Promise<void> => {
    if (!watchlist) return;
    
    setIsLoading(true);
    try {
      const data = await stockService.fetchStocks(watchlist.symbols);
      setStocks(data);
    } catch (error) {
      console.error('Error refreshing stocks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!watchlist) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-3 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-app-text flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary-400" />
            {watchlist.displayName}
          </h2>
          <p className="text-sm text-app-muted mt-1">{watchlist.description}</p>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 self-start md:self-auto">
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-app-bg border border-app-border text-app-text rounded-lg hover:bg-app-bg/80 transition-colors disabled:opacity-50 whitespace-nowrap"
            title="Aktualisieren"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Aktie hinzufügen
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4">
          <div className="text-2xl font-bold text-app-text">{sortedStocks.length}</div>
          <p className="text-xs text-app-muted">Positionen</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <div className="text-xl font-bold text-success">{stats.up}</div>
            <div className="text-xl font-bold text-danger">{stats.down}</div>
          </div>
          <p className="text-xs text-app-muted">↑ ↓</p>
        </Card>
      </div>

      {/* Sort Controls */}
      <div className="flex gap-2">
        <button
          onClick={() => setSortBy('name')}
          className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
            sortBy === 'name'
              ? 'bg-primary-500 text-white'
              : 'bg-app-bg border border-app-border text-app-text hover:bg-app-bg/80'
          }`}
        >
          Name
        </button>
        <button
          onClick={() => setSortBy('price')}
          className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
            sortBy === 'price'
              ? 'bg-primary-500 text-white'
              : 'bg-app-bg border border-app-border text-app-text hover:bg-app-bg/80'
          }`}
        >
          Preis
        </button>
        <button
          onClick={() => setSortBy('change')}
          className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
            sortBy === 'change'
              ? 'bg-primary-500 text-white'
              : 'bg-app-bg border border-app-border text-app-text hover:bg-app-bg/80'
          }`}
        >
          Änderung
        </button>
      </div>

      {/* Stock List */}
      <Card title="Aktueller Stand" className="flex-1 flex">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader />
          </div>
        ) : sortedStocks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-app-muted">
            <Zap className="w-8 h-8 mb-2 opacity-50" />
            <p>Keine Aktien in dieser Watchlist</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-3 px-4 py-2 text-sm font-semibold text-primary-400 hover:text-primary-300 transition-colors"
            >
              Jetzt hinzufügen
            </button>
          </div>
        ) : (
          <div className="w-full space-y-2 p-4">
            {sortedStocks.map((stock) => (
              <div
                key={stock.symbol}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stock.symbol)}
              >
                <StockItem
                  stock={stock}
                  isDragging={draggedSymbol === stock.symbol}
                  onDragStart={handleDragStart}
                  onRemove={handleRemoveStock}
                  onClick={() => onStockClick?.(stock)}
                />
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Add Stock Modal */}
      <AddStockModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddStock}
        currentSymbols={watchlist.symbols}
      />
    </div>
  );
};
