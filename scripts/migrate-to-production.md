# 🔄 Hướng dẫn Migrate Database từ Dev sang Production

## Tình huống: Bạn đã có data trong database local/dev và muốn chuyển sang production

---

## Phương pháp 1: Dùng Prisma Migrate (Khuyên dùng)

### Bước 1: Backup Database Local
```bash
# Nếu dùng SQLite
cp prisma/dev.db prisma/backup_$(date +%Y%m%d).db

# Nếu dùng PostgreSQL
pg_dump -U postgres -d mattroitrenban > backup_$(date +%Y%m%d).sql
```

### Bước 2: Đảm bảo đã commit migrations
```bash
git add prisma/migrations
git commit -m "Database migrations"
git push
```

### Bước 3: Setup Production Database
1. Tạo production database (Supabase/NeonDB/VPS)
2. Cập nhật `DATABASE_URL` trong production environment

### Bước 4: Chạy Migrations trên Production
```bash
# Trên server production
npx prisma migrate deploy
```

### Bước 5: Migrate Data (nếu cần)

**Option A: Dùng Prisma Studio**
```bash
# Local
npx prisma studio
# Export data từng table

# Production  
npx prisma studio
# Import data từng table
```

**Option B: Dùng Script Export/Import**

---

## Phương pháp 2: Export/Import Data trực tiếp

### Từ SQLite Local → PostgreSQL Production

1. **Export data:**
```bash
# Install sqlite3 if needed
# macOS: brew install sqlite3

# Export to JSON
sqlite3 prisma/dev.db <<EOF
.mode json
.output data.json
SELECT json_group_array(json_object(
  'id', id,
  'title', title,
  'slug', slug,
  'content', content,
  'category', category
)) FROM Activity;
EOF
```

2. **Import vào PostgreSQL:**
```bash
# Tạo script import
node scripts/import-data.js
```

### Từ PostgreSQL Local → PostgreSQL Production

```bash
# Export
pg_dump -U postgres -d mattroitrenban --data-only --no-owner --no-privileges > data.sql

# Import (trên production server)
psql -h your-prod-host -U postgres -d mattroitrenban < data.sql
```

---

## Phương pháp 3: Dùng Supabase/NeonDB từ đầu (Easiest!)

Nếu bạn dùng cloud database ngay từ đầu:

1. **Setup Supabase/NeonDB cho local dev**
2. **Tạo database riêng cho production** (hoặc dùng branch khác)
3. **Chỉ cần thay DATABASE_URL** khi deploy
4. **Data đã sync tự động!**

---

## Script Helper: Export Data

Tạo file `scripts/export-data.ts`:

```typescript
import { PrismaClient } from '@prisma/client'
import fs from 'fs'

const prisma = new PrismaClient()

async function exportData() {
  const data = {
    users: await prisma.user.findMany(),
    activities: await prisma.activity.findMany(),
    donations: await prisma.donation.findMany(),
    expenses: await prisma.expense.findMany(),
    // ... other models
  }
  
  fs.writeFileSync('data-export.json', JSON.stringify(data, null, 2))
  console.log('✅ Data exported to data-export.json')
}

exportData()
```

---

## Script Helper: Import Data

Tạo file `scripts/import-data.ts`:

```typescript
import { PrismaClient } from '@prisma/client'
import fs from 'fs'

const prisma = new PrismaClient()

async function importData() {
  const data = JSON.parse(fs.readFileSync('data-export.json', 'utf-8'))
  
  // Import users
  for (const user of data.users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: user,
      create: user,
    })
  }
  
  // Import activities
  for (const activity of data.activities) {
    await prisma.activity.upsert({
      where: { slug: activity.slug },
      update: activity,
      create: activity,
    })
  }
  
  // ... other models
  
  console.log('✅ Data imported successfully')
}

importData()
```

---

## Checklist Migration

- [ ] Backup database local
- [ ] Commit migrations vào git
- [ ] Tạo production database
- [ ] Update DATABASE_URL trong production
- [ ] Chạy `npx prisma migrate deploy` trên production
- [ ] Import data nếu cần
- [ ] Test kết nối và functionality
- [ ] Update authentication settings

---

## Lưu ý quan trọng

1. **Passwords**: Users từ dev cần được hash lại với bcrypt trên production
2. **IDs**: Có thể conflict nếu import trực tiếp, dùng `upsert` thay vì `create`
3. **Relationships**: Đảm bảo import theo thứ tự đúng (Users trước, Activities sau)
4. **Media URLs**: Kiểm tra Cloudinary/CDN URLs vẫn valid trên production

