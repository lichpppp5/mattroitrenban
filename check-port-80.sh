#!/bin/bash

# Quick script to check and fix port 80 conflict
set -e

echo "🔍 Kiểm tra port 80..."

# Check what's using port 80
PID=$(sudo lsof -t -i:80 2>/dev/null || echo "")

if [ -z "$PID" ]; then
    echo "✅ Port 80 đang trống!"
    exit 0
fi

echo "⚠️  Port 80 đang được sử dụng bởi PID: $PID"
echo ""
echo "📋 Chi tiết process:"
sudo lsof -i:80

echo ""
echo "🔧 Giải pháp:"
echo ""
echo "1. Dừng Apache (nếu có):"
echo "   sudo systemctl stop apache2"
echo "   sudo systemctl disable apache2"
echo ""
echo "2. Dừng Nginx system (nếu có):"
echo "   sudo systemctl stop nginx"
echo "   sudo systemctl disable nginx"
echo ""
echo "3. Kill process trực tiếp:"
echo "   sudo kill -9 $PID"
echo ""
read -p "Bạn muốn tự động dừng Apache và Nginx system? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🛑 Dừng Apache..."
    sudo systemctl stop apache2 2>/dev/null && echo "✅ Đã dừng Apache" || echo "⚠️  Apache không chạy"
    sudo systemctl disable apache2 2>/dev/null && echo "✅ Đã disable Apache" || echo "⚠️  Apache không được enable"
    
    echo "🛑 Dừng Nginx system..."
    sudo systemctl stop nginx 2>/dev/null && echo "✅ Đã dừng Nginx system" || echo "⚠️  Nginx system không chạy"
    sudo systemctl disable nginx 2>/dev/null && echo "✅ Đã disable Nginx system" || echo "⚠️  Nginx system không được enable"
    
    # Check again
    PID=$(sudo lsof -t -i:80 2>/dev/null || echo "")
    if [ -n "$PID" ]; then
        echo ""
        echo "⚠️  Vẫn còn process sử dụng port 80 (PID: $PID)"
        read -p "Bạn muốn kill process này? (y/n): " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            sudo kill -9 $PID
            echo "✅ Đã kill process $PID"
        fi
    fi
    
    echo ""
    echo "🔄 Kiểm tra lại port 80:"
    if sudo lsof -t -i:80 >/dev/null 2>&1; then
        echo "❌ Port 80 vẫn đang được sử dụng"
        sudo lsof -i:80
    else
        echo "✅ Port 80 đã trống!"
        echo ""
        echo "📝 Bây giờ bạn có thể chạy:"
        echo "   docker compose up -d"
    fi
else
    echo "⚠️  Bạn cần tự dừng process đang dùng port 80"
fi

