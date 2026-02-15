# 🚀 Deployment Cheat Sheet

## Schnell-Referenz für GitHub Actions Deployment

### 📋 Erforderliche GitHub Secrets

#### Für alle Deployments:
```
VITE_FINNHUB_API_KEY          # https://finnhub.io/register
VITE_CRYPTOPANIC_API_KEY      # https://cryptopanic.com/developers/api/ (optional)
```

#### Für Vercel:
```
VERCEL_TOKEN                  # https://vercel.com/account/tokens
VERCEL_ORG_ID                 # Vercel Settings → Team/User ID
VERCEL_PROJECT_ID             # Project Settings → Project ID
```

#### Für GitHub Pages:
```
# Keine zusätzlichen Secrets erforderlich!
# Nur in Settings → Pages → Source auf "GitHub Actions" stellen
```

#### Für Netlify:
```
NETLIFY_AUTH_TOKEN            # https://app.netlify.com/user/applications
NETLIFY_SITE_ID               # Site Settings → Site ID
```

---

## 🛠️ Setup-Befehle

### Automatisches Setup (empfohlen):
```bash
gh auth login
./scripts/setup-secrets.sh
```

### Manuelles Setup:
```bash
# Secret hinzufügen
gh secret set SECRET_NAME -b"secret_value"

# Beispiel:
gh secret set VITE_FINNHUB_API_KEY -b"abc123xyz"
```

---

## 🎯 Workflow-Dateien

```
.github/workflows/
├── deploy-vercel.yml         # Vercel Deployment
├── deploy-github-pages.yml   # GitHub Pages Deployment
└── deploy-netlify.yml        # Netlify Deployment
```

### Workflow deaktivieren:
```bash
# Umbenennen (empfohlen)
mv .github/workflows/deploy-vercel.yml{,.disabled}

# Oder löschen
rm .github/workflows/deploy-vercel.yml
```

---

## 🚀 Deployment starten

```bash
git add .
git commit -m "Deploy to production"
git push origin main
```

**Status checken:**
- GitHub Repo → Tab "Actions"

---

## 🔍 URLs nach Deployment

### Vercel:
```
https://dein-projekt.vercel.app
```

### GitHub Pages:
```
https://username.github.io/haderas-tracker-x/
```

### Netlify:
```
https://dein-projekt.netlify.app
```

---

## ⚡ Quick Troubleshooting

### Build schlägt fehl?
```bash
# Lokal testen
npm run build

# Dependencies neu installieren
rm -rf node_modules package-lock.json
npm install
```

### Secrets werden nicht erkannt?
- Namen müssen EXAKT übereinstimmen
- GROSSGESCHRIEBEN
- `VITE_` Prefix nicht vergessen
- Nach Secret-Änderung: Workflow neu triggern

### GitHub Pages zeigt 404?
- `vite.config.ts` → `base` prüfen
- Settings → Pages → Source = "GitHub Actions"
- 2-3 Minuten warten nach Deployment

---

## 📝 Checkliste

- [ ] Repository auf GitHub
- [ ] Alle Dateien committed/gepushed
- [ ] GitHub Secrets eingerichtet
- [ ] Deployment-Plattform konfiguriert
- [ ] Workflow-Datei aktiv
- [ ] Push auf `main` Branch
- [ ] Actions-Tab überprüft
- [ ] Deployment-URL getestet

---

## 🔗 Wichtige Links

- [Finnhub API Keys](https://finnhub.io/register)
- [CryptoPanic API Keys](https://cryptopanic.com/developers/api/)
- [Vercel Dashboard](https://vercel.com/dashboard)
- [GitHub Actions](https://github.com/features/actions)
- [Netlify Dashboard](https://app.netlify.com/)

---

**Vollständige Anleitung: [DEPLOYMENT.md](./DEPLOYMENT.md)**
