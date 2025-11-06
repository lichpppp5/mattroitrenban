#!/bin/bash

# Script to check disk space and clean up
set -e

echo "💾 Checking Disk Space..."
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# 1. Check disk usage
echo "1️⃣  Disk Usage:"
df -h | grep -E "Filesystem|/dev/"
echo ""

# 2. Check Docker disk usage
echo "2️⃣  Docker Disk Usage:"
if command -v docker >/dev/null 2>&1; then
    docker system df
else
    echo "   Docker not installed"
fi
echo ""

# 3. Find large files/directories
echo "3️⃣  Large Directories (top 10):"
du -h --max-depth=1 / 2>/dev/null | sort -rh | head -10 || echo "   (Could not check - may need root)"
echo ""

# 4. Check current directory size
echo "4️⃣  Current Directory Size:"
du -sh . 2>/dev/null || echo "   (Could not check)"
echo ""

# 5. Check media directory size
if [ -d "media" ]; then
    echo "5️⃣  Media Directory Size:"
    du -sh media 2>/dev/null || echo "   (Could not check)"
    echo "   Files in media:"
    ls -lh media/ | head -10 || echo "   (Could not list)"
    echo ""
fi

# 6. Check Docker images
echo "6️⃣  Docker Images:"
if command -v docker >/dev/null 2>&1; then
    docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}" | head -10
else
    echo "   Docker not installed"
fi
echo ""

# 7. Check Docker containers
echo "7️⃣  Docker Containers:"
if command -v docker >/dev/null 2>&1; then
    docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Size}}" | head -10
else
    echo "   Docker not installed"
fi
echo ""

echo "✅ Disk check completed!"

