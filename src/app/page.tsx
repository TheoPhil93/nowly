'use client';

import { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import type { Slot } from './components/Map';
import osmFriseure from './data/osm-friseure.json';

const Map = dynamic(() => import('./components/Map'), { ssr: false });

const cities = [
  { value: 'Zürich', label: 'Zürich' },
  { value: 'Berlin', label: 'Berlin' },
  { value: 'Wien', label: 'Wien' },
];

const categories = ['Arzt', 'Friseur', 'Massage', 'Gastro'];

// 1. Friseure aus OSM importieren
const friseurSlots: Slot[] = osmFriseure.map((entry) => ({
  id: entry.id,
  lngLat: [entry.lon, entry.lat] as [number, number],
  name: entry.name,
  type: 'Friseur',
  city: entry.city || 'Zürich',
}));

// 2. Hier kannst du später andere Kategorien ergänzen
const allSlots: Slot[] = [...friseurSlots];

export default function Home() {
  const [selectedCity, setSelectedCity] = useState('Zürich');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [filteredSlots, setFilteredSlots] = useState<Slot[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCity(e.target.value);
    setSelectedSlotId(null);
  };

  const handleSlotSelect = useCallback((id: number) => {
    setSelectedSlotId(id);
  }, []);

  // 3. Filter nach Stadt & Kategorie
  useEffect(() => {
    let result = allSlots.filter((s) => s.city === selectedCity);
    if (selectedCategory) {
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
        <h2 className="text-4xl font-bold text-gray-900 mb-6">Book what’s free now</h2>
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
        {/* Map Box */}
        <div className="h-[500px] rounded-xl overflow-hidden shadow-md relative">
          <Map
            city={selectedCity}
            slots={filteredSlots}
            selectedSlotId={selectedSlotId}
            onSlotSelect={handleSlotSelect}
          />
        </div>

        {/* Slot Cards */}
        <div className="h-[500px] flex flex-col justify-start rounded-xl bg-white shadow-md p-4 gap-2 overflow-y-auto">
          {filteredSlots.length === 0 ? (
            <p className="text-gray-500 text-sm">Keine Einträge gefunden.</p>
          ) : (
            filteredSlots.map((slot) => (
              <div
                key={slot.id}
                className={`border border-gray-200 rounded-md px-4 py-3 flex justify-between items-center bg-white shadow-sm ${
                  selectedSlotId === slot.id ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <div>
                  <h3 className="font-semibold text-base">{slot.name}</h3>
                  <p className="text-xs text-gray-500">{slot.type}</p>
                </div>
                <div className="text-right">
                  <button
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                    onClick={() => handleSlotSelect(slot.id)}
                  >
                    Auf Karte zeigen
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
