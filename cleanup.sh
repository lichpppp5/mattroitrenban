#!/bin/bash

# Script to cleanup old processes and containers
set -e

echo "🧹 Starting cleanup..."

# Kill Next.js process on port 3000 if exists
echo "📊 Checking port 3000..."
if command -v lsof >/dev/null 2>&1; then
    PID=$(sudo lsof -ti :3000)
    if [ ! -z "$PID" ]; then
        echo "🛑 Killing process on port 3000 (PID: $PID)..."
        sudo kill -9 $PID || true
        echo "✅ Process killed"
    else
        echo "✅ Port 3000 is free"
    fi
elif command -v ss >/dev/null 2>&1; then
    PID=$(sudo ss -tlnp | grep :3000 | grep -oP 'pid=\K\d+' | head -1)
    if [ ! -z "$PID" ]; then
        echo "🛑 Killing process on port 3000 (PID: $PID)..."
        sudo kill -9 $PID || true
        echo "✅ Process killed"
    else
        echo "✅ Port 3000 is free"
    fi
fi

# Stop and remove Docker containers
echo ""
echo "🐳 Cleaning up Docker containers..."
docker compose down 2>/dev/null || docker-compose down 2>/dev/null || true

# Remove old containers
docker rm -f mattroitrenban_db mattroitrenban_app mattroitrenban_nginx 2>/dev/null || true

# Remove old networks (if any)
docker network rm mattroitrenban_app-network 2>/dev/null || true

# Prune unused containers, networks, images
echo "🧹 Pruning unused Docker resources..."
docker system prune -f

echo ""
echo "✅ Cleanup complete!"
echo ""
echo "📝 Next steps:"
echo "  1. Run: ./deploy.sh"
echo "  2. Or check ports again: ./check-ports.sh"

