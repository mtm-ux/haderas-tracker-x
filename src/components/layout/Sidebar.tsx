import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { useStore } from '@/store';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink, useNavigate } from 'react-router-dom';

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const {
    watchlists,
    activeWatchlistId,
    addWatchlist,
    removeWatchlist,
    renameWatchlist,
    setActiveWatchlist,
    addAssetToWatchlist,
    removeAssetFromWatchlist,
    selectedAsset,
    setSelectedAsset,
    isSidebarOpen,
    setSidebarOpen,
    isSidebarCollapsed,
  } = useStore();

  const [isCreating, setIsCreating] = useState(false);
  const [newWatchlistName, setNewWatchlistName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const activeWatchlist = watchlists.find((w) => w.id === activeWatchlistId) || watchlists[0];

  const handleCreateWatchlist = () => {
    if (newWatchlistName.trim()) {
      addWatchlist(newWatchlistName.trim());
      setNewWatchlistName('');
      setIsCreating(false);
    }
  };

  const handleRenameWatchlist = (id: string) => {
    if (editName.trim()) {
      renameWatchlist(id, editName.trim());
      setEditingId(null);
      setEditName('');
    }
  };

  const handleAddAsset = () => {
    if (selectedAsset && activeWatchlist) {
      addAssetToWatchlist(activeWatchlist.id, selectedAsset);
    }
  };

  const isAssetInWatchlist = activeWatchlist?.assets.some((a) => a.id === selectedAsset?.id);

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      <div className={`
        fixed top-[56px] bottom-0 left-0 z-50 bg-app-surface border-r border-app-border flex flex-col w-80 md:h-[calc(100vh-57px)] md:top-0 md:bottom-auto md:static
        transition-all duration-300 md:translate-x-0
        ${isSidebarCollapsed ? 'md:w-0 md:overflow-hidden md:border-r-0' : 'md:w-80'}
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Sidebar Header with Close Button */}
        <div className="border-b border-app-border px-4 py-3 flex items-center justify-between md:hidden">
          <h3 className="text-sm font-semibold text-app-text">Navigation</h3>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 hover:bg-app-bg rounded-lg transition-colors text-app-muted hover:text-app-text"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* App Pages - Vertical List für bessere Lesbarkeit */}
        <div className="border-b border-app-border p-4">
          <p className="text-xs font-semibold text-app-muted uppercase tracking-wider mb-3">Navigation</p>
          <div className="flex flex-col gap-2">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${isActive ? 'bg-primary-500/20 text-primary-300 font-semibold' : 'text-app-text hover:bg-app-bg'}`
              }
              onClick={() => setSidebarOpen(false)}
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/assets"
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${isActive ? 'bg-primary-500/20 text-primary-300 font-semibold' : 'text-app-text hover:bg-app-bg'}`
              }
              onClick={() => setSidebarOpen(false)}
            >
              Assets
            </NavLink>
            <NavLink
              to="/jahresstrahl"
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${isActive ? 'bg-primary-500/20 text-primary-300 font-semibold' : 'text-app-text hover:bg-app-bg'}`
              }
              onClick={() => setSidebarOpen(false)}
            >
              Zeitstrahl
            </NavLink>
            <NavLink
              to="/trends"
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${isActive ? 'bg-primary-500/20 text-primary-300 font-semibold' : 'text-app-text hover:bg-app-bg'}`
              }
              onClick={() => setSidebarOpen(false)}
            >
              Trends
            </NavLink>
            <NavLink
              to="/deep-research"
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${isActive ? 'bg-primary-500/20 text-primary-300 font-semibold' : 'text-app-text hover:bg-app-bg'}`
              }
              onClick={() => setSidebarOpen(false)}
            >
              Research
            </NavLink>
            <NavLink
              to="/entdecken"
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${isActive ? 'bg-primary-500/20 text-primary-300 font-semibold' : 'text-app-text hover:bg-app-bg'}`
              }
              onClick={() => setSidebarOpen(false)}
            >
              Entdecken
            </NavLink>
          </div>
        </div>

        {/* Watchlist Tabs */}
        <div className="border-b border-app-border">
          <div className="flex items-center overflow-x-auto scrollbar-hide">
            {watchlists.map((watchlist) => (
              <button
                key={watchlist.id}
                onClick={() => setActiveWatchlist(watchlist.id)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${watchlist.id === activeWatchlistId
                  ? 'border-primary-500 text-primary-400'
                  : 'border-transparent text-app-muted hover:text-app-text'
                  }`}
              >
                {watchlist.name}
              </button>
            ))}
            <button
              onClick={() => setIsCreating(true)}
              className="p-3 text-app-muted hover:text-app-text transition-colors"
              aria-label="Add watchlist"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Create New Watchlist */}
        <AnimatePresence>
          {isCreating && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-b border-app-border p-4"
            >
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newWatchlistName}
                  onChange={(e) => setNewWatchlistName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateWatchlist()}
                  placeholder="Watchlist-Name"
                  className="flex-1 bg-app-bg border border-app-border rounded px-3 py-2 text-sm text-app-text focus:outline-none focus:border-primary-500"
                  autoFocus
                />
                <button
                  onClick={handleCreateWatchlist}
                  className="p-2 text-success hover:bg-app-bg rounded transition-colors"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setIsCreating(false);
                    setNewWatchlistName('');
                  }}
                  className="p-2 text-danger hover:bg-app-bg rounded transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active Watchlist Controls */}
        {activeWatchlist && (
          <div className="border-b border-app-border p-4 flex items-center justify-between">
            {editingId === activeWatchlist.id ? (
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === 'Enter' && handleRenameWatchlist(activeWatchlist.id)
                  }
                  className="flex-1 bg-app-bg border border-app-border rounded px-3 py-1 text-sm text-app-text focus:outline-none focus:border-primary-500"
                  autoFocus
                />
                <button
                  onClick={() => handleRenameWatchlist(activeWatchlist.id)}
                  className="p-1 text-success hover:bg-app-bg rounded"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setEditingId(null);
                    setEditName('');
                  }}
                  className="p-1 text-danger hover:bg-app-bg rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-sm font-semibold text-app-text">{activeWatchlist.name}</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingId(activeWatchlist.id);
                      setEditName(activeWatchlist.name);
                    }}
                    className="p-1 text-app-muted hover:text-app-text transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  {watchlists.length > 1 && (
                    <button
                      onClick={() => removeWatchlist(activeWatchlist.id)}
                      className="p-1 text-danger hover:bg-app-bg rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Add Current Asset */}
        {selectedAsset && activeWatchlist && !isAssetInWatchlist && (
          <div className="border-b border-app-border p-4">
            <button
              onClick={handleAddAsset}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-500/20 text-primary-400 rounded-lg hover:bg-primary-500/30 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">
                {selectedAsset.symbol} hinzufügen
              </span>
            </button>
          </div>
        )}

        {/* Assets List */}
        <div className="flex-1 overflow-y-auto">
          {activeWatchlist?.assets.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-app-muted">
                Keine Assets in dieser Watchlist.
                <br />
                Suche nach einem Ticker und füge es hinzu.
              </p>
            </div>
          ) : (
            <div className="p-2">
              {activeWatchlist?.assets.map((asset) => (
                <motion.div
                  key={asset.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex items-center justify-between p-3 hover:bg-app-bg rounded-lg transition-colors group cursor-pointer"
                  onClick={() => {
                    setSelectedAsset(asset);
                    navigate('/assets');
                  }}
                >
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-app-text">
                      {asset.symbol}
                    </div>
                    <div className="text-xs text-app-muted truncate">{asset.name}</div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeAssetFromWatchlist(activeWatchlist.id, asset.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-danger hover:bg-app-surface rounded transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
