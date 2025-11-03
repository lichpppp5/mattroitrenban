#!/bin/bash

# Manual seed script - run seed directly in container
set -e

# Detect docker compose command
if docker compose version >/dev/null 2>&1; then
    DOCKER_COMPOSE="docker compose"
elif docker-compose version >/dev/null 2>&1; then
    DOCKER_COMPOSE="docker-compose"
else
    echo "❌ Error: Docker Compose not found!"
    exit 1
fi

echo "🌱 Seeding database manually..."

# Check if required modules exist
if $DOCKER_COMPOSE exec -T app sh -c "test -d node_modules/bcryptjs" >/dev/null 2>&1; then
    echo "✅ Required dependencies found"
    
    # Try different methods to run seed
    if $DOCKER_COMPOSE exec -T app sh -c "test -f node_modules/tsx/dist/cli.mjs" >/dev/null 2>&1; then
        echo "✅ Running seed with tsx from node_modules..."
        $DOCKER_COMPOSE exec -T app node node_modules/tsx/dist/cli.mjs prisma/seed.ts
    elif $DOCKER_COMPOSE exec -T app sh -c "which npx" >/dev/null 2>&1; then
        echo "✅ Running seed with npx tsx..."
        $DOCKER_COMPOSE exec -T app npx tsx prisma/seed.ts
    else
        echo "⚠️  tsx not found in container"
        echo "   Please rebuild container: git pull && ./deploy.sh"
        exit 1
    fi
else
    echo "❌ Required dependencies (bcryptjs) not found in production image"
    echo ""
    echo "💡 Solution: Rebuild container with updated Dockerfile"
    echo "   1. git pull origin main"
    echo "   2. ./deploy.sh"
    echo ""
    echo "   Or run seed from outside container (requires database access):"
    echo "   1. Install dependencies on host: npm install"
    echo "   2. Set DATABASE_URL (from .env.production)"
    echo "   3. Run: npx tsx prisma/seed.ts"
    exit 1
fi

echo ""
echo "✅ Seed complete!"
echo ""
echo "📝 Default admin credentials:"
echo "   Email: admin@mattroitrenban.vn"
echo "   Password: admin123"

