#!/bin/bash

# Script to find all audio files in media directory
set -e

echo "🔍 Finding Audio Files in Media Directory..."
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# 1. Check in root media directory
echo "1️⃣  Checking in media/ root directory..."
if [ -d "media" ]; then
    # Find all files with audio extensions
    AUDIO_FILES=$(find media -maxdepth 1 -type f \( -iname "*.mp3" -o -iname "*.wav" -o -iname "*.ogg" -o -iname "*.m4a" -o -iname "*.aac" -o -iname "*.flac" \) 2>/dev/null)
    
    if [ -n "$AUDIO_FILES" ]; then
        COUNT=$(echo "$AUDIO_FILES" | wc -l)
        echo -e "${GREEN}✅ Found $COUNT audio file(s) in root${NC}"
        echo "$AUDIO_FILES" | while read file; do
            if [ -f "$file" ]; then
                SIZE=$(ls -lh "$file" | awk '{print $5}')
                echo -e "   ${GREEN}✅ $file${NC} (${SIZE})"
            fi
        done
    else
        echo -e "${YELLOW}⚠️  No audio files in root${NC}"
    fi
else
    echo -e "${RED}❌ media/ directory not found${NC}"
fi

echo ""

# 2. Check in all subdirectories
echo "2️⃣  Checking in subdirectories..."
AUDIO_IN_SUBDIRS=$(find media -mindepth 2 -type f \( -iname "*.mp3" -o -iname "*.wav" -o -iname "*.ogg" -o -iname "*.m4a" -o -iname "*.aac" -o -iname "*.flac" \) 2>/dev/null)
if [ -n "$AUDIO_IN_SUBDIRS" ]; then
    COUNT=$(echo "$AUDIO_IN_SUBDIRS" | wc -l)
    echo -e "${BLUE}ℹ️  Found $COUNT audio file(s) in subdirectories${NC}"
    echo "$AUDIO_IN_SUBDIRS" | head -5
else
    echo "   No audio files in subdirectories"
fi

echo ""

# 3. List ALL files in media root
echo "3️⃣  All files in media/ root:"
if [ -d "media" ]; then
    ROOT_FILES=$(find media -maxdepth 1 -type f 2>/dev/null)
    if [ -n "$ROOT_FILES" ]; then
        COUNT=$(echo "$ROOT_FILES" | wc -l)
        echo "   Total files: $COUNT"
        echo "$ROOT_FILES" | while read file; do
            if [ -f "$file" ]; then
                SIZE=$(ls -lh "$file" | awk '{print $5}')
                EXT="${file##*.}"
                echo "   - $(basename "$file") (${SIZE}, .${EXT})"
            fi
        done
    else
        echo "   No files in root"
    fi
fi

echo ""

# 4. Check in Docker containers
echo "4️⃣  Checking in Docker containers..."
if command -v docker >/dev/null 2>&1; then
    # App container
    if docker ps | grep -q "mattroitrenban_app"; then
        echo "App Container:"
        CONTAINER_AUDIO=$(docker exec mattroitrenban_app find /app/public/media -maxdepth 1 -type f \( -iname "*.mp3" -o -iname "*.wav" -o -iname "*.ogg" -o -iname "*.m4a" -o -iname "*.aac" -o -iname "*.flac" \) 2>/dev/null || echo "")
        if [ -n "$CONTAINER_AUDIO" ]; then
            COUNT=$(echo "$CONTAINER_AUDIO" | wc -l)
            echo -e "   ${GREEN}✅ Found $COUNT audio file(s)${NC}"
            echo "$CONTAINER_AUDIO" | head -5
        else
            echo "   No audio files found"
        fi
    fi
    
    # Nginx container
    if docker ps | grep -q "mattroitrenban_nginx"; then
        echo "Nginx Container:"
        CONTAINER_AUDIO=$(docker exec mattroitrenban_nginx find /var/www/media -maxdepth 1 -type f \( -iname "*.mp3" -o -iname "*.wav" -o -iname "*.ogg" -o -iname "*.m4a" -o -iname "*.aac" -o -iname "*.flac" \) 2>/dev/null || echo "")
        if [ -n "$CONTAINER_AUDIO" ]; then
            COUNT=$(echo "$CONTAINER_AUDIO" | wc -l)
            echo -e "   ${GREEN}✅ Found $COUNT audio file(s)${NC}"
            echo "$CONTAINER_AUDIO" | head -5
        else
            echo "   No audio files found"
        fi
    fi
fi

echo ""

# 5. Check database
echo "5️⃣  Checking database for audio files..."
if command -v docker >/dev/null 2>&1 && docker ps | grep -q "mattroitrenban_app"; then
    # Try to query database via app container
    DB_AUDIO=$(docker exec mattroitrenban_app node -e "
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        prisma.media.findMany({ where: { type: 'audio' } })
          .then(files => {
            console.log(JSON.stringify(files.map(f => ({ url: f.url, filename: f.filename }))));
            prisma.\$disconnect();
          })
          .catch(err => console.error('Error:', err.message));
    " 2>/dev/null || echo "")
    
    if [ -n "$DB_AUDIO" ] && [ "$DB_AUDIO" != "[]" ]; then
        echo -e "${GREEN}✅ Audio files found in database${NC}"
        echo "$DB_AUDIO" | head -20
    else
        echo -e "${YELLOW}⚠️  No audio files in database${NC}"
        echo "   (This may mean files were uploaded but not saved to database)"
    fi
fi

echo ""
echo "📝 Summary:"
echo "- Check media/ root directory for audio files"
echo "- Files are stored FLAT in media/ (not in subdirectories)"
echo "- Filename format: [timestamp]-[filename].[ext]"
echo "- If uploaded but not found, check upload logs"
echo ""
echo "✅ Search completed!"

