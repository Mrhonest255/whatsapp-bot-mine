/**
 * Universal Business Bot - Admin Panel Web Server
 * Manage multiple businesses from one dashboard
 * Supports Tourism, Hotel, Restaurant, Salon, Retail, Healthcare, and more!
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const QRCode = require('qrcode');

// Business Templates System
const { BUSINESS_CATEGORIES, getCategory, getAllCategories, getCategoryOptions } = require('../business-templates');
const { getKnowledgeBase, knowledgeExists } = require('../business-templates/knowledgeBase');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Companies data file
const COMPANIES_FILE = path.join(__dirname, '..', 'storage', 'companies.json');

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
        fs.writeFileSync(COMPANIES_FILE, JSON.stringify(companies, null, 2));
        return true;
    } catch (error) {
        console.error('Error saving companies:', error);
        return false;
    }
}

// Routes

// Home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Get all companies API
app.get('/api/companies', (req, res) => {
    const companies = getCompanies();
    res.json(companies);
});

// Add new company API
app.post('/api/companies', (req, res) => {
    const { name, adminNumber, geminiApiKey, businessType } = req.body;
    
    if (!name || !adminNumber) {
        return res.status(400).json({ error: 'Name and admin number are required' });
    }
    
    const companies = getCompanies();
    
    // Generate unique ID
    const id = Date.now().toString();

    const newCompany = {
        id,
        name,
        adminNumber,
        // API keys are now managed centrally via config.js
        // No longer stored per-company for security
        businessType: businessType || 'tourism',
        createdAt: new Date().toISOString(),
        status: 'inactive',
        phoneNumber: null,
        qrCode: null
    };
    
    companies.push(newCompany);
    
    if (saveCompanies(companies)) {
        res.json({ success: true, company: newCompany });
    } else {
        res.status(500).json({ error: 'Failed to save company' });
    }
});

// Delete company API
app.delete('/api/companies/:id', (req, res) => {
    const { id } = req.params;
    let companies = getCompanies();
    
    const index = companies.findIndex(c => c.id === id);
    if (index === -1) {
        return res.status(404).json({ error: 'Company not found' });
    }
    
    companies.splice(index, 1);
    
    if (saveCompanies(companies)) {
        res.json({ success: true });
    } else {
        res.status(500).json({ error: 'Failed to delete company' });
    }
});

// Update company status
app.patch('/api/companies/:id/status', (req, res) => {
    const { id } = req.params;
    const { status, phoneNumber, qrCode } = req.body;
    
    const companies = getCompanies();
    const company = companies.find(c => c.id === id);
    
    if (!company) {
        return res.status(404).json({ error: 'Company not found' });
    }
    
    if (status) company.status = status;
    if (phoneNumber) company.phoneNumber = phoneNumber;
    if (qrCode) company.qrCode = qrCode;
    
    if (saveCompanies(companies)) {
        res.json({ success: true, company });
    } else {
        res.status(500).json({ error: 'Failed to update company' });
    }
});

// Get company stats
app.get('/api/stats', (req, res) => {
    const companies = getCompanies();
    
    const stats = {
        total: companies.length,
        active: companies.filter(c => c.status === 'active').length,
        inactive: companies.filter(c => c.status === 'inactive').length,
        connecting: companies.filter(c => c.status === 'connecting').length
    };
    
    res.json(stats);
});

// Start bot for a specific company
app.post('/api/companies/:id/start', async (req, res) => {
    const { id } = req.params;
    const companies = getCompanies();
    const company = companies.find(c => c.id === id);
    
    if (!company) {
        return res.status(404).json({ error: 'Company not found' });
    }
    
    try {
        // Import manager here to avoid circular dependency
        const { startCompanyBot } = require('../multi-tenant/manager');
        
        // Start the bot
        await startCompanyBot(company);
        
        res.json({ success: true, message: 'Bot started successfully' });
    } catch (error) {
        console.error('Error starting bot:', error);
        res.status(500).json({ error: 'Failed to start bot: ' + error.message });
    }
});

// ============================================================
// BUSINESS TEMPLATES & CATEGORIES APIs
// ============================================================

// Get all business categories
app.get('/api/categories', (req, res) => {
    const lang = req.query.lang || 'en';
    const categories = getCategoryOptions(lang);
    res.json(categories);
});

// Get category details
app.get('/api/categories/:id', (req, res) => {
    const category = getCategory(req.params.id);
    res.json(category);
});

// ============================================================
// KNOWLEDGE BASE APIs
// ============================================================

// Get knowledge base for a company
app.get('/api/companies/:id/knowledge', (req, res) => {
    const { id } = req.params;
    const kb = getKnowledgeBase(id);
    const data = kb.load();
    
    if (!data) {
        return res.status(404).json({ error: 'Knowledge base not found', exists: false });
    }
    
    res.json(data);
});

// Initialize knowledge base for a company
app.post('/api/companies/:id/knowledge/init', (req, res) => {
    const { id } = req.params;
    const companies = getCompanies();
    const company = companies.find(c => c.id === id);
    
    if (!company) {
        return res.status(404).json({ error: 'Company not found' });
    }
    
    const { businessInfo } = req.body;
    const kb = getKnowledgeBase(id);
    
    const success = kb.initialize(company.businessType, {
        name: company.name,
        ...businessInfo
    });
    
    if (success) {
        res.json({ success: true, data: kb.load() });
    } else {
        res.status(500).json({ error: 'Failed to initialize knowledge base' });
    }
});

// Update knowledge base section
app.put('/api/companies/:id/knowledge/:section', (req, res) => {
    const { id, section } = req.params;
    const { data } = req.body;
    
    const kb = getKnowledgeBase(id);
    if (!kb.load()) {
        return res.status(404).json({ error: 'Knowledge base not found' });
    }
    
    const success = kb.updateSection(section, data);
    
    if (success) {
        res.json({ success: true, section, data });
    } else {
        res.status(500).json({ error: 'Failed to update section' });
    }
});

// Add item to a section (tours, products, services, etc.)
app.post('/api/companies/:id/knowledge/:section/items', (req, res) => {
    const { id, section } = req.params;
    const item = req.body;
    
    const kb = getKnowledgeBase(id);
    if (!kb.load()) {
        return res.status(404).json({ error: 'Knowledge base not found' });
    }
    
    const success = kb.addItem(section, item);
    
    if (success) {
        res.json({ success: true, item });
    } else {
        res.status(500).json({ error: 'Failed to add item' });
    }
});

// Update item in a section
app.put('/api/companies/:id/knowledge/:section/items/:itemId', (req, res) => {
    const { id, section, itemId } = req.params;
    const updates = req.body;
    
    const kb = getKnowledgeBase(id);
    if (!kb.load()) {
        return res.status(404).json({ error: 'Knowledge base not found' });
    }
    
    const success = kb.updateItem(section, itemId, updates);
    
    if (success) {
        res.json({ success: true });
    } else {
        res.status(500).json({ error: 'Failed to update item' });
    }
});

// Delete item from a section
app.delete('/api/companies/:id/knowledge/:section/items/:itemId', (req, res) => {
    const { id, section, itemId } = req.params;
    
    const kb = getKnowledgeBase(id);
    if (!kb.load()) {
        return res.status(404).json({ error: 'Knowledge base not found' });
    }
    
    const success = kb.removeItem(section, itemId);
    
    if (success) {
        res.json({ success: true });
    } else {
        res.status(500).json({ error: 'Failed to delete item' });
    }
});

// Add FAQ
app.post('/api/companies/:id/knowledge/faqs', (req, res) => {
    const { id } = req.params;
    const { question, answer } = req.body;
    
    const kb = getKnowledgeBase(id);
    if (!kb.load()) {
        return res.status(404).json({ error: 'Knowledge base not found' });
    }
    
    const success = kb.addFAQ(question, answer);
    
    if (success) {
        res.json({ success: true });
    } else {
        res.status(500).json({ error: 'Failed to add FAQ' });
    }
});

// Update business info
app.put('/api/companies/:id/knowledge/business', (req, res) => {
    const { id } = req.params;
    const businessInfo = req.body;
    
    const kb = getKnowledgeBase(id);
    if (!kb.load()) {
        return res.status(404).json({ error: 'Knowledge base not found' });
    }
    
    const success = kb.updateSection('business', businessInfo);
    
    if (success) {
        res.json({ success: true });
    } else {
        res.status(500).json({ error: 'Failed to update business info' });
    }
});

// Update AI settings
app.put('/api/companies/:id/knowledge/ai', (req, res) => {
    const { id } = req.params;
    const aiSettings = req.body;
    
    const kb = getKnowledgeBase(id);
    if (!kb.load()) {
        return res.status(404).json({ error: 'Knowledge base not found' });
    }
    
    const success = kb.updateSection('ai', aiSettings);
    
    if (success) {
        res.json({ success: true });
    } else {
        res.status(500).json({ error: 'Failed to update AI settings' });
    }
});

// ============================================================
// ORDERS/BOOKINGS APIs
// ============================================================

// Orders storage file
const ORDERS_FILE = path.join(__dirname, '..', 'storage', 'orders.json');

function getOrders() {
    try {
        if (fs.existsSync(ORDERS_FILE)) {
            return JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8'));
        }
    } catch (error) {
        console.error('Error reading orders:', error);
    }
    return [];
}

function saveOrders(orders) {
    try {
        fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
        return true;
    } catch (error) {
        console.error('Error saving orders:', error);
        return false;
    }
}

// Get orders for a company
app.get('/api/companies/:id/orders', (req, res) => {
    const { id } = req.params;
    const orders = getOrders().filter(o => o.companyId === id);
    res.json(orders);
});

// Get all orders
app.get('/api/orders', (req, res) => {
    const orders = getOrders();
    res.json(orders);
});

// Create order
app.post('/api/companies/:id/orders', (req, res) => {
    const { id } = req.params;
    const orderData = req.body;
    
    const orders = getOrders();
    
    const order = {
        id: Date.now().toString(),
        companyId: id,
        ...orderData,
        status: 'pending',
        createdAt: new Date().toISOString()
    };
    
    orders.push(order);
    
    if (saveOrders(orders)) {
        res.json({ success: true, order });
    } else {
        res.status(500).json({ error: 'Failed to create order' });
    }
});

// Update order status
app.patch('/api/orders/:orderId/status', (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;
    
    const orders = getOrders();
    const order = orders.find(o => o.id === orderId);
    
    if (!order) {
        return res.status(404).json({ error: 'Order not found' });
    }
    
    order.status = status;
    order.updatedAt = new Date().toISOString();
    
    if (saveOrders(orders)) {
        res.json({ success: true, order });
    } else {
        res.status(500).json({ error: 'Failed to update order' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log('\n🌐 ══════════════════════════════════════════');
    console.log('   UNIVERSAL BUSINESS BOT - ADMIN PANEL');
    console.log('══════════════════════════════════════════\n');
    console.log(`✅ Server running at: http://localhost:${PORT}`);
    console.log(`📊 Admin Panel: http://localhost:${PORT}`);
    console.log(`\n🕐 Started: ${new Date().toLocaleString()}`);
    console.log('══════════════════════════════════════════\n');
});
