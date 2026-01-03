/**
 * Company Session Manager
 * Manages separate sessions for each company in multi-tenant setup
 */

// Company-specific session storage
const companySessions = new Map();
const companyRateLimiters = new Map();
const companyChatHistories = new Map();

/**
 * Get company-specific session map
 */
function getCompanySessionMap(companyId) {
    if (!companySessions.has(companyId)) {
        companySessions.set(companyId, new Map());
    }
    return companySessions.get(companyId);
}

/**
 * Get company-specific rate limiter map
 */
function getCompanyRateLimiterMap(companyId) {
    if (!companyRateLimiters.has(companyId)) {
        companyRateLimiters.set(companyId, new Map());
    }
    return companyRateLimiters.get(companyId);
}

/**
 * Get company-specific chat history map
 */
function getCompanyChatHistoryMap(companyId) {
    if (!companyChatHistories.has(companyId)) {
        companyChatHistories.set(companyId, new Map());
    }
    return companyChatHistories.get(companyId);
}

/**
 * Get user session for a specific company
 */
function getCompanyUserSession(companyId, phoneNumber) {
    const sessions = getCompanySessionMap(companyId);
    
    if (!sessions.has(phoneNumber)) {
        sessions.set(phoneNumber, {
            state: 'idle',
            language: 'en',
            booking: {},
            pickupArea: null,
            lastActivity: Date.now()
        });
    }
    
    return sessions.get(phoneNumber);
}

/**
 * Check rate limit for a specific company
 */
function checkCompanyRateLimit(companyId, phoneNumber) {
    const rateLimiters = getCompanyRateLimiterMap(companyId);
    const now = Date.now();
    const lastMessage = rateLimiters.get(phoneNumber) || 0;
    
    if (now - lastMessage < 1000) {
        return false;
    }
    
    rateLimiters.set(phoneNumber, now);
    return true;
}

/**
 * Get chat history for a specific company user
 */
function getCompanyChatHistory(companyId, phoneNumber) {
    const histories = getCompanyChatHistoryMap(companyId);
    
    if (!histories.has(phoneNumber)) {
        histories.set(phoneNumber, []);
    }
    
    return histories.get(phoneNumber);
}

/**
 * Add to chat history for a specific company
 */
function addToCompanyChatHistory(companyId, phoneNumber, role, content) {
    const histories = getCompanyChatHistoryMap(companyId);
    const history = getCompanyChatHistory(companyId, phoneNumber);
    
    history.push({
        role: role,
        parts: [{ text: content }]
    });
    
    // Keep only last 100 messages (50 pairs)
    if (history.length > 100) {
        history.splice(0, 4);
    }
    
    histories.set(phoneNumber, history);
}

/**
 * Clear chat history for a specific company user
 */
function clearCompanyChatHistory(companyId, phoneNumber) {
    const histories = getCompanyChatHistoryMap(companyId);
    histories.delete(phoneNumber);
}

/**
 * Get all sessions for a company (for debugging)
 */
function getCompanyAllSessions(companyId) {
    return getCompanySessionMap(companyId);
}

/**
 * Clear old inactive sessions (cleanup)
 */
function cleanupOldSessions() {
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    const now = Date.now();
    
    for (const [companyId, sessions] of companySessions) {
        for (const [phoneNumber, session] of sessions) {
            if (now - session.lastActivity > maxAge) {
                sessions.delete(phoneNumber);
                
                // Also clear chat history
                const histories = companyChatHistories.get(companyId);
                if (histories) {
                    histories.delete(phoneNumber);
                }
            }
        }
    }
}

// Run cleanup every hour
setInterval(cleanupOldSessions, 60 * 60 * 1000);

module.exports = {
    getCompanyUserSession,
    checkCompanyRateLimit,
    getCompanyChatHistory,
    addToCompanyChatHistory,
    clearCompanyChatHistory,
    getCompanyAllSessions,
    getCompanySessionMap,
    cleanupOldSessions
};
