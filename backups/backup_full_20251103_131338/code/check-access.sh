#!/bin/bash

# Script to check if web is accessible from outside
set -e

echo "🌐 Checking web accessibility..."

IP="44.207.127.115"

echo ""
echo "📊 Checking port 80 (HTTP):"
if command -v ss >/dev/null 2>&1; then
    sudo ss -tlnp | grep :80 || echo "⚠️  Port 80 is not listening"
elif command -v netstat >/dev/null 2>&1; then
    sudo netstat -tlnp | grep :80 || echo "⚠️  Port 80 is not listening"
else
    echo "Cannot check port status"
fi

echo ""
echo "📊 Checking port 443 (HTTPS):"
if command -v ss >/dev/null 2>&1; then
    sudo ss -tlnp | grep :443 || echo "⚠️  Port 443 is not listening"
elif command -v netstat >/dev/null 2>&1; then
    sudo netstat -tlnp | grep :443 || echo "⚠️  Port 443 is not listening"
else
    echo "Cannot check port status"
fi

echo ""
echo "🐳 Checking Docker containers:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "(NAMES|nginx|app)" || echo "No containers running"

echo ""
echo "🔍 Checking Nginx container:"
docker logs mattroitrenban_nginx --tail 20 2>&1 || echo "Nginx container not found or not running"

echo ""
echo "📋 Checking UFW firewall (if enabled):"
if command -v ufw >/dev/null 2>&1; then
    sudo ufw status | head -10 || echo "UFW not installed or not enabled"
else
    echo "UFW not installed"
fi

echo ""
echo "🌍 Testing from localhost:"
curl -I http://localhost 2>&1 | head -5 || echo "Cannot connect to localhost:80"

echo ""
echo "✅ Check complete!"
echo ""
echo "📝 Important: Make sure AWS Security Groups allow:"
echo "   - Inbound TCP port 80 (HTTP) from 0.0.0.0/0"
echo "   - Inbound TCP port 443 (HTTPS) from 0.0.0.0/0"
echo ""
echo "🔗 Access URL: http://$IP"

