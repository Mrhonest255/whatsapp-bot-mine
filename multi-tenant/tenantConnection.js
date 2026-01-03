/**
 * Multi-Tenant WhatsApp Connection Handler
 * Manages separate WhatsApp connections for each tenant/company
 */

const { 
    default: makeWASocket, 
    DisconnectReason, 
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const qrcode = require('qrcode-terminal');
const QRCode = require('qrcode');
const fs = require('fs');
const tenantManager = require('./tenantManager');

// Logger
const logger = pino({ level: 'silent' });

// Connection state per tenant
const connectionRetries = new Map();
const MAX_RETRIES = 5;
const RETRY_DELAY = 5000;

// QR code callbacks (for web dashboard)
const qrCallbacks = new Map();

/**
 * Connect a specific tenant to WhatsApp
 * @param {string} tenantId - Tenant ID
 * @param {Function} messageHandler - Message handler function
 * @param {Function} onQR - Callback when QR code is generated
 * @returns {Promise<Object>} WhatsApp socket
 */
async function connectTenant(tenantId, messageHandler, onQR = null) {
    const tenant = tenantManager.getTenant(tenantId);
    if (!tenant) {
        throw new Error(`Tenant not found: ${tenantId}`);
    }
    
    const sessionPath = tenantManager.getSessionPath(tenantId);
    
    // Ensure session directory exists
    if (!fs.existsSync(sessionPath)) {
        fs.mkdirSync(sessionPath, { recursive: true });
    }
    
    console.log(`\n🚀 Connecting tenant: ${tenant.companyName} (${tenantId})`);
    
    try {
        const { version } = await fetchLatestBaileysVersion();
        const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
        
        const sock = makeWASocket({
            version,
            logger,
            printQRInTerminal: false,
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, logger)
            },
            browser: [`${tenant.companyName} Bot`, 'Chrome', '120.0.0'],
            connectTimeoutMs: 60000,
            qrTimeout: 60000,
            defaultQueryTimeoutMs: 60000,
            keepAliveIntervalMs: 30000,
            markOnlineOnConnect: true,
            syncFullHistory: false
        });
        
        // Handle connection updates
        sock.ev.on('connection.update', async (update) => {
            await handleConnectionUpdate(tenantId, update, messageHandler, saveCreds, onQR);
        });
        
        // Save credentials
        sock.ev.on('creds.update', saveCreds);
        
        // Handle messages
        sock.ev.on('messages.upsert', async ({ messages, type }) => {
            if (type !== 'notify') return;
            
            for (const message of messages) {
                if (!message.message || message.key.fromMe) continue;
                if (message.key.remoteJid === 'status@broadcast') continue;
                
                try {
                    // Pass tenant info to message handler
                    await messageHandler(sock, message, tenant);
                    tenantManager.incrementMessages(tenantId);
                } catch (error) {
                    console.error(`❌ [${tenantId}] Message error:`, error.message);
                }
            }
        });
        
        // Store socket
        tenantManager.setSocket(tenantId, sock);
        
        return sock;
        
    } catch (error) {
        console.error(`❌ [${tenantId}] Connection failed:`, error.message);
        throw error;
    }
}

/**
 * Handle connection updates for a tenant
 */
async function handleConnectionUpdate(tenantId, update, messageHandler, saveCreds, onQR) {
    const { connection, lastDisconnect, qr } = update;
    const tenant = tenantManager.getTenant(tenantId);
    
    if (qr) {
        console.log(`\n📱 [${tenant.companyName}] Scan QR code:`);
        qrcode.generate(qr, { small: true });
        
        // Generate QR as base64 for web dashboard
        if (onQR) {
            try {
                const qrBase64 = await QRCode.toDataURL(qr);
                onQR(tenantId, qrBase64);
            } catch (err) {
                console.error('QR generation error:', err);
            }
        }
        
        // Store callback for later use
        if (qrCallbacks.has(tenantId)) {
            const callback = qrCallbacks.get(tenantId);
            callback(qr);
        }
    }
    
    if (connection === 'close') {
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
        
        console.log(`⚠️ [${tenant.companyName}] Disconnected. Status: ${statusCode}`);
        
        tenantManager.removeSocket(tenantId);
        
        const retries = connectionRetries.get(tenantId) || 0;
        
        if (shouldReconnect && retries < MAX_RETRIES) {
            connectionRetries.set(tenantId, retries + 1);
            console.log(`🔄 [${tenant.companyName}] Reconnecting... (${retries + 1}/${MAX_RETRIES})`);
            
            await new Promise(r => setTimeout(r, RETRY_DELAY));
            await connectTenant(tenantId, messageHandler);
        } else if (statusCode === DisconnectReason.loggedOut) {
            console.log(`🚪 [${tenant.companyName}] Logged out. Clearing session...`);
            
            const sessionPath = tenantManager.getSessionPath(tenantId);
            if (fs.existsSync(sessionPath)) {
                fs.rmSync(sessionPath, { recursive: true, force: true });
                fs.mkdirSync(sessionPath, { recursive: true });
            }
            
            tenantManager.updateTenant(tenantId, { whatsappNumber: null });
        }
        
    } else if (connection === 'open') {
        connectionRetries.set(tenantId, 0);
        
        const sock = tenantManager.getSocket(tenantId);
        const phoneNumber = sock?.user?.id?.split(':')[0] || 'Unknown';
        
        tenantManager.updateTenant(tenantId, {
            whatsappNumber: phoneNumber,
            lastConnected: new Date().toISOString()
        });
        
        console.log('\n✅ ═══════════════════════════════════════════');
        console.log(`   🏢 ${tenant.companyName} CONNECTED!`);
        console.log('═══════════════════════════════════════════════');
        console.log(`📱 WhatsApp: +${phoneNumber}`);
        console.log(`🆔 Tenant ID: ${tenantId}`);
        console.log(`⏰ Time: ${new Date().toLocaleString()}`);
        console.log('═══════════════════════════════════════════════\n');
        
    } else if (connection === 'connecting') {
        console.log(`🔌 [${tenant.companyName}] Connecting...`);
    }
}

/**
 * Disconnect a tenant
 * @param {string} tenantId - Tenant ID
 */
async function disconnectTenant(tenantId) {
    const sock = tenantManager.getSocket(tenantId);
    if (sock) {
        await sock.logout();
        tenantManager.removeSocket(tenantId);
        console.log(`🔌 [${tenantId}] Disconnected`);
    }
}

/**
 * Connect all active tenants
 * @param {Function} messageHandler - Message handler
 */
async function connectAllTenants(messageHandler) {
    const tenants = tenantManager.getAllTenants();
    
    console.log(`\n📊 Found ${tenants.length} tenant(s) to connect\n`);
    
    for (const tenant of tenants) {
        if (tenant.isActive) {
            try {
                await connectTenant(tenant.id, messageHandler);
                // Delay between connections to avoid rate limiting
                await new Promise(r => setTimeout(r, 2000));
            } catch (error) {
                console.error(`❌ Failed to connect ${tenant.companyName}:`, error.message);
            }
        }
    }
}

/**
 * Set QR callback for a tenant (used by web dashboard)
 * @param {string} tenantId - Tenant ID
 * @param {Function} callback - Callback function
 */
function setQRCallback(tenantId, callback) {
    qrCallbacks.set(tenantId, callback);
}

/**
 * Send message as a specific tenant
 * @param {string} tenantId - Tenant ID
 * @param {string} jid - Recipient JID
 * @param {Object} content - Message content
 */
async function sendMessage(tenantId, jid, content) {
    const sock = tenantManager.getSocket(tenantId);
    if (!sock) {
        throw new Error(`Tenant ${tenantId} not connected`);
    }
    return await sock.sendMessage(jid, content);
}

/**
 * Send text with typing indicator
 * @param {string} tenantId - Tenant ID
 * @param {string} jid - Recipient JID
 * @param {string} text - Message text
 */
async function sendTextWithTyping(tenantId, jid, text) {
    const sock = tenantManager.getSocket(tenantId);
    if (!sock) {
        throw new Error(`Tenant ${tenantId} not connected`);
    }
    
    // Typing indicator
    await sock.sendPresenceUpdate('composing', jid);
    
    // Human-like delay (3-6 seconds)
    const baseDelay = 3000 + Math.random() * 3000;
    const readingTime = Math.min(text.length * 15, 4000);
    await new Promise(r => setTimeout(r, baseDelay + readingTime));
    
    // Send
    const result = await sock.sendMessage(jid, { text });
    
    await sock.sendPresenceUpdate('paused', jid);
    
    return result;
}

module.exports = {
    connectTenant,
    disconnectTenant,
    connectAllTenants,
    setQRCallback,
    sendMessage,
    sendTextWithTyping
};
