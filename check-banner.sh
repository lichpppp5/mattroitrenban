#!/bin/bash

# Script to check banner status in database
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

echo "🔍 Checking banner status..."
echo ""

# Check if database is running
if ! $DOCKER_COMPOSE ps postgres | grep -q "Up"; then
    echo "❌ Database container is not running!"
    echo "💡 Run: $DOCKER_COMPOSE up -d"
    exit 1
fi

# Check banner in database
echo "📊 Checking banner in database..."
echo ""

BANNER_SITE_BANNER=$($DOCKER_COMPOSE exec -T postgres psql -U mattroitrenban -d mattroitrendb -t -c "SELECT value FROM \"SiteContent\" WHERE key = 'site.banner' LIMIT 1;" 2>/dev/null | xargs)
BANNER_HERO=$($DOCKER_COMPOSE exec -T postgres psql -U mattroitrenban -d mattroitrendb -t -c "SELECT value FROM \"SiteContent\" WHERE key = 'heroBannerImage' LIMIT 1;" 2>/dev/null | xargs)

echo "📸 Banner keys found:"
if [ -n "$BANNER_SITE_BANNER" ] && [ "$BANNER_SITE_BANNER" != "" ]; then
    BANNER_LENGTH=${#BANNER_SITE_BANNER}
    echo "  ✅ 'site.banner': Found (${BANNER_LENGTH} characters)"
    if [[ "$BANNER_SITE_BANNER" == "data:image"* ]]; then
        echo "     Type: Base64 image data"
    else
        echo "     Type: URL or text"
    fi
else
    echo "  ❌ 'site.banner': Not found or empty"
fi

if [ -n "$BANNER_HERO" ] && [ "$BANNER_HERO" != "" ]; then
    BANNER_LENGTH=${#BANNER_HERO}
    echo "  ✅ 'heroBannerImage': Found (${BANNER_LENGTH} characters)"
    if [[ "$BANNER_HERO" == "data:image"* ]]; then
        echo "     Type: Base64 image data"
    else
        echo "     Type: URL or text"
    fi
else
    echo "  ❌ 'heroBannerImage': Not found or empty"
fi

echo ""
echo "🔍 All SiteContent keys related to banner/image:"
$DOCKER_COMPOSE exec -T postgres psql -U mattroitrenban -d mattroitrendb -c "SELECT key, type, LENGTH(value) as value_length FROM \"SiteContent\" WHERE key LIKE '%banner%' OR key LIKE '%image%' OR key LIKE '%Image%';" 2>/dev/null

echo ""
echo "💡 Next steps:"
if [ -z "$BANNER_SITE_BANNER" ] && [ -z "$BANNER_HERO" ]; then
    echo "  1. Upload banner from /root-admin/settings or /root-admin/content"
    echo "  2. Make sure banner is saved (check auto-save or click 'Save')"
else
    echo "  1. Banner exists in database ✅"
    echo "  2. Rebuild app container if code was updated:"
    echo "     cd /mattroitrenban && ./update.sh"
    echo "  3. Check app logs: $DOCKER_COMPOSE logs app | grep -i banner"
    echo "  4. Revalidate homepage: curl http://44.207.127.115/api/revalidate?path=/"
fi

