/**
 * Multi-Tenant Admin Panel Web Server
 * Manage multiple companies from one dashboard
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const QRCode = require('qrcode');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
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
        geminiApiKey: geminiApiKey || 'AIzaSyCd2H-Z1mbO5iqdxIt42tjyomZdH9NYflo',
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

// Start server
app.listen(PORT, () => {
    console.log('\n🌐 ══════════════════════════════════════════');
    console.log('   MULTI-TENANT ADMIN PANEL');
    console.log('══════════════════════════════════════════\n');
    console.log(`✅ Server running at: http://localhost:${PORT}`);
    console.log(`📊 Admin Panel: http://localhost:${PORT}`);
    console.log(`\n🕐 Started: ${new Date().toLocaleString()}`);
    console.log('══════════════════════════════════════════\n');
});

module.exports = app;
