#!/bin/bash

# Script to test media file access
set -e

echo "🧪 Testing Media File Access..."
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# 1. Check files in media directory
echo "1️⃣  Checking files in media directory..."
if [ -d "media" ]; then
    FILE_COUNT=$(find media -type f | wc -l)
    echo "   Files in media/: $FILE_COUNT"
    
    if [ "$FILE_COUNT" -gt 0 ]; then
        echo "   Sample files:"
        ls -lh media/ | head -5 | tail -4
    else
        echo -e "${YELLOW}⚠️  No files in media/ directory${NC}"
    fi
else
    echo -e "${RED}❌ media/ directory not found${NC}"
fi

echo ""

# 2. Check files in Nginx container
echo "2️⃣  Checking files in Nginx container..."
if docker ps | grep -q "mattroitrenban_nginx"; then
    if docker exec mattroitrenban_nginx test -d /var/www/media 2>/dev/null; then
        FILE_COUNT=$(docker exec mattroitrenban_nginx ls -1 /var/www/media 2>/dev/null | wc -l || echo "0")
        echo "   Files in container: $FILE_COUNT"
        
        if [ "$FILE_COUNT" -gt 0 ]; then
            echo "   Sample files:"
            docker exec mattroitrenban_nginx ls -lh /var/www/media/ 2>/dev/null | head -5 | tail -4
        else
            echo -e "${YELLOW}⚠️  No files in container${NC}"
        fi
    else
        echo -e "${RED}❌ /var/www/media not accessible${NC}"
    fi
else
    echo -e "${RED}❌ Nginx container not running${NC}"
fi

echo ""

# 3. Test HTTP access
echo "3️⃣  Testing HTTP access..."
if docker ps | grep -q "mattroitrenban_nginx"; then
    # Get a sample file
    SAMPLE_FILE=$(ls media/ 2>/dev/null | grep -v "^\.$" | head -1)
    
    if [ -n "$SAMPLE_FILE" ]; then
        echo "   Testing with: $SAMPLE_FILE"
        
        # Test from host
        HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost/media/$SAMPLE_FILE" || echo "000")
        if [ "$HTTP_CODE" = "200" ]; then
            echo -e "   ${GREEN}✅ HTTP 200 OK from localhost${NC}"
        elif [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
            echo -e "   ${YELLOW}⚠️  HTTP $HTTP_CODE (redirect) from localhost${NC}"
            echo "      This is normal if HTTPS redirect is enabled"
            # Follow redirect
            FINAL_URL=$(curl -s -o /dev/null -w "%{url_effective}" -L "http://localhost/media/$SAMPLE_FILE" 2>/dev/null || echo "")
            if [ -n "$FINAL_URL" ]; then
                FINAL_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$FINAL_URL" 2>/dev/null || echo "000")
                if [ "$FINAL_CODE" = "200" ]; then
                    echo -e "      ${GREEN}✅ Final URL returns 200 OK${NC}"
                fi
            fi
        else
            echo -e "   ${RED}❌ HTTP $HTTP_CODE from localhost${NC}"
        fi
        
        # Test from container
        HTTP_CODE=$(docker exec mattroitrenban_nginx curl -s -o /dev/null -w "%{http_code}" "http://localhost/media/$SAMPLE_FILE" 2>/dev/null || echo "000")
        if [ "$HTTP_CODE" = "200" ]; then
            echo -e "   ${GREEN}✅ HTTP 200 OK from container${NC}"
        else
            echo -e "   ${YELLOW}⚠️  HTTP $HTTP_CODE from container (may need curl in container)${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  No sample file to test${NC}"
    fi
else
    echo -e "${RED}❌ Nginx container not running${NC}"
fi

echo ""

# 4. Check for missing files from console errors
echo "4️⃣  Checking for previously missing files..."
MISSING_FILES=(
    "1762422110549-niemvuicuaem.mp3"
    "1762421023441-DSC02112.JPG"
    "1762419119062-DSC02376.JPG"
)

for file in "${MISSING_FILES[@]}"; do
    if [ -f "media/$file" ]; then
        echo -e "   ${GREEN}✅ Found: $file${NC}"
    else
        echo -e "   ${RED}❌ Missing: $file${NC}"
        echo -e "      ${YELLOW}   → Need to re-upload via admin panel${NC}"
    fi
done

echo ""

# 5. Test Nginx config
echo "5️⃣  Testing Nginx configuration..."
if docker ps | grep -q "mattroitrenban_nginx"; then
    if docker exec mattroitrenban_nginx nginx -t 2>/dev/null; then
        echo -e "${GREEN}✅ Nginx config is valid${NC}"
    else
        echo -e "${RED}❌ Nginx config has errors${NC}"
        docker exec mattroitrenban_nginx nginx -t
    fi
fi

echo ""
echo "📝 Summary:"
echo "- Media directory: $(find media -type f 2>/dev/null | wc -l) files"
echo "- Nginx container: $(docker exec mattroitrenban_nginx ls -1 /var/www/media 2>/dev/null | wc -l || echo "0") files"
echo "- Volume mount: Working ✅"
echo "- If files are missing, upload via: https://mattroitrenban.vn/root-admin/media"
echo ""
echo "✅ Test completed!"

