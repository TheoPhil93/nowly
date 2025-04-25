// utils/dataProcessing.js

// Import data sources
import osmFriseure from '../data/osm-friseure.json';
import osmGesundheit from '../data/osm-gesundheit.json';
import osmGastro from '../data/osm-gastro.json';

/**
 * Type definitions for reference:
 * 
 * @typedef {Object} Slot - Processed slot data
 * @property {number|string} id - Unique identifier
 * @property {[number, number]} lngLat - Longitude and latitude coordinates [lng, lat]
 * @property {string} name - Name of the location
 * @property {string} type - Category (e.g., 'Friseur', 'Gesundheit', 'Gastro')
 * @property {string} [city] - City name
 * @property {string} [subType] - More specific type
 * @property {string} [address] - Full address
 * @property {string|null} [phone] - Contact phone number
 * @property {string|null} [website] - Website URL
 * @property {string|null} [imageUrl] - URL to image
 * @property {number} [rating] - Rating (1-5)
 * @property {number} [ratingCount] - Number of ratings
 * @property {string[]} [openingHours] - Opening hours
 * 
 * @typedef {Object} RawSlotData - Raw data from source
 * @property {number|string} [id] - Identifier (optional)
 * @property {number|string|null} [lon] - Longitude coordinate
 * @property {number|string|null} [lat] - Latitude coordinate
 * @property {string|null} [name] - Name
 * @property {string|null} [type] - Category
 * @property {string|null} [city] - City
 * @property {string|null} [subType] - Subcategory
 * @property {string|null} [address] - Address
 * @property {string|null} [phone] - Phone number
 * @property {string|null} [website] - Website
 */

// Counter for generating fallback IDs
let fallbackCounter = 0;

/**
 * Generate a unique ID for items that don't have one
 * 
 * @param {RawSlotData} item - Raw data item
 * @returns {number|string} - Generated or existing ID
 */
const generateId = (item) => {
  return item.id !== undefined && item.id !== null 
    ? item.id 
    : `fallback-${fallbackCounter++}`;
};

/**
 * Maps raw data to structured slot format with validation
 * 
 * @param {RawSlotData[]} items - Array of raw data items
 * @param {string} typeFallback - Default type if none exists
 * @param {string} defaultCity - Default city if none exists
 * @returns {Slot[]} - Array of processed slot objects
 */
const mapDataSource = (items, typeFallback, defaultCity) => {
  if (!Array.isArray(items)) {
    console.error(`[ERROR] Input for ${typeFallback} is not an array.`);
    return [];
  }

  return items.map((item) => ({
    id: generateId(item),
    lngLat: (typeof item.lon !== 'undefined' && item.lon !== null && 
             typeof item.lat !== 'undefined' && item.lat !== null && 
             !isNaN(Number(item.lon)) && !isNaN(Number(item.lat)))
      ? [Number(item.lon), Number(item.lat)]
      : [0, 0], // Fallback will be filtered later
    name: item.name || `Unbenannt (${typeFallback})`,
    type: item.type || typeFallback,
    city: item.city || defaultCity,
    subType: item.subType || '',
    address: item.address || 'Keine Adresse',
    phone: item.phone || null,
    website: item.website || null,
    imageUrl: item.imageUrl || null,
    rating: item.rating || null,
    ratingCount: item.ratingCount || null,
    openingHours: item.openingHours || null
  }));
};

/**
 * Process all slot data and return both all slots and valid slots
 * 
 * @returns {Object} Object containing allSlots and validSlots arrays
 */
export const processSlotData = () => {
  try {
    // Process data from each source
    const sampledFriseure = mapDataSource(osmFriseure, 'Friseur', 'Zürich');
    const gesundheitSlots = mapDataSource(osmGesundheit, 'Gesundheit', 'Zürich');
    const gastroSlots = mapDataSource(osmGastro, 'Gastro', 'Zürich');
    
    // Combine all data sources
    const allSlots = [...sampledFriseure, ...gesundheitSlots, ...gastroSlots];
    
    // Filter for valid coordinates
    const validSlots = allSlots.filter(slot => 
      slot.lngLat && 
      Array.isArray(slot.lngLat) && 
      slot.lngLat.length === 2 && 
      typeof slot.lngLat[0] === 'number' && 
      typeof slot.lngLat[1] === 'number' && 
      (slot.lngLat[0] !== 0 || slot.lngLat[1] !== 0)
    );
    
    console.log(`[DEBUG] Total slots: ${allSlots.length}, Valid slots: ${validSlots.length}`);
    
    return { allSlots, validSlots };
  } catch (error) {
    console.error('[ERROR] Failed to process slots data:', error);
    return { allSlots: [], validSlots: [] };
  }
};

/**
 * Search slots by query text
 * 
 * @param {Slot[]} slots - Array of slots to search
 * @param {string} query - Search query
 * @returns {Slot[]} - Filtered slots matching query
 */
export const searchSlots = (slots, query) => {
  if (!query || !slots?.length) return slots;
  
  const normalizedQuery = query.toLowerCase().trim();
  
  return slots.filter(slot => {
    const nameMatch = slot.name?.toLowerCase().includes(normalizedQuery);
    const typeMatch = slot.type?.toLowerCase().includes(normalizedQuery);
    const subTypeMatch = slot.subType?.toLowerCase().includes(normalizedQuery);
    const addressMatch = slot.address?.toLowerCase().includes(normalizedQuery);
    
    return nameMatch || typeMatch || subTypeMatch || addressMatch;
  });
};

/**
 * Group slots by category
 * 
 * @param {Slot[]} slots - Array of slots
 * @returns {Object} - Object with categories as keys and arrays of slots as values
 */
export const groupSlotsByCategory = (slots) => {
  return slots.reduce((grouped, slot) => {
    const category = slot.type || 'Andere';
    
    if (!grouped[category]) {
      grouped[category] = [];
    }
    
    grouped[category].push(slot);
    return grouped;
  }, {});
};

/**
 * Sort slots by various criteria
 * 
 * @param {Slot[]} slots - Array of slots to sort
 * @param {string} sortBy - Sort criterion ('name', 'rating', 'distance')
 * @param {boolean} ascending - Sort direction (true for ascending)
 * @param {[number, number]} [currentLocation] - Current user location for distance sorting
 * @returns {Slot[]} - Sorted slots
 */
export const sortSlots = (slots, sortBy = 'name', ascending = true, currentLocation = null) => {
  if (!slots?.length) return [];
  
  const sortedSlots = [...slots];
  const direction = ascending ? 1 : -1;
  
  switch (sortBy) {
    case 'name':
      return sortedSlots.sort((a, b) => 
        direction * (a.name || '').localeCompare(b.name || '')
      );
      
    case 'rating':
      return sortedSlots.sort((a, b) => {
        const ratingA = a.rating || 0;
        const ratingB = b.rating || 0;
        return direction * (ratingB - ratingA);
      });
      
    case 'distance':
      if (!currentLocation) return sortedSlots;
      
      // Calculate distance using Haversine formula
      const calculateDistance = (coords1, coords2) => {
        if (!coords1 || !coords2) return Infinity;
        
        const [lon1, lat1] = coords1;
        const [lon2, lat2] = coords2;
        
        const R = 6371; // Earth radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        
        const a = 
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
          Math.sin(dLon/2) * Math.sin(dLon/2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
      };
      
      return sortedSlots.sort((a, b) => {
        const distA = calculateDistance(currentLocation, a.lngLat);
        const distB = calculateDistance(currentLocation, b.lngLat);
        return direction * (distA - distB);
      });
      
    default:
      return sortedSlots;
  }
};