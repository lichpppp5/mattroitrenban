#!/bin/bash

# Script toàn diện để fix ảnh trong phần Hoạt Động

echo "🔧 Fixing activity images..."
echo ""

cd /mattroitrenban || exit 1

# 1. Check database for image URLs
echo "🗄️  Checking database for image URLs..."
POSTGRES_USER=$(grep "^POSTGRES_USER=" .env.production 2>/dev/null | cut -d '=' -f2 | tr -d '"' | tr -d "'" | head -1 || echo "mattroitrenban")
POSTGRES_DB=$(grep "^POSTGRES_DB=" .env.production 2>/dev/null | cut -d '=' -f2 | tr -d '"' | tr -d "'" | head -1 || echo "mattroitrendb")

if docker compose ps postgres | grep -q "Up"; then
    echo "   Getting all image URLs from activities..."
    docker compose exec -T postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -t -c "
        SELECT DISTINCT jsonb_array_elements_text(images) 
        FROM \"Activity\" 
        WHERE images IS NOT NULL 
        AND jsonb_array_length(images) > 0 
        LIMIT 20;
    " 2>/dev/null | grep -E "/media/|/uploads/" | sed 's/^[[:space:]]*//' | while read img_url; do
        if [ -n "$img_url" ]; then
            filename=$(basename "$img_url" | sed 's/[?].*//')
            echo "   Found: $filename"
        fi
    done
fi
echo ""

# 2. Check files in container /app/public/media
echo "📦 Checking files in container /app/public/media..."
if docker compose ps app | grep -q "Up"; then
    CONTAINER_FILES=$(docker compose exec -T app find /app/public/media -type f -name "*.JPG" -o -name "*.jpg" -o -name "*.png" -o -name "*.PNG" 2>/dev/null | wc -l)
    echo "   Files in container: $CONTAINER_FILES"
    
    if [ "$CONTAINER_FILES" -eq 0 ]; then
        echo "   ⚠️  No files in /app/public/media, checking /app/media..."
        ALT_FILES=$(docker compose exec -T app find /app/media -type f 2>/dev/null | wc -l)
        echo "   Files in /app/media (alternative): $ALT_FILES"
        
        if [ "$ALT_FILES" -gt 0 ]; then
            echo "   📋 Files in /app/media:"
            docker compose exec -T app find /app/media -type f -exec basename {} \; 2>/dev/null | head -10
        fi
    else
        echo "   📋 Sample files:"
        docker compose exec -T app ls -lh /app/public/media/ | head -5
    fi
else
    echo "   ⚠️  App container not running"
fi
echo ""

# 3. Check files on host
echo "📁 Checking files on host..."
if [ -d "media" ]; then
    HOST_FILES=$(find media -type f 2>/dev/null | wc -l)
    echo "   Files on host: $HOST_FILES"
    
    if [ "$HOST_FILES" -eq 0 ]; then
        echo "   ⚠️  No files on host!"
    else
        echo "   📋 Sample files:"
        ls -lh media/ | head -5
    fi
else
    echo "   ❌ media/ directory does not exist!"
    mkdir -p media
    chmod 755 media
fi
echo ""

# 4. Sync files from container to host
echo "📤 Syncing files from container to host..."
if docker compose ps app | grep -q "Up"; then
    # Copy from /app/public/media first
    if docker compose exec -T app test -d /app/public/media 2>/dev/null; then
        echo "   Copying from /app/public/media..."
        docker compose cp app:/app/public/media/. ./media/ 2>/dev/null && echo "   ✅ Copied from /app/public/media" || echo "   ⚠️  Copy failed"
    fi
    
    # Copy from /app/media (alternative location)
    if docker compose exec -T app test -d /app/media 2>/dev/null; then
        ALT_COUNT=$(docker compose exec -T app find /app/media -type f 2>/dev/null | wc -l)
        if [ "$ALT_COUNT" -gt 0 ]; then
            echo "   Copying from /app/media (alternative)..."
            
            # Copy each file individually
            docker compose exec -T app find /app/media -type f -exec basename {} \; 2>/dev/null | while read file; do
                if [ -n "$file" ] && [ ! -f "media/$file" ]; then
                    docker compose cp "app:/app/media/$file" "media/" 2>/dev/null && echo "   ✅ Copied: $file" || echo "   ⚠️  Failed: $file"
                fi
            done
            
            # Also copy to container's /app/public/media for future
            docker compose exec -T app sh -c "
                mkdir -p /app/public/media && \
                cp -r /app/media/* /app/public/media/ 2>/dev/null && \
                chmod -R 644 /app/public/media/* 2>/dev/null && \
                chmod 755 /app/public/media 2>/dev/null
            " && echo "   ✅ Copied to /app/public/media in container"
        fi
    fi
fi
echo ""

# 5. Check Nginx config
echo "🌐 Checking Nginx configuration..."
if grep -q "location /media" nginx.conf && grep -q "alias /var/www/media" nginx.conf; then
    echo "   ✅ /media location configured"
else
    echo "   ❌ /media location missing!"
    if [ -f "fix-nginx-media.sh" ]; then
        echo "   Running fix-nginx-media.sh..."
        ./fix-nginx-media.sh
    fi
fi

# Check if volume is correctly mapped
if docker compose ps nginx | grep -q "Up"; then
    if docker compose exec -T nginx test -d /var/www/media 2>/dev/null; then
        NGINX_FILES=$(docker compose exec -T nginx find /var/www/media -type f 2>/dev/null | wc -l)
        echo "   Files accessible to Nginx: $NGINX_FILES"
        
        if [ "$NGINX_FILES" -eq 0 ]; then
            echo "   ⚠️  No files accessible to Nginx!"
            echo "   Checking volume mount..."
            docker compose config | grep -A 2 "nginx:" | grep -A 2 "volumes:" || echo "   Could not verify volume mount"
        fi
    else
        echo "   ❌ /var/www/media does not exist in Nginx container!"
    fi
fi
echo ""

# 6. Fix permissions
echo "🔐 Fixing permissions..."
chmod -R 755 media 2>/dev/null || true
find media -type f -exec chmod 644 {} \; 2>/dev/null || true
echo "   ✅ Permissions fixed"
echo ""

# 7. Restart services
echo "🔄 Restarting services..."
docker compose restart nginx app
sleep 3
echo ""

# 8. Test specific files from console errors
echo "🧪 Testing specific files from console errors..."
TEST_FILES=(
    "1762160540521-DSC02196.JPG"
    "1762160541991-DSC02386.JPG"
    "1762159010287-DSC02112.JPG"
)

for file in "${TEST_FILES[@]}"; do
    if [ -f "media/$file" ]; then
        echo "   ✅ $file exists on host"
    else
        echo "   ❌ $file missing on host"
    fi
    
    # Test Nginx access
    if curl -s -o /dev/null -w "%{http_code}" "http://localhost/media/$file" | grep -q "200\|404"; then
        HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost/media/$file")
        if [ "$HTTP_CODE" = "200" ]; then
            echo "      ✅ Accessible via Nginx (HTTP $HTTP_CODE)"
        else
            echo "      ❌ Nginx returns HTTP $HTTP_CODE"
        fi
    else
        echo "      ⚠️  Cannot test Nginx access"
    fi
done
echo ""

echo "✅ Diagnostic complete!"
echo ""
echo "📝 Next steps:"
echo "   1. If files are missing: Upload images again through admin panel"
echo "   2. If files exist but 404: Check Nginx logs: docker compose logs nginx | grep media"
echo "   3. If volume issue: Restart all containers: docker compose down && docker compose up -d"

