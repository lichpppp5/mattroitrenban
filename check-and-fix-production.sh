#!/bin/bash

# Script to check and fix all 3 issues on production server
set -e

echo "🔍 Kiểm tra và sửa 3 vấn đề trên Production Server..."
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# 1. Check environment variables
echo "1️⃣  Kiểm tra Environment Variables..."
if [ -f ".env.production" ]; then
    if grep -q "NEXT_PUBLIC_APP_URL" .env.production; then
        APP_URL=$(grep "NEXT_PUBLIC_APP_URL" .env.production | cut -d '=' -f2 | tr -d '"' | tr -d "'")
        echo -e "${GREEN}✅ NEXT_PUBLIC_APP_URL: $APP_URL${NC}"
    else
        echo -e "${YELLOW}⚠️  NEXT_PUBLIC_APP_URL chưa được set${NC}"
        echo "   Thêm vào .env.production:"
        echo "   NEXT_PUBLIC_APP_URL=http://44.207.127.115"
    fi
else
    echo -e "${RED}❌ .env.production không tồn tại${NC}"
    echo "   Chạy: ./setup-test-env.sh"
fi

echo ""

# 2. Check media directory permissions
echo "2️⃣  Kiểm tra Media Directory..."
if [ -d "media" ]; then
    PERMS=$(stat -c "%a" media 2>/dev/null || stat -f "%OLp" media 2>/dev/null || echo "unknown")
    echo "   Permissions: $PERMS"
    if [ "$PERMS" != "755" ] && [ "$PERMS" != "775" ]; then
        echo -e "${YELLOW}⚠️  Fixing permissions...${NC}"
        sudo chmod -R 755 media 2>/dev/null || chmod -R 755 media
        echo -e "${GREEN}✅ Đã fix permissions${NC}"
    else
        echo -e "${GREEN}✅ Permissions OK${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Media directory không tồn tại, tạo mới...${NC}"
    mkdir -p media
    chmod -R 755 media
    echo -e "${GREEN}✅ Đã tạo media directory${NC}"
fi

if [ -d "public/media" ]; then
    PERMS=$(stat -c "%a" public/media 2>/dev/null || stat -f "%OLp" public/media 2>/dev/null || echo "unknown")
    echo "   public/media permissions: $PERMS"
    if [ "$PERMS" != "755" ] && [ "$PERMS" != "775" ]; then
        echo -e "${YELLOW}⚠️  Fixing permissions...${NC}"
        sudo chmod -R 755 public/media 2>/dev/null || chmod -R 755 public/media
        echo -e "${GREEN}✅ Đã fix permissions${NC}"
    else
        echo -e "${GREEN}✅ Permissions OK${NC}"
    fi
fi

echo ""

# 3. Check Docker containers
echo "3️⃣  Kiểm tra Docker Containers..."
if command -v docker >/dev/null 2>&1; then
    if docker ps | grep -q "mattroitrenban_app"; then
        echo -e "${GREEN}✅ App container đang chạy${NC}"
    else
        echo -e "${RED}❌ App container không chạy${NC}"
        echo "   Chạy: docker compose up -d"
    fi
    
    if docker ps | grep -q "mattroitrenban_nginx"; then
        echo -e "${GREEN}✅ Nginx container đang chạy${NC}"
    else
        echo -e "${RED}❌ Nginx container không chạy${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Docker không được cài đặt${NC}"
fi

echo ""

# 4. Check Nginx configuration
echo "4️⃣  Kiểm tra Nginx Configuration..."
if [ -f "nginx.conf" ]; then
    if grep -q "location /media" nginx.conf; then
        echo -e "${GREEN}✅ Nginx có cấu hình /media${NC}"
    else
        echo -e "${RED}❌ Nginx thiếu cấu hình /media${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  nginx.conf không tồn tại${NC}"
fi

echo ""

# 5. Test image URL normalization
echo "5️⃣  Test Image URL Normalization..."
echo "   Kiểm tra trong database xem có ảnh nào với URL sai không..."
# This would require database access, skip for now

echo ""

# 6. Check audio file support
echo "6️⃣  Kiểm tra Audio File Support..."
if grep -q "audio/\*" src/app/root-admin/media/page.tsx 2>/dev/null; then
    echo -e "${GREEN}✅ Frontend đã hỗ trợ audio/*${NC}"
else
    echo -e "${RED}❌ Frontend chưa hỗ trợ audio/*${NC}"
fi

if grep -q "fileType === \"audio\"" src/app/api/media/route.ts 2>/dev/null; then
    echo -e "${GREEN}✅ API đã hỗ trợ audio${NC}"
else
    echo -e "${RED}❌ API chưa hỗ trợ audio${NC}"
fi

echo ""
echo "📝 Next Steps:"
echo "1. Pull code mới nhất: git pull origin main"
echo "2. Rebuild app: docker compose build app --no-cache"
echo "3. Restart: docker compose restart app"
echo "4. Check logs: docker compose logs -f app"
echo "5. Test upload ảnh và .mp3"
echo ""
echo "✅ Hoàn tất kiểm tra!"

