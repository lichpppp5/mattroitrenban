#!/bin/bash

# Script to fix media 404 errors on production server
set -e

echo "🔧 Fixing Media 404 Errors..."
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# 1. Check if media directory exists
echo "1️⃣  Checking media directory..."
if [ -d "media" ]; then
    echo -e "${GREEN}✅ media/ directory exists${NC}"
    FILE_COUNT=$(find media -type f | wc -l)
    echo "   Files in media/: $FILE_COUNT"
else
    echo -e "${YELLOW}⚠️  media/ directory not found, creating...${NC}"
    mkdir -p media
    chmod -R 755 media
    echo -e "${GREEN}✅ Created media/ directory${NC}"
fi

if [ -d "public/media" ]; then
    echo -e "${GREEN}✅ public/media/ directory exists${NC}"
    FILE_COUNT=$(find public/media -type f | wc -l)
    echo "   Files in public/media/: $FILE_COUNT"
else
    echo -e "${YELLOW}⚠️  public/media/ directory not found, creating...${NC}"
    mkdir -p public/media
    chmod -R 755 public/media
    echo -e "${GREEN}✅ Created public/media/ directory${NC}"
fi

echo ""

# 2. Sync files between media and public/media
echo "2️⃣  Syncing files between media/ and public/media/..."
if [ -d "media" ] && [ -d "public/media" ]; then
    # Copy files from media to public/media if they don't exist
    for file in media/*; do
        if [ -f "$file" ]; then
            filename=$(basename "$file")
            if [ ! -f "public/media/$filename" ]; then
                cp "$file" "public/media/$filename"
                echo "   Copied: $filename"
            fi
        fi
    done
    
    # Copy files from public/media to media if they don't exist
    for file in public/media/*; do
        if [ -f "$file" ]; then
            filename=$(basename "$file")
            if [ ! -f "media/$filename" ]; then
                cp "$file" "media/$filename"
                echo "   Copied: $filename"
            fi
        fi
    done
    echo -e "${GREEN}✅ Files synced${NC}"
fi

echo ""

# 3. Fix permissions
echo "3️⃣  Fixing permissions..."
if [ -d "media" ]; then
    chmod -R 755 media
    find media -type f -exec chmod 644 {} \;
    echo -e "${GREEN}✅ Fixed media/ permissions${NC}"
fi

if [ -d "public/media" ]; then
    chmod -R 755 public/media
    find public/media -type f -exec chmod 644 {} \;
    echo -e "${GREEN}✅ Fixed public/media/ permissions${NC}"
fi

echo ""

# 4. Check Docker volumes
echo "4️⃣  Checking Docker volumes..."
if command -v docker >/dev/null 2>&1; then
    if docker ps | grep -q "mattroitrenban_app"; then
        echo -e "${GREEN}✅ App container is running${NC}"
        
        # Check if files exist in container
        echo "   Checking files in container..."
        docker exec mattroitrenban_app ls -la /app/public/media/ | head -10 || echo "   No files found or cannot access"
    else
        echo -e "${RED}❌ App container is not running${NC}"
    fi
    
    if docker ps | grep -q "mattroitrenban_nginx"; then
        echo -e "${GREEN}✅ Nginx container is running${NC}"
        
        # Check if files exist in Nginx container
        echo "   Checking files in Nginx container..."
        docker exec mattroitrenban_nginx ls -la /var/www/media/ | head -10 || echo "   No files found or cannot access"
    else
        echo -e "${RED}❌ Nginx container is not running${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Docker not installed${NC}"
fi

echo ""

# 5. Restart containers
echo "5️⃣  Restarting containers..."
if command -v docker >/dev/null 2>&1; then
    read -p "   Restart Docker containers? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker compose restart app nginx
        echo -e "${GREEN}✅ Containers restarted${NC}"
    else
        echo "   Skipped restart"
    fi
else
    echo "   Docker not available, skipping restart"
fi

echo ""
echo "📝 Next Steps:"
echo "1. Verify files exist in both media/ and public/media/"
echo "2. Check Docker volume mounts are correct"
echo "3. Test accessing a file: curl http://localhost/media/[filename]"
echo "4. Check Nginx logs: docker compose logs nginx"
echo "5. Check app logs: docker compose logs app | grep media"
echo ""
echo "✅ Fix script completed!"
