#!/bin/bash

# Script to check team members in database
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

echo "👥 Checking team members in database..."

# Check total team members
echo ""
echo "📊 Total team members:"
TOTAL=$($DOCKER_COMPOSE exec -T postgres psql -U mattroitrenban -d mattroitrendb -tAc "SELECT COUNT(*) FROM \"TeamMember\"" 2>/dev/null || echo "0")
echo "   Total: $TOTAL"

# Check active team members
echo ""
echo "📊 Active team members (displayed on website):"
ACTIVE=$($DOCKER_COMPOSE exec -T postgres psql -U mattroitrenban -d mattroitrendb -tAc "SELECT COUNT(*) FROM \"TeamMember\" WHERE \"isActive\" = true" 2>/dev/null || echo "0")
echo "   Active: $ACTIVE"

# Check by role
echo ""
echo "📊 By role:"
EXECUTIVE=$($DOCKER_COMPOSE exec -T postgres psql -U mattroitrenban -d mattroitrendb -tAc "SELECT COUNT(*) FROM \"TeamMember\" WHERE \"isActive\" = true AND role = 'executive'" 2>/dev/null || echo "0")
VOLUNTEER=$($DOCKER_COMPOSE exec -T postgres psql -U mattroitrenban -d mattroitrendb -tAc "SELECT COUNT(*) FROM \"TeamMember\" WHERE \"isActive\" = true AND role = 'volunteer'" 2>/dev/null || echo "0")
EXPERT=$($DOCKER_COMPOSE exec -T postgres psql -U mattroitrenban -d mattroitrendb -tAc "SELECT COUNT(*) FROM \"TeamMember\" WHERE \"isActive\" = true AND role = 'expert'" 2>/dev/null || echo "0")

echo "   Lãnh đạo (executive): $EXECUTIVE"
echo "   Tình nguyện viên (volunteer): $VOLUNTEER"
echo "   Hỗ trợ viên (expert): $EXPERT"

# List team members
echo ""
echo "📋 Team members (last 10):"
$DOCKER_COMPOSE exec -T postgres psql -U mattroitrenban -d mattroitrendb -c "SELECT id, name, role, position, \"isActive\", \"createdAt\" FROM \"TeamMember\" ORDER BY \"createdAt\" DESC LIMIT 10;" 2>/dev/null || echo "Cannot list team members"

echo ""
echo "✅ Check complete!"
echo ""
if [ "$ACTIVE" = "0" ]; then
    echo "⚠️  No active team members found!"
    echo ""
    echo "💡 To add team members:"
    echo "   1. Login to admin: http://your-domain/root-admin/login"
    echo "   2. Go to Team section"
    echo "   3. Create new team member"
    echo "   4. Make sure 'Active' is checked"
fi

