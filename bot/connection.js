/**
 * WhatsApp Connection Handler
 * Manages Baileys Multi-Device connection with auto-reconnect
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
const path = require('path');
const fs = require('fs');

// Session storage path
const SESSION_PATH = path.join(__dirname, '..', 'storage', 'sessions');

// Logger configuration - minimal logging for cleaner output
const logger = pino({ 
    level: 'silent' // Set to 'debug' for troubleshooting
});

// Connection state
let sock = null;
let connectionRetries = 0;
const MAX_RETRIES = 5;
const RETRY_DELAY = 5000; // 5 seconds

/**
 * Ensure storage directories exist
 */
function ensureDirectories() {
    const storagePath = path.join(__dirname, '..', 'storage');
    
    if (!fs.existsSync(storagePath)) {
        fs.mkdirSync(storagePath, { recursive: true });
        console.log('📁 Created storage directory');
    }
    
    if (!fs.existsSync(SESSION_PATH)) {
        fs.mkdirSync(SESSION_PATH, { recursive: true });
        console.log('📁 Created sessions directory');
    }
}

/**
 * Initialize WhatsApp connection
 * @param {Function} messageHandler - Callback for handling incoming messages
 * @returns {Promise<Object>} WhatsApp socket instance
 */
async function connectToWhatsApp(messageHandler) {
    ensureDirectories();
    
    console.log('\n🚀 Starting Zanzibar Tourism Bot...\n');
    
    try {
        // Fetch latest Baileys version
        const { version, isLatest } = await fetchLatestBaileysVersion();
        console.log(`📱 Using WA version: ${version.join('.')} (Latest: ${isLatest})`);
        
        // Load auth state from storage
        const { state, saveCreds } = await useMultiFileAuthState(SESSION_PATH);
        
        // Create socket connection
        sock = makeWASocket({
            version,
            logger,
            printQRInTerminal: false, // We'll handle QR manually for better formatting
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, logger)
            },
            browser: ['Zanzibar Tours Bot', 'Chrome', '120.0.0'],
            connectTimeoutMs: 60000,
            qrTimeout: 60000,
            defaultQueryTimeoutMs: 60000,
            keepAliveIntervalMs: 30000,
            markOnlineOnConnect: true,
            syncFullHistory: false,
            generateHighQualityLinkPreview: false
        });
        
        // Handle connection updates
        sock.ev.on('connection.update', async (update) => {
            await handleConnectionUpdate(update, messageHandler, saveCreds);
        });
        
        // Save credentials on update
        sock.ev.on('creds.update', saveCreds);
        
        // Handle incoming messages
        sock.ev.on('messages.upsert', async ({ messages, type }) => {
            if (type !== 'notify') return;
            
            for (const message of messages) {
                // Skip if no message content or if sent by bot
                if (!message.message || message.key.fromMe) continue;
                
                // Skip status broadcasts
                if (message.key.remoteJid === 'status@broadcast') continue;
                
                try {
                    await messageHandler(sock, message);
                } catch (error) {
                    console.error('❌ Error handling message:', error.message);
                }
            }
        });
        
        return sock;
        
    } catch (error) {
        console.error('❌ Failed to connect:', error.message);
        throw error;
    }
}

/**
 * Handle connection status updates
 * @param {Object} update - Connection update object
 * @param {Function} messageHandler - Message handler callback
 * @param {Function} saveCreds - Credentials save function
 */
async function handleConnectionUpdate(update, messageHandler, saveCreds) {
    const { connection, lastDisconnect, qr } = update;
    
    // Display QR code when available
    if (qr) {
        console.log('\n📱 Scan this QR code with WhatsApp:\n');
        qrcode.generate(qr, { small: true });
        console.log('\n⏳ Waiting for QR code scan...\n');
    }
    
    // Handle connection states
    if (connection === 'close') {
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const reason = lastDisconnect?.error?.output?.payload?.message || 'Unknown';
        
        console.log(`\n⚠️ Connection closed. Status: ${statusCode}, Reason: ${reason}`);
        
        // Check if we should reconnect
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
        
        if (shouldReconnect && connectionRetries < MAX_RETRIES) {
            connectionRetries++;
            console.log(`🔄 Reconnecting... Attempt ${connectionRetries}/${MAX_RETRIES}`);
            
            // Wait before reconnecting
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            
            // Attempt reconnection
            await connectToWhatsApp(messageHandler);
        } else if (statusCode === DisconnectReason.loggedOut) {
            console.log('\n🚪 Logged out from WhatsApp.');
            console.log('🗑️ Clearing session data...');
            
            // Clear session folder
            if (fs.existsSync(SESSION_PATH)) {
                fs.rmSync(SESSION_PATH, { recursive: true, force: true });
                fs.mkdirSync(SESSION_PATH, { recursive: true });
            }
            
            console.log('📱 Please restart the bot and scan the QR code again.\n');
            process.exit(1);
        } else {
            console.log('❌ Max reconnection attempts reached. Please restart the bot.');
            process.exit(1);
        }
    } else if (connection === 'open') {
        connectionRetries = 0; // Reset retry counter on successful connection
        
        const phoneNumber = sock.user?.id?.split(':')[0] || 'Unknown';
        
        console.log('\n✅ ═══════════════════════════════════════════');
        console.log('   🌴 ZANZIBAR TOURISM BOT CONNECTED! 🇹🇿');
        console.log('═══════════════════════════════════════════════');
        console.log(`📱 WhatsApp Number: +${phoneNumber}`);
        console.log(`⏰ Connected at: ${new Date().toLocaleString()}`);
        console.log('═══════════════════════════════════════════════\n');
        console.log('💬 Bot is now listening for messages...\n');
    } else if (connection === 'connecting') {
        console.log('🔌 Connecting to WhatsApp...');
    }
}

/**
 * Get current socket instance
 * @returns {Object|null} Socket instance
 */
function getSocket() {
    return sock;
}

/**
 * Check if connected
 * @returns {boolean} Connection status
 */
function isConnected() {
    return sock?.user ? true : false;
}

/**
 * Send a message
 * @param {string} jid - WhatsApp JID
 * @param {Object} content - Message content
 * @returns {Promise<Object>} Send result
 */
async function sendMessage(jid, content) {
    if (!sock) {
        throw new Error('Not connected to WhatsApp');
    }
    
    return await sock.sendMessage(jid, content);
}

/**
 * Send text message with typing indicator
 * @param {string} jid - WhatsApp JID
 * @param {string} text - Message text
 * @returns {Promise<Object>} Send result
 */
async function sendTextWithTyping(jid, text) {
    if (!sock) {
        throw new Error('Not connected to WhatsApp');
    }
    
    // Show typing indicator
    await sock.sendPresenceUpdate('composing', jid);
    
    // Simulate typing delay (more natural)
    const typingDelay = Math.min(text.length * 20, 2000);
    await new Promise(resolve => setTimeout(resolve, typingDelay));
    
    // Send message
    const result = await sock.sendMessage(jid, { text });
    
    // Clear typing indicator
    await sock.sendPresenceUpdate('paused', jid);
    
    return result;
}

module.exports = {
    connectToWhatsApp,
    getSocket,
    isConnected,
    sendMessage,
    sendTextWithTyping
};
