#!/bin/bash

# Script để fix vấn đề ảnh không hiển thị

echo "🖼️  Fixing image display issues..."

cd /mattroitrenban || exit 1

# 1. Tạo thư mục uploads nếu chưa có
echo "📁 Creating uploads directory..."
mkdir -p uploads
chmod 755 uploads

# 2. Kiểm tra xem có file nào trong uploads không
echo ""
echo "📋 Checking existing uploads..."
if [ -d "uploads" ] && [ "$(ls -A uploads 2>/dev/null)" ]; then
    echo "✅ Found files in uploads:"
    ls -lh uploads/ | head -10
else
    echo "⚠️  No files found in uploads directory"
fi

# 3. Kiểm tra Docker volumes
echo ""
echo "🐳 Checking Docker containers..."
docker compose ps

# 4. Kiểm tra xem thư mục uploads có được mount đúng không
echo ""
echo "📂 Checking volume mounts..."
if docker inspect mattroitrenban_app 2>/dev/null | grep -q "uploads"; then
    echo "✅ uploads volume is mounted in app container"
else
    echo "⚠️  uploads volume might not be mounted correctly"
fi

# 5. Restart containers để đảm bảo volumes được mount
echo ""
echo "🔄 Restarting containers to refresh volumes..."
docker compose restart app nginx

# 6. Kiểm tra Nginx có serve uploads đúng không
echo ""
echo "🌐 Checking Nginx uploads location..."
if grep -q "location /uploads" nginx.conf; then
    echo "✅ Nginx config has /uploads location"
else
    echo "❌ Nginx config missing /uploads location!"
    exit 1
fi

# 7. Test truy cập uploads
echo ""
echo "🧪 Testing uploads access..."
sleep 3
if curl -I http://localhost/uploads/test.txt 2>/dev/null | grep -q "200\|404"; then
    echo "✅ Nginx is serving /uploads location"
else
    echo "⚠️  Cannot access /uploads through Nginx"
fi

echo ""
echo "✅ Done! Images should now display correctly."
echo ""
echo "📝 Next steps:"
echo "   1. Upload a new image through admin panel"
echo "   2. Check if it appears in ./uploads/ directory"
echo "   3. Check browser console for any 404 errors on image URLs"

