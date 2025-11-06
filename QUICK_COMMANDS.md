# 🚀 Quick Commands Reference

## Khởi động dịch vụ

### Khởi động tất cả services
```bash
./start.sh
```

### Hoặc dùng docker compose trực tiếp
```bash
docker compose up -d
# Hoặc
docker-compose up -d
```

### Khởi động và xem logs
```bash
docker compose up
```

## Khởi động lại dịch vụ

### Restart tất cả services
```bash
./restart.sh
```

### Hoặc dùng docker compose trực tiếp
```bash
docker compose restart
# Hoặc
docker-compose restart
```

### Restart từng service riêng lẻ
```bash
# Restart chỉ app (Next.js)
docker compose restart app

# Restart chỉ database
docker compose restart postgres

# Restart chỉ Nginx
docker compose restart nginx
```

## Dừng và khởi động lại (full restart)

### Dừng tất cả
```bash
docker compose down
```

### Khởi động lại
```bash
docker compose up -d
```

### Hoặc restart hoàn toàn (down + up)
```bash
docker compose down && docker compose up -d
```

## Xem logs

```bash
# Tất cả services
docker compose logs -f

# Chỉ app
docker compose logs -f app

# Chỉ database
docker compose logs -f postgres

# Chỉ nginx
docker compose logs -f nginx
```

## Kiểm tra trạng thái

```bash
# Xem containers đang chạy
docker compose ps

# Xem resources usage
docker stats
```

## Cập nhật code và restart

```bash
# Pull code mới
git pull origin main

# Rebuild và restart
./deploy.sh

# Hoặc chỉ restart (không rebuild)
./restart.sh
```

## Troubleshooting

### Nếu services không start
```bash
# Kiểm tra logs
docker compose logs

# Restart từ đầu
docker compose down
docker compose up -d
```

### Xóa và tạo lại containers
```bash
docker compose down -v  # Xóa cả volumes (⚠️ mất data)
docker compose up -d
```

### Kiểm tra ports
```bash
sudo ss -tlnp | grep -E ':(80|443|3000|5432)'
```

