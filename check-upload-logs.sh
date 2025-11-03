#!/bin/bash

# Script để check upload logs và tìm nguyên nhân files không được lưu

echo "🔍 Checking upload logs and file save issues..."
echo ""

cd /mattroitrenban || exit 1

# 1. Check app logs for upload errors
echo "📋 Recent app logs (last 50 lines)..."
docker compose logs app --tail 50 | grep -i "media\|upload\|error\|file\|save" || echo "   No relevant logs found"
echo ""

# 2. Check for specific upload messages
echo "📝 Looking for upload success messages..."
docker compose logs app --tail 200 | grep -i "file saved\|upload\|media" || echo "   No upload messages found"
echo ""

# 3. Check database for media entries
echo "🗄️  Checking database for media entries..."
if docker compose ps postgres | grep -q "Up"; then
    POSTGRES_USER=$(grep "^POSTGRES_USER=" .env.production 2>/dev/null | cut -d '=' -f2 | tr -d '"' | tr -d "'" | head -1 || echo "mattroitrenban")
    POSTGRES_DB=$(grep "^POSTGRES_DB=" .env.production 2>/dev/null | cut -d '=' -f2 | tr -d '"' | tr -d "'" | head -1 || echo "mattroitrendb")
    
    docker compose exec -T postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT COUNT(*) as total, COUNT(CASE WHEN url LIKE '/media/%' OR url LIKE '%/media/%' THEN 1 END) as local_files FROM \"Media\";" 2>/dev/null || echo "   Could not query database"
else
    echo "⚠️  PostgreSQL container not running"
fi
echo ""

# 4. Check media directory permissions
echo "📁 Checking media directory..."
if [ -d "media" ]; then
    echo "✅ media/ exists"
    ls -ld media/
    echo "   Permissions: $(stat -c '%a' media/ 2>/dev/null || stat -f '%A' media/ 2>/dev/null)"
else
    echo "❌ media/ does not exist"
fi
echo ""

# 5. Check Docker volume
echo "🐳 Checking Docker volume..."
docker compose exec -T app ls -ld /app/public/media 2>/dev/null && {
    echo "✅ /app/public/media exists in container"
    docker compose exec -T app ls -la /app/public/media/ | head -10
} || echo "❌ /app/public/media does not exist in container"
echo ""

# 6. Test write permission
echo "📝 Testing write permission..."
TEST_FILE="media/test_$(date +%s).txt"
if echo "test" > "$TEST_FILE" 2>/dev/null; then
    echo "✅ Can write to media/ directory"
    rm -f "$TEST_FILE"
else
    echo "❌ Cannot write to media/ directory!"
    echo "   Fixing permissions..."
    chmod 755 media 2>/dev/null || mkdir -p media && chmod 755 media
fi
echo ""

# 7. Recommendations
echo "📝 Recommendations:"
echo "   1. If files show in database but not on disk:"
echo "      - Files might have been uploaded but failed to save"
echo "      - Check app logs above for write errors"
echo "      - Upload files again"
echo ""
echo "   2. If no files in database:"
echo "      - Uploads might have failed silently"
echo "      - Try uploading again with browser console open"
echo "      - Check network tab for API errors"
echo ""
echo "   3. Fix Nginx config:"
echo "      ./fix-nginx-media.sh"
echo "      docker compose restart nginx"

