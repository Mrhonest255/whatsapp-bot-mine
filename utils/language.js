/**
 * Language Detection Utility
 * Detects Swahili keywords and handles multilingual responses
 */

// Swahili keywords that trigger Swahili responses
const swahiliKeywords = [
    'habari',
    'jambo',
    'karibu',
    'bei',
    'ziara',
    'safari',
    'sawa',
    'ndio',
    'hapana',
    'asante',
    'tafadhali',
    'nzuri',
    'vipi',
    'watu',
    'tarehe'
];

// Entry keywords for starting conversation (English)
const entryKeywordsEnglish = [
    'hi',
    'hello',
    'hey',
    'tour',
    'tours',
    'zanzibar',
    'booking',
    'book',
    'help',
    'start',
    'menu'
];

// Entry keywords for starting conversation (Swahili)
const entryKeywordsSwahili = [
    'habari',
    'jambo',
    'karibu',
    'ziara',
    'safari',
    'bei'
];

/**
 * Detect if message contains Swahili keywords
 * @param {string} message - User message
 * @returns {boolean} True if Swahili detected
 */
function isSwahili(message) {
    if (!message) return false;
    
    const lowerMessage = message.toLowerCase().trim();
    
    return swahiliKeywords.some(keyword => 
        lowerMessage.includes(keyword) || 
        lowerMessage.split(/\s+/).includes(keyword)
    );
}

/**
 * Check if message is an entry keyword (triggers menu)
 * @param {string} message - User message
 * @returns {boolean} True if entry keyword detected
 */
function isEntryKeyword(message) {
    if (!message) return false;
    
    const lowerMessage = message.toLowerCase().trim();
    const words = lowerMessage.split(/\s+/);
    
    // Check English keywords
    const isEnglish = entryKeywordsEnglish.some(keyword => 
        words.includes(keyword) || lowerMessage === keyword
    );
    
    // Check Swahili keywords
    const isSwahiliEntry = entryKeywordsSwahili.some(keyword => 
        words.includes(keyword) || lowerMessage === keyword
    );
    
    return isEnglish || isSwahiliEntry;
}

/**
 * Get language-specific messages
 */
const messages = {
    en: {
        welcome: '🌴 *Welcome to Zanzibar Tours* 🇹🇿',
        askPeople: '👥 How many people will be joining the tour?',
        askDate: '📅 What is your preferred tour date?\n\n_Please reply in format: DD/MM/YYYY_',
        invalidNumber: '❌ Please enter a valid number of people (1-50).',
        invalidDate: '❌ Please enter a valid date in format DD/MM/YYYY\n\n_Example: 20/02/2026_',
        pastDate: '❌ Please enter a future date.',
        bookingConfirmed: '✅ *Booking Received!*',
        tourLabel: '🎯 Tour',
        peopleLabel: '👥 People',
        dateLabel: '📅 Date',
        bookingIdLabel: '🔖 Booking ID',
        contactSoon: '\n📞 Our agent will contact you shortly.',
        thankYou: '\nAsante sana! 🙏',
        error: '❌ Something went wrong. Please try again or type *hi* to start over.',
        cancelled: '❌ Booking cancelled. Type *hi* to start again.',
        invalidTour: '❌ Please select a valid tour number (1-4).'
    },
    sw: {
        welcome: '🌴 *Karibu Zanzibar Tours* 🇹🇿',
        askPeople: '👥 Watu wangapi watashiriki ziara?',
        askDate: '📅 Tarehe gani ungependa?\n\n_Tafadhali jibu kwa muundo: DD/MM/YYYY_',
        invalidNumber: '❌ Tafadhali ingiza idadi sahihi ya watu (1-50).',
        invalidDate: '❌ Tafadhali ingiza tarehe sahihi kwa muundo DD/MM/YYYY\n\n_Mfano: 20/02/2026_',
        pastDate: '❌ Tafadhali ingiza tarehe ijayo.',
        bookingConfirmed: '✅ *Uhifadhi Umepokelewa!*',
        tourLabel: '🎯 Ziara',
        peopleLabel: '👥 Watu',
        dateLabel: '📅 Tarehe',
        bookingIdLabel: '🔖 Nambari ya Uhifadhi',
        contactSoon: '\n📞 Wakala wetu atawasiliana nawe hivi karibuni.',
        thankYou: '\nAsante sana! 🙏',
        error: '❌ Kuna tatizo. Tafadhali jaribu tena au andika *habari* kuanza upya.',
        cancelled: '❌ Uhifadhi umeghairiwa. Andika *habari* kuanza tena.',
        invalidTour: '❌ Tafadhali chagua nambari sahihi ya ziara (1-4).'
    }
};

/**
 * Get message in specified language
 * @param {string} key - Message key
 * @param {string} lang - Language code ('en' or 'sw')
 * @returns {string} Localized message
 */
function getMessage(key, lang = 'en') {
    const language = lang === 'sw' ? 'sw' : 'en';
    return messages[language][key] || messages.en[key] || key;
}

module.exports = {
    isSwahili,
    isEntryKeyword,
    getMessage,
    messages
};
