/**
 * Fallback Response System
 * Provides manual responses when Gemini AI is unavailable
 * Responses are based on business type and common questions
 */

const { getCategory } = require('./index');
const { getKnowledgeBase } = require('./knowledgeBase');

/**
 * Common greetings detection
 */
const GREETINGS = {
    sw: ['habari', 'mambo', 'jambo', 'salama', 'shikamoo', 'vipi', 'sasa', 'niaje', 'za leo', 'hujambo'],
    en: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'howdy', 'greetings']
};

/**
 * Common keywords for intent detection
 */
const INTENT_KEYWORDS = {
    price: ['bei', 'price', 'cost', 'how much', 'kiasi gani', 'gharama', 'rate', 'fee'],
    booking: ['book', 'reserve', 'order', 'agiza', 'buku', 'nataka', 'ninahitaji', 'need', 'want'],
    info: ['what', 'nini', 'tell me', 'niambie', 'explain', 'eleza', 'how', 'vipi', 'jinsi'],
    services: ['services', 'huduma', 'menu', 'products', 'bidhaa', 'offer', 'available'],
    location: ['where', 'wapi', 'location', 'mahali', 'address', 'anwani', 'find'],
    hours: ['hours', 'open', 'close', 'saa', 'wakati', 'time', 'when', 'lini'],
    help: ['help', 'msaada', 'assist', 'support', 'question'],
    thanks: ['thanks', 'thank you', 'asante', 'shukrani'],
    bye: ['bye', 'goodbye', 'kwaheri', 'tutaonana', 'later']
};

/**
 * Detect language from message
 */
function detectLanguage(text) {
    const lower = text.toLowerCase();
    const swahiliWords = ['habari', 'mambo', 'jambo', 'asante', 'tafadhali', 'nataka', 'nina', 'ndiyo', 'hapana', 'sawa', 'vipi', 'wapi', 'nini', 'lini', 'kwa'];
    const swahiliCount = swahiliWords.filter(word => lower.includes(word)).length;
    return swahiliCount >= 1 ? 'sw' : 'en';
}

/**
 * Detect intent from message
 */
function detectIntent(text) {
    const lower = text.toLowerCase();
    
    // Check greetings first
    for (const lang in GREETINGS) {
        if (GREETINGS[lang].some(g => lower.includes(g))) {
            return 'greeting';
        }
    }
    
    // Check other intents
    for (const intent in INTENT_KEYWORDS) {
        if (INTENT_KEYWORDS[intent].some(k => lower.includes(k))) {
            return intent;
        }
    }
    
    return 'general';
}

/**
 * Generate fallback greeting response
 */
function getGreetingResponse(businessType, businessName, botName, language) {
    const category = getCategory(businessType);
    const isSw = language === 'sw';
    
    const greetings = {
        tourism: {
            sw: `Habari! 🌴 Karibu ${businessName}! Mimi ni ${botName}, msaidizi wako wa safari. Tunakusaidia kupanga safari nzuri za Zanzibar. Unataka kusaidiwa na nini leo?`,
            en: `Hello! 🌴 Welcome to ${businessName}! I'm ${botName}, your tour assistant. We help you plan amazing tours in Zanzibar. How can I help you today?`
        },
        hotel: {
            sw: `Habari! 🏨 Karibu ${businessName}! Mimi ni ${botName}. Je, unatafuta chumba cha kulala? Tuna vyumba vizuri sana. Naweza kukusaidia vipi?`,
            en: `Hello! 🏨 Welcome to ${businessName}! I'm ${botName}. Are you looking for accommodation? We have beautiful rooms available. How can I assist you?`
        },
        restaurant: {
            sw: `Habari! 🍽️ Karibu ${businessName}! Mimi ni ${botName}. Tuna chakula kitamu sana! Unataka kuagiza au kujua menyu yetu?`,
            en: `Hello! 🍽️ Welcome to ${businessName}! I'm ${botName}. We have delicious food! Would you like to order or see our menu?`
        },
        salon: {
            sw: `Habari! 💇 Karibu ${businessName}! Mimi ni ${botName}. Tuna huduma za urembo na nywele bora. Unahitaji appointment?`,
            en: `Hello! 💇 Welcome to ${businessName}! I'm ${botName}. We offer great beauty and hair services. Would you like to book an appointment?`
        },
        retail: {
            sw: `Habari! 🛒 Karibu ${businessName}! Mimi ni ${botName}. Tuna bidhaa nyingi nzuri. Unatafuta nini leo?`,
            en: `Hello! 🛒 Welcome to ${businessName}! I'm ${botName}. We have many great products. What are you looking for today?`
        },
        healthcare: {
            sw: `Habari! 🏥 Karibu ${businessName}! Mimi ni ${botName}. Je, unahitaji msaada wa kiafya au appointment na daktari?`,
            en: `Hello! 🏥 Welcome to ${businessName}! I'm ${botName}. Do you need medical assistance or would you like to book an appointment?`
        },
        fitness: {
            sw: `Habari! 💪 Karibu ${businessName}! Mimi ni ${botName}. Tuna programu nzuri za mazoezi. Unataka kujiunga?`,
            en: `Hello! 💪 Welcome to ${businessName}! I'm ${botName}. We have great fitness programs. Would you like to join?`
        },
        education: {
            sw: `Habari! 📚 Karibu ${businessName}! Mimi ni ${botName}. Tuna kozi nzuri sana. Unataka kujifunza nini?`,
            en: `Hello! 📚 Welcome to ${businessName}! I'm ${botName}. We have excellent courses. What would you like to learn?`
        },
        transport: {
            sw: `Habari! 🚗 Karibu ${businessName}! Mimi ni ${botName}. Tunatoa huduma za usafiri bora. Unataka kwenda wapi?`,
            en: `Hello! 🚗 Welcome to ${businessName}! I'm ${botName}. We provide excellent transport services. Where would you like to go?`
        },
        events: {
            sw: `Habari! 🎉 Karibu ${businessName}! Mimi ni ${botName}. Tunasaidia kupanga matukio mazuri. Una tukio gani?`,
            en: `Hello! 🎉 Welcome to ${businessName}! I'm ${botName}. We help plan amazing events. What event do you have in mind?`
        },
        services: {
            sw: `Habari! 🔧 Karibu ${businessName}! Mimi ni ${botName}. Tuna huduma za kitaalamu. Unahitaji msaada gani?`,
            en: `Hello! 🔧 Welcome to ${businessName}! I'm ${botName}. We provide professional services. What help do you need?`
        },
        real_estate: {
            sw: `Habari! 🏠 Karibu ${businessName}! Mimi ni ${botName}. Tuna nyumba na mali nzuri. Unatafuta nini?`,
            en: `Hello! 🏠 Welcome to ${businessName}! I'm ${botName}. We have great properties available. What are you looking for?`
        },
        other: {
            sw: `Habari! 🏢 Karibu ${businessName}! Mimi ni ${botName}. Naweza kukusaidia vipi leo?`,
            en: `Hello! 🏢 Welcome to ${businessName}! I'm ${botName}. How can I help you today?`
        }
    };
    
    const template = greetings[businessType] || greetings.other;
    return template[isSw ? 'sw' : 'en'];
}

/**
 * Generate services/products list response
 */
function getServicesResponse(company, knowledge, language) {
    const isSw = language === 'sw';
    const category = getCategory(company.businessType);
    const businessName = knowledge?.business?.name || company.name;
    const currency = knowledge?.business?.currency || 'TZS';
    
    // Get items based on business type
    const sectionMap = {
        tourism: 'tours',
        hotel: 'rooms',
        restaurant: 'menu',
        salon: 'services',
        retail: 'products',
        healthcare: 'services',
        fitness: 'programs',
        education: 'courses',
        transport: 'services',
        events: 'services',
        services: 'services',
        real_estate: 'properties'
    };
    
    const section = sectionMap[company.businessType] || 'services';
    const items = knowledge?.[section] || [];
    
    if (items.length === 0) {
        return isSw 
            ? `Samahani, kwa sasa hatuna orodha ya ${category.serviceLabel.sw}. Tafadhali wasiliana na admin kwa maelezo zaidi.`
            : `Sorry, we don't have a ${category.serviceLabel.en} list available right now. Please contact admin for more details.`;
    }
    
    let response = isSw 
        ? `${category.icon} *${category.serviceLabel.sw} zetu:*\n\n`
        : `${category.icon} *Our ${category.serviceLabel.en}:*\n\n`;
    
    items.slice(0, 10).forEach((item, i) => {
        response += `${i + 1}. *${item.name}*`;
        if (item.price) response += ` - ${currency} ${item.price.toLocaleString()}`;
        response += '\n';
        if (item.description) response += `   ${item.description}\n`;
    });
    
    if (items.length > 10) {
        response += isSw 
            ? `\n...na mengine ${items.length - 10} zaidi!`
            : `\n...and ${items.length - 10} more!`;
    }
    
    response += isSw 
        ? '\n\n💬 Chagua namba au andika jina la huduma unayoitaka.'
        : '\n\n💬 Choose a number or type the name of the service you want.';
    
    return response;
}

/**
 * Generate price information response
 */
function getPriceResponse(company, knowledge, language) {
    const isSw = language === 'sw';
    const currency = knowledge?.business?.currency || 'TZS';
    
    const sectionMap = {
        tourism: 'tours',
        hotel: 'rooms',
        restaurant: 'menu',
        salon: 'services',
        retail: 'products',
        healthcare: 'services',
        fitness: 'membership',
        education: 'courses',
        transport: 'services',
        events: 'services',
        services: 'services',
        real_estate: 'properties'
    };
    
    const section = sectionMap[company.businessType] || 'services';
    const items = knowledge?.[section] || [];
    
    if (items.length === 0) {
        return isSw 
            ? '💰 Tafadhali wasiliana nasi kupata bei. Namba: ' + (knowledge?.business?.phone || 'admin')
            : '💰 Please contact us for pricing. Number: ' + (knowledge?.business?.phone || 'admin');
    }
    
    let response = isSw ? '💰 *Bei zetu:*\n\n' : '💰 *Our Prices:*\n\n';
    
    items.filter(i => i.price).slice(0, 8).forEach(item => {
        response += `• ${item.name}: *${currency} ${item.price.toLocaleString()}*\n`;
    });
    
    response += isSw 
        ? '\n📞 Kwa maelezo zaidi wasiliana nasi.'
        : '\n📞 Contact us for more details.';
    
    return response;
}

/**
 * Generate location/contact response
 */
function getLocationResponse(company, knowledge, language) {
    const isSw = language === 'sw';
    const b = knowledge?.business || {};
    
    let response = isSw ? '📍 *Maelezo yetu:*\n\n' : '📍 *Our Details:*\n\n';
    
    if (b.location) response += `📍 ${isSw ? 'Mahali' : 'Location'}: ${b.location}\n`;
    if (b.phone) response += `📱 ${isSw ? 'Simu' : 'Phone'}: ${b.phone}\n`;
    if (b.email) response += `📧 Email: ${b.email}\n`;
    if (b.website) response += `🌐 Website: ${b.website}\n`;
    
    if (!b.location && !b.phone) {
        response = isSw 
            ? '📍 Tafadhali wasiliana na admin kupata maelezo ya mahali.'
            : '📍 Please contact admin for location details.';
    }
    
    return response;
}

/**
 * Generate hours response
 */
function getHoursResponse(company, knowledge, language) {
    const isSw = language === 'sw';
    const hours = knowledge?.business?.hours;
    
    if (!hours) {
        return isSw 
            ? '🕐 Tunafungua kila siku. Wasiliana nasi kwa saa kamili.'
            : '🕐 We are open daily. Contact us for exact hours.';
    }
    
    let response = isSw ? '🕐 *Saa za kufungua:*\n\n' : '🕐 *Opening Hours:*\n\n';
    
    const days = {
        monday: { sw: 'Jumatatu', en: 'Monday' },
        tuesday: { sw: 'Jumanne', en: 'Tuesday' },
        wednesday: { sw: 'Jumatano', en: 'Wednesday' },
        thursday: { sw: 'Alhamisi', en: 'Thursday' },
        friday: { sw: 'Ijumaa', en: 'Friday' },
        saturday: { sw: 'Jumamosi', en: 'Saturday' },
        sunday: { sw: 'Jumapili', en: 'Sunday' }
    };
    
    for (const [day, times] of Object.entries(hours)) {
        const dayName = days[day]?.[isSw ? 'sw' : 'en'] || day;
        if (times.closed) {
            response += `• ${dayName}: ${isSw ? 'IMEFUNGWA' : 'CLOSED'}\n`;
        } else {
            response += `• ${dayName}: ${times.open} - ${times.close}\n`;
        }
    }
    
    return response;
}

/**
 * Generate booking instructions response
 */
function getBookingResponse(company, knowledge, language) {
    const isSw = language === 'sw';
    const category = getCategory(company.businessType);
    const businessName = knowledge?.business?.name || company.name;
    
    const bookingInstructions = {
        tourism: {
            sw: `🎯 *Jinsi ya Kubuku Safari:*\n\n1️⃣ Chagua safari unayoitaka\n2️⃣ Tueleze tarehe na watu wangapi\n3️⃣ Tupe jina lako na hoteli\n4️⃣ Tutakuthibitishia!\n\n💬 Andika jina la safari unayoitaka.`,
            en: `🎯 *How to Book a Tour:*\n\n1️⃣ Choose your tour\n2️⃣ Tell us date and number of people\n3️⃣ Give us your name and hotel\n4️⃣ We'll confirm!\n\n💬 Type the name of the tour you want.`
        },
        hotel: {
            sw: `🎯 *Jinsi ya Kubuku Chumba:*\n\n1️⃣ Chagua aina ya chumba\n2️⃣ Tueleze tarehe (check-in na check-out)\n3️⃣ Watu wangapi\n4️⃣ Jina na simu yako\n\n💬 Andika tarehe unataka kuingia.`,
            en: `🎯 *How to Book a Room:*\n\n1️⃣ Choose room type\n2️⃣ Tell us dates (check-in and check-out)\n3️⃣ Number of guests\n4️⃣ Your name and phone\n\n💬 Type the dates you want to check in.`
        },
        restaurant: {
            sw: `🎯 *Jinsi ya Kuagiza Chakula:*\n\n1️⃣ Angalia menyu yetu\n2️⃣ Chagua chakula unachokitaka\n3️⃣ Tueleze mahali pa kupeleka\n4️⃣ Tutakuletea!\n\n💬 Andika "menu" kuona vyakula vyetu.`,
            en: `🎯 *How to Order Food:*\n\n1️⃣ Check our menu\n2️⃣ Choose what you want\n3️⃣ Tell us delivery address\n4️⃣ We'll deliver!\n\n💬 Type "menu" to see our food items.`
        },
        salon: {
            sw: `🎯 *Jinsi ya Kubuku Miadi:*\n\n1️⃣ Chagua huduma (nywele, uso, etc.)\n2️⃣ Chagua tarehe na saa\n3️⃣ Jina na simu yako\n4️⃣ Tutakukonfirm!\n\n💬 Andika huduma unayoitaka.`,
            en: `🎯 *How to Book Appointment:*\n\n1️⃣ Choose service (hair, face, etc.)\n2️⃣ Pick date and time\n3️⃣ Your name and phone\n4️⃣ We'll confirm!\n\n💬 Type the service you want.`
        },
        retail: {
            sw: `🎯 *Jinsi ya Kuagiza:*\n\n1️⃣ Tueleze bidhaa unayoitaka\n2️⃣ Kiasi gani\n3️⃣ Mahali pa kupeleka\n4️⃣ Tutakuletea!\n\n💬 Andika bidhaa unayoitaka.`,
            en: `🎯 *How to Order:*\n\n1️⃣ Tell us what product you want\n2️⃣ Quantity\n3️⃣ Delivery address\n4️⃣ We'll deliver!\n\n💬 Type the product you want.`
        }
    };
    
    const defaultInstructions = {
        sw: `🎯 *Jinsi ya Kupata Huduma:*\n\n1️⃣ Tueleze unahitaji nini\n2️⃣ Tutakujibu na maelezo\n3️⃣ Kubali na tutaendelea\n\n💬 Andika ombi lako.`,
        en: `🎯 *How to Get Service:*\n\n1️⃣ Tell us what you need\n2️⃣ We'll reply with details\n3️⃣ Confirm and we'll proceed\n\n💬 Type your request.`
    };
    
    const template = bookingInstructions[company.businessType] || defaultInstructions;
    return template[isSw ? 'sw' : 'en'];
}

/**
 * Generate thanks response
 */
function getThanksResponse(company, knowledge, language) {
    const isSw = language === 'sw';
    const businessName = knowledge?.business?.name || company.name;
    
    return isSw 
        ? `Asante sana! 🙏 Tunafurahi kukuhudumia. Ukihitaji chochote kingine, tupo hapa! - ${businessName}`
        : `Thank you so much! 🙏 We're happy to serve you. If you need anything else, we're here! - ${businessName}`;
}

/**
 * Generate bye response
 */
function getByeResponse(company, knowledge, language) {
    const isSw = language === 'sw';
    const businessName = knowledge?.business?.name || company.name;
    
    return isSw 
        ? `Kwaheri! 👋 Asante kwa kuwasiliana na ${businessName}. Karibu tena wakati wowote!`
        : `Goodbye! 👋 Thank you for contacting ${businessName}. Welcome back anytime!`;
}

/**
 * Generate help response
 */
function getHelpResponse(company, knowledge, language) {
    const isSw = language === 'sw';
    const category = getCategory(company.businessType);
    
    return isSw 
        ? `ℹ️ *Naweza kukusaidia na:*\n\n• Kuona ${category.serviceLabel.sw} zetu\n• Bei na gharama\n• Kubuku/Kuagiza\n• Mahali tulipo\n• Saa za kufungua\n\n💬 Andika swali lako au chagua moja hapo juu.`
        : `ℹ️ *I can help you with:*\n\n• View our ${category.serviceLabel.en}\n• Prices and costs\n• Booking/Ordering\n• Our location\n• Opening hours\n\n💬 Type your question or choose one above.`;
}

/**
 * Generate general fallback response
 */
function getGeneralFallbackResponse(company, knowledge, language) {
    const isSw = language === 'sw';
    const businessName = knowledge?.business?.name || company.name;
    const phone = knowledge?.business?.phone;
    
    let response = isSw 
        ? `Samahani, sijaelewa vizuri swali lako. 🤔\n\nUnaweza:\n• Andika "huduma" kuona huduma zetu\n• Andika "bei" kuona bei\n• Andika "mahali" kupata location\n• Andika "book" kupata maelekezo ya kuagiza`
        : `Sorry, I didn't quite understand your question. 🤔\n\nYou can:\n• Type "services" to see our services\n• Type "prices" to see prices\n• Type "location" to get our address\n• Type "book" for booking instructions`;
    
    if (phone) {
        response += isSw 
            ? `\n\nAu piga simu: ${phone}`
            : `\n\nOr call us: ${phone}`;
    }
    
    return response;
}

/**
 * Main fallback response generator
 * Called when Gemini AI fails or is unavailable
 */
function generateFallbackResponse(company, userMessage, language = null) {
    // Load knowledge base
    const kb = getKnowledgeBase(company.id);
    const knowledge = kb.load();
    
    // Detect language if not provided
    const lang = language || detectLanguage(userMessage);
    
    // Detect intent
    const intent = detectIntent(userMessage);
    
    // Get business info
    const botName = knowledge?.ai?.botName || company.botName || 'Assistant';
    const businessName = knowledge?.business?.name || company.name;
    
    console.log(`🔄 Fallback response for intent: ${intent}, language: ${lang}`);
    
    // Generate response based on intent
    switch (intent) {
        case 'greeting':
            return getGreetingResponse(company.businessType, businessName, botName, lang);
        
        case 'services':
            return getServicesResponse(company, knowledge, lang);
        
        case 'price':
            return getPriceResponse(company, knowledge, lang);
        
        case 'location':
            return getLocationResponse(company, knowledge, lang);
        
        case 'hours':
            return getHoursResponse(company, knowledge, lang);
        
        case 'booking':
            return getBookingResponse(company, knowledge, lang);
        
        case 'thanks':
            return getThanksResponse(company, knowledge, lang);
        
        case 'bye':
            return getByeResponse(company, knowledge, lang);
        
        case 'help':
            return getHelpResponse(company, knowledge, lang);
        
        case 'info':
        case 'general':
        default:
            return getGeneralFallbackResponse(company, knowledge, lang);
    }
}

/**
 * Check if message matches common patterns that don't need AI
 */
function canUseFallback(message) {
    const lower = message.toLowerCase().trim();
    
    // Very short messages can use fallback
    if (lower.length < 3) return true;
    
    // Single word greetings
    const simplePatterns = [...GREETINGS.sw, ...GREETINGS.en, 'menu', 'bei', 'price', 'huduma', 'services', 'help', 'msaada'];
    if (simplePatterns.some(p => lower === p || lower === p + '?')) return true;
    
    return false;
}

module.exports = {
    generateFallbackResponse,
    detectLanguage,
    detectIntent,
    canUseFallback,
    GREETINGS,
    INTENT_KEYWORDS
};
