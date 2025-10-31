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

# Check if tsx is available
if $DOCKER_COMPOSE exec -T app sh -c "which tsx || which npx" >/dev/null 2>&1; then
    echo "✅ Found tsx/npx, running seed..."
    $DOCKER_COMPOSE exec -T app npx tsx prisma/seed.ts
elif $DOCKER_COMPOSE exec -T app sh -c "test -f node_modules/tsx/dist/cli.mjs" >/dev/null 2>&1; then
    echo "✅ Found tsx in node_modules, running seed..."
    $DOCKER_COMPOSE exec -T app node node_modules/tsx/dist/cli.mjs prisma/seed.ts
else
    echo "⚠️  tsx not found. Installing tsx in container..."
    echo "   This might take a moment..."
    $DOCKER_COMPOSE exec -T app sh -c "npm install --save-dev tsx || npm install -g tsx" || {
        echo "❌ Failed to install tsx"
        echo ""
        echo "💡 Alternative: Run seed from host machine with database connection"
        echo "   1. Install tsx: npm install -g tsx"
        echo "   2. Set DATABASE_URL from .env.production"
        echo "   3. Run: tsx prisma/seed.ts"
        exit 1
    }
    echo "✅ tsx installed, running seed..."
    $DOCKER_COMPOSE exec -T app npx tsx prisma/seed.ts
fi

echo ""
echo "✅ Seed complete!"
echo ""
echo "📝 Default admin credentials:"
echo "   Email: admin@mattroitrenban.vn"
echo "   Password: admin123"

