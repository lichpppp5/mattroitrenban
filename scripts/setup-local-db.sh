#!/bin/bash

# Script để setup database local (SQLite)

echo "🗄️  Setting up local database (SQLite)..."

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local file..."
    cp env.example .env.local
    
    # Update DATABASE_URL for SQLite
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' 's|DATABASE_URL="postgresql://.*"|DATABASE_URL="file:./dev.db"|' .env.local
        sed -i '' 's|NEXTAUTH_URL="https://.*"|NEXTAUTH_URL="http://localhost:3000"|' .env.local
        sed -i '' 's|NEXT_PUBLIC_APP_URL="https://.*"|NEXT_PUBLIC_APP_URL="http://localhost:3000"|' .env.local
    else
        # Linux
        sed -i 's|DATABASE_URL="postgresql://.*"|DATABASE_URL="file:./dev.db"|' .env.local
        sed -i 's|NEXTAUTH_URL="https://.*"|NEXTAUTH_URL="http://localhost:3000"|' .env.local
        sed -i 's|NEXT_PUBLIC_APP_URL="https://.*"|NEXT_PUBLIC_APP_URL="http://localhost:3000"|' .env.local
    fi
    
    echo "✅ Created .env.local with SQLite configuration"
else
    echo "ℹ️  .env.local already exists, skipping..."
fi

# Update schema to use SQLite temporarily
echo "📝 Updating Prisma schema for SQLite..."
cp prisma/schema.prisma prisma/schema.prisma.backup

# Check OS and update schema
if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' 's/provider = "postgresql"/provider = "sqlite"/' prisma/schema.prisma
    sed -i '' 's/url      = env("DATABASE_URL")/url      = "file:.\/dev.db"/' prisma/schema.prisma
else
    sed -i 's/provider = "postgresql"/provider = "sqlite"/' prisma/schema.prisma
    sed -i 's/url      = env("DATABASE_URL")/url      = "file:.\/dev.db"/' prisma/schema.prisma
fi

# Update fields that SQLite doesn't support
# Replace @db.Text with nothing for SQLite
if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' 's/@db.Text//g' prisma/schema.prisma
else
    sed -i 's/@db.Text//g' prisma/schema.prisma
fi

echo "🚀 Running Prisma migrations..."
npx prisma migrate dev --name init_sqlite

echo "⚙️  Generating Prisma Client..."
npx prisma generate

echo "🌱 Seeding database..."
npm run db:seed

echo ""
echo "✅ Database setup complete!"
echo ""
echo "📊 To view your database:"
echo "   npx prisma studio"
echo ""
echo "🚀 To start dev server:"
echo "   npm run dev"
echo ""
echo "⚠️  Note: Schema has been temporarily updated for SQLite."
echo "   Original schema backed up to: prisma/schema.prisma.backup"

