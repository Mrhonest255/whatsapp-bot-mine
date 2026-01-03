/**
 * Message Handler
 * Processes incoming WhatsApp messages with AI support
 */

const { sendTextWithTyping } = require('./connection');
const { 
    STATES,
    getSession,
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
    getAdminJid
} = require('./bookingFlow');
const { isSwahili, isEntryKeyword, getMessage } = require('../utils/language');
const { generateResponse, shouldUseAI, getAIGreeting, clearHistory } = require('../utils/gemini');

/**
 * Extract text content from message
 * @param {Object} message - Baileys message object
 * @returns {string|null} Extracted text or null
 */
function extractMessageText(message) {
    const msg = message.message;
    
    if (!msg) return null;
    
    // Handle different message types
    if (msg.conversation) {
        return msg.conversation;
    }
    
    if (msg.extendedTextMessage?.text) {
        return msg.extendedTextMessage.text;
    }
    
    if (msg.imageMessage?.caption) {
        return msg.imageMessage.caption;
    }
    
    if (msg.videoMessage?.caption) {
        return msg.videoMessage.caption;
    }
    
    if (msg.buttonsResponseMessage?.selectedDisplayText) {
        return msg.buttonsResponseMessage.selectedDisplayText;
    }
    
    if (msg.listResponseMessage?.title) {
        return msg.listResponseMessage.title;
    }
    
    return null;
}

/**
 * Format phone number for display
 * @param {string} jid - WhatsApp JID
 * @returns {string} Formatted phone number
 */
function formatPhoneNumber(jid) {
    return jid.replace('@s.whatsapp.net', '').replace('@g.us', '');
}

/**
 * Log incoming message
 * @param {string} phoneNumber - Sender's phone number
 * @param {string} text - Message text
 */
function logMessage(phoneNumber, text) {
    const timestamp = new Date().toLocaleTimeString();
    const preview = text.length > 50 ? text.substring(0, 50) + '...' : text;
    console.log(`📨 [${timestamp}] +${phoneNumber}: ${preview}`);
}

/**
 * Log outgoing message
 * @param {string} phoneNumber - Recipient's phone number
 * @param {string} text - Message text
 */
function logOutgoing(phoneNumber, text) {
    const timestamp = new Date().toLocaleTimeString();
    const preview = text.length > 50 ? text.substring(0, 50) + '...' : text;
    console.log(`📤 [${timestamp}] → +${phoneNumber}: ${preview}`);
}

/**
 * Send admin notification for new booking
 * @param {Object} sock - WhatsApp socket
 * @param {Object} booking - Booking details
 */
async function notifyAdmin(sock, booking) {
    try {
        const adminJid = getAdminJid();
        const notification = buildAdminNotification(booking);
        
        await sock.sendMessage(adminJid, { text: notification });
        
        console.log(`📢 Admin notified about booking: ${booking.bookingId}`);
        
    } catch (error) {
        console.error('❌ Failed to notify admin:', error.message);
    }
}

/**
 * Main message handler with AI support
 */
async function handleMessage(sock, message) {
    try {
        const jid = message.key.remoteJid;
        
        // Skip group messages
        if (jid.endsWith('@g.us')) {
            return;
        }
        
        const phoneNumber = formatPhoneNumber(jid);
        const text = extractMessageText(message);
        
        if (!text || text.trim() === '') return;
        if (!checkRateLimit(phoneNumber)) return;
        
        logMessage(phoneNumber, text);
        
        const cleanText = text.trim();
        const lowerText = cleanText.toLowerCase();
        const currentState = getUserState(phoneNumber);
        const session = getSession(phoneNumber);
        const useSwahili = isSwahili(cleanText);
        
        if (useSwahili) session.language = 'sw';
        
        let response = null;
        
        // Check for menu/restart commands
        if (lowerText === 'menu' || lowerText === 'start' || lowerText === '0') {
            clearHistory(phoneNumber);
            response = startBookingFlow(phoneNumber, session.language === 'sw');
            await sendTextWithTyping(jid, response);
            logOutgoing(phoneNumber, response);
            return;
        }
        
        // Route based on current state
        switch (currentState) {
            case STATES.IDLE:
                if (isEntryKeyword(cleanText)) {
                    response = startBookingFlow(phoneNumber, useSwahili);
                } else if (shouldUseAI(cleanText)) {
                    // Use AI for questions even in idle state
                    session.state = STATES.AI_CHAT;
                    response = await generateResponse(phoneNumber, cleanText, {
                        language: session.language,
                        pickupArea: session.pickupArea
                    });
                }
                break;
                
            case STATES.MAIN_MENU:
                if (isEntryKeyword(cleanText)) {
                    response = startBookingFlow(phoneNumber, useSwahili);
                } else {
                    response = processMainMenu(phoneNumber, cleanText);
                }
                break;
                
            case STATES.SELECTING_PICKUP:
                if (isEntryKeyword(cleanText)) {
                    response = startBookingFlow(phoneNumber, useSwahili);
                } else {
                    const result = processPickupSelection(phoneNumber, cleanText);
                    response = result.message;
                }
                break;
                
            case STATES.SELECTING_DAY_TOUR:
                if (isEntryKeyword(cleanText)) {
                    response = startBookingFlow(phoneNumber, useSwahili);
                } else {
                    const result = processDayTourSelection(phoneNumber, cleanText);
                    response = result.message;
                }
                break;
                
            case STATES.SELECTING_PACKAGE:
                if (isEntryKeyword(cleanText)) {
                    response = startBookingFlow(phoneNumber, useSwahili);
                } else {
                    const result = processPackageSelection(phoneNumber, cleanText);
                    response = result.message;
                }
                break;
                
            case STATES.SELECTING_SAFARI:
                // Safari queries go to AI for detailed help
                response = await generateResponse(phoneNumber, cleanText, {
                    language: session.language,
                    context: 'User asking about Tanzania safaris'
                });
                break;
                
            case STATES.ENTERING_PAX:
                if (isEntryKeyword(cleanText)) {
                    response = startBookingFlow(phoneNumber, useSwahili);
                } else {
                    const result = processPax(phoneNumber, cleanText);
                    response = result.message;
                }
                break;
                
            case STATES.ENTERING_DATE:
                if (isEntryKeyword(cleanText)) {
                    response = startBookingFlow(phoneNumber, useSwahili);
                } else {
                    const result = processDate(phoneNumber, cleanText);
                    response = result.message;
                    
                    if (result.completed && result.booking) {
                        await sendTextWithTyping(jid, response);
                        logOutgoing(phoneNumber, response);
                        await notifyAdmin(sock, result.booking);
                        return;
                    }
                }
                break;
                
            case STATES.AI_CHAT:
                // Full AI conversation mode
                response = await generateResponse(phoneNumber, cleanText, {
                    language: session.language,
                    pickupArea: session.pickupArea,
                    currentBooking: session.booking
                });
                break;
                
            default:
                response = startBookingFlow(phoneNumber, useSwahili);
        }
        
        if (response) {
            await sendTextWithTyping(jid, response);
            logOutgoing(phoneNumber, response);
        }
        
    } catch (error) {
        console.error('❌ Error in message handler:', error);
        
        try {
            const jid = message.key.remoteJid;
            const session = getSession(formatPhoneNumber(jid));
            const errorMsg = session.language === 'sw' 
                ? '🙏 Samahani, kuna tatizo. Jaribu tena au andika "menu".'
                : '🙏 Sorry, something went wrong. Try again or type "menu".';
            await sock.sendMessage(jid, { text: errorMsg });
        } catch (sendError) {
            console.error('❌ Failed to send error:', sendError.message);
        }
    }
}

module.exports = {
    handleMessage,
    extractMessageText,
    notifyAdmin
};
