#!/bin/bash

# Script để resolve merge conflict với nginx.conf

echo "🔧 Resolving merge conflict..."

cd /mattroitrenban || exit 1

# 1. Backup nginx.conf hiện tại
echo "💾 Backing up current nginx.conf..."
cp nginx.conf nginx.conf.backup.$(date +%Y%m%d_%H%M%S)
echo "✅ Backup saved"

# 2. Stash local changes
echo ""
echo "📦 Stashing local changes..."
git stash
echo "✅ Changes stashed"

# 3. Pull latest code
echo ""
echo "📥 Pulling latest code..."
git pull origin main

if [ $? -eq 0 ]; then
    echo "✅ Code pulled successfully"
    
    # 4. Check if there are stashed changes
    if git stash list | grep -q "stash@{0}"; then
        echo ""
        echo "⚠️  You had local changes in nginx.conf"
        echo "   Backup saved. If you need your changes, check:"
        ls -lt nginx.conf.backup.* | head -1
        echo ""
        echo "   To restore your changes, run:"
        echo "   git stash pop"
        echo "   # Then manually merge if needed"
    fi
else
    echo "❌ Pull failed!"
    exit 1
fi

echo ""
echo "✅ Done! You can now run:"
echo "   chmod +x setup-media-folder.sh"
echo "   ./setup-media-folder.sh"

