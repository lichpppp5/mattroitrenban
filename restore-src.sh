#!/bin/bash

# Script để restore thư mục src/ nếu bị mất

echo "🔧 Restoring src/ directory..."

cd /mattroitrenban || exit 1

# 1. Kiểm tra git status
echo "📋 Checking git status..."
git status

# 2. Kiểm tra xem src/ có trong git không
echo ""
echo "🔍 Checking if src/ is tracked by git..."
if git ls-tree -r HEAD --name-only | grep -q "^src/"; then
    echo "✅ src/ is tracked in git"
    
    # 3. Nếu src/ bị mất, restore từ git
    if [ ! -d "src" ]; then
        echo "❌ src/ directory missing! Restoring from git..."
        git checkout HEAD -- src/
        echo "✅ Restored src/ from git"
    else
        echo "ℹ️  src/ exists but files might be missing"
        echo "🔄 Resetting src/ to match git..."
        git checkout HEAD -- src/
    fi
else
    echo "❌ src/ is NOT tracked in git! This is a problem."
    echo ""
    echo "Checking what is tracked..."
    git ls-tree -r HEAD --name-only | head -20
    exit 1
fi

# 4. Verify files
echo ""
echo "✅ Verifying restored files..."
MISSING=0
check_file() {
    if [ ! -f "$1" ]; then
        echo "❌ Still missing: $1"
        MISSING=$((MISSING + 1))
    else
        echo "✅ Found: $1"
    fi
}

check_file "src/components/ui/alert.tsx"
check_file "src/components/ui/badge.tsx"
check_file "src/components/ui/button.tsx"
check_file "src/lib/prisma.ts"

if [ $MISSING -eq 0 ]; then
    echo ""
    echo "✅ All files restored successfully!"
else
    echo ""
    echo "⚠️  Some files still missing. You may need to:"
    echo "   1. Pull from a different branch"
    echo "   2. Check if files were committed"
    echo "   3. Check git log for recent changes"
fi

