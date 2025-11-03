#!/bin/bash

# Script to restart all services
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

echo "🔄 Restarting all services..."

# Restart all containers
$DOCKER_COMPOSE restart

echo ""
echo "✅ All services restarted!"
echo ""
echo "📊 Container status:"
$DOCKER_COMPOSE ps

echo ""
echo "📝 To view logs: $DOCKER_COMPOSE logs -f"

