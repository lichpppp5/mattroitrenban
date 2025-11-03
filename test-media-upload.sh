#!/bin/bash

# Script để test media upload functionality trên server

echo "🧪 Testing media upload functionality..."
echo ""

cd /mattroitrenban || exit 1

# 1. Kiểm tra thư mục media
echo "📁 Checking media directory..."
if [ -d "media" ]; then
    echo "✅ media/ directory exists"
    ls -ld media/
    
    # Check permissions
    if [ -w "media" ]; then
        echo "✅ media/ is writable"
    else
        echo "❌ media/ is NOT writable!"
        echo "   Fixing permissions..."
        chmod 755 media
        chown -R $USER:$USER media 2>/dev/null || true
    fi
    
    # Count files
    FILE_COUNT=$(find media -type f 2>/dev/null | wc -l)
    echo "   Files in media/: $FILE_COUNT"
else
    echo "❌ media/ directory NOT found!"
    echo "   Creating..."
    mkdir -p media
    chmod 755 media
    echo "✅ Created media/ directory"
fi
echo ""

# 2. Kiểm tra Docker volume
echo "🐳 Checking Docker volume mapping..."
if docker compose ps app | grep -q "Up"; then
    echo "✅ App container is running"
    
    # Check if volume is mounted
    if docker compose exec -T app ls /app/public/media 2>/dev/null >/dev/null; then
        echo "✅ /app/public/media exists in container"
    else
        echo "⚠️  /app/public/media does not exist in container"
        echo "   Creating in container..."
        docker compose exec -T app mkdir -p /app/public/media
        docker compose exec -T app chmod 755 /app/public/media
    fi
else
    echo "❌ App container is NOT running!"
fi
echo ""

# 3. Kiểm tra Nginx config
echo "🌐 Checking Nginx /media location..."
if grep -q "location /media" nginx.conf; then
    echo "✅ Nginx has /media location configured"
    
    # Check if volume is mounted in Nginx
    if docker compose exec -T nginx ls /var/www/media 2>/dev/null >/dev/null; then
        echo "✅ /var/www/media exists in Nginx container"
    else
        echo "⚠️  /var/www/media does not exist in Nginx container"
    fi
else
    echo "❌ Nginx /media location NOT found!"
fi
echo ""

# 4. Test write permission
echo "📝 Testing write permission..."
TEST_FILE="media/test_write_$(date +%s).txt"
if echo "test" > "$TEST_FILE" 2>/dev/null; then
    echo "✅ Can write to media/ directory"
    rm -f "$TEST_FILE"
else
    echo "❌ Cannot write to media/ directory!"
    echo "   Fixing permissions..."
    chmod 755 media
    chown -R $USER:$USER media 2>/dev/null || true
fi
echo ""

# 5. Kiểm tra API endpoint
echo "🔌 Testing /api/media endpoint..."
sleep 2
if curl -s http://localhost/api/media -H "Cookie: test=1" 2>/dev/null | grep -q "Unauthorized\|error\|media"; then
    echo "✅ /api/media endpoint is responding"
    echo "   (401 Unauthorized is expected without session)"
else
    echo "⚠️  /api/media endpoint might not be responding correctly"
fi
echo ""

# 6. Kiểm tra logs
echo "📋 Recent app logs (last 20 lines)..."
docker compose logs app --tail 20 2>/dev/null | grep -i "media\|upload\|error" || echo "   No relevant logs found"
echo ""

# 7. Recommendations
echo "📝 Recommendations:"
echo "   1. Ensure media/ directory exists and is writable"
echo "   2. Restart Docker containers: docker compose restart"
echo "   3. Check browser console for detailed error messages"
echo "   4. Verify you are logged in as admin/editor"
echo "   5. Check server logs: docker compose logs app | tail -50"

