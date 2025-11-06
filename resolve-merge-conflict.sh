#!/bin/bash

# Script to safely resolve merge conflicts on production server
set -e

echo "🔧 Resolving merge conflict on production server..."
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo -e "${RED}❌ Not a git repository${NC}"
    exit 1
fi

# Check if there are uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}⚠️  Uncommitted changes detected${NC}"
    echo ""
    echo "Files with changes:"
    git status --short
    echo ""
    
    # Check if nginx.conf has changes
    if git diff --quiet nginx.conf 2>/dev/null; then
        echo -e "${GREEN}✅ nginx.conf has no local changes${NC}"
    else
        echo -e "${YELLOW}⚠️  nginx.conf has local changes${NC}"
        echo ""
        echo "Local changes in nginx.conf:"
        git diff nginx.conf | head -30
        echo ""
        
        # Ask user what to do
        echo "Options:"
        echo "1. Stash changes and pull (recommended if changes are not important)"
        echo "2. Backup nginx.conf, pull, then merge manually"
        echo "3. Commit local changes first"
        echo ""
        read -p "Choose option (1/2/3): " choice
        
        case $choice in
            1)
                echo -e "${GREEN}Stashing changes...${NC}"
                git stash push -m "Stash before pull $(date +%Y%m%d_%H%M%S)"
                echo -e "${GREEN}✅ Changes stashed${NC}"
                ;;
            2)
                echo -e "${GREEN}Backing up nginx.conf...${NC}"
                cp nginx.conf nginx.conf.backup.$(date +%Y%m%d_%H%M%S)
                echo -e "${GREEN}✅ Backup created${NC}"
                git checkout nginx.conf
                echo -e "${GREEN}✅ nginx.conf reset to HEAD${NC}"
                ;;
            3)
                echo -e "${GREEN}Committing local changes...${NC}"
                git add nginx.conf
                git commit -m "chore: Local nginx.conf changes before pull"
                echo -e "${GREEN}✅ Changes committed${NC}"
                ;;
            *)
                echo -e "${RED}❌ Invalid option${NC}"
                exit 1
                ;;
        esac
    fi
fi

# Now pull
echo ""
echo -e "${GREEN}Pulling latest changes...${NC}"
git pull origin main

echo ""
echo -e "${GREEN}✅ Pull completed successfully!${NC}"

# If we stashed, show stash list
if [ -n "$(git stash list)" ]; then
    echo ""
    echo -e "${YELLOW}⚠️  You have stashed changes. To restore:${NC}"
    echo "   git stash pop"
    echo ""
    echo "To view stash:"
    echo "   git stash show -p"
fi

echo ""
echo "📝 Next steps:"
echo "1. Review changes: git log --oneline -5"
echo "2. If nginx.conf was updated, check diff: git diff HEAD~1 nginx.conf"
echo "3. Rebuild and restart: docker compose build app --no-cache && docker compose restart app nginx"
echo "4. Test the website"
echo ""
echo "✅ Done!"

