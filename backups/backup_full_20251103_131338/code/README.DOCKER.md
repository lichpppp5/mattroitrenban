# 🐳 Docker Deployment - Quick Start

## 📦 Kiến trúc

```
┌─────────────┐
│   Nginx     │ ← Port 80/443 (Reverse Proxy)
└──────┬──────┘
       │
┌──────▼──────┐
│  Next.js    │ ← Port 3000 (App)
└──────┬──────┘
       │
┌──────▼──────┐
│ PostgreSQL  │ ← Port 5432 (Database)
└─────────────┘
```

## 🚀 Triển khai nhanh (3 bước)

### 1. Cài đặt Docker

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker
```

### 2. Cấu hình

```bash
# Copy và chỉnh sửa .env.production
cp .env.production.example .env.production
nano .env.production

# Quan trọng: Đổi passwords!
```

### 3. Deploy

```bash
chmod +x deploy.sh
./deploy.sh
```

**Xong!** Website chạy tại `http://your-server-ip`

## 📊 Quản lý hàng ngày

```bash
# Xem logs
docker-compose logs -f app

# Restart app
docker-compose restart app

# Backup database
./backup.sh

# Update code và rebuild
git pull
docker-compose build app
docker-compose up -d app
```

## 🔒 SSL/HTTPS Setup

Sau khi có domain, setup SSL:

```bash
# 1. Install certbot
sudo apt install certbot

# 2. Generate certificate
sudo certbot certonly --standalone -d mattroitrenban.vn

# 3. Copy certificates
sudo mkdir -p ssl
sudo cp /etc/letsencrypt/live/mattroitrenban.vn/*.pem ssl/
sudo chown $USER:$USER ssl/*.pem

# 4. Uncomment HTTPS section trong nginx.conf

# 5. Restart
docker-compose restart nginx
```

## 💾 Backup & Restore

### Backup
```bash
./backup.sh
```

### Restore
```bash
gunzip -c backups/backup_20250101_120000.sql.gz | \
  docker-compose exec -T postgres psql -U mattroitrenban mattroitrendb
```

## 🔧 Troubleshooting

### App không start
```bash
docker-compose logs app
docker-compose exec app npx prisma generate
```

### Database connection error
```bash
docker-compose exec postgres pg_isready
docker-compose restart postgres
```

### Port conflict
```bash
# Change ports in docker-compose.yml
# Or stop conflicting service
sudo systemctl stop apache2  # Example
```

## 📈 Performance Tips

1. **Production build:** Đã có `output: "standalone"` trong next.config.ts ✅
2. **Nginx caching:** Static files cached automatically
3. **Gzip:** Enabled trong nginx.conf
4. **Database:** PostgreSQL tuned for production

## 🛡️ Security Checklist

- [ ] Đổi POSTGRES_PASSWORD mạnh
- [ ] Generate NEXTAUTH_SECRET ngẫu nhiên (32+ chars)
- [ ] Enable HTTPS (Let's Encrypt)
- [ ] Configure firewall (UFW)
- [ ] Regular updates: `docker-compose pull && docker-compose up -d`
- [ ] Backup database regularly

## 📝 Environment Variables

Quan trọng nhất trong `.env.production`:

- `POSTGRES_PASSWORD` - Password database (mạnh!)
- `NEXTAUTH_SECRET` - Secret key (32+ ký tự ngẫu nhiên)
- `DATABASE_URL` - Connection string (dùng `postgres` hostname)
- `NEXTAUTH_URL` - Public URL của website

## 🎯 Tại sao chọn Docker?

✅ **Gọn nhẹ:** Chỉ cần Docker, không cần cài Node.js, PostgreSQL riêng  
✅ **Isolated:** Ứng dụng không ảnh hưởng đến system packages  
✅ **Easy deploy:** Chỉ 1 command `docker-compose up -d`  
✅ **Easy backup:** Chỉ cần backup volume và code  
✅ **Easy scale:** Có thể scale dễ dàng khi cần  
✅ **Consistent:** Môi trường giống nhau giữa dev/prod  

## 📞 Cần giúp?

Xem file `DEPLOYMENT.md` để có hướng dẫn chi tiết hơn.

