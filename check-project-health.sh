#!/bin/bash

# Script toàn diện kiểm tra sức khỏe dự án

echo "🔍 Comprehensive Project Health Check"
echo "======================================"
echo ""

cd /mattroitrenban 2>/dev/null || cd "$(dirname "$0")" || exit 1

# 1. Check Git status
echo "📦 1. Checking Git status..."
if [ -d ".git" ]; then
    git status --short | head -5
    echo "   Latest commits:"
    git log --oneline -3
else
    echo "   ⚠️  Not a git repository"
fi
echo ""

# 2. Check key files
echo "📁 2. Checking key files..."
FILES=(
    "package.json"
    "prisma/schema.prisma"
    "next.config.ts"
    "docker-compose.yml"
    "Dockerfile"
    "src/app/layout.tsx"
    "src/lib/prisma.ts"
    "src/lib/auth.ts"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "   ✅ $file"
    else
        echo "   ❌ Missing: $file"
    fi
done
echo ""

# 3. Check TypeScript compilation
echo "🔧 3. Checking TypeScript compilation..."
if command -v npx >/dev/null 2>&1; then
    npx tsc --noEmit 2>&1 | head -20 || echo "   ⚠️  TypeScript check failed"
else
    echo "   ⚠️  npx not available"
fi
echo ""

# 4. Check Prisma schema
echo "🗄️  4. Checking Prisma schema..."
if [ -f "prisma/schema.prisma" ]; then
    if grep -q "model Activity" prisma/schema.prisma; then
        echo "   ✅ Activity model found"
    else
        echo "   ❌ Activity model missing"
    fi
    
    if grep -q "model User" prisma/schema.prisma; then
        echo "   ✅ User model found"
    else
        echo "   ❌ User model missing"
    fi
    
    if grep -q "model SiteContent" prisma/schema.prisma; then
        echo "   ✅ SiteContent model found"
    else
        echo "   ❌ SiteContent model missing"
    fi
else
    echo "   ❌ prisma/schema.prisma not found"
fi
echo ""

# 5. Check Docker setup
echo "🐳 5. Checking Docker setup..."
if [ -f "docker-compose.yml" ]; then
    if grep -q "postgres:" docker-compose.yml; then
        echo "   ✅ PostgreSQL service configured"
    else
        echo "   ❌ PostgreSQL service missing"
    fi
    
    if grep -q "app:" docker-compose.yml; then
        echo "   ✅ App service configured"
    else
        echo "   ❌ App service missing"
    fi
    
    if grep -q "nginx:" docker-compose.yml; then
        echo "   ✅ Nginx service configured"
    else
        echo "   ❌ Nginx service missing"
    fi
else
    echo "   ❌ docker-compose.yml not found"
fi
echo ""

# 6. Check API routes structure
echo "🌐 6. Checking API routes..."
API_ROUTES=(
    "src/app/api/activities/route.ts"
    "src/app/api/content/route.ts"
    "src/app/api/media/route.ts"
    "src/app/api/team/route.ts"
    "src/app/api/revalidate/route.ts"
)

for route in "${API_ROUTES[@]}"; do
    if [ -f "$route" ]; then
        echo "   ✅ $(basename $(dirname $route))/$(basename $route)"
    else
        echo "   ❌ Missing: $route"
    fi
done
echo ""

# 7. Check components
echo "🧩 7. Checking components..."
COMPONENTS=(
    "src/components/navigation.tsx"
    "src/components/footer.tsx"
    "src/components/admin-layout.tsx"
    "src/components/background-music.tsx"
    "src/components/conditional-layout.tsx"
)

for comp in "${COMPONENTS[@]}"; do
    if [ -f "$comp" ]; then
        echo "   ✅ $(basename $comp)"
    else
        echo "   ❌ Missing: $comp"
    fi
done
echo ""

# 8. Check for common issues
echo "⚠️  8. Checking for common issues..."

# Check for hardcoded URLs
if grep -r "localhost:3000" src/ --include="*.tsx" --include="*.ts" 2>/dev/null | grep -v "NEXT_PUBLIC_APP_URL" | head -3; then
    echo "   ⚠️  Found hardcoded localhost URLs (should use env vars)"
else
    echo "   ✅ No hardcoded localhost URLs found"
fi

# Check for missing error handling
if grep -r "await prisma" src/app/api --include="*.ts" 2>/dev/null | grep -v "try {" | head -3; then
    echo "   ⚠️  Some Prisma calls may lack error handling"
else
    echo "   ✅ Prisma calls have error handling"
fi

echo ""

# 9. Check environment variables
echo "🔐 9. Checking environment variables..."
if [ -f ".env.production" ] || [ -f ".env.local" ]; then
    echo "   ✅ Environment file exists"
    if [ -f ".env.production" ]; then
        if grep -q "DATABASE_URL" .env.production; then
            echo "   ✅ DATABASE_URL configured"
        else
            echo "   ⚠️  DATABASE_URL not found in .env.production"
        fi
        
        if grep -q "NEXTAUTH_SECRET" .env.production; then
            echo "   ✅ NEXTAUTH_SECRET configured"
        else
            echo "   ⚠️  NEXTAUTH_SECRET not found"
        fi
    fi
else
    echo "   ⚠️  No .env file found"
fi
echo ""

# 10. Check Docker containers (if running)
echo "🐳 10. Checking Docker containers..."
if command -v docker >/dev/null 2>&1; then
    if docker ps 2>/dev/null | grep -q "mattroitrenban"; then
        echo "   ✅ Docker containers are running"
        docker ps --format "table {{.Names}}\t{{.Status}}" | grep mattroitrenban
    else
        echo "   ℹ️  Docker containers not running (normal if not deployed)"
    fi
else
    echo "   ℹ️  Docker not available"
fi
echo ""

echo "✅ Health check complete!"
echo ""
echo "📝 Next steps if issues found:"
echo "   1. Fix TypeScript errors: npx tsc --noEmit"
echo "   2. Check database connection: ./check-database.sh"
echo "   3. Rebuild: docker compose build app --no-cache"
echo "   4. Check logs: docker compose logs app"

