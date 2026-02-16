import React from 'react';
import { Compass, LayoutDashboard, RotateCcw, Search, ListChecks, Moon, Sun } from 'lucide-react';
import { Card } from '@/components/common/Card';
import { useStore } from '@/store';
import { Link } from 'react-router-dom';

export const EntdeckenPage: React.FC = () => {
  const { isDarkMode, toggleTheme, resetDashboardLayout } = useStore();

  return (
    <div className="h-full overflow-y-auto p-3 md:p-6">
      <div className="max-w-5xl mx-auto space-y-4 md:space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
              <Compass className="w-5 h-5 text-primary-400" />
              Entdecken
            </h2>
            <p className="text-sm text-app-muted mt-1">
              Alle Funktionen der App auf einen Blick.
            </p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-primary-500/15 text-primary-300 hover:bg-primary-500/25 transition-colors text-sm"
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard öffnen
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          <Card title="Suche" className="h-full">
            <div className="flex items-start gap-3">
              <Search className="w-5 h-5 text-primary-400 mt-0.5" />
              <div>
                <div className="text-sm font-semibold">Ticker-Suche</div>
                <div className="text-sm text-app-muted mt-1">
                  In der oberen Leiste nach Crypto/Stocks suchen und ein Asset auswählen.
                </div>
              </div>
            </div>
          </Card>

          <Card title="Watchlists" className="h-full">
            <div className="flex items-start gap-3">
              <ListChecks className="w-5 h-5 text-primary-400 mt-0.5" />
              <div>
                <div className="text-sm font-semibold">Assets organisieren</div>
                <div className="text-sm text-app-muted mt-1">
                  Links in der Sidebar Watchlists erstellen/umbenennen, Assets hinzufügen und entfernen.
                </div>
              </div>
            </div>
          </Card>

          <Card title="Dashboard Grid" className="h-full" action={
            <button
              onClick={resetDashboardLayout}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-app-bg border border-app-border hover:border-primary-500/60 transition-colors text-xs text-app-text"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Layout zurücksetzen
            </button>
          }>
            <div className="text-sm text-app-muted">
              Widgets per <span className="text-app-text">Drag</span> verschieben und per <span className="text-app-text">Resize</span> anpassen — jetzt auch auf Mobile.
            </div>
          </Card>

          <Card title="Theme" className="h-full" action={
            <button
              onClick={toggleTheme}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-app-bg border border-app-border hover:border-primary-500/60 transition-colors text-xs text-app-text"
            >
              {isDarkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              {isDarkMode ? 'Hell' : 'Dunkel'}
            </button>
          }>
            <div className="text-sm text-app-muted">
              Zwischen Dark/Light Mode umschalten (oben rechts oder hier).
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

