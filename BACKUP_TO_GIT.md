# Hướng dẫn Backup từ Server Production lên Git

Script này sẽ tạo một bản backup đầy đủ từ server production và push lên repository Git mới.

## Repository mới:
**https://github.com/lichpppp5/webfinal.git**

## Cách sử dụng:

### Trên Server Production:

```bash
# 1. SSH vào server
ssh user@your-server-ip

# 2. Di chuyển vào thư mục project
cd /path/to/mattroitrenban

# 3. Pull script mới nhất (nếu chưa có)
git pull origin main

# 4. Chạy script backup
./backup-to-git.sh
```

### Trên Máy Local (nếu muốn backup từ local):

```bash
cd /Users/thanhlich/Desktop/finalwweb/mat-troi-tren-ban
./backup-to-git.sh
```

## Script sẽ backup:

1. ✅ **Source Code** - Toàn bộ code (exclude node_modules, .next, .git)
2. ✅ **Database** - PostgreSQL dump (database.sql)
3. ✅ **Media Files** - Tất cả file đã upload (/media, /public/media)
4. ✅ **README.md** - Hướng dẫn khôi phục

## Lưu ý:

- ⚠️ File `.env` và `.env.production` **KHÔNG** được backup (bảo mật)
- ⚠️ Repository mới sẽ bị **force push** (ghi đè hoàn toàn)
- ⚠️ Cần đảm bảo repository `webfinal` đã được tạo trên GitHub
- ⚠️ Cần có quyền push vào repository

## Khôi phục từ backup:

```bash
# 1. Clone repository
git clone https://github.com/lichpppp5/webfinal.git
cd webfinal

# 2. Restore database
psql -U postgres -d mattroitrenban < database.sql

# 3. Copy media files
cp -r public/media /path/to/project/public/

# 4. Cài đặt dependencies
npm install

# 5. Tạo file .env
cp .env.example .env.local
# Chỉnh sửa .env.local với thông tin phù hợp

# 6. Chạy migrations
npx prisma generate
npx prisma migrate deploy

# 7. Build và start
npm run build
npm start
```

## Troubleshooting:

### Lỗi: "Repository not found"
- Đảm bảo repository `webfinal` đã được tạo trên GitHub
- Kiểm tra quyền truy cập vào repository

### Lỗi: "Permission denied"
- Kiểm tra SSH key hoặc GitHub token
- Đảm bảo có quyền push vào repository

### Lỗi: "Database backup failed"
- Kiểm tra Docker container PostgreSQL đang chạy
- Kiểm tra credentials trong `.env.production`

## Tự động hóa:

Có thể thêm vào cron job để backup định kỳ:

```bash
# Backup hàng ngày lúc 2:00 AM
0 2 * * * cd /path/to/mattroitrenban && ./backup-to-git.sh
```

