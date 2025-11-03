#!/bin/bash

# Script để fix nginx.conf conflict và pull code

echo "🔧 Fixing nginx.conf conflict..."

cd /mattroitrenban || exit 1

# 1. Backup nginx.conf
echo "💾 Backing up current nginx.conf..."
cp nginx.conf nginx.conf.backup.$(date +%Y%m%d_%H%M%S) 2>/dev/null || true

# 2. Xem diff để user biết có gì thay đổi
echo ""
echo "📋 Current changes in nginx.conf:"
git diff nginx.conf | head -30 || true

# 3. Stash hoặc reset nginx.conf
echo ""
echo "🔄 Resolving conflict..."
echo "   Option 1: Keep local changes (stash)"
echo "   Option 2: Use remote version (reset)"

# Auto-resolve: reset to remote (vì nginx.conf mới có /media config tốt hơn)
echo ""
echo "   Using remote version (recommended for /media setup)..."
git checkout -- nginx.conf

# 4. Pull
echo ""
echo "📥 Pulling latest code..."
git pull origin main

if [ $? -eq 0 ]; then
    echo "✅ Pull successful!"
    
    # 5. Verify nginx.conf has /media
    if grep -q "location /media" nginx.conf; then
        echo "✅ nginx.conf has /media configuration"
    else
        echo "⚠️  nginx.conf might not have /media config - check manually"
    fi
    
    echo ""
    echo "✅ Ready to setup! Next steps:"
    echo "   1. ./setup-media-folder.sh"
    echo "   2. ./update.sh"
else
    echo "❌ Pull failed!"
    exit 1
fi

