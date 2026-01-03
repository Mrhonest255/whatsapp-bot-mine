/**
 * Multi-Tenant Manager
 * Manages multiple companies/tenants on a single VPS
 * Each tenant has their own WhatsApp session, admin, and conversations
 */

const fs = require('fs');
const path = require('path');

// Storage paths
const TENANTS_FILE = path.join(__dirname, '..', 'storage', 'tenants.json');
const SESSIONS_DIR = path.join(__dirname, '..', 'storage', 'tenant-sessions');

// In-memory tenant data
let tenants = new Map();
let activeSockets = new Map(); // tenantId -> WhatsApp socket

/**
 * Initialize tenant manager
 */
function init() {
    // Ensure directories exist
    const storageDir = path.join(__dirname, '..', 'storage');
    if (!fs.existsSync(storageDir)) {
        fs.mkdirSync(storageDir, { recursive: true });
    }
    if (!fs.existsSync(SESSIONS_DIR)) {
        fs.mkdirSync(SESSIONS_DIR, { recursive: true });
    }
    
    // Load existing tenants
    loadTenants();
    
    console.log(`📊 Loaded ${tenants.size} tenant(s)`);
}

/**
 * Load tenants from file
 */
function loadTenants() {
    try {
        if (fs.existsSync(TENANTS_FILE)) {
            const data = JSON.parse(fs.readFileSync(TENANTS_FILE, 'utf8'));
            tenants = new Map(Object.entries(data));
        }
    } catch (error) {
        console.error('❌ Error loading tenants:', error.message);
        tenants = new Map();
    }
}

/**
 * Save tenants to file
 */
function saveTenants() {
    try {
        const data = Object.fromEntries(tenants);
        fs.writeFileSync(TENANTS_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('❌ Error saving tenants:', error.message);
    }
}

/**
 * Register a new tenant/company
 * @param {Object} tenantData - Tenant information
 * @returns {Object} Created tenant
 */
function registerTenant(tenantData) {
    const tenantId = generateTenantId();
    
    const tenant = {
        id: tenantId,
        companyName: tenantData.companyName || 'My Company',
        businessType: tenantData.businessType || 'tourism', // tourism, hotel, restaurant, etc.
        adminPhone: tenantData.adminPhone,
        adminName: tenantData.adminName || 'Admin',
        whatsappNumber: null, // Set after QR scan
        botName: tenantData.botName || 'Assistant',
        language: tenantData.language || 'en', // Default language
        customGreeting: tenantData.customGreeting || null,
        customPrompt: tenantData.customPrompt || null,
        tours: tenantData.tours || [], // Custom tours/products
        pricing: tenantData.pricing || {},
        isActive: true,
        createdAt: new Date().toISOString(),
        lastConnected: null,
        totalMessages: 0,
        totalBookings: 0
    };
    
    tenants.set(tenantId, tenant);
    saveTenants();
    
    // Create session directory for this tenant
    const tenantSessionDir = path.join(SESSIONS_DIR, tenantId);
    if (!fs.existsSync(tenantSessionDir)) {
        fs.mkdirSync(tenantSessionDir, { recursive: true });
    }
    
    console.log(`✅ Registered new tenant: ${tenant.companyName} (${tenantId})`);
    
    return tenant;
}

/**
 * Get tenant by ID
 * @param {string} tenantId - Tenant ID
 * @returns {Object|null} Tenant data
 */
function getTenant(tenantId) {
    return tenants.get(tenantId) || null;
}

/**
 * Get tenant by WhatsApp number
 * @param {string} whatsappNumber - WhatsApp number
 * @returns {Object|null} Tenant data
 */
function getTenantByPhone(whatsappNumber) {
    for (const [id, tenant] of tenants) {
        if (tenant.whatsappNumber === whatsappNumber) {
            return tenant;
        }
    }
    return null;
}

/**
 * Update tenant data
 * @param {string} tenantId - Tenant ID
 * @param {Object} updates - Fields to update
 * @returns {Object|null} Updated tenant
 */
function updateTenant(tenantId, updates) {
    const tenant = tenants.get(tenantId);
    if (!tenant) return null;
    
    Object.assign(tenant, updates);
    tenant.updatedAt = new Date().toISOString();
    
    tenants.set(tenantId, tenant);
    saveTenants();
    
    return tenant;
}

/**
 * Delete a tenant
 * @param {string} tenantId - Tenant ID
 * @returns {boolean} Success
 */
function deleteTenant(tenantId) {
    if (!tenants.has(tenantId)) return false;
    
    // Disconnect socket if active
    const sock = activeSockets.get(tenantId);
    if (sock) {
        sock.logout();
        activeSockets.delete(tenantId);
    }
    
    // Delete session files
    const tenantSessionDir = path.join(SESSIONS_DIR, tenantId);
    if (fs.existsSync(tenantSessionDir)) {
        fs.rmSync(tenantSessionDir, { recursive: true, force: true });
    }
    
    tenants.delete(tenantId);
    saveTenants();
    
    console.log(`🗑️ Deleted tenant: ${tenantId}`);
    return true;
}

/**
 * Get all tenants
 * @returns {Array} All tenants
 */
function getAllTenants() {
    return Array.from(tenants.values());
}

/**
 * Get active tenants (connected to WhatsApp)
 * @returns {Array} Active tenants
 */
function getActiveTenants() {
    return getAllTenants().filter(t => activeSockets.has(t.id));
}

/**
 * Store socket for a tenant
 * @param {string} tenantId - Tenant ID
 * @param {Object} sock - WhatsApp socket
 */
function setSocket(tenantId, sock) {
    activeSockets.set(tenantId, sock);
}

/**
 * Get socket for a tenant
 * @param {string} tenantId - Tenant ID
 * @returns {Object|null} WhatsApp socket
 */
function getSocket(tenantId) {
    return activeSockets.get(tenantId) || null;
}

/**
 * Remove socket for a tenant
 * @param {string} tenantId - Tenant ID
 */
function removeSocket(tenantId) {
    activeSockets.delete(tenantId);
}

/**
 * Get session path for a tenant
 * @param {string} tenantId - Tenant ID
 * @returns {string} Session directory path
 */
function getSessionPath(tenantId) {
    return path.join(SESSIONS_DIR, tenantId);
}

/**
 * Increment message count for tenant
 * @param {string} tenantId - Tenant ID
 */
function incrementMessages(tenantId) {
    const tenant = tenants.get(tenantId);
    if (tenant) {
        tenant.totalMessages = (tenant.totalMessages || 0) + 1;
        tenants.set(tenantId, tenant);
        // Save periodically, not every message
        if (tenant.totalMessages % 10 === 0) {
            saveTenants();
        }
    }
}

/**
 * Increment booking count for tenant
 * @param {string} tenantId - Tenant ID
 */
function incrementBookings(tenantId) {
    const tenant = tenants.get(tenantId);
    if (tenant) {
        tenant.totalBookings = (tenant.totalBookings || 0) + 1;
        tenants.set(tenantId, tenant);
        saveTenants();
    }
}

/**
 * Generate unique tenant ID
 * @returns {string} Tenant ID
 */
function generateTenantId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let id = 'T-';
    for (let i = 0; i < 8; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
}

/**
 * Get tenant statistics
 * @param {string} tenantId - Tenant ID
 * @returns {Object} Statistics
 */
function getTenantStats(tenantId) {
    const tenant = tenants.get(tenantId);
    if (!tenant) return null;
    
    return {
        companyName: tenant.companyName,
        isConnected: activeSockets.has(tenantId),
        whatsappNumber: tenant.whatsappNumber,
        totalMessages: tenant.totalMessages || 0,
        totalBookings: tenant.totalBookings || 0,
        createdAt: tenant.createdAt,
        lastConnected: tenant.lastConnected
    };
}

module.exports = {
    init,
    registerTenant,
    getTenant,
    getTenantByPhone,
    updateTenant,
    deleteTenant,
    getAllTenants,
    getActiveTenants,
    setSocket,
    getSocket,
    removeSocket,
    getSessionPath,
    incrementMessages,
    incrementBookings,
    getTenantStats,
    saveTenants
};
