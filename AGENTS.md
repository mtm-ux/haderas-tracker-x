# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Haderas Tracker X is a fintech dashboard application for tracking cryptocurrencies and stocks in real-time. The UI follows a TradingView-inspired design. The codebase and UI are primarily in **German**.

## Development Commands

```bash
npm run dev          # Start dev server at http://localhost:3000
npm run build        # TypeScript compile + Vite production build
npm run lint         # Run ESLint
npm run lint:fix     # Run ESLint with auto-fix
npm run preview      # Preview production build locally
```

## Architecture

### Path Aliases
All imports use `@/` as alias for `src/`. Configured in both `tsconfig.json` and `vite.config.ts`.

### Pages & Routing
Routes defined in `App.tsx` using react-router-dom:
- `/` → `DashboardPage` - Main widget-based dashboard
- `/entdecken` → `EntdeckenPage` - Asset discovery
- `/deep-research` → `DeepResearchPage` - In-depth asset analysis workspace
- `/trendanalyse` → `NexusTrendsPage` - Trend analysis engine
- `/jahresstrahl` → `JahresstrahlPage` - Timeline of market events
- `/assets` → `AssetsPage` - Stock watchlist management

### State Management
Single Zustand store at `src/store/index.ts`. All persistent state auto-syncs to LocalStorage via `storage.ts` wrapper. Storage keys prefixed with `haderas_`.

Key state domains:
- `selectedAsset` / `priceCache` - Current asset and price data
- `watchlists` - User watchlists with assets
- `dashboardLayouts` / `deepResearchLayouts` - Responsive grid layouts for react-grid-layout
- `deepResearchItems` - Per-asset research notes, sources, backtest config, chat history
- `users` - Multi-user support for research separation

### API Services Layer
`src/services/marketService.ts` provides a unified facade over:
- **CoinGecko** (`coinGeckoService.ts`) - Crypto prices/charts, no API key needed
- **Binance** (`binanceService.ts`) - Crypto candles with more intervals, no API key
- **Finnhub** (`finnhubService.ts`) - Stock data, requires `VITE_FINNHUB_API_KEY`
- **CryptoPanic** (`cryptoPanicService.ts`) - Crypto news, requires `VITE_CRYPTOPANIC_API_KEY`
- **Gemini** (`geminiService.ts`) - AI chat for research assistant

All services expose `setStatusCallback` for real-time API status display in the Navbar.

### Widget System
Dashboard uses `react-grid-layout` with responsive breakpoints (lg/md/sm/xs/xxs). Default layouts defined in store. Widgets:
- `ChartWidget` - lightweight-charts candlestick/line charts
- `MetricsWidget` - Price metrics with flash animation on change
- `NewsWidget` - News feed from CryptoPanic/Finnhub
- `TradingViewWidget` - Embedded TradingView chart alternative

### Data Types
Core types in `src/types/index.ts`:
- `Asset` - Base type with `id`, `symbol`, `name`, `type` (crypto|stock)
- `PriceData` / `CandleData` - Price and OHLCV data structures
- `TimeInterval` - Chart intervals: 1m/5m/15m/30m/1h/4h/1d/1w/1M/all
- `DeepResearchItem` - Full research workspace state per asset

## Code Conventions

- **Language**: German for UI text, comments can be German or English
- **Unused variables**: Prefix with `_` to silence linter (e.g., `_unusedParam`)
- **TypeScript**: Strict mode enabled, avoid `any` (warn level)
- **Components**: Functional components with hooks, no class components
- **Styling**: Tailwind CSS utility classes, dark mode via `dark:` prefix

## Environment Variables

Required for full functionality (see `.env.example`):
```
VITE_FINNHUB_API_KEY=xxx      # Stock data
VITE_CRYPTOPANIC_API_KEY=xxx  # Crypto news
VITE_GEMINI_API_KEY=xxx       # AI research assistant
```

Restart dev server after `.env` changes.
