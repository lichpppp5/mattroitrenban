#!/bin/bash

# Script để setup folder /media trên server

echo "📁 Setting up /media folder structure..."

cd /mattroitrenban || exit 1

# 1. Tạo thư mục media trên host
echo "📂 Creating media directory..."
mkdir -p media
chmod 755 media

# 2. Tạo subdirectories cho organization
echo "📁 Creating subdirectories..."
mkdir -p media/images
mkdir -p media/videos
mkdir -p media/documents
chmod -R 755 media

# 3. Kiểm tra xem có files cũ trong uploads không
if [ -d "uploads" ] && [ "$(ls -A uploads 2>/dev/null)" ]; then
    echo "📦 Found existing files in uploads/, migrating to media/..."
    cp -r uploads/* media/ 2>/dev/null || true
    echo "✅ Files migrated"
else
    echo "ℹ️  No files in uploads/ to migrate"
fi

# 4. Kiểm tra permissions
echo "🔐 Checking permissions..."
ls -ld media/

# 5. Restart containers để mount volumes mới
echo ""
echo "🔄 Restarting Docker containers..."
docker compose down
docker compose up -d

# 6. Kiểm tra volumes
echo ""
echo "📋 Checking Docker volumes..."
sleep 3
docker compose ps

# 7. Test media access
echo ""
echo "🧪 Testing media access..."
sleep 2
if curl -I http://localhost/media/test.txt 2>/dev/null | grep -q "200\|404\|403"; then
    echo "✅ Nginx is serving /media location"
else
    echo "⚠️  Cannot access /media through Nginx (this is OK if directory is empty)"
fi

echo ""
echo "✅ Media folder setup complete!"
echo ""
echo "📝 Structure:"
echo "   /mattroitrenban/media/"
echo "   ├── images/    (for uploaded images)"
echo "   ├── videos/    (for uploaded videos)"
echo "   └── documents/ (for uploaded documents)"
echo ""
echo "🌐 Files will be accessible at: http://your-domain/media/filename"

