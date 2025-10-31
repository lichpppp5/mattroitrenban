#!/bin/bash

# Script to check database connection and status
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

echo "🔍 Checking database status..."

# Check if containers are running
echo ""
echo "📊 Container status:"
$DOCKER_COMPOSE ps | grep -E "(postgres|app)" || echo "⚠️  Containers not running"

# Check database connection
echo ""
echo "🔌 Testing database connection..."
$DOCKER_COMPOSE exec -T postgres pg_isready -U mattroitrenban && echo "✅ Database is reachable" || echo "❌ Database is not reachable"

# Check if database exists
echo ""
echo "🗄️  Checking database..."
$DOCKER_COMPOSE exec -T postgres psql -U mattroitrenban -lqt | cut -d \| -f 1 | grep -qw mattroitrendb && echo "✅ Database 'mattroitrendb' exists" || echo "❌ Database 'mattroitrendb' not found"

# Check tables
echo ""
echo "📋 Checking tables..."
TABLE_COUNT=$($DOCKER_COMPOSE exec -T postgres psql -U mattroitrenban -d mattroitrendb -tAc "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public'" 2>/dev/null || echo "0")
if [ "$TABLE_COUNT" -gt "0" ]; then
    echo "✅ Found $TABLE_COUNT tables in database"
    echo ""
    echo "📊 Tables:"
    $DOCKER_COMPOSE exec -T postgres psql -U mattroitrenban -d mattroitrendb -c "\dt" 2>/dev/null || echo "Cannot list tables"
else
    echo "⚠️  No tables found - migrations might not have run"
fi

# Check users
echo ""
echo "👥 Checking users..."
USER_COUNT=$($DOCKER_COMPOSE exec -T postgres psql -U mattroitrenban -d mattroitrendb -tAc "SELECT COUNT(*) FROM \"User\"" 2>/dev/null || echo "0")
if [ "$USER_COUNT" -gt "0" ]; then
    echo "✅ Found $USER_COUNT users in database"
    echo ""
    echo "📊 Users:"
    $DOCKER_COMPOSE exec -T postgres psql -U mattroitrenban -d mattroitrendb -c "SELECT email, role, \"isActive\" FROM \"User\";" 2>/dev/null || echo "Cannot list users"
else
    echo "⚠️  No users found - database needs to be seeded"
    echo ""
    echo "💡 Run: ./setup-database.sh"
fi

echo ""
echo "✅ Database check complete!"

