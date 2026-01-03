# 🌴 Zanzibar Tourism WhatsApp Bot

A production-ready WhatsApp Multi-Device booking bot for tour operators in Zanzibar/Tanzania. Built with **@whiskeysockets/baileys** library using WhatsApp Web protocol and powered by **Google Gemini AI**.

## ✨ Features

- 📱 WhatsApp Multi-Device support
- 🤖 **AI-Powered Conversations** (Google Gemini 2.0 Flash)
- 💰 **Dynamic Pricing** based on PAX & pickup location
- 🗓️ Interactive tour booking flow
- 🌍 Bilingual support (English & Swahili)
- 📁 File-based storage (JSON)
- 🔄 Auto-reconnect on disconnect
- 📢 Admin notifications for new bookings
- 🚀 PM2 compatible for 24/7 operation

## 📦 Available Tours & Pricing

### Day Tours (Stone Town Pickup)

| Tour | 1 PAX | 2 PAX | 3 PAX | 4 PAX | 5+ PAX |
|------|-------|-------|-------|-------|--------|
| ⛵ Safari Blue | $100 | $80 | $70 | $60 | $55 |
| 🏛️ Stone Town Tour | $50 | $35 | $30 | $27 | $23 |
| 🐢 Prison Island | $85 | $70 | $55 | $45 | $40 |
| 🐒 Jozani Forest | $90 | $60 | $50 | $40 | $35 |
| 🏝️ Mnemba Island | $150 | $80 | $60 | $45 | $40 |
| 🐬 Dolphin Tour | $60 | $60 | $55 | $55 | $50 |
| 🤿 Submarine Tour | $179 | $179 | $165 | $160 | $155 |
| 🐴 Horse Riding | $152 | $122 | $112 | $92 | $82 |
| 🌿 Spice Farm | $45 | $35 | $30 | $25 | $20 |

### Package Tours

| Package | Price/Person |
|---------|-------------|
| 🐢🏖️ Prison Island + Nakupenda | $80 |
| 🏛️🐢🐒 Stone Town + Prison + Jozani | $120 |
| 🌿🏛️ Kilosa + Stone Town + Spice | $125 |
| 🐒🌿 Salam + Jozani + Spice | $150 |

### Tanzania Safaris

| Safari | Duration | From |
|--------|----------|------|
| 🦁 Mikumi NP | 1 Day | $470 |
| 🐘 Selous NP | 1 Day | $415 |
| 🦁 Mikumi NP | 2D/1N | $940 |
| 🦓 Serengeti NP | 2D/1N | $1,510 |
| 🦓 Serengeti NP | 3D/2N | $1,950 |

## 🛠️ Requirements

- **Node.js** 18.0.0 or higher
- **npm** or **yarn**
- **PM2** (for production deployment)
- Ubuntu VPS (recommended for production)

## 📁 Project Structure

```
tourism-bot/
├── index.js                 # Main entry point
├── bot/
│   ├── connection.js        # WhatsApp connection handler
│   ├── messageHandler.js    # Message processing with AI
│   ├── bookingFlow.js       # Booking state management
│   └── tours.js             # Complete tour & pricing data
├── storage/
│   ├── bookings.json        # Completed bookings
│   └── sessions/            # WhatsApp auth sessions
├── utils/
│   ├── generateBookingId.js # Booking ID generator
│   ├── language.js          # Language detection
│   └── gemini.js            # Gemini AI integration
├── package.json
└── README.md
```

## 🚀 Quick Start

### 1. Clone/Download the Project

```bash
cd tourism-bot
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Settings

Edit `bot/bookingFlow.js` - Admin WhatsApp number:
```javascript
const ADMIN_NUMBER = '255700000000';  // Your number
```

Edit `utils/gemini.js` - Gemini API Key (already configured):
```javascript
const GEMINI_API_KEY = 'your-api-key';
```

### 4. Start the Bot

```bash
npm start
```

### 5. Scan QR Code

When you first run the bot, a QR code will appear in the terminal:

```
📱 Scan this QR code with WhatsApp:

█▀▀▀▀▀█ ▄▄▄▄▄ █▀▀▀▀▀█
█ ███ █ █   █ █ ███ █
...

⏳ Waiting for QR code scan...
```

**To scan:**
1. Open WhatsApp on your phone
2. Go to **Settings** → **Linked Devices**
3. Tap **Link a Device**
4. Scan the QR code displayed in terminal

### 6. Bot is Ready! 🎉

Once connected, you'll see:

```
✅ ═══════════════════════════════════════════
   🌴 ZANZIBAR TOURISM BOT CONNECTED! 🇹🇿
═══════════════════════════════════════════════
📱 WhatsApp Number: +255XXXXXXXXX
⏰ Connected at: 1/3/2026, 10:30:00 AM
═══════════════════════════════════════════════

💬 Bot is now listening for messages...
```

## 💬 How It Works

### User Interaction Flow

1. **User sends:** `hi`, `hello`, `tour`, or Swahili greetings
2. **Bot shows:** Tour menu with 4 options
3. **User selects:** Tour number (1-4)
4. **Bot asks:** Number of people
5. **User replies:** Number (e.g., "3")
6. **Bot asks:** Preferred date
7. **User replies:** Date in DD/MM/YYYY format
8. **Bot confirms:** Booking with unique ID

### Sample Conversation

```
User: Hi

Bot: 🌴 Welcome to Zanzibar Tours 🇹🇿

Please choose a tour:

1️⃣ Stone Town Tour – $30
2️⃣ Prison Island – $40
3️⃣ Safari Blue – $70
4️⃣ Spice Farm – $25

📝 Reply with the number of your choice.

User: 3

Bot: ⛵ Safari Blue - $70

👥 How many people will be joining the tour?

User: 3

Bot: 👥 3 people
💰 Total: $210

📅 What is your preferred tour date?

Please reply in format: DD/MM/YYYY

User: 20/02/2026

Bot: ✅ Booking Received!

━━━━━━━━━━━━━━━━━━━━━
🎯 Tour: Safari Blue
👥 People: 3
📅 Date: 20/02/2026
💰 Total: $210
🔖 Booking ID: ZNZ-48392
━━━━━━━━━━━━━━━━━━━━━

📞 Our agent will contact you shortly.
Asante sana! 🙏
```

## 🖥️ Production Deployment (VPS)

### Install PM2

```bash
npm install -g pm2
```

### Start with PM2

```bash
# Start the bot
npm run pm2:start

# Or manually
pm2 start index.js --name zanzibar-bot
```

### PM2 Commands

```bash
# View logs
pm2 logs zanzibar-bot

# Restart bot
pm2 restart zanzibar-bot

# Stop bot
pm2 stop zanzibar-bot

# Delete from PM2
pm2 delete zanzibar-bot

# Monitor all processes
pm2 monit
```

### Auto-Start on Server Reboot

```bash
# Save current PM2 processes
pm2 save

# Generate startup script
pm2 startup

# Follow the instructions shown in terminal
```

### PM2 Ecosystem File (Optional)

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'zanzibar-bot',
    script: 'index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
```

Then start with:
```bash
pm2 start ecosystem.config.js
```

## 📊 Viewing Bookings

All bookings are saved to `storage/bookings.json`:

```json
[
  {
    "bookingId": "ZNZ-48392",
    "phoneNumber": "255712345678",
    "tourName": "Safari Blue",
    "tourId": 3,
    "pax": 3,
    "pricePerPerson": 70,
    "totalPrice": 210,
    "date": "20/02/2026",
    "timestamp": "2026-01-03T10:30:00.000Z",
    "status": "pending"
  }
]
```

## 🔧 Configuration Options

### Admin Notification

Edit `bot/bookingFlow.js`:

```javascript
const ADMIN_NUMBER = '255700000000'; // Your WhatsApp number
```

### Adding New Tours

Edit `bot/tours.js`:

```javascript
const tours = [
    {
        id: 1,
        name: 'Stone Town Tour',
        price: 30,
        currency: 'USD',
        description: 'Explore the historic Stone Town',
        duration: '3-4 hours'
    },
    // Add more tours here...
];
```

### Rate Limiting

Edit `bot/bookingFlow.js`:

```javascript
const RATE_LIMIT_WINDOW = 1000; // Milliseconds between messages
```

## ⚠️ Important Notes

### Security
- ❌ Do NOT share session files from `storage/sessions/`
- ❌ Do NOT use this for bulk messaging
- ✅ Only respond to incoming messages

### Session Management
- Session files are created automatically on first connection
- If logged out, delete `storage/sessions/` contents and restart
- Keep session files backed up for quick recovery

### WhatsApp Terms
- This bot uses unofficial WhatsApp Web protocol
- Use responsibly and in compliance with WhatsApp ToS
- Avoid sending bulk/spam messages

## 🐛 Troubleshooting

### QR Code Not Showing
```bash
# Clear sessions and restart
rm -rf storage/sessions/*
npm start
```

### Connection Drops Frequently
- Check internet stability
- Increase reconnect delay in `bot/connection.js`
- Ensure only one session is active

### Messages Not Sending
- Check if phone number format is correct
- Verify the bot is still connected
- Check PM2 logs for errors

### Bot Not Responding
- Ensure user sends entry keyword (`hi`, `hello`, etc.)
- Check if user is rate-limited
- Verify bot is running: `pm2 status`

## 📝 Logs

### Development
Logs appear directly in terminal with timestamps:
```
📨 [10:30:15] +255712345678: hi
📤 [10:30:16] → +255712345678: 🌴 Welcome to Zanzibar Tours...
```

### Production (PM2)
```bash
# Real-time logs
pm2 logs zanzibar-bot

# Save logs to file
pm2 logs zanzibar-bot --lines 1000 > bot.log
```

## 🔄 Updates

To update the bot:

```bash
# Stop the bot
pm2 stop zanzibar-bot

# Pull updates (if using git)
git pull origin main

# Install any new dependencies
npm install

# Restart
pm2 restart zanzibar-bot
```

## 📄 License

MIT License - Feel free to modify for your needs.

## 🤝 Support

For issues and questions:
- Check the troubleshooting section
- Review PM2 logs for errors
- Ensure Node.js version is 18+

---

**Built with ❤️ for Zanzibar Tourism**

*Powered by @whiskeysockets/baileys*
