#!/bin/bash

# Script to fix media permissions in container and recover missing files
set -e

echo "🔧 Fixing Media Permissions in Container and Recovering Files..."
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# File from database
DB_FILE="1762425608157-niemvuicuaem.mp3"

echo "📋 Target file: $DB_FILE"
echo ""

# 1. Recover file from alternative location
echo "1️⃣  Recovering file from /app/media/..."
if command -v docker >/dev/null 2>&1 && docker ps | grep -q "mattroitrenban_app"; then
    if docker exec mattroitrenban_app test -f "/app/media/$DB_FILE" 2>/dev/null; then
        echo -e "${GREEN}✅ File found in /app/media/${NC}"
        
        # Copy to host
        echo -e "${BLUE}📥 Copying to host...${NC}"
        docker cp "mattroitrenban_app:/app/media/$DB_FILE" "media/$DB_FILE"
        
        if [ -f "media/$DB_FILE" ]; then
            chmod 644 "media/$DB_FILE"
            echo -e "${GREEN}✅ File copied to media/$DB_FILE${NC}"
            ls -lh "media/$DB_FILE"
        else
            echo -e "${RED}❌ Copy failed${NC}"
        fi
    else
        echo -e "${RED}❌ File NOT found in /app/media/${NC}"
    fi
fi

echo ""

# 2. Fix permissions in container
echo "2️⃣  Fixing permissions in container..."
if command -v docker >/dev/null 2>&1 && docker ps | grep -q "mattroitrenban_app"; then
    echo "   Fixing /app/public/media permissions..."
    
    # Try to fix as root (if container allows)
    docker exec -u root mattroitrenban_app chmod -R 777 /app/public/media 2>/dev/null || \
    docker exec mattroitrenban_app chmod -R 755 /app/public/media 2>/dev/null || \
    echo "   (Could not fix permissions - may need to rebuild container)"
    
    # Try to change ownership
    docker exec -u root mattroitrenban_app chown -R nextjs:nodejs /app/public/media 2>/dev/null || \
    echo "   (Could not change ownership)"
    
    # Test write
    TEST_FILE="/app/public/media/.test_$(date +%s)"
    if docker exec mattroitrenban_app touch "$TEST_FILE" 2>/dev/null; then
        echo -e "${GREEN}✅ Write access OK${NC}"
        docker exec mattroitrenban_app rm -f "$TEST_FILE"
    else
        echo -e "${YELLOW}⚠️  Write access still limited${NC}"
        echo "   This may require rebuilding the container with proper permissions"
    fi
fi

echo ""

# 3. Copy recovered file to container's public/media
if [ -f "media/$DB_FILE" ]; then
    echo "3️⃣  Copying recovered file to container..."
    if command -v docker >/dev/null 2>&1 && docker ps | grep -q "mattroitrenban_app"; then
        docker cp "media/$DB_FILE" "mattroitrenban_app:/app/public/media/$DB_FILE"
        
        if docker exec mattroitrenban_app test -f "/app/public/media/$DB_FILE" 2>/dev/null; then
            echo -e "${GREEN}✅ File copied to container's /app/public/media/${NC}"
        else
            echo -e "${YELLOW}⚠️  File not accessible in container (permission issue)${NC}"
        fi
    fi
fi

echo ""

# 4. Restart containers
echo "4️⃣  Restarting containers..."
read -p "   Restart containers to sync? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    docker compose restart app nginx
    echo -e "${GREEN}✅ Containers restarted${NC}"
    
    sleep 3
    
    # Verify
    if docker exec mattroitrenban_nginx test -f "/var/www/media/$DB_FILE" 2>/dev/null; then
        echo -e "${GREEN}✅ File accessible in Nginx container${NC}"
    else
        echo -e "${YELLOW}⚠️  File not yet accessible (may need rebuild)${NC}"
    fi
fi

echo ""
echo "📝 Summary:"
if [ -f "media/$DB_FILE" ]; then
    echo -e "${GREEN}✅ File recovered to host${NC}"
    echo "   Location: media/$DB_FILE"
    echo "   Next: Rebuild container to fix permissions permanently"
else
    echo -e "${RED}❌ File recovery failed${NC}"
    echo "   Please re-upload via admin panel"
fi
echo ""
echo "✅ Fix completed!"

