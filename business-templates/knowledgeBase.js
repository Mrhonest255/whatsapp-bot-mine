/**
 * Business Knowledge Base System
 * Stores and manages custom knowledge for each business
 * This allows each business to have their own data that AI uses
 */

const fs = require('fs');
const path = require('path');

// Storage directory for knowledge bases
const KNOWLEDGE_DIR = path.join(__dirname, '..', 'storage', 'knowledge');

// Ensure directory exists
if (!fs.existsSync(KNOWLEDGE_DIR)) {
    fs.mkdirSync(KNOWLEDGE_DIR, { recursive: true });
}

/**
 * Default knowledge structure for different business types
 */
const DEFAULT_KNOWLEDGE = {
    tourism: {
        tours: [],
        packages: [],
        destinations: [],
        pricing: {},
        inclusions: [],
        exclusions: [],
        faqs: [],
        policies: {
            cancellation: '',
            refund: '',
            booking_notice: 24
        },
        contact: {}
    },
    hotel: {
        rooms: [],
        amenities: [],
        facilities: [],
        rates: {},
        policies: {
            check_in: '14:00',
            check_out: '11:00',
            cancellation: '',
            payment: ''
        },
        faqs: [],
        nearby: [],
        contact: {}
    },
    restaurant: {
        menu: {
            categories: [],
            items: []
        },
        specials: [],
        delivery: {
            available: true,
            areas: [],
            fee: 0,
            min_order: 0
        },
        hours: {},
        payment_methods: [],
        faqs: [],
        contact: {}
    },
    salon: {
        services: [],
        stylists: [],
        products: [],
        packages: [],
        hours: {},
        policies: {
            cancellation: '',
            deposit: 0
        },
        faqs: [],
        contact: {}
    },
    retail: {
        products: [],
        categories: [],
        brands: [],
        delivery: {
            available: true,
            areas: [],
            fee: 0
        },
        payment_methods: [],
        faqs: [],
        contact: {}
    },
    healthcare: {
        services: [],
        doctors: [],
        departments: [],
        insurance: [],
        hours: {},
        emergency: {
            available: false,
            number: ''
        },
        faqs: [],
        contact: {}
    },
    fitness: {
        programs: [],
        classes: [],
        trainers: [],
        membership: [],
        equipment: [],
        hours: {},
        faqs: [],
        contact: {}
    },
    education: {
        courses: [],
        programs: [],
        instructors: [],
        schedules: [],
        fees: {},
        requirements: [],
        faqs: [],
        contact: {}
    },
    transport: {
        services: [],
        vehicles: [],
        zones: [],
        rates: {},
        hours: {},
        faqs: [],
        contact: {}
    },
    events: {
        services: [],
        packages: [],
        portfolio: [],
        venues: [],
        equipment: [],
        faqs: [],
        contact: {}
    },
    services: {
        services: [],
        areas: [],
        rates: {},
        availability: {},
        tools: [],
        faqs: [],
        contact: {}
    },
    real_estate: {
        properties: [],
        locations: [],
        types: [],
        services: [],
        faqs: [],
        contact: {}
    },
    other: {
        services: [],
        products: [],
        information: '',
        faqs: [],
        contact: {}
    }
};

/**
 * Knowledge Base Manager
 */
class KnowledgeBase {
    constructor(companyId) {
        this.companyId = companyId;
        this.filePath = path.join(KNOWLEDGE_DIR, `${companyId}.json`);
        this.data = null;
    }
    
    /**
     * Load knowledge base from file
     */
    load() {
        try {
            if (fs.existsSync(this.filePath)) {
                this.data = JSON.parse(fs.readFileSync(this.filePath, 'utf8'));
            } else {
                this.data = null;
            }
            return this.data;
        } catch (error) {
            console.error(`❌ Error loading knowledge for ${this.companyId}:`, error.message);
            return null;
        }
    }
    
    /**
     * Save knowledge base to file
     */
    save() {
        try {
            fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2));
            return true;
        } catch (error) {
            console.error(`❌ Error saving knowledge for ${this.companyId}:`, error.message);
            return false;
        }
    }
    
    /**
     * Initialize knowledge base for a business type
     */
    initialize(businessType, businessInfo = {}) {
        const defaultStructure = DEFAULT_KNOWLEDGE[businessType] || DEFAULT_KNOWLEDGE.other;
        
        this.data = {
            companyId: this.companyId,
            businessType: businessType,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            
            // Business Info
            business: {
                name: businessInfo.name || 'My Business',
                description: businessInfo.description || '',
                tagline: businessInfo.tagline || '',
                location: businessInfo.location || '',
                phone: businessInfo.phone || '',
                email: businessInfo.email || '',
                website: businessInfo.website || '',
                hours: businessInfo.hours || {
                    monday: { open: '09:00', close: '18:00', closed: false },
                    tuesday: { open: '09:00', close: '18:00', closed: false },
                    wednesday: { open: '09:00', close: '18:00', closed: false },
                    thursday: { open: '09:00', close: '18:00', closed: false },
                    friday: { open: '09:00', close: '18:00', closed: false },
                    saturday: { open: '09:00', close: '14:00', closed: false },
                    sunday: { open: '09:00', close: '14:00', closed: true }
                },
                currency: businessInfo.currency || 'TZS',
                languages: businessInfo.languages || ['sw', 'en']
            },
            
            // Type-specific data
            ...defaultStructure,
            
            // Custom AI instructions
            ai: {
                botName: businessInfo.botName || 'Assistant',
                personality: businessInfo.personality || 'friendly and helpful',
                greeting: businessInfo.greeting || '',
                farewell: businessInfo.farewell || '',
                customInstructions: businessInfo.customInstructions || ''
            }
        };
        
        return this.save();
    }
    
    /**
     * Get knowledge for AI context
     */
    getAIContext(language = 'sw') {
        if (!this.data) this.load();
        if (!this.data) return '';
        
        let context = [];
        const d = this.data;
        const b = d.business;
        
        // Business info
        context.push(`BUSINESS INFORMATION:`);
        context.push(`- Name: ${b.name}`);
        if (b.description) context.push(`- About: ${b.description}`);
        if (b.location) context.push(`- Location: ${b.location}`);
        if (b.phone) context.push(`- Phone: ${b.phone}`);
        if (b.email) context.push(`- Email: ${b.email}`);
        if (b.website) context.push(`- Website: ${b.website}`);
        context.push(`- Currency: ${b.currency}`);
        
        // Operating hours
        context.push(`\nOPERATING HOURS:`);
        for (const [day, hours] of Object.entries(b.hours)) {
            if (hours.closed) {
                context.push(`- ${day}: CLOSED`);
            } else {
                context.push(`- ${day}: ${hours.open} - ${hours.close}`);
            }
        }
        
        // Type-specific data
        context.push(this._getTypeSpecificContext(d.businessType, d));
        
        // FAQs
        if (d.faqs && d.faqs.length > 0) {
            context.push(`\nFREQUENTLY ASKED QUESTIONS:`);
            d.faqs.forEach((faq, i) => {
                context.push(`Q: ${faq.question}`);
                context.push(`A: ${faq.answer}`);
            });
        }
        
        return context.join('\n');
    }
    
    /**
     * Get type-specific context for AI
     */
    _getTypeSpecificContext(type, data) {
        let ctx = [];
        
        switch (type) {
            case 'tourism':
                if (data.tours?.length > 0) {
                    ctx.push(`\nAVAILABLE TOURS & PRICES:`);
                    data.tours.forEach(tour => {
                        ctx.push(`- ${tour.name}: ${tour.description || ''}`);
                        ctx.push(`  Duration: ${tour.duration || 'N/A'}`);
                        if (tour.price) ctx.push(`  Price: ${data.business.currency} ${tour.price}`);
                        if (tour.pricing) {
                            ctx.push(`  Pricing by PAX: ${JSON.stringify(tour.pricing)}`);
                        }
                    });
                }
                if (data.inclusions?.length > 0) {
                    ctx.push(`\nINCLUSIONS: ${data.inclusions.join(', ')}`);
                }
                if (data.exclusions?.length > 0) {
                    ctx.push(`EXCLUSIONS: ${data.exclusions.join(', ')}`);
                }
                break;
                
            case 'hotel':
                if (data.rooms?.length > 0) {
                    ctx.push(`\nROOM TYPES & RATES:`);
                    data.rooms.forEach(room => {
                        ctx.push(`- ${room.name}: ${room.description || ''}`);
                        if (room.rate) ctx.push(`  Rate: ${data.business.currency} ${room.rate}/night`);
                        if (room.capacity) ctx.push(`  Capacity: ${room.capacity} guests`);
                        if (room.amenities) ctx.push(`  Amenities: ${room.amenities.join(', ')}`);
                    });
                }
                if (data.amenities?.length > 0) {
                    ctx.push(`\nHOTEL AMENITIES: ${data.amenities.join(', ')}`);
                }
                if (data.policies) {
                    ctx.push(`\nPOLICIES:`);
                    ctx.push(`- Check-in: ${data.policies.check_in}`);
                    ctx.push(`- Check-out: ${data.policies.check_out}`);
                    if (data.policies.cancellation) ctx.push(`- Cancellation: ${data.policies.cancellation}`);
                }
                break;
                
            case 'restaurant':
                if (data.menu?.categories?.length > 0) {
                    ctx.push(`\nMENU CATEGORIES:`);
                    data.menu.categories.forEach(cat => {
                        ctx.push(`\n📋 ${cat.name}:`);
                        const items = data.menu.items.filter(i => i.category === cat.id);
                        items.forEach(item => {
                            ctx.push(`- ${item.name}: ${data.business.currency} ${item.price}`);
                            if (item.description) ctx.push(`  ${item.description}`);
                        });
                    });
                }
                if (data.delivery?.available) {
                    ctx.push(`\nDELIVERY:`);
                    ctx.push(`- Areas: ${data.delivery.areas.join(', ')}`);
                    ctx.push(`- Fee: ${data.business.currency} ${data.delivery.fee}`);
                    ctx.push(`- Minimum order: ${data.business.currency} ${data.delivery.min_order}`);
                }
                break;
                
            case 'salon':
                if (data.services?.length > 0) {
                    ctx.push(`\nSERVICES & PRICES:`);
                    data.services.forEach(service => {
                        ctx.push(`- ${service.name}: ${data.business.currency} ${service.price}`);
                        if (service.duration) ctx.push(`  Duration: ${service.duration}`);
                    });
                }
                if (data.stylists?.length > 0) {
                    ctx.push(`\nSTYLISTS: ${data.stylists.map(s => s.name).join(', ')}`);
                }
                break;
                
            case 'retail':
                if (data.products?.length > 0) {
                    ctx.push(`\nPRODUCTS AVAILABLE:`);
                    data.products.forEach(product => {
                        ctx.push(`- ${product.name}: ${data.business.currency} ${product.price}`);
                        if (product.description) ctx.push(`  ${product.description}`);
                        if (product.inStock !== undefined) {
                            ctx.push(`  ${product.inStock ? 'In Stock' : 'Out of Stock'}`);
                        }
                    });
                }
                break;
                
            case 'healthcare':
                if (data.services?.length > 0) {
                    ctx.push(`\nMEDICAL SERVICES:`);
                    data.services.forEach(service => {
                        ctx.push(`- ${service.name}: ${data.business.currency} ${service.price || 'Price varies'}`);
                    });
                }
                if (data.doctors?.length > 0) {
                    ctx.push(`\nDOCTORS:`);
                    data.doctors.forEach(doc => {
                        ctx.push(`- Dr. ${doc.name} (${doc.specialty})`);
                    });
                }
                if (data.insurance?.length > 0) {
                    ctx.push(`\nACCEPTED INSURANCE: ${data.insurance.join(', ')}`);
                }
                break;
                
            case 'fitness':
                if (data.programs?.length > 0) {
                    ctx.push(`\nFITNESS PROGRAMS:`);
                    data.programs.forEach(prog => {
                        ctx.push(`- ${prog.name}: ${prog.description || ''}`);
                    });
                }
                if (data.membership?.length > 0) {
                    ctx.push(`\nMEMBERSHIP PLANS:`);
                    data.membership.forEach(plan => {
                        ctx.push(`- ${plan.name}: ${data.business.currency} ${plan.price}/${plan.period}`);
                    });
                }
                break;
                
            case 'education':
                if (data.courses?.length > 0) {
                    ctx.push(`\nCOURSES AVAILABLE:`);
                    data.courses.forEach(course => {
                        ctx.push(`- ${course.name}: ${course.description || ''}`);
                        if (course.duration) ctx.push(`  Duration: ${course.duration}`);
                        if (course.fee) ctx.push(`  Fee: ${data.business.currency} ${course.fee}`);
                    });
                }
                break;
                
            case 'transport':
                if (data.services?.length > 0) {
                    ctx.push(`\nTRANSPORT SERVICES:`);
                    data.services.forEach(service => {
                        ctx.push(`- ${service.name}: ${service.description || ''}`);
                    });
                }
                if (data.rates && Object.keys(data.rates).length > 0) {
                    ctx.push(`\nRATES:`);
                    for (const [zone, rate] of Object.entries(data.rates)) {
                        ctx.push(`- ${zone}: ${data.business.currency} ${rate}`);
                    }
                }
                break;
                
            case 'events':
                if (data.services?.length > 0) {
                    ctx.push(`\nEVENT SERVICES:`);
                    data.services.forEach(service => {
                        ctx.push(`- ${service.name}: ${service.description || ''}`);
                        if (service.price) ctx.push(`  Starting from: ${data.business.currency} ${service.price}`);
                    });
                }
                break;
                
            case 'services':
                if (data.services?.length > 0) {
                    ctx.push(`\nSERVICES OFFERED:`);
                    data.services.forEach(service => {
                        ctx.push(`- ${service.name}: ${data.business.currency} ${service.price || 'Quote on request'}`);
                    });
                }
                if (data.areas?.length > 0) {
                    ctx.push(`\nSERVICE AREAS: ${data.areas.join(', ')}`);
                }
                break;
                
            case 'real_estate':
                if (data.properties?.length > 0) {
                    ctx.push(`\nAVAILABLE PROPERTIES:`);
                    data.properties.forEach(prop => {
                        ctx.push(`- ${prop.name}: ${prop.type}`);
                        if (prop.location) ctx.push(`  Location: ${prop.location}`);
                        if (prop.price) ctx.push(`  Price: ${data.business.currency} ${prop.price}`);
                        if (prop.bedrooms) ctx.push(`  Bedrooms: ${prop.bedrooms}`);
                    });
                }
                break;
                
            default:
                if (data.services?.length > 0) {
                    ctx.push(`\nSERVICES:`);
                    data.services.forEach(s => {
                        ctx.push(`- ${s.name}: ${s.description || ''}`);
                    });
                }
                if (data.products?.length > 0) {
                    ctx.push(`\nPRODUCTS:`);
                    data.products.forEach(p => {
                        ctx.push(`- ${p.name}: ${p.description || ''}`);
                    });
                }
                if (data.information) {
                    ctx.push(`\nADDITIONAL INFO: ${data.information}`);
                }
        }
        
        return ctx.join('\n');
    }
    
    /**
     * Update specific section of knowledge
     */
    updateSection(section, data) {
        if (!this.data) this.load();
        if (!this.data) return false;
        
        this.data[section] = data;
        this.data.updatedAt = new Date().toISOString();
        
        return this.save();
    }
    
    /**
     * Add item to a list section
     */
    addItem(section, item) {
        if (!this.data) this.load();
        if (!this.data) return false;
        
        if (!Array.isArray(this.data[section])) {
            this.data[section] = [];
        }
        
        // Generate ID if not provided
        if (!item.id) {
            item.id = Date.now().toString();
        }
        
        this.data[section].push(item);
        this.data.updatedAt = new Date().toISOString();
        
        return this.save();
    }
    
    /**
     * Update item in a list section
     */
    updateItem(section, itemId, updates) {
        if (!this.data) this.load();
        if (!this.data || !Array.isArray(this.data[section])) return false;
        
        const index = this.data[section].findIndex(i => i.id === itemId);
        if (index === -1) return false;
        
        this.data[section][index] = { ...this.data[section][index], ...updates };
        this.data.updatedAt = new Date().toISOString();
        
        return this.save();
    }
    
    /**
     * Remove item from a list section
     */
    removeItem(section, itemId) {
        if (!this.data) this.load();
        if (!this.data || !Array.isArray(this.data[section])) return false;
        
        const index = this.data[section].findIndex(i => i.id === itemId);
        if (index === -1) return false;
        
        this.data[section].splice(index, 1);
        this.data.updatedAt = new Date().toISOString();
        
        return this.save();
    }
    
    /**
     * Add FAQ
     */
    addFAQ(question, answer) {
        return this.addItem('faqs', { 
            id: Date.now().toString(),
            question, 
            answer,
            createdAt: new Date().toISOString()
        });
    }
    
    /**
     * Delete knowledge base
     */
    delete() {
        try {
            if (fs.existsSync(this.filePath)) {
                fs.unlinkSync(this.filePath);
            }
            return true;
        } catch (error) {
            console.error(`❌ Error deleting knowledge for ${this.companyId}:`, error.message);
            return false;
        }
    }
}

/**
 * Get knowledge base for a company
 */
function getKnowledgeBase(companyId) {
    return new KnowledgeBase(companyId);
}

/**
 * Check if knowledge base exists
 */
function knowledgeExists(companyId) {
    const filePath = path.join(KNOWLEDGE_DIR, `${companyId}.json`);
    return fs.existsSync(filePath);
}

/**
 * List all knowledge bases
 */
function listKnowledgeBases() {
    try {
        const files = fs.readdirSync(KNOWLEDGE_DIR);
        return files
            .filter(f => f.endsWith('.json'))
            .map(f => f.replace('.json', ''));
    } catch (error) {
        return [];
    }
}

module.exports = {
    KnowledgeBase,
    getKnowledgeBase,
    knowledgeExists,
    listKnowledgeBases,
    DEFAULT_KNOWLEDGE,
    KNOWLEDGE_DIR
};
