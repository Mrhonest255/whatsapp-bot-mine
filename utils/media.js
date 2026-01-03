/**
 * Tour Media & Gallery
 * URLs and media for tour images/videos
 */

// Tour images (can be local files or URLs)
const tourImages = {
    safari_blue: {
        thumbnail: 'https://example.com/images/safari-blue-thumb.jpg',
        gallery: [
            'https://example.com/images/safari-blue-1.jpg',
            'https://example.com/images/safari-blue-2.jpg'
        ],
        description: 'Sailing on traditional dhow boat'
    },
    stone_town: {
        thumbnail: 'https://example.com/images/stone-town-thumb.jpg',
        gallery: [
            'https://example.com/images/stone-town-1.jpg',
            'https://example.com/images/stone-town-2.jpg'
        ],
        description: 'Historic UNESCO World Heritage streets'
    },
    prison_island: {
        thumbnail: 'https://example.com/images/prison-island-thumb.jpg',
        gallery: [
            'https://example.com/images/prison-island-1.jpg',
            'https://example.com/images/prison-island-2.jpg'
        ],
        description: 'Giant Aldabra tortoises'
    },
    jozani: {
        thumbnail: 'https://example.com/images/jozani-thumb.jpg',
        gallery: [
            'https://example.com/images/jozani-1.jpg'
        ],
        description: 'Red Colobus monkeys in natural habitat'
    },
    mnemba: {
        thumbnail: 'https://example.com/images/mnemba-thumb.jpg',
        gallery: [
            'https://example.com/images/mnemba-1.jpg'
        ],
        description: 'Crystal clear waters of Mnemba Atoll'
    },
    dolphin: {
        thumbnail: 'https://example.com/images/dolphin-thumb.jpg',
        gallery: [
            'https://example.com/images/dolphin-1.jpg'
        ],
        description: 'Swimming with dolphins at Kizimkazi'
    },
    spice: {
        thumbnail: 'https://example.com/images/spice-thumb.jpg',
        gallery: [
            'https://example.com/images/spice-1.jpg'
        ],
        description: 'Fresh spices from Zanzibar farms'
    }
};

// Local image paths (if using local files)
const localImages = {
    safari_blue: 'media/tours/safari-blue.jpg',
    stone_town: 'media/tours/stone-town.jpg',
    prison_island: 'media/tours/prison-island.jpg',
    jozani: 'media/tours/jozani.jpg',
    mnemba: 'media/tours/mnemba.jpg',
    dolphin: 'media/tours/dolphin.jpg',
    spice: 'media/tours/spice.jpg'
};

/**
 * Get image for tour
 * @param {string} tourKey - Tour identifier
 * @param {string} type - 'thumbnail' or 'gallery'
 */
function getTourImage(tourKey, type = 'thumbnail') {
    const tour = tourImages[tourKey.toLowerCase().replace(/\s+/g, '_')];
    if (!tour) return null;
    
    if (type === 'gallery') {
        return tour.gallery || [];
    }
    return tour.thumbnail;
}

/**
 * Get tour description for image caption
 * @param {string} tourKey - Tour identifier
 */
function getTourCaption(tourKey) {
    const tour = tourImages[tourKey.toLowerCase().replace(/\s+/g, '_')];
    return tour?.description || '';
}

module.exports = {
    tourImages,
    localImages,
    getTourImage,
    getTourCaption
};
