#!/bin/bash

# Script to fix banner display issue
set -e

# Detect docker compose command
if docker compose version >/dev/null 2>&1; then
    DOCKER_COMPOSE="docker compose"
elif docker-compose version >/dev/null 2>&1; then
    DOCKER_COMPOSE="docker-compose"
else
    echo "❌ Error: Docker Compose not found!"
    exit 1
fi

echo "🔧 Fixing banner display issue..."
echo ""

# Step 1: Check if banner exists in database
echo "1️⃣ Checking banner in database..."
BANNER_CHECK="./check-banner.sh"
if [ -f "$BANNER_CHECK" ]; then
    chmod +x "$BANNER_CHECK"
    "$BANNER_CHECK"
else
    echo "⚠️  check-banner.sh not found, skipping banner check"
fi

echo ""
echo "2️⃣ Rebuilding app container with latest code..."
$DOCKER_COMPOSE build app

echo ""
echo "3️⃣ Restarting app service..."
$DOCKER_COMPOSE up -d app

echo ""
echo "⏳ Waiting for app to start..."
sleep 5

echo ""
echo "4️⃣ Revalidating homepage cache..."
curl -s http://localhost:3000/api/revalidate?path=/ >/dev/null 2>&1 || curl -s http://44.207.127.115/api/revalidate?path=/ >/dev/null 2>&1 || echo "⚠️  Could not reach revalidate endpoint (might need to check URL)"

echo ""
echo "✅ Fix complete!"
echo ""
echo "📊 Container status:"
$DOCKER_COMPOSE ps

echo ""
echo "💡 Next steps:"
echo "  1. Check if banner exists: ./check-banner.sh"
echo "  2. If no banner, upload one from /root-admin/settings"
echo "  3. View app logs: $DOCKER_COMPOSE logs -f app"
echo "  4. Test homepage: curl -I http://44.207.127.115/"

