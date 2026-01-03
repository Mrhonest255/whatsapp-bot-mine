/**
 * Booking Flow Handler
 * Manages stateful booking conversations and storage
 * Enhanced with dynamic pricing and AI support
 */

const fs = require('fs');
const path = require('path');
const { 
    getTourById, 
    getDayTours,
    getPriceForPax,
    formatMainMenu, 
    formatDayToursMenu,
    formatPackageMenu,
    formatSafariMenu,
    formatTourDetails,
    PICKUP_AREAS,
    PICKUP_LABELS,
    packageTours,
    safariTours,
    dayToursStone
} = require('./tours');
const { generateBookingId } = require('../utils/generateBookingId');
const { getMessage, isSwahili } = require('../utils/language');

// Storage paths
const BOOKINGS_FILE = path.join(__dirname, '..', 'storage', 'bookings.json');

// In-memory state for active booking sessions
const userSessions = new Map();

// Rate limiting map
const rateLimiter = new Map();
const RATE_LIMIT_WINDOW = 1000; // 1 second between messages

// Booking flow states
const STATES = {
    IDLE: 'idle',
    MAIN_MENU: 'main_menu',
    SELECTING_PICKUP: 'selecting_pickup',
    SELECTING_DAY_TOUR: 'selecting_day_tour',
    SELECTING_PACKAGE: 'selecting_package',
    SELECTING_SAFARI: 'selecting_safari',
    ENTERING_PAX: 'entering_pax',
    ENTERING_DATE: 'entering_date',
    AI_CHAT: 'ai_chat'
};

// Admin configuration
const ADMIN_NUMBER = '255688774043';

/**
 * Initialize bookings file
 */
function initializeBookingsFile() {
    const storageDir = path.dirname(BOOKINGS_FILE);
    if (!fs.existsSync(storageDir)) {
        fs.mkdirSync(storageDir, { recursive: true });
    }
    if (!fs.existsSync(BOOKINGS_FILE)) {
        fs.writeFileSync(BOOKINGS_FILE, JSON.stringify([], null, 2));
        console.log('📁 Created bookings.json');
    }
}

/**
 * Check rate limiting for a user
 * @param {string} phoneNumber - User's phone number
 * @returns {boolean} True if should process, false if rate limited
 */
function checkRateLimit(phoneNumber) {
    const now = Date.now();
    const lastMessage = rateLimiter.get(phoneNumber);
    
    if (lastMessage && (now - lastMessage) < RATE_LIMIT_WINDOW) {
        return false; // Rate limited
    }
    
    rateLimiter.set(phoneNumber, now);
    return true;
}

/**
 * Get or create user session
 */
function getSession(phoneNumber) {
    if (!userSessions.has(phoneNumber)) {
        userSessions.set(phoneNumber, {
            state: STATES.IDLE,
            language: 'en',
            pickupArea: PICKUP_AREAS.STONE_TOWN,
            booking: {},
            lastActivity: Date.now()
        });
    }
    const session = userSessions.get(phoneNumber);
    session.lastActivity = Date.now();
    return session;
}

/**
 * Reset user session
 */
function resetSession(phoneNumber) {
    userSessions.set(phoneNumber, {
        state: STATES.IDLE,
        language: 'en',
        pickupArea: PICKUP_AREAS.STONE_TOWN,
        booking: {},
        lastActivity: Date.now()
    });
}

/**
 * Start booking - show main menu
 */
function startBookingFlow(phoneNumber, useSwahili = false) {
    const session = getSession(phoneNumber);
    session.state = STATES.MAIN_MENU;
    session.language = useSwahili ? 'sw' : 'en';
    session.booking = {};
    return formatMainMenu(session.language);
}

/**
 * Process main menu selection
 */
function processMainMenu(phoneNumber, selection) {
    const session = getSession(phoneNumber);
    const lang = session.language;
    const choice = parseInt(selection.trim());
    
    switch (choice) {
        case 1: // Day Tours
            session.state = STATES.SELECTING_PICKUP;
            const sw = lang === 'sw';
            return `📍 *${sw ? 'Wapi Unaishi?' : 'Where is your pickup location?'}*\n\n` +
                   `1️⃣ Stone Town / Town Area\n` +
                   `2️⃣ North Zanzibar (Nungwi, Kendwa)\n` +
                   `3️⃣ South/East Zanzibar (Paje, Jambiani)\n\n` +
                   `${sw ? 'Jibu na nambari' : 'Reply with number'}`;
        
        case 2: // Packages
            session.state = STATES.SELECTING_PACKAGE;
            return formatPackageMenu(lang);
        
        case 3: // Safaris
            session.state = STATES.SELECTING_SAFARI;
            return formatSafariMenu(lang);
        
        case 4: // AI Chat
            session.state = STATES.AI_CHAT;
            const msg = lang === 'sw' 
                ? `💬 *Hali ya Mazungumzo*\n\nSasa unaweza kuuliza swali lolote kuhusu ziara zetu, bei, au Zanzibar. Nitakusaidia!\n\n_Andika "menu" kurudi kwenye menyu_`
                : `💬 *Chat Mode*\n\nYou can now ask me anything about our tours, pricing, or Zanzibar. I'm here to help!\n\n_Type "menu" to return to main menu_`;
            return msg;
        
        default:
            return lang === 'sw' 
                ? '❌ Tafadhali chagua 1-4'
                : '❌ Please select 1-4';
    }
}

/**
 * Process pickup area selection
 */
function processPickupSelection(phoneNumber, selection) {
    const session = getSession(phoneNumber);
    const lang = session.language;
    const choice = parseInt(selection.trim());
    
    if (choice === 1) {
        session.pickupArea = PICKUP_AREAS.STONE_TOWN;
    } else if (choice === 2 || choice === 3) {
        session.pickupArea = PICKUP_AREAS.NORTH_SOUTH;
    } else {
        return { success: false, message: lang === 'sw' ? '❌ Chagua 1-3' : '❌ Select 1-3' };
    }
    
    session.state = STATES.SELECTING_DAY_TOUR;
    return { 
        success: true, 
        message: formatDayToursMenu(session.pickupArea, lang) 
    };
}

/**
 * Process day tour selection
 */
function processDayTourSelection(phoneNumber, selection) {
    const session = getSession(phoneNumber);
    const lang = session.language;
    const tourIndex = parseInt(selection.trim());
    
    const tours = getDayTours(session.pickupArea);
    
    if (isNaN(tourIndex) || tourIndex < 1 || tourIndex > tours.length) {
        return {
            success: false,
            message: lang === 'sw' ? '❌ Nambari si sahihi' : '❌ Invalid selection'
        };
    }
    
    const tour = tours[tourIndex - 1];
    session.booking.tourId = tour.id;
    session.booking.tourName = tour.name;
    session.booking.tourEmoji = tour.emoji;
    session.booking.pricing = tour.pricing;
    session.booking.pickupArea = session.pickupArea;
    session.state = STATES.ENTERING_PAX;
    
    let msg = formatTourDetails(tour, lang);
    msg += `\n\n👥 *${lang === 'sw' ? 'Watu wangapi?' : 'How many people?'}*`;
    
    return { success: true, message: msg };
}

/**
 * Process package selection
 */
function processPackageSelection(phoneNumber, selection) {
    const session = getSession(phoneNumber);
    const lang = session.language;
    const pkgIndex = parseInt(selection.trim());
    
    if (isNaN(pkgIndex) || pkgIndex < 1 || pkgIndex > packageTours.length) {
        return { success: false, message: lang === 'sw' ? '❌ Nambari si sahihi' : '❌ Invalid selection' };
    }
    
    const pkg = packageTours[pkgIndex - 1];
    session.booking.tourId = pkg.id;
    session.booking.tourName = pkg.name;
    session.booking.tourEmoji = pkg.emoji;
    session.booking.fixedPrice = pkg.price;
    session.state = STATES.ENTERING_PAX;
    
    let msg = `${pkg.emoji} *${pkg.name}*\n`;
    msg += `💰 $${pkg.price}/person\n\n`;
    msg += `👥 *${lang === 'sw' ? 'Watu wangapi?' : 'How many people?'}*`;
    
    return { success: true, message: msg };
}

/**
 * Process safari selection (simplified - directs to AI)
 */
function processSafariSelection(phoneNumber, message) {
    const session = getSession(phoneNumber);
    session.state = STATES.AI_CHAT;
    return {
        useAI: true,
        message: message
    };
}

/**
 * Process number of people with dynamic pricing
 */
function processPax(phoneNumber, input) {
    const session = getSession(phoneNumber);
    const lang = session.language;
    const pax = parseInt(input.trim());
    
    if (isNaN(pax) || pax < 1 || pax > 50) {
        return { success: false, message: getMessage('invalidNumber', lang) };
    }
    
    session.booking.pax = pax;
    
    // Calculate price based on PAX
    let pricePerPerson;
    if (session.booking.fixedPrice) {
        pricePerPerson = session.booking.fixedPrice;
    } else if (session.booking.pricing) {
        pricePerPerson = getPriceForPax(session.booking.pricing, pax);
    } else {
        pricePerPerson = 50; // fallback
    }
    
    session.booking.pricePerPerson = pricePerPerson;
    session.booking.totalPrice = pricePerPerson * pax;
    session.state = STATES.ENTERING_DATE;
    
    const sw = lang === 'sw';
    let msg = `👥 *${pax} ${pax === 1 ? 'person' : 'people'}*\n`;
    msg += `💰 ${sw ? 'Bei kwa mtu' : 'Price per person'}: *$${pricePerPerson}*\n`;
    msg += `💵 ${sw ? 'Jumla' : 'Total'}: *$${session.booking.totalPrice}*\n\n`;
    msg += `📅 *${sw ? 'Tarehe gani?' : 'What date?'}*\n`;
    msg += `_${sw ? 'Muundo' : 'Format'}: DD/MM/YYYY_`;
    
    return { success: true, message: msg };
}

/**
 * Validate date format and check if in future
 * @param {string} dateStr - Date string in DD/MM/YYYY format
 * @returns {Object} Validation result
 */
function validateDate(dateStr) {
    const pattern = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    const match = dateStr.trim().match(pattern);
    
    if (!match) {
        return { valid: false, reason: 'format' };
    }
    
    const day = parseInt(match[1]);
    const month = parseInt(match[2]);
    const year = parseInt(match[3]);
    
    // Basic validation
    if (month < 1 || month > 12) {
        return { valid: false, reason: 'format' };
    }
    
    if (day < 1 || day > 31) {
        return { valid: false, reason: 'format' };
    }
    
    // Check if date is valid
    const date = new Date(year, month - 1, day);
    if (date.getDate() !== day || date.getMonth() !== month - 1) {
        return { valid: false, reason: 'format' };
    }
    
    // Check if date is in the future
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (date < today) {
        return { valid: false, reason: 'past' };
    }
    
    // Format date consistently
    const formattedDate = `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
    
    return { valid: true, date: formattedDate };
}

/**
 * Process tour date and complete booking
 */
function processDate(phoneNumber, input) {
    const session = getSession(phoneNumber);
    const lang = session.language;
    const validation = validateDate(input);
    
    if (!validation.valid) {
        return {
            success: false,
            message: validation.reason === 'past' ? getMessage('pastDate', lang) : getMessage('invalidDate', lang)
        };
    }
    
    const bookingId = generateBookingId();
    const pickupLabel = session.pickupArea ? PICKUP_LABELS[session.pickupArea]?.en : 'Stone Town';
    
    const booking = {
        bookingId,
        phoneNumber: phoneNumber.replace('@s.whatsapp.net', ''),
        tourName: session.booking.tourName,
        tourId: session.booking.tourId,
        pax: session.booking.pax,
        pricePerPerson: session.booking.pricePerPerson || session.booking.fixedPrice,
        totalPrice: session.booking.totalPrice,
        pickupArea: pickupLabel,
        date: validation.date,
        timestamp: new Date().toISOString(),
        status: 'pending'
    };
    
    saveBooking(booking);
    resetSession(phoneNumber);
    
    return {
        success: true,
        completed: true,
        booking,
        message: buildConfirmationMessage(booking, lang)
    };
}

/**
 * Build booking confirmation message
 */
function buildConfirmationMessage(booking, lang = 'en') {
    const sw = lang === 'sw';
    let msg = `✅ *${sw ? 'UHIFADHI UMEKAMILIKA!' : 'BOOKING CONFIRMED!'}*\n\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `🎯 ${sw ? 'Ziara' : 'Tour'}: *${booking.tourName}*\n`;
    msg += `👥 ${sw ? 'Watu' : 'People'}: *${booking.pax}*\n`;
    msg += `📅 ${sw ? 'Tarehe' : 'Date'}: *${booking.date}*\n`;
    if (booking.pickupArea) {
        msg += `📍 Pickup: *${booking.pickupArea}*\n`;
    }
    msg += `💰 ${sw ? 'Bei/mtu' : 'Price/person'}: *$${booking.pricePerPerson}*\n`;
    msg += `💵 ${sw ? 'Jumla' : 'Total'}: *$${booking.totalPrice}*\n`;
    msg += `🔖 Booking ID: *${booking.bookingId}*\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
    msg += `📞 ${sw ? 'Wakala wetu atawasiliana nawe hivi karibuni.' : 'Our agent will contact you shortly.'}\n`;
    msg += `🙏 Asante sana!`;
    return msg;
}

/**
 * Build admin notification
 */
function buildAdminNotification(booking) {
    let msg = `🔔 *NEW TOUR BOOKING*\n\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `🎯 Tour: *${booking.tourName}*\n`;
    msg += `👥 People: *${booking.pax}*\n`;
    msg += `📅 Date: *${booking.date}*\n`;
    if (booking.pickupArea) {
        msg += `📍 Pickup: *${booking.pickupArea}*\n`;
    }
    msg += `💰 Per Person: *$${booking.pricePerPerson}*\n`;
    msg += `💵 Total: *$${booking.totalPrice}*\n`;
    msg += `📱 Client: *+${booking.phoneNumber}*\n`;
    msg += `🔖 ID: *${booking.bookingId}*\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `⏰ ${new Date().toLocaleString()}`;
    return msg;
}

/**
 * Save booking to JSON file
 * @param {Object} booking - Booking object
 */
function saveBooking(booking) {
    try {
        initializeBookingsFile();
        
        let bookings = [];
        
        try {
            const data = fs.readFileSync(BOOKINGS_FILE, 'utf8');
            bookings = JSON.parse(data);
        } catch (error) {
            bookings = [];
        }
        
        bookings.push(booking);
        
        fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(bookings, null, 2));
        
        console.log(`💾 Booking saved: ${booking.bookingId}`);
        
    } catch (error) {
        console.error('❌ Error saving booking:', error.message);
    }
}

/**
 * Get all bookings
 * @returns {Array} Array of bookings
 */
function getAllBookings() {
    try {
        initializeBookingsFile();
        const data = fs.readFileSync(BOOKINGS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

/**
 * Get user's current state
 * @param {string} phoneNumber - User's phone number
 * @returns {string} Current state
 */
function getUserState(phoneNumber) {
    const session = getSession(phoneNumber);
    return session.state;
}

/**
 * Get admin WhatsApp JID
 * @returns {string} Admin JID
 */
function getAdminJid() {
    return `${ADMIN_NUMBER}@s.whatsapp.net`;
}

/**
 * Clean up old sessions (call periodically)
 */
function cleanupOldSessions() {
    const maxAge = 30 * 60 * 1000; // 30 minutes
    const now = Date.now();
    
    for (const [phone, session] of userSessions.entries()) {
        if (now - session.lastActivity > maxAge) {
            userSessions.delete(phone);
        }
    }
}

// Clean up sessions every 15 minutes
setInterval(cleanupOldSessions, 15 * 60 * 1000);

module.exports = {
    STATES,
    ADMIN_NUMBER,
    PICKUP_AREAS,
    getSession,
    resetSession,
    getUserState,
    checkRateLimit,
    startBookingFlow,
    processMainMenu,
    processPickupSelection,
    processDayTourSelection,
    processPackageSelection,
    processSafariSelection,
    processPax,
    processDate,
    buildAdminNotification,
    getAdminJid,
    getAllBookings,
    initializeBookingsFile
};
