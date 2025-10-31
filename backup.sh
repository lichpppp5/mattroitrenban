#!/bin/bash

# Database backup script
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

BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$DATE.sql"

mkdir -p $BACKUP_DIR

echo "📦 Creating database backup..."

# Get database credentials from .env.production
if [ -f .env.production ]; then
    POSTGRES_USER=$(grep "^POSTGRES_USER=" .env.production | cut -d '=' -f2 | tr -d '"' | tr -d "'")
    POSTGRES_DB=$(grep "^POSTGRES_DB=" .env.production | cut -d '=' -f2 | tr -d '"' | tr -d "'")
fi

# Backup database
$DOCKER_COMPOSE exec -T postgres pg_dump -U ${POSTGRES_USER:-mattroitrenban} ${POSTGRES_DB:-mattroitrendb} > $BACKUP_FILE

# Compress backup
gzip $BACKUP_FILE

echo "✅ Backup created: ${BACKUP_FILE}.gz"

# Keep only last 7 backups
ls -t $BACKUP_DIR/backup_*.sql.gz | tail -n +8 | xargs rm -f

echo "🧹 Cleaned old backups (kept last 7)"

