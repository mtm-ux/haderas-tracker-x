# Changelog

Alle wichtigen Änderungen an diesem Projekt werden in dieser Datei dokumentiert.

## [1.1.0] - 2024-02-15

### 🔄 Updated

#### Dependencies
- **React** 18.2.0 → 18.3.1
- **React DOM** 18.2.0 → 18.3.1
- **Zustand** 4.4.7 → 4.5.5
- **Lightweight Charts** 4.1.3 → 4.2.0
- **Lucide React** 0.294.0 → 0.454.0
- **Framer Motion** 10.16.16 → 11.11.7
- **Axios** 1.6.2 → 1.7.7
- **Vite** 5.0.8 → 5.4.10
- **TypeScript** 5.2.2 → 5.6.3
- **Tailwind CSS** 3.3.6 → 3.4.14
- **PostCSS** 8.4.32 → 8.4.47
- **Autoprefixer** 10.4.16 → 10.4.20

#### Major Updates
- **ESLint** 8.55.0 → 9.14.0 (✅ Fixes deprecated warnings)
  - Migriert zu ESLint 9 Flat Config
  - Ersetzt `@typescript-eslint/*` mit `typescript-eslint`
  - Ersetzt deprecated `@humanwhocodes/*` packages
- **ESLint Plugins**
  - `eslint-plugin-react-hooks` 4.6.0 → 5.0.0
  - `eslint-plugin-react-refresh` 0.4.5 → 0.4.14

### ✨ Added
- **eslint.config.js** - Neue ESLint 9 Flat Config
- **globals** 15.11.0 - Für ESLint Browser Globals
- **@eslint/js** 9.14.0 - ESLint JavaScript Config
- Erweiterte `.gitignore` für Vercel/Netlify

### 🗑️ Removed
- Veraltete ESLint Plugins:
  - `@typescript-eslint/eslint-plugin`
  - `@typescript-eslint/parser`
  - `@humanwhocodes/config-array`
  - `@humanwhocodes/object-schema`

### 🐛 Fixed
- ❌ Deprecated package warnings:
  - `inflight@1.0.6` (memory leak) → Entfernt durch Updates
  - `glob@7.2.3` (security issues) → Behoben durch ESLint 9
  - `rimraf@3.0.2` → Behoben durch Updates
  - `eslint@8.x` → Aktualisiert auf 9.x

### 📝 Scripts
- `npm run lint` - Aktualisiert für ESLint 9
- `npm run lint:fix` - Neu: Automatische Fixes

### ⚙️ Configuration
- ESLint Config migriert zu Flat Config Format (eslint.config.js)
- Entfernt alte `.eslintrc` Konfiguration
- TypeScript ESLint vereinfacht mit `typescript-eslint` Package

---

## [1.0.0] - 2024-02-15

### ✨ Initial Release

#### Features
- 📊 Live Price Tracking für Crypto & Aktien
- 📈 TradingView-style Charts mit lightweight-charts
- 🔄 Drag-and-Drop Dashboard mit React Grid Layout
- 📋 Unbegrenzte Watchlists mit LocalStorage
- 📰 Crypto News Feed (CryptoPanic API)
- 🔌 API Status Monitoring
- 🔍 Asset Search mit Live-Suggestions
- 🌙 Dark Mode (TradingView Ästhetik)

#### APIs
- CoinGecko API (Crypto-Daten, kein Key erforderlich)
- Finnhub API (Aktien-Daten)
- CryptoPanic API (Crypto-News, optional)

#### Deployment
- GitHub Actions Workflows für:
  - Vercel Deployment
  - GitHub Pages Deployment
  - Netlify Deployment
- Sichere Secret-Verwaltung via GitHub Secrets
- Automatisches CI/CD

#### Tech Stack
- React 18 + TypeScript
- Vite (Build Tool)
- Tailwind CSS
- Zustand (State Management)
- Framer Motion (Animations)
