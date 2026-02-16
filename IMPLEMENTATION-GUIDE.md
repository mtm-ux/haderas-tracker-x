# Implementation Guide: Jahresstrahl & Aktienübersicht

## Überblick

Zwei neue Unterseiten wurden zur Haderas Tracker X Applikation hinzugefügt:

1. **Jahresstrahl** (`/jahresstrahl`) - Interaktiver horizontaler Zeitstrahl für Finanzmarkt-Ereignisse
2. **Aktienübersicht** (`/aktien`) - Watchlist-Seite mit Apple Stocks Design

Entworfen nach Best Practices für:
- **TypeScript Strikt** - Vollständige Typsicherheit
- **Saubere Architektur** - Separation of Concerns
- **Performance** - Memoization, Lazy Loading
- **State Management** - LocalStorage für Persistenz
- **Design Tokens** - Verwendung bestehender Theme-Farben

---

## 1. JAHRESSTRAHL - Zeitstrahl für Finanzmarkt-Ereignisse

### Route
```
/jahresstrahl
```

### Komponenten-Struktur

```
src/
├── pages/
│   └── JahresstrahlPage.tsx          # Page-Wrapper
├── components/jahresstrahl/
│   ├── Timeline.tsx                   # Haupt-Komponente
│   ├── TimelineFilterBar.tsx           # Filter UI
│   ├── TimelineEventCard.tsx           # Event-Kartenkomponente
│   └── TimelineDetailPanel.tsx         # Detail-Modal
├── services/
│   └── timelineService.ts             # API & Logic
└── types/
    └── index.ts                        # Type-Definitionen
```

### Type-Definitionen

```typescript
// Neue Types in src/types/index.ts
export type EventCategory = 'macro' | 'earnings' | 'economic' | 'geopolitical' | 'central_bank' | 'other';

export interface TimelineEvent {
  id: string;
  date: string;                    // ISO 8601
  title: string;
  category: EventCategory;
  importance: 1 | 2 | 3 | 4 | 5;  // Scale für Event-Größe
  assets: string[];               // Betroffene Assets (z.B. ["BTC", "SPX"])
  region: string;                 // "US" | "EU" | "APAC" etc.
  summary: string;
  description?: string;
  price_impact?: Record<string, number>;  // Symbol → Prozentuale Änderung
  source?: string;
}
```

### Schlüsselfunktionalität

**1. Filterung**
```typescript
// Filter nach Kategorie, Jahr, oder Asset
timelineService.filterEventsByCategory(events, 'macro')
timelineService.filterEventsByYear(events, 2026)
timelineService.filterEventsByAsset(events, 'BTC')
```

**2. Event-Positioning**
- Events werden alternierend ober-/unterhalb der Zeitlinie angeordnet
- Größe basiert auf `importance` (1-5 Skala)
- Position berechnet sich aus Datum und Zeitraum

**3. Mock-Daten**
```typescript
// Fallback für Entwicklung in timelineService.ts
getMockTimelineEvents() // Vordefinierte Test-Events
```

**4. Detail-Panel**
- Modal mit vollständigen Event-Details
- Zeigt Preisauswirkungen
- Externe Links (optional)

### API Integration

**Expected Endpoint:**
```
GET /api/events?start=YYYY-MM-DD&end=YYYY-MM-DD&page=1&limit=50
```

**Response:**
```json
{
  "events": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 50
  }
}
```

### Performance-Optimierungen

- **Memoization** mit `useMemo` für Filter, Sorting, Positionen
- **Virtual Scrolling** möglich (nicht implementiert, aber vorbereitet)
- **Lazy Loading** von Events pro Monat (Pagination)
- **useCallback** für Event-Handler vermeidet Re-Renders

---

## 2. AKTIENÜBERSICHT - Stock Watchlist

### Route
```
/aktien
```

### Komponenten-Struktur

```
src/
├── pages/
│   └── AktienPage.tsx               # Page-Wrapper
├── components/aktien/
│   ├── StockList.tsx                 # Haupt-Komponente
│   ├── StockItem.tsx                 # Einzelne Aktie
│   └── AddStockModal.tsx             # Modal zum Hinzufügen
├── services/
│   └── stockService.ts               # Formatierung & Logic
├── utils/
│   └── watchlistStorage.ts           # LocalStorage Management
└── types/
    └── index.ts                      # Type-Definitionen
```

### Type-Definitionen

```typescript
// Neue Types in src/types/index.ts
export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change_percent: number;      // z.B. -1.24
  change_value: number;        // z.B. -2.41
  market_cap?: number;
  currency?: string;
}

export interface StockWatchlist {
  id: string;
  name: string;
  displayName: string;
  symbols: string[];
  description?: string;
  createdAt: number;
  updatedAt: number;
}

export type StockWatchlistMap = Record<string, StockWatchlist>;
```

### LocalStorage-Management

**watchlistStorage Utility**
```typescript
// src/utils/watchlistStorage.ts
watchlistStorage.loadWatchlists()                    // Alle laden
watchlistStorage.getWatchlist(id)                   // Spezifisch
watchlistStorage.createWatchlist(name, displayName) // Neu erstellen
watchlistStorage.addSymbolToWatchlist(id, symbol)   // Symbol hinzufügen
watchlistStorage.removeSymbolFromWatchlist(id, symbol) // Symbol entfernen
watchlistStorage.reorderSymbols(id, symbols)        // Drag & Drop
```

**Key in LocalStorage:**
```
haderas_stock_watchlists
```

**Struktur:**
```json
{
  "default": {
    "id": "default",
    "name": "Meine Favoriten",
    "displayName": "Favoriten",
    "symbols": ["AAPL", "MSFT", "BTC", "ETH"],
    "createdAt": 1707990000,
    "updatedAt": 1707990000
  }
}
```

### Schlüsselfunktionalität

**1. Watchlist-Management**
- Default Watchlist wird automatisch erstellt
- Multiple Watchlists möglich
- Persistent in LocalStorage

**2. Apple Stocks Design**
- Symbol links, Preis rechts
- Name unter Symbol
- Change % und Wert unter Preis
- Grün/Rot je nach Performance

**3. Interaktionen**
- **Drag & Drop** zum Sortieren
- **Entfernen** per Klick auf X-Icon
- **Hinzufügen** per Modal
- **Sortieren** nach Name, Preis, oder Änderung

**4. Formatierung**
```typescript
stockService.formatPrice(192.34)          // "$192.34"
stockService.formatChangePercent(-1.24)   // "-1.24%"
stockService.formatChangeValue(-2.41)     // "-$2.41"
stockService.formatMarketCap(1000000000)  // "$1.0B"
stockService.getChangeColor(-1.24)        // "text-danger"
```

### API Integration

**Expected Endpoint:**
```
GET /api/stocks?symbols=AAPL,MSFT,BTC
```

**Response:**
```json
[
  {
    "symbol": "AAPL",
    "name": "Apple Inc.",
    "price": 192.34,
    "change_percent": -1.24,
    "change_value": -2.41,
    "market_cap": 2980000000000
  }
]
```

### Mock-Daten

Beide Services enthalten vordefinierte Mock-Daten für Tests:
- Timeline: 4 diverse Events
- Stocks: 8 populäre Aktien/Cryptos

---

## 3. INTEGRATION IN BESTEHENDE APP

### Router-Update (src/App.tsx)

```typescript
import { JahresstrahlPage } from '@/pages/JahresstrahlPage';
import { AktienPage } from '@/pages/AktienPage';

// In <Routes>
<Route path="/jahresstrahl" element={<JahresstrahlPage />} />
<Route path="/aktien" element={<AktienPage />} />
```

### Navigation-Updates

**Navbar** (src/components/layout/Navbar.tsx)
- Neue NavLinks in Primary Navigation
- "Jahresstrahl" und "Aktien"

**Sidebar** (src/components/layout/Sidebar.tsx)
- Grid von 4 → 6 Spalten
- Abbrev. Labels: "Strahl", "Aktien"

### Design-Tokens verwendet

```
Farben:
- primary-400/500/600 (Sky Blue)
- success (#26a69a)
- danger (#ef5350)
- app-bg, app-surface, app-border, app-text, app-muted

Spacing:
- Tailwind Default (4px Grundeinheit)
- Gap: 2, 3, 4

Typografie:
- Bestehende Font-Stacks
- Größen: text-xs, text-sm, text-base, text-lg, text-xl, text-2xl

Komponenten:
- Card aus common/
- Loader aus common/
```

---

## 4. STATE MANAGEMENT

### Timeline Page
```typescript
const [events, setEvents] = useState<TimelineEvent[]>([])
const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null)
const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
const [selectedYear, setSelectedYear] = useState<number | null>(null)
const [selectedAsset, setSelectedAsset] = useState<string | null>(null)
```

### Stock List Page
```typescript
const [watchlist, setWatchlist] = useState<StockWatchlist | null>(null)
const [stocks, setStocks] = useState<StockQuote[]>([])
const [isModalOpen, setIsModalOpen] = useState(false)
const [draggedSymbol, setDraggedSymbol] = useState<string | null>(null)
const [sortBy, setSortBy] = useState<'name' | 'price' | 'change'>('name')
```

### LocalStorage
- Watchlists in Browser localStorage
- Automatisch laden/speichern
- Keine Server-Abhängigkeit

---

## 5. ENTWICKLUNGS-WEGWEISER

### Aktivierung von echten APIs

**Timeline Service - Echtdaten:**
```typescript
// Ersetze getMockTimelineEvents() mit realen API-Calls
const response = await fetch('/api/events?start=...&end=...')
```

**Stock Service - Echte Kurse:**
```typescript
// Ersetze getMockStockQuotes() mit echten API-Daten
const response = await fetch('/api/stocks?symbols=...')
```

### React Query Integration (Optional)

```typescript
// Für Caching & Pagination
import { useQuery } from '@tanstack/react-query'

const { data: events } = useQuery({
  queryKey: ['timeline-events', startDate, endDate],
  queryFn: () => timelineService.fetchEvents(startDate, endDate)
})
```

### Weitere Watchlists hinzufügen

```typescript
// In AktienPage.tsx oder UI
const handleCreateWatchlist = (name: string) => {
  const newWatchlist = watchlistStorage.createWatchlist(name)
  setActiveWatchlistId(newWatchlist.id)
}
```

---

## 6. TESTING GUIDE

### Manual Testing Checklists

**Timeline:**
- [ ] Filter nach Kategorie funktioniert
- [ ] Filter nach Jahr funktioniert
- [ ] Filter nach Asset funktioniert
- [ ] Event-Klick öffnet Detail-Panel
- [ ] Detail-Panel schließbar
- [ ] Responsive auf Mobile

**Aktien:**
- [ ] Watchlist lädt aus LocalStorage
- [ ] Symbol hinzufügen speichert
- [ ] Symbol entfernen speichert
- [ ] Drag & Drop funktioniert
- [ ] Sortierung nach Name/Preis/Änderung
- [ ] Modal öffnet & schließt

### Mock-Daten für Tests

Beide Services haben vordefinierte Mock-Daten. Aktiviere durch:

```typescript
// Nutze timelineService.getMockTimelineEvents()
// oder stockService getMockStockQuotes()
```

---

## 7. PERFORMANCE

### Optimierungen implementiert
- ✅ Memoization mit `useMemo`
- ✅ useCallback für Event-Handler
- ✅ LocalStorage Caching
- ✅ Conditional Rendering (Lazy)
- ✅ Drag-Drop ohne externe Libraries

### Weitere Verbesserungen (für das Produktivumfeld)
- Virtual Scrolling für große Listen (react-window)
- Code Splitting für Komponenten
- React Query für Smart Caching
- Image Optimization
- Bundle Size Analyse

---

## 8. TROUBLESHOOTING

**Events werden nicht angezeigt:**
1. Prüfe API-Endpoint `/api/events`
2. Mockdaten sollten fallback sein
3. Browser Console auf Fehler prüfen

**Watchlist speichert nicht:**
1. LocalStorage nicht blockiert?
2. `haderas_stock_watchlists` key prüfen im DevTools
3. Browser Private Mode? (LocalStorage deaktiviert)

**Styling sieht falsch aus:**
1. Tailwind Classes auf Tippfehler prüfen
2. App-CSS-Variablen geladen?
3. Dark Mode Toggle prüfen

---

## Dateiübersicht

### Neue Dateien (19 total)

#### Pages (2)
- `src/pages/JahresstrahlPage.tsx`
- `src/pages/AktienPage.tsx`

#### Components Jahresstrahl (4)
- `src/components/jahresstrahl/Timeline.tsx`
- `src/components/jahresstrahl/TimelineFilterBar.tsx`
- `src/components/jahresstrahl/TimelineEventCard.tsx`
- `src/components/jahresstrahl/TimelineDetailPanel.tsx`

#### Components Aktien (3)
- `src/components/aktien/StockList.tsx`
- `src/components/aktien/StockItem.tsx`
- `src/components/aktien/AddStockModal.tsx`

#### Services (2)
- `src/services/timelineService.ts`
- `src/services/stockService.ts`

#### Utils (1)
- `src/utils/watchlistStorage.ts`

#### Modified (2)
- `src/App.tsx` (Router Update)
- `src/components/layout/Navbar.tsx` (Navigation)
- `src/components/layout/Sidebar.tsx` (Navigation)

#### Types (in index.ts)
- EventCategory, TimelineEvent, TimelineEventResponse
- StockQuote, StockWatchlist, StockWatchlistMap

---

## Zusammenfassung

**Jahresstrahl:** Production-ready Timeline mit Filterung, Modal-Details, und Mock-API-Integration.

**Aktienübersicht:** Apple Stocks-inspirierte Watchlist mit LocalStorage-Persistenz, Drag-Drop, und Sortierung.

Beide Seiten nutzen das bestehende Design-System und integrieren nahtlos in die App-Struktur.
