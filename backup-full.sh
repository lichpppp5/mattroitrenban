#!/bin/bash

# Full backup script - backs up everything
set -e

BACKUP_DIR="backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="backup_full_${TIMESTAMP}"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_NAME}"

echo "💾 Creating full backup: ${BACKUP_NAME}"
echo ""

# Create backup directory
mkdir -p "${BACKUP_PATH}"

# Detect docker compose command
if docker compose version >/dev/null 2>&1; then
    DOCKER_COMPOSE="docker compose"
elif docker-compose version >/dev/null 2>&1; then
    DOCKER_COMPOSE="docker-compose"
else
    echo "⚠️  Docker Compose not found - skipping database backup"
    DOCKER_COMPOSE=""
fi

# 1. Backup code (exclude node_modules, .next, etc.)
echo "📦 Backing up code..."
mkdir -p "${BACKUP_PATH}/code"
rsync -av --exclude='node_modules' \
         --exclude='.next' \
         --exclude='.git' \
         --exclude='dist' \
         --exclude='build' \
         --exclude='*.log' \
         --exclude='.env*' \
         --exclude='backups' \
         --exclude='uploads' \
         --exclude='*.backup' \
         --exclude='*.bak' \
         . "${BACKUP_PATH}/code/" || {
    echo "⚠️  Code backup had some issues (continuing...)"
}

# 2. Backup database
if [ -n "$DOCKER_COMPOSE" ] && $DOCKER_COMPOSE ps postgres | grep -q "Up"; then
    echo ""
    echo "🗄️  Backing up database..."
    DB_BACKUP_FILE="${BACKUP_PATH}/database_${TIMESTAMP}.sql.gz"
    
    # Get database credentials from .env.production or docker-compose
    POSTGRES_USER="${POSTGRES_USER:-mattroitrenban}"
    POSTGRES_DB="${POSTGRES_DB:-mattroitrendb}"
    
    if $DOCKER_COMPOSE exec -T postgres pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" 2>/dev/null | gzip > "$DB_BACKUP_FILE"; then
        echo "✅ Database backed up: $(du -h "$DB_BACKUP_FILE" | cut -f1)"
    else
        echo "⚠️  Database backup failed (might not be running)"
    fi
else
    echo ""
    echo "⚠️  Skipping database backup (container not running or docker-compose not available)"
fi

# 3. Backup uploads directory
echo ""
echo "📁 Backing up uploads..."
if [ -d "uploads" ] && [ "$(ls -A uploads 2>/dev/null)" ]; then
    mkdir -p "${BACKUP_PATH}/uploads"
    cp -r uploads/* "${BACKUP_PATH}/uploads/" 2>/dev/null || {
        echo "⚠️  Some uploads might not have been backed up"
    }
    UPLOADS_SIZE=$(du -sh "${BACKUP_PATH}/uploads" 2>/dev/null | cut -f1 || echo "0")
    echo "✅ Uploads backed up: ${UPLOADS_SIZE}"
else
    echo "⚠️  No uploads directory or it's empty"
fi

# 4. Backup environment files (with warnings)
echo ""
echo "⚙️  Backing up environment configuration..."
mkdir -p "${BACKUP_PATH}/config"

# Backup .env files but warn about sensitive data
if [ -f ".env.production" ]; then
    echo "⚠️  WARNING: .env.production contains sensitive data!"
    cp .env.production "${BACKUP_PATH}/config/.env.production"
    echo "✅ .env.production backed up (⚠️ contains passwords/secrets)"
fi

if [ -f ".env.local" ]; then
    echo "⚠️  WARNING: .env.local contains sensitive data!"
    cp .env.local "${BACKUP_PATH}/config/.env.local"
    echo "✅ .env.local backed up (⚠️ contains passwords/secrets)"
fi

if [ -f ".env" ]; then
    cp .env "${BACKUP_PATH}/config/.env"
    echo "✅ .env backed up"
fi

if [ -f "docker-compose.yml" ]; then
    cp docker-compose.yml "${BACKUP_PATH}/config/docker-compose.yml"
    echo "✅ docker-compose.yml backed up"
fi

if [ -f "nginx.conf" ]; then
    cp nginx.conf "${BACKUP_PATH}/config/nginx.conf"
    echo "✅ nginx.conf backed up"
fi

# 5. Backup SSL certificates (if exists)
echo ""
echo "🔒 Backing up SSL certificates..."
if [ -d "ssl" ] && [ "$(ls -A ssl 2>/dev/null)" ]; then
    mkdir -p "${BACKUP_PATH}/ssl"
    cp -r ssl/* "${BACKUP_PATH}/ssl/" 2>/dev/null || true
    echo "✅ SSL certificates backed up (⚠️ contains private keys)"
else
    echo "⚠️  No SSL certificates directory"
fi

# 6. Create backup info file
echo ""
echo "📝 Creating backup information..."
cat > "${BACKUP_PATH}/BACKUP_INFO.txt" << EOF
Full Backup Information
=======================
Date: $(date)
Timestamp: ${TIMESTAMP}
Backup Name: ${BACKUP_NAME}

Contents:
- code/: Full source code (excluding node_modules, .next, etc.)
- database_*.sql.gz: PostgreSQL database dump
- uploads/: User uploaded files
- config/: Configuration files (.env, docker-compose.yml, nginx.conf)
- ssl/: SSL certificates (if exists)

WARNINGS:
=========
- .env.production and .env.local contain SENSITIVE DATA (passwords, secrets)
- SSL certificates contain PRIVATE KEYS
- Keep this backup SECURE and ENCRYPTED if stored externally

Restore Instructions:
====================
1. Extract backup to destination
2. Restore database: gunzip -c database_*.sql.gz | docker-compose exec -T postgres psql -U mattroitrenban -d mattroitrendb
3. Copy uploads/ back to project root
4. Update .env.production with correct values
5. Restart containers: docker compose up -d

System Information:
==================
OS: $(uname -a)
Docker: $(docker --version 2>/dev/null || echo "Not installed")
Docker Compose: $($DOCKER_COMPOSE --version 2>/dev/null || echo "Not installed")

EOF

# 7. Create compressed archive
echo ""
echo "📦 Creating compressed archive..."
cd "${BACKUP_DIR}"
tar -czf "${BACKUP_NAME}.tar.gz" "${BACKUP_NAME}" 2>/dev/null || {
    echo "⚠️  tar.gz creation failed, keeping uncompressed backup"
}
ARCHIVE_SIZE=$(du -sh "${BACKUP_NAME}.tar.gz" 2>/dev/null | cut -f1 || echo "N/A")
echo "✅ Archive created: ${BACKUP_NAME}.tar.gz (${ARCHIVE_SIZE})"

# 8. Calculate total backup size
cd ..
TOTAL_SIZE=$(du -sh "${BACKUP_PATH}" 2>/dev/null | cut -f1 || echo "0")
echo ""
echo "✅ Full backup complete!"
echo ""
echo "📊 Backup Summary:"
echo "   Location: ${BACKUP_PATH}"
echo "   Archive: ${BACKUP_DIR}/${BACKUP_NAME}.tar.gz"
echo "   Total Size: ${TOTAL_SIZE}"
echo "   Archive Size: ${ARCHIVE_SIZE}"
echo ""
echo "⚠️  SECURITY WARNING:"
echo "   This backup contains sensitive data (.env files, SSL keys)"
echo "   Keep it secure and encrypted if storing externally!"
echo ""
echo "💡 To restore:"
echo "   tar -xzf ${BACKUP_DIR}/${BACKUP_NAME}.tar.gz"
echo "   Then follow instructions in BACKUP_INFO.txt"

