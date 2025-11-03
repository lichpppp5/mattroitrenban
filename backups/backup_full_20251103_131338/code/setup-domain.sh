#!/bin/bash

# Script to setup domain name mattroitrenban.vn
set -e

DOMAIN="mattroitrenban.vn"
IP_ADDRESS="44.207.127.115"

echo "🌐 Setting up domain: $DOMAIN"
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

echo "📋 Step 1: DNS Configuration"
echo "============================"
echo ""
echo "⚠️  IMPORTANT: You need to configure DNS records at Nhân Hòa first!"
echo ""
echo "Go to Nhân Hòa DNS management and create these records:"
echo ""
echo "  Type    Name    Value              TTL"
echo "  ----    ----    -----              ---"
echo "  A       @       $IP_ADDRESS       3600"
echo "  A       www     $IP_ADDRESS       3600"
echo ""
echo "Or via API/Web interface:"
echo "  - Create A record: @ -> $IP_ADDRESS"
echo "  - Create A record: www -> $IP_ADDRESS"
echo ""
read -p "Have you configured DNS records? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Please configure DNS records first, then run this script again."
    exit 1
fi

echo ""
echo "⏳ Waiting 30 seconds for DNS propagation..."
echo "   (You can skip this if DNS is already configured)"
sleep 30

echo ""
echo "📋 Step 2: Update .env.production"
echo "============================"
ENV_FILE=".env.production"
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ $ENV_FILE not found!"
    echo "💡 Run ./setup-test-env.sh first or create .env.production manually"
    exit 1
fi

echo "Updating $ENV_FILE with domain configuration..."
# Backup original
cp "$ENV_FILE" "${ENV_FILE}.backup.$(date +%Y%m%d_%H%M%S)"

# Update NEXTAUTH_URL
sed -i.bak "s|NEXTAUTH_URL=.*|NEXTAUTH_URL=https://$DOMAIN|g" "$ENV_FILE"
sed -i.bak "s|NEXT_PUBLIC_APP_URL=.*|NEXT_PUBLIC_APP_URL=https://$DOMAIN|g" "$ENV_FILE"

echo "✅ Updated environment variables"
echo ""

echo "📋 Step 3: Check DNS Resolution"
echo "============================"
echo "Checking if domain resolves correctly..."
if dig +short $DOMAIN | grep -q "$IP_ADDRESS"; then
    echo "✅ Domain $DOMAIN resolves to $IP_ADDRESS"
elif ping -c 1 $DOMAIN >/dev/null 2>&1; then
    echo "✅ Domain $DOMAIN is reachable"
else
    echo "⚠️  Warning: Domain might not be fully propagated yet"
    echo "   This is normal if DNS was just configured"
    echo "   You can continue, but SSL setup might fail"
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo ""
echo "📋 Step 4: Setup SSL Certificate (Optional but Recommended)"
echo "============================"
echo ""
read -p "Do you want to setup SSL/HTTPS now? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Check if certbot is installed
    if ! command -v certbot &> /dev/null; then
        echo "Installing certbot..."
        $SUDO apt update
        $SUDO apt install -y certbot
    fi
    
    echo ""
    echo "⚠️  IMPORTANT: Stop Nginx container before generating certificate!"
    echo "   Certbot needs to bind to port 80"
    echo ""
    read -p "Stop Nginx container now? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        $DOCKER_COMPOSE stop nginx || true
    fi
    
    echo ""
    echo "Generating SSL certificate..."
    $SUDO certbot certonly --standalone \
        -d $DOMAIN \
        -d www.$DOMAIN \
        --email admin@$DOMAIN \
        --agree-tos \
        --non-interactive || {
        echo "❌ Certificate generation failed"
        echo "💡 Make sure:"
        echo "   1. DNS records are configured correctly"
        echo "   2. Port 80 is accessible from internet"
        echo "   3. Nginx container is stopped"
        $DOCKER_COMPOSE start nginx || true
        exit 1
    }
    
    echo ""
    echo "Copying certificates..."
    mkdir -p ssl
    $SUDO cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem ssl/
    $SUDO cp /etc/letsencrypt/live/$DOMAIN/privkey.pem ssl/
    $SUDO chmod 644 ssl/fullchain.pem
    $SUDO chmod 600 ssl/privkey.pem
    $SUDO chown $USER:$USER ssl/*.pem
    
    echo "✅ SSL certificates copied to ssl/ directory"
    
    # Uncomment HTTPS section in nginx.conf
    echo ""
    echo "Enabling HTTPS in nginx.conf..."
    if [ -f nginx.conf ]; then
        # Uncomment HTTPS server block
        sed -i.bak 's/# server {/server {/g' nginx.conf
        sed -i.bak 's/#     listen 443/    listen 443/g' nginx.conf
        sed -i.bak 's/#     server_name/    server_name/g' nginx.conf
        sed -i.bak 's/#     ssl_certificate/    ssl_certificate/g' nginx.conf
        sed -i.bak 's/#     ssl_certificate_key/    ssl_certificate_key/g' nginx.conf
        sed -i.bak 's/#     ssl_protocols/    ssl_protocols/g' nginx.conf
        sed -i.bak 's/#     ssl_ciphers/    ssl_ciphers/g' nginx.conf
        sed -i.bak 's/#     ssl_prefer_server_ciphers/    ssl_prefer_server_ciphers/g' nginx.conf
        sed -i.bak 's/#     add_header Strict-Transport-Security/    add_header Strict-Transport-Security/g' nginx.conf
        sed -i.bak 's/#     add_header X-Frame-Options/    add_header X-Frame-Options/g' nginx.conf
        sed -i.bak 's/#     add_header X-Content-Type-Options/    add_header X-Content-Type-Options/g' nginx.conf
        sed -i.bak 's/#     add_header X-XSS-Protection/    add_header X-XSS-Protection/g' nginx.conf
        sed -i.bak 's/#     location \/uploads/    location \/uploads/g' nginx.conf
        sed -i.bak 's/#         alias \/var\/www\/uploads/        alias \/var\/www\/uploads/g' nginx.conf
        sed -i.bak 's/#         expires 30d/        expires 30d/g' nginx.conf
        sed -i.bak 's/#         add_header Cache-Control/        add_header Cache-Control/g' nginx.conf
        sed -i.bak 's/#     location \//    location \//g' nginx.conf
        sed -i.bak 's/#         limit_req zone=general/        limit_req zone=general/g' nginx.conf
        sed -i.bak 's/#         proxy_pass/        proxy_pass/g' nginx.conf
        sed -i.bak 's/#         proxy_http_version/        proxy_http_version/g' nginx.conf
        sed -i.bak 's/#         proxy_set_header Upgrade/        proxy_set_header Upgrade/g' nginx.conf
        sed -i.bak 's/#         proxy_set_header Connection/        proxy_set_header Connection/g' nginx.conf
        sed -i.bak 's/#         proxy_set_header Host/        proxy_set_header Host/g' nginx.conf
        sed -i.bak 's/#         proxy_set_header X-Real-IP/        proxy_set_header X-Real-IP/g' nginx.conf
        sed -i.bak 's/#         proxy_set_header X-Forwarded-For/        proxy_set_header X-Forwarded-For/g' nginx.conf
        sed -i.bak 's/#         proxy_set_header X-Forwarded-Proto/        proxy_set_header X-Forwarded-Proto/g' nginx.conf
        sed -i.bak 's/#         proxy_cache_bypass/        proxy_cache_bypass/g' nginx.conf
        sed -i.bak 's/#     location \/api/    location \/api/g' nginx.conf
        sed -i.bak 's/#         limit_req zone=api_limit/        limit_req zone=api_limit/g' nginx.conf
        sed -i.bak 's/#         proxy_pass/        proxy_pass/g' nginx.conf
        sed -i.bak 's/#     location \/_next\/static/    location \/_next\/static/g' nginx.conf
        sed -i.bak 's/#         proxy_pass/        proxy_pass/g' nginx.conf
        sed -i.bak 's/#         proxy_cache_valid/        proxy_cache_valid/g' nginx.conf
        sed -i.bak 's/#         add_header Cache-Control/        add_header Cache-Control/g' nginx.conf
        sed -i.bak 's/# }/}/g' nginx.conf
        
        # Enable HTTP to HTTPS redirect
        sed -i.bak 's/# HTTP to HTTPS redirect/HTTP to HTTPS redirect/g' nginx.conf
        sed -i.bak 's/# server {/server {/g' nginx.conf | head -1
        sed -i.bak 's/#     listen 80;/    listen 80;/g' nginx.conf | head -1
        sed -i.bak 's/#     server_name/    server_name/g' nginx.conf | head -1
        sed -i.bak 's/#     return 301/    return 301/g' nginx.conf | head -1
        sed -i.bak 's/# }/}/g' nginx.conf | head -1
        
        echo "✅ HTTPS enabled in nginx.conf"
    fi
    
    # Restart nginx
    echo ""
    echo "Restarting Nginx..."
    $DOCKER_COMPOSE up -d nginx
else
    echo "⏭️  Skipping SSL setup (you can run this script again later)"
fi

echo ""
echo "📋 Step 5: Restart Services"
echo "============================"
echo "Restarting app to apply domain changes..."
$DOCKER_COMPOSE restart app

echo ""
echo "✅ Domain setup complete!"
echo ""
echo "📊 Summary:"
echo "  Domain: $DOMAIN"
echo "  IP: $IP_ADDRESS"
echo "  SSL: $([ -f ssl/fullchain.pem ] && echo 'Enabled' || echo 'Not configured')"
echo ""
echo "🔍 Test your domain:"
echo "  HTTP:  curl -I http://$DOMAIN"
echo "  HTTPS: curl -I https://$DOMAIN (if SSL is configured)"
echo ""
echo "💡 Next steps:"
echo "  1. Test domain in browser: http://$DOMAIN"
echo "  2. If SSL is configured, test: https://$DOMAIN"
echo "  3. Update DNS records if domain doesn't resolve"
echo "  4. Check logs: $DOCKER_COMPOSE logs -f nginx"

