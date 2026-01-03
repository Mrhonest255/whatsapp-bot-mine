/**
 * Zanzibar Tours & Safari Pricing Data
 * Complete pricing structure with PAX-based and location-based pricing
 */

// ============================================
// PICKUP AREAS
// ============================================
const PICKUP_AREAS = {
    STONE_TOWN: 'stone_town',
    NORTH_SOUTH: 'north_south'
};

const PICKUP_LABELS = {
    stone_town: { en: 'Stone Town / Town Area', sw: 'Stone Town / Mjini' },
    north_south: { en: 'North/South Zanzibar', sw: 'Kaskazini/Kusini Zanzibar' }
};

// ============================================
// TOUR CATEGORIES
// ============================================
const TOUR_CATEGORIES = {
    DAY_TOUR: 'day_tour',
    PACKAGE: 'package',
    DAY_SAFARI: 'day_safari',
    MULTI_DAY_SAFARI: 'multi_day_safari'
};

// ============================================
// DAY TOURS - STONE TOWN PICKUP
// ============================================
const dayToursStone = [
    {
        id: 1,
        name: 'Safari Blue',
        emoji: '⛵',
        category: TOUR_CATEGORIES.DAY_TOUR,
        description: 'Full day sailing, snorkeling, sandbank visit & seafood lunch',
        duration: 'Full day (8-9 hours)',
        pricing: { 1: 100, 2: 80, 3: 70, 4: 60, '5+': 55 },
        highlights: ['Snorkeling', 'Sandbank', 'Seafood Lunch', 'Swimming']
    },
    {
        id: 2,
        name: 'Stone Town Tour',
        emoji: '🏛️',
        category: TOUR_CATEGORIES.DAY_TOUR,
        description: 'Explore UNESCO World Heritage historic Stone Town',
        duration: '3-4 hours',
        pricing: { 1: 50, 2: 35, 3: 30, 4: 27, '5+': 23 },
        highlights: ['House of Wonders', 'Old Fort', 'Markets', 'Slave Chambers']
    },
    {
        id: 3,
        name: 'Prison Island',
        emoji: '🐢',
        category: TOUR_CATEGORIES.DAY_TOUR,
        description: 'Visit historic Prison Island & giant Aldabra tortoises',
        duration: '4-5 hours',
        pricing: { 1: 85, 2: 70, 3: 55, 4: 45, '5+': 40 },
        highlights: ['Giant Tortoises', 'Beach Time', 'History Tour', 'Snorkeling']
    },
    {
        id: 4,
        name: 'Jozani Forest',
        emoji: '🐒',
        category: TOUR_CATEGORIES.DAY_TOUR,
        description: 'See rare Red Colobus monkeys in natural habitat',
        duration: '3-4 hours',
        pricing: { 1: 90, 2: 60, 3: 50, 4: 40, '5+': 35 },
        highlights: ['Red Colobus Monkeys', 'Mangrove Walk', 'Nature Trail']
    },
    {
        id: 5,
        name: 'Mnemba Island',
        emoji: '🏝️',
        category: TOUR_CATEGORIES.DAY_TOUR,
        description: 'Snorkeling paradise at Mnemba Atoll marine reserve',
        duration: 'Full day',
        pricing: { 1: 150, 2: 80, 3: 60, 4: 45, '5+': 40 },
        highlights: ['Crystal Clear Water', 'Dolphins', 'Tropical Fish', 'Coral Reefs']
    },
    {
        id: 6,
        name: 'Dolphin Tour (Kizimkazi)',
        emoji: '🐬',
        category: TOUR_CATEGORIES.DAY_TOUR,
        description: 'Swim with dolphins in their natural habitat',
        duration: '4-5 hours',
        pricing: { 1: 60, 2: 60, 3: 55, 4: 55, '5+': 50 },
        highlights: ['Dolphin Watching', 'Swimming', 'Old Mosque Visit', 'Beach']
    },
    {
        id: 7,
        name: 'Submarine Tour',
        emoji: '🤿',
        category: TOUR_CATEGORIES.DAY_TOUR,
        description: 'Underwater submarine experience viewing marine life',
        duration: '2-3 hours',
        pricing: { 1: 179, 2: 179, 3: 165, 4: 160, '5+': 155 },
        highlights: ['Underwater Views', 'Marine Life', 'Coral Reefs', 'Fish Species']
    },
    {
        id: 8,
        name: 'Horse Riding (30 min)',
        emoji: '🐴',
        category: TOUR_CATEGORIES.DAY_TOUR,
        description: 'Beach horse riding experience',
        duration: '30 minutes riding + transport',
        pricing: { 1: 152, 2: 122, 3: 112, 4: 92, '5+': 82 },
        highlights: ['Beach Riding', 'Sunset Option', 'Photo Opportunities']
    },
    {
        id: 9,
        name: 'Spice Farm Tour',
        emoji: '🌿',
        category: TOUR_CATEGORIES.DAY_TOUR,
        description: 'Discover the spices that made Zanzibar famous',
        duration: '3-4 hours',
        pricing: { 1: 45, 2: 35, 3: 30, 4: 25, '5+': 20 },
        highlights: ['Spice Tasting', 'Tropical Fruits', 'Local Cooking', 'Palm Climbing']
    }
];

// ============================================
// DAY TOURS - NORTH/SOUTH PICKUP
// ============================================
const dayToursNorth = [
    { id: 1, name: 'Safari Blue', emoji: '⛵', pricing: { 1: 154, 2: 110, 3: 90, 4: 70, '5+': 60 } },
    { id: 2, name: 'Stone Town Tour', emoji: '🏛️', pricing: { 1: 110, 2: 90, 3: 60, 4: 50, '5+': 40 } },
    { id: 3, name: 'Prison Island', emoji: '🐢', pricing: { 1: 115, 2: 90, 3: 80, 4: 70, '5+': 60 } },
    { id: 4, name: 'Jozani Forest', emoji: '🐒', pricing: { 1: 95, 2: 76, 3: 64, 4: 57, '5+': 45 } },
    { id: 5, name: 'Mnemba Island', emoji: '🏝️', pricing: { 1: 160, 2: 90, 3: 70, 4: 55, '5+': 50 } },
    { id: 6, name: 'Dolphin Tour', emoji: '🐬', pricing: { 1: 70, 2: 70, 3: 65, 4: 65, '5+': 60 } },
    { id: 7, name: 'Submarine Tour', emoji: '🤿', pricing: { 1: 235, 2: 215, 3: 190, 4: 170, '5+': 160 } },
    { id: 8, name: 'Horse Riding', emoji: '🐴', pricing: { 1: 155, 2: 125, 3: 118, 4: 95, '5+': 85 } },
    { id: 9, name: 'Spice Farm Tour', emoji: '🌿', pricing: { 1: 65, 2: 50, 3: 45, 4: 40, '5+': 35 } }
];

// ============================================
// PACKAGE TOURS (Combination Tours)
// ============================================
const packageTours = [
    {
        id: 101,
        name: 'Prison Island + Nakupenda',
        emoji: '🐢🏖️',
        category: TOUR_CATEGORIES.PACKAGE,
        description: 'Visit Prison Island and relax at Nakupenda sandbank',
        duration: 'Full day',
        price: 80,
        highlights: ['Giant Tortoises', 'Nakupenda Sandbank', 'Lunch Included', 'Swimming']
    },
    {
        id: 102,
        name: 'Stone Town + Prison + Jozani',
        emoji: '🏛️🐢🐒',
        category: TOUR_CATEGORIES.PACKAGE,
        description: 'Complete Zanzibar experience in one day',
        duration: 'Full day',
        price: 120,
        highlights: ['Stone Town History', 'Giant Tortoises', 'Red Colobus Monkeys']
    },
    {
        id: 103,
        name: 'Kilosa + Stone Town + Spice Tour',
        emoji: '🌿🏛️',
        category: TOUR_CATEGORIES.PACKAGE,
        description: 'Culture, history and spices combined',
        duration: 'Full day',
        price: 125,
        highlights: ['Local Village', 'Stone Town', 'Spice Farm', 'Local Lunch']
    },
    {
        id: 104,
        name: 'Salam + Jozani + Spice Tour',
        emoji: '🐒🌿',
        category: TOUR_CATEGORIES.PACKAGE,
        description: 'Nature and spice exploration',
        duration: 'Full day',
        price: 150,
        highlights: ['Jozani Forest', 'Red Colobus Monkeys', 'Spice Farm', 'Local Experience']
    }
];

// ============================================
// SAFARI TOURS - MAINLAND TANZANIA
// ============================================
const safariTours = [
    // Day Trip Safaris
    {
        id: 201,
        name: 'Mikumi National Park',
        emoji: '🦁',
        category: TOUR_CATEGORIES.DAY_SAFARI,
        description: 'Day trip safari to Mikumi - Tanzania\'s most accessible park',
        duration: '1 Day',
        pricing: { 1: 530, '2-3': 480, '4-5': 475, '6+': 470 },
        highlights: ['Big 5 Animals', 'Game Drive', 'Lunch Included', 'Flight Transfer']
    },
    {
        id: 202,
        name: 'Selous (Nyerere NP)',
        emoji: '🐘',
        category: TOUR_CATEGORIES.DAY_SAFARI,
        description: 'Day trip to Africa\'s largest game reserve',
        duration: '1 Day',
        pricing: { 1: 475, '2-3': 425, '4-5': 420, '6+': 415 },
        highlights: ['Wildlife Safari', 'Rufiji River', 'Boat Safari Option']
    },
    // 2 Days / 1 Night Safaris
    {
        id: 203,
        name: 'Mikumi NP (2D/1N)',
        emoji: '🦁',
        category: TOUR_CATEGORIES.MULTI_DAY_SAFARI,
        description: '2 days safari with overnight at lodge',
        duration: '2 Days / 1 Night',
        pricing: { 1: 1060, '2-3': 960, '4-5': 950, '6+': 940 },
        highlights: ['Extended Game Drives', 'Lodge Accommodation', 'All Meals']
    },
    {
        id: 204,
        name: 'Selous NP (2D/1N)',
        emoji: '🐘',
        category: TOUR_CATEGORIES.MULTI_DAY_SAFARI,
        description: '2 days Selous safari experience',
        duration: '2 Days / 1 Night',
        pricing: { 1: 950, '2-3': 850, '4-5': 840, '6+': 830 },
        highlights: ['Game Drives', 'Boat Safari', 'Bush Camp']
    },
    {
        id: 205,
        name: 'Serengeti NP (2D/1N)',
        emoji: '🦓',
        category: TOUR_CATEGORIES.MULTI_DAY_SAFARI,
        description: 'Fly to iconic Serengeti for 2 days',
        duration: '2 Days / 1 Night',
        pricing: { 1: 2050, '2-3': 1620, '4-5': 1610, '6+': 1510 },
        highlights: ['Great Migration', 'Endless Plains', 'Big Cats', 'Flight Included']
    },
    // 3 Days / 2 Nights Safaris
    {
        id: 206,
        name: 'Mikumi NP (3D/2N)',
        emoji: '🦁',
        category: TOUR_CATEGORIES.MULTI_DAY_SAFARI,
        description: '3 days immersive Mikumi experience',
        duration: '3 Days / 2 Nights',
        pricing: { 1: 1300, '2-3': 1220, '4-5': 1180, '6+': 1140 },
        highlights: ['Full Safari Experience', 'Multiple Game Drives', 'Lodge Stay']
    },
    {
        id: 207,
        name: 'Selous NP (3D/2N)',
        emoji: '🐘',
        category: TOUR_CATEGORIES.MULTI_DAY_SAFARI,
        description: '3 days exploring Selous wilderness',
        duration: '3 Days / 2 Nights',
        pricing: { 1: 1350, '2-3': 1200, '4-5': 1180, '6+': 1160 },
        highlights: ['Walking Safari', 'Boat Safari', 'Night Game Drive']
    },
    {
        id: 208,
        name: 'Serengeti NP (3D/2N)',
        emoji: '🦓',
        category: TOUR_CATEGORIES.MULTI_DAY_SAFARI,
        description: 'Ultimate Serengeti safari adventure',
        duration: '3 Days / 2 Nights',
        pricing: { 1: 3050, '2-3': 2300, '4-5': 2250, '6+': 1950 },
        highlights: ['Great Migration', 'Ngorongoro Option', 'Luxury Camps']
    }
];

// ============================================
// TOUR INCLUSIONS & EXCLUSIONS
// ============================================
const tourInclusions = [
    'Transport in 4×4 safari vehicle',
    'Accommodation (lodges/camps for multi-day)',
    'Meals as per itinerary',
    'Park entrance fees & taxes',
    'Professional English-speaking guide',
    'Bottled water & refreshments'
];

const tourExclusions = [
    'International flights',
    'Visa & passport fees',
    'Travel insurance',
    'Tips for guides/drivers',
    'Alcoholic beverages',
    'Personal expenses & souvenirs'
];

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get price for specific PAX count
 */
function getPriceForPax(pricing, pax) {
    if (pricing[pax]) return pricing[pax];
    if (pax >= 5 && pricing['5+']) return pricing['5+'];
    if (pax >= 6 && pricing['6+']) return pricing['6+'];
    
    // Handle safari pricing ranges
    if (pax >= 2 && pax <= 3 && pricing['2-3']) return pricing['2-3'];
    if (pax >= 4 && pax <= 5 && pricing['4-5']) return pricing['4-5'];
    if (pax >= 6 && pricing['6+']) return pricing['6+'];
    
    return pricing[1] || Object.values(pricing)[0];
}

/**
 * Get tour by ID with pickup area pricing
 */
function getTourById(id, pickupArea = PICKUP_AREAS.STONE_TOWN) {
    const tourId = parseInt(id);
    
    // Check day tours
    const tour = dayToursStone.find(t => t.id === tourId);
    if (tour) {
        if (pickupArea === PICKUP_AREAS.NORTH_SOUTH) {
            const northPricing = dayToursNorth.find(t => t.id === tourId);
            if (northPricing) return { ...tour, pricing: northPricing.pricing };
        }
        return tour;
    }
    
    // Check package tours
    const pkg = packageTours.find(t => t.id === tourId);
    if (pkg) return pkg;
    
    // Check safari tours
    const safari = safariTours.find(t => t.id === tourId);
    if (safari) return safari;
    
    return null;
}

/**
 * Get day tours by pickup area
 */
function getDayTours(pickupArea = PICKUP_AREAS.STONE_TOWN) {
    if (pickupArea === PICKUP_AREAS.NORTH_SOUTH) {
        return dayToursStone.map(tour => {
            const northPricing = dayToursNorth.find(t => t.id === tour.id);
            return northPricing ? { ...tour, pricing: northPricing.pricing } : tour;
        });
    }
    return dayToursStone;
}

/**
 * Format main menu
 */
function formatMainMenu(lang = 'en') {
    const sw = lang === 'sw';
    
    let menu = sw 
        ? `🌴 *KARIBU ZANZIBAR TOURS* 🇹🇿\n\n`
        : `🌴 *WELCOME TO ZANZIBAR TOURS* 🇹🇿\n\n`;
    
    menu += sw ? `Chagua aina ya ziara:\n\n` : `Choose tour type:\n\n`;
    menu += `1️⃣ ${sw ? 'Ziara za Siku' : 'Day Tours'} 🏝️\n`;
    menu += `2️⃣ ${sw ? 'Pakiti za Ziara' : 'Tour Packages'} 📦\n`;
    menu += `3️⃣ ${sw ? 'Safari Tanzania' : 'Tanzania Safaris'} 🦁\n`;
    menu += `4️⃣ ${sw ? 'Ongea na Msaidizi' : 'Chat with Assistant'} 💬\n\n`;
    menu += sw ? `📝 Jibu na nambari yako` : `📝 Reply with your choice`;
    
    return menu;
}

/**
 * Format day tours menu
 */
function formatDayToursMenu(pickupArea = PICKUP_AREAS.STONE_TOWN, lang = 'en') {
    const sw = lang === 'sw';
    const tours = getDayTours(pickupArea);
    const areaLabel = PICKUP_LABELS[pickupArea][lang];
    
    let menu = sw
        ? `🏝️ *ZIARA ZA SIKU*\n📍 ${areaLabel}\n\n`
        : `🏝️ *DAY TOURS*\n📍 ${areaLabel}\n\n`;
    
    tours.forEach((tour, idx) => {
        const minPrice = tour.pricing['5+'] || tour.pricing[4];
        const maxPrice = tour.pricing[1];
        menu += `${idx + 1}. ${tour.emoji} *${tour.name}*\n   💰 $${minPrice} - $${maxPrice}/person\n\n`;
    });
    
    menu += sw ? `\n📝 Jibu na nambari ya ziara` : `\n📝 Reply with tour number`;
    return menu;
}

/**
 * Format package tours menu
 */
function formatPackageMenu(lang = 'en') {
    const sw = lang === 'sw';
    
    let menu = sw
        ? `📦 *PAKITI ZA ZIARA*\n\n`
        : `📦 *TOUR PACKAGES*\n_Best value combinations_\n\n`;
    
    packageTours.forEach((pkg, idx) => {
        menu += `${idx + 1}. ${pkg.emoji} *${pkg.name}*\n   💰 $${pkg.price}/person\n   📝 ${pkg.description}\n\n`;
    });
    
    menu += sw ? `\n💬 Jibu na nambari` : `\n💬 Reply with number`;
    return menu;
}

/**
 * Format safari menu
 */
function formatSafariMenu(lang = 'en') {
    const sw = lang === 'sw';
    
    let menu = sw ? `🦁 *SAFARI TANZANIA*\n\n` : `🦁 *TANZANIA SAFARIS*\n\n`;
    
    menu += `*${sw ? 'Safari za Siku Moja' : 'Day Safaris'}:*\n`;
    safariTours.filter(s => s.category === TOUR_CATEGORIES.DAY_SAFARI).forEach(s => {
        const minPrice = s.pricing['6+'] || s.pricing['4-5'];
        menu += `• ${s.emoji} ${s.name} - from $${minPrice}\n`;
    });
    
    menu += `\n*${sw ? 'Siku 2/Usiku 1' : '2 Days / 1 Night'}:*\n`;
    safariTours.filter(s => s.id >= 203 && s.id <= 205).forEach(s => {
        const minPrice = s.pricing['6+'];
        menu += `• ${s.emoji} ${s.name} - from $${minPrice}\n`;
    });
    
    menu += `\n*${sw ? 'Siku 3/Usiku 2' : '3 Days / 2 Nights'}:*\n`;
    safariTours.filter(s => s.id >= 206).forEach(s => {
        const minPrice = s.pricing['6+'];
        menu += `• ${s.emoji} ${s.name} - from $${minPrice}\n`;
    });
    
    menu += sw ? `\n💬 Uliza kuhusu safari yoyote` : `\n💬 Ask about any safari`;
    return menu;
}

/**
 * Format tour details
 */
function formatTourDetails(tour, lang = 'en') {
    const sw = lang === 'sw';
    
    let msg = `${tour.emoji} *${tour.name}*\n━━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    if (tour.description) msg += `📝 ${tour.description}\n`;
    if (tour.duration) msg += `⏱️ ${sw ? 'Muda' : 'Duration'}: ${tour.duration}\n`;
    
    msg += `\n💰 *${sw ? 'Bei (USD/mtu)' : 'Pricing (USD/person)'}:*\n`;
    
    if (tour.pricing) {
        Object.entries(tour.pricing).forEach(([pax, price]) => {
            msg += `   👥 ${pax} PAX: *$${price}*\n`;
        });
    } else if (tour.price) {
        msg += `   *$${tour.price}* per person\n`;
    }
    
    if (tour.highlights?.length) {
        msg += `\n✨ *${sw ? 'Yaliyomo' : 'Highlights'}:*\n`;
        tour.highlights.forEach(h => msg += `   • ${h}\n`);
    }
    
    msg += `\n━━━━━━━━━━━━━━━━━━━━━`;
    return msg;
}

/**
 * Get all pricing as context for AI
 */
function getAllPricingContext() {
    let ctx = "ZANZIBAR TOURS COMPLETE PRICING:\n\n";
    
    ctx += "=== DAY TOURS (Stone Town pickup) ===\n";
    dayToursStone.forEach(t => {
        ctx += `${t.name}: 1pax=$${t.pricing[1]}, 2pax=$${t.pricing[2]}, 3pax=$${t.pricing[3]}, 4pax=$${t.pricing[4]}, 5+pax=$${t.pricing['5+']}\n`;
    });
    
    ctx += "\n=== DAY TOURS (North/South pickup - higher prices) ===\n";
    dayToursNorth.forEach(t => {
        ctx += `${t.name}: 1pax=$${t.pricing[1]}, 2pax=$${t.pricing[2]}, 3pax=$${t.pricing[3]}, 4pax=$${t.pricing[4]}, 5+pax=$${t.pricing['5+']}\n`;
    });
    
    ctx += "\n=== PACKAGE TOURS ===\n";
    packageTours.forEach(p => ctx += `${p.name}: $${p.price}/person - ${p.description}\n`);
    
    ctx += "\n=== TANZANIA SAFARIS ===\n";
    safariTours.forEach(s => {
        ctx += `${s.name} (${s.duration}): `;
        Object.entries(s.pricing).forEach(([k, v]) => ctx += `${k}=$${v}, `);
        ctx += "\n";
    });
    
    ctx += "\nINCLUDED: " + tourInclusions.join(', ');
    ctx += "\nEXCLUDED: " + tourExclusions.join(', ');
    
    return ctx;
}

// Legacy compatibility
const tours = dayToursStone;
function formatTourMenu() { return formatMainMenu('en'); }
function formatTourMenuSwahili() { return formatMainMenu('sw'); }
function getAllTours() { return [...dayToursStone, ...packageTours, ...safariTours]; }
function getNumberEmoji(n) {
    const e = ['0️⃣','1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟'];
    return n <= 10 ? e[n] : `${n}.`;
}

module.exports = {
    PICKUP_AREAS, PICKUP_LABELS, TOUR_CATEGORIES,
    dayToursStone, dayToursNorth, packageTours, safariTours,
    tourInclusions, tourExclusions, tours,
    getTourById, getDayTours, getPriceForPax,
    formatMainMenu, formatDayToursMenu, formatPackageMenu, formatSafariMenu,
    formatTourDetails, getAllPricingContext, getNumberEmoji,
    formatTourMenu, formatTourMenuSwahili, getAllTours
};

