#!/bin/bash

# Script để fix lỗi 404 cho media files

echo "🔧 Fixing 404 errors for media files..."
echo ""

cd /mattroitrenban || exit 1

# 1. Kiểm tra media folder
echo "📁 Checking media folder structure..."
if [ -d "media" ]; then
    echo "✅ media/ exists"
    FILE_COUNT=$(find media -type f 2>/dev/null | wc -l)
    echo "   Files in media/: $FILE_COUNT"
    
    if [ $FILE_COUNT -gt 0 ]; then
        echo "   Sample files:"
        ls -lh media/ | head -10
    else
        echo "⚠️  No files in media/ directory"
    fi
else
    echo "❌ media/ directory NOT found! Creating..."
    mkdir -p media
    chmod 755 media
fi
echo ""

# 2. Kiểm tra Docker volumes
echo "🐳 Checking Docker volume mappings..."
docker compose ps

echo ""
echo "📂 Checking volume mounts in containers..."

# Check app container
if docker compose exec -T app ls /app/public/media 2>/dev/null >/dev/null; then
    echo "✅ App container: /app/public/media exists"
    APP_FILES=$(docker compose exec -T app find /app/public/media -type f 2>/dev/null | wc -l)
    echo "   Files in container: $APP_FILES"
else
    echo "⚠️  App container: /app/public/media does not exist"
    echo "   Creating..."
    docker compose exec -T app mkdir -p /app/public/media
    docker compose exec -T app chmod 755 /app/public/media
fi

# Check nginx container
if docker compose exec -T nginx ls /var/www/media 2>/dev/null >/dev/null; then
    echo "✅ Nginx container: /var/www/media exists"
    NGINX_FILES=$(docker compose exec -T nginx find /var/www/media -type f 2>/dev/null | wc -l)
    echo "   Files in Nginx: $NGINX_FILES"
else
    echo "⚠️  Nginx container: /var/www/media does not exist"
    echo "   This might be the issue!"
fi
echo ""

# 3. Kiểm tra Nginx config
echo "🌐 Checking Nginx /media location..."
if grep -q "location /media" nginx.conf && grep -q "alias /var/www/media" nginx.conf; then
    echo "✅ Nginx /media location is configured"
else
    echo "❌ Nginx /media location is NOT configured correctly!"
fi
echo ""

# 4. Test media access
echo "🧪 Testing media access..."
sleep 2

# Check if we can list media directory through nginx
if curl -I http://localhost/media/ 2>/dev/null | head -1 | grep -qE "200|403|404"; then
    echo "✅ /media location is accessible"
else
    echo "⚠️  /media location might not be accessible"
fi
echo ""

# 5. Kiểm tra specific files from console errors
echo "🔍 Checking specific missing files from console..."
MISSING_FILES=(
    "1762159010287-DSC02112.JPG"
    "1762159020572-DSC02376.JPG"
    "1762159025202-DSC02386.JPG"
)

for file in "${MISSING_FILES[@]}"; do
    if [ -f "media/$file" ]; then
        echo "✅ Found: $file"
    else
        echo "❌ Missing: $file"
        # Check in container
        if docker compose exec -T app ls "/app/public/media/$file" 2>/dev/null >/dev/null; then
            echo "   ⚠️  File exists in container but not on host!"
        fi
    fi
done
echo ""

# 6. Fix recommendations
echo "📝 Fix recommendations:"
echo ""

if [ ! -f "media/${MISSING_FILES[0]}" ]; then
    echo "⚠️  Files are missing. Possible causes:"
    echo "   1. Files were uploaded but not saved to disk (check app logs)"
    echo "   2. Volume mapping issue - files in container but not on host"
    echo "   3. Files were deleted or never uploaded successfully"
    echo ""
    echo "🔧 Solutions:"
    echo "   1. Check app logs: docker compose logs app | grep -i 'media\|upload\|error'"
    echo "   2. Restart containers: docker compose restart"
    echo "   3. Verify volume mapping in docker-compose.yml"
    echo "   4. Upload images again through admin panel"
fi

# 7. Sync files from container to host if needed
echo ""
echo "🔄 Syncing files from container to host..."
if docker compose exec -T app find /app/public/media -type f 2>/dev/null | grep -q .; then
    echo "   Copying files from container to host..."
    docker compose cp app:/app/public/media/. ./media/ 2>/dev/null || {
        echo "   ⚠️  Could not copy files. You may need to manually check."
    }
    chmod -R 755 media/ 2>/dev/null
    echo "   ✅ Sync complete"
else
    echo "   ℹ️  No files in container to sync"
fi

echo ""
echo "✅ Diagnostic complete!"

