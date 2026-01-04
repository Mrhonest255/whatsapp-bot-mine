/**
 * Business Templates System
 * Universal templates for different business types
 * Each template provides structure for any business category
 */

const BUSINESS_CATEGORIES = {
    // Utalii
    TOURISM: {
        id: 'tourism',
        name: { en: 'Tourism & Travel', sw: 'Utalii na Safari' },
        icon: '🌴',
        description: { 
            en: 'Tour operators, travel agencies, safari companies',
            sw: 'Wakala wa utalii, safari za wanyama, huduma za kusafiri'
        },
        defaultBotName: 'Safari Guide',
        serviceLabel: { en: 'Tours', sw: 'Safari' },
        bookingLabel: { en: 'Book Tour', sw: 'Buku Safari' },
        fields: ['tours', 'packages', 'destinations', 'vehicles', 'guides'],
        collectInfo: ['tour', 'date', 'pax', 'pickup_location', 'hotel', 'name', 'phone']
    },
    
    // Hoteli
    HOTEL: {
        id: 'hotel',
        name: { en: 'Hotel & Accommodation', sw: 'Hoteli na Malazi' },
        icon: '🏨',
        description: {
            en: 'Hotels, resorts, lodges, guesthouses, Airbnb',
            sw: 'Hoteli, resorts, guest houses, nyumba za kupanga'
        },
        defaultBotName: 'Receptionist',
        serviceLabel: { en: 'Rooms', sw: 'Vyumba' },
        bookingLabel: { en: 'Book Room', sw: 'Buku Chumba' },
        fields: ['rooms', 'amenities', 'room_types', 'facilities', 'policies'],
        collectInfo: ['room_type', 'check_in', 'check_out', 'guests', 'name', 'phone', 'email']
    },
    
    // Mgahawa
    RESTAURANT: {
        id: 'restaurant',
        name: { en: 'Restaurant & Food', sw: 'Mgahawa na Chakula' },
        icon: '🍽️',
        description: {
            en: 'Restaurants, cafes, food delivery, catering',
            sw: 'Migahawa, cafe, delivery ya chakula, catering'
        },
        defaultBotName: 'Waiter',
        serviceLabel: { en: 'Menu', sw: 'Menyu' },
        bookingLabel: { en: 'Order', sw: 'Agiza' },
        fields: ['menu', 'categories', 'specials', 'delivery_areas'],
        collectInfo: ['items', 'delivery_address', 'name', 'phone', 'payment_method']
    },
    
    // Salon
    SALON: {
        id: 'salon',
        name: { en: 'Salon & Beauty', sw: 'Salon na Urembo' },
        icon: '💇',
        description: {
            en: 'Hair salons, beauty parlors, spas, barbershops',
            sw: 'Saluni za nywele, urembo, spa, kinyozi'
        },
        defaultBotName: 'Stylist',
        serviceLabel: { en: 'Services', sw: 'Huduma' },
        bookingLabel: { en: 'Book Appointment', sw: 'Buku Miadi' },
        fields: ['services', 'stylists', 'products', 'packages'],
        collectInfo: ['service', 'stylist', 'date', 'time', 'name', 'phone']
    },
    
    // Duka
    RETAIL: {
        id: 'retail',
        name: { en: 'Shop & Retail', sw: 'Duka na Biashara' },
        icon: '🛒',
        description: {
            en: 'Shops, boutiques, electronics, grocery stores',
            sw: 'Maduka, boutique, electronics, grocery'
        },
        defaultBotName: 'Sales Assistant',
        serviceLabel: { en: 'Products', sw: 'Bidhaa' },
        bookingLabel: { en: 'Order', sw: 'Agiza' },
        fields: ['products', 'categories', 'brands', 'delivery'],
        collectInfo: ['products', 'quantity', 'delivery_address', 'name', 'phone', 'payment']
    },
    
    // Kliniki/Hospitali
    HEALTHCARE: {
        id: 'healthcare',
        name: { en: 'Healthcare & Medical', sw: 'Afya na Matibabu' },
        icon: '🏥',
        description: {
            en: 'Clinics, hospitals, pharmacies, dental offices',
            sw: 'Kliniki, hospitali, pharmacy, daktari wa meno'
        },
        defaultBotName: 'Nurse',
        serviceLabel: { en: 'Services', sw: 'Huduma' },
        bookingLabel: { en: 'Book Appointment', sw: 'Buku Miadi' },
        fields: ['services', 'doctors', 'departments', 'insurance'],
        collectInfo: ['service', 'doctor', 'date', 'time', 'symptoms', 'name', 'phone', 'insurance']
    },
    
    // Fitness
    FITNESS: {
        id: 'fitness',
        name: { en: 'Gym & Fitness', sw: 'Gym na Mazoezi' },
        icon: '💪',
        description: {
            en: 'Gyms, fitness centers, yoga studios, personal trainers',
            sw: 'Gym, fitness center, yoga, personal trainer'
        },
        defaultBotName: 'Trainer',
        serviceLabel: { en: 'Programs', sw: 'Programu' },
        bookingLabel: { en: 'Join', sw: 'Jiunge' },
        fields: ['programs', 'classes', 'trainers', 'membership'],
        collectInfo: ['program', 'membership_type', 'start_date', 'name', 'phone', 'fitness_goals']
    },
    
    // Elimu
    EDUCATION: {
        id: 'education',
        name: { en: 'Education & Training', sw: 'Elimu na Mafunzo' },
        icon: '📚',
        description: {
            en: 'Schools, tutoring, training centers, online courses',
            sw: 'Shule, tuition, training, online courses'
        },
        defaultBotName: 'Advisor',
        serviceLabel: { en: 'Courses', sw: 'Kozi' },
        bookingLabel: { en: 'Enroll', sw: 'Jiandikishe' },
        fields: ['courses', 'programs', 'schedules', 'instructors', 'materials'],
        collectInfo: ['course', 'schedule', 'level', 'name', 'phone', 'email', 'education_background']
    },
    
    // Usafiri
    TRANSPORT: {
        id: 'transport',
        name: { en: 'Transport & Delivery', sw: 'Usafiri na Delivery' },
        icon: '🚗',
        description: {
            en: 'Taxi, car rental, delivery services, logistics',
            sw: 'Taxi, kukodisha gari, delivery, usafiri'
        },
        defaultBotName: 'Dispatcher',
        serviceLabel: { en: 'Services', sw: 'Huduma' },
        bookingLabel: { en: 'Book', sw: 'Buku' },
        fields: ['vehicles', 'services', 'zones', 'rates'],
        collectInfo: ['service', 'pickup', 'destination', 'date', 'time', 'name', 'phone']
    },
    
    // Matukio
    EVENTS: {
        id: 'events',
        name: { en: 'Events & Entertainment', sw: 'Matukio na Burudani' },
        icon: '🎉',
        description: {
            en: 'Event planning, DJs, photographers, venues',
            sw: 'Event planning, DJ, picha, venue'
        },
        defaultBotName: 'Planner',
        serviceLabel: { en: 'Services', sw: 'Huduma' },
        bookingLabel: { en: 'Book', sw: 'Buku' },
        fields: ['services', 'packages', 'portfolio', 'venues'],
        collectInfo: ['service', 'event_type', 'date', 'guests', 'location', 'budget', 'name', 'phone']
    },
    
    // Fundi/Technician
    SERVICES: {
        id: 'services',
        name: { en: 'Professional Services', sw: 'Huduma za Kitaalamu' },
        icon: '🔧',
        description: {
            en: 'Plumbers, electricians, mechanics, consultants',
            sw: 'Fundi bomba, umeme, mechanics, washauri'
        },
        defaultBotName: 'Technician',
        serviceLabel: { en: 'Services', sw: 'Huduma' },
        bookingLabel: { en: 'Request Service', sw: 'Omba Huduma' },
        fields: ['services', 'areas', 'rates', 'availability'],
        collectInfo: ['service', 'problem', 'location', 'date', 'time', 'name', 'phone']
    },
    
    // Mali Isiyohamishika
    REAL_ESTATE: {
        id: 'real_estate',
        name: { en: 'Real Estate', sw: 'Mali Isiyohamishika' },
        icon: '🏠',
        description: {
            en: 'Property sales, rentals, property management',
            sw: 'Kuuza nyumba, kupangisha, property management'
        },
        defaultBotName: 'Agent',
        serviceLabel: { en: 'Properties', sw: 'Mali' },
        bookingLabel: { en: 'View Property', sw: 'Angalia Mali' },
        fields: ['properties', 'locations', 'types', 'amenities'],
        collectInfo: ['property_type', 'budget', 'location', 'bedrooms', 'purpose', 'name', 'phone', 'email']
    },
    
    // Nyinginezo
    OTHER: {
        id: 'other',
        name: { en: 'Other Business', sw: 'Biashara Nyingine' },
        icon: '🏢',
        description: {
            en: 'Any other type of business',
            sw: 'Aina nyingine yoyote ya biashara'
        },
        defaultBotName: 'Assistant',
        serviceLabel: { en: 'Services', sw: 'Huduma' },
        bookingLabel: { en: 'Contact', sw: 'Wasiliana' },
        fields: ['services', 'products', 'custom'],
        collectInfo: ['request', 'details', 'name', 'phone']
    }
};

/**
 * Get business category by ID
 */
function getCategory(categoryId) {
    for (const key in BUSINESS_CATEGORIES) {
        if (BUSINESS_CATEGORIES[key].id === categoryId) {
            return BUSINESS_CATEGORIES[key];
        }
    }
    return BUSINESS_CATEGORIES.OTHER;
}

/**
 * Get all categories as array
 */
function getAllCategories() {
    return Object.values(BUSINESS_CATEGORIES);
}

/**
 * Get category list for dropdown
 */
function getCategoryOptions(language = 'en') {
    return getAllCategories().map(cat => ({
        value: cat.id,
        label: `${cat.icon} ${cat.name[language]}`,
        description: cat.description[language]
    }));
}

// Export knowledge base and prompt builder
const { KnowledgeBase, getKnowledgeBase, knowledgeExists, listKnowledgeBases } = require('./knowledgeBase');
const { buildSystemPrompt, buildQuickContext } = require('./promptBuilder');
const orderSystem = require('./orderSystem');
const fallbackResponses = require('./fallbackResponses');

module.exports = {
    // Categories
    BUSINESS_CATEGORIES,
    getCategory,
    getAllCategories,
    getCategoryOptions,
    
    // Knowledge Base
    KnowledgeBase,
    getKnowledgeBase,
    knowledgeExists,
    listKnowledgeBases,
    
    // Prompt Builder
    buildSystemPrompt,
    buildQuickContext,
    
    // Fallback Responses (when AI fails)
    generateFallbackResponse: fallbackResponses.generateFallbackResponse,
    detectLanguage: fallbackResponses.detectLanguage,
    detectIntent: fallbackResponses.detectIntent,
    canUseFallback: fallbackResponses.canUseFallback,
    
    // Order System
    ...orderSystem
};
