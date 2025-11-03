#!/bin/bash

# Script để fix domain configuration

echo "🔧 Fixing domain configuration for mattroitrenban.vn..."
echo ""

cd /mattroitrenban || exit 1

# 1. Kiểm tra nginx.conf có domain chưa
echo "📋 Checking nginx.conf..."

if grep -q "server_name.*mattroitrenban.vn" nginx.conf; then
    echo "✅ Domain already configured in nginx.conf"
else
    echo "⚠️  Adding domain to nginx.conf..."
    
    # Backup
    cp nginx.conf nginx.conf.backup
    
    # Add domain to server_name (both HTTP and HTTPS blocks)
    # For HTTP block
    sed -i 's/server_name [^;]*/& mattroitrenban.vn www.mattroitrenban.vn/g' nginx.conf
    
    # Verify
    if grep -q "server_name.*mattroitrenban.vn" nginx.conf; then
        echo "✅ Domain added successfully"
    else
        echo "❌ Failed to add domain - manual edit needed"
        exit 1
    fi
fi

# 2. Test Nginx config
echo ""
echo "🧪 Testing Nginx configuration..."
if docker compose exec nginx nginx -t 2>/dev/null; then
    echo "✅ Configuration is valid"
else
    echo "❌ Configuration has errors!"
    echo "   Restoring backup..."
    cp nginx.conf.backup nginx.conf
    exit 1
fi

# 3. Reload Nginx
echo ""
echo "🔄 Reloading Nginx..."
docker compose exec nginx nginx -s reload 2>/dev/null || {
    echo "⚠️  Reload failed, restarting container..."
    docker compose restart nginx
}

sleep 2

# 4. Verify Nginx is running
if docker compose ps nginx | grep -q "Up"; then
    echo "✅ Nginx is running"
else
    echo "❌ Nginx is not running!"
    docker compose up -d nginx
fi

# 5. Check firewall
echo ""
echo "🔥 Checking firewall..."
if command -v ufw >/dev/null 2>&1; then
    echo "   Allowing HTTP and HTTPS..."
    ufw allow 80/tcp 2>/dev/null
    ufw allow 443/tcp 2>/dev/null
    echo "✅ Firewall updated"
fi

# 6. Display server IP
echo ""
echo "📡 Server IP address:"
SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')
echo "   $SERVER_IP"
echo ""
echo "📝 DNS Configuration:"
echo "   Create A record: mattroitrenban.vn -> $SERVER_IP"
echo "   Create A record: www.mattroitrenban.vn -> $SERVER_IP"
echo ""

echo "✅ Domain configuration complete!"
echo ""
echo "⏳ Wait 5-10 minutes for DNS propagation, then test:"
echo "   http://mattroitrenban.vn"

