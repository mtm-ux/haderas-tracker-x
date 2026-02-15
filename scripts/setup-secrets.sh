#!/bin/bash

# GitHub Secrets Setup Helper
# Dieses Script hilft dir, GitHub Secrets über die CLI einzurichten

echo "🔐 GitHub Secrets Setup für Haderas Tracker X"
echo "================================================"
echo ""

# Prüfe ob gh CLI installiert ist
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) ist nicht installiert."
    echo ""
    echo "Installation:"
    echo "  macOS:   brew install gh"
    echo "  Linux:   siehe https://github.com/cli/cli#installation"
    echo "  Windows: siehe https://github.com/cli/cli#installation"
    echo ""
    exit 1
fi

# Prüfe ob eingeloggt
if ! gh auth status &> /dev/null; then
    echo "❌ Du bist nicht in GitHub eingeloggt."
    echo ""
    echo "Login mit: gh auth login"
    echo ""
    exit 1
fi

echo "✅ GitHub CLI erkannt und eingeloggt"
echo ""

# API Keys abfragen
echo "📝 Bitte gib deine API-Keys ein:"
echo ""

read -p "VITE_FINNHUB_API_KEY (erforderlich): " FINNHUB_KEY
if [ -z "$FINNHUB_KEY" ]; then
    echo "⚠️  Finnhub API Key ist erforderlich!"
    echo "   Holen: https://finnhub.io/register"
    exit 1
fi

read -p "VITE_CRYPTOPANIC_API_KEY (optional, Enter zum Überspringen): " CRYPTOPANIC_KEY

echo ""
echo "🚀 Wähle deine Deployment-Plattform:"
echo "  1) Vercel"
echo "  2) GitHub Pages"
echo "  3) Netlify"
echo "  4) Keine (nur API-Keys)"
echo ""
read -p "Wähle (1-4): " PLATFORM

echo ""
echo "💾 Secrets werden hochgeladen..."
echo ""

# API Keys setzen
gh secret set VITE_FINNHUB_API_KEY -b"$FINNHUB_KEY"
echo "✅ VITE_FINNHUB_API_KEY gesetzt"

if [ ! -z "$CRYPTOPANIC_KEY" ]; then
    gh secret set VITE_CRYPTOPANIC_API_KEY -b"$CRYPTOPANIC_KEY"
    echo "✅ VITE_CRYPTOPANIC_API_KEY gesetzt"
fi

# Platform-spezifische Secrets
case $PLATFORM in
    1)
        echo ""
        echo "📝 Vercel Secrets:"
        echo "   Holen von: https://vercel.com/account/tokens"
        echo ""
        read -p "VERCEL_TOKEN: " VERCEL_TOKEN
        read -p "VERCEL_ORG_ID: " VERCEL_ORG_ID
        read -p "VERCEL_PROJECT_ID: " VERCEL_PROJECT_ID
        
        gh secret set VERCEL_TOKEN -b"$VERCEL_TOKEN"
        gh secret set VERCEL_ORG_ID -b"$VERCEL_ORG_ID"
        gh secret set VERCEL_PROJECT_ID -b"$VERCEL_PROJECT_ID"
        
        echo "✅ Vercel Secrets gesetzt"
        ;;
    2)
        echo "✅ GitHub Pages benötigt keine zusätzlichen Secrets"
        ;;
    3)
        echo ""
        echo "📝 Netlify Secrets:"
        echo "   Holen von: https://app.netlify.com/user/applications"
        echo ""
        read -p "NETLIFY_AUTH_TOKEN: " NETLIFY_TOKEN
        read -p "NETLIFY_SITE_ID: " NETLIFY_SITE_ID
        
        gh secret set NETLIFY_AUTH_TOKEN -b"$NETLIFY_TOKEN"
        gh secret set NETLIFY_SITE_ID -b"$NETLIFY_SITE_ID"
        
        echo "✅ Netlify Secrets gesetzt"
        ;;
esac

echo ""
echo "🎉 Fertig! Alle Secrets wurden erfolgreich hochgeladen."
echo ""
echo "📋 Nächste Schritte:"
echo "  1. Änderungen committen und pushen"
echo "  2. GitHub Actions Tab überprüfen"
echo "  3. Deployment-URL finden"
echo ""
echo "Deployment wird automatisch gestartet bei: git push origin main"
echo ""
