# 🚀 Performance Optimization Guide

## Vấn đề: Web load chậm trên production

### Nguyên nhân chính:

1. **Database Connection Pooling** - Chưa được cấu hình
2. **Không có caching** - Mỗi request đều query database
3. **Next.js chưa dùng ISR** - Không có Incremental Static Regeneration
4. **Nginx chưa cache** - Mọi request đều đi qua app
5. **Thiếu database indexes** - Queries chậm

## ✅ Đã tối ưu:

### 1. Database Connection Pooling
- Thêm `connection_limit=20&pool_timeout=20` vào DATABASE_URL
- Prisma sẽ reuse connections thay vì tạo mới mỗi lần

### 2. Next.js ISR (Incremental Static Regeneration)
- Homepage: `revalidate = 60` (revalidate mỗi 60 giây)
- Activity detail pages: `revalidate = 60`
- Trang được generate static và tự động update

### 3. Nginx Proxy Caching
- Cache zone `nextjs_cache` - 100MB, expire sau 60s
- Cache GET requests (pages và API)
- Không cache POST/PUT/DELETE và auth routes
- Background cache updates

### 4. API Response Caching
- Thêm `Cache-Control` headers cho API routes
- `s-maxage=60, stale-while-revalidate=120`

### 5. Static Assets Caching
- `/_next/static` files cached 60 phút
- Uploads cached 30 ngày

## 📊 Kết quả mong đợi:

- **First load**: ~1-2s (generate static)
- **Cached pages**: ~50-200ms (serve từ cache)
- **API calls**: ~100-300ms (nếu cached)
- **Database queries**: Nhanh hơn với connection pooling

## 🔧 Cách áp dụng:

### 1. Pull code mới
```bash
git pull origin main
```

### 2. Rebuild containers
```bash
./deploy.sh
```

### 3. Kiểm tra cache hoạt động
```bash
# Check Nginx cache
docker compose exec nginx ls -la /var/cache/nginx/nextjs

# Check logs
docker compose logs nginx | grep "X-Cache-Status"
```

## 📝 Thêm Database Indexes (Optional - Cần thiết nếu nhiều data)

Nếu có nhiều activities/donations, thêm indexes:

```sql
-- Connect to database
docker compose exec postgres psql -U mattroitrenban -d mattroitrendb

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_activity_published ON "Activity"("isPublished");
CREATE INDEX IF NOT EXISTS idx_activity_upcoming ON "Activity"("isUpcoming");
CREATE INDEX IF NOT EXISTS idx_activity_created ON "Activity"("createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_activity_slug ON "Activity"("slug");
CREATE INDEX IF NOT EXISTS idx_donation_confirmed ON "Donation"("isConfirmed");
CREATE INDEX IF NOT EXISTS idx_donation_activity ON "Donation"("activityId");
```

## 🎯 Monitoring

### Check response times:
```bash
# From server
curl -w "@-" -o /dev/null -s http://localhost \
  <<< "time_namelookup:  %{time_namelookup}\ntime_connect:  %{time_connect}\ntime_starttransfer:  %{time_starttransfer}\ntime_total:  %{time_total}\n"
```

### Check cache hits:
- Header `X-Cache-Status: HIT` = served from cache (nhanh)
- Header `X-Cache-Status: MISS` = query database (chậm hơn)

## ⚠️ Lưu ý:

1. **Cache invalidation**: 
   - Khi update content từ admin, có thể cần clear cache
   - Hoặc đợi 60s để cache tự expire

2. **Stale content**:
   - Content có thể hiển thị cũ trong 60s sau khi update
   - Có thể giảm `revalidate` nếu cần real-time hơn

3. **Memory usage**:
   - Nginx cache dùng RAM (100MB limit)
   - Nếu hết RAM, tăng server resources hoặc giảm cache size

## 🔍 Troubleshooting:

### Nếu vẫn chậm:

1. **Check database performance**:
```bash
docker compose exec postgres psql -U mattroitrenban -d mattroitrendb -c "EXPLAIN ANALYZE SELECT * FROM \"Activity\" WHERE \"isPublished\" = true;"
```

2. **Check server resources**:
```bash
docker stats
free -h
```

3. **Disable cache tạm thời để test**:
   - Comment out proxy_cache directives trong nginx.conf
   - Rebuild và test

4. **Enable query logging**:
   - Set `log: ["query"]` trong prisma.ts (tạm thời)
   - Check slow queries

## 📈 Next Steps:

1. **CDN cho static assets** (CloudFlare, AWS CloudFront)
2. **Database read replicas** (nếu scale lớn)
3. **Redis cache layer** (cho advanced caching)
4. **Image optimization** (Next.js Image component)
5. **Lazy loading** components

