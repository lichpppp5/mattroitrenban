# 📥 Hướng dẫn tải backup từ server về máy local

## Phương pháp 1: Tự động (Script - Khuyến nghị)

### Bước 1: Chuẩn bị SSH key (nếu chưa có)

```bash
# Tạo SSH key (nếu chưa có)
ssh-keygen -t rsa -b 4096

# Copy key lên server (sẽ yêu cầu nhập password)
ssh-copy-id root@44.207.127.115
```

### Bước 2: Chạy script download

Trên máy local của bạn:

```bash
cd /Users/thanhlich/Desktop/finalwweb/mat-troi-tren-ban
chmod +x backup-from-server.sh
./backup-from-server.sh
```

Script sẽ:
1. ✅ Kết nối đến server
2. ✅ Chạy backup-full.sh trên server
3. ✅ Tải backup về máy local
4. ✅ Lưu vào thư mục `server_backups/`

---

## Phương pháp 2: Thủ công (Step by step)

### Bước 1: Tạo backup trên server

SSH vào server và chạy backup:

```bash
ssh root@44.207.127.115
cd /mattroitrenban
git pull origin main  # Đảm bảo có script mới nhất
chmod +x backup-full.sh
./backup-full.sh
```

### Bước 2: Xem danh sách backup

```bash
ls -lh /mattroitrenban/backups/backup_full_*.tar.gz
```

Chọn file backup mới nhất (ví dụ: `backup_full_20251103_131338.tar.gz`)

### Bước 3: Download về máy local

Từ máy local của bạn:

```bash
# Tạo thư mục lưu backup
mkdir -p ~/Desktop/finalwweb/mat-troi-tren-ban/server_backups

# Download backup
scp root@44.207.127.115:/mattroitrenban/backups/backup_full_*.tar.gz \
   ~/Desktop/finalwweb/mat-troi-tren-ban/server_backups/
```

Hoặc download file cụ thể:

```bash
scp root@44.207.127.115:/mattroitrenban/backups/backup_full_20251103_131338.tar.gz \
   ~/Desktop/finalwweb/mat-troi-tren-ban/server_backups/
```

---

## Phương pháp 3: Dùng rsync (Nếu cần sync nhiều lần)

```bash
# Sync toàn bộ thư mục backups từ server về local
rsync -avz --progress \
  root@44.207.127.115:/mattroitrenban/backups/ \
  ~/Desktop/finalwweb/mat-troi-tren-ban/server_backups/
```

---

## Nội dung backup bao gồm:

### ✅ Code
- Toàn bộ source code (không có node_modules, .next)
- Tất cả file config, scripts

### ✅ Database
- PostgreSQL dump (file `.sql.gz`)
- Bao gồm tất cả tables, data, users

### ✅ Uploads
- Tất cả file đã upload (images, documents, etc.)
- Thư mục `public/uploads/`

### ✅ Configuration
- `.env.production` (⚠️ chứa passwords, secrets)
- `docker-compose.yml`
- `nginx.conf`
- Các file config khác

### ✅ SSL Certificates
- SSL certificates (nếu có)
- Private keys (⚠️ rất nhạy cảm)

### ✅ Metadata
- File `BACKUP_INFO.txt` với thông tin chi tiết
- Hướng dẫn restore

---

## Giải nén và xem backup

```bash
cd server_backups
tar -xzf backup_full_YYYYMMDD_HHMMSS.tar.gz
cd backup_full_YYYYMMDD_HHMMSS
ls -la
```

Cấu trúc sau khi giải nén:
```
backup_full_YYYYMMDD_HHMMSS/
├── code/              # Source code
├── database_*.sql.gz  # Database dump
├── uploads/           # Uploaded files
├── config/            # Configuration files
├── ssl/               # SSL certificates (nếu có)
└── BACKUP_INFO.txt    # Thông tin backup
```

---

## Lưu ý bảo mật

### ⚠️ Dữ liệu nhạy cảm trong backup:

1. **`.env.production`**: Chứa:
   - Database passwords
   - NEXTAUTH_SECRET
   - API keys
   - Các secrets khác

2. **SSL certificates** (nếu có):
   - Private keys
   - Full certificates

### 🔒 Khuyến nghị:

1. **Mã hóa backup** nếu lưu trữ bên ngoài:
   ```bash
   # Encrypt backup file
   gpg --symmetric --cipher-algo AES256 backup_full_*.tar.gz
   ```

2. **Lưu ở nơi an toàn**:
   - Local machine (đã an toàn)
   - Encrypted cloud storage (Dropbox, Google Drive với encryption)
   - External encrypted drive

3. **Không chia sẻ** backup files với người khác

4. **Xóa** backup cũ nếu không cần thiết

---

## Kiểm tra backup đã tải về

```bash
cd server_backups
tar -tzf backup_full_*.tar.gz | head -20  # Xem danh sách files
tar -xzf backup_full_*.tar.gz            # Giải nén
cat backup_full_*/BACKUP_INFO.txt         # Xem thông tin
```

---

## Restore từ backup (nếu cần)

Xem file `BACKUP_INFO.txt` trong backup để có hướng dẫn chi tiết, hoặc:

```bash
# 1. Giải nén
tar -xzf backup_full_*.tar.gz

# 2. Restore database
gunzip -c backup_full_*/database_*.sql.gz | \
  docker compose exec -T postgres psql -U mattroitrenban -d mattroitrendb

# 3. Restore uploads
cp -r backup_full_*/uploads/* ./uploads/

# 4. Restore config (cẩn thận với .env files)
cp backup_full_*/config/.env.production .env.production
```

---

## Troubleshooting

### Lỗi SSH connection

```bash
# Test SSH connection
ssh root@44.207.127.115

# Nếu cần password mỗi lần, setup SSH key:
ssh-copy-id root@44.207.127.115
```

### Lỗi permission

```bash
# Kiểm tra quyền trên server
ssh root@44.207.127.115 "ls -la /mattroitrenban/backups/"
```

### Backup quá lớn

Nếu backup lớn, có thể chia nhỏ:

```bash
# Split backup thành các file nhỏ hơn
split -b 500M backup_full_*.tar.gz backup_full_.tar.gz.part

# Download từng part
scp root@44.207.127.115:/mattroitrenban/backups/backup_full_.tar.gz.part* ./

# Merge lại
cat backup_full_.tar.gz.part* > backup_full_*.tar.gz
```

---

## Quick Reference

```bash
# Tạo và download backup tự động
./backup-from-server.sh

# Hoặc thủ công:
ssh root@44.207.127.115 "cd /mattroitrenban && ./backup-full.sh"
scp root@44.207.127.115:/mattroitrenban/backups/backup_full_*.tar.gz ./server_backups/
```

