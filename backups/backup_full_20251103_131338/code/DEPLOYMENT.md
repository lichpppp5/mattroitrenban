# 🚀 Hướng dẫn triển khai Production với Docker

Giải pháp triển khai tối ưu cho Next.js trên Ubuntu Server sử dụng Docker Compose.

## 📋 Yêu cầu hệ thống

- Ubuntu 20.04+ (hoặc Ubuntu Server 22.04 LTS khuyến nghị)
- Docker Engine 20.10+
- Docker Compose 2.0+
- Tối thiểu 2GB RAM, 2 CPU cores
- 20GB+ disk space

## 🛠️ Cài đặt Docker trên Ubuntu

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group (optional, để không cần sudo)
sudo usermod -aG docker $USER
newgrp docker

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

## 📦 Chuẩn bị code trên server

### Option 1: Clone từ Git repository

```bash
# Clone repository
git clone https://github.com/lichpppp5/mattroitrenban.git
cd mattroitrenban

# Switch to production branch if needed
# git checkout production
```

### Option 2: Upload code

```bash
# Sử dụng scp, rsync, hoặc FTP
# Upload toàn bộ thư mục mat-troi-tren-ban lên server
```

## ⚙️ Cấu hình môi trường

```bash
# Copy file environment mẫu
cp .env.production.example .env.production

# Chỉnh sửa file .env.production
nano .env.production
```

**Quan trọng:** Cập nhật các giá trị sau:

```env
# Database password (phải mạnh!)
POSTGRES_PASSWORD=your_very_secure_password_here

# NextAuth secret (generate ngẫu nhiên 32+ ký tự)
NEXTAUTH_SECRET=$(openssl rand -base64 32)

# Domain của bạn
NEXTAUTH_URL=https://mattroitrenban.vn
NEXT_PUBLIC_APP_URL=https://mattroitrenban.vn

# Database URL (sử dụng tên container postgres)
DATABASE_URL=postgresql://mattroitrenban:your_password@postgres:5432/mattroitrendb?schema=public
```

## 🔒 Cấu hình SSL/HTTPS (Let's Encrypt)

### Cách 1: Sử dụng Certbot trong Docker

```bash
# Install certbot
sudo apt install certbot

# Generate certificate
sudo certbot certonly --standalone -d mattroitrenban.vn -d www.mattroitrenban.vn

# Copy certificates
sudo mkdir -p ssl
sudo cp /etc/letsencrypt/live/mattroitrenban.vn/fullchain.pem ssl/
sudo cp /etc/letsencrypt/live/mattroitrenban.vn/privkey.pem ssl/
sudo chmod 644 ssl/fullchain.pem
sudo chmod 600 ssl/privkey.pem
```

### Sau đó uncomment phần HTTPS trong nginx.conf

## 🚀 Triển khai

```bash
# Make deploy script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

Hoặc thủ công:

```bash
# Build và start containers
docker-compose build
docker-compose up -d

# Chờ database sẵn sàng
sleep 10

# Run migrations
docker-compose exec app npx prisma migrate deploy

# (Optional) Seed database
docker-compose exec app npm run db:seed
```

## 🔍 Kiểm tra

```bash
# Check container status
docker-compose ps

# View logs
docker-compose logs -f app

# Test application
curl http://localhost
```

## 📊 Quản lý

### Xem logs

```bash
# Tất cả services
docker-compose logs -f

# Chỉ app
docker-compose logs -f app

# Chỉ database
docker-compose logs -f postgres
```

### Restart services

```bash
# Restart tất cả
docker-compose restart

# Restart app only
docker-compose restart app
```

### Update code

```bash
# Pull latest code
git pull origin main

# Rebuild và restart
docker-compose build app
docker-compose up -d app
```

### Backup database

```bash
# Backup
docker-compose exec postgres pg_dump -U mattroitrenban mattroitrendb > backup_$(date +%Y%m%d).sql

# Restore
docker-compose exec -T postgres psql -U mattroitrenban mattroitrendb < backup_20250101.sql
```

### Database migrations

```bash
# Run migrations
docker-compose exec app npx prisma migrate deploy

# Generate Prisma Client
docker-compose exec app npx prisma generate
```

## 🔧 Cấu hình Firewall (UFW)

```bash
# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable
sudo ufw status
```

## 📈 Tối ưu hiệu suất

### 1. Tăng worker processes cho Nginx

Trong `nginx.conf`, điều chỉnh `worker_processes` dựa trên số CPU:

```nginx
worker_processes auto; # Tự động detect
# hoặc
worker_processes 4; # Nếu server có 4 cores
```

### 2. Tối ưu PostgreSQL

Tạo file `postgresql.conf` trong volume hoặc mount vào container:

```conf
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 4MB
min_wal_size = 1GB
max_wal_size = 4GB
```

### 3. Monitoring (Optional)

Cài đặt monitoring tools:

```bash
# Install htop
sudo apt install htop

# Monitor containers
docker stats
```

## 🛡️ Security

1. **Đổi password database mạnh** trong `.env.production`
2. **Generate NEXTAUTH_SECRET ngẫu nhiên**
3. **Enable HTTPS** và redirect HTTP → HTTPS
4. **Regular updates:**
   ```bash
   sudo apt update && sudo apt upgrade -y
   docker-compose pull
   docker-compose up -d
   ```

## 🔄 Auto-renewal SSL (Cron job)

```bash
# Edit crontab
sudo crontab -e

# Add line (chạy mỗi tháng)
0 2 1 * * certbot renew --quiet && docker-compose restart nginx
```

## 📝 Cấu trúc thư mục sau khi deploy

```
mattroitrenban/
├── .env.production          # Environment variables
├── docker-compose.yml       # Docker compose config
├── Dockerfile               # Docker image build
├── nginx.conf               # Nginx configuration
├── ssl/                     # SSL certificates
├── uploads/                 # User uploaded files
└── logs/                    # Application logs
```

## ⚠️ Troubleshooting

### Container không start

```bash
# Check logs
docker-compose logs

# Check environment variables
docker-compose config
```

### Database connection error

```bash
# Check if database is ready
docker-compose exec postgres pg_isready

# Check connection from app
docker-compose exec app sh
# Inside container:
# npx prisma db pull
```

### Port already in use

```bash
# Check what's using port 80/443
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :443

# Change ports in docker-compose.yml if needed
```

### Out of disk space

```bash
# Clean unused Docker images
docker system prune -a

# Check disk usage
df -h
```

## 📞 Support

Nếu gặp vấn đề, kiểm tra:
1. Logs: `docker-compose logs -f`
2. Container status: `docker-compose ps`
3. Resource usage: `docker stats`
4. Network: `docker network ls`

## 🎯 Checklist triển khai

- [ ] Docker và Docker Compose đã cài đặt
- [ ] File `.env.production` đã cấu hình đúng
- [ ] Database password đã đổi
- [ ] NEXTAUTH_SECRET đã generate
- [ ] SSL certificates đã setup (nếu dùng HTTPS)
- [ ] Firewall đã cấu hình
- [ ] Domain DNS đã trỏ về server IP
- [ ] Containers đã start thành công
- [ ] Database migrations đã chạy
- [ ] Website đã hoạt động

## 🚀 Quick Start

```bash
# 1. Clone/upload code
git clone https://github.com/lichpppp5/mattroitrenban.git
cd mattroitrenban

# 2. Cấu hình .env.production
cp .env.production.example .env.production
nano .env.production

# 3. Deploy
chmod +x deploy.sh
./deploy.sh

# 4. Kiểm tra
curl http://localhost
```

**Lưu ý:** Đảm bảo thay đổi tất cả passwords và secrets trước khi deploy production!
