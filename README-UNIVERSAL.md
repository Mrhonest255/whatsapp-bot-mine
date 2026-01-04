# 🤖 Universal Business Bot

**WhatsApp Bot kwa Biashara Yoyote!** - Si utalii tu, bali mgahawa, hoteli, salon, duka, kliniki, na biashara nyingine zote.

## 🌟 Vipya (Features)

### ✅ Biashara 12+ Zinasaidiwa
- 🌴 **Utalii (Tourism)** - Tour operators, safaris
- 🏨 **Hoteli (Hotel)** - Hotels, lodges, guest houses
- 🍽️ **Mgahawa (Restaurant)** - Restaurants, cafes, delivery
- 💇 **Salon (Beauty)** - Hair salons, spas, barbers
- 🛒 **Duka (Retail)** - Shops, electronics, groceries
- 🏥 **Kliniki (Healthcare)** - Clinics, pharmacies
- 💪 **Gym (Fitness)** - Gyms, yoga, trainers
- 📚 **Elimu (Education)** - Schools, training centers
- 🚗 **Usafiri (Transport)** - Taxi, delivery, car rental
- 🎉 **Matukio (Events)** - Event planning, DJs
- 🔧 **Huduma (Services)** - Plumbers, electricians
- 🏠 **Nyumba (Real Estate)** - Property sales/rentals
- 🏢 **Nyingine (Other)** - Any other business

### ✅ Knowledge Base System
Kila biashara inaweza kuweka:
- **Huduma/Bidhaa** - Products, services, tours, menu items
- **Bei** - Pricing, rates
- **Maelezo** - Descriptions, details
- **FAQs** - Maswali yanayoulizwa mara kwa mara
- **AI Instructions** - Maelekezo maalum kwa bot

### ✅ Universal Order System
- Orders kwa duka
- Bookings kwa safari/hoteli
- Appointments kwa salon/kliniki
- Reservations kwa mgahawa
- Enrollments kwa elimu

### ✅ Multi-Tenant
- Biashara nyingi kwenye server moja
- Kila biashara ina bot yake
- Dashboard ya kusimamia zote

## 🚀 Jinsi ya Kuanza

### 1. Install Dependencies
```bash
cd tourism-bot
npm install
```

### 2. Anza Server
```bash
npm run multi
```
au
```bash
node index-multi.js
```

### 3. Fungua Dashboard
Fungua browser na enda: **http://localhost:3000**

### 4. Ongeza Biashara
1. Bonyeza "➕ Ongeza Biashara"
2. Chagua aina ya biashara (mgahawa, salon, duka, etc.)
3. Jaza maelezo ya biashara
4. Bonyeza "Hifadhi"

### 5. Anza Bot
1. Bonyeza "🚀 Anza Bot" kwa biashara yako
2. Scan QR code na WhatsApp
3. Bot iko tayari!

### 6. Ongeza Knowledge
1. Nenda tab "📚 Knowledge Base"
2. Chagua biashara yako
3. Ongeza huduma/bidhaa, bei, FAQs
4. Bot itajifunza yote!

## 📁 Muundo wa Folder

```
tourism-bot/
├── business-templates/        # 🆕 Mfumo mpya wa biashara zote
│   ├── index.js              # Business categories
│   ├── knowledgeBase.js      # Knowledge storage
│   ├── promptBuilder.js      # Dynamic AI prompts
│   └── orderSystem.js        # Universal orders
├── multi-tenant/             # Multi-company management
│   ├── manager.js
│   ├── tenantConnection.js
│   └── tenantMessageHandler.js
├── web/                      # Dashboard
│   ├── server.js             # API server
│   └── public/
│       └── index.html        # Admin panel
├── storage/
│   ├── companies.json        # Biashara
│   ├── orders.json           # Orders/bookings
│   └── knowledge/            # Knowledge bases
├── index-multi.js            # Main entry point
└── package.json
```

## 🔧 API Endpoints

### Companies
- `GET /api/companies` - Orodha ya biashara
- `POST /api/companies` - Ongeza biashara
- `DELETE /api/companies/:id` - Futa biashara
- `POST /api/companies/:id/start` - Anza bot

### Knowledge Base
- `GET /api/companies/:id/knowledge` - Pata knowledge
- `POST /api/companies/:id/knowledge/init` - Anzisha knowledge
- `PUT /api/companies/:id/knowledge/:section` - Update section
- `POST /api/companies/:id/knowledge/:section/items` - Ongeza item
- `PUT /api/companies/:id/knowledge/business` - Update business info
- `PUT /api/companies/:id/knowledge/ai` - Update AI settings

### Orders
- `GET /api/orders` - Orders zote
- `GET /api/companies/:id/orders` - Orders za biashara moja
- `POST /api/companies/:id/orders` - Unda order mpya
- `PATCH /api/orders/:orderId/status` - Update status

### Categories
- `GET /api/categories` - Orodha ya aina za biashara

## 💡 Mifano ya Biashara

### Mgahawa
```
Jina: Mama Ntilie Restaurant
Aina: restaurant
Knowledge:
  - Menu items na bei
  - Delivery areas
  - Operating hours
```

### Salon
```
Jina: Beauty Queens Salon
Aina: salon
Knowledge:
  - Huduma (haircut, braiding, etc.)
  - Bei
  - Stylists
```

### Duka
```
Jina: Tech Electronics Shop
Aina: retail
Knowledge:
  - Bidhaa na bei
  - Delivery options
  - Warranty info
```

## 🤖 AI Behavior

Bot inajifunza kulingana na:
1. **Business Type** - Aina ya biashara inabadilisha personality ya bot
2. **Knowledge Base** - Bei, huduma, FAQs - bot inajua yote
3. **Custom Instructions** - Unaweza kuongeza maelekezo maalum
4. **Conversation Memory** - Bot inakumbuka mazungumzo yote

## 📞 Contact

Kwa msaada zaidi, wasiliana na developer.

---

**Made with ❤️ for African Businesses**

🇹🇿 Tanzania | 🌍 Africa | 🌐 World
