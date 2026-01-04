/**
 * Multi-Tenant Message Handler
 * Handles messages for each tenant with their own context
 * Uses dynamic prompt builder for any business type!
 * Includes fallback responses when AI is unavailable
 */

const config = require('../config');
const tenantManager = require('./tenantManager');
const { sendTextWithTyping } = require('./tenantConnection');
const { buildSystemPrompt } = require('../business-templates/promptBuilder');
const { getKnowledgeBase, knowledgeExists } = require('../business-templates/knowledgeBase');
const { generateFallbackResponse, detectLanguage, canUseFallback } = require('../business-templates/fallbackResponses');

// Tenant-specific chat histories
const tenantChatHistories = new Map(); // tenantId -> Map(phoneNumber -> history)

// Tenant-specific sessions (booking state per customer)
const tenantSessions = new Map(); // tenantId -> Map(phoneNumber -> session)

/**
 * Get or create session for a customer within a tenant
 */
function getSession(tenantId, phoneNumber) {
    if (!tenantSessions.has(tenantId)) {
        tenantSessions.set(tenantId, new Map());
    }
    const tenantMap = tenantSessions.get(tenantId);
    
    if (!tenantMap.has(phoneNumber)) {
        tenantMap.set(phoneNumber, {
            state: 'IDLE',
            language: 'en',
            booking: null,
            lastActivity: Date.now()
        });
    }
    return tenantMap.get(phoneNumber);
}

/**
 * Build system prompt for a specific tenant
 * Now uses dynamic prompt builder from business-templates!
 */
function buildTenantPrompt(tenant) {
    try {
        // Use the new dynamic prompt builder
        const dynamicPrompt = buildSystemPrompt(tenant);
        if (dynamicPrompt) {
            return dynamicPrompt;
        }
    } catch (error) {
        console.error(`⚠️ [${tenant.id}] Failed to build dynamic prompt:`, error.message);
    }
    
    // Fallback to default prompt
    const defaultPrompt = `You are a friendly, warm, HUMAN-LIKE assistant for ${tenant.companyName} 🏢.
Your name is ${tenant.botName || 'Assistant'} and you're a real person working at the company.

CRITICAL - CONVERSATION MEMORY:
- You MUST remember EVERYTHING the customer told you in previous messages
- If they mentioned their name, use it! Don't ask again.
- Reference previous parts of the conversation naturally
- NEVER start fresh - always continue the existing conversation

YOUR PERSONALITY:
- You are warm, friendly, and conversational - like chatting with a friend
- You take time to understand what the customer wants
- You write naturally, not like a robot or menu system

COMPANY INFO:
- Company: ${tenant.companyName}
- Type: ${tenant.businessType || 'Business'}
- Admin: ${tenant.adminName}

${tenant.customPrompt || ''}

Remember: You are ${tenant.botName}, a real person. Chat naturally and warmly. Complete every response fully!`;

    return defaultPrompt;
}

/**
 * Generate AI response for a tenant's customer
 */
async function generateTenantResponse(tenantId, phoneNumber, userMessage, context = {}) {
    const tenant = tenantManager.getTenant(tenantId);
    if (!tenant) return 'Sorry, system error.';
    
    // Get tenant-specific history
    if (!tenantChatHistories.has(tenantId)) {
        tenantChatHistories.set(tenantId, new Map());
    }
    const tenantHistories = tenantChatHistories.get(tenantId);
    
    if (!tenantHistories.has(phoneNumber)) {
        tenantHistories.set(phoneNumber, []);
    }
    const history = tenantHistories.get(phoneNumber);
    
    // Check if we should use fallback for simple messages
    const detectedLang = context.language || detectLanguage(userMessage);
    
    // If AI is disabled or for very simple messages, use fallback
    if (!config.gemini.enabled || !config.gemini.apiKey) {
        console.log(`🔄 [${tenantId}] Using fallback (AI disabled or no API key)`);
        return generateFallbackResponse(tenant, userMessage, detectedLang);
    }
    
    // Try AI with retry and fallback
    let retries = config.gemini.maxRetries || 2;
    let lastError = null;
    
    while (retries > 0) {
        try {
            const { GoogleGenerativeAI } = require('@google/generative-ai');
            const genAI = new GoogleGenerativeAI(config.gemini.apiKey);
        
        const model = genAI.getGenerativeModel({ 
            model: 'gemini-2.5-pro',
            generationConfig: {
                temperature: 0.7,
                topP: 0.95,
                topK: 64,
                maxOutputTokens: 8192
            }
        });
        
        const systemPrompt = buildTenantPrompt(tenant);
        
        // Build context info
        let contextInfo = '';
        if (context.language === 'sw') {
            contextInfo += '\nCustomer prefers Swahili. Respond in Swahili.';
        }
        
        // Start chat with history
        const chat = model.startChat({
            history: [
                {
                    role: 'user',
                    parts: [{ text: systemPrompt + contextInfo }]
                },
                {
                    role: 'model',
                    parts: [{ text: `Understood! I am ${tenant.botName} from ${tenant.companyName}. I will help customers professionally and warmly.` }]
                },
                ...history
            ]
        });
        
        const result = await chat.sendMessage(userMessage);
        const response = result.response.text();
        
        // Save to history
        history.push({ role: 'user', parts: [{ text: userMessage }] });
        history.push({ role: 'model', parts: [{ text: response }] });
        
        // Keep last 50 messages
            if (history.length > 100) {
                history.splice(0, 4);
            }
            
            return response;
            
        } catch (error) {
            lastError = error;
            retries--;
            console.error(`⚠️ [${tenantId}] AI Error (retries left: ${retries}):`, error.message);
            
            if (retries > 0) {
                // Wait before retry
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
    }
    
    // All retries failed - use fallback
    console.log(`🔄 [${tenantId}] AI failed after retries, using fallback response`);
    
    if (config.gemini.enableFallback) {
        const fallbackResponse = generateFallbackResponse(tenant, userMessage, detectedLang);
        return fallbackResponse;
    }
    
    // Last resort default message
    return detectedLang === 'sw' 
        ? '🙏 Samahani, kuna tatizo. Tafadhali jaribu tena baadaye.'
        : '🙏 Sorry, I encountered an issue. Please try again later.';
}

/**
 * Check if message is in Swahili
 */
function isSwahili(text) {
    const swahiliWords = ['habari', 'mambo', 'jambo', 'salama', 'karibu', 'asante', 'tafadhali', 
                          'ndiyo', 'hapana', 'sawa', 'nataka', 'nina', 'naweza', 'vipi'];
    const lower = text.toLowerCase();
    return swahiliWords.some(word => lower.includes(word));
}

/**
 * Format phone number from JID
 */
function formatPhone(jid) {
    return jid.replace('@s.whatsapp.net', '').replace('@g.us', '');
}

/**
 * Log message
 */
function logMessage(tenantId, tenant, direction, phone, text) {
    const time = new Date().toLocaleTimeString();
    const preview = text.length > 50 ? text.substring(0, 50) + '...' : text;
    const icon = direction === 'in' ? '📨' : '📤';
    const arrow = direction === 'in' ? '' : '→ ';
    console.log(`${icon} [${time}] [${tenant.companyName}] ${arrow}+${phone}: ${preview}`);
}

/**
 * Main message handler for multi-tenant system
 */
async function handleTenantMessage(sock, message, tenant) {
    try {
        const jid = message.key.remoteJid;
        
        // Skip groups
        if (jid.endsWith('@g.us')) return;
        
        const phoneNumber = formatPhone(jid);
        const text = extractText(message);
        
        if (!text || text.trim() === '') return;
        
        logMessage(tenant.id, tenant, 'in', phoneNumber, text);
        
        const session = getSession(tenant.id, phoneNumber);
        const isSwahiliMsg = isSwahili(text);
        if (isSwahiliMsg) session.language = 'sw';
        
        // Generate AI response
        const response = await generateTenantResponse(tenant.id, phoneNumber, text.trim(), {
            language: session.language
        });
        
        if (response) {
            await sendTextWithTyping(tenant.id, jid, response);
            logMessage(tenant.id, tenant, 'out', phoneNumber, response);
        }
        
    } catch (error) {
        console.error(`❌ [${tenant.id}] Handler error:`, error.message);
    }
}

/**
 * Extract text from message
 */
function extractText(message) {
    const msg = message.message;
    if (!msg) return null;
    
    if (msg.conversation) return msg.conversation;
    if (msg.extendedTextMessage?.text) return msg.extendedTextMessage.text;
    if (msg.imageMessage?.caption) return msg.imageMessage.caption;
    if (msg.videoMessage?.caption) return msg.videoMessage.caption;
    
    return null;
}

/**
 * Notify tenant admin about booking
 */
async function notifyTenantAdmin(tenantId, bookingDetails) {
    const tenant = tenantManager.getTenant(tenantId);
    if (!tenant || !tenant.adminPhone) return;
    
    const adminJid = `${tenant.adminPhone}@s.whatsapp.net`;
    
    const notification = `🔔 *NEW BOOKING - ${tenant.companyName}*\n\n` +
        `📋 ${JSON.stringify(bookingDetails, null, 2)}\n\n` +
        `⏰ ${new Date().toLocaleString()}`;
    
    try {
        await sendTextWithTyping(tenantId, adminJid, notification);
        tenantManager.incrementBookings(tenantId);
    } catch (error) {
        console.error(`❌ Failed to notify admin:`, error.message);
    }
}

/**
 * Clear history for a customer in a tenant
 */
function clearTenantHistory(tenantId, phoneNumber) {
    const tenantHistories = tenantChatHistories.get(tenantId);
    if (tenantHistories) {
        tenantHistories.delete(phoneNumber);
    }
    
    const tenantSessionMap = tenantSessions.get(tenantId);
    if (tenantSessionMap) {
        tenantSessionMap.delete(phoneNumber);
    }
}

module.exports = {
    handleTenantMessage,
    generateTenantResponse,
    getSession,
    notifyTenantAdmin,
    clearTenantHistory
};
