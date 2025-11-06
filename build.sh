#!/bin/bash

# Script to build the project
set -e

echo "🔨 Building project..."

# Check if running in Docker or locally
if [ -f "docker-compose.yml" ] && command -v docker >/dev/null 2>&1; then
    echo "🐳 Building with Docker..."
    
    # Detect docker compose command
    if docker compose version >/dev/null 2>&1; then
        DOCKER_COMPOSE="docker compose"
    elif docker-compose version >/dev/null 2>&1; then
        DOCKER_COMPOSE="docker-compose"
    else
        echo "❌ Error: Docker Compose not found!"
        exit 1
    fi
    
    # Build app container
    echo "📦 Building app container..."
    $DOCKER_COMPOSE build app --no-cache
    
    echo "✅ Docker build complete!"
    echo ""
    echo "📝 Next steps:"
    echo "   To start: docker compose up -d"
    echo "   To restart: docker compose restart app"
    echo "   To view logs: docker compose logs -f app"
else
    echo "💻 Building locally..."
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing dependencies..."
        npm install
    fi
    
    # Generate Prisma client
    echo "🗄️  Generating Prisma client..."
    npx prisma generate
    
    # Build Next.js
    echo "⚡ Building Next.js application..."
    npm run build
    
    echo "✅ Local build complete!"
    echo ""
    echo "📝 Next steps:"
    echo "   To start: npm start"
    echo "   To dev: npm run dev"
fi

