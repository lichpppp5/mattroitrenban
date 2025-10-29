# 🚀 Hướng dẫn Deploy Website lên mattroitrenban.vn

## 📋 Checklist trước khi deploy

### 1. Cấu hình Domain
- [ ] Đã cấu hình DNS cho `mattroitrenban.vn` trỏ về server/Vercel
- [ ] Đã cấu hình SSL certificate (HTTPS)
- [ ] Đã test domain có hoạt động

### 2. Environment Variables
Tạo file `.env.production` với các biến sau:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/mattroitrendb"

# NextAuth
NEXTAUTH_SECRET="generate_strong_secret_key_here"
NEXTAUTH_URL="https://mattroitrenban.vn"

# Cloudinary
CLOUDINARY_URL="cloudinary://api_key:api_secret@cloud_name"
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your_cloud_name"

# Email
RESEND_API_KEY="resend_key_here"
EMAIL_FROM="noreply@mattroitrenban.vn"

# App Configuration
NEXT_PUBLIC_APP_NAME="Mặt Trời Trên Bản"
NEXT_PUBLIC_APP_URL="https://mattroitrenban.vn"
```

### 3. Generate NEXTAUTH_SECRET
```bash
openssl rand -base64 32
```

---

## 🌐 Deploy lên Vercel (Khuyên dùng)

### Bước 1: Push code lên GitHub
```bash
git add .
git commit -m "Ready for production deployment"
git push origin main
```

### Bước 2: Import project trên Vercel
1. Truy cập [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import repository từ GitHub
4. Chọn project `mattroitrenban`

### Bước 3: Cấu hình Environment Variables
Trong Vercel dashboard:
1. Vào Settings → Environment Variables
2. Thêm tất cả biến môi trường từ `.env.production`

### Bước 4: Cấu hình Domain
1. Vào Settings → Domains
2. Thêm domain `mattroitrenban.vn`
3. Cấu hình DNS theo hướng dẫn của Vercel

### Bước 5: Deploy
1. Click "Deploy"
2. Chờ quá trình build và deploy hoàn tất

---

## 🖥️ Deploy lên VPS/Server riêng

### Bước 1: Cài đặt dependencies
```bash
npm install
```

### Bước 2: Build production
```bash
npm run build
```

### Bước 3: Chạy production server
```bash
npm start
```

### Bước 4: Cấu hình Nginx (Reverse Proxy)
Tạo file `/etc/nginx/sites-available/mattroitrenban.vn`:

```nginx
server {
    listen 80;
    server_name mattroitrenban.vn www.mattroitrenban.vn;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/mattroitrenban.vn /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Bước 5: Cấu hình SSL với Let's Encrypt
```bash
sudo certbot --nginx -d mattroitrenban.vn -d www.mattroitrenban.vn
```

---

## 🗄️ Database Setup

### 1. Tạo database
```bash
# PostgreSQL
createdb mattroitrendb

# Hoặc trong psql
CREATE DATABASE mattroitrendb;
```

### 2. Chạy migrations
```bash
npm run db:push
# hoặc
npm run db:migrate
```

### 3. Seed data (optional)
```bash
npm run db:seed
```

---

## 📧 Email Configuration

### Với Resend
1. Đăng ký tài khoản tại [resend.com](https://resend.com)
2. Tạo API key
3. Thêm vào `RESEND_API_KEY` trong environment variables

### Với SMTP khác
Cấu hình trong Admin Panel → Settings → Email Settings

---

## 🔍 Post-Deployment Checklist

- [ ] Website truy cập được tại https://mattroitrenban.vn
- [ ] Admin panel hoạt động tại https://mattroitrenban.vn/admin/dashboard
- [ ] Database connection thành công
- [ ] Email sending hoạt động
- [ ] Media upload (Cloudinary) hoạt động
- [ ] SSL certificate đã được cài đặt
- [ ] Analytics đã được cấu hình (nếu có)
- [ ] Backup database tự động đã được setup

---

## 🐛 Troubleshooting

### Lỗi "NEXTAUTH_URL mismatch"
- Kiểm tra `NEXTAUTH_URL` trong env phải khớp với domain thực tế
- Phải là `https://mattroitrenban.vn` (không có trailing slash)

### Lỗi Database connection
- Kiểm tra `DATABASE_URL` đúng format
- Kiểm tra firewall cho phép kết nối từ server

### Lỗi 500 Internal Server Error
- Kiểm tra logs trong Vercel dashboard hoặc server logs
- Kiểm tra tất cả environment variables đã được set

---

## 📞 Support

Nếu gặp vấn đề, kiểm tra:
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [GitHub Issues](https://github.com/lichpppp5/mattroitrenban/issues)

---

**Website:** https://mattroitrenban.vn  
**Admin Panel:** https://mattroitrenban.vn/admin/dashboard
