#!/bin/bash

# Script to setup firewall rules (UFW) for web access
set -e

echo "🔥 Setting up firewall rules..."

# Check if UFW is installed
if ! command -v ufw >/dev/null 2>&1; then
    echo "📦 Installing UFW..."
    sudo apt-get update
    sudo apt-get install -y ufw
fi

echo "🔓 Allowing HTTP (port 80)..."
sudo ufw allow 80/tcp

echo "🔒 Allowing HTTPS (port 443)..."
sudo ufw allow 443/tcp

echo "📊 Allowing SSH (port 22) to prevent lockout..."
sudo ufw allow 22/tcp

# Enable UFW if not already enabled
if ! sudo ufw status | grep -q "Status: active"; then
    echo "✅ Enabling UFW..."
    sudo ufw --force enable
fi

echo ""
echo "📋 Current firewall status:"
sudo ufw status

echo ""
echo "✅ Firewall configured!"
echo "⚠️  Note: If you're on AWS EC2, you also need to configure Security Groups:"
echo "   1. Go to EC2 Console → Security Groups"
echo "   2. Select your instance's security group"
echo "   3. Add Inbound Rules:"
echo "      - Type: HTTP, Port: 80, Source: 0.0.0.0/0"
echo "      - Type: HTTPS, Port: 443, Source: 0.0.0.0/0"

