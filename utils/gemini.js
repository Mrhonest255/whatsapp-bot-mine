/**
 * Gemini AI Service
 * Provides intelligent, context-aware responses for Zanzibar Tourism Bot
 * Using Google Gemini 2.0 Flash
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { getAllPricingContext, tourInclusions, tourExclusions } = require('../bot/tours');

// Gemini API Configuration
const GEMINI_API_KEY = 'AIzaSyCd2H-Z1mbO5iqdxIt42tjyomZdH9NYflo';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Use Gemini 2.0 Flash for fast responses
const model = genAI.getGenerativeModel({ 
    model: 'gemini-2.0-flash-exp',
    generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
        maxOutputTokens: 1024,
    }
});

// Chat history per user (in-memory)
const chatHistories = new Map();
const MAX_HISTORY = 10; // Keep last 10 messages per user

/**
 * System prompt for the AI
 */
const SYSTEM_PROMPT = `You are a friendly, professional tour booking assistant for Zanzibar Tours 🇹🇿.

YOUR ROLE:
- Help customers find and book tours in Zanzibar and Tanzania safaris
- Provide accurate pricing based on number of people and pickup location
- Answer questions about tours, activities, and travel in Zanzibar
- Be helpful, warm, and professional

IMPORTANT RULES:
1. Always use the EXACT prices from the pricing data provided
2. Prices vary by: number of people (PAX) and pickup location (Stone Town vs North/South)
3. Stone Town pickup is cheaper than North/South Zanzibar pickup
4. Be concise - WhatsApp messages should be short and readable
5. Use emojis appropriately but don't overdo it
6. If asked about something not in the data, politely say you'll check with the team
7. Always encourage booking and provide next steps
8. Respond in the same language the customer uses (English or Swahili)
9. Format prices clearly and mention what's included

BOOKING PROCESS:
1. Help customer choose tour
2. Ask how many people
3. Ask preferred date
4. Confirm total price
5. Collect booking

CURRENT PRICING DATA:
${getAllPricingContext()}

INCLUSIONS: ${tourInclusions.join(', ')}
EXCLUSIONS: ${tourExclusions.join(', ')}

CONTACT INFO:
- Bookings via WhatsApp
- Tours available daily
- Pickup from hotels included

Remember: Be helpful, accurate, and encourage bookings!`;

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
    
    // Keep only last N messages
    if (history.length > MAX_HISTORY * 2) {
        history.splice(0, 2); // Remove oldest pair
    }
}

/**
 * Clear chat history for a user
 * @param {string} phoneNumber - User's phone number
 */
function clearHistory(phoneNumber) {
    chatHistories.delete(phoneNumber);
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

// Cleanup old histories periodically (every hour)
setInterval(() => {
    const maxAge = 60 * 60 * 1000; // 1 hour
    const now = Date.now();
    
    for (const [phone] of chatHistories) {
        // Simple cleanup - in production, track timestamps
        if (chatHistories.size > 1000) {
            chatHistories.delete(phone);
        }
    }
}, 60 * 60 * 1000);

module.exports = {
    generateResponse,
    quickResponse,
    shouldUseAI,
    detectIntent,
    getAIGreeting,
    getChatHistory,
    clearHistory,
    addToHistory
};
