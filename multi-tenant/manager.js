/**
 * Multi-Tenant Bot Manager
 * Manages multiple WhatsApp bot instances for different companies
 */

const { 
    default: makeWASocket, 
    DisconnectReason, 
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');

// Logger configuration
const logger = pino({ level: 'silent' });

// Active bot instances
const activeBots = new Map();

// Companies file
const COMPANIES_FILE = path.join(__dirname, '..', 'storage', 'companies.json');
const SESSIONS_BASE = path.join(__dirname, '..', 'storage', 'sessions');

/**
 * Get all companies
 */
function getCompanies() {
    try {
        if (fs.existsSync(COMPANIES_FILE)) {
            return JSON.parse(fs.readFileSync(COMPANIES_FILE, 'utf8'));
        }
    } catch (error) {
        console.error('Error reading companies:', error);
    }
    return [];
}

/**
 * Save companies
 */
function saveCompanies(companies) {
    try {
        const dir = path.dirname(COMPANIES_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(COMPANIES_FILE, JSON.stringify(companies, null, 2));
        return true;
    } catch (error) {
        console.error('Error saving companies:', error);
        return false;
    }
}

/**
 * Update company status
 */
function updateCompanyStatus(companyId, updates) {
    const companies = getCompanies();
    const company = companies.find(c => c.id === companyId);
    
    if (company) {
        Object.assign(company, updates);
        saveCompanies(companies);
        return company;
    }
    
    return null;
}

/**
 * Start bot for a company
 */
async function startCompanyBot(company) {
    // Import message handler here to avoid circular dependency
    const { handleMultiTenantMessage } = require('./messageHandler');
    
    try {
        console.log(`\n🚀 Starting bot for: ${company.name}`);
        
        // Update status to connecting
        updateCompanyStatus(company.id, { status: 'connecting' });
        
        // Session path for this company
        const sessionPath = path.join(SESSIONS_BASE, company.id);
        
        if (!fs.existsSync(sessionPath)) {
            fs.mkdirSync(sessionPath, { recursive: true });
        }
        
        // Fetch latest Baileys version
        const { version } = await fetchLatestBaileysVersion();
        
        // Load auth state
        const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
        
        // Create socket
        const sock = makeWASocket({
            version,
            logger,
            printQRInTerminal: false,
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, logger)
            },
            browser: [company.name, 'Chrome', '120.0.0'],
            connectTimeoutMs: 60000,
            qrTimeout: 60000,
            defaultQueryTimeoutMs: 60000,
            keepAliveIntervalMs: 30000,
            markOnlineOnConnect: true,
            syncFullHistory: false,
            generateHighQualityLinkPreview: false
        });
        
        // Store bot instance
        activeBots.set(company.id, {
            socket: sock,
            company: company,
            qrAttempts: 0
        });
        
        // Handle QR code
        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;
            
            if (qr) {
                console.log(`\n📱 QR Code generated for: ${company.name}`);
                
                try {
                    // Generate QR code as data URL
                    const qrDataURL = await QRCode.toDataURL(qr);
                    
                    // Update company with QR code
                    updateCompanyStatus(company.id, {
                        qrCode: qrDataURL,
                        status: 'connecting',
                        lastQR: new Date().toISOString()
                    });
                    
                    console.log(`✅ QR Code saved for: ${company.name}`);
                    
                } catch (error) {
                    console.error(`❌ Error generating QR for ${company.name}:`, error.message);
                }
            }
            
            if (connection === 'open') {
                const phoneNumber = sock.user?.id?.split(':')[0] || 'Unknown';
                
                console.log(`\n✅ ${company.name} CONNECTED!`);
                console.log(`📱 Phone: +${phoneNumber}`);
                
                // Update company status
                updateCompanyStatus(company.id, {
                    status: 'active',
                    phoneNumber: phoneNumber,
                    qrCode: null,
                    connectedAt: new Date().toISOString()
                });
                
            } else if (connection === 'close') {
                const statusCode = lastDisconnect?.error?.output?.statusCode;
                const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
                
                console.log(`\n⚠️ ${company.name} disconnected. Status: ${statusCode}`);
                
                if (statusCode === DisconnectReason.loggedOut) {
                    // Clear session
                    if (fs.existsSync(sessionPath)) {
                        fs.rmSync(sessionPath, { recursive: true, force: true });
                    }
                    
                    updateCompanyStatus(company.id, {
                        status: 'inactive',
                        phoneNumber: null,
                        qrCode: null
                    });
                    
                    activeBots.delete(company.id);
                    
                } else if (shouldReconnect) {
                    updateCompanyStatus(company.id, { status: 'reconnecting' });
                    
                    setTimeout(() => {
                        startCompanyBot(company);
                    }, 5000);
                }
            }
        });
        
        // Save credentials on update
        sock.ev.on('creds.update', saveCreds);
        
        // Handle incoming messages
        sock.ev.on('messages.upsert', async ({ messages, type }) => {
            if (type !== 'notify') return;
            
            for (const message of messages) {
                if (!message.message || message.key.fromMe) continue;
                if (message.key.remoteJid === 'status@broadcast') continue;
                
                try {
                    // Pass company context to message handler
                    await handleMultiTenantMessage(sock, message, company);
                } catch (error) {
                    console.error(`❌ Error handling message for ${company.name}:`, error.message);
                }
            }
        });
        
        return sock;
        
    } catch (error) {
        console.error(`❌ Failed to start bot for ${company.name}:`, error.message);
        
        updateCompanyStatus(company.id, {
            status: 'error',
            error: error.message
        });
        
        return null;
    }
}

/**
 * Start all company bots
 */
async function startAllBots() {
    const companies = getCompanies();
    
    console.log('\n╔══════════════════════════════════════════╗');
    console.log('║  MULTI-TENANT WHATSAPP BOT MANAGER      ║');
    console.log('╚══════════════════════════════════════════╝\n');
    
    if (companies.length === 0) {
        console.log('⚠️  No companies configured.');
        console.log('📝 Add companies via the admin panel at http://localhost:3000\n');
        return;
    }
    
    console.log(`📊 Found ${companies.length} company(s)\n`);
    
    for (const company of companies) {
        await startCompanyBot(company);
        
        // Wait 2 seconds between bot startups
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log('\n✅ All bots started!\n');
}

/**
 * Stop bot for a company
 */
async function stopCompanyBot(companyId) {
    const botInstance = activeBots.get(companyId);
    
    if (botInstance) {
        try {
            await botInstance.socket.logout();
            activeBots.delete(companyId);
            
            updateCompanyStatus(companyId, {
                status: 'inactive',
                phoneNumber: null
            });
            
            console.log(`✅ Bot stopped for company: ${companyId}`);
            return true;
        } catch (error) {
            console.error(`❌ Error stopping bot: ${error.message}`);
            return false;
        }
    }
    
    return false;
}

/**
 * Get bot instance for a company
 */
function getCompanyBot(companyId) {
    return activeBots.get(companyId);
}

/**
 * Get all active bots
 */
function getAllBots() {
    return Array.from(activeBots.values());
}

module.exports = {
    startCompanyBot,
    startAllBots,
    stopCompanyBot,
    getCompanyBot,
    getAllBots,
    getCompanies,
    saveCompanies,
    updateCompanyStatus
};
