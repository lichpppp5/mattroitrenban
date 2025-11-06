# Giải pháp toàn diện cho 3 vấn đề

## 📋 Tổng quan vấn đề

1. **Website load chậm** - Performance issues
2. **Upload ảnh không hiển thị** - Image display issues
3. **Media không cho tải .mp3** - Audio upload restriction

## ✅ Giải pháp đã triển khai

### 1. Tối ưu Performance (Website load chậm)

#### A. Tăng cache time
- ✅ Homepage: `revalidate = 300` (5 phút thay vì 60 giây)
- ✅ Activities detail: `revalidate = 300` (5 phút)
- ✅ API Activities: Cache 5 phút, stale-while-revalidate 10 phút
- ✅ API Content: Cache 5 phút, stale-while-revalidate 10 phút

#### B. Database queries
- ✅ Đã optimize select fields (chỉ lấy fields cần thiết)
- ✅ Đã có indexing trên các fields quan trọng

#### C. Nginx caching
- ✅ Đã có proxy_cache cho Next.js pages (60s)
- ✅ Đã có proxy_cache cho API GET requests (30s)
- ✅ Static files cache 60 phút

### 2. Sửa Upload ảnh không hiển thị

#### A. Normalize URL strategy
- **Lưu vào DB**: Relative path (`/media/...`) để portable
- **Hiển thị**: Absolute URL với `NEXT_PUBLIC_APP_URL` hoặc `window.location.origin`

#### B. Các điểm đã sửa:
- ✅ Homepage: Normalize image URL với fallback đầy đủ
- ✅ Activities page: Normalize image URL
- ✅ Activity detail: Normalize image URL
- ✅ Admin activities: Normalize khi upload và khi hiển thị
- ✅ API media: Trả về relative URL, frontend normalize

#### C. Base URL priority:
1. `NEXT_PUBLIC_APP_URL` (production)
2. `NEXTAUTH_URL` (fallback)
3. `window.location.origin` (client-side fallback)
4. `http://localhost:3000` (development)

### 3. Media không cho tải .mp3

#### A. API đã hỗ trợ:
- ✅ Detect audio files qua MIME type (`audio/*`)
- ✅ Detect audio files qua extension (`.mp3`, `.wav`, `.ogg`, `.m4a`, `.aac`, `.flac`)
- ✅ Set `fileType = "audio"`
- ✅ Cloudinary support cho audio (dùng `resource_type: "video"`)

#### B. Frontend đã sửa:
- ✅ `accept` attribute: `audio/*,.mp3,.wav,.ogg,.m4a,.aac,.flac`
- ✅ Text hỗ trợ: "MP3, WAV, OGG, M4A"
- ✅ Stats hiển thị Audio count
- ✅ Audio preview với player

## 🔧 Cần kiểm tra trên Production

### 1. Environment Variables
Đảm bảo `.env.production` có:
```bash
NEXT_PUBLIC_APP_URL=http://44.207.127.115
# hoặc
NEXT_PUBLIC_APP_URL=https://mattroitrenban.vn
```

### 2. Nginx Configuration
Đảm bảo `/media` được serve đúng:
```nginx
location /media {
    alias /var/www/media;
    expires 30d;
    add_header Cache-Control "public, immutable";
}
```

### 3. File Permissions
```bash
# Trên server
sudo chown -R www-data:www-data /mattroitrenban/media
sudo chmod -R 755 /mattroitrenban/media
```

### 4. Test Upload
1. Upload ảnh trong Activities → Kiểm tra hiển thị
2. Upload .mp3 trong Media → Kiểm tra stats và preview

## 📝 Checklist Deployment

- [ ] Pull code mới nhất
- [ ] Kiểm tra `.env.production` có `NEXT_PUBLIC_APP_URL`
- [ ] Rebuild Docker: `docker compose build app --no-cache`
- [ ] Restart: `docker compose restart app`
- [ ] Kiểm tra logs: `docker compose logs -f app`
- [ ] Test upload ảnh
- [ ] Test upload .mp3
- [ ] Clear browser cache và test lại

## 🚀 Performance Tips

1. **Database**: Đảm bảo có indexes trên:
   - `Activity.isPublished`
   - `Activity.isUpcoming`
   - `Activity.slug`

2. **Images**: 
   - Sử dụng Next.js Image component với optimization
   - Hoặc `unoptimized` cho local files

3. **Caching**:
   - Browser cache: 30 ngày cho static files
   - CDN cache: Nếu có Cloudinary
   - Nginx cache: 60s cho pages, 30s cho API

