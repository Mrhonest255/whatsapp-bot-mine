/**
 * Booking ID Generator
 * Generates unique booking IDs for Zanzibar Tours
 */

/**
 * Generate a unique booking ID
 * Format: ZNZ-XXXXX (where X is a random digit)
 * @returns {string} Unique booking ID
 */
function generateBookingId() {
    const prefix = 'ZNZ';
    const randomNum = Math.floor(10000 + Math.random() * 90000); // 5 digit number
    return `${prefix}-${randomNum}`;
}

/**
 * Validate booking ID format
 * @param {string} bookingId - Booking ID to validate
 * @returns {boolean} True if valid format
 */
function isValidBookingId(bookingId) {
    const pattern = /^ZNZ-\d{5}$/;
    return pattern.test(bookingId);
}

module.exports = {
    generateBookingId,
    isValidBookingId
};
