#!/bin/bash

# Script để fix lỗi build trên server

echo "🔧 Fixing build issues..."

# 1. Xóa thư mục scripts/src nếu tồn tại và gây conflict
if [ -d "scripts/src" ]; then
    echo "⚠️  Found scripts/src directory - removing..."
    rm -rf scripts/src
fi

# 2. Đảm bảo cấu trúc thư mục đúng
if [ ! -d "src/components/ui" ]; then
    echo "❌ src/components/ui không tồn tại!"
    echo "   Kiểm tra xem bạn đã pull code đúng chưa"
    exit 1
fi

# 3. Kiểm tra các file quan trọng
MISSING_FILES=0

check_file() {
    if [ ! -f "$1" ]; then
        echo "❌ Missing: $1"
        MISSING_FILES=$((MISSING_FILES + 1))
    fi
}

echo "📋 Checking required files..."

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

if [ $MISSING_FILES -gt 0 ]; then
    echo ""
    echo "❌ Thiếu $MISSING_FILES file(s) quan trọng!"
    echo "   Hãy chạy: git pull origin main"
    exit 1
fi

echo ""
echo "✅ Tất cả các file cần thiết đều tồn tại"
echo ""
echo "🚀 Bây giờ thử build lại:"
echo "   docker compose build app --no-cache"
echo "   hoặc"
echo "   ./deploy.sh"

