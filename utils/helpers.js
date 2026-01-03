/**
 * Helper Utilities
 * Common helper functions for the bot
 */

/**
 * Format currency
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code
 * @returns {string} Formatted amount
 */
function formatCurrency(amount, currency = 'USD') {
    return `$${amount.toLocaleString()}`;
}

/**
 * Format phone number for display
 * @param {string} phone - Phone number
 * @returns {string} Formatted phone
 */
function formatPhone(phone) {
    const clean = phone.replace(/\D/g, '');
    if (clean.startsWith('255')) {
        return `+${clean.slice(0, 3)} ${clean.slice(3, 6)} ${clean.slice(6)}`;
    }
    return `+${clean}`;
}

/**
 * Get time-based greeting
 * @param {string} lang - Language code
 * @returns {string} Greeting
 */
function getGreeting(lang = 'en') {
    const hour = new Date().getHours();
    
    if (lang === 'sw') {
        if (hour < 12) return 'Habari za asubuhi';
        if (hour < 17) return 'Habari za mchana';
        return 'Habari za jioni';
    }
    
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
}

/**
 * Parse date from various formats
 * @param {string} dateStr - Date string
 * @returns {Date|null} Parsed date
 */
function parseDate(dateStr) {
    // Try DD/MM/YYYY
    let match = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (match) {
        return new Date(match[3], match[2] - 1, match[1]);
    }
    
    // Try DD-MM-YYYY
    match = dateStr.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
    if (match) {
        return new Date(match[3], match[2] - 1, match[1]);
    }
    
    // Try natural language
    const lower = dateStr.toLowerCase();
    const today = new Date();
    
    if (lower === 'today' || lower === 'leo') {
        return today;
    }
    if (lower === 'tomorrow' || lower === 'kesho') {
        return new Date(today.setDate(today.getDate() + 1));
    }
    
    return null;
}

/**
 * Format date for display
 * @param {Date|string} date - Date to format
 * @param {string} lang - Language
 * @returns {string} Formatted date
 */
function formatDate(date, lang = 'en') {
    const d = typeof date === 'string' ? new Date(date) : date;
    
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    
    const locale = lang === 'sw' ? 'sw-TZ' : 'en-US';
    return d.toLocaleDateString(locale, options);
}

/**
 * Validate email
 * @param {string} email - Email to validate
 * @returns {boolean} Is valid
 */
function isValidEmail(email) {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(email);
}

/**
 * Validate phone number
 * @param {string} phone - Phone to validate
 * @returns {boolean} Is valid
 */
function isValidPhone(phone) {
    const clean = phone.replace(/\D/g, '');
    return clean.length >= 10 && clean.length <= 15;
}

/**
 * Calculate days until date
 * @param {string} dateStr - Date in DD/MM/YYYY
 * @returns {number} Days until
 */
function daysUntil(dateStr) {
    const match = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (!match) return -1;
    
    const target = new Date(match[3], match[2] - 1, match[1]);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const diff = target - today;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Max length
 * @returns {string} Truncated text
 */
function truncate(text, maxLength = 100) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
}

/**
 * Generate random string
 * @param {number} length - Length
 * @returns {string} Random string
 */
function randomString(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * Sleep/delay function
 * @param {number} ms - Milliseconds
 * @returns {Promise} Promise that resolves after delay
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Escape special characters for regex
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Check if string is numeric
 * @param {string} str - String to check
 * @returns {boolean} Is numeric
 */
function isNumeric(str) {
    return !isNaN(str) && !isNaN(parseFloat(str));
}

/**
 * Capitalize first letter
 * @param {string} str - String
 * @returns {string} Capitalized string
 */
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

module.exports = {
    formatCurrency,
    formatPhone,
    getGreeting,
    parseDate,
    formatDate,
    isValidEmail,
    isValidPhone,
    daysUntil,
    truncate,
    randomString,
    sleep,
    escapeRegex,
    isNumeric,
    capitalize
};
