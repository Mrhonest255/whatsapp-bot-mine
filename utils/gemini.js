/**
 * Gemini AI Service
 * Provides intelligent, context-aware responses for Zanzibar Tourism Bot
 * Using Google Gemini 2.5 Flash
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { getAllPricingContext, tourInclusions, tourExclusions } = require('../bot/tours');

// Gemini API Configuration
const GEMINI_API_KEY = 'AIzaSyCd2H-Z1mbO5iqdxIt42tjyomZdH9NYflo';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Use Gemini 2.5 Pro for intelligent, detailed responses
const model = genAI.getGenerativeModel({ 
    model: 'gemini-2.5-pro',
    generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 64,
        maxOutputTokens: 8192,  // Increased for full detailed responses
    }
});

// Chat history per user (in-memory)
const chatHistories = new Map();
const MAX_HISTORY = 50; // Keep last 50 messages per user for good conversation memory
const conversationContext = new Map(); // Store extracted info (name, tour interest, dates, etc.)

/**
 * System prompt for the AI
 */
const SYSTEM_PROMPT = `You are a friendly, warm, HUMAN-LIKE tour booking assistant for Zanzibar Tours 🇹🇿. 
Your name is Amina and you're a real person working at the tour company.

CRITICAL - CONVERSATION MEMORY:
- You MUST remember EVERYTHING the customer told you in previous messages
- If they mentioned their name, use it! Don't ask again.
- If they mentioned a tour, date, or number of people - remember it!
- Reference previous parts of the conversation naturally
- Example: "Ndio, kama ulivyosema unataka Safari Blue siku ya Jumapili na watu 4..."
- NEVER start fresh - always continue the existing conversation
- If they ask a new question, still remember the context from before

YOUR PERSONALITY:
- You are warm, friendly, and conversational - like chatting with a friend
- You take time to understand what the customer wants
- You show genuine interest and enthusiasm about helping them
- You write naturally, not like a robot or menu system
- You can handle informal greetings and casual conversation

HANDLING CUSTOMER MESSAGES:
- When customers send booking details (name, date, tour), extract the info naturally
- Don't force them to use numbered menus - have a natural conversation
- If they mention a tour, date, number of people - acknowledge each detail
- Ask clarifying questions in a friendly way if info is missing
- Example: "Karibu sana! Safari Blue sounds perfect 🌊 Ni watu wangapi mtakuja?"

IMPORTANT RULES:
1. Always use the EXACT prices from the pricing data provided
2. Prices vary by: number of people (PAX) and pickup location (Stone Town vs North/South)
3. Stone Town pickup is cheaper than North/South Zanzibar pickup
4. ALWAYS GIVE COMPLETE, DETAILED RESPONSES - never cut off mid-sentence
5. When describing a tour, include: description, duration, what's included, price range
6. Use emojis naturally but don't overdo it
7. If asked about something not in the data, say you'll check with the team
8. Always encourage booking and provide clear next steps
9. Respond in the same language the customer uses (English or Swahili)
10. Format prices clearly: "$XX per person" with currency USD

RESPONSE STYLE:
- Be conversational and natural - like a helpful local friend
- Give FULL, COMPLETE answers - never leave information incomplete
- Use casual language appropriate for WhatsApp
- Address the customer directly and personally
- End with a relevant question or clear call-to-action
- Keep paragraphs short for easy WhatsApp reading

BOOKING INFORMATION TO COLLECT:
1. Which tour they want
2. How many people (PAX)
3. Preferred date
4. Their pickup location (Stone Town, North, or South Zanzibar)
5. Their name and hotel/accommodation

CURRENT PRICING DATA:
${getAllPricingContext()}

INCLUSIONS: ${tourInclusions.join(', ')}
EXCLUSIONS: ${tourExclusions.join(', ')}

CONTACT & LOGISTICS:
- Bookings confirmed via WhatsApp
- Tours available daily (weather permitting)
- Hotel pickup included
- Pickup times: Stone Town ~8am, North/South areas earlier

Remember: You are Amina, a real person. Chat naturally and warmly. Complete every response fully!`;

/**
 * Get or create chat history for a user
 * @param {string} phoneNumber - User's phone number
 * @returns {Array} Chat history
 */
function getChatHistory(phoneNumber) {
    if (!chatHistories.has(phoneNumber)) {
        chatHistories.set(phoneNumber, []);
    }
    return chatHistories.get(phoneNumber);
}

/**
 * Add message to chat history
 * @param {string} phoneNumber - User's phone number
 * @param {string} role - 'user' or 'model'
 * @param {string} content - Message content
 */
function addToHistory(phoneNumber, role, content) {
    const history = getChatHistory(phoneNumber);
    
    history.push({
        role: role,
        parts: [{ text: content }]
    });
    
    // Keep only last N messages (pairs of user+model)
    if (history.length > MAX_HISTORY * 2) {
        // Remove oldest messages but keep at least 20 for context
        history.splice(0, 4); // Remove 2 pairs at a time
    }
}

/**
 * Save important context from conversation (name, interests, etc.)
 * @param {string} phoneNumber - User's phone number
 * @param {Object} info - Extracted information
 */
function saveContext(phoneNumber, info) {
    if (!conversationContext.has(phoneNumber)) {
        conversationContext.set(phoneNumber, {});
    }
    const ctx = conversationContext.get(phoneNumber);
    Object.assign(ctx, info);
}

/**
 * Get saved context for a user
 * @param {string} phoneNumber - User's phone number
 * @returns {Object} Saved context
 */
function getContext(phoneNumber) {
    return conversationContext.get(phoneNumber) || {};
}

/**
 * Clear chat history for a user
 * @param {string} phoneNumber - User's phone number
 */
function clearHistory(phoneNumber) {
    chatHistories.delete(phoneNumber);
    conversationContext.delete(phoneNumber);
}

/**
 * Generate AI response for a user message
 * @param {string} phoneNumber - User's phone number
 * @param {string} userMessage - User's message
 * @param {Object} context - Additional context (booking state, language, etc.)
 * @returns {Promise<string>} AI generated response
 */
async function generateResponse(phoneNumber, userMessage, context = {}) {
    try {
        const history = getChatHistory(phoneNumber);
        
        // Build context message
        let contextInfo = '';
        if (context.pickupArea) {
            contextInfo += `\nCustomer pickup: ${context.pickupArea}`;
        }
        if (context.language === 'sw') {
            contextInfo += '\nCustomer prefers Swahili. Respond in Swahili.';
        }
        if (context.currentBooking) {
            contextInfo += `\nCurrent booking in progress: ${JSON.stringify(context.currentBooking)}`;
        }
        
        // Start chat with history
        const chat = model.startChat({
            history: [
                {
                    role: 'user',
                    parts: [{ text: SYSTEM_PROMPT + contextInfo }]
                },
                {
                    role: 'model',
                    parts: [{ text: 'Understood! I am ready to help customers with Zanzibar Tours bookings. I will use accurate pricing and be helpful and professional.' }]
                },
                ...history
            ]
        });
        
        // Send user message
        const result = await chat.sendMessage(userMessage);
        const response = result.response.text();
        
        // Save to history
        addToHistory(phoneNumber, 'user', userMessage);
        addToHistory(phoneNumber, 'model', response);
        
        return response;
        
    } catch (error) {
        console.error('❌ Gemini AI Error:', error.message);
        
        // Fallback response
        if (context.language === 'sw') {
            return '🙏 Samahani, kuna tatizo kidogo. Tafadhali jaribu tena au ongea na wakala wetu moja kwa moja.';
        }
        return '🙏 Sorry, I encountered an issue. Please try again or contact our team directly for assistance.';
    }
}

/**
 * Generate a quick response without history (for simple queries)
 * @param {string} prompt - The prompt to send
 * @returns {Promise<string>} AI response
 */
async function quickResponse(prompt) {
    try {
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        console.error('❌ Gemini Quick Response Error:', error.message);
        return null;
    }
}

/**
 * Check if message seems like a question or needs AI
 * @param {string} message - User message
 * @returns {boolean} True if should use AI
 */
function shouldUseAI(message) {
    if (!message) return false;
    
    const msg = message.toLowerCase().trim();
    
    // Questions typically need AI
    const questionIndicators = [
        '?', 'what', 'how', 'when', 'where', 'why', 'which', 'can', 'could',
        'tell me', 'explain', 'describe', 'nini', 'vipi', 'lini', 'wapi',
        'kwa nini', 'je', 'naweza', 'best', 'recommend', 'suggest',
        'difference', 'include', 'included', 'price', 'cost', 'bei',
        'available', 'open', 'book', 'reserve'
    ];
    
    return questionIndicators.some(indicator => msg.includes(indicator));
}

/**
 * Detect intent from message
 * @param {string} message - User message
 * @returns {Object} Detected intent
 */
function detectIntent(message) {
    const msg = message.toLowerCase().trim();
    
    const intents = {
        greeting: /^(hi|hello|hey|habari|jambo|mambo|salama|shikamoo)/i.test(msg),
        booking: /(book|reserve|nafasi|order|panga)/i.test(msg),
        pricing: /(price|cost|bei|how much|kiasi gani|gharama)/i.test(msg),
        tourInfo: /(about|tell me|information|info|habari|maelezo)/i.test(msg),
        safari: /(safari|serengeti|mikumi|selous|nyerere|game|wildlife)/i.test(msg),
        dayTour: /(stone town|prison|jozani|mnemba|dolphin|spice|submarine|horse)/i.test(msg),
        package: /(package|combo|combination|pakiti)/i.test(msg),
        help: /(help|assist|support|msaada)/i.test(msg),
        thanks: /(thank|asante|shukran)/i.test(msg),
        cancel: /(cancel|stop|acha|sitisha)/i.test(msg)
    };
    
    // Find primary intent
    for (const [intent, matched] of Object.entries(intents)) {
        if (matched) return { intent, matched: true };
    }
    
    return { intent: 'general', matched: false };
}

/**
 * Generate personalized greeting
 * @param {string} language - 'en' or 'sw'
 * @returns {string} Greeting message
 */
function getAIGreeting(language = 'en') {
    const hour = new Date().getHours();
    
    if (language === 'sw') {
        let greeting = hour < 12 ? 'Habari za asubuhi' : hour < 17 ? 'Habari za mchana' : 'Habari za jioni';
        return `${greeting}! 🌴\n\nKaribu Zanzibar Tours! Mimi ni msaidizi wako wa AI. Naweza kukusaidia:\n\n• Kupata ziara inayofaa\n• Kukupa bei sahihi\n• Kujibu maswali yako\n\nUliza chochote! 💬`;
    }
    
    let greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    return `${greeting}! 🌴\n\nWelcome to Zanzibar Tours! I'm your AI assistant. I can help you:\n\n• Find the perfect tour\n• Get accurate pricing\n• Answer your questions\n\nAsk me anything! 💬`;
}

// Cleanup old histories periodically (every 2 hours) - keep memory longer
setInterval(() => {
    // Only cleanup if we have too many conversations stored
    if (chatHistories.size > 500) {
        // Remove oldest 100 conversations
        let count = 0;
        for (const [phone] of chatHistories) {
            if (count >= 100) break;
            chatHistories.delete(phone);
            conversationContext.delete(phone);
            count++;
        }
        console.log(`🧹 Cleaned up ${count} old conversation histories`);
    }
}, 2 * 60 * 60 * 1000); // Every 2 hours

module.exports = {
    generateResponse,
    quickResponse,
    shouldUseAI,
    detectIntent,
    getAIGreeting,
    getChatHistory,
    clearHistory,
    addToHistory,
    saveContext,
    getContext
};
