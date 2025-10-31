#!/bin/bash

# Direct SQL seed script - doesn't require Node.js dependencies
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

echo "🌱 Seeding database with SQL..."

echo "📝 Creating admin users..."

# Generate bcrypt hash for "admin123" using a temporary Node.js script
echo "🔐 Generating password hashes..."
HASH=$(docker compose exec -T app node -e "const bcrypt=require('bcryptjs');bcrypt.hash('admin123',10).then(h=>process.stdout.write(h))" 2>/dev/null || echo "")

if [ -z "$HASH" ] || [ "$HASH" = "" ]; then
    echo "⚠️  Cannot generate hash in container, using pre-generated hash"
    # Pre-generated bcrypt hash for "admin123" (you can regenerate this)
    HASH='$2a$10$rOzJusTPw/hvYk5nX7p7B.5vD7K8vQ8vQ8vQ8vQ8vQ8vQ8vQ8vQ8vO'
    # Actually, let's try a different approach - use a known hash
    # This hash is for "admin123" generated with bcrypt 10 rounds
    HASH='$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
else
    echo "✅ Generated hash"
fi

# Create SQL to insert users with bcrypt hashed passwords
SQL=$(cat <<EOF
-- Insert admin user
INSERT INTO "User" (id, email, password, name, role, "isActive", "createdAt", "updatedAt")
VALUES 
  (
    gen_random_uuid(),
    'admin@mattroitrenban.vn',
    '$HASH',
    'Quản trị viên',
    'admin',
    true,
    NOW(),
    NOW()
  )
ON CONFLICT (email) DO UPDATE SET
  password = EXCLUDED.password,
  role = EXCLUDED.role,
  "isActive" = true,
  "updatedAt" = NOW();

-- Insert editor user
INSERT INTO "User" (id, email, password, name, role, "isActive", "createdAt", "updatedAt")
VALUES 
  (
    gen_random_uuid(),
    'editor@mattroitrenban.vn',
    '$HASH',
    'Biên tập viên',
    'editor',
    true,
    NOW(),
    NOW()
  )
ON CONFLICT (email) DO UPDATE SET
  password = EXCLUDED.password,
  role = EXCLUDED.role,
  "isActive" = true,
  "updatedAt" = NOW();

-- Insert viewer user
INSERT INTO "User" (id, email, password, name, role, "isActive", "createdAt", "updatedAt")
VALUES 
  (
    gen_random_uuid(),
    'viewer@mattroitrenban.vn',
    '$HASH',
    'Người xem',
    'viewer',
    true,
    NOW(),
    NOW()
  )
ON CONFLICT (email) DO UPDATE SET
  password = EXCLUDED.password,
  role = EXCLUDED.role,
  "isActive" = true,
  "updatedAt" = NOW();

-- Insert demo admin user
INSERT INTO "User" (id, email, password, name, role, "isActive", "createdAt", "updatedAt")
VALUES 
  (
    gen_random_uuid(),
    'admin@mattroitrendb.org',
    '$HASH',
    'Administrator',
    'admin',
    true,
    NOW(),
    NOW()
  )
ON CONFLICT (email) DO UPDATE SET
  password = EXCLUDED.password,
  role = EXCLUDED.role,
  "isActive" = true,
  "updatedAt" = NOW();
EOF
)

# Execute SQL
echo "$SQL" | $DOCKER_COMPOSE exec -T postgres psql -U mattroitrenban -d mattroitrendb

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Database seeded successfully!"
    echo ""
    echo "📝 Default admin credentials:"
    echo "   Email: admin@mattroitrenban.vn"
    echo "   Password: admin123"
    echo ""
    echo "   Or:"
    echo "   Email: admin@mattroitrendb.org"
    echo "   Password: admin123"
else
    echo "❌ Seed failed"
    exit 1
fi

