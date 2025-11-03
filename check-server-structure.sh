#!/bin/bash

# Script để kiểm tra cấu trúc thư mục trên server

echo "📂 Checking server directory structure..."
echo ""

cd /mattroitrenban || exit 1

echo "Current directory: $(pwd)"
echo ""

echo "📁 Root directory contents:"
ls -la | head -20
echo ""

echo "📁 Checking if src/ exists:"
if [ -d "src" ]; then
    echo "✅ src/ directory exists"
    echo "Contents:"
    ls -la src/ | head -10
else
    echo "❌ src/ directory NOT found!"
fi
echo ""

echo "📁 Checking if scripts/ exists:"
if [ -d "scripts" ]; then
    echo "✅ scripts/ directory exists"
    ls -la scripts/
    if [ -d "scripts/src" ]; then
        echo "⚠️  Found scripts/src/ - this might be the issue!"
    fi
else
    echo "ℹ️  scripts/ directory not found"
fi
echo ""

echo "🔍 Git status:"
git status --short | head -20
echo ""

echo "🔍 Checking git remote:"
git remote -v
echo ""

echo "🔍 Last commit:"
git log -1 --oneline
echo ""

echo "📊 Checking if files exist in git:"
git ls-files | grep -E "^src/components/ui/(alert|badge|button|card)" | head -10
echo ""

