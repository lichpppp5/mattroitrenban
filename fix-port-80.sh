#!/bin/bash

# Script to fix port 80 conflict
set -e

echo "🔍 Kiểm tra port 80..."

# Check what's using port 80
echo "📋 Process đang sử dụng port 80:"
sudo lsof -i :80 || echo "Không tìm thấy process nào"

echo ""
echo "📋 Process đang sử dụng port 443:"
sudo lsof -i :443 || echo "Không tìm thấy process nào"

echo ""
echo "🔧 Các giải pháp:"
echo "1. Dừng Apache (nếu có):"
echo "   sudo systemctl stop apache2"
echo "   sudo systemctl disable apache2"
echo ""
echo "2. Dừng Nginx system (nếu có):"
echo "   sudo systemctl stop nginx"
echo "   sudo systemctl disable nginx"
echo ""
echo "3. Kill process cụ thể:"
echo "   sudo kill -9 <PID>"
echo ""
echo "4. Hoặc thay đổi port trong docker-compose.yml:"
echo "   Thay '80:80' thành '8080:80' (truy cập qua http://your-ip:8080)"

read -p "Bạn muốn tự động dừng Apache và Nginx system? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🛑 Dừng Apache..."
    sudo systemctl stop apache2 2>/dev/null || echo "Apache không chạy"
    sudo systemctl disable apache2 2>/dev/null || echo "Apache không được enable"
    
    echo "🛑 Dừng Nginx system..."
    sudo systemctl stop nginx 2>/dev/null || echo "Nginx system không chạy"
    sudo systemctl disable nginx 2>/dev/null || echo "Nginx system không được enable"
    
    echo "✅ Đã dừng các service"
    echo ""
    echo "🔄 Kiểm tra lại port 80:"
    sudo lsof -i :80 || echo "Port 80 đã trống!"
    
    echo ""
    echo "📝 Bây giờ bạn có thể chạy:"
    echo "   docker compose up -d"
else
    echo "⚠️  Bạn cần tự dừng process đang dùng port 80"
fi

