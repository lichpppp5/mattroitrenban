# 🌐 Hướng dẫn cấu hình Domain mattroitrenban.vn

## 📋 Tổng quan

Domain: `mattroitrenban.vn`
IP Server: `44.207.127.115`
DNS Provider: Nhân Hòa

## 🔧 Bước 1: Cấu hình DNS tại Nhân Hòa

### Cách 1: Qua Web Interface

1. Đăng nhập vào [Nhân Hòa](https://nhanhoa.com)
2. Vào phần **Quản lý Domain** → Chọn domain `mattroitrenban.vn`
3. Vào **DNS Management** hoặc **Quản lý DNS**

4. Tạo các bản ghi sau:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | 44.207.127.115 | 3600 |
| A | www | 44.207.127.115 | 3600 |

**Hoặc nếu sử dụng Name Server của Nhân Hòa:**

- **DNS1:** `ns1.zonedns.vn` (IP: 64.176.84.220)
- **DNS2:** `ns2.zonedns.vn` (IP: 103.176.178.51)
- **DNS3:** `ns3.zonedns.vn` (IP: 103.28.36.30)

### Cách 2: Qua API (nếu có)

Tham khảo tài liệu API của Nhân Hòa để tạo A records tự động.

## ⏳ Chờ DNS Propagation

Sau khi cấu hình DNS, cần chờ **15-30 phút** để DNS được propagate toàn cầu.

Kiểm tra DNS:
```bash
# Kiểm tra A record
dig +short mattroitrenban.vn
dig +short www.mattroitrenban.vn

# Hoặc
nslookup mattroitrenban.vn
```

Kết quả mong đợi: `44.207.127.115`

## 🚀 Bước 2: Chạy script tự động

```bash
cd /mattroitrenban
chmod +x setup-domain.sh
./setup-domain.sh
```

Script này sẽ:
1. ✅ Kiểm tra DNS resolution
2. ✅ Cập nhật `.env.production` với domain mới
3. ✅ Setup SSL certificate (Let's Encrypt)
4. ✅ Cấu hình Nginx cho domain
5. ✅ Restart services

## 🔒 Bước 3: Setup SSL/HTTPS (Tự động hoặc thủ công)

### Tự động (qua script):
Script sẽ hỏi bạn có muốn setup SSL không. Chọn `y` để tự động setup.

### Thủ công:

```bash
# 1. Install certbot (nếu chưa có)
sudo apt update
sudo apt install -y certbot

# 2. Dừng Nginx container (certbot cần port 80)
docker compose stop nginx

# 3. Generate certificate
sudo certbot certonly --standalone \
    -d mattroitrenban.vn \
    -d www.mattroitrenban.vn \
    --email your-email@example.com \
    --agree-tos

# 4. Copy certificates
mkdir -p ssl
sudo cp /etc/letsencrypt/live/mattroitrenban.vn/fullchain.pem ssl/
sudo cp /etc/letsencrypt/live/mattroitrenban.vn/privkey.pem ssl/
sudo chmod 644 ssl/fullchain.pem
sudo chmod 600 ssl/privkey.pem
sudo chown $USER:$USER ssl/*.pem

# 5. Enable HTTPS trong nginx.conf
# (Script sẽ tự động làm việc này)
# Hoặc uncomment section HTTPS trong nginx.conf

# 6. Restart Nginx
docker compose up -d nginx
```

## ✅ Bước 4: Kiểm tra

```bash
# Test HTTP
curl -I http://mattroitrenban.vn

# Test HTTPS (nếu đã setup SSL)
curl -I https://mattroitrenban.vn

# Check logs
docker compose logs -f nginx
```

## 🔄 Auto-renewal SSL Certificate

Let's Encrypt certificates expire sau 90 ngày. Setup auto-renewal:

```bash
# Edit crontab
sudo crontab -e

# Thêm dòng này (chạy mỗi tháng)
0 2 1 * * certbot renew --quiet && docker compose restart nginx
```

## 🛠️ Troubleshooting

### Domain không resolve được

1. **Kiểm tra DNS records:**
   ```bash
   dig mattroitrenban.vn
   nslookup mattroitrenban.vn
   ```

2. **Kiểm tra DNS propagation:**
   - Sử dụng: https://dnschecker.org/
   - Nhập domain và IP: `44.207.127.115`
   - Đợi ít nhất 30 phút sau khi cấu hình DNS

3. **Kiểm tra firewall:**
   ```bash
   sudo ufw status
   # Đảm bảo port 80 và 443 được mở
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   ```

### SSL certificate generation fails

1. **Đảm bảo Nginx container đã dừng:**
   ```bash
   docker compose stop nginx
   ```

2. **Kiểm tra port 80:**
   ```bash
   sudo netstat -tulpn | grep :80
   # Không nên có process nào khác đang dùng port 80
   ```

3. **Kiểm tra DNS đã propagate:**
   ```bash
   dig +short mattroitrenban.vn
   # Phải trả về 44.207.127.115
   ```

4. **Thử lại với verbose:**
   ```bash
   sudo certbot certonly --standalone \
       -d mattroitrenban.vn \
       -d www.mattroitrenban.vn \
       --verbose
   ```

### Website không load qua domain

1. **Check Nginx config:**
   ```bash
   docker compose exec nginx nginx -t
   ```

2. **Check logs:**
   ```bash
   docker compose logs nginx
   ```

3. **Restart services:**
   ```bash
   docker compose restart
   ```

## 📝 Cập nhật sau khi setup domain

Sau khi domain hoạt động, cần cập nhật:

1. **NextAuth URLs trong database:**
   - Các URL callback sẽ tự động dùng domain mới từ `NEXTAUTH_URL`
   - Nếu có issues, có thể cần clear sessions

2. **Admin panel URLs:**
   - Đảm bảo các link trong email notifications dùng domain mới

3. **Social media links:**
   - Cập nhật các link trong database nếu có hardcode IP

## 🔐 Security Notes

1. **Luôn sử dụng HTTPS:**
   - HTTP sẽ tự động redirect về HTTPS
   - Bảo mật dữ liệu người dùng

2. **Update environment variables:**
   - `NEXTAUTH_URL` phải là HTTPS URL
   - `NEXT_PUBLIC_APP_URL` phải là HTTPS URL

3. **Check security headers:**
   - Nginx đã có các security headers cơ bản
   - Có thể thêm HSTS nếu cần

## 📞 Cần hỗ trợ?

Nếu gặp vấn đề:
1. Check logs: `docker compose logs -f`
2. Test DNS: `dig mattroitrenban.vn`
3. Test connectivity: `curl -I http://mattroitrenban.vn`

