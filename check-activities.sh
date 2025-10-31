#!/bin/bash

# Script to check activities in database
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

echo "🔍 Checking activities in database..."

# Check total activities
echo ""
echo "📊 Total activities:"
TOTAL=$($DOCKER_COMPOSE exec -T postgres psql -U mattroitrenban -d mattroitrendb -tAc "SELECT COUNT(*) FROM \"Activity\"" 2>/dev/null || echo "0")
echo "   Total: $TOTAL"

# Check published activities
echo ""
echo "📊 Published activities (for homepage):"
PUBLISHED=$($DOCKER_COMPOSE exec -T postgres psql -U mattroitrenban -d mattroitrendb -tAc "SELECT COUNT(*) FROM \"Activity\" WHERE \"isPublished\" = true AND \"isUpcoming\" = false" 2>/dev/null || echo "0")
echo "   Published (non-upcoming): $PUBLISHED"

# Check upcoming activities
echo ""
echo "📊 Upcoming trips:"
UPCOMING=$($DOCKER_COMPOSE exec -T postgres psql -U mattroitrenban -d mattroitrendb -tAc "SELECT COUNT(*) FROM \"Activity\" WHERE \"isPublished\" = true AND \"isUpcoming\" = true" 2>/dev/null || echo "0")
echo "   Upcoming: $UPCOMING"

# List recent published activities
echo ""
echo "📋 Recent published activities (last 5):"
$DOCKER_COMPOSE exec -T postgres psql -U mattroitrenban -d mattroitrendb -c "SELECT id, title, \"isPublished\", \"isUpcoming\", \"createdAt\" FROM \"Activity\" WHERE \"isPublished\" = true ORDER BY \"createdAt\" DESC LIMIT 5;" 2>/dev/null || echo "Cannot list activities"

echo ""
echo "✅ Check complete!"
echo ""
if [ "$PUBLISHED" = "0" ] && [ "$UPCOMING" = "0" ]; then
    echo "⚠️  No published activities found!"
    echo ""
    echo "💡 To add activities:"
    echo "   1. Login to admin: http://your-domain/root-admin/login"
    echo "   2. Go to Activities section"
    echo "   3. Create new activity and set 'Published' to true"
    echo "   4. For upcoming trips, also set 'Is Upcoming' to true"
fi

