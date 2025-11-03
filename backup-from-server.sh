#!/bin/bash

# Script to download full backup from production server
# Run this on your LOCAL machine to download backup from server

SERVER_USER="root"
SERVER_IP="44.207.127.115"
SERVER_PATH="/mattroitrenban"
LOCAL_BACKUP_DIR="./server_backups"

echo "📥 Downloading full backup from production server..."
echo ""

# Create local backup directory
mkdir -p "${LOCAL_BACKUP_DIR}"

# Step 1: Run backup on server
echo "1️⃣ Creating backup on server..."
ssh ${SERVER_USER}@${SERVER_IP} "cd ${SERVER_PATH} && chmod +x backup-full.sh && ./backup-full.sh"

if [ $? -ne 0 ]; then
    echo "❌ Failed to create backup on server"
    exit 1
fi

# Step 2: Get latest backup name from server
echo ""
echo "2️⃣ Finding latest backup on server..."
LATEST_BACKUP=$(ssh ${SERVER_USER}@${SERVER_IP} "cd ${SERVER_PATH}/backups && ls -t backup_full_*.tar.gz | head -1")

if [ -z "$LATEST_BACKUP" ]; then
    echo "❌ No backup found on server"
    exit 1
fi

echo "✅ Found backup: ${LATEST_BACKUP}"

# Step 3: Download backup file
echo ""
echo "3️⃣ Downloading backup..."
BACKUP_PATH="${SERVER_PATH}/backups/${LATEST_BACKUP}"
LOCAL_FILE="${LOCAL_BACKUP_DIR}/${LATEST_BACKUP}"

scp ${SERVER_USER}@${SERVER_IP}:${BACKUP_PATH} "${LOCAL_FILE}"

if [ $? -eq 0 ]; then
    FILE_SIZE=$(du -h "${LOCAL_FILE}" | cut -f1)
    echo "✅ Backup downloaded successfully!"
    echo ""
    echo "📊 Backup Information:"
    echo "   File: ${LOCAL_FILE}"
    echo "   Size: ${FILE_SIZE}"
    echo ""
    echo "💾 Backup saved to: ${LOCAL_BACKUP_DIR}/"
    echo ""
    echo "📋 To extract backup:"
    echo "   cd ${LOCAL_BACKUP_DIR}"
    echo "   tar -xzf ${LATEST_BACKUP}"
else
    echo "❌ Failed to download backup"
    exit 1
fi

# Optional: Clean up backup on server (ask first)
echo ""
read -p "🗑️  Delete backup from server to save space? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Deleting backup from server..."
    ssh ${SERVER_USER}@${SERVER_IP} "rm ${BACKUP_PATH}"
    echo "✅ Backup deleted from server"
else
    echo "⏭️  Keeping backup on server"
fi

echo ""
echo "✅ Done! Backup saved locally at: ${LOCAL_FILE}"

