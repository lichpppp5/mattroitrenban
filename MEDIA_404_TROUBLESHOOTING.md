# Troubleshooting Media 404 Errors

## 🔍 Vấn đề

Console log hiển thị các lỗi 404 cho media files:
- `1762422110549-niemvuicuaem.mp3` - Audio file
- `1762421023441-DSC02112.JPG` - Image file
- `1762419119062-DSC02376.JPG` - Image file

## 🔧 Các bước kiểm tra và sửa

### Bước 1: Kiểm tra files có tồn tại không

```bash
# Trên production server
cd /mattroitrenban

# Kiểm tra trong media/
ls -la media/ | grep -E "1762422110549|1762421023441|1762419119062"

# Kiểm tra trong public/media/
ls -la public/media/ | grep -E "1762422110549|1762421023441|1762419119062"
```

### Bước 2: Kiểm tra trong Docker containers

```bash
# Kiểm tra trong app container
docker exec mattroitrenban_app ls -la /app/public/media/ | grep -E "1762422110549|1762421023441|1762419119062"

# Kiểm tra trong nginx container
docker exec mattroitrenban_nginx ls -la /var/www/media/ | grep -E "1762422110549|1762421023441|1762419119062"
```

### Bước 3: Sử dụng script tự động

```bash
chmod +x fix-missing-media.sh
./fix-missing-media.sh
```

### Bước 4: Fix files nếu thiếu

#### Nếu file có trong media/ nhưng không có trong public/media/:
```bash
# Copy files
cp media/1762422110549-niemvuicuaem.mp3 public/media/
cp media/1762421023441-DSC02112.JPG public/media/
cp media/1762419119062-DSC02376.JPG public/media/

# Fix permissions
chmod 644 public/media/*.mp3 public/media/*.JPG
```

#### Nếu file có trong public/media/ nhưng không có trong media/:
```bash
# Copy files
cp public/media/1762422110549-niemvuicuaem.mp3 media/
cp public/media/1762421023441-DSC02112.JPG media/
cp public/media/1762419119062-DSC02376.JPG media/

# Fix permissions
chmod 644 media/*.mp3 media/*.JPG
```

### Bước 5: Kiểm tra Docker volume mounts

```bash
# Kiểm tra volume mounts
docker inspect mattroitrenban_app | grep -A 20 '"Mounts"'
docker inspect mattroitrenban_nginx | grep -A 20 '"Mounts"'

# Đảm bảo:
# - App: ./media:/app/public/media
# - Nginx: ./media:/var/www/media:ro
```

### Bước 6: Restart containers

```bash
# Restart để sync volumes
docker compose restart app nginx

# Hoặc restart toàn bộ
docker compose down
docker compose up -d
```

### Bước 7: Test access

```bash
# Test từ host
curl -I http://localhost/media/1762422110549-niemvuicuaem.mp3
curl -I http://localhost/media/1762421023441-DSC02112.JPG
curl -I http://localhost/media/1762419119062-DSC02376.JPG

# Test từ nginx container
docker exec mattroitrenban_nginx curl -I http://localhost/media/1762422110549-niemvuicuaem.mp3
```

## 🚨 Nếu files không tồn tại

Nếu files không tồn tại ở bất kỳ đâu, có 2 options:

### Option 1: Re-upload files
1. Vào admin panel: `/root-admin/media`
2. Upload lại các files bị thiếu
3. Kiểm tra logs để đảm bảo upload thành công

### Option 2: Restore từ backup
```bash
# Nếu có backup
cp /path/to/backup/media/*.mp3 media/
cp /path/to/backup/media/*.JPG media/
chmod 644 media/*
```

## 🔍 Debug Nginx

```bash
# Check Nginx error logs
docker compose logs nginx | grep -i "404\|media"

# Check Nginx access logs
docker compose logs nginx | grep -i "media"

# Test Nginx config
docker exec mattroitrenban_nginx nginx -t

# Reload Nginx
docker exec mattroitrenban_nginx nginx -s reload
```

## 📋 Checklist

- [ ] Files tồn tại trong `media/` trên host
- [ ] Files tồn tại trong `public/media/` trên host
- [ ] Files tồn tại trong app container (`/app/public/media/`)
- [ ] Files tồn tại trong nginx container (`/var/www/media/`)
- [ ] Permissions đúng (644 cho files, 755 cho directories)
- [ ] Docker volumes mounted đúng
- [ ] Nginx config đúng
- [ ] Containers đã restart
- [ ] Test access thành công

## 🎯 Expected Result

Sau khi fix:
- ✅ Files tồn tại trong cả `media/` và `public/media/`
- ✅ Files accessible trong Docker containers
- ✅ Nginx serve files với status 200
- ✅ No more 404 errors in console
- ✅ Media files load correctly on website

