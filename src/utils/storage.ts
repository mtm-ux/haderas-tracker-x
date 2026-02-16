/**
 * Type-safe LocalStorage Wrapper
 */

export const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading from localStorage (${key}):`, error);
      return defaultValue;
    }
  },

  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to localStorage (${key}):`, error);
    }
  },

  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing from localStorage (${key}):`, error);
    }
  },

  clear: (): void => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  },
};

// Storage Keys
export const STORAGE_KEYS = {
  WATCHLISTS: 'haderas_watchlists',
  DASHBOARD_LAYOUT: 'haderas_dashboard_layout',
  DASHBOARD_LAYOUTS: 'haderas_dashboard_layouts',
  THEME: 'haderas_theme',
  ACTIVE_WATCHLIST: 'haderas_active_watchlist',
  SELECTED_ASSET: 'haderas_selected_asset',
  USERS: 'haderas_users',
  ACTIVE_USER: 'haderas_active_user',
  DEEP_RESEARCH_ITEMS: 'haderas_deep_research_items',
  DEEP_RESEARCH_ACTIVE_ITEM: 'haderas_deep_research_active_item',
  DEEP_RESEARCH_LAYOUTS: 'haderas_deep_research_layouts',
  SIDEBAR_COLLAPSED: 'haderas_sidebar_collapsed',
} as const;
