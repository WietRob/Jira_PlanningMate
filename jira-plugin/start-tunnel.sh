#!/bin/bash
# Jira Planning Mate - Forge Tunnel Starter
# Usage: ./start-tunnel.sh <APP-ID>

set -e

APP_ID=${1:-}
FORGE_EMAIL="robertoschmidt2706@gmail.com"
FORGE_API_TOKEN="ATATT3xFfGF0oaVbuwB950ewdl7ndJDuQ7KzNlb1_SCybFdy6iIf1Yx39fwLuWtXuExeB3eAu5-1AJoZ8tN9y-ZnT6NaENfW0AJOwwvhbCaF46nWxq6DPseOiv4-6bIxFPYv5Y_u14YVSX2mpVyt7NhxLguP3RnafdPMmT9ygday0y7WLYEXYxo=9BA1B6F1"

echo "🚀 Jira Planning Mate - Forge Tunnel Starter"
echo "=============================================="

if [ -z "$APP_ID" ]; then
    echo "❌ Fehler: App-ID fehlt!"
    echo ""
    echo "Usage: ./start-tunnel.sh <APP-ID>"
    echo ""
    echo "Beispiel:"
    echo "  ./start-tunnel.sh ari:cloud:ecosystem::app/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
    echo ""
    echo "👉 App erstellen: https://developer.atlassian.com/console/forge/apps/create"
    exit 1
fi

echo ""
echo "📋 Schritt 1: App-ID in manifest.yml eintragen..."
sed -i "s|app: id: ari:cloud:ecosystem::app/da4a1df4-b712-4f2d-8243-ed29b193e3ba|app: id: $APP_ID|" manifest.yml
echo "✅ App-ID eingetragen: $APP_ID"

echo ""
echo "📦 Schritt 2: Build ausführen..."
npm run build
echo "✅ Build abgeschlossen"

echo ""
echo "🚀 Schritt 3: Forge Tunnel starten..."
echo ""
echo "➡️  Nach dem Tunnel-Start:"
echo "   - Öffne: http://localhost:2770"
echo ""
echo "Drücke Ctrl+C zum Beenden"
echo ""

export FORGE_EMAIL
export FORGE_API_TOKEN

forge tunnel
