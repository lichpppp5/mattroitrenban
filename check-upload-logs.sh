#!/bin/bash

# Script to check upload logs and diagnose missing files
set -e

echo "🔍 Checking Upload Logs and Diagnosing Missing Files..."
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# File from database
DB_FILE="1762425608157-niemvuicuaem.mp3"

echo "📋 File from database: $DB_FILE"
echo ""

# 1. Check if file exists on host
echo "1️⃣  Checking if file exists on host..."
if [ -f "media/$DB_FILE" ]; then
    echo -e "${GREEN}✅ File exists: media/$DB_FILE${NC}"
    ls -lh "media/$DB_FILE"
elif [ -f "public/media/$DB_FILE" ]; then
    echo -e "${GREEN}✅ File exists: public/media/$DB_FILE${NC}"
    ls -lh "public/media/$DB_FILE"
    echo -e "${YELLOW}⚠️  File in wrong location, copying to media/${NC}"
    cp "public/media/$DB_FILE" "media/$DB_FILE"
    chmod 644 "media/$DB_FILE"
    echo -e "${GREEN}✅ Copied to media/${NC}"
else
    echo -e "${RED}❌ File NOT found on host${NC}"
    echo "   Checking all files with similar names..."
    find media -name "*niemvuicuaem*" -o -name "*1762425608157*" 2>/dev/null || echo "   No similar files found"
fi

echo ""

# 2. Check in Docker containers
echo "2️⃣  Checking in Docker containers..."
if command -v docker >/dev/null 2>&1; then
    # App container
    if docker ps | grep -q "mattroitrenban_app"; then
        echo "App Container:"
        if docker exec mattroitrenban_app test -f "/app/public/media/$DB_FILE" 2>/dev/null; then
            echo -e "${GREEN}✅ File exists in app container${NC}"
            docker exec mattroitrenban_app ls -lh "/app/public/media/$DB_FILE"
        else
            echo -e "${RED}❌ File NOT found in app container${NC}"
        fi
    fi
    
    # Nginx container
    if docker ps | grep -q "mattroitrenban_nginx"; then
        echo "Nginx Container:"
        if docker exec mattroitrenban_nginx test -f "/var/www/media/$DB_FILE" 2>/dev/null; then
            echo -e "${GREEN}✅ File exists in nginx container${NC}"
            docker exec mattroitrenban_nginx ls -lh "/var/www/media/$DB_FILE"
        else
            echo -e "${RED}❌ File NOT found in nginx container${NC}"
        fi
    fi
fi

echo ""

# 3. Check upload logs
echo "3️⃣  Checking upload logs..."
if command -v docker >/dev/null 2>&1 && docker ps | grep -q "mattroitrenban_app"; then
    echo "Recent upload logs:"
    docker compose logs app | grep -i "media\|upload\|$DB_FILE\|niemvuicuaem" | tail -30 || echo "   No relevant logs found"
    
    echo ""
    echo "Error logs:"
    docker compose logs app | grep -i "error\|failed\|❌" | tail -20 || echo "   No errors found"
fi

echo ""

# 4. Check file write permissions
echo "4️⃣  Checking file write permissions..."
if [ -d "media" ]; then
    PERMS=$(stat -c "%a" media 2>/dev/null || stat -f "%OLp" media 2>/dev/null || echo "unknown")
    echo "   media/ permissions: $PERMS"
    
    # Test write
    TEST_FILE="media/.test_write_$(date +%s)"
    if touch "$TEST_FILE" 2>/dev/null; then
        echo -e "${GREEN}✅ Write access OK${NC}"
        rm -f "$TEST_FILE"
    else
        echo -e "${RED}❌ Write access FAILED${NC}"
    fi
fi

echo ""

# 5. Check volume mount
echo "5️⃣  Checking volume mount..."
if command -v docker >/dev/null 2>&1 && docker ps | grep -q "mattroitrenban_app"; then
    MOUNT_CHECK=$(docker exec mattroitrenban_app test -w /app/public/media 2>/dev/null && echo "writable" || echo "not writable")
    echo "   /app/public/media is: $MOUNT_CHECK"
    
    # List files in container
    echo "   Files in container:"
    docker exec mattroitrenban_app ls -1 /app/public/media/ 2>/dev/null | head -10 || echo "   (Could not list)"
fi

echo ""

# 6. Recommendations
echo "📝 Recommendations:"
echo ""

if [ ! -f "media/$DB_FILE" ] && [ ! -f "public/media/$DB_FILE" ]; then
    echo -e "${YELLOW}⚠️  File is missing from disk${NC}"
    echo ""
    echo "Options:"
    echo "1. Re-upload the file via admin panel"
    echo "2. If you have a backup, copy it to media/ directory:"
    echo "   cp /path/to/backup/niemvuicuaem.mp3 media/$DB_FILE"
    echo "3. Check if file was uploaded to Cloudinary (if configured)"
    echo ""
    echo "After fixing, restart containers:"
    echo "   docker compose restart app nginx"
else
    echo -e "${GREEN}✅ File exists, checking sync...${NC}"
    echo "   If file exists but not accessible, restart containers:"
    echo "   docker compose restart app nginx"
fi

echo ""
echo "✅ Diagnosis completed!"
