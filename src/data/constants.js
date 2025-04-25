// data/constants.js
// Centralized location for app constants and configuration values

export const cities = [
    { value: 'Zürich', label: 'Zürich' },
    { value: 'Berlin', label: 'Berlin' },
    { value: 'Wien', label: 'Wien' },
    { value: 'München', label: 'München' },
    { value: 'Hamburg', label: 'Hamburg' }
  ];
  
  export const categories = [
    'Alle',
    'Arzt',
    'Zahnarzt', 
    'Apotheke',
    'Therapeut',
    'Notdienst',
    'Gastro',
    'Friseur',
    'Kosmetik',
    'Fitness'
  ];
  
  export const bookingTimeSlots = [
    '9:00', '9:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
  ];
  
  // Map category names to icons (for future use)
  export const categoryIcons = {
    'Arzt': 'medical-bag',
    'Zahnarzt': 'tooth', 
    'Apotheke': 'pharmacy',
    'Therapeut': 'heart-pulse',
    'Notdienst': 'ambulance',
    'Gastro': 'restaurant',
    'Friseur': 'scissors',
    'Kosmetik': 'spa',
    'Fitness': 'dumbbell'
  };
  
  // Config settings
  export const mapConfig = {
    defaultZoom: 13,
    defaultCenter: {
      'Zürich': [8.541694, 47.376888],
      'Berlin': [13.404954, 52.520008],
      'Wien': [16.373819, 48.208176],
      'München': [11.581981, 48.135125],
      'Hamburg': [9.993682, 53.551086]
    },
    style: 'mapbox://styles/mapbox/streets-v11'
  };
  
  // App settings
  export const appConfig = {
    siteTitle: 'Nowly - Book what\'s free now',
    apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || 'https://api.nowly.app',
    defaultPageSize: 20,
    searchDebounceMs: 300,
    toastDurationMs: 3000
  };