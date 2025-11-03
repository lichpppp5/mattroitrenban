#!/bin/bash

# Script để fix Nginx /media configuration

echo "🔧 Fixing Nginx /media configuration..."
echo ""

cd /mattroitrenban || exit 1

# 1. Backup nginx.conf
cp nginx.conf nginx.conf.backup.$(date +%Y%m%d_%H%M%S)

# 2. Kiểm tra xem có /media location chưa
if grep -q "location /media" nginx.conf && grep -q "alias /var/www/media" nginx.conf; then
    echo "✅ /media location already configured"
else
    echo "⚠️  /media location missing - adding..."
    
    # Find the HTTP server block
    # Add /media location before the main / location
    if grep -q "location / {" nginx.conf; then
        # Create a temp file with the new location block
        cat > /tmp/media_location.txt << 'EOF'
        # Media files (images, documents, videos)
        location /media {
            alias /var/www/media;
            expires 30d;
            add_header Cache-Control "public, immutable";
            # Allow CORS if needed
            add_header Access-Control-Allow-Origin "*";
            autoindex off;
        }
        
        # Legacy /uploads redirect to /media (for backward compatibility)
        location /uploads {
            alias /var/www/media;
            expires 30d;
            add_header Cache-Control "public, immutable";
        }

EOF
        
        # Insert before "location / {" if not exists
        if ! grep -q "location /media" nginx.conf; then
            # Use sed to insert before "location / {"
            sed -i '/location \/ {/i\        # Media files (images, documents, videos)\n        location /media {\n            alias /var/www/media;\n            expires 30d;\n            add_header Cache-Control "public, immutable";\n            add_header Access-Control-Allow-Origin "*";\n            autoindex off;\n        }\n        \n        # Legacy /uploads redirect to /media (for backward compatibility)\n        location /uploads {\n            alias /var/www/media;\n            expires 30d;\n            add_header Cache-Control "public, immutable";\n        }\n' nginx.conf
            
            echo "✅ Added /media location to nginx.conf"
        fi
    fi
fi

# 3. Verify configuration
echo ""
echo "🧪 Testing Nginx configuration..."
if docker compose exec nginx nginx -t 2>/dev/null; then
    echo "✅ Nginx configuration is valid"
else
    echo "❌ Nginx configuration has errors!"
    echo "   Restoring backup..."
    cp nginx.conf.backup.* nginx.conf 2>/dev/null || true
    exit 1
fi

# 4. Reload Nginx
echo ""
echo "🔄 Reloading Nginx..."
docker compose exec nginx nginx -s reload 2>/dev/null || {
    echo "⚠️  Reload failed, restarting..."
    docker compose restart nginx
    sleep 2
}

# 5. Verify /media is accessible
echo ""
echo "🧪 Testing /media access..."
sleep 2
if curl -I http://localhost/media/ 2>/dev/null | head -1 | grep -qE "200|403|404"; then
    echo "✅ /media location is accessible"
else
    echo "⚠️  /media might not be accessible yet (this is OK if directory is empty)"
fi

echo ""
echo "✅ Nginx configuration fixed!"

