/**
 * Bot Configuration
 * Central configuration file for Universal Business Bot
 * NOTE: API keys are loaded from environment variables for security
 */

module.exports = {
    // Admin Configuration
    admin: {
        // Primary admin WhatsApp number (receives booking notifications)
        // Format: country code + number without + or spaces
        primaryNumber: process.env.ADMIN_PHONE || '255688774043',
        
        // Additional admin numbers (optional)
        additionalNumbers: [
            // '255712345678',
            // '255798765432'
        ]
    },
    
    // Gemini AI Configuration - API KEY IS PRIVATE!
    gemini: {
        // Enable/disable Gemini AI
        enabled: true,
        // Load from environment variable or use default (keep secure!)
        apiKey: process.env.GEMINI_API_KEY || 'AIzaSyAl6DP-5Qjawh3tgw-HeOYJd1SKq0IjCxQ',
        model: 'gemini-2.5-pro',
        maxTokens: 8192,
        temperature: 0.7,
        // Fallback settings - use manual responses when AI fails
        enableFallback: true,
        maxRetries: 2,
        timeoutMs: 30000
    },
    
    // Bot Behavior
    bot: {
        // Name shown in messages
        name: 'Business Assistant',
        
        // Rate limiting (milliseconds between messages per user)
        rateLimitMs: 1000,
        
        // Session timeout (milliseconds)
        sessionTimeoutMs: 30 * 60 * 1000, // 30 minutes
        
        // Max chat history messages to keep per user
        maxChatHistory: 10,
        
        // Enable AI for general questions
        enableAI: true,
        
        // Enable typing indicators
        showTyping: true,
        
        // Default language ('en' or 'sw')
        defaultLanguage: 'sw'
    },
    
    // Business Information
    business: {
        name: 'Zanzibar Tours & Safaris',
        phone: '+255 688 774 043',
        email: 'info@zanzibartours.com',
        website: 'www.zanzibartours.com',
        location: 'Stone Town, Zanzibar, Tanzania',
        
        // Operating hours
        hours: {
            open: '08:00',
            close: '20:00',
            timezone: 'Africa/Dar_es_Salaam'
        }
    },
    
    // Tour Settings
    tours: {
        // Minimum booking notice (hours)
        minBookingNotice: 24,
        
        // Maximum people per booking
        maxPaxPerBooking: 50,
        
        // Currency
        currency: 'USD',
        
        // Deposit percentage (for future payment integration)
        depositPercent: 30
    },
    
    // Storage
    storage: {
        // Bookings file path
        bookingsFile: 'storage/bookings.json',
        
        // Sessions directory
        sessionsDir: 'storage/sessions'
    },
    
    // Messages
    messages: {
        // Welcome message
        welcome: {
            en: '🌴 Welcome to Zanzibar Tours! 🇹🇿',
            sw: '🌴 Karibu Zanzibar Tours! 🇹🇿'
        },
        
        // After booking confirmation
        afterBooking: {
            en: '📞 Our agent will contact you within 1 hour to confirm your booking.',
            sw: '📞 Wakala wetu atawasiliana nawe ndani ya saa 1 kuthibitisha uhifadhi wako.'
        }
    }
};
