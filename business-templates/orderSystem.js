/**
 * Universal Order/Booking System
 * Handles orders, bookings, and reservations for all business types
 */

const fs = require('fs');
const path = require('path');

const ORDERS_FILE = path.join(__dirname, '..', 'storage', 'orders.json');

// Order statuses
const ORDER_STATUS = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
};

// Order types by business
const ORDER_TYPES = {
    tourism: 'booking',
    hotel: 'reservation',
    restaurant: 'order',
    salon: 'appointment',
    retail: 'order',
    healthcare: 'appointment',
    fitness: 'membership',
    education: 'enrollment',
    transport: 'booking',
    events: 'booking',
    services: 'request',
    real_estate: 'inquiry',
    other: 'order'
};

/**
 * Load orders from file
 */
function loadOrders() {
    try {
        if (fs.existsSync(ORDERS_FILE)) {
            return JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8'));
        }
    } catch (error) {
        console.error('Error loading orders:', error);
    }
    return [];
}

/**
 * Save orders to file
 */
function saveOrders(orders) {
    try {
        const dir = path.dirname(ORDERS_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
        return true;
    } catch (error) {
        console.error('Error saving orders:', error);
        return false;
    }
}

/**
 * Generate unique order ID
 */
function generateOrderId() {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `ORD-${timestamp}-${random}`;
}

/**
 * Create a new order/booking
 */
function createOrder(companyId, customerData, orderData) {
    const orders = loadOrders();
    
    const order = {
        id: generateOrderId(),
        companyId,
        type: orderData.type || 'order',
        
        // Customer info
        customer: {
            phone: customerData.phone,
            name: customerData.name || null,
            email: customerData.email || null
        },
        
        // Order details
        items: orderData.items || [],
        service: orderData.service || null,
        date: orderData.date || null,
        time: orderData.time || null,
        
        // Pricing
        subtotal: orderData.subtotal || 0,
        fees: orderData.fees || 0,
        total: orderData.total || 0,
        currency: orderData.currency || 'TZS',
        
        // Additional info
        notes: orderData.notes || '',
        metadata: orderData.metadata || {},
        
        // Status
        status: ORDER_STATUS.PENDING,
        
        // Timestamps
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        confirmedAt: null,
        completedAt: null
    };
    
    orders.push(order);
    
    if (saveOrders(orders)) {
        console.log(`✅ Order created: ${order.id}`);
        return order;
    }
    
    return null;
}

/**
 * Get order by ID
 */
function getOrder(orderId) {
    const orders = loadOrders();
    return orders.find(o => o.id === orderId);
}

/**
 * Get orders by company
 */
function getOrdersByCompany(companyId) {
    const orders = loadOrders();
    return orders.filter(o => o.companyId === companyId);
}

/**
 * Get orders by customer phone
 */
function getOrdersByCustomer(phone) {
    const orders = loadOrders();
    return orders.filter(o => o.customer.phone === phone);
}

/**
 * Get recent orders for a company
 */
function getRecentOrders(companyId, limit = 10) {
    return getOrdersByCompany(companyId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, limit);
}

/**
 * Get orders by status
 */
function getOrdersByStatus(companyId, status) {
    return getOrdersByCompany(companyId)
        .filter(o => o.status === status);
}

/**
 * Update order status
 */
function updateOrderStatus(orderId, status) {
    const orders = loadOrders();
    const orderIndex = orders.findIndex(o => o.id === orderId);
    
    if (orderIndex === -1) return null;
    
    orders[orderIndex].status = status;
    orders[orderIndex].updatedAt = new Date().toISOString();
    
    if (status === ORDER_STATUS.CONFIRMED) {
        orders[orderIndex].confirmedAt = new Date().toISOString();
    }
    if (status === ORDER_STATUS.COMPLETED) {
        orders[orderIndex].completedAt = new Date().toISOString();
    }
    
    if (saveOrders(orders)) {
        return orders[orderIndex];
    }
    
    return null;
}

/**
 * Update order details
 */
function updateOrder(orderId, updates) {
    const orders = loadOrders();
    const orderIndex = orders.findIndex(o => o.id === orderId);
    
    if (orderIndex === -1) return null;
    
    // Don't allow changing id or companyId
    delete updates.id;
    delete updates.companyId;
    
    Object.assign(orders[orderIndex], updates);
    orders[orderIndex].updatedAt = new Date().toISOString();
    
    if (saveOrders(orders)) {
        return orders[orderIndex];
    }
    
    return null;
}

/**
 * Cancel order
 */
function cancelOrder(orderId, reason = '') {
    const orders = loadOrders();
    const orderIndex = orders.findIndex(o => o.id === orderId);
    
    if (orderIndex === -1) return null;
    
    orders[orderIndex].status = ORDER_STATUS.CANCELLED;
    orders[orderIndex].cancelReason = reason;
    orders[orderIndex].cancelledAt = new Date().toISOString();
    orders[orderIndex].updatedAt = new Date().toISOString();
    
    if (saveOrders(orders)) {
        return orders[orderIndex];
    }
    
    return null;
}

/**
 * Get order statistics for a company
 */
function getOrderStats(companyId) {
    const orders = getOrdersByCompany(companyId);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const thisWeek = new Date(today);
    thisWeek.setDate(thisWeek.getDate() - 7);
    
    const thisMonth = new Date(today);
    thisMonth.setMonth(thisMonth.getMonth() - 1);
    
    return {
        total: orders.length,
        pending: orders.filter(o => o.status === ORDER_STATUS.PENDING).length,
        confirmed: orders.filter(o => o.status === ORDER_STATUS.CONFIRMED).length,
        completed: orders.filter(o => o.status === ORDER_STATUS.COMPLETED).length,
        cancelled: orders.filter(o => o.status === ORDER_STATUS.CANCELLED).length,
        
        today: orders.filter(o => new Date(o.createdAt) >= today).length,
        thisWeek: orders.filter(o => new Date(o.createdAt) >= thisWeek).length,
        thisMonth: orders.filter(o => new Date(o.createdAt) >= thisMonth).length,
        
        revenue: {
            total: orders.filter(o => o.status === ORDER_STATUS.COMPLETED)
                .reduce((sum, o) => sum + (o.total || 0), 0),
            thisMonth: orders.filter(o => 
                o.status === ORDER_STATUS.COMPLETED && 
                new Date(o.createdAt) >= thisMonth
            ).reduce((sum, o) => sum + (o.total || 0), 0)
        }
    };
}

/**
 * Format order for notification
 */
function formatOrderNotification(order, language = 'sw') {
    const isSw = language === 'sw';
    
    let msg = isSw 
        ? `🔔 *ORDER MPYA!*\n\n`
        : `🔔 *NEW ORDER!*\n\n`;
    
    msg += `📋 *ID:* ${order.id}\n`;
    
    if (order.customer.name) {
        msg += isSw ? `👤 *Mteja:* ${order.customer.name}\n` : `👤 *Customer:* ${order.customer.name}\n`;
    }
    msg += `📱 *Simu:* ${order.customer.phone}\n`;
    
    if (order.service) {
        msg += isSw ? `🏷️ *Huduma:* ${order.service}\n` : `🏷️ *Service:* ${order.service}\n`;
    }
    
    if (order.items && order.items.length > 0) {
        msg += isSw ? `\n📦 *Bidhaa:*\n` : `\n📦 *Items:*\n`;
        order.items.forEach(item => {
            msg += `  • ${item.name} x${item.quantity || 1}`;
            if (item.price) msg += ` - ${order.currency} ${item.price}`;
            msg += '\n';
        });
    }
    
    if (order.date) {
        msg += isSw ? `📅 *Tarehe:* ${order.date}\n` : `📅 *Date:* ${order.date}\n`;
    }
    if (order.time) {
        msg += isSw ? `⏰ *Wakati:* ${order.time}\n` : `⏰ *Time:* ${order.time}\n`;
    }
    
    if (order.total > 0) {
        msg += isSw 
            ? `\n💰 *Jumla:* ${order.currency} ${order.total.toLocaleString()}\n`
            : `\n💰 *Total:* ${order.currency} ${order.total.toLocaleString()}\n`;
    }
    
    if (order.notes) {
        msg += isSw ? `\n📝 *Maelezo:* ${order.notes}\n` : `\n📝 *Notes:* ${order.notes}\n`;
    }
    
    msg += `\n⏰ ${new Date(order.createdAt).toLocaleString('sw-TZ')}`;
    
    return msg;
}

/**
 * Get order type label for a business type
 */
function getOrderTypeLabel(businessType, language = 'sw') {
    const labels = {
        tourism: { en: 'Tour Booking', sw: 'Booking ya Safari' },
        hotel: { en: 'Room Reservation', sw: 'Booking ya Chumba' },
        restaurant: { en: 'Food Order', sw: 'Order ya Chakula' },
        salon: { en: 'Appointment', sw: 'Miadi' },
        retail: { en: 'Product Order', sw: 'Order ya Bidhaa' },
        healthcare: { en: 'Appointment', sw: 'Miadi' },
        fitness: { en: 'Membership', sw: 'Uanachama' },
        education: { en: 'Enrollment', sw: 'Uandikishaji' },
        transport: { en: 'Ride Booking', sw: 'Booking ya Safari' },
        events: { en: 'Event Booking', sw: 'Booking ya Tukio' },
        services: { en: 'Service Request', sw: 'Ombi la Huduma' },
        real_estate: { en: 'Property Inquiry', sw: 'Swali la Nyumba' },
        other: { en: 'Order', sw: 'Order' }
    };
    
    const typeLabels = labels[businessType] || labels.other;
    return typeLabels[language] || typeLabels.en;
}

module.exports = {
    ORDER_STATUS,
    ORDER_TYPES,
    createOrder,
    getOrder,
    getOrdersByCompany,
    getOrdersByCustomer,
    getRecentOrders,
    getOrdersByStatus,
    updateOrderStatus,
    updateOrder,
    cancelOrder,
    getOrderStats,
    formatOrderNotification,
    getOrderTypeLabel,
    loadOrders,
    saveOrders
};
