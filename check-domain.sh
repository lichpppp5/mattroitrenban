#!/bin/bash

# Script để kiểm tra và fix domain configuration

echo "🌐 Checking domain configuration for mattroitrenban.vn..."
echo ""

cd /mattroitrenban || exit 1

# 1. Kiểm tra DNS
echo "📡 Checking DNS configuration..."
echo ""
DNS_RESULT=$(dig +short mattroitrenban.vn A 2>/dev/null || nslookup mattroitrenban.vn 2>/dev/null | grep -A 1 "Name:" | tail -1)
if [ -n "$DNS_RESULT" ]; then
    echo "✅ DNS lookup successful:"
    echo "$DNS_RESULT"
else
    echo "⚠️  DNS lookup failed or no A record found"
    echo "   Please check DNS configuration at your domain provider"
fi
echo ""

# 2. Kiểm tra server IP
echo "🖥️  Server IP addresses:"
ip -4 addr show | grep "inet " | awk '{print $2}' | cut -d/ -f1 | grep -v "127.0.0.1"
echo ""

# 3. Kiểm tra Nginx config
echo "📋 Checking Nginx server_name configuration..."
if grep -q "server_name.*mattroitrenban.vn" nginx.conf; then
    echo "✅ Domain found in nginx.conf"
    grep "server_name" nginx.conf | grep -v "^#"
else
    echo "❌ Domain NOT found in nginx.conf!"
    echo "   Need to add mattroitrenban.vn to server_name"
fi
echo ""

# 4. Kiểm tra Nginx status
echo "🔄 Checking Nginx status..."
if docker compose ps nginx | grep -q "Up"; then
    echo "✅ Nginx container is running"
else
    echo "❌ Nginx container is NOT running!"
    echo "   Run: docker compose up -d nginx"
fi
echo ""

# 5. Kiểm tra Nginx config syntax
echo "🧪 Testing Nginx configuration..."
if docker compose exec nginx nginx -t 2>/dev/null; then
    echo "✅ Nginx configuration is valid"
else
    echo "❌ Nginx configuration has errors!"
    echo "   Fix errors before restarting"
fi
echo ""

# 6. Kiểm tra port 80 và 443
echo "🔌 Checking ports 80 and 443..."
if netstat -tuln 2>/dev/null | grep -q ":80 "; then
    echo "✅ Port 80 is listening"
else
    echo "⚠️  Port 80 is not listening"
fi

if netstat -tuln 2>/dev/null | grep -q ":443 "; then
    echo "✅ Port 443 is listening"
else
    echo "⚠️  Port 443 is not listening (HTTPS may not be configured)"
fi
echo ""

# 7. Kiểm tra firewall
echo "🔥 Checking firewall (UFW)..."
if command -v ufw >/dev/null 2>&1; then
    if ufw status | grep -q "80/tcp.*ALLOW\|Status: active"; then
        echo "✅ Firewall allows port 80"
    else
        echo "⚠️  Port 80 may be blocked by firewall"
        echo "   Run: sudo ufw allow 80/tcp"
    fi
    
    if ufw status | grep -q "443/tcp.*ALLOW"; then
        echo "✅ Firewall allows port 443"
    else
        echo "⚠️  Port 443 may be blocked by firewall"
        echo "   Run: sudo ufw allow 443/tcp"
    fi
else
    echo "ℹ️  UFW not found, checking iptables..."
fi
echo ""

# 8. Test local access
echo "🧪 Testing local access to domain..."
if curl -I http://localhost -H "Host: mattroitrenban.vn" 2>/dev/null | head -1 | grep -q "200\|301\|302"; then
    echo "✅ Nginx responds to domain name locally"
else
    echo "⚠️  Nginx does not respond to domain name"
fi
echo ""

# 9. Suggestions
echo "📝 Recommendations:"
echo "   1. Ensure DNS A record points to: $(curl -s ifconfig.me 2>/dev/null || echo 'YOUR_SERVER_IP')"
echo "   2. Check Nginx server_name includes: mattroitrenban.vn"
echo "   3. Restart Nginx: docker compose restart nginx"
echo "   4. Check firewall allows ports 80 and 443"
echo "   5. Wait 5-10 minutes for DNS propagation"

