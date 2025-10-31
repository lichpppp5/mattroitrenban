# Hướng dẫn truy cập website từ bên ngoài

## 🌐 IP Public: `44.207.127.115`

## ✅ Các bước cần làm

### 1. Kiểm tra Docker containers đang chạy

```bash
docker compose ps
# Hoặc
docker ps
```

Phải thấy 3 containers:
- `mattroitrenban_db` (PostgreSQL)
- `mattroitrenban_app` (Next.js)
- `mattroitrenban_nginx` (Nginx reverse proxy)

### 2. Kiểm tra ports đang listen

```bash
sudo ss -tlnp | grep -E ':(80|443)'
```

Phải thấy:
- Port 80 (HTTP)
- Port 443 (HTTPS) - nếu có SSL

### 3. Kiểm tra firewall (UFW)

```bash
sudo ufw status
```

Nếu UFW đang active, phải allow ports 80 và 443:

```bash
chmod +x setup-firewall.sh
./setup-firewall.sh
```

### 4. ⚠️ QUAN TRỌNG: Cấu hình AWS Security Groups

Nếu server chạy trên AWS EC2:

1. Đăng nhập vào **AWS Console**
2. Vào **EC2** → Chọn instance của bạn
3. Click vào **Security Groups** tab
4. Click vào Security Group ID để mở
5. Tab **Inbound rules** → Click **Edit inbound rules**
6. Thêm 2 rules:

   **Rule 1: HTTP**
   - Type: `HTTP`
   - Protocol: `TCP`
   - Port: `80`
   - Source: `0.0.0.0/0` (hoặc `::/0` cho IPv6)
   - Description: `Allow HTTP from anywhere`

   **Rule 2: HTTPS** (nếu cần SSL)
   - Type: `HTTPS`
   - Protocol: `TCP`
   - Port: `443`
   - Source: `0.0.0.0/0` (hoặc `::/0` cho IPv6)
   - Description: `Allow HTTPS from anywhere`

7. Click **Save rules**

### 5. Kiểm tra Nginx logs

```bash
docker logs mattroitrenban_nginx --tail 50
```

Kiểm tra xem có lỗi gì không.

### 6. Test từ server

```bash
# Test HTTP
curl -I http://localhost

# Test với IP public
curl -I http://44.207.127.115
```

### 7. Test từ máy tính khác

Mở trình duyệt và truy cập:
```
http://44.207.127.115
```

## 🔧 Troubleshooting

### Lỗi: "Connection refused"

**Nguyên nhân:** Port chưa được mở trong Security Groups

**Giải pháp:** Xem bước 4 ở trên

### Lỗi: "Timeout"

**Nguyên nhân:** 
- Firewall chặn
- Security Groups chưa đúng
- Containers chưa chạy

**Giải pháp:**
```bash
# Kiểm tra containers
docker compose ps

# Kiểm tra logs
docker compose logs nginx
docker compose logs app

# Restart nếu cần
docker compose restart
```

### Port 80 không listen

**Nguyên nhân:** Nginx container chưa start hoặc bị lỗi

**Giải pháp:**
```bash
# Check Nginx container
docker logs mattroitrenban_nginx

# Restart Nginx
docker compose restart nginx

# Hoặc rebuild và restart tất cả
./cleanup.sh
./deploy.sh
```

## 📝 Scripts hỗ trợ

### Kiểm tra trạng thái

```bash
./check-access.sh
```

### Setup firewall

```bash
./setup-firewall.sh
```

### Kiểm tra ports

```bash
./check-ports.sh
```

## 🌍 URL truy cập

Sau khi setup xong, truy cập:

- **HTTP:** `http://44.207.127.115`
- **HTTPS:** `https://44.207.127.115` (nếu có SSL certificate)

## 🔒 Lưu ý bảo mật

1. **Đổi password database** từ `mattroitrenban` sang password mạnh hơn
2. **Setup SSL certificate** (Let's Encrypt) cho HTTPS
3. **Giới hạn IP truy cập admin** nếu cần (thông qua Security Groups)
4. **Update NEXTAUTH_SECRET** trong `.env.production`

