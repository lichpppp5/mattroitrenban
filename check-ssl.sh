#!/bin/bash

# Script to check SSL/HTTPS status
set -e

DOMAIN="mattroitrenban.vn"

echo "🔍 Checking SSL/HTTPS status for $DOMAIN"
echo ""

# Detect docker compose command
if docker compose version >/dev/null 2>&1; then
    DOCKER_COMPOSE="docker compose"
elif docker-compose version >/dev/null 2>&1; then
    DOCKER_COMPOSE="docker-compose"
else
    echo "❌ Error: Docker Compose not found!"
    exit 1
fi

echo "1️⃣ Checking DNS resolution..."
DNS_RESULT=$(dig +short $DOMAIN 2>/dev/null | head -1)
if [ -n "$DNS_RESULT" ]; then
    echo "   ✅ Domain resolves to: $DNS_RESULT"
else
    echo "   ❌ Domain does not resolve"
    echo "   💡 Check DNS configuration at Nhân Hòa"
fi

echo ""
echo "2️⃣ Checking SSL certificates..."
if [ -f ssl/fullchain.pem ] && [ -f ssl/privkey.pem ]; then
    echo "   ✅ SSL certificates found in ssl/ directory"
    echo "   📅 Certificate expiry:"
    openssl x509 -in ssl/fullchain.pem -noout -enddate 2>/dev/null || echo "   ⚠️  Cannot read certificate"
else
    echo "   ❌ SSL certificates not found"
    echo "   💡 Run: ./setup-domain.sh (choose 'y' for SSL setup)"
fi

echo ""
echo "3️⃣ Checking Nginx configuration..."
if grep -q "listen 443" nginx.conf 2>/dev/null; then
    if grep -q "^[[:space:]]*listen 443" nginx.conf 2>/dev/null; then
        echo "   ✅ HTTPS (port 443) is enabled in nginx.conf"
    else
        echo "   ⚠️  HTTPS section exists but might be commented"
        echo "   💡 Uncomment HTTPS section in nginx.conf"
    fi
else
    echo "   ❌ HTTPS not configured in nginx.conf"
    echo "   💡 Enable HTTPS section in nginx.conf"
fi

echo ""
echo "4️⃣ Checking port 443 on server..."
if netstat -tuln 2>/dev/null | grep -q ":443 " || ss -tuln 2>/dev/null | grep -q ":443 "; then
    echo "   ✅ Port 443 is listening"
else
    echo "   ❌ Port 443 is not listening"
    echo "   💡 Nginx might not be running or HTTPS not enabled"
fi

echo ""
echo "5️⃣ Checking firewall..."
if command -v ufw &> /dev/null; then
    UFW_443=$(sudo ufw status | grep -i "443" || echo "")
    if echo "$UFW_443" | grep -q "ALLOW"; then
        echo "   ✅ Port 443 is allowed in UFW"
    else
        echo "   ⚠️  Port 443 might not be allowed in UFW"
        echo "   💡 Run: sudo ufw allow 443/tcp"
    fi
else
    echo "   ⚠️  UFW not found, check iptables or other firewall"
fi

echo ""
echo "6️⃣ Checking Nginx container..."
if $DOCKER_COMPOSE ps nginx | grep -q "Up"; then
    echo "   ✅ Nginx container is running"
    
    # Test Nginx config
    if $DOCKER_COMPOSE exec nginx nginx -t 2>/dev/null; then
        echo "   ✅ Nginx configuration is valid"
    else
        echo "   ❌ Nginx configuration has errors"
        echo "   💡 Check: docker compose exec nginx nginx -t"
    fi
else
    echo "   ❌ Nginx container is not running"
    echo "   💡 Run: docker compose up -d nginx"
fi

echo ""
echo "7️⃣ Testing HTTP connection..."
HTTP_TEST=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 http://$DOMAIN 2>/dev/null || echo "000")
if [ "$HTTP_TEST" = "200" ] || [ "$HTTP_TEST" = "301" ] || [ "$HTTP_TEST" = "302" ]; then
    echo "   ✅ HTTP (port 80) is working: $HTTP_TEST"
else
    echo "   ❌ HTTP is not working: $HTTP_TEST"
fi

echo ""
echo "8️⃣ Testing HTTPS connection..."
HTTPS_TEST=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 -k https://$DOMAIN 2>/dev/null || echo "000")
if [ "$HTTPS_TEST" = "200" ] || [ "$HTTPS_TEST" = "301" ] || [ "$HTTPS_TEST" = "302" ]; then
    echo "   ✅ HTTPS (port 443) is working: $HTTPS_TEST"
else
    echo "   ❌ HTTPS is not working: $HTTPS_TEST"
fi

echo ""
echo "📋 Summary:"
if [ -f ssl/fullchain.pem ] && [ -f ssl/privkey.pem ]; then
    if grep -q "^[[:space:]]*listen 443" nginx.conf 2>/dev/null; then
        echo "   ✅ SSL certificates: Found"
        echo "   ✅ Nginx HTTPS: Enabled"
        if [ "$HTTPS_TEST" != "200" ] && [ "$HTTPS_TEST" != "301" ] && [ "$HTTPS_TEST" != "302" ]; then
            echo "   ❌ HTTPS connection: Failed"
            echo ""
            echo "💡 Troubleshooting:"
            echo "   1. Restart Nginx: docker compose restart nginx"
            echo "   2. Check logs: docker compose logs nginx"
            echo "   3. Check firewall: sudo ufw allow 443/tcp"
            echo "   4. Verify SSL files: ls -la ssl/"
        else
            echo "   ✅ HTTPS connection: Working"
        fi
    else
        echo "   ✅ SSL certificates: Found"
        echo "   ❌ Nginx HTTPS: Not enabled"
        echo ""
        echo "💡 Fix: Enable HTTPS section in nginx.conf"
    fi
else
    echo "   ❌ SSL certificates: Not found"
    echo ""
    echo "💡 Next steps:"
    echo "   1. Run: ./setup-domain.sh (choose 'y' for SSL)"
    echo "   2. Or manually setup SSL certificate"
fi

