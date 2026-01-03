# 🌴 WhatsApp Multi-Tenant Bot - VPS Deployment Guide

## 📋 Server Information
- **VPS IP**: 185.116.236.205
- **Admin Panel**: http://185.116.236.205:3000
- **OS**: Ubuntu 20.04+ (recommended)
- **Node.js**: v18+ required

---

## 🚀 Quick Deployment (Automated)

### Option 1: One-Command Deployment

```bash
# SSH into your VPS
ssh root@185.116.236.205

# Run deployment script
curl -fsSL https://raw.githubusercontent.com/Mrhonest255/whatsapp-bot-mine/main/deploy.sh | bash
```

---

## 📝 Manual Deployment Steps

### 1. Connect to VPS

```bash
ssh root@185.116.236.205
```

### 2. Update System

```bash
sudo apt update && sudo apt upgrade -y
```

### 3. Install Node.js 18+

```bash
# Using NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version
npm --version
```

### 4. Install PM2

```bash
sudo npm install -g pm2
```

### 5. Clone Repository

```bash
cd /root
git clone https://github.com/Mrhonest255/whatsapp-bot-mine.git whatsapp-bot
cd whatsapp-bot
```

### 6. Install Dependencies

```bash
npm install
```

### 7. Create Storage Directories

```bash
mkdir -p storage/sessions
mkdir -p storage/companies
mkdir -p logs
chmod -R 755 storage
chmod -R 755 logs
```

### 8. Configure Firewall

```bash
sudo ufw allow 3000/tcp
sudo ufw allow 22/tcp
sudo ufw --force enable
```

### 9. Start Bot with PM2

```bash
pm2 start ecosystem.config.json
pm2 save
pm2 startup systemd
```

---

## 🔧 Bot Management Commands

### View Status
```bash
pm2 status
```

### View Logs
```bash
pm2 logs whatsapp-multi-tenant
pm2 logs --lines 100
```

### Restart Bot
```bash
pm2 restart whatsapp-multi-tenant
```

### Stop Bot
```bash
pm2 stop whatsapp-multi-tenant
```

### Monitor Resources
```bash
pm2 monit
```

### Update Code
```bash
cd /root/whatsapp-bot
git pull
npm install
pm2 restart whatsapp-multi-tenant
```

---

## 🌐 Access Admin Panel

1. Open browser: http://185.116.236.205:3000
2. Click "➕ Add New Company"
3. Fill in company details
4. Click "🚀 Start Bot" 
5. Scan QR code with WhatsApp

---

## 🔐 Security Recommendations

### 1. Setup SSH Key Authentication

```bash
# On your local computer
ssh-keygen -t rsa -b 4096

# Copy to VPS
ssh-copy-id root@185.116.236.205
```

### 2. Disable Password Authentication

```bash
# On VPS
sudo nano /etc/ssh/sshd_config

# Change these lines:
PasswordAuthentication no
PermitRootLogin prohibit-password

# Restart SSH
sudo systemctl restart sshd
```

### 3. Setup Nginx Reverse Proxy (Optional)

```bash
sudo apt install -y nginx

# Create config
sudo nano /etc/nginx/sites-available/whatsapp-bot

# Add:
server {
    listen 80;
    server_name 185.116.236.205;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable config
sudo ln -s /etc/nginx/sites-available/whatsapp-bot /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 🔍 Troubleshooting

### Bot Not Starting
```bash
# Check logs
pm2 logs whatsapp-multi-tenant --lines 50

# Check Node.js version
node --version  # Should be 18+

# Reinstall dependencies
cd /root/whatsapp-bot
rm -rf node_modules package-lock.json
npm install
pm2 restart whatsapp-multi-tenant
```

### Port 3000 Already in Use
```bash
# Find process using port 3000
sudo lsof -i :3000

# Kill process
sudo kill -9 <PID>

# Or change port in ecosystem.config.json
```

### QR Code Not Appearing
```bash
# Check if bot is running
pm2 status

# Restart specific company bot from admin panel
# Or restart entire application
pm2 restart whatsapp-multi-tenant
```

### Out of Memory
```bash
# Increase PM2 memory limit in ecosystem.config.json
"max_memory_restart": "1G"

# Restart
pm2 restart whatsapp-multi-tenant
```

---

## 📊 Monitoring

### Check System Resources
```bash
# CPU and Memory
htop

# Disk space
df -h

# PM2 monitoring
pm2 monit
```

### Setup Email Alerts (Optional)
```bash
# Install PM2 email module
pm2 install pm2-email

# Configure
pm2 set pm2-email:email your-email@example.com
```

---

## 🔄 Auto-Updates

### Create Update Script
```bash
nano /root/update-bot.sh
```

Add:
```bash
#!/bin/bash
cd /root/whatsapp-bot
git pull
npm install
pm2 restart whatsapp-multi-tenant
echo "Bot updated: $(date)" >> /root/update.log
```

Make executable:
```bash
chmod +x /root/update-bot.sh
```

### Schedule with Cron (Daily at 3 AM)
```bash
crontab -e

# Add:
0 3 * * * /root/update-bot.sh
```

---

## 🆘 Support

- **GitHub**: https://github.com/Mrhonest255/whatsapp-bot-mine
- **Issues**: Report bugs via GitHub Issues

---

## ✅ Checklist

- [ ] VPS accessible via SSH
- [ ] Node.js 18+ installed
- [ ] PM2 installed
- [ ] Repository cloned
- [ ] Dependencies installed
- [ ] Firewall configured
- [ ] Bot started with PM2
- [ ] Admin panel accessible
- [ ] Company added and QR scanned
- [ ] Bot responding to messages

---

🎉 **Your multi-tenant WhatsApp bot is now live!**
