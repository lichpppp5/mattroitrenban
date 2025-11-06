#!/bin/bash

# Script to fix Nginx media volume mount issue
set -e

echo "🔧 Fixing Nginx Media Volume Mount..."
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# 1. Check if media directory exists
echo "1️⃣  Checking media directory..."
if [ ! -d "media" ]; then
    echo -e "${YELLOW}⚠️  media/ directory not found, creating...${NC}"
    mkdir -p media
    chmod 755 media
    echo -e "${GREEN}✅ Created media/ directory${NC}"
else
    echo -e "${GREEN}✅ media/ directory exists${NC}"
    FILE_COUNT=$(find media -type f | wc -l)
    echo "   Files in media/: $FILE_COUNT"
fi

echo ""

# 2. Check docker-compose.yml
echo "2️⃣  Checking docker-compose.yml..."
if grep -q "./media:/var/www/media" docker-compose.yml; then
    echo -e "${GREEN}✅ docker-compose.yml has correct volume mount${NC}"
else
    echo -e "${RED}❌ docker-compose.yml missing media volume mount${NC}"
    echo "   Please check docker-compose.yml"
    exit 1
fi

echo ""

# 3. Check current Nginx container
echo "3️⃣  Checking Nginx container..."
if docker ps | grep -q "mattroitrenban_nginx"; then
    echo -e "${GREEN}✅ Nginx container is running${NC}"
    
    # Check if volume is mounted
    MOUNTED=$(docker inspect mattroitrenban_nginx | grep -A 10 '"Mounts"' | grep -c "media" || echo "0")
    if [ "$MOUNTED" -gt 0 ]; then
        echo -e "${GREEN}✅ Media volume is mounted${NC}"
    else
        echo -e "${RED}❌ Media volume NOT mounted${NC}"
        echo -e "${YELLOW}⚠️  Need to recreate container${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Nginx container is not running${NC}"
fi

echo ""

# 4. Recreate Nginx container to apply volume mount
echo "4️⃣  Recreating Nginx container..."
read -p "   Recreate Nginx container to apply volume mount? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${GREEN}Recreating Nginx container...${NC}"
    docker compose stop nginx
    docker compose rm -f nginx
    docker compose up -d nginx
    echo -e "${GREEN}✅ Nginx container recreated${NC}"
    
    # Wait a moment for container to start
    sleep 2
    
    # Verify mount
    if docker exec mattroitrenban_nginx test -d /var/www/media 2>/dev/null; then
        echo -e "${GREEN}✅ Media directory accessible in Nginx container${NC}"
        
        # List files
        FILE_COUNT=$(docker exec mattroitrenban_nginx ls -1 /var/www/media 2>/dev/null | wc -l || echo "0")
        echo "   Files in container: $FILE_COUNT"
    else
        echo -e "${RED}❌ Media directory NOT accessible in Nginx container${NC}"
        echo "   Please check docker-compose.yml and restart manually"
    fi
else
    echo "   Skipped recreation"
fi

echo ""

# 5. Test access
echo "5️⃣  Testing media access..."
if docker ps | grep -q "mattroitrenban_nginx"; then
    # Test if we can access media directory
    if docker exec mattroitrenban_nginx test -d /var/www/media 2>/dev/null; then
        echo -e "${GREEN}✅ Media directory is accessible${NC}"
        
        # Test with a sample file if exists
        SAMPLE_FILE=$(ls media/ 2>/dev/null | head -1)
        if [ -n "$SAMPLE_FILE" ]; then
            echo "   Testing with sample file: $SAMPLE_FILE"
            if docker exec mattroitrenban_nginx test -f "/var/www/media/$SAMPLE_FILE" 2>/dev/null; then
                echo -e "${GREEN}✅ Sample file accessible in container${NC}"
            else
                echo -e "${YELLOW}⚠️  Sample file not found in container (may need sync)${NC}"
            fi
        fi
    else
        echo -e "${RED}❌ Media directory NOT accessible${NC}"
    fi
fi

echo ""
echo "📝 Next Steps:"
echo "1. If files are missing, upload them via admin panel"
echo "2. Files uploaded will be saved to ./media/ on host"
echo "3. Nginx will serve them from /var/www/media/ in container"
echo "4. Test access: curl -I http://localhost/media/[filename]"
echo ""
echo "✅ Fix completed!"

