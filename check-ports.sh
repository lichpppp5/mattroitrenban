#!/bin/bash

# Script to check what's using ports
set -e

echo "🔍 Checking ports..."

echo ""
echo "📊 Checking port 5432 (PostgreSQL):"
if command -v lsof >/dev/null 2>&1; then
    echo "Using lsof:"
    sudo lsof -i :5432 || echo "No process found using lsof"
elif command -v netstat >/dev/null 2>&1; then
    echo "Using netstat:"
    sudo netstat -tlnp | grep :5432 || echo "No process found using netstat"
elif command -v ss >/dev/null 2>&1; then
    echo "Using ss:"
    sudo ss -tlnp | grep :5432 || echo "No process found using ss"
else
    echo "No suitable command found (lsof, netstat, or ss)"
fi

echo ""
echo "📊 Checking port 80 (HTTP):"
if command -v lsof >/dev/null 2>&1; then
    sudo lsof -i :80 || echo "Port 80 is free"
elif command -v netstat >/dev/null 2>&1; then
    sudo netstat -tlnp | grep :80 || echo "Port 80 is free"
elif command -v ss >/dev/null 2>&1; then
    sudo ss -tlnp | grep :80 || echo "Port 80 is free"
fi

echo ""
echo "📊 Checking port 3000 (Next.js):"
if command -v lsof >/dev/null 2>&1; then
    sudo lsof -i :3000 || echo "Port 3000 is free"
elif command -v netstat >/dev/null 2>&1; then
    sudo netstat -tlnp | grep :3000 || echo "Port 3000 is free"
elif command -v ss >/dev/null 2>&1; then
    sudo ss -tlnp | grep :3000 || echo "Port 3000 is free"
fi

echo ""
echo "📊 Checking PostgreSQL service status:"
if command -v systemctl >/dev/null 2>&1; then
    systemctl status postgresql 2>/dev/null || echo "PostgreSQL service not found or not running"
elif command -v service >/dev/null 2>&1; then
    service postgresql status 2>/dev/null || echo "PostgreSQL service not found or not running"
else
    echo "Cannot check service status (systemctl/service not found)"
fi

echo ""
echo "📊 Checking Docker containers:"
docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "(NAMES|postgres|5432)" || echo "No PostgreSQL containers found"

echo ""
echo "✅ Port check complete!"

