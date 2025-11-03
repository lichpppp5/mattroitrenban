# 🚀 Deploy Test trên IP: 44.207.127.115

Hướng dẫn nhanh để deploy lên server test với IP public.

## ⚡ Quick Start (3 bước)

### Bước 1: Setup môi trường

```bash
# Chạy script setup tự động
chmod +x setup-test-env.sh
./setup-test-env.sh
```

Script này sẽ tạo file `.env.production` với cấu hình sẵn:
- Database user/password: `mattroitrenban`
- IP: `44.207.127.115`
- HTTP (chưa có SSL)

### Bước 2: Deploy

```bash
chmod +x deploy.sh
./deploy.sh
```

### Bước 3: Kiểm tra

```bash
# Check containers
docker-compose ps

# Check logs
docker-compose logs -f app

# Test website
curl http://44.207.127.115
# hoặc mở browser: http://44.207.127.115
```

## 🔐 Thông tin đăng nhập

### Admin Panel
- URL: http://44.207.127.115/root-admin/login
- Email: `admin@mattroitrenban.vn`
- Password: `admin123`

### Database (nếu cần truy cập trực tiếp)
- Host: `postgres` (trong Docker) hoặc `localhost:5432` (từ server)
- User: `mattroitrenban`
- Password: `mattroitrenban`
- Database: `mattroitrendb`

## 📊 Kiểm tra sau khi deploy

1. **Website chạy:** http://44.207.127.115
2. **Admin login:** http://44.207.127.115/root-admin/login
3. **Database connection:** Container postgres running
4. **Upload files:** Thử upload ở `/admin/media`

## 🔧 Lệnh thường dùng

```bash
# Xem logs
docker-compose logs -f app

# Restart app
docker-compose restart app

# Restart tất cả
docker-compose restart

# Stop tất cả
docker-compose down

# Backup database
./backup.sh

# Database shell
docker-compose exec postgres psql -U mattroitrenban -d mattroitrendb
```

## ⚠️ Lưu ý

1. **Security:** Đây là config cho TEST. Khi chuyển sang production:
   - Đổi password database mạnh hơn
   - Generate NEXTAUTH_SECRET ngẫu nhiên
   - Enable HTTPS

2. **Firewall:** Đảm bảo mở port 80 trên server:
   ```bash
   sudo ufw allow 80/tcp
   ```

3. **IP thay đổi:** Nếu IP thay đổi, cập nhật:
   - `.env.production` (NEXTAUTH_URL, NEXT_PUBLIC_APP_URL)
   - `nginx.conf` (server_name)
   - Sau đó restart: `docker-compose restart nginx app`

## 🆘 Troubleshooting

**Không truy cập được từ browser?**
```bash
# Check containers
docker-compose ps

# Check logs
docker-compose logs nginx
docker-compose logs app

# Check port 80
sudo netstat -tulpn | grep :80
```

**Database connection error?**
```bash
# Check database
docker-compose exec postgres pg_isready

# Reset database (nếu cần)
docker-compose down
docker volume rm mattroitrenban_postgres_data
docker-compose up -d
```

**App không build được?**
```bash
# Check build logs
docker-compose build app

# Clear cache và rebuild
docker system prune -f
docker-compose build --no-cache app
```

## 📝 Checklist sau khi deploy

- [ ] Website accessible: http://44.207.127.115
- [ ] Admin login works: http://44.207.127.115/root-admin/login
- [ ] Database connected (no errors in logs)
- [ ] File upload works (test at /admin/media)
- [ ] Content page loads data
- [ ] Contact form works

---

**Sau khi test xong, nhớ đổi passwords và enable HTTPS trước khi đưa lên production!** 🔒

