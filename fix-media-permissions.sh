#!/bin/bash

# Script để fix permissions và copy files từ alternative location

echo "🔧 Fixing media permissions and syncing files..."
echo ""

cd /mattroitrenban || exit 1

# 1. Fix permissions on host
echo "📁 Fixing permissions on host media/ directory..."
mkdir -p media
chmod 755 media
chown -R $(whoami):$(whoami) media 2>/dev/null || chmod -R 755 media
echo "✅ Host permissions fixed"
echo ""

# 2. Copy files from /app/media to /app/public/media in container
echo "🔄 Copying files from alternative location to correct location..."
if docker compose ps app | grep -q "Up"; then
    # Check if files exist in /app/media
    ALT_COUNT=$(docker compose exec -T app find /app/media -type f 2>/dev/null | wc -l)
    
    if [ "$ALT_COUNT" -gt 0 ]; then
        echo "   Found $ALT_COUNT files in /app/media, copying to /app/public/media..."
        
        # Create public/media with correct permissions
        docker compose exec -T app mkdir -p /app/public/media
        docker compose exec -T app chmod 755 /app/public/media
        docker compose exec -T app chown -R nextjs:nodejs /app/public/media 2>/dev/null || true
        
        # Copy files
        docker compose exec -T app sh -c "cp -r /app/media/* /app/public/media/ 2>/dev/null || true"
        
        # Fix permissions on copied files
        docker compose exec -T app chmod -R 644 /app/public/media/*
        docker compose exec -T app chmod 755 /app/public/media
        
        echo "✅ Files copied to /app/public/media"
        
        # Verify
        NEW_COUNT=$(docker compose exec -T app find /app/public/media -type f 2>/dev/null | wc -l)
        echo "   Files now in /app/public/media: $NEW_COUNT"
    else
        echo "   No files found in /app/media"
    fi
    
    # Also ensure directory has correct ownership
    echo ""
    echo "🔐 Fixing container permissions..."
    docker compose exec -T app chmod -R 755 /app/public/media 2>/dev/null || true
    docker compose exec -T app chown -R nextjs:nodejs /app/public/media 2>/dev/null || {
        echo "   Note: chown might fail, but chmod should work"
    }
else
    echo "⚠️  App container not running"
fi
echo ""

# 3. Sync files from container to host
echo "📤 Syncing files from container to host..."
if docker compose ps app | grep -q "Up"; then
    # Use docker cp to sync
    docker compose cp app:/app/public/media/. ./media/ 2>/dev/null || {
        echo "⚠️  Could not copy all files, trying alternative method..."
        # Alternative: list and copy individually
        docker compose exec -T app find /app/public/media -type f -exec basename {} \; 2>/dev/null | while read file; do
            if [ -n "$file" ]; then
                docker compose cp "app:/app/public/media/$file" "media/" 2>/dev/null || true
            fi
        done
    }
    
    FILE_COUNT=$(find media -type f 2>/dev/null | wc -l)
    echo "✅ Files synced to host: $FILE_COUNT"
    
    if [ "$FILE_COUNT" -gt 0 ]; then
        echo "   Sample files:"
        ls -lh media/ | head -5
    fi
else
    echo "⚠️  App container not running"
fi
echo ""

# 4. Fix Nginx config if needed
echo "🌐 Checking Nginx configuration..."
if ! grep -q "location /media" nginx.conf; then
    echo "⚠️  Adding /media location to nginx.conf..."
    ./fix-nginx-media.sh
fi

# 5. Restart services
echo ""
echo "🔄 Restarting services..."
docker compose restart app nginx
sleep 3

echo ""
echo "✅ Permissions and file sync complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Check files: ls -lh media/"
echo "   2. Test access: curl -I http://localhost/media/[filename]"
echo "   3. If files still missing, upload again through admin panel"

