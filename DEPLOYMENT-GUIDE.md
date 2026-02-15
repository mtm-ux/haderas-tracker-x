# Deployment Anleitung: Haderas Tracker X auf GitHub Pages

Diese Anleitung führt dich durch den Prozess, die App auf GitHub Pages zu veröffentlichen und die API-Keys sicher über GitHub Secrets zu verwalten.

## 1. Vorbereitung auf GitHub

1. Erstelle ein neues Repository auf GitHub (falls noch nicht geschehen).
2. Pushe deinen lokalen Code in dieses Repository:
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git branch -M main
   git remote add origin https://github.com/DEIN_USERNAME/DEIN_REPO_NAME.git
   git push -u origin main
   ```

## 2. API-Keys als Secrets hinterlegen

Damit deine API-Keys nicht öffentlich im Code stehen, nutzen wir **GitHub Secrets**:

1. Gehe in deinem GitHub-Repository auf **Settings** (oben rechts).
2. Klicke links im Menü auf **Secrets and variables** -> **Actions**.
3. Klicke auf **New repository secret**.
4. Füge folgende Secrets hinzu:
   - Name: `VITE_FINNHUB_API_KEY` | Wert: `DEIN_FINNHUB_KEY`
   - Name: `VITE_CRYPTOPANIC_API_KEY` | Wert: `DEIN_CRYPTOPANIC_KEY`

## 3. GitHub Pages aktivieren

1. Gehe in deinem Repository auf **Settings**.
2. Klicke auf **Pages** (linkes Menü).
3. Unter **Build and deployment** -> **Source**: Wähle **GitHub Actions** aus.

## 4. Deployment starten

Sobald du den Code pushst (was du oben bereits getan hast) oder beim nächsten Push, startet die GitHub Action automatisch:

1. Gehe auf den Tab **Actions** in deinem Repository.
2. Dort siehst du den Workflow `Deploy to GitHub Pages`.
3. Sobald dieser durchgelaufen ist (grüner Haken), ist deine App unter `https://DEIN_USERNAME.github.io/DEIN_REPO_NAME/` erreichbar.

---

## Optimierungen für Mobile & Web

Ich habe folgende Änderungen vorgenommen, um die App fit für das Web und Mobile zu machen:

- **Responsives Layout**: Das Dashboard nutzt jetzt ein `ResponsiveGridLayout`. Auf dem Handy werden die Widgets (Chart, Metriken, News) automatisch untereinander gestapelt.
- **Mobile Sidebar**: Auf kleinen Bildschirmen ist die Sidebar standardmäßig eingeklappt. Du kannst sie über das neue Hamburger-Menü (oben links in der Navbar) öffnen.
- **Auto-Close**: Wenn du in der mobilen Ansicht ein Asset auswählst, schließt sich die Sidebar automatisch, damit du sofort den Chart siehst.
- **GitHub Actions Ready**: Die Datei `.github/workflows/deploy.yml` wurde erstellt. Sie baut die App automatisch und spritzt die API-Keys aus deinen Secrets ein.
- **Vite Config**: Die Basis-URL wurde auf `./` gesetzt, damit die App sowohl in Unterordnern als auch auf der Hauptdomain von GitHub Pages funktioniert.

Viel Erfolg beim Deployment!
