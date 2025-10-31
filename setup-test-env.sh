#!/bin/bash

# Setup test environment với IP và password đơn giản
set -e

echo "🔧 Setting up test environment for IP: 44.207.127.115"

# Create .env.production if not exists
if [ ! -f .env.production ]; then
    cat > .env.production << 'EOF'
# ============================================
# PRODUCTION ENVIRONMENT VARIABLES
# ============================================
# Configuration for testing on IP: 44.207.127.115

# ============================================
# Database Configuration
# ============================================
POSTGRES_USER=mattroitrenban
POSTGRES_PASSWORD=mattroitrenban
POSTGRES_DB=mattroitrendb

# Database URL (use 'postgres' as hostname in Docker)
DATABASE_URL=postgresql://mattroitrenban:mattroitrenban@postgres:5432/mattroitrendb?schema=public

# ============================================
# NextAuth Configuration
# ============================================
# For testing, using simple secret
NEXTAUTH_SECRET=mattroitrenban_secret_key_production_2025_change_this
NEXTAUTH_URL=http://44.207.127.115

# ============================================
# Cloudinary (Optional - for image uploads)
# ============================================
# If not using Cloudinary, files will be saved locally in /uploads
CLOUDINARY_URL=
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=

# ============================================
# Email Configuration (Optional)
# ============================================
RESEND_API_KEY=
EMAIL_FROM=noreply@mattroitrenban.vn

# ============================================
# App Configuration
# ============================================
NEXT_PUBLIC_APP_NAME=Mặt Trời Trên Bản
NEXT_PUBLIC_APP_URL=http://44.207.127.115
EOF
    echo "✅ Created .env.production"
else
    echo "⚠️  .env.production already exists, skipping..."
fi

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p uploads
mkdir -p ssl
mkdir -p logs
mkdir -p backups

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "  1. Review .env.production if needed"
echo "  2. Run: ./deploy.sh"
echo ""
echo "🌐 After deployment, website will be available at:"
echo "  http://44.207.127.115"
echo ""
echo "🔐 Default credentials:"
echo "  Database user: mattroitrenban"
echo "  Database password: mattroitrenban"
echo "  Admin email: admin@mattroitrenban.vn"
echo "  Admin password: admin123"

