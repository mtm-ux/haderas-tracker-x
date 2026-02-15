# 🚀 Deployment Guide - Haderas Tracker X

Diese Anleitung zeigt dir, wie du Haderas Tracker X mit GitHub Actions automatisch deployen kannst. Deine API-Keys werden sicher in GitHub Secrets gespeichert.

## 📋 Inhaltsverzeichnis

1. [GitHub Secrets einrichten](#github-secrets-einrichten)
2. [Deployment-Optionen](#deployment-optionen)
   - [Option A: Vercel (Empfohlen - Am einfachsten)](#option-a-vercel-empfohlen)
   - [Option B: GitHub Pages (Kostenlos)](#option-b-github-pages)
   - [Option C: Netlify](#option-c-netlify)
3. [Troubleshooting](#troubleshooting)

---

## 🔐 GitHub Secrets einrichten

GitHub Secrets sind der sichere Weg, um API-Keys zu speichern. Sie werden verschlüsselt und sind nur für GitHub Actions sichtbar.

### Schritt-für-Schritt:

1. **Gehe zu deinem GitHub Repository**
   - Navigiere zu: `https://github.com/DEIN-USERNAME/haderas-tracker-x`

2. **Öffne Settings**
   - Klicke auf den Tab **"Settings"**

3. **Secrets und Variables**
   - Im linken Menü: **"Secrets and variables"** → **"Actions"**

4. **Secrets hinzufügen**
   - Klicke auf **"New repository secret"**

### Erforderliche Secrets:

#### 🔑 **API-Keys (erforderlich für alle Deployment-Optionen):**

**1. VITE_FINNHUB_API_KEY** ✅ ERFORDERLICH
```
Name: VITE_FINNHUB_API_KEY
Value: <dein-finnhub-api-key>
```
- Holen: https://finnhub.io/register
- Free Tier: 60 Calls/Minute

**2. VITE_CRYPTOPANIC_API_KEY** ⚠️ OPTIONAL
```
Name: VITE_CRYPTOPANIC_API_KEY
Value: <dein-cryptopanic-api-key>
```
- Holen: https://cryptopanic.com/developers/api/
- Free Tier: 1000 Calls/Tag
- Nur für News-Feature

---

## 🎯 Deployment-Optionen

Du hast 3 Workflows zur Verfügung. Wähle die passende für dich:

---

## Option A: Vercel (Empfohlen)

**Vorteile:**
- ✅ Kostenlos für Hobby-Projekte
- ✅ Automatische HTTPS
- ✅ Globales CDN
- ✅ Zero-Config
- ✅ Automatische Previews für PRs

### 1. Vercel Account erstellen

1. Gehe zu [vercel.com](https://vercel.com)
2. Registriere dich mit deinem GitHub Account
3. Importiere dein Repository

### 2. Vercel Secrets in GitHub eintragen

Nachdem du das Projekt in Vercel importiert hast:

**A) VERCEL_TOKEN holen:**
1. Gehe zu: https://vercel.com/account/tokens
2. Erstelle einen neuen Token: **"Create"**
3. Kopiere den Token

In GitHub Secret eintragen:
```
Name: VERCEL_TOKEN
Value: <dein-vercel-token>
```

**B) VERCEL_ORG_ID holen:**
1. Gehe zu deinen Vercel Settings: https://vercel.com/account
2. Kopiere deine **Team ID** (oder **User ID** für Personal Account)

In GitHub Secret eintragen:
```
Name: VERCEL_ORG_ID
Value: <deine-org-id>
```

**C) VERCEL_PROJECT_ID holen:**
1. Gehe zu deinem Projekt in Vercel
2. Settings → General
3. Kopiere die **Project ID**

In GitHub Secret eintragen:
```
Name: VERCEL_PROJECT_ID
Value: <deine-project-id>
```

### 3. Workflow aktivieren

Der Workflow `.github/workflows/deploy-vercel.yml` ist bereits konfiguriert.

**Deployment starten:**
```bash
git add .
git commit -m "Deploy to Vercel"
git push origin main
```

✅ **Fertig!** Die App wird automatisch gebaut und deployed bei jedem Push auf `main`.

### 4. URL finden

Nach erfolgreichem Deployment findest du deine App unter:
- `https://dein-projekt.vercel.app`

---

## Option B: GitHub Pages

**Vorteile:**
- ✅ Komplett kostenlos
- ✅ Direkt bei GitHub gehostet
- ✅ Automatische HTTPS

**Nachteile:**
- ⚠️ Nur öffentliche Repos (bei Free Account)
- ⚠️ URL: `username.github.io/haderas-tracker-x`

### 1. GitHub Pages aktivieren

1. **Repository Settings**
   - Gehe zu deinem Repo → **Settings**

2. **Pages Sektion**
   - Scroll runter zu **"Pages"** (linkes Menü)

3. **Source konfigurieren**
   - Source: **"GitHub Actions"** (nicht Branch!)

### 2. Workflow ist bereits konfiguriert

Der Workflow `.github/workflows/deploy-github-pages.yml` ist fertig.

### 3. vite.config.ts anpassen (WICHTIG!)

Wenn dein Repository **NICHT** `haderas-tracker-x` heißt:

Öffne `vite.config.ts` und ändere die Zeile:
```typescript
base: process.env.GITHUB_PAGES === 'true' ? '/DEIN-REPO-NAME/' : '/',
```

### 4. Deployment starten

```bash
git add .
git commit -m "Deploy to GitHub Pages"
git push origin main
```

### 5. URL finden

Nach erfolgreichem Deployment (ca. 2-3 Minuten):
- `https://DEIN-USERNAME.github.io/haderas-tracker-x/`

---

## Option C: Netlify

**Vorteile:**
- ✅ Kostenlos für Personal Projects
- ✅ Automatische HTTPS
- ✅ Schnelles CDN
- ✅ Form Handling (falls später benötigt)

### 1. Netlify Account erstellen

1. Gehe zu [netlify.com](https://netlify.com)
2. Registriere dich mit deinem GitHub Account
3. Erstelle eine neue Site: **"Add new site"** → **"Import an existing project"**
4. Wähle dein Repository

### 2. Netlify Secrets in GitHub eintragen

**A) NETLIFY_AUTH_TOKEN holen:**
1. Gehe zu: https://app.netlify.com/user/applications
2. Erstelle einen neuen Personal Access Token
3. Kopiere den Token

In GitHub Secret eintragen:
```
Name: NETLIFY_AUTH_TOKEN
Value: <dein-netlify-token>
```

**B) NETLIFY_SITE_ID holen:**
1. Gehe zu deiner Site in Netlify
2. Site settings → General → Site information
3. Kopiere die **Site ID**

In GitHub Secret eintragen:
```
Name: NETLIFY_SITE_ID
Value: <deine-site-id>
```

### 3. Workflow aktivieren

Der Workflow `.github/workflows/deploy-netlify.yml` ist bereits konfiguriert.

**Deployment starten:**
```bash
git add .
git commit -m "Deploy to Netlify"
git push origin main
```

### 4. URL finden

Nach erfolgreichem Deployment:
- `https://dein-projekt.netlify.app`

---

## 🔍 Welchen Workflow nutzen?

Du kannst **nur einen Workflow** gleichzeitig nutzen oder alle drei gleichzeitig aktiviert lassen (sie deployen dann parallel).

### Einen Workflow deaktivieren:

Falls du nur einen Workflow nutzen möchtest:

**Option 1: Workflow-Datei umbenennen**
```bash
# Vercel deaktivieren
mv .github/workflows/deploy-vercel.yml .github/workflows/deploy-vercel.yml.disabled

# GitHub Pages deaktivieren
mv .github/workflows/deploy-github-pages.yml .github/workflows/deploy-github-pages.yml.disabled

# Netlify deaktivieren
mv .github/workflows/deploy-netlify.yml .github/workflows/deploy-netlify.yml.disabled
```

**Option 2: Workflow-Datei löschen**
```bash
# Ungewünschte Workflows löschen
rm .github/workflows/deploy-vercel.yml
rm .github/workflows/deploy-netlify.yml
```

---

## ✅ Workflow Status überprüfen

Nach jedem Push kannst du den Status deines Deployments überprüfen:

1. Gehe zu deinem GitHub Repo
2. Klicke auf den Tab **"Actions"**
3. Sieh dir die laufenden/fertigen Workflows an

**Status-Symbole:**
- 🟡 Gelb: Workflow läuft
- ✅ Grün: Erfolgreich deployed
- ❌ Rot: Fehler (siehe Logs)

---

## 🐛 Troubleshooting

### Problem: "Error: API key not found"

**Lösung:**
- Prüfe ob alle Secrets korrekt in GitHub eingetragen sind
- Namen müssen exakt übereinstimmen (mit `VITE_` Prefix!)
- Secrets sind case-sensitive

### Problem: "Build failed"

**Lösung:**
```bash
# Teste Build lokal
npm run build

# Falls Fehler: Dependencies aktualisieren
npm install
```

### Problem: "Vercel deployment failed"

**Lösung:**
- Prüfe ob alle 3 Vercel-Secrets korrekt sind
- Token muss gültig sein (nicht abgelaufen)
- Project ID muss exakt übereinstimmen

### Problem: GitHub Pages zeigt 404

**Lösung:**
- Prüfe ob `base` in `vite.config.ts` korrekt ist
- Warte 2-3 Minuten nach Deployment
- Stelle sicher, dass Pages aktiviert ist (Settings → Pages)

### Problem: Secrets werden nicht erkannt

**Lösung:**
1. Gehe zu Repository Settings → Secrets → Actions
2. Prüfe Schreibweise der Secret-Namen
3. Secrets müssen GROSSGESCHRIEBEN sein
4. Prefix `VITE_` darf nicht fehlen

---

## 📝 Checkliste vor dem ersten Deployment

- [ ] Repository auf GitHub erstellt
- [ ] Alle Dateien committed und gepushed
- [ ] GitHub Secrets eingerichtet:
  - [ ] `VITE_FINNHUB_API_KEY` (erforderlich)
  - [ ] `VITE_CRYPTOPANIC_API_KEY` (optional)
- [ ] Deployment-Plattform gewählt (Vercel/GitHub Pages/Netlify)
- [ ] Platform-spezifische Secrets eingerichtet
- [ ] Workflow-Datei ist vorhanden
- [ ] Push auf `main` Branch

---

## 🎉 Nach erfolgreichem Deployment

1. **Teste deine App:**
   - Öffne die Deployment-URL
   - Teste Asset-Suche
   - Prüfe ob Charts laden
   - Teste Watchlist-Funktionen

2. **Monitoring:**
   - Prüfe die Actions-Logs bei jedem Push
   - Überwache API-Limits (Finnhub: 60/Min, CryptoPanic: 1000/Tag)

3. **Updates deployen:**
   - Jeder Push auf `main` triggert automatisch ein neues Deployment
   - Kein manueller Build mehr nötig!

---

## 🔒 Sicherheit

✅ **Deine API-Keys sind sicher:**
- Werden verschlüsselt in GitHub gespeichert
- Sind nur für GitHub Actions sichtbar
- Werden nie im Code committed
- Sind nicht im Build-Output sichtbar

⚠️ **Wichtig:**
- `.env` ist in `.gitignore` → wird nie committed
- GitHub Secrets niemals in Code einfügen
- Secrets niemals in Commit-Messages schreiben

---

## 📚 Weitere Ressourcen

- [GitHub Actions Dokumentation](https://docs.github.com/en/actions)
- [Vercel Dokumentation](https://vercel.com/docs)
- [GitHub Pages Dokumentation](https://docs.github.com/en/pages)
- [Netlify Dokumentation](https://docs.netlify.com)

---

## 🆘 Hilfe benötigt?

Falls du Probleme hast:
1. Prüfe die Actions-Logs in GitHub
2. Schau in die Browser-Konsole nach Fehlern
3. Stelle sicher, dass alle Secrets korrekt sind
4. Teste den Build lokal mit `npm run build`

---

**Viel Erfolg mit deinem Deployment! 🚀**
