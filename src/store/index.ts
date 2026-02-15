import { create } from 'zustand';
import { Asset, Watchlist, DashboardLayout, ApiState, PriceData } from '@/types';
import { storage, STORAGE_KEYS } from '@/utils/storage';
import { generateId } from '@/utils/formatters';

interface AppState {
  // Theme
  isDarkMode: boolean;
  toggleTheme: () => void;

  // Sidebar (Mobile)
  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;

  // API Status
  apiStatus: ApiState;
  setApiStatus: (service: keyof ApiState, status: ApiState[keyof ApiState]) => void;

  // Selected Asset
  selectedAsset: Asset | null;
  setSelectedAsset: (asset: Asset | null) => void;

  // Price Cache
  priceCache: Map<string, PriceData>;
  setPriceData: (assetId: string, data: PriceData) => void;
  getPriceData: (assetId: string) => PriceData | undefined;

  // Watchlists
  watchlists: Watchlist[];
  activeWatchlistId: string | null;
  addWatchlist: (name: string) => void;
  removeWatchlist: (id: string) => void;
  renameWatchlist: (id: string, name: string) => void;
  setActiveWatchlist: (id: string) => void;
  addAssetToWatchlist: (watchlistId: string, asset: Asset) => void;
  removeAssetFromWatchlist: (watchlistId: string, assetId: string) => void;

  // Dashboard Layout
  dashboardLayout: DashboardLayout[];
  setDashboardLayout: (layout: DashboardLayout[]) => void;
  resetDashboardLayout: () => void;
}

const defaultLayout: DashboardLayout[] = [
  { i: 'chart', x: 0, y: 0, w: 8, h: 4, minW: 4, minH: 3 },
  { i: 'metrics', x: 8, y: 0, w: 4, h: 2, minW: 2, minH: 2 },
  { i: 'news', x: 8, y: 2, w: 4, h: 2, minW: 2, minH: 2 },
];

const createDefaultWatchlist = (): Watchlist => ({
  id: generateId(),
  name: 'Meine Watchlist',
  assets: [],
  createdAt: Date.now(),
});

export const useStore = create<AppState>((set, get) => ({
  // Theme
  isDarkMode: storage.get(STORAGE_KEYS.THEME, true),
  toggleTheme: () => {
    set((state) => {
      const newValue = !state.isDarkMode;
      storage.set(STORAGE_KEYS.THEME, newValue);
      document.documentElement.classList.toggle('dark', newValue);
      return { isDarkMode: newValue };
    });
  },

  // Sidebar
  isSidebarOpen: false,
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

  // API Status
  apiStatus: {
    coinGecko: 'idle',
    finnhub: 'idle',
    binance: 'idle',
    cryptoPanic: 'idle',
  },
  setApiStatus: (service, status) => {
    set((state) => ({
      apiStatus: { ...state.apiStatus, [service]: status },
    }));
  },

  // Selected Asset
  selectedAsset: storage.get(STORAGE_KEYS.SELECTED_ASSET, null),
  setSelectedAsset: (asset) => {
    storage.set(STORAGE_KEYS.SELECTED_ASSET, asset);
    set({ selectedAsset: asset, isSidebarOpen: false }); // Auto-close sidebar on mobile after selection
  },

  // Price Cache
  priceCache: new Map(),
  setPriceData: (assetId, data) => {
    set((state) => {
      const newCache = new Map(state.priceCache);
      newCache.set(assetId, data);
      return { priceCache: newCache };
    });
  },
  getPriceData: (assetId) => {
    return get().priceCache.get(assetId);
  },

  // Watchlists
  watchlists: storage.get(STORAGE_KEYS.WATCHLISTS, [createDefaultWatchlist()]),
  activeWatchlistId: storage.get(STORAGE_KEYS.ACTIVE_WATCHLIST, null),

  addWatchlist: (name) => {
    const newWatchlist: Watchlist = {
      id: generateId(),
      name,
      assets: [],
      createdAt: Date.now(),
    };
    set((state) => {
      const updated = [...state.watchlists, newWatchlist];
      storage.set(STORAGE_KEYS.WATCHLISTS, updated);
      return { watchlists: updated };
    });
  },

  removeWatchlist: (id) => {
    set((state) => {
      const updated = state.watchlists.filter((w) => w.id !== id);
      storage.set(STORAGE_KEYS.WATCHLISTS, updated);

      // Wenn die aktive Watchlist gelöscht wurde, setze die erste als aktiv
      let newActiveId = state.activeWatchlistId;
      if (state.activeWatchlistId === id && updated.length > 0) {
        newActiveId = updated[0].id;
        storage.set(STORAGE_KEYS.ACTIVE_WATCHLIST, newActiveId);
      }

      return { watchlists: updated, activeWatchlistId: newActiveId };
    });
  },

  renameWatchlist: (id, name) => {
    set((state) => {
      const updated = state.watchlists.map((w) =>
        w.id === id ? { ...w, name } : w
      );
      storage.set(STORAGE_KEYS.WATCHLISTS, updated);
      return { watchlists: updated };
    });
  },

  setActiveWatchlist: (id) => {
    storage.set(STORAGE_KEYS.ACTIVE_WATCHLIST, id);
    set({ activeWatchlistId: id });
  },

  addAssetToWatchlist: (watchlistId, asset) => {
    set((state) => {
      const updated = state.watchlists.map((w) => {
        if (w.id === watchlistId) {
          // Prüfe ob Asset bereits existiert
          const exists = w.assets.some((a) => a.id === asset.id);
          if (exists) return w;
          return { ...w, assets: [...w.assets, asset] };
        }
        return w;
      });
      storage.set(STORAGE_KEYS.WATCHLISTS, updated);
      return { watchlists: updated };
    });
  },

  removeAssetFromWatchlist: (watchlistId, assetId) => {
    set((state) => {
      const updated = state.watchlists.map((w) => {
        if (w.id === watchlistId) {
          return { ...w, assets: w.assets.filter((a) => a.id !== assetId) };
        }
        return w;
      });
      storage.set(STORAGE_KEYS.WATCHLISTS, updated);
      return { watchlists: updated };
    });
  },

  // Dashboard Layout
  dashboardLayout: storage.get(STORAGE_KEYS.DASHBOARD_LAYOUT, defaultLayout),
  setDashboardLayout: (layout) => {
    storage.set(STORAGE_KEYS.DASHBOARD_LAYOUT, layout);
    set({ dashboardLayout: layout });
  },
  resetDashboardLayout: () => {
    storage.set(STORAGE_KEYS.DASHBOARD_LAYOUT, defaultLayout);
    set({ dashboardLayout: defaultLayout });
  },
}));
