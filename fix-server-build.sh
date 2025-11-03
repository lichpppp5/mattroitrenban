#!/bin/bash

# Script để fix build trên server sau khi pull code

echo "🔧 Fixing build on server..."

cd /mattroitrenban || exit 1

# 1. Pull latest code
echo "📥 Pulling latest code..."
git pull origin main || {
    echo "❌ Failed to pull code"
    exit 1
}

# 2. Xóa thư mục scripts/src nếu tồn tại (có thể gây conflict)
if [ -d "scripts/src" ]; then
    echo "⚠️  Removing conflicting scripts/src directory..."
    rm -rf scripts/src
fi

# 3. Kiểm tra các file quan trọng
echo "📋 Verifying required files..."
MISSING=0

check_file() {
    if [ ! -f "$1" ]; then
        echo "❌ Missing: $1"
        MISSING=$((MISSING + 1))
    fi
}

check_file "src/components/ui/alert.tsx"
check_file "src/components/ui/alert-dialog.tsx"
check_file "src/components/ui/badge.tsx"
check_file "src/components/ui/button.tsx"
check_file "src/components/ui/card.tsx"
check_file "src/components/ui/dialog.tsx"
check_file "src/components/ui/input.tsx"
check_file "src/components/ui/label.tsx"
check_file "src/components/ui/select.tsx"
check_file "src/components/ui/switch.tsx"
check_file "src/components/ui/table.tsx"
check_file "src/components/ui/textarea.tsx"

check_file "src/lib/auth.ts"
check_file "src/lib/prisma.ts"

if [ $MISSING -gt 0 ]; then
    echo ""
    echo "❌ Thiếu $MISSING file(s)! Có thể code chưa được pull đúng."
    echo "   Chạy: git status"
    echo "   Chạy: git pull origin main"
    exit 1
fi

echo "✅ Tất cả file đều tồn tại"

# 4. Clean Docker build cache và rebuild
echo ""
echo "🧹 Cleaning Docker cache..."
docker compose down

# Xóa các image cũ
docker rmi mattroitrenban-app 2>/dev/null || true

echo ""
echo "🚀 Building with --no-cache to ensure fresh build..."
docker compose build app --no-cache

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build successful! Starting containers..."
    docker compose up -d
    
    echo ""
    echo "⏳ Waiting for services to start..."
    sleep 5
    
    echo ""
    echo "✅ Done! Check status with: docker compose ps"
else
    echo ""
    echo "❌ Build failed! Check errors above."
    exit 1
fi

