/**
 * Multi-Tenant Bot Main Entry Point
 * Starts web server and all company bot instances
 */

const { startAllBots } = require('./multi-tenant/manager');

// ASCII Art Banner
console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║     🌴  MULTI-TENANT WHATSAPP BOT SYSTEM  🌍            ║
║                                                           ║
║     Multiple Companies • One VPS • Separate Sessions     ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

📅 Started: ${new Date().toLocaleString()}
🔧 Node.js: ${process.version}

`);

// Start web server in parallel
const webServer = require('./web/server');

// Start all company bots
(async () => {
    try {
        await startAllBots();
        
        console.log('\n🌐 ══════════════════════════════════════════');
        console.log('   SYSTEM READY');
        console.log('══════════════════════════════════════════');
        console.log('📊 Admin Panel: http://localhost:3000');
        console.log('🤖 All bots running and listening...');
        console.log('══════════════════════════════════════════\n');
        
    } catch (error) {
        console.error('❌ Failed to start bot system:', error);
        process.exit(1);
    }
})();

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\n⚠️  Shutting down gracefully...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n\n⚠️  Received SIGTERM. Shutting down...');
    process.exit(0);
});
