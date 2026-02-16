import { create } from 'zustand';
import {
  Asset,
  Watchlist,
  DashboardLayouts,
  ApiState,
  PriceData,
  AppUser,
  DeepResearchItem,
  DeepResearchLayouts,
  DeepResearchStatus,
} from '@/types';
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
  dashboardLayouts: DashboardLayouts;
  setDashboardLayouts: (layouts: DashboardLayouts) => void;
  resetDashboardLayout: () => void;

  // Users
  users: AppUser[];
  activeUserId: string | null;
  addUser: (name: string) => void;
  setActiveUser: (id: string) => void;
  removeUser: (id: string) => void;

  // Deep Research
  deepResearchItems: DeepResearchItem[];
  activeDeepResearchItemId: string | null;
  setActiveDeepResearchItem: (id: string | null) => void;
  upsertDeepResearchItemForAsset: (asset: Asset) => void;
  updateDeepResearchStatus: (id: string, status: DeepResearchStatus) => void;
  updateDeepResearchNotes: (id: string, notes: string) => void;
  updateDeepResearchLongform: (id: string, markdown: string) => void;
  updateDeepResearchStickyNotes: (id: string, notes: string) => void;
  updateDeepResearchSources: (id: string, updater: (sources: DeepResearchItem['sources']) => DeepResearchItem['sources']) => void;
  updateDeepResearchBacktestConfig: (id: string, updater: (config: DeepResearchItem['backtestConfig']) => DeepResearchItem['backtestConfig']) => void;
  updateDeepResearchChatMessages: (id: string, messages: DeepResearchItem['chatMessages']) => void;
  deepResearchLayouts: DeepResearchLayouts;
  setDeepResearchLayouts: (layouts: DeepResearchLayouts) => void;
  resetDeepResearchLayouts: () => void;
}

const defaultDesktopLayout = [
  { i: 'chart', x: 0, y: 0, w: 8, h: 4, minW: 4, minH: 3 },
  { i: 'metrics', x: 8, y: 0, w: 4, h: 2, minW: 2, minH: 2 },
  { i: 'news', x: 8, y: 2, w: 4, h: 2, minW: 2, minH: 2 },
];

const defaultMobileLayout = [
  { i: 'chart', x: 0, y: 0, w: 12, h: 4, minW: 2, minH: 3 },
  { i: 'metrics', x: 0, y: 4, w: 12, h: 4, minW: 2, minH: 2 },
  { i: 'news', x: 0, y: 8, w: 12, h: 4, minW: 2, minH: 2 },
];

const defaultLayouts: DashboardLayouts = {
  lg: defaultDesktopLayout,
  md: defaultDesktopLayout,
  sm: defaultDesktopLayout,
  xs: defaultMobileLayout,
  xxs: defaultMobileLayout,
};

const defaultDeepResearchLayouts: DeepResearchLayouts = {
  lg: [
    { i: 'notes', x: 0, y: 0, w: 6, h: 4, minW: 3, minH: 3 },
    { i: 'chat', x: 6, y: 0, w: 6, h: 4, minW: 3, minH: 3 },
    { i: 'slot3', x: 0, y: 4, w: 6, h: 3, minW: 3, minH: 2 },
    { i: 'slot4', x: 6, y: 4, w: 6, h: 3, minW: 3, minH: 2 },
  ],
  md: [
    { i: 'notes', x: 0, y: 0, w: 5, h: 4 },
    { i: 'chat', x: 5, y: 0, w: 5, h: 4 },
    { i: 'slot3', x: 0, y: 4, w: 5, h: 3 },
    { i: 'slot4', x: 5, y: 4, w: 5, h: 3 },
  ],
  sm: [
    { i: 'notes', x: 0, y: 0, w: 6, h: 4 },
    { i: 'chat', x: 0, y: 4, w: 6, h: 4 },
    { i: 'slot3', x: 0, y: 8, w: 6, h: 3 },
    { i: 'slot4', x: 0, y: 11, w: 6, h: 3 },
  ],
  xs: [
    { i: 'notes', x: 0, y: 0, w: 4, h: 4 },
    { i: 'chat', x: 0, y: 4, w: 4, h: 4 },
    { i: 'slot3', x: 0, y: 8, w: 4, h: 3 },
    { i: 'slot4', x: 0, y: 11, w: 4, h: 3 },
  ],
  xxs: [
    { i: 'notes', x: 0, y: 0, w: 2, h: 4 },
    { i: 'chat', x: 0, y: 4, w: 2, h: 4 },
    { i: 'slot3', x: 0, y: 8, w: 2, h: 3 },
    { i: 'slot4', x: 0, y: 11, w: 2, h: 3 },
  ],
};

const loadDashboardLayouts = (): DashboardLayouts => {
  const layouts = storage.get<DashboardLayouts | null>(STORAGE_KEYS.DASHBOARD_LAYOUTS, null);
  if (layouts && typeof layouts === 'object') return layouts;

  // Backwards compatibility: older versions stored a single desktop layout array.
  const legacy = storage.get<any>(STORAGE_KEYS.DASHBOARD_LAYOUT, null);
  if (Array.isArray(legacy) && legacy.length > 0) {
    const migrated: DashboardLayouts = {
      ...defaultLayouts,
      lg: legacy,
      md: legacy,
      sm: legacy,
    };
    storage.set(STORAGE_KEYS.DASHBOARD_LAYOUTS, migrated);
    return migrated;
  }

  storage.set(STORAGE_KEYS.DASHBOARD_LAYOUTS, defaultLayouts);
  return defaultLayouts;
};

const createDefaultWatchlist = (): Watchlist => ({
  id: generateId(),
  name: 'Meine Watchlist',
  assets: [],
  createdAt: Date.now(),
});

const createDefaultUser = (): AppUser => ({
  id: generateId(),
  name: 'Standard',
  createdAt: Date.now(),
});

const loadDeepResearchLayouts = (): DeepResearchLayouts => {
  const stored = storage.get<DeepResearchLayouts | null>(STORAGE_KEYS.DEEP_RESEARCH_LAYOUTS, null);
  if (stored && typeof stored === 'object') return stored;
  storage.set(STORAGE_KEYS.DEEP_RESEARCH_LAYOUTS, defaultDeepResearchLayouts);
  return defaultDeepResearchLayouts;
};

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
  dashboardLayouts: loadDashboardLayouts(),
  setDashboardLayouts: (layouts) => {
    storage.set(STORAGE_KEYS.DASHBOARD_LAYOUTS, layouts);
    set({ dashboardLayouts: layouts });
  },
  resetDashboardLayout: () => {
    storage.set(STORAGE_KEYS.DASHBOARD_LAYOUTS, defaultLayouts);
    set({ dashboardLayouts: defaultLayouts });
  },

  // Users
  users: storage.get(STORAGE_KEYS.USERS, [createDefaultUser()]),
  activeUserId: storage.get(STORAGE_KEYS.ACTIVE_USER, null),
  addUser: (name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const newUser: AppUser = {
      id: generateId(),
      name: trimmed,
      createdAt: Date.now(),
    };
    set((state) => {
      const updated = [...state.users, newUser];
      storage.set(STORAGE_KEYS.USERS, updated);
      storage.set(STORAGE_KEYS.ACTIVE_USER, newUser.id);
      return { users: updated, activeUserId: newUser.id };
    });
  },
  setActiveUser: (id) => {
    storage.set(STORAGE_KEYS.ACTIVE_USER, id);
    set({ activeUserId: id });
  },
  removeUser: (id) => {
    set((state) => {
      const remainingUsers = state.users.filter((u) => u.id !== id);
      const remainingItems = state.deepResearchItems.filter((item) => item.userId !== id);

      let newActiveUserId: string | null = state.activeUserId;
      if (state.activeUserId === id) {
        newActiveUserId = remainingUsers[0]?.id ?? null;
      }

      let newActiveItemId: string | null = state.activeDeepResearchItemId;
      if (state.activeDeepResearchItemId) {
        const stillExists = remainingItems.some((i) => i.id === state.activeDeepResearchItemId);
        if (!stillExists) {
          newActiveItemId = null;
        }
      }

      storage.set(STORAGE_KEYS.USERS, remainingUsers);
      storage.set(STORAGE_KEYS.ACTIVE_USER, newActiveUserId);
      storage.set(STORAGE_KEYS.DEEP_RESEARCH_ITEMS, remainingItems);
      storage.set(STORAGE_KEYS.DEEP_RESEARCH_ACTIVE_ITEM, newActiveItemId);

      return {
        users: remainingUsers,
        activeUserId: newActiveUserId,
        deepResearchItems: remainingItems,
        activeDeepResearchItemId: newActiveItemId,
      };
    });
  },

  // Deep Research
  deepResearchItems: storage.get(STORAGE_KEYS.DEEP_RESEARCH_ITEMS, [] as DeepResearchItem[]),
  activeDeepResearchItemId: storage.get(STORAGE_KEYS.DEEP_RESEARCH_ACTIVE_ITEM, null),
  setActiveDeepResearchItem: (id) => {
    storage.set(STORAGE_KEYS.DEEP_RESEARCH_ACTIVE_ITEM, id);
    set({ activeDeepResearchItemId: id });
  },
  upsertDeepResearchItemForAsset: (asset) => {
    const state = get();
    const userId = state.activeUserId || state.users[0]?.id;
    if (!userId) return;

    set((current) => {
      const existing = current.deepResearchItems.find(
        (item) => item.userId === userId && item.asset.id === asset.id,
      );

      if (existing) {
        storage.set(STORAGE_KEYS.DEEP_RESEARCH_ACTIVE_ITEM, existing.id);
        return { activeDeepResearchItemId: existing.id };
      }

      const newItem: DeepResearchItem = {
        id: generateId(),
        userId,
        asset,
        status: 'in_arbeit',
        notes: '',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const updatedItems = [...current.deepResearchItems, newItem];
      storage.set(STORAGE_KEYS.DEEP_RESEARCH_ITEMS, updatedItems);
      storage.set(STORAGE_KEYS.DEEP_RESEARCH_ACTIVE_ITEM, newItem.id);

      return {
        deepResearchItems: updatedItems,
        activeDeepResearchItemId: newItem.id,
      };
    });
  },
  updateDeepResearchStatus: (id, status) => {
    set((state) => {
      const updated = state.deepResearchItems.map((item) =>
        item.id === id ? { ...item, status, updatedAt: Date.now() } : item,
      );
      storage.set(STORAGE_KEYS.DEEP_RESEARCH_ITEMS, updated);
      return { deepResearchItems: updated };
    });
  },
  updateDeepResearchNotes: (id, notes) => {
    set((state) => {
      const updated = state.deepResearchItems.map((item) =>
        item.id === id ? { ...item, notes, updatedAt: Date.now() } : item,
      );
      storage.set(STORAGE_KEYS.DEEP_RESEARCH_ITEMS, updated);
      return { deepResearchItems: updated };
    });
  },
  updateDeepResearchLongform: (id, markdown) => {
    set((state) => {
      const updated = state.deepResearchItems.map((item) =>
        item.id === id ? { ...item, longformMarkdown: markdown, updatedAt: Date.now() } : item,
      );
      storage.set(STORAGE_KEYS.DEEP_RESEARCH_ITEMS, updated);
      return { deepResearchItems: updated };
    });
  },
  updateDeepResearchStickyNotes: (id, notes) => {
    set((state) => {
      const updated = state.deepResearchItems.map((item) =>
        item.id === id ? { ...item, stickyNotes: notes, updatedAt: Date.now() } : item,
      );
      storage.set(STORAGE_KEYS.DEEP_RESEARCH_ITEMS, updated);
      return { deepResearchItems: updated };
    });
  },
  updateDeepResearchSources: (id, updater) => {
    set((state) => {
      const updated = state.deepResearchItems.map((item) => {
        if (item.id !== id) return item;
        const nextSources = updater(item.sources ?? []);
        return { ...item, sources: nextSources, updatedAt: Date.now() };
      });
      storage.set(STORAGE_KEYS.DEEP_RESEARCH_ITEMS, updated);
      return { deepResearchItems: updated };
    });
  },
  updateDeepResearchBacktestConfig: (id, updater) => {
    set((state) => {
      const updated = state.deepResearchItems.map((item) => {
        if (item.id !== id) return item;
        const currentConfig = item.backtestConfig ?? {
          description: '',
          startDate: '',
          endDate: '',
          notes: '',
        };
        const nextConfig = updater(currentConfig);
        return { ...item, backtestConfig: nextConfig, updatedAt: Date.now() };
      });
      storage.set(STORAGE_KEYS.DEEP_RESEARCH_ITEMS, updated);
      return { deepResearchItems: updated };
    });
  },
  updateDeepResearchChatMessages: (id, messages) => {
    set((state) => {
      const updated = state.deepResearchItems.map((item) =>
        item.id === id ? { ...item, chatMessages: messages ?? [], updatedAt: Date.now() } : item,
      );
      storage.set(STORAGE_KEYS.DEEP_RESEARCH_ITEMS, updated);
      return { deepResearchItems: updated };
    });
  },
  deepResearchLayouts: loadDeepResearchLayouts(),
  setDeepResearchLayouts: (layouts) => {
    storage.set(STORAGE_KEYS.DEEP_RESEARCH_LAYOUTS, layouts);
    set({ deepResearchLayouts: layouts });
  },
  resetDeepResearchLayouts: () => {
    storage.set(STORAGE_KEYS.DEEP_RESEARCH_LAYOUTS, defaultDeepResearchLayouts);
    set({ deepResearchLayouts: defaultDeepResearchLayouts });
  },
}));
