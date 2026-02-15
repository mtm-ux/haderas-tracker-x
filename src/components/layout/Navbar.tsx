import React, { useState, useEffect, useRef } from 'react';
import { Search, Moon, Sun, Menu } from 'lucide-react';
import { useStore } from '@/store';
import { marketService } from '@/services/marketService';
import { SearchResult } from '@/types';
import { debounce } from '@/utils/formatters';
import { motion, AnimatePresence } from 'framer-motion';

export const Navbar: React.FC = () => {
  const { isDarkMode, toggleTheme, apiStatus, setApiStatus, setSelectedAsset, toggleSidebar } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Setup API Status Callbacks
  useEffect(() => {
    marketService.setStatusCallbacks({
      coinGecko: (status) => setApiStatus('coinGecko', status),
      finnhub: (status) => setApiStatus('finnhub', status),
      binance: (status) => setApiStatus('binance', status),
      cryptoPanic: (status) => setApiStatus('cryptoPanic', status),
    });
  }, [setApiStatus]);

  // Handle click outside search
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = debounce(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    // setIsSearching(true);
    try {
      const results = await marketService.search(query);
      setSearchResults(results);
      setShowResults(true);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      // setIsSearching(false);
    }
  }, 300);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    handleSearch(query);
  };

  const handleSelectAsset = (result: SearchResult) => {
    setSelectedAsset({
      id: result.id,
      symbol: result.symbol,
      name: result.name,
      type: result.type,
    });
    setSearchQuery('');
    setShowResults(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-success';
      case 'connecting':
        return 'bg-yellow-500';
      case 'error':
        return 'bg-danger';
      default:
        return 'bg-app-muted';
    }
  };


  return (
    <nav className="bg-app-surface border-b border-app-border px-4 md:px-6 py-3 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3 md:gap-6">
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-app-bg rounded-lg lg:hidden text-app-text transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent whitespace-nowrap hidden sm:block">
          Haderas Tracker X
        </h1>

        {/* Search */}
        <div className="relative" ref={searchRef}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-app-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleInputChange}
              onFocus={() => searchResults.length > 0 && setShowResults(true)}
              placeholder="Ticker..."
              className="bg-app-bg border border-app-border rounded-lg pl-10 pr-4 py-2 text-sm text-app-text placeholder-app-muted focus:outline-none focus:border-primary-500 w-32 sm:w-48 md:w-64 transition-all"
            />
          </div>

          {/* Search Results */}
          <AnimatePresence>
            {showResults && searchResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 mt-2 w-[280px] sm:w-full bg-app-surface border border-app-border rounded-lg shadow-xl max-h-96 overflow-y-auto z-50"
              >
                {searchResults.map((result) => (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleSelectAsset(result)}
                    className="w-full px-4 py-3 text-left hover:bg-app-bg transition-colors border-b border-app-border last:border-0"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold text-app-text">
                          {result.symbol}
                        </div>
                        <div className="text-xs text-app-muted">{result.name}</div>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded ${result.type === 'crypto'
                          ? 'bg-primary-500/20 text-primary-400'
                          : 'bg-purple-500/20 text-purple-400'
                          }`}
                      >
                        {result.type === 'crypto' ? 'Crypto' : 'Aktie'}
                      </span>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* API Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${getStatusColor(apiStatus.coinGecko)}`} />
            <span className="text-xs text-app-muted hidden md:block">CoinGecko</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${getStatusColor(apiStatus.finnhub)}`} />
            <span className="text-xs text-app-muted hidden md:block">Finnhub</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${getStatusColor(apiStatus.binance)}`} />
            <span className="text-xs text-app-muted hidden md:block">Binance</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${getStatusColor(apiStatus.cryptoPanic)}`} />
            <span className="text-xs text-app-muted hidden md:block">News</span>
          </div>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 hover:bg-app-bg rounded-lg transition-colors"
          aria-label="Toggle theme"
        >
          {isDarkMode ? (
            <Sun className="w-5 h-5 text-app-text" />
          ) : (
            <Moon className="w-5 h-5 text-app-text" />
          )}
        </button>
      </div>
    </nav>
  );
};
