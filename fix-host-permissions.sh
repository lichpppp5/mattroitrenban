#!/bin/bash

# Fix permissions on host media directory để app container có thể write

echo "🔐 Fixing host media directory permissions..."
echo ""

cd /mattroitrenban || exit 1

# 1. Ensure directory exists
mkdir -p media
chmod 755 media

# 2. Get the user ID that container uses (thường là 1000 hoặc từ dockerfile)
# Check Dockerfile for nextjs user ID
NEXTJS_UID=$(grep -E "RUN.*useradd.*nextjs" Dockerfile 2>/dev/null | grep -oE "uid=[0-9]+" | cut -d= -f2 || echo "1000")
NEXTJS_GID=$(grep -E "RUN.*groupadd.*nodejs" Dockerfile 2>/dev/null | grep -oE "gid=[0-9]+" | cut -d= -f2 || echo "1000")

echo "   Next.js user ID in container: $NEXTJS_UID"
echo "   Node.js group ID in container: $NEXTJS_GID"
echo ""

# 3. Try to set ownership (might require sudo)
echo "📝 Setting ownership..."
if [ -w media ]; then
    # If we can write, try to chown
    chown -R "$NEXTJS_UID:$NEXTJS_GID" media 2>/dev/null || {
        echo "   ⚠️  Cannot change ownership (might need sudo)"
        echo "   Setting permissions instead..."
        chmod -R 777 media
    }
else
    echo "   ⚠️  Cannot write to media/, trying with sudo..."
    sudo chown -R "$NEXTJS_UID:$NEXTJS_GID" media 2>/dev/null || sudo chmod -R 777 media
fi

# 4. Set permissions
chmod -R 755 media
find media -type f -exec chmod 644 {} \; 2>/dev/null || true

echo "✅ Permissions fixed"
echo ""

# 5. Verify
ls -ld media/
if [ -d "media" ]; then
    echo "   Directory permissions: $(stat -c '%a' media 2>/dev/null || stat -f '%A' media 2>/dev/null)"
fi

echo ""
echo "✅ Host permissions fixed!"
echo ""
echo "📝 Next: Restart app container"
echo "   docker compose restart app"

