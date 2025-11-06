#!/bin/bash

# Script to verify and fix media directory structure
set -e

echo "🔍 Verifying Media Directory Structure..."
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "📋 Expected Structure:"
echo "   Host: ./media/ (root level)"
echo "   App Container: /app/public/media/ (mapped from ./media)"
echo "   Nginx Container: /var/www/media/ (mapped from ./media)"
echo ""

# 1. Check host structure
echo "1️⃣  Checking Host Structure..."
echo ""

# Check ./media
if [ -d "media" ]; then
    echo -e "${GREEN}✅ ./media/ exists${NC}"
    FILE_COUNT=$(find media -maxdepth 1 -type f | wc -l)
    DIR_COUNT=$(find media -maxdepth 1 -type d | wc -l)
    echo "   Files in root: $FILE_COUNT"
    echo "   Subdirectories: $((DIR_COUNT - 1))"
    
    # List structure
    echo "   Structure:"
    ls -la media/ | grep -E "^d|^-" | head -10
else
    echo -e "${RED}❌ ./media/ NOT found${NC}"
    echo -e "${YELLOW}   Creating...${NC}"
    mkdir -p media
    chmod 755 media
    echo -e "${GREEN}✅ Created ./media/${NC}"
fi

# Check public/media (should exist but may be empty or symlink)
if [ -d "public/media" ]; then
    echo -e "${BLUE}ℹ️  public/media/ exists${NC}"
    FILE_COUNT=$(find public/media -maxdepth 1 -type f 2>/dev/null | wc -l)
    echo "   Files: $FILE_COUNT"
    
    # Check if it's a symlink
    if [ -L "public/media" ]; then
        echo -e "${BLUE}   (This is a symlink)${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  public/media/ not found${NC}"
    echo "   (This is OK - files are stored in ./media/ and mounted to /app/public/media in container)"
fi

echo ""

# 2. Check Docker volume mounts
echo "2️⃣  Checking Docker Volume Mounts..."
echo ""

if command -v docker >/dev/null 2>&1; then
    # App container
    if docker ps | grep -q "mattroitrenban_app"; then
        echo "App Container:"
        MOUNT_INFO=$(docker inspect mattroitrenban_app 2>/dev/null | grep -A 5 '"Mounts"' | grep -E '"Source"|"Destination"' | grep media || echo "")
        if [ -n "$MOUNT_INFO" ]; then
            echo "$MOUNT_INFO" | while read line; do
                if echo "$line" | grep -q "Source"; then
                    SOURCE=$(echo "$line" | grep -o '"/[^"]*"' | tr -d '"')
                    echo -e "   ${GREEN}✅ Source: $SOURCE${NC}"
                elif echo "$line" | grep -q "Destination"; then
                    DEST=$(echo "$line" | grep -o '"/[^"]*"' | tr -d '"')
                    echo -e "   ${GREEN}✅ Destination: $DEST${NC}"
                fi
            done
            
            # Check if directory exists in container
            if docker exec mattroitrenban_app test -d /app/public/media 2>/dev/null; then
                CONTAINER_FILES=$(docker exec mattroitrenban_app ls -1 /app/public/media 2>/dev/null | wc -l || echo "0")
                echo -e "   ${GREEN}✅ Directory accessible (${CONTAINER_FILES} items)${NC}"
            else
                echo -e "   ${RED}❌ Directory NOT accessible in container${NC}"
            fi
        else
            echo -e "   ${RED}❌ Media volume mount not found${NC}"
        fi
    else
        echo -e "${RED}❌ App container not running${NC}"
    fi
    
    echo ""
    
    # Nginx container
    if docker ps | grep -q "mattroitrenban_nginx"; then
        echo "Nginx Container:"
        MOUNT_INFO=$(docker inspect mattroitrenban_nginx 2>/dev/null | grep -A 5 '"Mounts"' | grep -E '"Source"|"Destination"' | grep media || echo "")
        if [ -n "$MOUNT_INFO" ]; then
            echo "$MOUNT_INFO" | while read line; do
                if echo "$line" | grep -q "Source"; then
                    SOURCE=$(echo "$line" | grep -o '"/[^"]*"' | tr -d '"')
                    echo -e "   ${GREEN}✅ Source: $SOURCE${NC}"
                elif echo "$line" | grep -q "Destination"; then
                    DEST=$(echo "$line" | grep -o '"/[^"]*"' | tr -d '"')
                    echo -e "   ${GREEN}✅ Destination: $DEST${NC}"
                fi
            done
            
            # Check if directory exists in container
            if docker exec mattroitrenban_nginx test -d /var/www/media 2>/dev/null; then
                CONTAINER_FILES=$(docker exec mattroitrenban_nginx ls -1 /var/www/media 2>/dev/null | wc -l || echo "0")
                echo -e "   ${GREEN}✅ Directory accessible (${CONTAINER_FILES} items)${NC}"
            else
                echo -e "   ${RED}❌ Directory NOT accessible in container${NC}"
            fi
        else
            echo -e "   ${RED}❌ Media volume mount not found${NC}"
        fi
    else
        echo -e "${RED}❌ Nginx container not running${NC}"
    fi
else
    echo -e "${RED}❌ Docker not installed${NC}"
fi

echo ""

# 3. Verify structure matches code
echo "3️⃣  Verifying Structure Matches Code..."
echo ""

# Check docker-compose.yml
if [ -f "docker-compose.yml" ]; then
    APP_MOUNT=$(grep -A 1 "app:" docker-compose.yml | grep "media" | head -1 || echo "")
    NGINX_MOUNT=$(grep -A 1 "nginx:" docker-compose.yml | grep "media" | head -1 || echo "")
    
    if echo "$APP_MOUNT" | grep -q "./media:/app/public/media"; then
        echo -e "${GREEN}✅ docker-compose.yml: App mount correct${NC}"
    else
        echo -e "${RED}❌ docker-compose.yml: App mount incorrect${NC}"
        echo "   Expected: ./media:/app/public/media"
        echo "   Found: $APP_MOUNT"
    fi
    
    if echo "$NGINX_MOUNT" | grep -q "./media:/var/www/media"; then
        echo -e "${GREEN}✅ docker-compose.yml: Nginx mount correct${NC}"
    else
        echo -e "${RED}❌ docker-compose.yml: Nginx mount incorrect${NC}"
        echo "   Expected: ./media:/var/www/media"
        echo "   Found: $NGINX_MOUNT"
    fi
else
    echo -e "${RED}❌ docker-compose.yml not found${NC}"
fi

echo ""

# 4. Check API code path
echo "4️⃣  Checking API Code Path..."
echo ""

if [ -f "src/app/api/media/route.ts" ]; then
    API_PATH=$(grep -E "public.*media|mediaDir" src/app/api/media/route.ts | grep "join" | head -1 || echo "")
    if echo "$API_PATH" | grep -q "public.*media"; then
        echo -e "${GREEN}✅ API saves to: public/media${NC}"
        echo "   (This is correct - volume mount maps ./media to /app/public/media)"
    else
        echo -e "${YELLOW}⚠️  Could not verify API path${NC}"
    fi
else
    echo -e "${RED}❌ API route file not found${NC}"
fi

echo ""

# 5. Summary and recommendations
echo "📊 Summary:"
echo ""
echo "Expected Structure:"
echo "  Host:           ./media/"
echo "  App Container:  /app/public/media/ (from ./media)"
echo "  Nginx Container: /var/www/media/ (from ./media)"
echo ""
echo "File Storage:"
echo "  - All files stored in: ./media/ (root level)"
echo "  - No subdirectories needed (files stored flat)"
echo "  - Filename format: [timestamp]-[original-filename]"
echo ""
echo "Volume Mounts:"
echo "  - App:    ./media → /app/public/media"
echo "  - Nginx:  ./media → /var/www/media:ro"
echo ""
echo "✅ Structure verification completed!"

