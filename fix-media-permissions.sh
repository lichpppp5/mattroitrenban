#!/bin/bash

# Script to fix media directory permissions and verify mount
set -e

echo "🔧 Fixing Media Directory Permissions..."
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# 1. Check and fix media directory permissions
echo "1️⃣  Fixing media directory permissions..."
if [ -d "media" ]; then
    # Fix directory permissions
    chmod 755 media
    echo -e "${GREEN}✅ Set media/ permissions to 755${NC}"
    
    # Fix file permissions
    find media -type f -exec chmod 644 {} \;
    FILE_COUNT=$(find media -type f | wc -l)
    echo -e "${GREEN}✅ Set file permissions to 644 (${FILE_COUNT} files)${NC}"
    
    # Fix directory permissions recursively
    find media -type d -exec chmod 755 {} \;
    DIR_COUNT=$(find media -type d | wc -l)
    echo -e "${GREEN}✅ Set directory permissions to 755 (${DIR_COUNT} directories)${NC}"
else
    echo -e "${YELLOW}⚠️  media/ directory not found, creating...${NC}"
    mkdir -p media
    chmod 755 media
    echo -e "${GREEN}✅ Created media/ directory${NC}"
fi

echo ""

# 2. Check ownership
echo "2️⃣  Checking ownership..."
CURRENT_USER=$(whoami)
CURRENT_GROUP=$(id -gn)
echo "   Current user: $CURRENT_USER"
echo "   Current group: $CURRENT_GROUP"

# Check if we can change ownership (may need sudo)
if [ -d "media" ]; then
    OWNER=$(stat -c "%U:%G" media 2>/dev/null || stat -f "%Su:%Sg" media 2>/dev/null || echo "unknown")
    echo "   media/ owner: $OWNER"
    
    # Try to set ownership to current user (may fail without sudo, that's ok)
    chown -R $CURRENT_USER:$CURRENT_GROUP media 2>/dev/null || echo "   (Could not change ownership - may need sudo)"
fi

echo ""

# 3. Verify Docker volume mount
echo "3️⃣  Verifying Docker volume mount..."
if docker ps | grep -q "mattroitrenban_nginx"; then
    # Check if directory exists in container
    if docker exec mattroitrenban_nginx test -d /var/www/media 2>/dev/null; then
        echo -e "${GREEN}✅ /var/www/media exists in Nginx container${NC}"
        
        # Check permissions in container
        PERMS=$(docker exec mattroitrenban_nginx stat -c "%a" /var/www/media 2>/dev/null || echo "unknown")
        echo "   Permissions in container: $PERMS"
        
        # List files
        FILE_COUNT=$(docker exec mattroitrenban_nginx ls -1 /var/www/media 2>/dev/null | wc -l || echo "0")
        echo "   Files in container: $FILE_COUNT"
        
        if [ "$FILE_COUNT" -gt 0 ]; then
            echo "   Sample files:"
            docker exec mattroitrenban_nginx ls -1 /var/www/media 2>/dev/null | head -5
        fi
    else
        echo -e "${RED}❌ /var/www/media NOT accessible in Nginx container${NC}"
        echo -e "${YELLOW}⚠️  This may be a volume mount issue${NC}"
        
        # Check volume mount
        echo "   Checking volume mount..."
        MOUNT_INFO=$(docker inspect mattroitrenban_nginx | grep -A 20 '"Mounts"' | grep -E '"Source"|"Destination"' | grep media || echo "not found")
        if [ -n "$MOUNT_INFO" ]; then
            echo "   Volume mount info:"
            echo "$MOUNT_INFO"
        else
            echo -e "${RED}❌ Media volume mount not found!${NC}"
            echo "   Please check docker-compose.yml"
        fi
    fi
else
    echo -e "${RED}❌ Nginx container is not running${NC}"
fi

echo ""

# 4. Test write access
echo "4️⃣  Testing write access..."
TEST_FILE="media/.test_write_$(date +%s)"
if touch "$TEST_FILE" 2>/dev/null; then
    echo -e "${GREEN}✅ Write access OK${NC}"
    rm -f "$TEST_FILE"
else
    echo -e "${RED}❌ Write access FAILED${NC}"
    echo "   May need to fix permissions or use sudo"
fi

echo ""

# 5. Sync files if needed
echo "5️⃣  Checking file sync..."
if [ -d "media" ] && [ -d "public/media" ]; then
    MEDIA_COUNT=$(find media -type f | wc -l)
    PUBLIC_COUNT=$(find public/media -type f | wc -l)
    
    echo "   Files in media/: $MEDIA_COUNT"
    echo "   Files in public/media/: $PUBLIC_COUNT"
    
    if [ "$MEDIA_COUNT" -gt "$PUBLIC_COUNT" ]; then
        echo -e "${YELLOW}⚠️  Syncing files from media/ to public/media/${NC}"
        mkdir -p public/media
        cp -n media/* public/media/ 2>/dev/null || true
        echo -e "${GREEN}✅ Files synced${NC}"
    fi
fi

echo ""

# 6. Restart containers
echo "6️⃣  Restarting containers..."
read -p "   Restart containers to apply changes? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${GREEN}Restarting containers...${NC}"
    docker compose restart app nginx
    echo -e "${GREEN}✅ Containers restarted${NC}"
    
    # Wait a moment
    sleep 2
    
    # Test again
    if docker exec mattroitrenban_nginx test -d /var/www/media 2>/dev/null; then
        echo -e "${GREEN}✅ Media directory accessible after restart${NC}"
    else
        echo -e "${RED}❌ Media directory still not accessible${NC}"
        echo "   May need to recreate containers:"
        echo "   docker compose down && docker compose up -d"
    fi
else
    echo "   Skipped restart"
fi

echo ""
echo "📝 Summary:"
echo "- Media directory permissions: 755 (directories), 644 (files)"
echo "- Volume mount: ./media:/var/www/media:ro"
echo "- If files are missing, upload via admin panel"
echo "- Test access: curl -I http://localhost/media/[filename]"
echo ""
echo "✅ Fix completed!"
