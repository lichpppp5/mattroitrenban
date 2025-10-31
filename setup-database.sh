#!/bin/bash

# Script to setup database (migrations + seed)
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

echo "🗄️  Setting up database..."

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
MAX_RETRIES=30
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if $DOCKER_COMPOSE exec -T postgres pg_isready -U mattroitrenban >/dev/null 2>&1; then
        echo "✅ Database is ready!"
        break
    fi
    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo "   Waiting... ($RETRY_COUNT/$MAX_RETRIES)"
    sleep 2
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo "❌ Database is not ready after $MAX_RETRIES attempts"
    exit 1
fi

# Run migrations
echo ""
echo "📊 Running database migrations..."
$DOCKER_COMPOSE exec -T app npx prisma migrate deploy || {
    echo "⚠️  Migration failed or no migrations to run"
}

# Generate Prisma Client (just in case)
echo ""
echo "🔧 Generating Prisma Client..."
$DOCKER_COMPOSE exec -T app npx prisma generate || {
    echo "⚠️  Prisma generate failed"
}

# Seed database
echo ""
echo "🌱 Seeding database with initial data..."
$DOCKER_COMPOSE exec -T app npm run db:seed || {
    echo "⚠️  Seed failed - this might be okay if data already exists"
}

echo ""
echo "✅ Database setup complete!"
echo ""
echo "📝 Default admin credentials:"
echo "   Email: admin@mattroitrenban.vn"
echo "   Password: admin123"
echo ""
echo "   Or:"
echo "   Email: admin@mattroitrendb.org"
echo "   Password: admin123"

