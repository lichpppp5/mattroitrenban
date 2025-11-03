#!/bin/bash

# Script to setup SSL only (if domain is already configured)
set -e

DOMAIN="mattroitrenban.vn"

echo "🔒 Setting up SSL/HTTPS for $DOMAIN"
echo ""

# Check if running as root or with sudo
if [ "$EUID" -eq 0 ]; then
    SUDO=""
else
    SUDO="sudo"
fi

# Detect docker compose command
if docker compose version >/dev/null 2>&1; then
    DOCKER_COMPOSE="docker compose"
elif docker-compose version >/dev/null 2>&1; then
    DOCKER_COMPOSE="docker-compose"
else
    echo "❌ Error: Docker Compose not found!"
    exit 1
fi

# Check if domain resolves
echo "1️⃣ Checking DNS..."
DNS_RESULT=$(dig +short $DOMAIN 2>/dev/null | head -1)
if [ -z "$DNS_RESULT" ]; then
    echo "❌ Domain $DOMAIN does not resolve!"
    echo "💡 Configure DNS A records first at Nhân Hòa"
    exit 1
fi
echo "✅ Domain resolves to: $DNS_RESULT"

# Check if certbot is installed
echo ""
echo "2️⃣ Checking certbot..."
if ! command -v certbot &> /dev/null; then
    echo "Installing certbot..."
    $SUDO apt update
    $SUDO apt install -y certbot
fi
echo "✅ Certbot is installed"

# Stop Nginx (certbot needs port 80)
echo ""
echo "3️⃣ Stopping Nginx container..."
$DOCKER_COMPOSE stop nginx

# Generate certificate
echo ""
echo "4️⃣ Generating SSL certificate..."
echo "⚠️  This might take a few minutes..."
echo ""

$SUDO certbot certonly --standalone \
    -d $DOMAIN \
    -d www.$DOMAIN \
    --email admin@$DOMAIN \
    --agree-tos \
    --non-interactive || {
    echo ""
    echo "❌ Certificate generation failed!"
    echo ""
    echo "💡 Common issues:"
    echo "   1. DNS not fully propagated (wait 15-30 min)"
    echo "   2. Port 80 blocked by firewall"
    echo "   3. Another process using port 80"
    echo ""
    echo "Checking port 80..."
    if netstat -tuln 2>/dev/null | grep -q ":80 " || ss -tuln 2>/dev/null | grep -q ":80 "; then
        echo "⚠️  Port 80 is in use by:"
        sudo netstat -tulpn | grep ":80 " || sudo ss -tulpn | grep ":80 "
    fi
    $DOCKER_COMPOSE start nginx || true
    exit 1
}

# Copy certificates
echo ""
echo "5️⃣ Copying certificates..."
mkdir -p ssl
$SUDO cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem ssl/
$SUDO cp /etc/letsencrypt/live/$DOMAIN/privkey.pem ssl/
$SUDO chmod 644 ssl/fullchain.pem
$SUDO chmod 600 ssl/privkey.pem
$SUDO chown $USER:$USER ssl/*.pem 2>/dev/null || true
echo "✅ Certificates copied to ssl/"

# Enable HTTPS in nginx.conf
echo ""
echo "6️⃣ Enabling HTTPS in nginx.conf..."
if [ ! -f nginx.conf ]; then
    echo "❌ nginx.conf not found!"
    exit 1
fi

# Backup nginx.conf
cp nginx.conf nginx.conf.backup.$(date +%Y%m%d_%H%M%S)

# Uncomment HTTPS redirect (HTTP -> HTTPS)
sed -i.bak 's|# HTTP to HTTPS redirect|HTTP to HTTPS redirect|g' nginx.conf
sed -i.bak 's|# server {|server {|g' nginx.conf
sed -i.bak '/HTTP to HTTPS redirect/,/^[[:space:]]*# server {/ s|#     listen 80;|    listen 80;|g' nginx.conf
sed -i.bak '/HTTP to HTTPS redirect/,/^[[:space:]]*# server {/ s|#     server_name|    server_name|g' nginx.conf
sed -i.bak '/HTTP to HTTPS redirect/,/^[[:space:]]*# server {/ s|#     return 301|    return 301|g' nginx.conf

# More specific uncommenting for HTTPS redirect
python3 << 'PYEOF'
import re

with open('nginx.conf', 'r') as f:
    content = f.read()

# Uncomment HTTP to HTTPS redirect section
pattern = r'# HTTP to HTTPS redirect \(uncomment when SSL is ready\)\s+# server \{\s+#     listen 80;\s+#     server_name ([^;]+);\s+#     return 301 https://\$server_name\$request_uri;\s+# \}'

replacement = r'# HTTP to HTTPS redirect\n    server {\n        listen 80;\n        server_name \1;\n        return 301 https://$server_name$request_uri;\n    }'

content = re.sub(pattern, replacement, content, flags=re.MULTILINE)

# Uncomment HTTPS server block
lines = content.split('\n')
in_https_section = False
https_uncommented = False
new_lines = []

for i, line in enumerate(lines):
    if '# HTTPS Server' in line or '# HTTPS Server (uncomment' in line:
        in_https_section = True
        new_lines.append(line)
    elif in_https_section:
        if line.strip().startswith('# server {'):
            new_lines.append(line.replace('# server {', 'server {'))
            https_uncommented = True
        elif https_uncommented and line.strip().startswith('#'):
            # Uncomment lines inside HTTPS server block
            if '# }' in line:
                new_lines.append(line.replace('# }', '}'))
                in_https_section = False
                https_uncommented = False
            else:
                new_lines.append(line.replace('#     ', '    ').replace('#         ', '        '))
        else:
            new_lines.append(line)
            if line.strip() == '}' and https_uncommented:
                in_https_section = False
                https_uncommented = False
    else:
        new_lines.append(line)

content = '\n'.join(new_lines)

with open('nginx.conf', 'w') as f:
    f.write(content)

PYEOF

echo "✅ HTTPS enabled in nginx.conf"

# Test Nginx config
echo ""
echo "7️⃣ Testing Nginx configuration..."
$DOCKER_COMPOSE up -d nginx
sleep 2
if $DOCKER_COMPOSE exec nginx nginx -t 2>/dev/null; then
    echo "✅ Nginx configuration is valid"
else
    echo "❌ Nginx configuration has errors!"
    echo "Restoring backup..."
    cp nginx.conf.backup.* nginx.conf 2>/dev/null || true
    exit 1
fi

echo ""
echo "8️⃣ Restarting Nginx..."
$DOCKER_COMPOSE restart nginx

echo ""
echo "✅ SSL setup complete!"
echo ""
echo "🔍 Testing HTTPS..."
sleep 3
if curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 https://$DOMAIN 2>/dev/null | grep -q "200\|301\|302"; then
    echo "✅ HTTPS is working!"
else
    echo "⚠️  HTTPS test failed, but certificates are installed"
    echo "💡 Check: docker compose logs nginx"
fi

echo ""
echo "📋 Summary:"
echo "  Domain: $DOMAIN"
echo "  SSL: ✅ Installed"
echo "  HTTPS: ✅ Enabled"
echo ""
echo "🔗 Test URLs:"
echo "  HTTP:  http://$DOMAIN (should redirect to HTTPS)"
echo "  HTTPS: https://$DOMAIN"

