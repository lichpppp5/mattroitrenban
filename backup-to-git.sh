#!/bin/bash

# Script to create full backup from production server and push to new Git repository
# Usage: ./backup-to-git.sh

set -e

echo "🔄 Bắt đầu tạo backup từ server production..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BACKUP_DIR="backup-$(date +%Y%m%d-%H%M%S)"
GIT_REPO_URL="https://github.com/lichpppp5/webfinal.git"
GIT_REPO_NAME="webfinal"

# Check if running on server or local
if [ -f "docker-compose.yml" ] && docker ps | grep -q "mattroitrenban"; then
    echo -e "${GREEN}✓${NC} Đang chạy trên server production"
    IS_SERVER=true
else
    echo -e "${YELLOW}⚠${NC}  Đang chạy trên máy local"
    IS_SERVER=false
fi

# Create backup directory
mkdir -p "$BACKUP_DIR"
cd "$BACKUP_DIR"

echo "📦 Đang tạo backup..."

# 1. Backup code (exclude node_modules, .next, etc.)
echo "   📁 Copying source code..."
cd ..
if [ "$IS_SERVER" = true ]; then
    # On server, copy from Docker container or current directory
    rsync -av --exclude='node_modules' \
             --exclude='.next' \
             --exclude='.git' \
             --exclude='backups' \
             --exclude='backup-*' \
             --exclude='*.log' \
             --exclude='.env.local' \
             --exclude='.env.production' \
             --exclude='.DS_Store' \
             --exclude='dist' \
             --exclude='coverage' \
             ./ "$BACKUP_DIR/code/" || {
        echo -e "${RED}❌ Lỗi khi copy code${NC}"
        exit 1
    }
else
    # On local, copy current directory
    rsync -av --exclude='node_modules' \
             --exclude='.next' \
             --exclude='.git' \
             --exclude='backups' \
             --exclude='backup-*' \
             --exclude='*.log' \
             --exclude='.env.local' \
             --exclude='.env.production' \
             --exclude='.DS_Store' \
             --exclude='dist' \
             --exclude='coverage' \
             ./mat-troi-tren-ban/ "$BACKUP_DIR/code/" || {
        echo -e "${RED}❌ Lỗi khi copy code${NC}"
        exit 1
    }
fi

# 2. Backup database
echo "   🗄️  Backing up database..."
cd "$BACKUP_DIR"
if [ "$IS_SERVER" = true ]; then
    # Detect docker compose command
    if docker compose version >/dev/null 2>&1; then
        DOCKER_COMPOSE="docker compose"
    elif docker-compose version >/dev/null 2>&1; then
        DOCKER_COMPOSE="docker-compose"
    else
        echo -e "${RED}❌ Docker Compose not found!${NC}"
        exit 1
    fi
    
    # Get database credentials from .env.production
    if [ -f "../.env.production" ]; then
        source ../.env.production
        POSTGRES_USER=${POSTGRES_USER:-mattroitrenban}
        POSTGRES_DB=${POSTGRES_DB:-mattroitrenban}
    else
        POSTGRES_USER="mattroitrenban"
        POSTGRES_DB="mattroitrenban"
    fi
    
    # Export database
    $DOCKER_COMPOSE exec -T postgres pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" > database.sql 2>/dev/null || {
        echo -e "${YELLOW}⚠${NC}  Không thể backup database từ Docker. Thử cách khác..."
        # Try alternative method
        CONTAINER_ID=$(docker ps | grep postgres | awk '{print $1}' | head -1)
        if [ -n "$CONTAINER_ID" ]; then
            docker exec "$CONTAINER_ID" pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" > database.sql || {
                echo -e "${RED}❌ Lỗi khi backup database${NC}"
                echo "   (Bỏ qua database backup và tiếp tục...)"
                touch database.sql
            }
        else
            echo -e "${YELLOW}⚠${NC}  Không tìm thấy PostgreSQL container"
            touch database.sql
        fi
    }
else
    echo -e "${YELLOW}⚠${NC}  Không thể backup database từ local (cần kết nối server)"
    touch database.sql
fi

# 3. Backup media files
echo "   🖼️  Backing up media files..."
if [ "$IS_SERVER" = true ]; then
    if [ -d "../media" ]; then
        cp -r ../media ./media 2>/dev/null || echo -e "${YELLOW}⚠${NC}  Không thể copy media folder"
    fi
    if [ -d "../public/media" ]; then
        mkdir -p ./public
        cp -r ../public/media ./public/media 2>/dev/null || echo -e "${YELLOW}⚠${NC}  Không thể copy public/media folder"
    fi
else
    if [ -d "../mat-troi-tren-ban/public/media" ]; then
        mkdir -p ./public
        cp -r ../mat-troi-tren-ban/public/media ./public/media 2>/dev/null || echo -e "${YELLOW}⚠${NC}  Không thể copy media folder"
    fi
fi

# 4. Create README for backup
cat > README.md << 'EOF'
# Full Backup từ Server Production

Backup này được tạo tự động từ server production.

## Cấu trúc:

- `code/` - Source code của ứng dụng
- `database.sql` - Database dump (PostgreSQL)
- `media/` hoặc `public/media/` - Media files đã upload
- `README.md` - File này

## Khôi phục:

1. Clone repository này
2. Restore database: `psql -U user -d database < database.sql`
3. Copy media files vào đúng vị trí
4. Cài đặt dependencies: `npm install`
5. Chạy migrations: `npx prisma migrate deploy`
6. Build và start: `npm run build && npm start`

## Lưu ý:

- File `.env` không được include trong backup vì lý do bảo mật
- Cần tạo file `.env.local` hoặc `.env.production` mới với thông tin phù hợp
- Database backup có thể lớn, cần đảm bảo có đủ dung lượng
EOF

echo "   ✅ Đã tạo README.md"

# 5. Initialize Git repository
echo "   🔄 Initializing Git repository..."
git init
git config user.name "Backup Script"
git config user.email "backup@mattroitrenban.vn"

# Create .gitignore
cat > .gitignore << 'EOF'
# Environment files
.env
.env.local
.env.production
.env*.local

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# Temporary files
*.tmp
*.temp
EOF

# Add all files
git add .
git commit -m "Full backup from production server - $(date '+%Y-%m-%d %H:%M:%S')"

# Add remote and push
echo "   📤 Pushing to Git repository..."
git remote add origin "$GIT_REPO_URL" 2>/dev/null || git remote set-url origin "$GIT_REPO_URL"
git branch -M main

echo ""
echo -e "${YELLOW}⚠${NC}  Bạn cần xác nhận push lên repository:"
echo "   Repository: $GIT_REPO_URL"
echo ""
read -p "Bạn có muốn push lên Git ngay bây giờ? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "   🔐 Đang push lên Git..."
    git push -u origin main --force || {
        echo -e "${RED}❌ Lỗi khi push lên Git${NC}"
        echo ""
        echo "Có thể repository chưa được tạo hoặc bạn chưa có quyền."
        echo "Hãy thử:"
        echo "  1. Tạo repository trên GitHub trước"
        echo "  2. Kiểm tra quyền truy cập"
        echo "  3. Chạy lại script này"
        exit 1
    }
    echo -e "${GREEN}✅ Đã push backup lên Git thành công!${NC}"
    echo ""
    echo "Repository: $GIT_REPO_URL"
else
    echo -e "${YELLOW}⚠${NC}  Backup đã được tạo nhưng chưa push lên Git."
    echo "   Để push sau, chạy:"
    echo "   cd $BACKUP_DIR"
    echo "   git push -u origin main"
fi

cd ..
echo ""
echo -e "${GREEN}✅ Backup hoàn tất!${NC}"
echo "   Backup location: $BACKUP_DIR"
echo "   Repository: $GIT_REPO_URL"

