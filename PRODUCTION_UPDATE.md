# Hướng dẫn Update Production Server

## ⚠️ Lỗi Merge Conflict

Khi pull code trên production server, có thể gặp lỗi:
```
error: Your local changes to the following files would be overwritten by merge:
        nginx.conf
```

## 🔧 Giải pháp nhanh

### Option 1: Stash changes (Khuyến nghị)
```bash
# Stash local changes
git stash push -m "Stash before pull"

# Pull latest code
git pull origin main

# Nếu cần restore changes (thường không cần)
git stash pop
```

### Option 2: Backup và reset
```bash
# Backup nginx.conf
cp nginx.conf nginx.conf.backup

# Reset về HEAD
git checkout nginx.conf

# Pull latest code
git pull origin main

# Nếu cần merge manual
# Compare: diff nginx.conf.backup nginx.conf
```

### Option 3: Commit local changes
```bash
# Commit local changes
git add nginx.conf
git commit -m "chore: Local nginx.conf changes"

# Pull (sẽ tạo merge commit)
git pull origin main

# Resolve conflicts nếu có
# git add nginx.conf
# git commit
```

## 🚀 Script tự động

Sử dụng script `resolve-merge-conflict.sh`:
```bash
chmod +x resolve-merge-conflict.sh
./resolve-merge-conflict.sh
```

Script sẽ:
1. Kiểm tra uncommitted changes
2. Hiển thị diff của nginx.conf
3. Cho phép chọn option (stash/backup/commit)
4. Pull code tự động
5. Hướng dẫn next steps

## 📋 Quy trình Update Production đầy đủ

```bash
# 1. SSH vào server
ssh user@44.207.127.115

# 2. Di chuyển vào project
cd /mattroitrenban

# 3. Resolve conflicts (nếu có)
./resolve-merge-conflict.sh
# hoặc manual:
git stash && git pull origin main

# 4. Kiểm tra changes
git log --oneline -5

# 5. Rebuild app (nếu có code changes)
docker compose build app --no-cache

# 6. Restart containers
docker compose restart app nginx

# 7. Kiểm tra logs
docker compose logs -f app

# 8. Test website
curl -I http://localhost
```

## 🔍 Kiểm tra nginx.conf changes

Sau khi pull, kiểm tra xem nginx.conf có thay đổi gì:
```bash
# Xem diff
git diff HEAD~1 nginx.conf

# Nếu có thay đổi quan trọng, test config
docker exec mattroitrenban_nginx nginx -t

# Reload nginx nếu config đúng
docker exec mattroitrenban_nginx nginx -s reload
```

## ⚠️ Lưu ý

1. **Luôn backup trước khi pull** nếu có local changes quan trọng
2. **Kiểm tra nginx.conf** sau khi pull - có thể có thay đổi MIME types hoặc config
3. **Test nginx config** trước khi reload
4. **Restart containers** sau khi có code changes

## 🆘 Nếu gặp vấn đề

1. **Rollback**: `git reset --hard HEAD~1`
2. **Restore backup**: `cp nginx.conf.backup nginx.conf`
3. **Check logs**: `docker compose logs nginx`
4. **Restart**: `docker compose restart nginx`

