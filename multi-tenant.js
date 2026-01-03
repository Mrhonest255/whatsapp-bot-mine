/**
 * Multi-Tenant WhatsApp Bot System
 * Main entry point for running multiple companies on one VPS
 * 
 * Usage:
 *   node multi-tenant.js           - Start dashboard and all bots
 *   node multi-tenant.js --port=80 - Use custom port
 */

const tenantManager = require('./multi-tenant/tenantManager');
const { connectAllTenants } = require('./multi-tenant/tenantConnection');
const { handleTenantMessage } = require('./multi-tenant/tenantMessageHandler');
const { startDashboard } = require('./multi-tenant/dashboard');

// Parse command line arguments
const args = process.argv.slice(2);
let port = 3000;

for (const arg of args) {
    if (arg.startsWith('--port=')) {
        port = parseInt(arg.split('=')[1]) || 3000;
    }
}

// Banner
console.log('\n');
console.log('╔═══════════════════════════════════════════════════════════╗');
console.log('║                                                           ║');
console.log('║   🏢  MULTI-TENANT WHATSAPP BOT SYSTEM  🏢                ║');
console.log('║                                                           ║');
console.log('║   Multiple companies • One VPS • Separate conversations   ║');
console.log('║                                                           ║');
console.log('╚═══════════════════════════════════════════════════════════╝');
console.log(`\n📅 Started: ${new Date().toLocaleString()}`);
console.log(`🔧 Node.js: ${process.version}\n`);

// Initialize
async function main() {
    try {
        // Initialize tenant manager
        console.log('📊 Initializing tenant manager...');
        tenantManager.init();
        
        // Start web dashboard
        console.log('🌐 Starting web dashboard...');
        startDashboard(port);
        
        // Connect all existing tenants
        console.log('🔌 Connecting existing tenants...');
        await connectAllTenants(handleTenantMessage);
        
        console.log('\n✅ System ready!\n');
        console.log('📌 How to add a new company:');
        console.log(`   1. Open http://localhost:${port} in your browser`);
        console.log('   2. Fill in company details and click "Register"');
        console.log('   3. Click "Connect" and scan the QR code with WhatsApp');
        console.log('   4. Done! The bot will handle messages for that company\n');
        
    } catch (error) {
        console.error('❌ Failed to start:', error.message);
        process.exit(1);
    }
}

// Handle shutdown
process.on('SIGINT', async () => {
    console.log('\n\n⚠️ Shutting down gracefully...');
    tenantManager.saveTenants();
    console.log('💾 Saved tenant data');
    process.exit(0);
});

process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught exception:', error.message);
    tenantManager.saveTenants();
});

// Start
main();
