#!/bin/bash

# Script to start all services
set -e

echo "🚀 Starting All Services..."
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo -e "${RED}❌ .env.production not found!${NC}"
    echo "   Please run: ./setup-test-env.sh"
    exit 1
fi

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

# 1. Start all services
echo "1️⃣  Starting Docker Compose services..."
$DOCKER_COMPOSE up -d

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Services started${NC}"
else
    echo -e "${RED}❌ Failed to start services${NC}"
    exit 1
fi

echo ""

# 2. Wait for database
echo "2️⃣  Waiting for database to be ready..."
sleep 5

MAX_RETRIES=30
RETRY_COUNT=0
while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if $DOCKER_COMPOSE exec -T postgres pg_isready -U mattroitrenban >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Database is ready${NC}"
        break
    fi
    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo "   Waiting... ($RETRY_COUNT/$MAX_RETRIES)"
    sleep 2
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo -e "${YELLOW}⚠️  Database may not be ready yet${NC}"
fi

echo ""

# 3. Run migrations
echo "3️⃣  Running database migrations..."
$DOCKER_COMPOSE exec -T app npx prisma migrate deploy || echo -e "${YELLOW}⚠️  Migration may have failed${NC}"

echo ""

# 4. Check service status
echo "4️⃣  Service Status:"
$DOCKER_COMPOSE ps

echo ""

# 5. Show logs
echo "5️⃣  Recent logs (last 20 lines):"
$DOCKER_COMPOSE logs --tail=20

echo ""
echo -e "${GREEN}✅ All services started!${NC}"
echo ""
echo "📝 Useful commands:"
echo "   View logs:        $DOCKER_COMPOSE logs -f"
echo "   Stop services:    $DOCKER_COMPOSE down"
echo "   Restart:          $DOCKER_COMPOSE restart"
echo "   Status:           $DOCKER_COMPOSE ps"
echo "   App logs:         $DOCKER_COMPOSE logs -f app"
echo "   Nginx logs:       $DOCKER_COMPOSE logs -f nginx"
echo "   Database logs:    $DOCKER_COMPOSE logs -f postgres"

