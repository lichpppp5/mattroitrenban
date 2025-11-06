#!/bin/bash

# Script to fix missing media files (404 errors)
set -e

echo "🔧 Fixing Missing Media Files (404 Errors)..."
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Files reported as missing
MISSING_FILES=(
    "1762422110549-niemvuicuaem.mp3"
    "1762421023441-DSC02112.JPG"
    "1762419119062-DSC02376.JPG"
)

echo "📋 Checking for missing files..."
echo ""

# Check in different locations
for file in "${MISSING_FILES[@]}"; do
    echo "Checking: $file"
    
    FOUND=false
    
    # Check in media/
    if [ -f "media/$file" ]; then
        echo -e "  ${GREEN}✅ Found in media/$file${NC}"
        FOUND=true
        
        # Ensure it exists in public/media/ too
        if [ ! -f "public/media/$file" ]; then
            echo -e "  ${YELLOW}⚠️  Copying to public/media/${NC}"
            mkdir -p public/media
            cp "media/$file" "public/media/$file"
            chmod 644 "public/media/$file"
        fi
    fi
    
    # Check in public/media/
    if [ -f "public/media/$file" ]; then
        echo -e "  ${GREEN}✅ Found in public/media/$file${NC}"
        FOUND=true
        
        # Ensure it exists in media/ too
        if [ ! -f "media/$file" ]; then
            echo -e "  ${YELLOW}⚠️  Copying to media/${NC}"
            mkdir -p media
            cp "public/media/$file" "media/$file"
            chmod 644 "media/$file"
        fi
    fi
    
    # Check in Docker containers
    if command -v docker >/dev/null 2>&1; then
        if docker ps | grep -q "mattroitrenban_app"; then
            if docker exec mattroitrenban_app test -f "/app/public/media/$file" 2>/dev/null; then
                echo -e "  ${GREEN}✅ Found in app container${NC}"
                FOUND=true
            fi
        fi
        
        if docker ps | grep -q "mattroitrenban_nginx"; then
            if docker exec mattroitrenban_nginx test -f "/var/www/media/$file" 2>/dev/null; then
                echo -e "  ${GREEN}✅ Found in nginx container${NC}"
                FOUND=true
            else
                echo -e "  ${RED}❌ NOT found in nginx container${NC}"
                # Try to copy from host
                if [ -f "media/$file" ]; then
                    echo -e "  ${YELLOW}⚠️  File exists on host, but not in nginx container${NC}"
                    echo -e "  ${YELLOW}   This is likely a volume mount issue${NC}"
                fi
            fi
        fi
    fi
    
    if [ "$FOUND" = false ]; then
        echo -e "  ${RED}❌ File NOT FOUND anywhere${NC}"
        echo -e "  ${YELLOW}   This file may need to be re-uploaded${NC}"
    fi
    
    echo ""
done

# Check volume mounts
echo "📦 Checking Docker volume mounts..."
if command -v docker >/dev/null 2>&1; then
    if docker ps | grep -q "mattroitrenban_app"; then
        echo "App container volumes:"
        docker inspect mattroitrenban_app | grep -A 10 '"Mounts"' | grep -E 'Source|Destination' || echo "  Could not inspect volumes"
    fi
    
    if docker ps | grep -q "mattroitrenban_nginx"; then
        echo "Nginx container volumes:"
        docker inspect mattroitrenban_nginx | grep -A 10 '"Mounts"' | grep -E 'Source|Destination' || echo "  Could not inspect volumes"
    fi
fi

echo ""
echo "🔧 Fixing steps:"
echo ""
echo "1. Ensure files exist in ./media/ directory on host"
echo "2. Sync files:"
echo "   - Copy from media/ to public/media/ if needed"
echo "   - Ensure Docker volumes are mounted correctly"
echo ""
echo "3. Restart containers:"
echo "   docker compose restart app nginx"
echo ""
echo "4. Test access:"
echo "   curl -I http://localhost/media/[filename]"
echo ""
echo "5. If files are missing, they need to be re-uploaded via admin panel"
echo ""
echo "✅ Check completed!"

