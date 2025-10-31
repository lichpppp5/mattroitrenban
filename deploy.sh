#!/bin/bash

# Deployment script for production
set -e

echo "🚀 Starting deployment..."

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
docker-compose down

# Pull latest code (if using git)
# git pull origin main

# Build and start containers
echo "🔨 Building and starting containers..."
docker-compose build --no-cache
docker-compose up -d

# Wait for database to be ready
echo "⏳ Waiting for database..."
sleep 10

# Run migrations
echo "📊 Running database migrations..."
docker-compose exec -T app npx prisma migrate deploy

# Seed database (optional, only if needed)
# echo "🌱 Seeding database..."
# docker-compose exec -T app npm run db:seed

# Show status
echo "✅ Deployment complete!"
echo ""
echo "📊 Container status:"
docker-compose ps

echo ""
echo "📝 Logs:"
echo "  View logs: docker-compose logs -f"
echo "  App logs: docker-compose logs -f app"
echo "  DB logs: docker-compose logs -f postgres"
echo ""
echo "🔧 Useful commands:"
echo "  Stop: docker-compose down"
echo "  Restart: docker-compose restart"
echo "  Shell into app: docker-compose exec app sh"
echo "  Shell into DB: docker-compose exec postgres psql -U mattroitrenban -d mattroitrendb"

