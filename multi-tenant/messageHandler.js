/**
 * Multi-Tenant Message Handler
 * Routes messages with company-specific context
 */

const { 
    STATES,
    startBookingFlow,
    processMainMenu,
    processPickupSelection,
    processDayTourSelection,
    processPackageSelection,
    processSafariSelection,
    processPax,
    processDate,
    buildAdminNotification
} = require('../bot/bookingFlow');
const { isSwahili, isEntryKeyword } = require('../utils/language');
const { generateResponse, shouldUseAI } = require('../utils/gemini');
const { 
    getCompanyUserSession,
    checkCompanyRateLimit,
    getCompanyChatHistory,
    addToCompanyChatHistory,
    clearCompanyChatHistory
} = require('./sessions');

/**
 * Send message with typing indicator (multi-tenant version)
 */
async function sendWithTyping(sock, jid, text, humanLike = true) {
    try {
        // Show typing indicator
        await sock.sendPresenceUpdate('composing', jid);
        
        // Calculate typing delay
        let typingDelay;
        if (humanLike) {
            const baseDelay = 3000 + Math.random() * 3000;
            const readingTime = Math.min(text.length * 15, 4000);
            typingDelay = baseDelay + readingTime;
        } else {
            typingDelay = Math.min(text.length * 20, 2000);
        }
        
        await new Promise(resolve => setTimeout(resolve, typingDelay));
        
        // Send message
        const result = await sock.sendMessage(jid, { text });
        
        // Clear typing indicator
        await sock.sendPresenceUpdate('paused', jid);
        
        return result;
        
    } catch (error) {
        console.error('❌ Error sending message:', error.message);
        throw error;
    }
}

/**
 * Extract text content from message
 */
function extractMessageText(message) {
    const msg = message.message;
    
    if (!msg) return null;
    
    if (msg.conversation) return msg.conversation;
    if (msg.extendedTextMessage?.text) return msg.extendedTextMessage.text;
    if (msg.imageMessage?.caption) return msg.imageMessage.caption;
    if (msg.videoMessage?.caption) return msg.videoMessage.caption;
    if (msg.buttonsResponseMessage?.selectedDisplayText) return msg.buttonsResponseMessage.selectedDisplayText;
    if (msg.listResponseMessage?.title) return msg.listResponseMessage.title;
    
    return null;
}

/**
 * Format phone number for display
 */
function formatPhoneNumber(jid) {
    return jid.replace('@s.whatsapp.net', '').replace('@g.us', '').replace('@lid', '');
}

/**
 * Log incoming message
 */
function logMessage(companyName, phoneNumber, text) {
    const timestamp = new Date().toLocaleTimeString();
    const preview = text.length > 50 ? text.substring(0, 50) + '...' : text;
    console.log(`📨 [${timestamp}] [${companyName}] +${phoneNumber}: ${preview}`);
}

/**
 * Log outgoing message
 */
function logOutgoing(companyName, phoneNumber, text) {
    const timestamp = new Date().toLocaleTimeString();
    const preview = text.length > 50 ? text.substring(0, 50) + '...' : text;
    console.log(`📤 [${timestamp}] [${companyName}] → +${phoneNumber}: ${preview}`);
}

/**
 * Send admin notification
 */
async function notifyAdmin(sock, booking, adminNumber) {
    try {
        const adminJid = `${adminNumber}@s.whatsapp.net`;
        const notification = buildAdminNotification(booking);
        
        await sock.sendMessage(adminJid, { text: notification });
        
        console.log(`📢 Admin notified about booking: ${booking.bookingId}`);
        
    } catch (error) {
        console.error('❌ Failed to notify admin:', error.message);
    }
}

/**
 * Main multi-tenant message handler
 */
async function handleMultiTenantMessage(sock, message, company) {
    try {
        const jid = message.key.remoteJid;
        
        // Skip group messages
        if (jid.endsWith('@g.us')) {
            return;
        }
        
        const phoneNumber = formatPhoneNumber(jid);
        const text = extractMessageText(message);
        
        if (!text || text.trim() === '') return;
        
        // Company-specific rate limiting
        if (!checkCompanyRateLimit(company.id, phoneNumber)) return;
        
        logMessage(company.name, phoneNumber, text);
        
        const cleanText = text.trim();
        const lowerText = cleanText.toLowerCase();
        
        // Get company-specific session
        const session = getCompanyUserSession(company.id, phoneNumber);
        const currentState = session.state;
        const useSwahili = isSwahili(cleanText);
        
        if (useSwahili) session.language = 'sw';
        
        let response = null;
        
        // Check for menu/restart commands
        if (lowerText === 'menu' || lowerText === 'start' || lowerText === '0') {
            clearCompanyChatHistory(company.id, phoneNumber);
            session.state = 'main_menu';
            response = startBookingFlow(phoneNumber, session.language === 'sw');
            await sendWithTyping(sock, jid, response);
            logOutgoing(company.name, phoneNumber, response);
            return;
        }
        
        // Route based on current state
        switch (currentState) {
            case STATES.IDLE:
            case 'idle':
                // First message - let AI handle naturally with company-specific history
                session.state = STATES.AI_CHAT;
                response = await generateResponseWithCompanyContext(
                    company.id,
                    phoneNumber,
                    cleanText,
                    {
                        language: session.language,
                        pickupArea: session.pickupArea,
                        isFirstMessage: true
                    }
                );
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
                response = await generateResponseWithCompanyContext(
                    company.id,
                    phoneNumber,
                    cleanText,
                    {
                        language: session.language,
                        context: 'User asking about Tanzania safaris'
                    }
                );
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
                        await sendWithTyping(sock, jid, response);
                        logOutgoing(company.name, phoneNumber, response);
                        await notifyAdmin(sock, result.booking, company.adminNumber);
                        return;
                    }
                }
                break;
                
            case STATES.AI_CHAT:
                // Full AI conversation mode with company context
                response = await generateResponseWithCompanyContext(
                    company.id,
                    phoneNumber,
                    cleanText,
                    {
                        language: session.language,
                        pickupArea: session.pickupArea,
                        currentBooking: session.booking
                    }
                );
                break;
                
            default:
                response = startBookingFlow(phoneNumber, useSwahili);
        }
        
        if (response) {
            await sendWithTyping(sock, jid, response);
            logOutgoing(company.name, phoneNumber, response);
        }
        
    } catch (error) {
        console.error(`❌ Error in message handler for ${company.name}:`, error);
        
        try {
            const jid = message.key.remoteJid;
            const session = getCompanyUserSession(company.id, formatPhoneNumber(jid));
            const errorMsg = session.language === 'sw' 
                ? '🙏 Samahani, kuna tatizo. Jaribu tena au andika "menu".'
                : '🙏 Sorry, something went wrong. Try again or type "menu".';
            await sock.sendMessage(jid, { text: errorMsg });
        } catch (sendError) {
            console.error('❌ Failed to send error:', sendError.message);
        }
    }
}

/**
 * Generate AI response with company-specific chat history
 */
async function generateResponseWithCompanyContext(companyId, phoneNumber, userMessage, context = {}) {
    const history = getCompanyChatHistory(companyId, phoneNumber);
    
    try {
        // Use the original generateResponse but with company-specific history
        const response = await generateResponse(phoneNumber, userMessage, context, history);
        
        // Save to company-specific history
        addToCompanyChatHistory(companyId, phoneNumber, 'user', userMessage);
        addToCompanyChatHistory(companyId, phoneNumber, 'model', response);
        
        return response;
        
    } catch (error) {
        console.error('❌ AI Error:', error);
        
        if (context.language === 'sw') {
            return '🙏 Samahani, kuna tatizo kidogo. Tafadhali jaribu tena.';
        }
        return '🙏 Sorry, I encountered an issue. Please try again.';
    }
}

module.exports = {
    handleMultiTenantMessage,
    sendWithTyping,
    extractMessageText,
    notifyAdmin
};
