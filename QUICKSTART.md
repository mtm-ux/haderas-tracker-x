# 🚀 Haderas Tracker X - Schnellstart

## Sofort loslegen (3 Minuten)

### 1. Dependencies installieren
```bash
cd haderas-tracker-x
npm install
```

### 2. API-Keys einrichten
```bash
# .env Datei erstellen
cp .env.example .env

# Dann .env öffnen und eintragen:
# VITE_FINNHUB_API_KEY=dein_key_hier (erforderlich!)
# VITE_CRYPTOPANIC_API_KEY=dein_key_hier (optional)
```

**API-Keys kostenlos erhalten:**
- Finnhub: https://finnhub.io/register (60 Calls/Min, völlig ausreichend)
- CryptoPanic: https://cryptopanic.com/developers/api/ (optional für News)

### 3. Starten
```bash
npm run dev
```

Öffne [http://localhost:3000](http://localhost:3000) im Browser.

## Features auf einen Blick

✅ **Live-Preise** für Crypto & Aktien
✅ **Interaktive TradingView-Charts** mit 7 Zeitintervallen
✅ **Unbegrenzte Watchlists** mit LocalStorage
✅ **Crypto-News Feed** (CryptoPanic)
✅ **Drag-and-Drop Dashboard** (verschiebbare Widgets)
✅ **API Status Monitoring** in Echtzeit
✅ **Dark Mode** Standard

## Erste Schritte

1. **Asset suchen**: Suchleiste oben nutzen (z.B. "BTC" oder "AAPL")
2. **Asset auswählen**: Auf Suchergebnis klicken
3. **Chart erkunden**: Intervalle testen (5m bis All)
4. **Watchlist erstellen**: "+" neben Tabs in der Sidebar
5. **Widgets anordnen**: Drag-and-Drop am oberen Rand

## Wichtige Hinweise

- CoinGecko benötigt KEINEN API-Key (funktioniert sofort)
- Finnhub-Key ist erforderlich für Aktien-Daten
- News funktionieren nur für Crypto (CryptoPanic)
- Dashboard-Layout wird automatisch gespeichert
- Watchlists bleiben auch nach Browser-Neustart erhalten

## Troubleshooting

**API-Error in Navbar?**
→ Prüfe ob Finnhub-Key in .env eingetragen ist
→ Restart Dev-Server nach .env-Änderungen

**Keine Daten?**
→ Warte 2-3 Sekunden (initial load)
→ Prüfe Browser-Konsole auf Fehler

Viel Erfolg! 🎉
