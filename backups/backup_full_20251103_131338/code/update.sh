#!/bin/bash

# Script to quickly update code without full rebuild (for minor changes)
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

echo "🔄 Updating code from Git..."

# Pull latest code
git pull origin main

echo ""
echo "🔨 Rebuilding app container..."

# Rebuild only the app service (faster than full rebuild)
$DOCKER_COMPOSE build app

echo ""
echo "🔄 Restarting app service..."

# Restart app to apply changes
$DOCKER_COMPOSE up -d app

echo ""
echo "✅ Update complete!"
echo ""
echo "📊 Container status:"
$DOCKER_COMPOSE ps

echo ""
echo "📝 To view app logs: $DOCKER_COMPOSE logs -f app"

