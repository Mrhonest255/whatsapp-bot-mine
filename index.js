/**
 * Zanzibar Tourism WhatsApp Bot
 * 
 * A production-ready WhatsApp Multi-Device bot for tour bookings
 * Built with @whiskeysockets/baileys
 * 
 * @author Zanzibar Tours
 * @version 1.0.0
 */

const { connectToWhatsApp } = require('./bot/connection');
const { handleMessage } = require('./bot/messageHandler');
const { initializeBookingsFile } = require('./bot/bookingFlow');

// ASCII Art Banner
const banner = `
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║     🌴  ZANZIBAR TOURISM WHATSAPP BOT  🇹🇿              ║
║                                                           ║
║     Stone Town • Prison Island • Safari Blue • Spice Farm ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
`;

/**
 * Graceful shutdown handler
 */
function setupGracefulShutdown() {
    const shutdown = async (signal) => {
        console.log(`\n⚠️ Received ${signal}. Shutting down gracefully...`);
        
        // Give time for cleanup
        setTimeout(() => {
            console.log('👋 Bot stopped. Goodbye!');
            process.exit(0);
        }, 2000);
    };
    
    // Handle different termination signals
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    
    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
        console.error('❌ Uncaught Exception:', error);
        process.exit(1);
    });
    
    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
        console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    });
}

/**
 * Main application entry point
 */
async function main() {
    console.log(banner);
    console.log('📅 Started:', new Date().toLocaleString());
    console.log('🔧 Node.js:', process.version);
    console.log('');
    
    // Setup graceful shutdown
    setupGracefulShutdown();
    
    // Initialize storage
    initializeBookingsFile();
    
    try {
        // Connect to WhatsApp
        await connectToWhatsApp(handleMessage);
        
    } catch (error) {
        console.error('❌ Failed to start bot:', error.message);
        process.exit(1);
    }
}

// Run the bot
main();
