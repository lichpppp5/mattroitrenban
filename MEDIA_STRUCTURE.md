# Media Directory Structure - Documentation

## 📁 Cấu Trúc Đúng

### Host (Production Server)
```
/mattroitrenban/
├── media/                    # Root media directory (FLAT structure)
│   ├── 1762160540521-DSC02196.JPG
│   ├── 1762160541991-DSC02386.JPG
│   ├── 1762422110549-niemvuicuaem.mp3  (sau khi upload)
│   └── [timestamp]-[filename].[ext]
└── public/
    └── media/                # Optional (may not exist, or symlink)
```

**Lưu ý**: Files được lưu **FLAT** trong `./media/` root, không có subdirectories.

### Docker Containers

#### App Container
- **Path trong container**: `/app/public/media/`
- **Volume mount**: `./media:/app/public/media`
- **API lưu vào**: `public/media/` (trong container)
- **Sync về host**: `./media/` (qua volume mount)

#### Nginx Container
- **Path trong container**: `/var/www/media/`
- **Volume mount**: `./media:/var/www/media:ro` (read-only)
- **Serve từ**: `/var/www/media/`

## 🔄 Flow Upload File

1. **User upload** → Admin panel (`/root-admin/media`)
2. **API nhận file** → `/api/media` (POST)
3. **API lưu file** → `public/media/[timestamp]-[filename]` (trong container)
4. **Volume mount sync** → `./media/[timestamp]-[filename]` (trên host)
5. **Nginx serve** → `/var/www/media/[timestamp]-[filename]` (trong container)
6. **URL**: `https://mattroitrenban.vn/media/[timestamp]-[filename]`

## 📝 File Naming Convention

- Format: `[timestamp]-[sanitized-filename]`
- Example: `1762422110549-niemvuicuaem.mp3`
- Timestamp: Unix timestamp (milliseconds)
- Filename: Sanitized (special chars replaced with `_`)

## ✅ Cấu Trúc Đúng

### Không cần subdirectories
- ❌ `media/images/`
- ❌ `media/audio/`
- ❌ `media/videos/`
- ✅ `media/` (flat structure)

### Lý do
1. **Đơn giản**: Dễ quản lý, không cần organize
2. **Performance**: Không cần traverse subdirectories
3. **URL đơn giản**: `/media/filename` thay vì `/media/images/filename`
4. **Database tracking**: Prisma Media table track type, không cần folder structure

## 🔍 Verification

Chạy script để verify:
```bash
./verify-media-structure.sh
```

Script sẽ kiểm tra:
- ✅ Host structure (`./media/`)
- ✅ Docker volume mounts
- ✅ Container accessibility
- ✅ docker-compose.yml configuration
- ✅ API code path

## 🚨 Common Issues

### Issue 1: Files không sync
**Nguyên nhân**: Volume mount không đúng
**Fix**: 
```bash
docker compose down
docker compose up -d
```

### Issue 2: Nginx không thấy files
**Nguyên nhân**: Volume mount thiếu hoặc sai
**Fix**: Kiểm tra `docker-compose.yml`:
```yaml
nginx:
  volumes:
    - ./media:/var/www/media:ro
```

### Issue 3: Permissions
**Nguyên nhân**: Files không có quyền đọc
**Fix**:
```bash
chmod -R 755 media
find media -type f -exec chmod 644 {} \;
```

## 📋 Checklist

- [x] `./media/` directory exists on host
- [x] Docker volume mount: `./media:/app/public/media` (app)
- [x] Docker volume mount: `./media:/var/www/media:ro` (nginx)
- [x] API saves to `public/media/` (in container)
- [x] Files accessible in both containers
- [x] Nginx serves from `/var/www/media/`
- [x] Permissions: 755 (dirs), 644 (files)

## 🎯 Best Practices

1. **Không tạo subdirectories** - Giữ flat structure
2. **Không move files manually** - Dùng admin panel
3. **Backup `./media/`** - Trước khi update
4. **Check permissions** - Sau khi upload
5. **Verify mounts** - Sau khi restart containers

## 📚 Related Files

- `src/app/api/media/route.ts` - Upload logic
- `docker-compose.yml` - Volume mounts
- `nginx.conf` - Media serving config
- `verify-media-structure.sh` - Verification script

