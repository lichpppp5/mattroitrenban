#!/bin/bash

# Script to install Docker and Docker Compose on Ubuntu/Debian
set -e

echo "🐳 Installing Docker and Docker Compose..."

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Please run as root (use sudo)"
    exit 1
fi

# Update package index
echo "📦 Updating package index..."
apt-get update

# Install prerequisites
echo "📦 Installing prerequisites..."
apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Add Docker's official GPG key
echo "🔑 Adding Docker GPG key..."
mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Set up Docker repository
echo "📝 Setting up Docker repository..."
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
echo "🔨 Installing Docker Engine..."
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Start and enable Docker
echo "🚀 Starting Docker..."
systemctl start docker
systemctl enable docker

# Verify installation
echo ""
echo "✅ Installation complete!"
echo ""
echo "📊 Docker version:"
docker --version

echo ""
echo "📊 Docker Compose version:"
docker compose version

echo ""
echo "✅ Docker and Docker Compose are now installed!"
echo "   Run './deploy.sh' to start deployment."

