# 🗄️ Hướng dẫn Setup Database

## Tổng quan

Bạn có thể tạo database ngay tại máy local để phát triển và test, sau đó chuyển sang server production khi deploy. Có 2 cách chính:

### Cách 1: SQLite (Đơn giản nhất - Khuyên dùng cho local dev)
- ✅ Dễ setup, không cần cài PostgreSQL
- ✅ Database lưu trong file `.db`
- ✅ Dễ backup: copy file `.db`
- ❌ Không thể migrate trực tiếp sang PostgreSQL production

### Cách 2: PostgreSQL Local (Khuyên dùng)
- ✅ Cùng loại với production
- ✅ Dễ migrate data sang production
- ✅ Hỗ trợ tất cả features
- ❌ Cần cài PostgreSQL

### Cách 3: Cloud Database ngay từ đầu (Easiest - Khuyên dùng nhất!)
- ✅ Supabase/NeonDB - Database cloud free
- ✅ Dùng được ngay cả local và production
- ✅ Tự động backup
- ✅ Dễ sync giữa dev và production

---

## 🚀 CÁCH 1: SQLite (Nhanh nhất để bắt đầu)

### Bước 1: Cập nhật Schema
```bash
# Thay đổi provider trong prisma/schema.prisma
# Từ: provider = "postgresql"
# Thành: provider = "sqlite"
```

### Bước 2: Tạo Database
```bash
npx prisma migrate dev --name init
npx prisma generate
```

### Bước 3: Seed Data (Tùy chọn)
```bash
npm run db:seed
```

### Bước 4: Chạy Dev Server
```bash
npm run dev
```

**Lưu ý:** Khi deploy production, bạn cần:
1. Export data từ SQLite
2. Import vào PostgreSQL production

---

## 🐘 CÁCH 2: PostgreSQL Local

### Bước 1: Cài PostgreSQL

**macOS:**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Hoặc dùng Docker:**
```bash
docker run --name postgres-mattroitrenban \
  -e POSTGRES_PASSWORD=password123 \
  -e POSTGRES_DB=mattroitrenban \
  -p 5432:5432 \
  -d postgres:14
```

### Bước 2: Tạo Database URL
Tạo file `.env.local`:
```env
DATABASE_URL="postgresql://postgres:password123@localhost:5432/mattroitrenban?schema=public"
```

### Bước 3: Setup Database
```bash
npx prisma migrate dev --name init
npx prisma generate
npm run db:seed
```

### Bước 4: Chạy Dev Server
```bash
npm run dev
```

---

## ☁️ CÁCH 3: Cloud Database (Supabase/NeonDB) - KHUYÊN DÙNG

### Option A: Supabase (Free tier: 500MB, tốt cho production)

1. **Tạo tài khoản:** https://supabase.com
2. **Tạo project mới**
3. **Lấy Database URL:**
   - Settings → Database → Connection String
   - Copy "URI" format

4. **Cập nhật `.env.local`:**
```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
```

5. **Setup:**
```bash
npx prisma migrate dev --name init
npx prisma generate
npm run db:seed
```

### Option B: NeonDB (Free tier: 1GB, tốt cho production)

1. **Tạo tài khoản:** https://neon.tech
2. **Tạo project mới**
3. **Lấy Connection String**
4. **Cập nhật `.env.local`**
5. **Setup tương tự Supabase**

---

## 🔄 Migrate Data từ Dev sang Production

### Phương pháp 1: Prisma Migrate (Khuyên dùng)

**Dev (local):**
```bash
# Tạo migration
npx prisma migrate dev --name add_feature

# Commit migration files vào git
git add prisma/migrations
git commit -m "Add database migration"
```

**Production:**
```bash
# Deploy code lên server
# Chạy migration
npx prisma migrate deploy
```

### Phương pháp 2: Export/Import Data

**Export từ SQLite/PostgreSQL local:**
```bash
# Nếu dùng SQLite
sqlite3 prisma/dev.db .dump > backup.sql

# Nếu dùng PostgreSQL
pg_dump -U postgres -d mattroitrenban > backup.sql
```

**Import vào Production:**
```bash
# PostgreSQL production
psql -U postgres -d mattroitrenban_prod < backup.sql
```

### Phương pháp 3: Prisma Studio (Manual Sync)

1. **Mở Prisma Studio local:**
```bash
npx prisma studio
```

2. **Export data từng table:**
   - Click vào từng model
   - Copy data (JSON format)

3. **Import vào production:**
   - Mở Prisma Studio trên production
   - Paste data và save

---

## 📦 Backup Database

### SQLite
```bash
# Backup
cp prisma/dev.db prisma/backup_$(date +%Y%m%d).db

# Restore
cp prisma/backup_20241201.db prisma/dev.db
```

### PostgreSQL
```bash
# Backup
pg_dump -U postgres -d mattroitrenban > backup_$(date +%Y%m%d).sql

# Restore
psql -U postgres -d mattroitrenban < backup_20241201.sql
```

### Supabase/NeonDB
- Tự động backup hàng ngày
- Có thể manual backup từ dashboard

---

## 🔐 Environment Variables

Tạo file `.env.local` với nội dung:

```env
# Database (chọn 1 trong 3)
DATABASE_URL="file:./dev.db"  # SQLite
# DATABASE_URL="postgresql://user:pass@localhost:5432/db"  # PostgreSQL local
# DATABASE_URL="postgresql://postgres:xxx@db.supabase.co:5432/postgres"  # Supabase

# NextAuth
NEXTAUTH_SECRET="your-secret-key-min-32-chars-long-random-string"
NEXTAUTH_URL="http://localhost:3000"

# App
NEXT_PUBLIC_APP_NAME="Mặt Trời Trên Bản"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Cloudinary (optional)
CLOUDINARY_URL="cloudinary://..."
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="..."

# Email (optional)
RESEND_API_KEY="..."
EMAIL_FROM="noreply@mattroitrenban.vn"
```

---

## ✅ Checklist

- [ ] Chọn phương pháp database (SQLite/PostgreSQL/Supabase)
- [ ] Tạo `.env.local` với DATABASE_URL
- [ ] Chạy `npx prisma migrate dev --name init`
- [ ] Chạy `npx prisma generate`
- [ ] Chạy `npm run db:seed` (tạo user admin mặc định)
- [ ] Test kết nối: `npm run dev`
- [ ] Đăng nhập admin với credentials trong seed file

---

## 🚀 Khi Deploy Production

1. **Tạo production database** (Supabase/NeonDB/VPS PostgreSQL)
2. **Cập nhật DATABASE_URL** trong production environment
3. **Chạy migrations:**
   ```bash
   npx prisma migrate deploy
   ```
4. **Seed data nếu cần:**
   ```bash
   npm run db:seed
   ```

---

## 💡 Khuyến nghị

**Cho Development:**
- Dùng **SQLite** nếu muốn nhanh, không muốn setup PostgreSQL
- Dùng **Supabase/NeonDB** nếu muốn sync dễ với production

**Cho Production:**
- Dùng **Supabase** hoặc **NeonDB** (free tier đủ dùng)
- Hoặc **PostgreSQL trên VPS** nếu có infrastructure riêng

**Workflow đề xuất:**
1. Dev: SQLite (nhanh)
2. Staging: Supabase free tier
3. Production: Supabase hoặc upgrade plan

---

## 🆘 Troubleshooting

**Lỗi: "Environment variable not found: DATABASE_URL"**
→ Tạo file `.env.local` với DATABASE_URL

**Lỗi: "Can't reach database server"**
→ Kiểm tra PostgreSQL đã chạy chưa
→ Kiểm tra connection string đúng chưa

**Lỗi: "Migration failed"**
→ Xóa folder `prisma/migrations` và chạy lại
→ Hoặc reset database: `npx prisma migrate reset`

