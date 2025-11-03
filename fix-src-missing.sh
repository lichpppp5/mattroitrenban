#!/bin/bash

# Script để fix vấn đề src/ bị mất trên server

echo "🔧 Fixing missing src/ directory on server..."
echo ""

cd /mattroitrenban || exit 1

# 1. Kiểm tra xem src/ có tồn tại không
if [ -d "src" ]; then
    echo "✅ src/ directory exists"
    echo "Checking contents..."
    ls -la src/ | head -10
else
    echo "❌ src/ directory NOT found!"
    
    # 2. Kiểm tra xem có scripts/src/ không (có thể đã bị move nhầm)
    if [ -d "scripts/src" ]; then
        echo "⚠️  Found scripts/src/ - moving to src/"
        mv scripts/src src
        echo "✅ Moved scripts/src/ to src/"
    else
        echo "⚠️  scripts/src/ also not found"
    fi
    
    # 3. Nếu vẫn không có, restore từ git
    if [ ! -d "src" ]; then
        echo "🔄 Restoring src/ from git..."
        
        # Checkout toàn bộ thư mục src từ git
        git checkout HEAD -- src/
        
        if [ -d "src" ]; then
            echo "✅ Restored src/ from git"
        else
            echo "❌ Failed to restore from git"
            echo ""
            echo "Trying to check git status..."
            git status
            exit 1
        fi
    fi
fi

# 4. Verify các file quan trọng
echo ""
echo "📋 Verifying critical files..."

MISSING=0
check_file() {
    if [ -f "$1" ]; then
        echo "✅ $1"
    else
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
    echo "⚠️  Still missing $MISSING files"
    echo "🔄 Trying to restore all src/ from git..."
    git checkout HEAD -- src/
    
    echo ""
    echo "Re-verifying..."
    MISSING2=0
    for file in "src/components/ui/alert.tsx" "src/components/ui/badge.tsx" "src/lib/prisma.ts"; do
        if [ ! -f "$file" ]; then
            MISSING2=$((MISSING2 + 1))
        fi
    done
    
    if [ $MISSING2 -eq 0 ]; then
        echo "✅ All files restored!"
    else
        echo "❌ Still missing files. Check git log:"
        git log --oneline -5
        echo ""
        echo "Try: git pull origin main --force"
        exit 1
    fi
else
    echo ""
    echo "✅ All files present!"
fi

# 5. Clean và rebuild
echo ""
echo "🧹 Cleaning Docker..."
docker compose down

echo ""
echo "🚀 Rebuilding with --no-cache..."
docker compose build app --no-cache

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build successful! Starting services..."
    docker compose up -d
    
    echo ""
    echo "⏳ Waiting for services..."
    sleep 5
    
    echo ""
    echo "✅ Done! Services should be running."
    docker compose ps
else
    echo ""
    echo "❌ Build failed!"
    exit 1
fi

