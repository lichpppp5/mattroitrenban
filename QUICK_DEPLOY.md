# ⚡ Quick Deploy Guide - Ubuntu Server

## 🎯 Tổng quan giải pháp Docker

**Lợi ích:**
- ✅ **Gọn nhẹ:** Không cần cài Node.js, PostgreSQL riêng trên server
- ✅ **Nhanh:** Next.js standalone build + Nginx reverse proxy
- ✅ **Ổn định:** Auto-restart, health checks, isolated containers
- ✅ **Dễ backup:** Chỉ cần backup volume và .env
- ✅ **Dễ scale:** Có thể thêm instances dễ dàng

## 📋 Checklist trước khi deploy

- [ ] Server Ubuntu 20.04+ đã sẵn sàng
- [ ] Domain đã trỏ DNS về server IP
- [ ] Code đã upload/clone lên server
- [ ] Đã đọc file DEPLOYMENT.md

## 🚀 Deploy trong 5 phút

### Bước 1: Cài Docker (nếu chưa có)

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### Bước 2: Cấu hình môi trường

```bash
cd /path/to/mattroitrenban
cp .env.production.example .env.production
nano .env.production
```

**BẮT BUỘC phải đổi:**
```env
POSTGRES_PASSWORD=<password_mạnh_ít_nhất_16_ký_tự>
NEXTAUTH_SECRET=$(openssl rand -base64 32)
```

### Bước 3: Deploy

```bash
chmod +x deploy.sh
./deploy.sh
```

### Bước 4: Kiểm tra

```bash
# Check containers
docker-compose ps

# Check logs
docker-compose logs -f app

# Test website
curl http://localhost
```

**Xong!** Website chạy tại `http://your-server-ip`

## 🔒 Setup SSL (Sau khi có domain)

```bash
# 1. Generate certificate
sudo certbot certonly --standalone -d mattroitrenban.vn

# 2. Copy certificates
sudo mkdir -p ssl
sudo cp /etc/letsencrypt/live/mattroitrenban.vn/*.pem ssl/
sudo chown $USER:$USER ssl/*.pem

# 3. Uncomment HTTPS section trong nginx.conf (dòng 48-100)

# 4. Restart nginx
docker-compose restart nginx
```

## 📊 Các lệnh thường dùng

```bash
# Xem logs
docker-compose logs -f app

# Restart app
docker-compose restart app

# Backup database
./backup.sh

# Update code
git pull
docker-compose build app
docker-compose up -d app

# Database shell
docker-compose exec postgres psql -U mattroitrenban -d mattroitrendb
```

## 🔧 Tối ưu hiệu suất

1. **Nginx caching:** Đã tự động cache static files
2. **Gzip compression:** Đã enable
3. **Database indexing:** Prisma tự động tối ưu
4. **Next.js standalone:** Build sẵn, không cần node_modules đầy đủ

## 📦 Cấu trúc sau khi deploy

```
mattroitrenban/
├── .env.production          # ← Cấu hình (KHÔNG commit)
├── docker-compose.yml      # ← Docker config
├── Dockerfile              # ← Build image
├── nginx.conf              # ← Reverse proxy
├── ssl/                    # ← SSL certificates
├── uploads/                # ← User files
├── backups/                # ← Database backups
└── logs/                   # ← App logs
```

## ⚠️ Lưu ý quan trọng

1. **Security:**
   - Đổi TẤT CẢ passwords trong `.env.production`
   - Enable HTTPS trước khi đưa lên production
   - Configure firewall (chỉ mở 22, 80, 443)

2. **Backup:**
   - Chạy `./backup.sh` hàng ngày (có thể setup cron)
   - Backup cả thư mục `uploads/` nếu có file quan trọng

3. **Monitoring:**
   - Check logs thường xuyên: `docker-compose logs -f`
   - Monitor disk space: `df -h`
   - Monitor containers: `docker stats`

## 🆘 Troubleshooting nhanh

**App không start?**
```bash
docker-compose logs app
docker-compose exec app npx prisma generate
```

**Database lỗi?**
```bash
docker-compose restart postgres
docker-compose exec postgres pg_isready
```

**Port bị chiếm?**
```bash
sudo netstat -tulpn | grep :80
# Stop service đang dùng port hoặc đổi port trong docker-compose.yml
```

## 📞 Cần thêm chi tiết?

Xem file `DEPLOYMENT.md` để có hướng dẫn đầy đủ hơn.

---

**Tóm lại:** Giải pháp Docker này là **gọn nhẹ nhất** và **nhanh nhất** cho Next.js production! 🚀

