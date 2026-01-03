#!/bin/bash

# WhatsApp Multi-Tenant Bot Deployment Script
# VPS: 185.116.236.205

echo "🚀 Starting WhatsApp Multi-Tenant Bot Deployment..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Update system
echo -e "${YELLOW}📦 Updating system...${NC}"
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+ (using NodeSource)
echo -e "${YELLOW}📦 Installing Node.js...${NC}"
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify Node.js installation
echo -e "${GREEN}✅ Node.js version:${NC}"
node --version
npm --version

# Install PM2 globally
echo -e "${YELLOW}📦 Installing PM2...${NC}"
sudo npm install -g pm2

# Install Git
echo -e "${YELLOW}📦 Installing Git...${NC}"
sudo apt install -y git

# Create application directory
echo -e "${YELLOW}📁 Creating application directory...${NC}"
cd /root
mkdir -p whatsapp-bot
cd whatsapp-bot

# Clone repository
echo -e "${YELLOW}📥 Cloning repository...${NC}"
git clone https://github.com/Mrhonest255/whatsapp-bot-mine.git .

# Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm install

# Create necessary directories
echo -e "${YELLOW}📁 Creating storage directories...${NC}"
mkdir -p storage/sessions
mkdir -p storage/companies
mkdir -p logs

# Set correct permissions
chmod -R 755 storage
chmod -R 755 logs

# Install PM2 log rotate
echo -e "${YELLOW}📦 Installing PM2 log rotate...${NC}"
pm2 install pm2-logrotate

# Configure firewall
echo -e "${YELLOW}🔥 Configuring firewall...${NC}"
sudo ufw allow 3000/tcp
sudo ufw allow 22/tcp
sudo ufw --force enable

# Start application with PM2
echo -e "${YELLOW}🚀 Starting application...${NC}"
pm2 start ecosystem.config.json

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
echo -e "${YELLOW}⚙️ Setting up PM2 startup...${NC}"
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u root --hp /root
pm2 save

# Show status
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo "=========================================="
echo "📊 Application Status:"
echo "=========================================="
pm2 status

echo ""
echo "=========================================="
echo "🌐 Access Information:"
echo "=========================================="
echo "Admin Panel: http://185.116.236.205:3000"
echo "SSH: ssh root@185.116.236.205"
echo ""
echo "=========================================="
echo "📝 Useful Commands:"
echo "=========================================="
echo "View logs:        pm2 logs"
echo "Restart:          pm2 restart whatsapp-multi-tenant"
echo "Stop:             pm2 stop whatsapp-multi-tenant"
echo "Status:           pm2 status"
echo "Monitor:          pm2 monit"
echo ""
echo "🎉 Bot is now running!"
