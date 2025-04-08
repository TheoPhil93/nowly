'use client';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import type { Slot } from './components/Map';
import osmFriseure from './data/osm-friseure.json';
import gesundheitSampled from './data/osm-gesundheit-sampled.json';
import osmGastro from './data/osm-gastro.json';
import BookingForm from './components/BookingForm';

const Map = dynamic(() => import('./components/Map'), { ssr: false });

const cities = [
    { value: 'Zürich', label: 'Zürich' },
    { value: 'Berlin', label: 'Berlin' },
    { value: 'Wien', label: 'Wien' },
];

const categories = ['Alle', 'Arzt', 'Zahnarzt', 'Apotheke', 'Therapeut', 'Notdienst', 'Gastro'];
const optionalCategories = ['Friseur', 'Massage'];

// Utils: Shuffle + Pick
function shuffleArray<T>(array: T[]): T[] {
    return array.sort(() => Math.random() - 0.5);
}
function pickSample<T>(array: T[], count: number): T[] {
    return shuffleArray(array).slice(0, count);
}

// Friseure: 25 zufällige, 5 hervorgehoben
const sampledFriseure = pickSample(osmFriseure, 25).map((entry, index) => ({
    id: entry.id,
    lngLat: [entry.lon, entry.lat] as [number, number],
    name: entry.name,
    type: 'Friseur',
    city: entry.city || 'Zürich',
    subType: entry.subType || '',
    address: entry.address || '',
    highlighted: index < 5,
}));

// Gesundheit: 25 zufällige, 5 davon hervorgehoben
const gesundheitSlots: Slot[] = gesundheitSampled.map((item) => ({
    id: item.id,
    name: item.name,
    lngLat: item.lngLat as [number, number],
    type: 'Arzt',
    city: item.city || 'Zürich',
    subType: item.subType || '',
    address: item.address || '',
    highlighted: item.highlighted || false,
}));

// Gastro: 25 zufällige, 5 davon hervorgehoben
const gastroSlots: Slot[] = pickSample(osmGastro, 25).map((item, index) => ({
    id: item.id,
    name: item.name,
    lngLat: [item.lon, item.lat] as [number, number],
    type: 'Gastro',
    city: 'Zürich',
    address: item.address || '',
    highlighted: index < 5,
}));

const allSlots: Slot[] = [...sampledFriseure, ...gesundheitSlots, ...gastroSlots];

export default function Home() {
    const [selectedCity, setSelectedCity] = useState('Zürich');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [filteredSlots, setFilteredSlots] = useState<Slot[]>([]);
    const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
    const [showBookingForm, setShowBookingForm] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
    const listRef = useRef<HTMLDivElement>(null);

    const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedCity(e.target.value);
        setSelectedSlotId(null);
    };

    const handleSlotSelect = useCallback((id: number) => {
        const slot = allSlots.find((s) => s.id === id);
        if (slot) {
            setSelectedSlot(slot);
            setShowBookingForm(true);
            setSelectedSlotId(id);

            // Optional: Scrollen zur Karte, falls sie nicht sichtbar ist
            // listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, []);

    // Neue Funktion zum Zoomen der Karte (wird an Map übergeben)
    const handleZoomToSlot = useCallback((id: number) => {
        setSelectedSlotId(id); // Setze die ausgewählte ID für die Map
    }, []);

    const handleBookingSuccess = useCallback((message: string) => {
        alert(message);
        setShowBookingForm(false);
    }, []);

    const handleCloseBookingForm = useCallback(() => {
        setShowBookingForm(false);
    }, []);

    useEffect(() => {
        let result = allSlots.filter((s) => s.city === selectedCity);
        if (selectedCategory && selectedCategory !== 'Alle') {
            result = result.filter((s) => s.type === selectedCategory);
        }
        setFilteredSlots(result);
    }, [selectedCity, selectedCategory]);

    return (
        <div className="min-h-screen bg-white text-gray-900">
            {/* Header */}
            <header className="flex justify-between items-center px-6 py-4 border-b text-sm text-gray-600">
                <span className="font-semibold text-black text-lg">Nowly</span>
                <select
                    value={selectedCity}
                    onChange={handleCityChange}
                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                >
                    {cities.map((city) => (
                        <option key={city.value} value={city.value}>
                            {city.label}
                        </option>
                    ))}
                </select>
                <div className="flex gap-4">
                    <button className="hover:opacity-70">🔍</button>
                    <button className="hover:opacity-70">👤</button>
                </div>
            </header>

            {/* Headline & Filter */}
            <section className="text-center px-6 py-8">
                <h2 className="text-10xl font-bold text-gray-900 mb-6">Book what’s free now</h2>
                <div className="flex justify-center flex-wrap gap-3">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
                            className={`px-4 py-2 rounded-full border text-sm ${
                                cat === selectedCategory
                                    ? 'bg-black text-white border-black'
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </section>

            {/* Map + Cards */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6 px-6 pb-12">
                <div className="h-[500px] rounded-xl overflow-hidden shadow-md relative">
                    <Map
                        city={selectedCity}
                        slots={filteredSlots}
                        onSlotSelect={handleZoomToSlot}
                        selectedSlotId={selectedSlotId}
                    />
                </div>

                <div className="h-[500px] flex flex-col justify-start rounded-xl bg-white shadow-md p-4 gap-2 overflow-y-auto" ref={listRef}>
                    {filteredSlots.length === 0 ? (
                        <p className="text-gray-500 text-sm">Keine Einträge gefunden.</p>
                    ) : (
                        filteredSlots.map((slot) => (
                            <div
                                key={slot.id}
                                className="slot-card" /* Verwende die neue CSS-Klasse */
                                onClick={() => handleZoomToSlot(slot.id)} /* Klickhandler für die gesamte Karte */
                            >
                                <div>
                                    <h3 className="slot-title">{slot.name}</h3>
                                    <p className="slot-subtitle">
                                        {slot.subType ? `${slot.subType} – ` : ''}{slot.type}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <button
                                        className="map-button" /* Behalte die ursprüngliche CSS-Klasse */
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleSlotSelect(slot.id);
                                        }}
                                    >
                                        Buchen 
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>

            {/* Buchungsformular (unter der Karte) */}
            {showBookingForm && selectedSlot && (
                <BookingForm
                    slotId={selectedSlot.id}
                    onBookingSuccess={handleBookingSuccess}
                    onClose={handleCloseBookingForm}
                />
            )}
        </div>
    );
}