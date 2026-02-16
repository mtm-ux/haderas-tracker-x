import { StockWatchlist, StockWatchlistMap } from '@/types';

const STORAGE_KEY_WATCHLISTS = 'haderas_stock_watchlists';
const DEFAULT_WATCHLIST_ID = 'default';

/**
 * Initialize default watchlist if none exists
 */
function ensureDefaultWatchlist(watchlists: StockWatchlistMap): StockWatchlistMap {
  if (!watchlists[DEFAULT_WATCHLIST_ID]) {
    watchlists[DEFAULT_WATCHLIST_ID] = {
      id: DEFAULT_WATCHLIST_ID,
      name: 'Meine Favoriten',
      displayName: 'Favoriten',
      symbols: ['AAPL', 'MSFT', 'BTC', 'ETH'],
      description: 'Deine Standard-Watchlist',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }
  return watchlists;
}

export const watchlistStorage = {
  /**
   * Alle Watchlists aus Storage laden
   */
  loadWatchlists(): StockWatchlistMap {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_WATCHLISTS);
      let watchlists = stored ? JSON.parse(stored) : {};
      watchlists = ensureDefaultWatchlist(watchlists);
      return watchlists;
    } catch (error) {
      console.error('Failed to load watchlists:', error);
      return ensureDefaultWatchlist({});
    }
  },

  /**
   * Alle Watchlists speichern
   */
  saveWatchlists(watchlists: StockWatchlistMap): void {
    try {
      localStorage.setItem(STORAGE_KEY_WATCHLISTS, JSON.stringify(watchlists));
    } catch (error) {
      console.error('Failed to save watchlists:', error);
    }
  },

  /**
   * Eine spezifische Watchlist laden
   */
  getWatchlist(id: string = DEFAULT_WATCHLIST_ID): StockWatchlist | null {
    const watchlists = this.loadWatchlists();
    return watchlists[id] || null;
  },

  /**
   * Neue Watchlist erstellen
   */
  createWatchlist(
    name: string,
    displayName?: string,
    symbols: string[] = []
  ): StockWatchlist {
    const id = `watchlist-${Date.now()}`;
    const watchlist: StockWatchlist = {
      id,
      name,
      displayName: displayName || name,
      symbols,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const watchlists = this.loadWatchlists();
    watchlists[id] = watchlist;
    this.saveWatchlists(watchlists);

    return watchlist;
  },

  /**
   * Watchlist aktualisieren
   */
  updateWatchlist(
    id: string,
    updates: Partial<Omit<StockWatchlist, 'id' | 'createdAt'>>
  ): StockWatchlist | null {
    const watchlists = this.loadWatchlists();
    const watchlist = watchlists[id];

    if (!watchlist) return null;

    const updated = {
      ...watchlist,
      ...updates,
      updatedAt: Date.now(),
    };

    watchlists[id] = updated;
    this.saveWatchlists(watchlists);

    return updated;
  },

  /**
   * Watchlist löschen
   */
  deleteWatchlist(id: string): boolean {
    if (id === DEFAULT_WATCHLIST_ID) {
      console.warn('Cannot delete default watchlist');
      return false;
    }

    const watchlists = this.loadWatchlists();
    if (!watchlists[id]) return false;

    delete watchlists[id];
    this.saveWatchlists(watchlists);

    return true;
  },

  /**
   * Symbol zu Watchlist hinzufügen
   */
  addSymbolToWatchlist(watchlistId: string, symbol: string): boolean {
    const watchlist = this.getWatchlist(watchlistId);
    if (!watchlist) return false;

    if (watchlist.symbols.includes(symbol.toUpperCase())) {
      return false; // Already exists
    }

    watchlist.symbols.push(symbol.toUpperCase());
    this.updateWatchlist(watchlistId, { symbols: watchlist.symbols });

    return true;
  },

  /**
   * Symbol aus Watchlist entfernen
   */
  removeSymbolFromWatchlist(watchlistId: string, symbol: string): boolean {
    const watchlist = this.getWatchlist(watchlistId);
    if (!watchlist) return false;

    const index = watchlist.symbols.indexOf(symbol.toUpperCase());
    if (index === -1) return false;

    watchlist.symbols.splice(index, 1);
    this.updateWatchlist(watchlistId, { symbols: watchlist.symbols });

    return true;
  },

  /**
   * Watchlist-Reihenfolge ändern
   */
  reorderSymbols(watchlistId: string, symbols: string[]): boolean {
    const watchlist = this.getWatchlist(watchlistId);
    if (!watchlist) return false;

    watchlist.symbols = symbols;
    this.updateWatchlist(watchlistId, { symbols });

    return true;
  },

  /**
   * Alle Watchlists als Array abrufen
   */
  getAllWatchlistsAsArray(): StockWatchlist[] {
    const watchlists = this.loadWatchlists();
    return Object.values(watchlists).sort(
      (a, b) => a.createdAt - b.createdAt
    );
  },

  /**
   * Default Watchlist ID
   */
  getDefaultWatchlistId(): string {
    return DEFAULT_WATCHLIST_ID;
  },
};
