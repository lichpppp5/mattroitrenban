#!/bin/bash

# Script để fix vấn đề phần Nhạc nền Website không hiển thị

echo "🔧 Fixing background music feature not showing..."
echo ""

cd /mattroitrenban || exit 1

# 1. Pull latest code
echo "📥 Pulling latest code..."
git pull origin main

# 2. Verify code exists
echo ""
echo "🔍 Verifying code exists..."
if grep -q "Nhạc nền Website" src/app/root-admin/settings/page.tsx; then
    echo "✅ Code found in file"
    LINE_NUM=$(grep -n "Nhạc nền Website" src/app/root-admin/settings/page.tsx | cut -d: -f1)
    echo "   Found at line: $LINE_NUM"
else
    echo "❌ Code NOT found! Need to pull code."
    echo "   Run: git pull origin main"
    exit 1
fi

# 3. Check if component file exists
if [ -f "src/components/background-music.tsx" ]; then
    echo "✅ background-music.tsx exists"
else
    echo "❌ background-music.tsx NOT found!"
    exit 1
fi

# 4. Rebuild with no cache
echo ""
echo "🔨 Rebuilding app (no cache)..."
docker compose build app --no-cache

# 5. Restart
echo ""
echo "🔄 Restarting services..."
docker compose restart app

# 6. Wait for app to start
echo ""
echo "⏳ Waiting for app to start..."
sleep 5

# 7. Check if app is running
if docker compose ps app | grep -q "Up"; then
    echo "✅ App is running"
else
    echo "❌ App is not running!"
    echo "   Check logs: docker compose logs app"
    exit 1
fi

echo ""
echo "✅ Fix complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Hard refresh browser: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)"
echo "   2. Clear browser cache"
echo "   3. Go to: /root-admin/settings"
echo "   4. Scroll down to find 'Nhạc nền Website' section"
echo ""
echo "   If still not showing, check browser console (F12) for errors"

