'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useRouter, usePathname } from 'next/navigation';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingState from './components/LoadingState';

// --- Datenimporte ---
// WICHTIG: Stelle sicher, dass diese Pfade korrekt sind und die JSON-Dateien existieren.
import osmFriseure from './data/osm-friseure.json';
import osmGesundheit from './data/osm-gesundheit.json';
import osmGastro from './data/osm-gastro.json';

// --- Komponentenimporte ---
// WICHTIG: Stelle sicher, dass diese Pfade korrekt sind und die Komponenten exportiert werden.
import BookingForm from './components/BookingForm';
import SlotDetailView from './components/SlotDetailView';

// Map-Komponente dynamisch laden
const Map = dynamic(() => import('./components/Map').then(mod => mod.default), {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-gray-300 h-12 w-12"></div>
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
});

// --- Typdefinitionen ---
// Besser: Importiere diese aus einer zentralen types.ts Datei
interface Slot {
    id: number | string;
    lngLat: [number, number];
    name: string;
    type: string;
    city?: string;
    subType?: string;
    address?: string;
    phone?: string | null;
    website?: string | null;
    imageUrl?: string | null;
    rating?: number;
    ratingCount?: number;
    openingHours?: string[];
}

interface User {
    id?: string;
    name?: string;
    email?: string;
    role?: 'provider' | 'user' | string;
    phone?: string;
    country?: string;
    birthday?: string;
    gender?: string;
}

interface RawSlotData {
    id?: number | string;
    lon?: number | string | null; // Erlaube auch string oder null
    lat?: number | string | null;
    name?: string | null;
    type?: string | null; // Hauptkategorie aus OSM z.B.
    city?: string | null;
    subType?: string | null; // Spezifischer Typ z.B.
    address?: string | null;
    phone?: string | null;
    website?: string | null;
    // Füge weitere Felder hinzu, die in deinen JSONs vorkommen könnten
  }
  
  // --- Datenaufbereitung ---
  let fallbackCounter = 0;
  const generateId = (item: RawSlotData): number | string => { // Typ RawSlotData
    return item.id !== undefined && item.id !== null ? item.id : `fallback-${fallbackCounter++}`;
  };
  
  // Verbesserte Datenverarbeitung mit Validierung und RawSlotData Typ
  const mapDataSource = (items: RawSlotData[], typeFallback: string, defaultCity: string): Slot[] => { // Typ RawSlotData[]
    if (!Array.isArray(items)) {
      console.error(`[ERROR] Input for ${typeFallback} is not an array.`);
      return [];
    }
  
    return items.map((item: RawSlotData): Slot => ({ // Typ RawSlotData
      id: generateId(item),
      // Sicherere Prüfung mit Number() und isNaN()
      lngLat: (typeof item.lon !== 'undefined' && item.lon !== null && typeof item.lat !== 'undefined' && item.lat !== null && !isNaN(Number(item.lon)) && !isNaN(Number(item.lat)))
        ? [Number(item.lon), Number(item.lat)]
        : [0, 0], // Fallback bleibt [0,0] -> wird später gefiltert
      name: item.name || `Unbenannt (${typeFallback})`,
      type: item.type || typeFallback, // Hier evtl. spezifischeres Mapping von OSM tags nötig
      city: item.city || defaultCity,
      subType: item.subType || '',
      address: item.address || 'Keine Adresse',
      phone: item.phone || null,
      website: item.website || null,
      // Map hier auch imageUrl, rating etc. falls in RawSlotData vorhanden
    }));
  };

// --- Konstanten ---
const cities = [ { value: 'Zürich', label: 'Zürich' }, { value: 'Berlin', label: 'Berlin' }, { value: 'Wien', label: 'Wien' } ];
const categories = ['Alle', 'Arzt', 'Zahnarzt', 'Apotheke', 'Therapeut', 'Notdienst', 'Gastro', 'Friseur'];

// --- Datenaufbereitung ---

// Sicherstellung der Datenintegrität
let sampledFriseure: Slot[] = [];
let gesundheitSlots: Slot[] = [];
let gastroSlots: Slot[] = [];
let allSlots: Slot[] = [];
let validSlots: Slot[] = [];

try {
  sampledFriseure = mapDataSource(osmFriseure, 'Friseur', 'Zürich');
  gesundheitSlots = mapDataSource(osmGesundheit, 'Gesundheit', 'Zürich');
  gastroSlots = mapDataSource(osmGastro, 'Gastro', 'Zürich');
  allSlots = [...sampledFriseure, ...gesundheitSlots, ...gastroSlots];
  validSlots = allSlots.filter(slot => 
    slot.lngLat && 
    Array.isArray(slot.lngLat) && 
    slot.lngLat.length === 2 && 
    typeof slot.lngLat[0] === 'number' && 
    typeof slot.lngLat[1] === 'number' && 
    (slot.lngLat[0] !== 0 || slot.lngLat[1] !== 0)
  );
  
  console.log(`[DEBUG] Total slots: ${allSlots.length}, Valid slots: ${validSlots.length}`);
} catch (error) {
  console.error('[ERROR] Failed to process slots data:', error);
}

// --- React Komponente ---
export default function Home() {
  const router = useRouter();
  const pathname = usePathname();

  // --- State Variablen mit Typen ---
  const [selectedCity, setSelectedCity] = useState<string>('Zürich');
  const [selectedCategory, setSelectedCategory] = useState<string | null>('Alle');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSlotId, setSelectedSlotId] = useState<number | string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [rightPanelView, setRightPanelView] = useState<'list' | 'detail' | 'booking'>('list');
  const [flyToCoords, setFlyToCoords] = useState<[number, number] | null>(null);
  const [bookingSuccessMessage, setBookingSuccessMessage] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // --- Memoized filteredSlots ---
  const filteredSlots = useMemo(() => {
    try {
      console.log(`[FILTER DEBUG] Calculating filtered slots. City: "${selectedCity}", Category: "${selectedCategory}"`);
      const cityLower = selectedCity?.toLowerCase();
      const categoryLower = selectedCategory?.toLowerCase();
      
      if (!cityLower) return [];
      
      const baseFiltered = validSlots.filter((s) => s.city?.toLowerCase() === cityLower);
      
      if (!categoryLower || categoryLower === 'alle') {
        return baseFiltered;
      }
      
      return baseFiltered.filter((s) => s.type?.toLowerCase() === categoryLower);
    } catch (err) {
      console.error('[ERROR] Failed to filter slots:', err);
      return [];
    }
  }, [selectedCity, selectedCategory]);

  // --- API Service Mock ---
  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    try {
      // Simuliert API-Aufruf
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log("Bookings fetched successfully");
      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError("Failed to load bookings");
      setIsLoading(false);
    }
  }, []);

  // --- Callback Funktionen ---
  const resetSelectionAndViews = useCallback(() => {
    setRightPanelView('list');
    setSelectedSlotId(null);
    setSelectedSlot(null);
    setFlyToCoords(null);
    console.log("[DEBUG] Selection and views reset.");
  }, []);

  // Fixed useCallback - removed unnecessary dependencies
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    resetSelectionAndViews();
    
    const parts = query.trim().split(/\s+/);
    const cityDefault = 'Zürich';
    const categoryDefault = 'Alle';
    
    const knownCitiesLower = cities.map(c => c.value.toLowerCase());
    const knownCategoriesLower = categories.filter(c => c !== 'Alle').map(c => c.toLowerCase());
    
    let foundCityValue: string | null = null;
    let foundCategoryValue: string | null = null;

    parts.forEach(part => {
      const lowerPart = part.toLowerCase();
      
      if (!foundCityValue && knownCitiesLower.includes(lowerPart)) {
        foundCityValue = cities.find(c => c.value.toLowerCase() === lowerPart)?.value || null;
      } else if (!foundCategoryValue && knownCategoriesLower.includes(lowerPart)) {
        foundCategoryValue = categories.find(c => c.toLowerCase() === lowerPart) || null;
      }
    });
    
    const finalCity = foundCityValue || cityDefault;
    const finalCategory = foundCategoryValue || categoryDefault;
    
    setSelectedCity(finalCity);
    setSelectedCategory(finalCategory);
    console.log(`[DEBUG] Search: City=${finalCity}, Category=${finalCategory}`);
  }, [resetSelectionAndViews]);

  const handleAuthClick = useCallback(() => {
    let targetPath = '/profil';
    if (!user) {
      targetPath = '/login';
    } else if (user.role === 'provider') {
      targetPath = '/dashboard/slots';
    }
    console.log(`[DEBUG] Auth button clicked. User role: "${user?.role}", Target Path: "${targetPath}"`);
    router.push(targetPath);
  }, [router, user]);

  const handleCategoryChange = useCallback((cat: string) => {
    resetSelectionAndViews();
    setSelectedCategory(prev => prev === cat ? 'Alle' : cat);
  }, [resetSelectionAndViews]);

  const handleShowSlotDetails = useCallback((id: number | string) => {
    try {
      const slot = validSlots.find((s) => s.id === id);
      if (!slot) {
        console.error(`[ERROR] Slot with id ${id} not found`);
        return;
      }
      
      setSelectedSlot(slot);
      setSelectedSlotId(id);
      setRightPanelView('detail');
      
      if (Array.isArray(slot.lngLat) && 
          slot.lngLat.length === 2 && 
          typeof slot.lngLat[0] === 'number' && 
          typeof slot.lngLat[1] === 'number' &&
          !isNaN(slot.lngLat[0]) && 
          !isNaN(slot.lngLat[1])) {
        setFlyToCoords(slot.lngLat);
      } else {
        console.warn(`[WARN] Invalid coordinates for slot ${id}`);
        setFlyToCoords(null);
      }
    } catch (err) {
      console.error('[ERROR] Failed to show slot details:', err);
    }
  }, []);

  const handleGoToBooking = useCallback(() => {
    if (selectedSlot) {
      setRightPanelView('booking');
    }
  }, [selectedSlot]);

  const handleGoToBookingFromList = useCallback((id: number | string, event: React.MouseEvent<HTMLButtonElement>) => {
    try {
      event.stopPropagation();
      const slot = validSlots.find((s) => s.id === id);
      if (!slot) {
        console.error(`[ERROR] Slot with id ${id} not found`);
        return;
      }
      
      setSelectedSlot(slot);
      setSelectedSlotId(id);
      setRightPanelView('booking');
      
      if (Array.isArray(slot.lngLat) && 
          slot.lngLat.length === 2 && 
          typeof slot.lngLat[0] === 'number' && 
          typeof slot.lngLat[1] === 'number' &&
          !isNaN(slot.lngLat[0]) && 
          !isNaN(slot.lngLat[1])) {
        setFlyToCoords(slot.lngLat);
      } else {
        console.warn(`[WARN] Invalid coordinates for slot ${id}`);
        setFlyToCoords(null);
      }
    } catch (err) {
      console.error('[ERROR] Failed to go to booking:', err);
    }
  }, []);

  const handleCloseBookingForm = useCallback(() => {
    if (selectedSlot) {
      setRightPanelView('detail');
    } else {
      resetSelectionAndViews();
    }
  }, [selectedSlot, resetSelectionAndViews]);

  const handleCloseDetailView = useCallback(() => {
    resetSelectionAndViews();
  }, [resetSelectionAndViews]);

  const handleBookingSuccess = useCallback((message: string) => {
    console.log(`Booking successful: ${message}`);
    setBookingSuccessMessage(message);
    
    // Optimistischer UI-Update
    router.push('/success');
    
    setTimeout(() => {
      setBookingSuccessMessage(null);
      resetSelectionAndViews();
      fetchBookings();
    }, 500);
  }, [router, fetchBookings, resetSelectionAndViews]);

  const handleMapMoveEnd = useCallback(() => {
    setFlyToCoords(null);
  }, []);

  // --- Effekte ---
  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Auth Status Effect
  useEffect(() => {
    console.log("[DEBUG] Checking auth status...");
    if (typeof window !== 'undefined') {
      try {
        let currentUser: User | null = null;
        const token = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('user');

        if (token && storedUser && storedUser !== 'undefined') {
          try {
            currentUser = JSON.parse(storedUser) as User;
            console.log("[DEBUG] User loaded from localStorage:", currentUser);
          } catch (e) {
            console.error('Error parsing localStorage user:', e);
            localStorage.removeItem('user');
            localStorage.removeItem('authToken');
          }
        }
        setUser(currentUser);
      } catch (err) {
        console.error('[ERROR] Auth status check failed:', err);
      }
    }
  }, [pathname]);

  // Selected Slot Validation
  useEffect(() => {
    if (selectedSlot && !filteredSlots.some(slot => slot.id === selectedSlot.id)) {
      console.log(`[FILTER DEBUG] Selected slot invalid after filter. Resetting view.`);
      handleCloseDetailView();
    }
  }, [filteredSlots, selectedSlot, handleCloseDetailView]);

  // --- Error handling ---
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 p-6 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-red-700 text-lg font-semibold mb-2">Error</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => setError(null)}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // --- RENDER LOG ---
  console.log(`[RENDER STATE] View: ${rightPanelView}, Filtered Count: ${filteredSlots.length}, Selected ID: ${selectedSlotId}`);

  // --- JSX Rendering ---
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-white text-gray-900 flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-4 sm:px-6 py-3 border-b bg-white shadow-sm gap-4 sticky top-0 z-20">
          <span className="font-semibold text-black text-lg flex-shrink-0">Nowly</span>
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSearch(searchQuery); }}
            className="flex-grow max-w-xl mx-2 sm:mx-6"
          >
            <input 
              type="text" 
              placeholder="z.B. Massage Zürich oder Berlin"
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-300 focus:outline-none text-sm"
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search locations"
            />
          </form>
            {/* Auth Button - Profile or Login */}
            <div className="flex-shrink-0 relative">
            {user ? (
                <button 
                onClick={handleAuthClick}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm whitespace-nowrap group"
                aria-label="Open profile"
                >
                {user.name ? (
                    <>
                    <span>{user.name.split(' ')[0]}</span>
                    <div className="h-6 w-6 rounded-full bg-blue-400 flex items-center justify-center text-xs font-bold">
                        {user.name.charAt(0).toUpperCase()}
                    </div>
                    </>
                ) : (
                    <>
                    <span>Profil</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    </>
                )}
                </button>
            ) : (
                <button 
                onClick={handleAuthClick}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 text-sm whitespace-nowrap"
                aria-label="Login to account"
                >
                <span>Login</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                </button>
            )}
            </div>
        </header>
        
        {/* Hauptinhalt */}
        <main className="flex-grow">
          {/* Titel und Kategorie-Filter */}
          <section className="text-center px-6 py-6">
            <h2 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">Book what&apos;s free now</h2>
            <div className="flex justify-center flex-wrap gap-3">
              {categories.map((cat) => (
                <button 
                  key={cat} 
                  onClick={() => handleCategoryChange(cat)}
                  className={`px-4 py-2 rounded-full border text-sm ${
                    cat === selectedCategory 
                      ? 'bg-black text-white border-black' 
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                  }`}
                  aria-label={`Filter by ${cat}`}
                  aria-pressed={cat === selectedCategory}
                >
                  {cat}
                </button>
              ))}
            </div>
          </section>

          {/* Karten- und Detailbereich */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 px-4 sm:px-6 pb-12">
            {/* Linke Spalte: Karte */}
            <div className="h-[500px] md:h-[calc(100vh-320px)] lg:h-[calc(100vh-300px)] min-h-[400px] rounded-xl overflow-hidden shadow-md relative bg-gray-100">
              <Map
                city={selectedCity}
                slots={filteredSlots}
                onSlotSelect={handleShowSlotDetails}
                selectedSlotId={selectedSlotId}
                flyToCoords={flyToCoords}
                onMapMoveEnd={handleMapMoveEnd}
              />
            </div>

            {/* Rechte Spalte: Dynamischer Inhalt */}
            <div className="h-[500px] md:h-[calc(100vh-320px)] lg:h-[calc(100vh-300px)] min-h-[400px] rounded-xl bg-white shadow-md p-4 overflow-y-auto flex flex-col">
              {isLoading ? (
                <LoadingState text="Loading data..." />
              ) : (
                <>
                  {/* A: Liste */}
                  {rightPanelView === 'list' && (
                    <>
                      {filteredSlots.length === 0 ? (
                        <p className="text-gray-500 text-sm text-center m-auto">Keine Einträge gefunden.</p>
                      ) : (
                        <div className="flex flex-col gap-2">
                          {filteredSlots.map((slot: Slot) => (
                            <div 
                              key={`${slot.id}-${slot.type}`}
                              className={`border border-gray-200 rounded-md px-4 py-3 flex justify-between items-center bg-white shadow-sm transition-all duration-150 ease-in-out cursor-pointer hover:shadow-lg hover:border-gray-300 ${selectedSlotId === slot.id ? 'ring-2 ring-blue-500' : ''}`}
                              onClick={() => handleShowSlotDetails(slot.id)}
                            >
                              <div className="flex-grow mr-4 overflow-hidden">
                                <h3 className="font-semibold text-base truncate">{slot.name}</h3>
                                <p className="text-xs text-gray-500">{slot.subType ? `${slot.subType} – ` : ''}{slot.type}</p>
                              </div>
                              <button 
                                onClick={(e) => handleGoToBookingFromList(slot.id, e)}
                                className="ml-auto flex-shrink-0 px-3 py-1 bg-white hover:bg-gray-100 text-gray-700 text-sm rounded border border-gray-300 whitespace-nowrap z-10"
                                aria-label={`Book ${slot.name}`}
                              >
                                Buchen
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}

                  {/* B: Details */}
                  {rightPanelView === 'detail' && selectedSlot && (
                    <SlotDetailView 
                      slot={selectedSlot} 
                      onGoToBooking={handleGoToBooking} 
                      onClose={handleCloseDetailView} 
                    />
                  )}

                  {/* C: Buchung */}
                  {rightPanelView === 'booking' && selectedSlot && (
                    <BookingForm 
                      slotId={selectedSlot.id} 
                      slotName={selectedSlot.name} 
                      slotAddress={selectedSlot.address || ''} 
                      onBookingSuccess={handleBookingSuccess} 
                      onClose={handleCloseBookingForm}
                    />
                  )}
                </>
              )}
            </div>
          </section>
        </main>

        {/* Erfolgsmeldung */}
        {bookingSuccessMessage && (
          <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50 animate-pulse">
            {bookingSuccessMessage}
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}