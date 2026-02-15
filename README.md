# Haderas Tracker X

Eine professionelle Fintech-Dashboard-Anwendung für das Tracking von Kryptowährungen und Aktien in Echtzeit. Entwickelt mit React, TypeScript und TradingView-Ästhetik.

![Haderas Tracker X](https://img.shields.io/badge/React-18.2-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue) ![License](https://img.shields.io/badge/License-MIT-green)

## 🚀 Features

### ✅ Kern-Funktionen
- **Modulares Dashboard**: Verschiebbare und skalierbare Widgets mit React Grid Layout
- **Live-Preise**: Echtzeit-Preisupdates alle 30 Sekunden mit Flash-Effekten
- **Interaktive Charts**: TradingView-ähnliche Charts mit lightweight-charts
- **Multi-Asset Support**: Crypto (CoinGecko) und Aktien (Finnhub)
- **Watchlist Management**: Unbegrenzte Watchlists mit LocalStorage-Persistenz
- **News Feed**: Crypto-News via CryptoPanic API
- **API Status Monitoring**: Live-Status-Anzeige für alle APIs
- **Dark Mode**: Professionelles, augenschonendes Design

### 🎨 Design-Philosophie
- TradingView-inspirierte UI/UX
- Minimalistisch und professionell
- Subtile Animationen mit Framer Motion
- Keine "clunky" Highlights - nur cleanes Design
- Performance-optimiert für große Datenmengen

## 📋 Voraussetzungen

Bevor du startest, stelle sicher, dass du folgendes installiert hast:

- **Node.js**: Version 18.x oder höher ([Download](https://nodejs.org/))
- **npm**: Version 9.x oder höher (wird mit Node.js installiert)
- **Git**: Für das Klonen des Repositories

**Hinweis:** Diese App verwendet die neuesten stabilen Versionen aller Dependencies (Stand Februar 2024) mit ESLint 9 und React 18.3.

## 🔧 Installation

### Schritt 1: Repository klonen oder Dateien herunterladen

```bash
# Falls Git verwendet wird:
git clone <repository-url>
cd haderas-tracker-x

# Oder einfach die Dateien in einen Ordner entpacken
```

### Schritt 2: Dependencies installieren

```bash
npm install
```

Dies installiert alle notwendigen Pakete:
- React & React DOM (v18.3)
- TypeScript (v5.6)
- Vite (Build Tool v5.4)
- Tailwind CSS (v3.4)
- Zustand (State Management v4.5)
- React Grid Layout
- Lightweight Charts (v4.2)
- Framer Motion (v11.11)
- Lucide React (Icons v0.454)
- Axios
- ESLint 9 (modernste Flat Config)

**Neue Features in dieser Version:**
- ✅ ESLint 9 mit Flat Config
- ✅ Alle deprecated Packages entfernt
- ✅ Neueste Security Patches
- ✅ Verbesserte Performance

### Schritt 3: API Keys konfigurieren

Die Anwendung benötigt API-Keys für volle Funktionalität:

1. Kopiere die `.env.example` Datei:
```bash
cp .env.example .env
```

2. Öffne die `.env` Datei und trage deine API-Keys ein:

```env
# Finnhub API Key (für Aktien-Daten)
VITE_FINNHUB_API_KEY=dein_finnhub_api_key_hier

# CryptoPanic API Key (für Crypto-News)
VITE_CRYPTOPANIC_API_KEY=dein_cryptopanic_api_key_hier
```

### API-Keys erhalten:

#### 🔑 Finnhub (Aktien-Daten) - **ERFORDERLICH**
1. Gehe zu [https://finnhub.io/register](https://finnhub.io/register)
2. Erstelle einen kostenlosen Account
3. Kopiere deinen API-Key aus dem Dashboard
4. Trage ihn in `.env` als `VITE_FINNHUB_API_KEY` ein

**Free Tier Limits:**
- 60 API Calls/Minute
- Vollständig ausreichend für diese Anwendung

#### 🔑 CryptoPanic (Crypto-News) - **OPTIONAL**
1. Gehe zu [https://cryptopanic.com/developers/api/](https://cryptopanic.com/developers/api/)
2. Erstelle einen kostenlosen Account
3. Kopiere deinen API Token
4. Trage ihn in `.env` als `VITE_CRYPTOPANIC_API_KEY` ein

**Free Tier Limits:**
- 1000 API Calls/Tag
- Vollständig ausreichend

**Hinweis:** News-Funktion funktioniert nur für Crypto-Assets. Wenn du keinen CryptoPanic Key hast, wird das News-Widget eine Nachricht anzeigen.

#### ✅ CoinGecko (Crypto-Daten) - **KEIN KEY ERFORDERLICH**
CoinGecko benötigt im Free Tier keinen API-Key und funktioniert out-of-the-box!

## 🔍 Code Quality & Linting

Das Projekt verwendet die neueste **ESLint 9** Version mit Flat Config Format.

### Linting ausführen:

```bash
# Code überprüfen
npm run lint

# Automatische Fixes anwenden
npm run lint:fix
```

### ESLint Features:
- ✅ **ESLint 9** mit Flat Config (`eslint.config.js`)
- ✅ **TypeScript Support** via `typescript-eslint`
- ✅ **React Hooks Rules** enforcement
- ✅ **React Refresh Plugin** für HMR
- ✅ **Keine deprecated Packages** mehr

**Was ist neu?**
- Alle Security-Warnungen behoben
- Optimierte Linting-Performance
- Modernste ESLint-Konfiguration
- Kein `@humanwhocodes/*` oder `glob@7.x` mehr

## 🚀 Starten der Anwendung

### Development Mode (mit Hot Reload)

```bash
npm run dev
```

Die Anwendung startet auf [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
npm run build
```

Dies erstellt eine optimierte Production-Version im `dist/` Ordner.

### Preview der Production-Version

```bash
npm run preview
```

## 🌐 Deployment (GitHub Actions)

Die App kann automatisch mit GitHub Actions deployed werden. API-Keys werden sicher in GitHub Secrets gespeichert.

### Verfügbare Deployment-Optionen:

1. **Vercel** (Empfohlen) - Zero-Config, automatische HTTPS
2. **GitHub Pages** (Kostenlos) - Direkt bei GitHub gehostet
3. **Netlify** - Schnelles CDN, Form Handling

### Quick Setup:

**Option 1: Automatisches Setup mit CLI** (einfachste Methode)
```bash
# GitHub CLI installieren (falls noch nicht vorhanden)
brew install gh  # macOS
# oder siehe: https://github.com/cli/cli#installation

# Einloggen
gh auth login

# Secrets automatisch einrichten
./scripts/setup-secrets.sh
```

**Option 2: Manuelles Setup**

Siehe ausführliche Anleitung in **[DEPLOYMENT.md](./DEPLOYMENT.md)**

### Nach dem Setup:

```bash
# Jeder Push deployed automatisch
git add .
git commit -m "Deploy to production"
git push origin main
```

✅ **Das war's!** Deine App wird automatisch gebaut und deployed.

**Deployment-Status überprüfen:**
- GitHub Repo → Tab "Actions"
- Sieh dir die laufenden Workflows an

## 📚 Verwendung

### Dashboard verwenden

1. **Asset suchen**: Nutze die Suchleiste in der Navbar, um Crypto oder Aktien zu finden
2. **Asset auswählen**: Klicke auf ein Suchergebnis, um es im Dashboard anzuzeigen
3. **Chart-Intervalle**: Wechsle zwischen 5m, 15m, 1h, 4h, 1D, 1W, All
4. **Widgets verschieben**: Ziehe Widgets am oberen Rand, um sie neu anzuordnen
5. **Widgets skalieren**: Ziehe an den Ecken der Widgets, um die Größe zu ändern

### Watchlist Management

1. **Asset zur Watchlist hinzufügen**: 
   - Wähle ein Asset aus der Suche
   - Klicke auf "+ [Symbol] hinzufügen" in der Sidebar

2. **Neue Watchlist erstellen**: 
   - Klicke auf das "+" Icon neben den Watchlist-Tabs
   - Gebe einen Namen ein und bestätige

3. **Watchlist umbenennen**: 
   - Klicke auf das Stift-Icon neben dem Watchlist-Namen
   - Ändere den Namen und bestätige

4. **Asset aus Watchlist entfernen**: 
   - Hover über ein Asset in der Sidebar
   - Klicke auf das Papierkorb-Icon

### API Status verstehen

In der Navbar siehst du drei Status-Indikatoren:

- **🟢 Grün (Verbunden)**: API funktioniert normal
- **🟡 Gelb (Verbinden...)**: API-Request läuft gerade
- **🔴 Rot (Fehler)**: API-Problem (prüfe API-Keys oder Internetverbindung)

## 🏗️ Architektur

```
haderas-tracker-x/
├── src/
│   ├── components/
│   │   ├── common/          # Wiederverwendbare UI-Komponenten
│   │   │   ├── Card.tsx
│   │   │   ├── Loader.tsx
│   │   │   └── PriceFlash.tsx
│   │   ├── layout/          # Layout-Komponenten
│   │   │   ├── Navbar.tsx   # Suche, API-Status, Theme-Toggle
│   │   │   └── Sidebar.tsx  # Watchlist Management
│   │   ├── widgets/         # Dashboard-Widgets
│   │   │   ├── ChartWidget.tsx    # Lightweight-Charts Integration
│   │   │   ├── MetricsWidget.tsx  # Preis & Metriken
│   │   │   └── NewsWidget.tsx     # News Feed
│   │   ├── Dashboard.tsx    # Grid Layout Manager
│   │   └── App.tsx          # Haupt-App-Komponente
│   ├── services/
│   │   ├── apiClient.ts           # Basis HTTP-Client
│   │   ├── coinGeckoService.ts    # CoinGecko API Integration
│   │   ├── finnhubService.ts      # Finnhub API Integration
│   │   ├── cryptoPanicService.ts  # CryptoPanic API Integration
│   │   └── marketService.ts       # Unified Market Service
│   ├── store/
│   │   └── index.ts         # Zustand Global Store
│   ├── hooks/
│   │   ├── useLivePrice.ts  # Live Price Updates Hook
│   │   └── useChartData.ts  # Chart Data Hook
│   ├── types/
│   │   └── index.ts         # TypeScript Definitionen
│   ├── utils/
│   │   ├── formatters.ts    # Formatierungs-Funktionen
│   │   └── storage.ts       # LocalStorage Wrapper
│   ├── main.tsx             # Entry Point
│   └── index.css            # Global Styles
├── public/
├── .env                     # API Keys (nicht in Git!)
├── .env.example            # API Keys Template
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

## 🔌 API-Services

### CoinGecko Service (`coinGeckoService.ts`)
- **Zweck**: Crypto-Preis-Daten und historische Charts
- **API-Key**: Nicht erforderlich
- **Rate Limit**: 50 Calls/Minute (Free Tier)
- **Funktionen**:
  - `search(query)`: Asset-Suche
  - `getPrice(coinId)`: Aktuelle Preise
  - `getCandles(coinId, days)`: Historische Daten
  - `getTopCoins(limit)`: Top Crypto nach Market Cap

### Finnhub Service (`finnhubService.ts`)
- **Zweck**: Aktien-Daten und Charts
- **API-Key**: Erforderlich
- **Rate Limit**: 60 Calls/Minute (Free Tier)
- **Funktionen**:
  - `search(query)`: Aktien-Suche
  - `getPrice(symbol)`: Aktuelle Quotes
  - `getCandles(symbol, resolution, daysBack)`: Historische Daten

### CryptoPanic Service (`cryptoPanicService.ts`)
- **Zweck**: Crypto-News-Feed
- **API-Key**: Erforderlich (optional)
- **Rate Limit**: 1000 Calls/Tag (Free Tier)
- **Funktionen**:
  - `getNews(currencies)`: News für bestimmte Coins

## 🎯 Performance-Optimierungen

1. **Lazy Loading**: Chart-Daten werden nur bei Bedarf nachgeladen
2. **Debouncing**: Suche wird um 300ms verzögert
3. **Caching**: Preis-Daten werden im Store gecacht
4. **LocalStorage**: Dashboard-Layout und Watchlists persistent gespeichert
5. **Memoization**: React-Komponenten sind optimiert für Re-Rendering

## 🐛 Troubleshooting

### Problem: "API Error" in der Navbar

**Lösung**: 
- Prüfe ob die API-Keys in `.env` korrekt eingetragen sind
- Stelle sicher, dass `.env` im Root-Verzeichnis liegt
- Restart den Dev-Server nach Änderungen in `.env`

### Problem: Keine Aktien-Daten

**Lösung**:
- Finnhub API-Key muss in `.env` eingetragen sein
- Prüfe ob der Key gültig ist auf [finnhub.io/dashboard](https://finnhub.io/dashboard)

### Problem: Keine News angezeigt

**Lösung**:
- News funktionieren nur für Crypto-Assets
- CryptoPanic API-Key muss in `.env` eingetragen sein
- Falls kein Key vorhanden: Widget zeigt Info-Nachricht

### Problem: Chart lädt nicht

**Lösung**:
- Warte einige Sekunden - große Datenmengen brauchen Zeit
- Prüfe Browser-Konsole auf Fehler
- Stelle sicher, dass das ausgewählte Asset gültig ist

## 🔒 Sicherheit

- API-Keys werden nie im Code committed
- `.env` ist in `.gitignore`
- Alle API-Requests laufen über HTTPS
- Keine sensiblen Daten werden gespeichert

## 📦 Tech Stack

- **Frontend Framework**: React 18.3 mit TypeScript 5.6
- **Build Tool**: Vite 5.4
- **Styling**: Tailwind CSS 3.4
- **State Management**: Zustand 4.5
- **Charts**: Lightweight Charts 4.2 (TradingView)
- **Grid System**: React Grid Layout 1.4
- **Animations**: Framer Motion 11.11
- **Icons**: Lucide React 0.454
- **HTTP Client**: Axios 1.7
- **Linting**: ESLint 9 mit Flat Config
- **Type Checking**: TypeScript 5.6 (strict mode)

**Alle Packages sind auf dem neuesten Stand (Februar 2024)** ✨

## 📄 Lizenz

MIT License - Frei verwendbar für private und kommerzielle Projekte.

## 🤝 Support

Bei Fragen oder Problemen:
1. Prüfe die Troubleshooting-Sektion
2. Schaue in die Browser-Konsole für Fehlermeldungen
3. Stelle sicher, dass alle Dependencies installiert sind
4. Prüfe ob die API-Keys korrekt sind

## 🚀 Nächste Schritte

Nach der Installation kannst du:
1. Verschiedene Assets erkunden
2. Deine erste Watchlist erstellen
3. Das Dashboard nach deinen Wünschen anpassen
4. Verschiedene Chart-Intervalle ausprobieren
5. Die News-Feeds durchstöbern

Viel Erfolg mit **Haderas Tracker X**! 🎉
