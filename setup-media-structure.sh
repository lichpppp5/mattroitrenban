#!/bin/bash

# Script to setup media directory structure
set -e

echo "📁 Setting up Media Directory Structure..."
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Expected subdirectories
SUBDIRS=("documents" "images" "videos" "audio")

# 1. Check and create media directory
echo "1️⃣  Checking media directory..."
if [ ! -d "media" ]; then
    echo -e "${YELLOW}⚠️  media/ directory not found, creating...${NC}"
    mkdir -p media
    chmod 755 media
    echo -e "${GREEN}✅ Created media/ directory${NC}"
else
    echo -e "${GREEN}✅ media/ directory exists${NC}"
fi

echo ""

# 2. Check and create subdirectories
echo "2️⃣  Checking subdirectories..."
for dir in "${SUBDIRS[@]}"; do
    if [ ! -d "media/$dir" ]; then
        echo -e "${YELLOW}⚠️  media/$dir/ not found, creating...${NC}"
        mkdir -p "media/$dir"
        chmod 755 "media/$dir"
        echo -e "${GREEN}✅ Created media/$dir/ directory${NC}"
    else
        FILE_COUNT=$(find "media/$dir" -type f | wc -l)
        echo -e "${GREEN}✅ media/$dir/ exists (${FILE_COUNT} files)${NC}"
    fi
done

echo ""

# 3. Check files in root media directory
echo "3️⃣  Checking files in media/ root..."
ROOT_FILES=$(find media -maxdepth 1 -type f | wc -l)
if [ "$ROOT_FILES" -gt 0 ]; then
    echo "   Files in root: $ROOT_FILES"
    echo "   Sample files:"
    ls -lh media/*.* 2>/dev/null | head -5 || echo "   (No files with extensions)"
else
    echo "   No files in root directory"
fi

echo ""

# 4. Check files by type
echo "4️⃣  Checking files by type..."
for dir in "${SUBDIRS[@]}"; do
    if [ -d "media/$dir" ]; then
        FILE_COUNT=$(find "media/$dir" -type f | wc -l)
        if [ "$FILE_COUNT" -gt 0 ]; then
            echo "   $dir/: $FILE_COUNT files"
            ls -lh "media/$dir/" | head -3 | tail -2 || true
        else
            echo "   $dir/: 0 files (empty)"
        fi
    fi
done

echo ""

# 5. Check audio files specifically (including root directory)
echo "5️⃣  Checking for audio files..."
AUDIO_FILES=$(find media -type f \( -iname "*.mp3" -o -iname "*.wav" -o -iname "*.ogg" -o -iname "*.m4a" -o -iname "*.aac" -o -iname "*.flac" \) 2>/dev/null | wc -l)
if [ "$AUDIO_FILES" -gt 0 ]; then
    echo -e "${GREEN}✅ Found $AUDIO_FILES audio file(s)${NC}"
    echo "   Audio files:"
    find media -type f \( -iname "*.mp3" -o -iname "*.wav" -o -iname "*.ogg" -o -iname "*.m4a" -o -iname "*.aac" -o -iname "*.flac" \) 2>/dev/null | head -10
    echo ""
    echo "   Checking in root media/ directory:"
    ls -lh media/*.{mp3,wav,ogg,m4a,aac,flac} 2>/dev/null | head -5 || echo "   (No audio files in root)"
else
    echo -e "${YELLOW}⚠️  No audio files found${NC}"
    echo "   Checking all files in media/ root:"
    ls -lh media/*.* 2>/dev/null | head -10 || echo "   (No files with extensions in root)"
    echo ""
    echo "   All files in media/ (including subdirectories):"
    find media -type f 2>/dev/null | head -10
    echo ""
    echo "   Audio files should be uploaded via admin panel"
    echo "   They will be saved to media/ root directory (not in subdirectories)"
fi

echo ""

# 6. Fix permissions for all directories
echo "6️⃣  Fixing permissions..."
chmod 755 media
find media -type d -exec chmod 755 {} \;
find media -type f -exec chmod 644 {} \;
echo -e "${GREEN}✅ Permissions fixed${NC}"

echo ""

# 7. Summary
echo "📊 Summary:"
echo "- Media root: $(find media -maxdepth 1 -type f | wc -l) files"
for dir in "${SUBDIRS[@]}"; do
    if [ -d "media/$dir" ]; then
        COUNT=$(find "media/$dir" -type f | wc -l)
        echo "- $dir/: $COUNT files"
    fi
done
echo "- Total audio files: $AUDIO_FILES"
echo ""
echo "📝 Note:"
echo "- Files can be uploaded via: https://mattroitrenban.vn/root-admin/media"
echo "- Audio files will be saved to media/ directory"
echo "- Nginx will serve from /var/www/media/ in container"
echo ""
echo "✅ Setup completed!"

