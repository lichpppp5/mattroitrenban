#!/bin/bash

# Script to fix and start Nginx
set -e

echo "🔧 Fixing and Starting Nginx..."
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Detect docker compose command
if command -v docker >/dev/null 2>&1; then
    if docker compose version >/dev/null 2>&1; then
        DOCKER_COMPOSE="docker compose"
    elif command -v docker-compose >/dev/null 2>&1; then
        DOCKER_COMPOSE="docker-compose"
    else
        echo -e "${RED}❌ Docker Compose not found!${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ Docker not found!${NC}"
    exit 1
fi

# 1. Check if port 80 is in use
echo "1️⃣  Checking port 80..."
if command -v ss >/dev/null 2>&1; then
    PORT_80_IN_USE=$(ss -tlnp | grep ':80 ' || true)
    if [ -n "$PORT_80_IN_USE" ]; then
        echo -e "${YELLOW}⚠️  Port 80 is in use:${NC}"
        echo "$PORT_80_IN_USE"
        echo ""
        echo "   Options:"
        echo "   1. Stop the service using port 80"
        echo "   2. Or run: sudo lsof -i :80"
    else
        echo -e "${GREEN}✅ Port 80 is available${NC}"
    fi
else
    echo "   (ss command not available, skipping check)"
fi
echo ""

# 2. Check nginx.conf exists
echo "2️⃣  Checking nginx.conf..."
if [ ! -f "nginx.conf" ]; then
    echo -e "${RED}❌ nginx.conf not found!${NC}"
    exit 1
else
    echo -e "${GREEN}✅ nginx.conf exists${NC}"
    
    # Validate nginx config syntax
    echo "   Validating nginx.conf syntax..."
    if docker run --rm -v "$(pwd)/nginx.conf:/etc/nginx/nginx.conf:ro" nginx:alpine nginx -t 2>&1 | grep -q "syntax is ok"; then
        echo -e "${GREEN}✅ nginx.conf syntax is valid${NC}"
    else
        echo -e "${RED}❌ nginx.conf has syntax errors!${NC}"
        docker run --rm -v "$(pwd)/nginx.conf:/etc/nginx/nginx.conf:ro" nginx:alpine nginx -t
        exit 1
    fi
fi
echo ""

# 3. Check if media directory exists
echo "3️⃣  Checking media directory..."
if [ ! -d "media" ]; then
    echo -e "${YELLOW}⚠️  media directory not found, creating...${NC}"
    mkdir -p media
    chmod 755 media
    echo -e "${GREEN}✅ Created media directory${NC}"
else
    echo -e "${GREEN}✅ media directory exists${NC}"
fi
echo ""

# 4. Check if ssl directory exists (optional)
echo "4️⃣  Checking ssl directory..."
if [ ! -d "ssl" ]; then
    echo -e "${YELLOW}⚠️  ssl directory not found (optional for HTTPS)${NC}"
    mkdir -p ssl
    echo -e "${GREEN}✅ Created ssl directory${NC}"
else
    echo -e "${GREEN}✅ ssl directory exists${NC}"
fi
echo ""

# 5. Check if app container is running
echo "5️⃣  Checking app container..."
if $DOCKER_COMPOSE ps app | grep -q "Up"; then
    echo -e "${GREEN}✅ App container is running${NC}"
else
    echo -e "${YELLOW}⚠️  App container is not running${NC}"
    echo "   Starting app container first..."
    $DOCKER_COMPOSE up -d app
    sleep 5
fi
echo ""

# 6. Stop existing nginx container if any
echo "6️⃣  Stopping existing nginx container..."
$DOCKER_COMPOSE stop nginx 2>/dev/null || echo "   (No nginx container to stop)"
$DOCKER_COMPOSE rm -f nginx 2>/dev/null || echo "   (No nginx container to remove)"
echo ""

# 7. Start nginx
echo "7️⃣  Starting nginx..."
$DOCKER_COMPOSE up -d nginx

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Nginx started${NC}"
else
    echo -e "${RED}❌ Failed to start nginx${NC}"
    echo "   Checking logs..."
    $DOCKER_COMPOSE logs nginx
    exit 1
fi

echo ""

# 8. Wait a moment and check status
echo "8️⃣  Checking nginx status..."
sleep 3

if $DOCKER_COMPOSE ps nginx | grep -q "Up"; then
    echo -e "${GREEN}✅ Nginx is running${NC}"
else
    echo -e "${RED}❌ Nginx failed to start${NC}"
    echo "   Checking logs..."
    $DOCKER_COMPOSE logs nginx
    exit 1
fi
echo ""

# 9. Test nginx configuration
echo "9️⃣  Testing nginx configuration..."
if docker exec mattroitrenban_nginx nginx -t 2>&1 | grep -q "syntax is ok"; then
    echo -e "${GREEN}✅ Nginx configuration is valid${NC}"
else
    echo -e "${RED}❌ Nginx configuration has errors${NC}"
    docker exec mattroitrenban_nginx nginx -t
fi
echo ""

# 10. Show logs
echo "🔟 Recent nginx logs:"
$DOCKER_COMPOSE logs --tail=20 nginx

echo ""
echo -e "${GREEN}✅ Nginx fix completed!${NC}"
echo ""
echo "📝 Useful commands:"
echo "   View logs:        $DOCKER_COMPOSE logs -f nginx"
echo "   Restart nginx:    $DOCKER_COMPOSE restart nginx"
echo "   Test config:      docker exec mattroitrenban_nginx nginx -t"
echo "   Reload config:     docker exec mattroitrenban_nginx nginx -s reload"

