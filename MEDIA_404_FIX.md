# Fix Media 404 Error - File không phát được

## 🔍 Vấn đề

File audio `niemvuicuaem.mp3` upload thành công nhưng khi phát bị lỗi 404:
- URL: `https://mattroitrenban.vn/media/1762422110549-niemvuicuaem.mp3`
- Error: `net::ERR_ABORTED 404 (Not Found)`

## 🔧 Nguyên nhân

1. **Docker Volume Mount Issue**: 
   - App container: `./media:/app/public/media`
   - Nginx container: `./media:/var/www/media:ro`
   - File được lưu vào `public/media/` trong container nhưng có thể không sync với volume mount

2. **Permissions**: File có thể không có quyền đọc cho Nginx

3. **MIME Types**: Nginx có thể không nhận diện đúng MIME type cho audio files

## ✅ Giải pháp đã triển khai

### 1. Cải thiện file saving logic
- ✅ Đảm bảo file được lưu vào đúng vị trí volume mount
- ✅ Set permissions đúng (0o644 cho files, 0o755 cho directories)
- ✅ Thêm logging chi tiết để debug

### 2. Nginx MIME types
- ✅ Thêm MIME types cho audio files (mp3, wav, ogg, m4a, aac, flac)
- ✅ Set default MIME type

### 3. Script fix tự động
- ✅ `fix-media-404.sh` - Script để sync files và fix permissions

## 📋 Cách fix trên Production Server

### Bước 1: Pull code mới nhất
```bash
cd /mattroitrenban
git pull origin main
```

### Bước 2: Chạy script fix
```bash
chmod +x fix-media-404.sh
./fix-media-404.sh
```

### Bước 3: Rebuild và restart
```bash
# Rebuild app container
docker compose build app --no-cache

# Restart containers
docker compose restart app nginx

# Hoặc restart toàn bộ
docker compose down
docker compose up -d
```

### Bước 4: Kiểm tra files
```bash
# Kiểm tra files trong media directory
ls -la media/
ls -la public/media/

# Kiểm tra files trong container
docker exec mattroitrenban_app ls -la /app/public/media/
docker exec mattroitrenban_nginx ls -la /var/www/media/

# Test access file
curl -I http://localhost/media/[filename]
```

### Bước 5: Kiểm tra logs
```bash
# App logs
docker compose logs app | grep media

# Nginx logs
docker compose logs nginx | grep media

# Nginx error logs
docker exec mattroitrenban_nginx cat /var/log/nginx/error.log | tail -20
```

## 🔍 Debug Steps

### 1. Kiểm tra file có tồn tại không
```bash
# Trên host
ls -la media/1762422110549-niemvuicuaem.mp3

# Trong app container
docker exec mattroitrenban_app ls -la /app/public/media/1762422110549-niemvuicuaem.mp3

# Trong nginx container
docker exec mattroitrenban_nginx ls -la /var/www/media/1762422110549-niemvuicuaem.mp3
```

### 2. Kiểm tra permissions
```bash
# File permissions should be 644
stat -c "%a %n" media/1762422110549-niemvuicuaem.mp3

# Directory permissions should be 755
stat -c "%a %n" media/
```

### 3. Test Nginx serve
```bash
# Test từ trong nginx container
docker exec mattroitrenban_nginx curl -I http://localhost/media/1762422110549-niemvuicuaem.mp3

# Test từ host
curl -I http://localhost/media/1762422110549-niemvuicuaem.mp3
```

### 4. Kiểm tra Nginx config
```bash
# Test Nginx config
docker exec mattroitrenban_nginx nginx -t

# Reload Nginx config
docker exec mattroitrenban_nginx nginx -s reload
```

## 🚨 Nếu vẫn lỗi

### Option 1: Copy file thủ công
```bash
# Nếu file có trong app container nhưng không có trong nginx
docker cp mattroitrenban_app:/app/public/media/1762422110549-niemvuicuaem.mp3 ./media/
docker compose restart nginx
```

### Option 2: Re-upload file
1. Xóa file cũ trong Media admin
2. Upload lại file mới
3. Kiểm tra logs để đảm bảo file được lưu đúng

### Option 3: Fix volume mount
```bash
# Đảm bảo volume mount đúng trong docker-compose.yml
# App: ./media:/app/public/media
# Nginx: ./media:/var/www/media:ro

# Restart containers
docker compose down
docker compose up -d
```

## 📝 Checklist

- [ ] Code đã được pull về server
- [ ] Script fix đã chạy
- [ ] Containers đã được rebuild và restart
- [ ] Files tồn tại trong cả `media/` và `public/media/`
- [ ] Permissions đúng (644 cho files, 755 cho directories)
- [ ] Nginx config đã reload
- [ ] Test access file thành công
- [ ] Audio player có thể phát file

## 🎯 Expected Result

Sau khi fix:
- ✅ File tồn tại trong `./media/` trên host
- ✅ File tồn tại trong `/app/public/media/` trong app container
- ✅ File tồn tại trong `/var/www/media/` trong nginx container
- ✅ Nginx serve file với MIME type đúng
- ✅ Audio player có thể phát file
- ✅ URL `https://mattroitrenban.vn/media/[filename]` trả về 200 OK

