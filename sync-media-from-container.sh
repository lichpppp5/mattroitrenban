#!/bin/bash

# Script to sync media files from container to host
set -e

echo "🔄 Syncing Media Files from Container to Host..."
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

# 1. Check in app container
echo "1️⃣  Checking in app container..."
if command -v docker >/dev/null 2>&1 && docker ps | grep -q "mattroitrenban_app"; then
    if docker exec mattroitrenban_app test -f "/app/public/media/$DB_FILE" 2>/dev/null; then
        echo -e "${GREEN}✅ File found in app container${NC}"
        
        # Get file info
        docker exec mattroitrenban_app ls -lh "/app/public/media/$DB_FILE"
        
        # Copy to host
        echo -e "${BLUE}📥 Copying to host...${NC}"
        docker cp "mattroitrenban_app:/app/public/media/$DB_FILE" "media/$DB_FILE"
        
        if [ -f "media/$DB_FILE" ]; then
            chmod 644 "media/$DB_FILE"
            echo -e "${GREEN}✅ File copied to media/$DB_FILE${NC}"
            ls -lh "media/$DB_FILE"
        else
            echo -e "${RED}❌ Copy failed${NC}"
        fi
    else
        echo -e "${RED}❌ File NOT found in app container${NC}"
        
        # List all files in container
        echo "   Files in container:"
        docker exec mattroitrenban_app ls -1 /app/public/media/ 2>/dev/null | head -10 || echo "   (Could not list)"
    fi
else
    echo -e "${RED}❌ App container not running${NC}"
fi

echo ""

# 2. Check in nginx container
echo "2️⃣  Checking in nginx container..."
if command -v docker >/dev/null 2>&1 && docker ps | grep -q "mattroitrenban_nginx"; then
    if docker exec mattroitrenban_nginx test -f "/var/www/media/$DB_FILE" 2>/dev/null; then
        echo -e "${GREEN}✅ File found in nginx container${NC}"
        
        # Get file info
        docker exec mattroitrenban_nginx ls -lh "/var/www/media/$DB_FILE"
        
        # Copy to host if not already copied
        if [ ! -f "media/$DB_FILE" ]; then
            echo -e "${BLUE}📥 Copying to host...${NC}"
            docker cp "mattroitrenban_nginx:/var/www/media/$DB_FILE" "media/$DB_FILE"
            
            if [ -f "media/$DB_FILE" ]; then
                chmod 644 "media/$DB_FILE"
                echo -e "${GREEN}✅ File copied to media/$DB_FILE${NC}"
            fi
        else
            echo -e "${BLUE}ℹ️  File already exists on host${NC}"
        fi
    else
        echo -e "${RED}❌ File NOT found in nginx container${NC}"
    fi
else
    echo -e "${RED}❌ Nginx container not running${NC}"
fi

echo ""

# 3. Verify on host
echo "3️⃣  Verifying on host..."
if [ -f "media/$DB_FILE" ]; then
    echo -e "${GREEN}✅ File exists on host${NC}"
    ls -lh "media/$DB_FILE"
    
    # Test access
    echo ""
    echo "4️⃣  Testing access..."
    if curl -I "http://localhost/media/$DB_FILE" 2>/dev/null | grep -q "200\|301\|302"; then
        echo -e "${GREEN}✅ File accessible via HTTP${NC}"
    else
        echo -e "${YELLOW}⚠️  File not accessible via HTTP (may need restart)${NC}"
    fi
else
    echo -e "${RED}❌ File still NOT found on host${NC}"
    echo ""
    echo "📝 Next steps:"
    echo "1. Check upload logs: docker compose logs app | grep -i 'media\|upload\|$DB_FILE'"
    echo "2. Re-upload the file via admin panel"
    echo "3. If file was uploaded to Cloudinary, check Cloudinary dashboard"
fi

echo ""
echo "✅ Sync completed!"

