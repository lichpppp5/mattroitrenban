#!/bin/bash

# Script to test server connectivity and performance
set -e

echo "🔍 Testing server connectivity and performance..."

# Test localhost first
echo ""
echo "📊 Testing localhost:80..."
curl -I http://localhost 2>&1 | head -10 || echo "⚠️  Cannot connect to localhost:80"

# Test with IP
echo ""
echo "📊 Testing external IP (may fail from same server)..."
IP=$(curl -s ifconfig.me 2>/dev/null || echo "unknown")
echo "   Server IP: $IP"

# Check containers
echo ""
echo "🐳 Container status:"
if command -v docker >/dev/null 2>&1; then
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "(NAMES|nginx|app)" || echo "No containers running"
fi

# Check ports
echo ""
echo "📊 Ports listening:"
if command -v ss >/dev/null 2>&1; then
    sudo ss -tlnp | grep -E ':(80|443|3000)' || echo "No ports listening"
elif command -v netstat >/dev/null 2>&1; then
    sudo netstat -tlnp | grep -E ':(80|443|3000)' || echo "No ports listening"
fi

# Check Nginx logs
echo ""
echo "📋 Nginx container logs (last 20 lines):"
docker logs mattroitrenban_nginx --tail 20 2>&1 || echo "Nginx container not found"

# Test cache headers from localhost
echo ""
echo "🔍 Testing cache headers from localhost:"
curl -I http://localhost 2>&1 | grep -iE "(cache|x-cache)" || echo "No cache headers found"

# Performance test
echo ""
echo "⏱️  Performance test (localhost):"
time curl -s -o /dev/null -w "Time: %{time_total}s\n" http://localhost 2>&1 | tail -1

echo ""
echo "✅ Test complete!"

