#!/bin/bash

# Direct seed using Node.js script run from host or container
set -e

echo "🌱 Seeding database directly..."

# Check if we're in a Docker environment
if [ -f /.dockerenv ] || [ -n "$DOCKER_CONTAINER" ]; then
    # Running inside container
    echo "📦 Running inside container..."
    if command -v tsx >/dev/null 2>&1; then
        tsx prisma/seed.ts
    elif [ -f node_modules/tsx/dist/cli.mjs ]; then
        node node_modules/tsx/dist/cli.mjs prisma/seed.ts
    else
        echo "❌ tsx not found"
        exit 1
    fi
else
    # Running on host - try to connect to database in container
    echo "🖥️  Running on host machine..."
    
    # Detect docker compose command
    if docker compose version >/dev/null 2>&1; then
        DOCKER_COMPOSE="docker compose"
    elif docker-compose version >/dev/null 2>&1; then
        DOCKER_COMPOSE="docker-compose"
    else
        echo "❌ Error: Docker Compose not found!"
        exit 1
    fi
    
    # Check if we can run seed in container
    echo "🔍 Checking container..."
    if $DOCKER_COMPOSE ps app | grep -q "Up"; then
        echo "✅ Container is running, attempting seed..."
        
        # Try to run seed in container
        if $DOCKER_COMPOSE exec -T app sh -c "test -d node_modules/bcryptjs && test -f node_modules/tsx/dist/cli.mjs" 2>/dev/null; then
            echo "✅ Dependencies found, running seed in container..."
            $DOCKER_COMPOSE exec -T app node node_modules/tsx/dist/cli.mjs prisma/seed.ts
        elif $DOCKER_COMPOSE exec -T app sh -c "which npx" >/dev/null 2>&1; then
            echo "✅ Using npx to run seed..."
            $DOCKER_COMPOSE exec -T app npx tsx prisma/seed.ts
        else
            echo "⚠️  Cannot run seed in container, trying SQL method..."
            if [ -f ./seed-sql.sh ]; then
                chmod +x ./seed-sql.sh
                ./seed-sql.sh
            else
                echo "❌ Neither seed method available"
                exit 1
            fi
        fi
    else
        echo "❌ Container is not running"
        echo "   Start containers first: docker compose up -d"
        exit 1
    fi
fi

