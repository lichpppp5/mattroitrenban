#!/bin/bash

# Script to clean up disk space
set -e

echo "🧹 Cleaning Up Disk Space..."
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Safety check
read -p "⚠️  This will clean up Docker resources. Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 0
fi

# 1. Stop running containers
echo "1️⃣  Stopping containers..."
if command -v docker >/dev/null 2>&1; then
    docker compose down 2>/dev/null || echo "   (No containers to stop)"
else
    echo "   Docker not installed"
fi
echo ""

# 2. Remove unused Docker images
echo "2️⃣  Removing unused Docker images..."
if command -v docker >/dev/null 2>&1; then
    docker image prune -a -f --filter "until=24h" || echo "   (No images to remove)"
    echo -e "${GREEN}✅ Cleaned unused images${NC}"
else
    echo "   Docker not installed"
fi
echo ""

# 3. Remove unused containers
echo "3️⃣  Removing unused containers..."
if command -v docker >/dev/null 2>&1; then
    docker container prune -f || echo "   (No containers to remove)"
    echo -e "${GREEN}✅ Cleaned unused containers${NC}"
else
    echo "   Docker not installed"
fi
echo ""

# 4. Remove unused volumes
echo "4️⃣  Removing unused volumes..."
if command -v docker >/dev/null 2>&1; then
    docker volume prune -f || echo "   (No volumes to remove)"
    echo -e "${GREEN}✅ Cleaned unused volumes${NC}"
else
    echo "   Docker not installed"
fi
echo ""

# 5. Remove unused networks
echo "5️⃣  Removing unused networks..."
if command -v docker >/dev/null 2>&1; then
    docker network prune -f || echo "   (No networks to remove)"
    echo -e "${GREEN}✅ Cleaned unused networks${NC}"
else
    echo "   Docker not installed"
fi
echo ""

# 6. Remove build cache
echo "6️⃣  Removing Docker build cache..."
if command -v docker >/dev/null 2>&1; then
    docker builder prune -a -f || echo "   (No build cache to remove)"
    echo -e "${GREEN}✅ Cleaned build cache${NC}"
else
    echo "   Docker not installed"
fi
echo ""

# 7. Clean system (all unused resources)
echo "7️⃣  Full system cleanup..."
if command -v docker >/dev/null 2>&1; then
    docker system prune -a -f --volumes || echo "   (No resources to clean)"
    echo -e "${GREEN}✅ Full cleanup completed${NC}"
else
    echo "   Docker not installed"
fi
echo ""

# 8. Check disk space after cleanup
echo "8️⃣  Disk Space After Cleanup:"
df -h | grep -E "Filesystem|/dev/"
echo ""

# 9. Check Docker disk usage after cleanup
echo "9️⃣  Docker Disk Usage After Cleanup:"
if command -v docker >/dev/null 2>&1; then
    docker system df
else
    echo "   Docker not installed"
fi
echo ""

echo -e "${GREEN}✅ Cleanup completed!${NC}"
echo ""
echo "📝 Next steps:"
echo "   1. Check disk space: ./check-disk-space.sh"
echo "   2. If still low on space, consider:"
echo "      - Removing old backups"
echo "      - Compressing large files"
echo "      - Moving media files to external storage"
echo "   3. Rebuild: docker compose build --no-cache"

