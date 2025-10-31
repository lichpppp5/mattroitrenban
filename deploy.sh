#!/bin/bash

# Deployment script for production
set -e

echo "🚀 Starting deployment..."

# Detect docker compose command (prefer V2, fallback to V1)
if docker compose version >/dev/null 2>&1; then
    DOCKER_COMPOSE="docker compose"
elif docker-compose version >/dev/null 2>&1; then
    DOCKER_COMPOSE="docker-compose"
else
    echo "❌ Error: Docker Compose not found!"
    echo "📝 Please install Docker Compose:"
    echo "   Ubuntu/Debian: sudo apt-get update && sudo apt-get install docker-compose-plugin"
    echo "   Or install standalone: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Using: $DOCKER_COMPOSE"

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo "❌ Error: .env.production not found!"
    echo "📝 Run ./setup-test-env.sh to create it, or manually copy .env.production.example"
    exit 1
fi

# Load environment variables (docker-compose will read .env.production automatically)
# Skip manual export to avoid issues with values containing spaces

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p uploads
mkdir -p ssl
mkdir -p logs

# Stop existing containers
echo "🛑 Stopping existing containers..."
$DOCKER_COMPOSE down

# Pull latest code (if using git)
# git pull origin main

# Build and start containers
echo "🔨 Building and starting containers..."
$DOCKER_COMPOSE build --no-cache
$DOCKER_COMPOSE up -d

# Wait for database to be ready
echo "⏳ Waiting for database..."
sleep 10

# Run migrations
echo "📊 Running database migrations..."
$DOCKER_COMPOSE exec -T app npx prisma migrate deploy

# Seed database (optional, only if needed)
# echo "🌱 Seeding database..."
# docker-compose exec -T app npm run db:seed

# Show status
echo "✅ Deployment complete!"
echo ""
echo "📊 Container status:"
$DOCKER_COMPOSE ps

echo ""
echo "📝 Logs:"
echo "  View logs: $DOCKER_COMPOSE logs -f"
echo "  App logs: $DOCKER_COMPOSE logs -f app"
echo "  DB logs: $DOCKER_COMPOSE logs -f postgres"
echo ""
echo "🔧 Useful commands:"
echo "  Stop: $DOCKER_COMPOSE down"
echo "  Restart: $DOCKER_COMPOSE restart"
echo "  Shell into app: $DOCKER_COMPOSE exec app sh"
echo "  Shell into DB: $DOCKER_COMPOSE exec postgres psql -U mattroitrenban -d mattroitrendb"

