#!/bin/bash

# Simple script to enable HTTPS in nginx.conf
set -e

echo "🔒 Enabling HTTPS in nginx.conf..."
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

# Check if SSL certificates exist
if [ ! -f ssl/fullchain.pem ] || [ ! -f ssl/privkey.pem ]; then
    echo "❌ SSL certificates not found!"
    echo "💡 Run ./setup-ssl-only.sh first to generate certificates"
    exit 1
fi

# Backup nginx.conf
cp nginx.conf nginx.conf.backup.$(date +%Y%m%d_%H%M%S)
echo "✅ Backup created: nginx.conf.backup.*"

# Create new nginx.conf with HTTPS enabled
cat > nginx.conf << 'NGINX_EOF'
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Cache zone for Next.js pages (must be in http block)
    proxy_cache_path /var/cache/nginx/nextjs levels=1:2 keys_zone=nextjs_cache:10m max_size=100m inactive=60m use_temp_path=off;

    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    # Performance
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 10M;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/rss+xml font/truetype font/opentype application/vnd.ms-fontobject image/svg+xml;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=general:10m rate=30r/s;

    # Upstream
    upstream nextjs {
        server app:3000;
        keepalive 64;
    }

    # HTTP to HTTPS redirect
    server {
        listen 80;
        server_name mattroitrenban.vn www.mattroitrenban.vn 44.207.127.115;
        return 301 https://$server_name$request_uri;
    }

    # HTTPS Server
    server {
        listen 443 ssl http2;
        server_name mattroitrenban.vn www.mattroitrenban.vn;

        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;
        ssl_prefer_server_ciphers on;

        # Security headers
        add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;

        # Uploads
        location /uploads {
            alias /var/www/uploads;
            expires 30d;
            add_header Cache-Control "public, immutable";
        }

        # Next.js app with caching
        location / {
            limit_req zone=general burst=20 nodelay;
            
            # Enable caching for GET requests
            proxy_cache nextjs_cache;
            proxy_cache_valid 200 60s;
            proxy_cache_valid 404 10s;
            proxy_cache_use_stale error timeout updating http_500 http_502 http_503 http_504;
            proxy_cache_background_update on;
            proxy_cache_lock on;
            
            # Cache key
            proxy_cache_key "$scheme$request_method$host$request_uri";
            
            # Add cache status header for debugging
            add_header X-Cache-Status $upstream_cache_status;
            
            proxy_pass http://nextjs;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
            proxy_read_timeout 300s;
            proxy_connect_timeout 75s;
        }

        # API with caching for GET requests
        location /api {
            limit_req zone=api_limit burst=20 nodelay;
            
            # Cache GET requests only
            set $no_cache 0;
            if ($request_method != GET) {
                set $no_cache 1;
            }
            # Don't cache auth routes
            if ($request_uri ~* "/api/auth") {
                set $no_cache 1;
            }
            
            proxy_cache nextjs_cache;
            proxy_cache_valid 200 30s;
            proxy_cache_bypass $no_cache;
            proxy_no_cache $no_cache;
            proxy_cache_key "$scheme$request_method$host$request_uri";
            add_header X-Cache-Status $upstream_cache_status;
            
            proxy_pass http://nextjs;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_read_timeout 300s;
            proxy_connect_timeout 75s;
        }

        # Static files caching
        location /_next/static {
            proxy_pass http://nextjs;
            proxy_cache_valid 200 60m;
            add_header Cache-Control "public, max-age=3600, immutable";
        }
    }
}
NGINX_EOF

echo "✅ nginx.conf updated with HTTPS enabled"

# Test Nginx configuration
echo ""
echo "🧪 Testing Nginx configuration..."
if $DOCKER_COMPOSE exec nginx nginx -t 2>&1; then
    echo "✅ Nginx configuration is valid!"
else
    echo "❌ Nginx configuration has errors!"
    echo "💡 Restoring backup..."
    cp nginx.conf.backup.* nginx.conf 2>/dev/null || true
    exit 1
fi

# Restart Nginx
echo ""
echo "🔄 Restarting Nginx..."
$DOCKER_COMPOSE restart nginx

echo ""
echo "✅ HTTPS enabled successfully!"
echo ""
echo "🔍 Testing HTTPS..."
sleep 3

DOMAIN="mattroitrenban.vn"
HTTPS_TEST=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 https://$DOMAIN 2>/dev/null || echo "000")
HTTP_TEST=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 http://$DOMAIN 2>/dev/null || echo "000")

if [ "$HTTPS_TEST" = "200" ] || [ "$HTTPS_TEST" = "301" ] || [ "$HTTPS_TEST" = "302" ]; then
    echo "✅ HTTPS is working: HTTP $HTTP_TEST → HTTPS $HTTPS_TEST"
else
    echo "⚠️  HTTPS test returned: $HTTPS_TEST"
    echo "💡 Check logs: docker compose logs nginx"
fi

echo ""
echo "📋 Summary:"
echo "  ✅ HTTPS enabled in nginx.conf"
echo "  ✅ HTTP → HTTPS redirect enabled"
echo "  ✅ Nginx restarted"
echo ""
echo "🔗 Test URLs:"
echo "  HTTP:  http://$DOMAIN (should redirect to HTTPS)"
echo "  HTTPS: https://$DOMAIN"

