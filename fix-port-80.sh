#!/bin/bash

# Script to fix port 80 conflict
set -e

echo "🔧 Fixing Port 80 Conflict..."
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# 1. Check what's using port 80
echo "1️⃣  Checking what's using port 80..."
echo ""

# Try different methods to find the process
PORT_80_PID=""
PORT_80_PROCESS=""

# Method 1: Using lsof
if command -v lsof >/dev/null 2>&1; then
    PORT_80_INFO=$(sudo lsof -i :80 2>/dev/null | grep LISTEN || true)
    if [ -n "$PORT_80_INFO" ]; then
        PORT_80_PID=$(echo "$PORT_80_INFO" | awk '{print $2}' | head -1)
        PORT_80_PROCESS=$(echo "$PORT_80_INFO" | awk '{print $1}' | head -1)
        echo -e "${YELLOW}⚠️  Port 80 is in use:${NC}"
        echo "$PORT_80_INFO"
        echo ""
    fi
fi

# Method 2: Using ss (if lsof didn't work)
if [ -z "$PORT_80_PID" ] && command -v ss >/dev/null 2>&1; then
    PORT_80_INFO=$(sudo ss -tlnp | grep ':80 ' || true)
    if [ -n "$PORT_80_INFO" ]; then
        echo -e "${YELLOW}⚠️  Port 80 is in use:${NC}"
        echo "$PORT_80_INFO"
        echo ""
        # Extract PID from ss output (format: users:(("nginx",pid=123,fd=3)))
        PORT_80_PID=$(echo "$PORT_80_INFO" | grep -oP 'pid=\K\d+' | head -1 || true)
    fi
fi

# Method 3: Using netstat (fallback)
if [ -z "$PORT_80_PID" ] && command -v netstat >/dev/null 2>&1; then
    PORT_80_INFO=$(sudo netstat -tlnp | grep ':80 ' || true)
    if [ -n "$PORT_80_INFO" ]; then
        echo -e "${YELLOW}⚠️  Port 80 is in use:${NC}"
        echo "$PORT_80_INFO"
        echo ""
        PORT_80_PID=$(echo "$PORT_80_INFO" | awk '{print $7}' | cut -d'/' -f1 | head -1 || true)
    fi
fi

# 2. Check if it's a Docker container
echo "2️⃣  Checking if it's a Docker container..."
if command -v docker >/dev/null 2>&1; then
    DOCKER_CONTAINER=$(docker ps --format "{{.Names}}\t{{.Ports}}" | grep ":80" || true)
    if [ -n "$DOCKER_CONTAINER" ]; then
        echo -e "${YELLOW}⚠️  Docker container using port 80:${NC}"
        echo "$DOCKER_CONTAINER"
        echo ""
        
        # Check if it's our nginx container
        if echo "$DOCKER_CONTAINER" | grep -q "mattroitrenban_nginx"; then
            echo -e "${BLUE}ℹ️  It's our nginx container (may be stuck)${NC}"
            echo "   Stopping it..."
            docker stop mattroitrenban_nginx 2>/dev/null || true
            docker rm mattroitrenban_nginx 2>/dev/null || true
            echo -e "${GREEN}✅ Stopped old nginx container${NC}"
            PORT_80_PID=""  # Clear PID since we handled it
        fi
    else
        echo -e "${GREEN}✅ No Docker container using port 80${NC}"
    fi
fi
echo ""

# 3. Check system services
echo "3️⃣  Checking system services..."
SYSTEM_SERVICES=("nginx" "apache2" "httpd" "lighttpd")
for service in "${SYSTEM_SERVICES[@]}"; do
    if systemctl is-active --quiet "$service" 2>/dev/null; then
        echo -e "${YELLOW}⚠️  System service '$service' is running${NC}"
        echo "   This may be using port 80"
    fi
done
echo ""

# 4. If we found a PID, show process details
if [ -n "$PORT_80_PID" ]; then
    echo "4️⃣  Process details (PID: $PORT_80_PID):"
    if [ -f "/proc/$PORT_80_PID/cmdline" ]; then
        CMDLINE=$(cat /proc/$PORT_80_PID/cmdline 2>/dev/null | tr '\0' ' ' || true)
        echo "   Command: $CMDLINE"
    fi
    if [ -f "/proc/$PORT_80_PID/comm" ]; then
        COMM=$(cat /proc/$PORT_80_PID/comm 2>/dev/null || true)
        echo "   Process: $COMM"
    fi
    echo ""
    
    # Ask to stop the process
    read -p "   Stop this process? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "   Stopping process $PORT_80_PID..."
        sudo kill "$PORT_80_PID" 2>/dev/null || sudo kill -9 "$PORT_80_PID" 2>/dev/null || echo "   (Could not stop process)"
        sleep 2
        echo -e "${GREEN}✅ Process stopped${NC}"
    else
        echo "   Skipped stopping process"
    fi
    echo ""
fi

# 5. Stop system services that might be using port 80
echo "5️⃣  Checking and stopping system services..."
for service in "${SYSTEM_SERVICES[@]}"; do
    if systemctl is-active --quiet "$service" 2>/dev/null; then
        echo -e "${YELLOW}⚠️  Stopping system service: $service${NC}"
        read -p "   Stop $service? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            sudo systemctl stop "$service" 2>/dev/null || echo "   (Could not stop $service)"
            sudo systemctl disable "$service" 2>/dev/null || echo "   (Could not disable $service)"
            echo -e "${GREEN}✅ Stopped $service${NC}"
        fi
    fi
done
echo ""

# 6. Verify port 80 is free
echo "6️⃣  Verifying port 80 is free..."
sleep 2
if command -v lsof >/dev/null 2>&1; then
    if sudo lsof -i :80 2>/dev/null | grep -q LISTEN; then
        echo -e "${RED}❌ Port 80 is still in use${NC}"
        sudo lsof -i :80
        echo ""
        echo "   Please manually stop the process or service using port 80"
        exit 1
    else
        echo -e "${GREEN}✅ Port 80 is now free${NC}"
    fi
elif command -v ss >/dev/null 2>&1; then
    if sudo ss -tlnp | grep -q ':80 '; then
        echo -e "${RED}❌ Port 80 is still in use${NC}"
        sudo ss -tlnp | grep ':80 '
        echo ""
        echo "   Please manually stop the process or service using port 80"
        exit 1
    else
        echo -e "${GREEN}✅ Port 80 is now free${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Could not verify (lsof/ss not available)${NC}"
fi
echo ""

# 7. Start nginx
echo "7️⃣  Starting nginx container..."
if command -v docker >/dev/null 2>&1; then
    if docker compose version >/dev/null 2>&1; then
        DOCKER_COMPOSE="docker compose"
    elif command -v docker-compose >/dev/null 2>&1; then
        DOCKER_COMPOSE="docker-compose"
    else
        echo -e "${RED}❌ Docker Compose not found${NC}"
        exit 1
    fi
    
    $DOCKER_COMPOSE up -d nginx
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Nginx started successfully${NC}"
        sleep 3
        $DOCKER_COMPOSE ps nginx
    else
        echo -e "${RED}❌ Failed to start nginx${NC}"
        echo "   Checking logs..."
        $DOCKER_COMPOSE logs nginx
        exit 1
    fi
else
    echo -e "${RED}❌ Docker not found${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Port 80 fix completed!${NC}"
echo ""
echo "📝 Next steps:"
echo "   Test nginx: curl http://localhost"
echo "   View logs:  docker compose logs -f nginx"
