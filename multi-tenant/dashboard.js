/**
 * Multi-Tenant Web Dashboard
 * Simple web interface to manage multiple companies
 */

const express = require('express');
const path = require('path');
const tenantManager = require('./tenantManager');
const { connectTenant, disconnectTenant } = require('./tenantConnection');
const { handleTenantMessage } = require('./tenantMessageHandler');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Store pending QR codes
const pendingQRs = new Map();

// Dashboard HTML
const dashboardHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🏢 Multi-Tenant WhatsApp Bot Dashboard</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            min-height: 100vh;
            color: #fff;
            padding: 20px;
        }
        .container { max-width: 1200px; margin: 0 auto; }
        h1 { 
            text-align: center; 
            margin-bottom: 30px;
            color: #00d4ff;
            text-shadow: 0 0 20px rgba(0,212,255,0.5);
        }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 20px; }
        .card {
            background: rgba(255,255,255,0.1);
            border-radius: 15px;
            padding: 25px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.1);
        }
        .card h2 { color: #00d4ff; margin-bottom: 15px; }
        .form-group { margin-bottom: 15px; }
        .form-group label { display: block; margin-bottom: 5px; color: #aaa; }
        .form-group input, .form-group select, .form-group textarea {
            width: 100%;
            padding: 12px;
            border: 1px solid rgba(255,255,255,0.2);
            border-radius: 8px;
            background: rgba(0,0,0,0.3);
            color: #fff;
            font-size: 14px;
        }
        .btn {
            padding: 12px 25px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: bold;
            transition: all 0.3s;
        }
        .btn-primary { background: #00d4ff; color: #000; }
        .btn-primary:hover { background: #00b8e6; transform: scale(1.02); }
        .btn-success { background: #00ff88; color: #000; }
        .btn-danger { background: #ff4444; color: #fff; }
        .btn-sm { padding: 8px 15px; font-size: 12px; }
        .tenant-card {
            background: rgba(0,0,0,0.3);
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 15px;
            border-left: 4px solid #00d4ff;
        }
        .tenant-card.connected { border-left-color: #00ff88; }
        .tenant-card.disconnected { border-left-color: #ff4444; }
        .status { 
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
        }
        .status.online { background: #00ff88; color: #000; }
        .status.offline { background: #ff4444; color: #fff; }
        .stats { display: flex; gap: 20px; margin-top: 15px; }
        .stat { text-align: center; }
        .stat-value { font-size: 24px; font-weight: bold; color: #00d4ff; }
        .stat-label { font-size: 12px; color: #888; }
        .qr-container { 
            text-align: center; 
            padding: 20px;
            background: #fff;
            border-radius: 10px;
            margin-top: 15px;
        }
        .qr-container img { max-width: 250px; }
        .actions { display: flex; gap: 10px; margin-top: 15px; }
        #tenantsList { margin-top: 20px; }
        .message { padding: 15px; border-radius: 8px; margin-bottom: 15px; }
        .message.success { background: rgba(0,255,136,0.2); border: 1px solid #00ff88; }
        .message.error { background: rgba(255,68,68,0.2); border: 1px solid #ff4444; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🏢 Multi-Tenant WhatsApp Bot Dashboard</h1>
        
        <div id="messages"></div>
        
        <div class="grid">
            <!-- Add New Tenant -->
            <div class="card">
                <h2>➕ Add New Company</h2>
                <form id="addTenantForm">
                    <div class="form-group">
                        <label>Company Name *</label>
                        <input type="text" name="companyName" required placeholder="e.g., Zanzibar Safari Tours">
                    </div>
                    <div class="form-group">
                        <label>Business Type</label>
                        <select name="businessType">
                            <option value="tourism">Tourism / Tours</option>
                            <option value="hotel">Hotel / Accommodation</option>
                            <option value="restaurant">Restaurant / Food</option>
                            <option value="transport">Transport / Transfers</option>
                            <option value="other">Other Business</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Bot Name (Assistant)</label>
                        <input type="text" name="botName" placeholder="e.g., Amina, Safari Bot">
                    </div>
                    <div class="form-group">
                        <label>Admin Phone (for notifications) *</label>
                        <input type="text" name="adminPhone" required placeholder="e.g., 255688774043">
                    </div>
                    <div class="form-group">
                        <label>Admin Name</label>
                        <input type="text" name="adminName" placeholder="e.g., John Admin">
                    </div>
                    <div class="form-group">
                        <label>Custom Instructions (Optional)</label>
                        <textarea name="customPrompt" rows="3" placeholder="Special instructions for the AI..."></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary">🚀 Register Company</button>
                </form>
            </div>
            
            <!-- Statistics -->
            <div class="card">
                <h2>📊 System Overview</h2>
                <div class="stats">
                    <div class="stat">
                        <div class="stat-value" id="totalTenants">0</div>
                        <div class="stat-label">Companies</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value" id="activeTenants">0</div>
                        <div class="stat-label">Connected</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value" id="totalMessages">0</div>
                        <div class="stat-label">Messages</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value" id="totalBookings">0</div>
                        <div class="stat-label">Bookings</div>
                    </div>
                </div>
                <div style="margin-top: 20px;">
                    <button onclick="refreshTenants()" class="btn btn-primary">🔄 Refresh</button>
                    <button onclick="connectAll()" class="btn btn-success">⚡ Connect All</button>
                </div>
            </div>
        </div>
        
        <!-- Tenants List -->
        <div class="card" style="margin-top: 20px;">
            <h2>🏢 Registered Companies</h2>
            <div id="tenantsList">Loading...</div>
        </div>
    </div>
    
    <script>
        // Fetch and display tenants
        async function refreshTenants() {
            try {
                const res = await fetch('/api/tenants');
                const tenants = await res.json();
                
                document.getElementById('totalTenants').textContent = tenants.length;
                document.getElementById('activeTenants').textContent = tenants.filter(t => t.isConnected).length;
                document.getElementById('totalMessages').textContent = tenants.reduce((sum, t) => sum + (t.totalMessages || 0), 0);
                document.getElementById('totalBookings').textContent = tenants.reduce((sum, t) => sum + (t.totalBookings || 0), 0);
                
                const listHtml = tenants.length === 0 
                    ? '<p style="color: #888;">No companies registered yet. Add one above!</p>'
                    : tenants.map(t => \`
                        <div class="tenant-card \${t.isConnected ? 'connected' : 'disconnected'}">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <h3>\${t.companyName}</h3>
                                    <span class="status \${t.isConnected ? 'online' : 'offline'}">\${t.isConnected ? '🟢 Connected' : '🔴 Offline'}</span>
                                </div>
                                <div>
                                    <span style="color: #888;">\${t.businessType || 'Business'}</span>
                                </div>
                            </div>
                            <div style="margin-top: 10px; color: #aaa; font-size: 13px;">
                                <p>📱 WhatsApp: \${t.whatsappNumber ? '+' + t.whatsappNumber : 'Not connected'}</p>
                                <p>🆔 ID: \${t.id}</p>
                                <p>🤖 Bot: \${t.botName || 'Assistant'}</p>
                                <p>👤 Admin: \${t.adminPhone}</p>
                            </div>
                            <div class="stats">
                                <div class="stat">
                                    <div class="stat-value">\${t.totalMessages || 0}</div>
                                    <div class="stat-label">Messages</div>
                                </div>
                                <div class="stat">
                                    <div class="stat-value">\${t.totalBookings || 0}</div>
                                    <div class="stat-label">Bookings</div>
                                </div>
                            </div>
                            <div class="actions">
                                \${!t.isConnected ? \`<button onclick="connectTenant('\${t.id}')" class="btn btn-success btn-sm">🔗 Connect</button>\` : ''}
                                \${t.isConnected ? \`<button onclick="disconnectTenant('\${t.id}')" class="btn btn-danger btn-sm">🔌 Disconnect</button>\` : ''}
                                <button onclick="deleteTenant('\${t.id}')" class="btn btn-danger btn-sm">🗑️ Delete</button>
                            </div>
                            <div id="qr-\${t.id}"></div>
                        </div>
                    \`).join('');
                
                document.getElementById('tenantsList').innerHTML = listHtml;
            } catch (error) {
                console.error('Error:', error);
            }
        }
        
        // Add new tenant
        document.getElementById('addTenantForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData);
            
            try {
                const res = await fetch('/api/tenants', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                const result = await res.json();
                
                if (result.success) {
                    showMessage('✅ Company registered successfully! ID: ' + result.tenant.id, 'success');
                    e.target.reset();
                    refreshTenants();
                } else {
                    showMessage('❌ Error: ' + result.error, 'error');
                }
            } catch (error) {
                showMessage('❌ Error: ' + error.message, 'error');
            }
        });
        
        // Connect tenant
        async function connectTenant(tenantId) {
            try {
                const res = await fetch(\`/api/tenants/\${tenantId}/connect\`, { method: 'POST' });
                const result = await res.json();
                
                if (result.qr) {
                    document.getElementById(\`qr-\${tenantId}\`).innerHTML = \`
                        <div class="qr-container">
                            <p style="color: #000; margin-bottom: 10px;">📱 Scan with WhatsApp</p>
                            <img src="\${result.qr}" alt="QR Code">
                        </div>
                    \`;
                }
                
                // Poll for connection status
                pollConnection(tenantId);
            } catch (error) {
                showMessage('❌ Error: ' + error.message, 'error');
            }
        }
        
        // Poll connection status
        function pollConnection(tenantId) {
            const interval = setInterval(async () => {
                try {
                    const res = await fetch('/api/tenants');
                    const tenants = await res.json();
                    const tenant = tenants.find(t => t.id === tenantId);
                    
                    if (tenant && tenant.isConnected) {
                        clearInterval(interval);
                        document.getElementById(\`qr-\${tenantId}\`).innerHTML = '';
                        showMessage('✅ ' + tenant.companyName + ' connected!', 'success');
                        refreshTenants();
                    }
                } catch (e) {}
            }, 3000);
            
            // Stop after 2 minutes
            setTimeout(() => clearInterval(interval), 120000);
        }
        
        // Disconnect tenant
        async function disconnectTenant(tenantId) {
            if (!confirm('Disconnect this company?')) return;
            
            try {
                await fetch(\`/api/tenants/\${tenantId}/disconnect\`, { method: 'POST' });
                refreshTenants();
            } catch (error) {
                showMessage('❌ Error: ' + error.message, 'error');
            }
        }
        
        // Delete tenant
        async function deleteTenant(tenantId) {
            if (!confirm('⚠️ Delete this company? This cannot be undone!')) return;
            
            try {
                await fetch(\`/api/tenants/\${tenantId}\`, { method: 'DELETE' });
                showMessage('🗑️ Company deleted', 'success');
                refreshTenants();
            } catch (error) {
                showMessage('❌ Error: ' + error.message, 'error');
            }
        }
        
        // Connect all
        async function connectAll() {
            try {
                await fetch('/api/tenants/connect-all', { method: 'POST' });
                showMessage('⚡ Connecting all companies...', 'success');
                setTimeout(refreshTenants, 5000);
            } catch (error) {
                showMessage('❌ Error: ' + error.message, 'error');
            }
        }
        
        // Show message
        function showMessage(text, type) {
            const div = document.createElement('div');
            div.className = \`message \${type}\`;
            div.textContent = text;
            document.getElementById('messages').appendChild(div);
            setTimeout(() => div.remove(), 5000);
        }
        
        // Initial load
        refreshTenants();
        setInterval(refreshTenants, 10000);
    </script>
</body>
</html>
`;

/**
 * Setup dashboard routes
 */
function setupRoutes() {
    // Dashboard
    app.get('/', (req, res) => {
        res.send(dashboardHTML);
    });
    
    // API: Get all tenants
    app.get('/api/tenants', (req, res) => {
        const tenants = tenantManager.getAllTenants().map(t => ({
            ...t,
            isConnected: tenantManager.getSocket(t.id) !== null
        }));
        res.json(tenants);
    });
    
    // API: Register new tenant
    app.post('/api/tenants', (req, res) => {
        try {
            const tenant = tenantManager.registerTenant(req.body);
            res.json({ success: true, tenant });
        } catch (error) {
            res.json({ success: false, error: error.message });
        }
    });
    
    // API: Delete tenant
    app.delete('/api/tenants/:id', (req, res) => {
        const success = tenantManager.deleteTenant(req.params.id);
        res.json({ success });
    });
    
    // API: Connect tenant
    app.post('/api/tenants/:id/connect', async (req, res) => {
        const tenantId = req.params.id;
        
        // Set up QR callback
        let qrSent = false;
        
        try {
            connectTenant(tenantId, handleTenantMessage, (id, qrBase64) => {
                if (!qrSent) {
                    pendingQRs.set(id, qrBase64);
                }
            });
            
            // Wait a bit for QR to generate
            await new Promise(r => setTimeout(r, 3000));
            
            const qr = pendingQRs.get(tenantId);
            pendingQRs.delete(tenantId);
            
            res.json({ success: true, qr: qr || null });
        } catch (error) {
            res.json({ success: false, error: error.message });
        }
    });
    
    // API: Disconnect tenant
    app.post('/api/tenants/:id/disconnect', async (req, res) => {
        try {
            await disconnectTenant(req.params.id);
            res.json({ success: true });
        } catch (error) {
            res.json({ success: false, error: error.message });
        }
    });
    
    // API: Connect all tenants
    app.post('/api/tenants/connect-all', async (req, res) => {
        const { connectAllTenants } = require('./tenantConnection');
        connectAllTenants(handleTenantMessage);
        res.json({ success: true, message: 'Connecting all tenants...' });
    });
    
    // API: Get tenant stats
    app.get('/api/tenants/:id/stats', (req, res) => {
        const stats = tenantManager.getTenantStats(req.params.id);
        res.json(stats || { error: 'Tenant not found' });
    });
}

/**
 * Start the dashboard server
 */
function startDashboard(port = 3000) {
    setupRoutes();
    
    app.listen(port, '0.0.0.0', () => {
        console.log('\n╔═══════════════════════════════════════════════════════════╗');
        console.log('║     🌐  MULTI-TENANT DASHBOARD RUNNING                     ║');
        console.log('╠═══════════════════════════════════════════════════════════╣');
        console.log(`║     📍  http://localhost:${port}                              ║`);
        console.log(`║     📍  http://YOUR_VPS_IP:${port}                           ║`);
        console.log('║                                                           ║');
        console.log('║     Add companies, scan QR codes, manage bots!            ║');
        console.log('╚═══════════════════════════════════════════════════════════╝\n');
    });
    
    return app;
}

module.exports = {
    startDashboard,
    app
};
