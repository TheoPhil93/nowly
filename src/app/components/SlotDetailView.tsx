// src/app/components/SlotDetailView.tsx
import React from 'react';
import Image from 'next/image';

// --- Helper Functions ---
const formatWebsiteUrl = (url: string): string => {
  if (!url.startsWith("http")) return `https://${url}`;
  return url;
};

const formatPhoneUrl = (phone: string): string => {
  return `tel:${phone.replace(/\s+/g, '')}`;
};

// --- Interface ---
interface SlotDetailViewProps {
  slot: {
    id: number | string;
    name: string;
    type: string;
    subType?: string;
    address?: string;
    city?: string;
    phone?: string | null;
    website?: string | null;
    imageUrl?: string | null;
    rating?: number;
    ratingCount?: number;
    openingHours?: string[];
  };
  onGoToBooking: () => void;
  onClose: () => void;
}

// --- Component ---
const SlotDetailView: React.FC<SlotDetailViewProps> = ({ slot, onGoToBooking, onClose }) => {
  const placeholderAppointments = [
    'Heute 14:30',
    'Heute 15:00',
    'Heute 16:30',
    'Morgen 09:00',
    'Morgen 10:30',
  ];

  return (
    <div className="flex flex-col h-full p-1">

      {/* Header */}
      <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200">
        <button type="button" onClick={onClose} className="flex items-center text-sm text-gray-600 hover:text-black">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          Zurück zur Liste
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-grow overflow-y-auto space-y-4 pr-2">

        {/* Bild falls vorhanden */}
        {slot.imageUrl && (
          <div className="w-full relative aspect-video rounded-md overflow-hidden bg-gray-200 mb-4"> {/* Beispiel-Container */}
            <Image
              src={slot.imageUrl}
              alt={slot.name}
              fill // Nimmt Grösse des Containers ein
              style={{ objectFit: 'cover' }} // object-cover Äquivalent
              priority
            />
         </div>
      )}

        {/* Titel & Typ */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">{slot.name}</h2>
          <p className="text-md text-gray-600 font-semibold">
            {slot.subType ? `${slot.subType} – ` : ''}{slot.type}
          </p>
        </div>

        {/* Bewertungen */}
        {slot.rating && (
          <div className="flex items-center text-sm text-yellow-600 space-x-1">
            <span>{"⭐".repeat(Math.round(slot.rating))}</span>
            <span className="text-gray-600">{slot.rating.toFixed(1)} von 5</span>
            {slot.ratingCount && <span className="text-gray-500">({slot.ratingCount} Bewertungen)</span>}
          </div>
        )}

        {/* Öffnungszeiten */}
        {slot.openingHours && slot.openingHours.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">Öffnungszeiten</h3>
            <ul className="text-base text-gray-700 list-disc list-inside">
              {slot.openingHours.map((line, index) => (
                <li key={index}>{line}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Verfügbare Termine */}
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Verfügbare Zeiten (Beispiele)</h3>
          <div className="flex flex-wrap gap-2">
            {placeholderAppointments.map((time, index) => (
              <button
                key={index}
                onClick={onGoToBooking}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 cursor-pointer border border-blue-200"
              >
                {time}
              </button>
            ))}
            <p className="text-xs text-gray-400 w-full mt-1">Beispielzeiten – klicken Sie auf eine Uhrzeit oder unten, um zu buchen.</p>
          </div>
        </div>

        {/* Adresse */}
        {(slot.address || slot.city) && (
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">Adresse</h3>
            {slot.address && <p className="text-base text-gray-700">{slot.address}</p>}
            {slot.city && <p className="text-base text-gray-700">{slot.city}</p>}
          </div>
        )}

        {/* Telefon */}
        {slot.phone && (
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">Telefon</h3>
            <a href={formatPhoneUrl(slot.phone)} className="text-base text-blue-600 hover:underline">
              {slot.phone}
            </a>
            <p className="text-sm text-gray-500 mt-1">Rufen Sie uns gerne bei Fragen oder zur Terminvereinbarung an.</p>
          </div>
        )}

        {/* Website */}
        {slot.website && (
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">Website</h3>
            <a
              href={formatWebsiteUrl(slot.website)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-base text-blue-600 hover:underline break-all"
            >
              {slot.website}
            </a>
          </div>
        )}
      </div>

      {/* Footer booking button */}
      <div className="mt-auto pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onGoToBooking}
          className="w-full px-4 py-3 bg-black text-white rounded-md hover:bg-gray-800 text-base font-semibold"
        >
          Anderen Termin wählen / Buchen
        </button>
      </div>
    </div>
  );
};

export default SlotDetailView;
