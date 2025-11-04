#!/bin/bash

# Script để kiểm tra tính năng nhạc nền đã được thêm chưa

echo "🔍 Checking background music feature..."
echo ""

cd /mattroitrenban || exit 1

# 1. Check if code is in file
echo "📋 Checking if music feature code exists..."
if grep -q "Nhạc nền Website" src/app/root-admin/settings/page.tsx; then
    echo "✅ 'Nhạc nền Website' text found in settings page"
else
    echo "❌ 'Nhạc nền Website' NOT found in settings page"
    echo "   Need to pull latest code: git pull origin main"
    exit 1
fi

if grep -q "backgroundMusicUrl" src/app/root-admin/settings/page.tsx; then
    echo "✅ backgroundMusicUrl found in settings"
else
    echo "❌ backgroundMusicUrl NOT found"
    exit 1
fi

if grep -q "BackgroundMusic" src/components/conditional-layout.tsx; then
    echo "✅ BackgroundMusic component found in layout"
else
    echo "❌ BackgroundMusic component NOT found in layout"
    exit 1
fi

# 2. Check if component file exists
if [ -f "src/components/background-music.tsx" ]; then
    echo "✅ background-music.tsx component file exists"
else
    echo "❌ background-music.tsx component file NOT found"
    exit 1
fi

# 3. Check git status
echo ""
echo "📦 Checking git status..."
git status --short | head -5

# 4. Check latest commits
echo ""
echo "📝 Latest commits:"
git log --oneline -3 | grep -i "music\|nhạc\|background"

echo ""
echo "✅ All checks passed!"
echo ""
echo "📝 Next steps if feature not showing:"
echo "   1. Hard refresh browser: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)"
echo "   2. Clear browser cache"
echo "   3. Check browser console for errors (F12)"
echo "   4. Rebuild: docker compose build app --no-cache"

