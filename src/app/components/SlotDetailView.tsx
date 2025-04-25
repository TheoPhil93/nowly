'use client';

import React from 'react'; // No need to import FC separately, it's part of React
import Image from 'next/image';

// 1. Define an interface for the structure of a slot object
interface Slot {
  // Add types based on usage in the component. Mark optional if needed.
  imageUrl?: string;      // Used in Image src, optional based on check
  name: string;           // Required
  type: string;           // Required
  subType?: string;       // Optional based on check
  address?: string;       // Optional based on check
  phone?: string;         // Optional based on check
  website?: string;       // Optional based on check
  openingHours?: string[];// Optional array of strings based on check
  // Add any other properties your slot object might have (e.g., id)
  // id?: string | number;
}

// 2. Define an interface for the component's props
interface SlotDetailViewProps {
  slot: Slot | null | undefined; // The slot can be null/undefined based on the check
  onGoToBooking: () => void;     // A function that takes no arguments and returns nothing
  onClose: () => void;           // A function that takes no arguments and returns nothing
}

/**
 * Component for displaying detailed information about a slot
 */
// 3. Apply the Props interface using React.FC<PropsInterface>
const SlotDetailView: React.FC<SlotDetailViewProps> = ({ slot, onGoToBooking, onClose }) => {
  // Now TypeScript knows the types of slot, onGoToBooking, and onClose

  if (!slot) return null; // Type guard works correctly now

  // 4. (Recommended) Add types to helper function parameters and return value
  const formatPhone = (phone: string | null | undefined): string | null => {
    if (!phone) return null;

    // Remove non-numeric characters
    const cleaned = phone.replace(/\D/g, '');

    // Format based on length (Example format, adjust if needed)
    // Note: This specific +1 format might be US/Canada centric. Adjust for international numbers if necessary.
    if (cleaned.length === 10) { // Example: US number without country code
        return `+1 (${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6)}`;
    } else if (cleaned.length === 11 && cleaned.startsWith('1')) { // Example: US number with country code
        return `+1 (${cleaned.substring(1, 4)}) ${cleaned.substring(4, 7)}-${cleaned.substring(7)}`;
    }
    // Consider adding more robust international formatting if needed

    return phone; // Return original if not formatted
  };


  return (
    <div className="flex flex-col h-full">
      {/* Header with back button */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onClose} // Type checked: () => void
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Back to list"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h2 className="text-lg font-semibold">Details</h2>
        <div className="w-7"></div> {/* Spacer */}
      </div>

      {/* Slot image */}
      <div className="w-full h-48 bg-gray-200 rounded-lg mb-4 overflow-hidden">
        {/* Type checked: slot.imageUrl is string | undefined */}
        {slot.imageUrl ? (
          <Image
            src={slot.imageUrl}
            alt={`Image for ${slot.name}`} // More descriptive alt text
            width={500} // Consider layout="fill" and objectFit="cover" for responsiveness
            height={300}
            className="w-full h-full object-cover"
            priority // Add priority if this is likely above the fold
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            {/* Placeholder Icon */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
        )}
      </div>

      {/* Slot information */}
      <div className="flex-grow">
        {/* Name and type */}
        <div className="mb-4">
           {/* Type checked: slot.name is string */}
          <h3 className="text-xl font-bold text-gray-900">{slot.name}</h3>
          <div className="flex items-center mt-1 flex-wrap"> {/* Added flex-wrap */}
             {/* Type checked: slot.type is string */}
            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full mb-1 mr-1">{slot.type}</span>
             {/* Type checked: slot.subType is string | undefined */}
            {slot.subType && (
              <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full mb-1 mr-1">{slot.subType}</span>
            )}
          </div>
        </div>

        {/* Address and contact info */}
        <div className="space-y-3 mb-6">
           {/* Type checked: slot.address is string | undefined */}
          {slot.address && (
            <div className="flex items-start">
              {/* Icon */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-gray-800">{slot.address}</span>
            </div>
          )}

           {/* Type checked: slot.phone is string | undefined */}
          {slot.phone && (
            <div className="flex items-center">
               {/* Icon */}
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
               </svg>
               {/* Type checked: slot.phone is string */}
              <a href={`tel:${slot.phone}`} className="text-blue-600 hover:underline">
                {formatPhone(slot.phone) || slot.phone}
              </a>
            </div>
          )}

          {/* Type checked: slot.website is string | undefined */}
          {slot.website && (
            <div className="flex items-center">
               {/* Icon */}
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
               </svg>
                {/* Type checked: slot.website is string */}
               <a
                href={slot.website.startsWith('http') ? slot.website : `https://${slot.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline truncate" // Removed max-width for better flexibility
               >
                {slot.website.replace(/^https?:\/\/(www\.)?/, '')}
               </a>
            </div>
          )}
        </div>

        {/* Opening hours if available */}
        {/* Type checked: slot.openingHours is string[] | undefined */}
        {slot.openingHours && slot.openingHours.length > 0 && (
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-2">Öffnungszeiten</h4>
            <ul className="space-y-1 text-sm">
               {/* Type checked: hours is string */}
              {slot.openingHours.map((hours, index) => (
                <li key={index} className="flex justify-between">
                  {/* Consider a more robust split or structure for hours */}
                  <span className="text-gray-600">{hours.split(':')[0]}</span>
                  <span className="text-gray-900">{hours.split(':').slice(1).join(':')}</span> {/* Handle potential colons in time */}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Booking button */}
      <div className="mt-auto pt-4 border-t border-gray-200"> {/* Added border */}
        <button
          onClick={onGoToBooking} // Type checked: () => void
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors duration-200 flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Termin buchen
        </button>
      </div>
    </div>
  );
};

export default SlotDetailView;