#!/bin/bash

# Script to recover missing file from alternative location
set -e

echo "🔧 Recovering Missing File from Alternative Location..."
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

# 1. Check in alternative location (/app/media/)
echo "1️⃣  Checking in alternative location (/app/media/)..."
if command -v docker >/dev/null 2>&1 && docker ps | grep -q "mattroitrenban_app"; then
    if docker exec mattroitrenban_app test -f "/app/media/$DB_FILE" 2>/dev/null; then
        echo -e "${GREEN}✅ File found in /app/media/${NC}"
        
        # Get file info
        docker exec mattroitrenban_app ls -lh "/app/media/$DB_FILE"
        
        # Copy to host
        echo -e "${BLUE}📥 Copying to host media/ directory...${NC}"
        docker cp "mattroitrenban_app:/app/media/$DB_FILE" "media/$DB_FILE"
        
        if [ -f "media/$DB_FILE" ]; then
            chmod 644 "media/$DB_FILE"
            echo -e "${GREEN}✅ File copied to media/$DB_FILE${NC}"
            ls -lh "media/$DB_FILE"
            
            # Also try to copy to container's public/media
            echo ""
            echo -e "${BLUE}📥 Copying to container's /app/public/media/...${NC}"
            docker cp "media/$DB_FILE" "mattroitrenban_app:/app/public/media/$DB_FILE"
            
            if docker exec mattroitrenban_app test -f "/app/public/media/$DB_FILE" 2>/dev/null; then
                echo -e "${GREEN}✅ File copied to container's /app/public/media/${NC}"
            else
                echo -e "${YELLOW}⚠️  Could not copy to container (permission issue)${NC}"
            fi
        else
            echo -e "${RED}❌ Copy to host failed${NC}"
        fi
    else
        echo -e "${RED}❌ File NOT found in /app/media/${NC}"
        
        # List all files in /app/media
        echo "   Files in /app/media/:"
        docker exec mattroitrenban_app ls -1 /app/media/ 2>/dev/null | head -10 || echo "   (Could not list)"
    fi
else
    echo -e "${RED}❌ App container not running${NC}"
fi

echo ""

# 2. Fix permissions in container
echo "2️⃣  Fixing permissions in container..."
if command -v docker >/dev/null 2>&1 && docker ps | grep -q "mattroitrenban_app"; then
    echo "   Fixing /app/public/media permissions..."
    docker exec mattroitrenban_app chmod -R 755 /app/public/media 2>/dev/null || echo "   (Could not fix - may need root)"
    docker exec mattroitrenban_app chown -R nextjs:nodejs /app/public/media 2>/dev/null || echo "   (Could not change owner)"
    
    # Test write
    TEST_FILE="/app/public/media/.test_$(date +%s)"
    if docker exec mattroitrenban_app touch "$TEST_FILE" 2>/dev/null; then
        echo -e "${GREEN}✅ Write access OK${NC}"
        docker exec mattroitrenban_app rm -f "$TEST_FILE"
    else
        echo -e "${YELLOW}⚠️  Write access still limited${NC}"
        echo "   This is OK - files will be saved to /app/media/ and synced via volume"
    fi
fi

echo ""

# 3. Verify file on host
echo "3️⃣  Verifying file on host..."
if [ -f "media/$DB_FILE" ]; then
    echo -e "${GREEN}✅ File exists on host${NC}"
    ls -lh "media/$DB_FILE"
    
    # Check file size
    FILE_SIZE=$(stat -c%s "media/$DB_FILE" 2>/dev/null || stat -f%z "media/$DB_FILE" 2>/dev/null || echo "0")
    if [ "$FILE_SIZE" -gt 0 ]; then
        echo -e "${GREEN}✅ File size: $FILE_SIZE bytes${NC}"
    else
        echo -e "${RED}❌ File is empty${NC}"
    fi
else
    echo -e "${RED}❌ File still NOT found on host${NC}"
fi

echo ""

# 4. Restart containers
echo "4️⃣  Restarting containers to sync..."
read -p "   Restart containers to sync files? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${GREEN}Restarting containers...${NC}"
    docker compose restart app nginx
    echo -e "${GREEN}✅ Containers restarted${NC}"
    
    # Wait a moment
    sleep 3
    
    # Verify again
    if docker exec mattroitrenban_nginx test -f "/var/www/media/$DB_FILE" 2>/dev/null; then
        echo -e "${GREEN}✅ File accessible in Nginx container${NC}"
    else
        echo -e "${YELLOW}⚠️  File not yet accessible in Nginx (may need more time)${NC}"
    fi
else
    echo "   Skipped restart"
fi

echo ""
echo "📝 Summary:"
if [ -f "media/$DB_FILE" ]; then
    echo -e "${GREEN}✅ File recovered successfully${NC}"
    echo "   Location: media/$DB_FILE"
    echo "   Next: Restart containers to sync"
else
    echo -e "${RED}❌ File recovery failed${NC}"
    echo "   Options:"
    echo "   1. Re-upload via admin panel"
    echo "   2. Check if file exists in /app/media/ and copy manually"
fi
echo ""
echo "✅ Recovery completed!"

