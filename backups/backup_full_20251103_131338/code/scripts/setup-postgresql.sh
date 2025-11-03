#!/bin/bash

# Script để setup PostgreSQL database cho project

set -e

echo "🗄️  Setting up PostgreSQL database for Mặt Trời Trên Bản..."

# Database configuration
DB_NAME="mattroitrenban"
DB_USER="${USER}"  # Use current system user
DB_PASSWORD=""
DB_HOST="localhost"
DB_PORT="5432"

# Check if PostgreSQL is running
if ! pg_isready -h ${DB_HOST} -p ${DB_PORT} > /dev/null 2>&1; then
    echo "⚠️  PostgreSQL is not running. Starting it..."
    
    # Try to start with brew services
    if command -v brew &> /dev/null; then
        if brew list postgresql@14 &> /dev/null; then
            brew services start postgresql@14
        elif brew list postgresql &> /dev/null; then
            brew services start postgresql
        fi
        
        echo "⏳ Waiting for PostgreSQL to start..."
        sleep 3
    else
        echo "❌ Please start PostgreSQL manually"
        exit 1
    fi
fi

# Check connection
if ! pg_isready -h ${DB_HOST} -p ${DB_PORT} > /dev/null 2>&1; then
    echo "❌ Cannot connect to PostgreSQL. Please check your setup."
    exit 1
fi

echo "✅ PostgreSQL is running"

# Create database if it doesn't exist
echo "📝 Creating database '${DB_NAME}' if it doesn't exist..."
psql -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d postgres -tc "SELECT 1 FROM pg_database WHERE datname = '${DB_NAME}'" | grep -q 1 || \
psql -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d postgres -c "CREATE DATABASE ${DB_NAME};"

echo "✅ Database '${DB_NAME}' is ready"

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local file..."
    cat > .env.local << EOF
# Database - PostgreSQL Local
DATABASE_URL="postgresql://${DB_USER}@${DB_HOST}:${DB_PORT}/${DB_NAME}?schema=public"

# NextAuth
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
NEXTAUTH_URL="http://localhost:3000"

# App Configuration
NEXT_PUBLIC_APP_NAME="Mặt Trời Trên Bản"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Cloudinary (Optional)
CLOUDINARY_URL=""
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=""

# Email (Optional)
RESEND_API_KEY=""
EMAIL_FROM="noreply@mattroitrenban.vn"
EOF
    
    echo "✅ Created .env.local with PostgreSQL configuration"
    echo "📌 DATABASE_URL: postgresql://${DB_USER}@${DB_HOST}:${DB_PORT}/${DB_NAME}?schema=public"
else
    echo "ℹ️  .env.local already exists"
    echo "📌 Please update DATABASE_URL to: postgresql://${DB_USER}@${DB_HOST}:${DB_PORT}/${DB_NAME}?schema=public"
fi

echo ""
echo "✅ PostgreSQL setup complete!"
echo ""
echo "📊 Next steps:"
echo "   1. Run migrations: npx prisma migrate dev --name init"
echo "   2. Generate Prisma client: npx prisma generate"
echo "   3. Seed database: npm run db:seed"
echo "   4. Start dev server: npm run dev"
echo ""

