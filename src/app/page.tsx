'use client';

import React, { useEffect, useState, useCallback, useMemo,Component, ErrorInfo, ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

// --- Datenimporte ---
// WICHTIG: Stelle sicher, dass diese Pfade korrekt sind und die JSON-Dateien existieren.
import osmFriseure from '../data/osm-friseure.json';
import osmGesundheit from '../data/osm-gesundheit.json';
import osmGastro from '../data/osm-gastro.json';

// --- Constants ---
const cities = [
  { value: 'Zürich', label: 'Zürich' },
  { value: 'Berlin', label: 'Berlin' },
  { value: 'Wien', label: 'Wien' },
  { value: 'München', label: 'München' },
  { value: 'Hamburg', label: 'Hamburg' }
];

const categories = [
  'Alle',
  'Arzt',
  'Zahnarzt',
  'Apotheke',
  'Therapeut',
  'Notdienst',
  'Gastro',
  'Friseur'
];


// --- Component Imports ---
// Dynamic import for Map component to avoid SSR issues
const Map = dynamic(() => import('./components/Map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <div className="animate-pulse flex flex-col items-center">
        <div className="rounded-full bg-gray-300 h-12 w-12 mb-4"></div>
        <div className="h-4 bg-gray-300 rounded w-32 mb-2"></div>
        <div className="h-3 bg-gray-300 rounded w-24"></div>
      </div>
    </div>
  )
});

interface ErrorBoundaryProps {
    children?: ReactNode;
  }
  
  interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
  }

  interface SlotData {
    id: string | number; // Essential for keys and selection logic
    lngLat?: [number, number];
    imageUrl?: string;
    name: string;
    type: string;
    city?: string; // Likely available from processSlotData
    subType?: string;
    address?: string;
    phone?: string | null; // Allow null if that's a possibility
    website?: string | null; // Allow null if that's a possibility
    // Add any other relevant properties
  }

  interface SlotDetailViewProps {
    slot: SlotData | null | undefined; // Slot can be null/undefined
    onGoToBooking: () => void;      // Callback function
    onClose: () => void;            // Callback function
  }

  interface BookingFormProps {
    slotId?: string | number; 
    slotName: string;
    slotAddress: string;
    onBookingSuccess: (message: string) => void;
    onClose: () => void;
  }

  interface User {
    name?: string;
    role?: string;
  }
  
  interface RawSlotItem {
    id: string | number | null | undefined; // Keep this type
    lon?: number | string | null; // Add this line
    lat?: number | string | null; // Add this line
    type?: string | null;
    name?: string | null;
    address?: string | null;
    city?: string | null;
    subType?: string | null;
    phone?: string | null;
    website?: string | null;
    availableTimes?: string[]; 
  }

// --- Error Boundary Component ---
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    // 6. Type state using class property (preferred)
    readonly state: ErrorBoundaryState = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  
    // 5. Type the constructor parameter
    constructor(props: ErrorBoundaryProps) {
      super(props);
      // State is initialized above, no need to set it here again
    }
  
    // 7. Add return type annotation (optional but good practice)
    static getDerivedStateFromError(_error: Error): Partial<ErrorBoundaryState> {
      // Returning partial state update
      return { hasError: true };
    }
  
    // componentDidCatch parameters are already correctly typed
    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
      console.error('Error caught by boundary:', error, errorInfo); // Log both
      this.setState({ error, errorInfo }); // Update state with error details
    }
  

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-center text-gray-900 mb-2">
              Etwas ist schiefgelaufen
            </h2>
            <p className="text-gray-600 text-center mb-6">
              Wir entschuldigen uns für die Unannehmlichkeiten. Bitte laden Sie die Seite neu oder versuchen Sie es später erneut.
            </p>
            <div className="flex justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Seite neu laden
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

interface LoadingStateProps {
    text?: string;
    size?: 'small' | 'default' | 'large';
  }

// --- Loading State Component ---
const LoadingState: React.FC<LoadingStateProps> = ({ text = 'Loading...', size = 'default' }) => {
  const getSpinnerSize = () => {
    switch (size) {
      case 'small': return 'h-4 w-4';
      case 'large': return 'h-10 w-10';
      default: return 'h-6 w-6';
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'small': return 'text-xs';
      case 'large': return 'text-lg';
      default: return 'text-sm';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <svg
        className={`animate-spin text-blue-600 ${getSpinnerSize()}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      {text && <p className={`mt-3 text-gray-600 ${getTextSize()}`}>{text}</p>}
    </div>
  );
};

// --- Slot Detail View Component ---
const SlotDetailView: React.FC<SlotDetailViewProps> = ({ slot, onGoToBooking, onClose }) => {
    if (!slot) return null; //

    const formatPhone = (phone: string | null | undefined): string | null => {
        if (!phone) return null;
        const cleaned = phone.replace(/\D/g, '');
        // Adjust formatting logic as needed
        if (cleaned.length === 10) { // US Example
          return `+1 (${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6)}`;
        }
        return phone;
      };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Back to list"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h2 className="text-lg font-semibold">Details</h2>
        <div className="w-7"></div>
      </div>

      <div className="w-full h-48 bg-gray-200 rounded-lg mb-4 overflow-hidden">
        {slot.imageUrl ? (
          <Image
          src={slot.imageUrl}
          alt={slot.name}
          width={500}
          height={300}
          className="w-full h-full object-cover"
        />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
        )}
      </div>

      <div className="flex-grow">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900">{slot.name}</h3>
          <div className="flex items-center mt-1">
            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">{slot.type}</span>
            {slot.subType && (
              <span className="ml-2 px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">{slot.subType}</span>
            )}
          </div>
        </div>

        <div className="space-y-3 mb-6">
          {slot.address && (
            <div className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-gray-800">{slot.address}</span>
            </div>
          )}

          {slot.phone && (
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <a href={`tel:${slot.phone}`} className="text-blue-600 hover:underline">
                {formatPhone(slot.phone) || slot.phone}
              </a>
            </div>
          )}

          {slot.website && (
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              <a
                href={slot.website.startsWith('http') ? slot.website : `https://${slot.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline truncate max-w-[220px]"
              >
                {slot.website.replace(/^https?:\/\/(www\.)?/, '')}
              </a>
            </div>
          )}
        </div>
      </div>

      <div className="mt-auto pt-4">
        <button
          onClick={onGoToBooking}
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

const BookingForm: React.FC<BookingFormProps> = ({ slotName, slotAddress, onBookingSuccess, onClose }) => {
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedTime, setSelectedTime] = useState<string>('');
    const [availableTimes, setAvailableTimes] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [step, setStep] = useState<number>(1);

    const [formValues, setFormValues] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        notes: ''
    });

    const bookingTimeSlots = useMemo(() => [
        '9:00', '9:30', '10:00', '10:30', '11:00', '11:30',
        '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
        '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
    ], []);

    useEffect(() => {
        if (!selectedDate) {
            setAvailableTimes([]);
            return;
        }

        setTimeout(() => {
            const filteredTimes = bookingTimeSlots.filter(() => Math.random() > 0.3);
            setAvailableTimes(filteredTimes);
        }, 300);
    }, [selectedDate, bookingTimeSlots]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormValues(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const resetForm = () => {
        setFormValues({
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            notes: ''
        });
    };

    const _today = new Date().toISOString().split('T')[0];

    const generateDates = () => {
        const dates = [];
        const now = new Date();

        for (let i = 0; i < 14; i++) {
            const date = new Date(now);
            date.setDate(date.getDate() + i);
            const formattedDate = date.toISOString().split('T')[0];
            const dayName = new Intl.DateTimeFormat('de-DE', { weekday: 'short' }).format(date);
            const displayDate = `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}, ${dayName}`;

            dates.push({
                value: formattedDate,
                display: displayDate
            });
        }

        return dates;
    };

    const availableDates = generateDates();

    useEffect(() => {
        if (!selectedDate) {
            setAvailableTimes([]);
            return;
        }

        const timer = setTimeout(() => {
            const filteredTimes = bookingTimeSlots.filter(() => Math.random() > 0.3);
            setAvailableTimes(filteredTimes);
        }, 300);

        return () => clearTimeout(timer);
    }, [selectedDate, bookingTimeSlots]);

    const handleDateSelect = (date: string) => {
        setSelectedDate(date);
        setSelectedTime('');
    };

    const handleTimeSelect = (time: string) => {
        setSelectedTime(time);
    };

    const handleNextStep = () => {
        if (step === 1 && (!selectedDate || !selectedTime)) {
            setError('Bitte wählen Sie Datum und Uhrzeit aus.');
            return;
        }
        setError('');
        setStep(2);
    };

    const handlePrevStep = () => {
        setStep(1);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!formValues.firstName || !formValues.lastName || !formValues.email) {
            setError('Bitte füllen Sie alle Pflichtfelder aus.');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formValues.email)) {
            setError('Bitte geben Sie eine gültige E-Mail-Adresse ein.');
            return;
        }

        setError('');
        setIsSubmitting(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            const displayDate = new Date(selectedDate).toLocaleDateString('de-DE', {});
            onBookingSuccess(`Termin am ${displayDate} um ${selectedTime} Uhr erfolgreich gebucht.`);
            resetForm();
        } catch (err) {
            console.error('Booking error:', err);
            const errorMessage = 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.';
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        aria-label="Back to details"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </button>
                    <h2 className="text-lg font-semibold">Termin buchen</h2>
                    <div className="w-7"></div>
                </div>
            </div>

            <div className="mb-6">
                <h3 className="font-semibold text-gray-900">{slotName}</h3>
                <p className="text-sm text-gray-500">{slotAddress}</p>
            </div>

            <div className="flex items-center mb-6">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step === 1 ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-600'
                }`}>1</div>
                <div className="flex-grow h-0.5 mx-2 bg-gray-200"></div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step === 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>2</div>
            </div>

            {step === 1 && (
                <div className="flex-grow flex flex-col">
                    <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Datum auswählen</h4>
                        <div className="grid grid-cols-3 gap-2">
                            {availableDates.slice(0, 6).map((date) => (
                                <button
                                    key={date.value}
                                    onClick={() => handleDateSelect(date.value)}
                                    className={`py-2 px-1 rounded-md text-sm ${
                                        selectedDate === date.value
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                    }`}
                                >
                                    {date.display}
                                </button>
                            ))}
                        </div>
                    </div>

                    {selectedDate && (
                        <div>
                            <h4 className="font-medium text-gray-900 mb-2">Uhrzeit auswählen</h4>
                            {availableTimes.length === 0 ? (
                                <div className="flex items-center justify-center h-24 bg-gray-50 rounded-md">
                                    <div className="animate-pulse flex space-x-4">
                                        <div className="flex-1 space-y-4 py-1">
                                            <div className="h-4 bg-gray-300 rounded w-3/4 mx-auto"></div>
                                            <div className="space-y-2">
                                                <div className="h-4 bg-gray-300 rounded w-5/6 mx-auto"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-4 gap-2">
                                    {availableTimes.map((time) => (
                                        <button
                                            key={time}
                                            onClick={() => handleTimeSelect(time)}
                                            className={`py-2 px-3 rounded-md text-sm ${
                                                selectedTime === time
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                            }`}
                                        >
                                            {time}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {error && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                            {error}
                        </div>
                    )}

                    <div className="mt-auto pt-4">
                        <button
                            onClick={handleNextStep}
                            disabled={!selectedDate || !selectedTime}
                            className={`w-full py-3 font-medium rounded-md transition-colors duration-200 flex items-center justify-center ${
                                selectedDate && selectedTime
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            }`}
                        >
                            Weiter
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            {step === 2 && (
                <form onSubmit={handleSubmit} className="flex-grow flex flex-col">
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                                    Vorname *
                                </label>
                                <input
                                    type="text"
                                    id="firstName"
                                    name="firstName"
                                    value={formValues.firstName}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                                    Nachname *
                                </label>
                                <input
                                    type="text"
                                    id="lastName"
                                    name="lastName"
                                    value={formValues.lastName}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                E-Mail *
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formValues.email}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                                Telefon
                            </label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={formValues.phone}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                        </div>

                        <div>
                            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                                Anmerkungen
                            </label>
                            <textarea
                                id="notes"
                                name="notes"
                                value={formValues.notes}
                                onChange={handleChange}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            ></textarea>
                        </div>
                    </div>

                    <div className="mt-6 p-4 bg-gray-50 rounded-md">
                        <h4 className="font-medium text-gray-900 mb-2">Terminbestätigung</h4>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Datum:</span>
                            <span className="font-medium">
                                {new Date(selectedDate).toLocaleDateString('de-DE', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric'
                                })}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm mt-1">
                            <span className="text-gray-600">Uhrzeit:</span>
                            <span className="font-medium">{selectedTime} Uhr</span>
                        </div>
                    </div>

                    {error && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                            {error}
                        </div>
                    )}

                    <div className="mt-auto pt-4 grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={handlePrevStep}
                            className="py-3 border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors duration-200"
                        >
                            Zurück
                        </button>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`py-3 font-medium rounded-md transition-colors duration-200 flex items-center justify-center ${
                                isSubmitting
                                    ? 'bg-gray-400 text-white cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                        >
                            {isSubmitting ? (
                                <>
                                    <svg
                                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                    Verarbeitung...
                                </>
                            ) : (
                                'Termin buchen'
                            )}
                        </button>
                    </div>
                </form>
            )}
        </>
    );
};


// --- Data Processing Function ---
function processSlotData(): { allSlots: SlotData[], validSlots: SlotData[] } {
    let fallbackCounter = 0;
  
    // Use RawSlotItem for the item parameter
    const generateId = (item: RawSlotItem): string | number => {
      return item.id !== undefined && item.id !== null ? item.id : `fallback-${fallbackCounter++}`;
    };
  
    // Use RawSlotItem[] for the items array
    const mapDataSource = (items: RawSlotItem[], typeFallback: string, defaultCity: string): SlotData[] => {
      if (!items) {
        console.error(`[ERROR] No data for ${typeFallback}`);
        return [];
      }
  
      if (!Array.isArray(items)) {
        console.error(`[ERROR] Input for ${typeFallback} is not an array.`, typeof items);
        return [];
      }
  
      const mappedData = items.map((item) => {
        const processedItem = {
          id: generateId(item),
          lngLat: (typeof item.lon !== 'undefined' && item.lon !== null &&
                   typeof item.lat !== 'undefined' && item.lat !== null &&
                   !isNaN(Number(item.lon)) && !isNaN(Number(item.lat)))
            ? [Number(item.lon), Number(item.lat)] as [number, number]
            : undefined,
          name: item.name || `Unbenannt (${typeFallback})`,
          type: item.type || typeFallback,
          city: item.city || defaultCity,
          subType: item.subType || '',
          address: item.address || 'Keine Adresse',
          phone: item.phone || null,
          website: item.website || null,
        };
        
        return processedItem;
      });
      
      console.log(`[DEBUG] Mapped ${typeFallback}: ${mappedData.length} items`);
      return mappedData;
    };
  
    try {
      console.log('[DEBUG] Starting data processing...');
      
      // Debug log der importierten Daten
      console.log('[DEBUG] osmFriseure:', osmFriseure ? `${osmFriseure.length} items` : 'undefined');
      console.log('[DEBUG] osmGesundheit:', osmGesundheit ? `${osmGesundheit.length} items` : 'undefined');
      console.log('[DEBUG] osmGastro:', osmGastro ? `${osmGastro.length} items` : 'undefined');

      const sampledFriseure = mapDataSource(osmFriseure || [], 'Friseur', 'Zürich');
      const gesundheitSlots = mapDataSource(osmGesundheit || [], 'Gesundheit', 'Zürich');
      const gastroSlots = mapDataSource(osmGastro || [], 'Gastro', 'Zürich');
      
      const allSlots = [...sampledFriseure, ...gesundheitSlots, ...gastroSlots];
  
      const validSlots = allSlots.filter(slot => {
        const isValid = slot.lngLat &&
          Array.isArray(slot.lngLat) &&
          slot.lngLat.length === 2 &&
          typeof slot.lngLat[0] === 'number' &&
          typeof slot.lngLat[1] === 'number' &&
          slot.lngLat[0] !== 0 && 
          slot.lngLat[1] !== 0;
        
        if (!isValid && slot.name) {
          console.log(`[DEBUG] Invalid slot filtered out: ${slot.name}`, slot.lngLat);
        }
        
        return isValid;
      });
  
      console.log(`[DEBUG] Total slots: ${allSlots.length}, Valid slots: ${validSlots.length}`);
      
      // Log ein paar Beispiele
      if (validSlots.length > 0) {
        console.log('[DEBUG] First valid slot:', validSlots[0]);
      }
  
      return { allSlots, validSlots };
    } catch (error) {
      console.error('[ERROR] Failed to process slots data:', error);
      return { allSlots: [], validSlots: [] };
    }
}
  
  export default function Home() {
    // Hier kommen die State-Definitionen
    const [user, setUser] = useState<User | null>(null);
    const [isHeaderScrolled, setIsHeaderScrolled] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [selectedCity, setSelectedCity] = useState('Zürich');
    const [selectedCategory, setSelectedCategory] = useState('Alle');
    const [showMap, setShowMap] = useState(true);
    const [rightPanelView, setRightPanelView] = useState<'list' | 'detail' | 'booking'>('list');
    const [selectedSlotId, setSelectedSlotId] = useState<string | number | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<SlotData | null>(null);
    const [flyToCoords, setFlyToCoords] = useState<[number, number] | null>(null);
    const [bookingSuccessMessage, setBookingSuccessMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [_error, setError] = useState<string | null>(null);
  
    const router = useRouter();
    const pathname = usePathname();
  
    // Process Slot Data
    const { allSlots: _allSlots, validSlots } = useMemo(() => processSlotData(), []);
  
    // Filtered slots based on selection
    const filteredSlots = useMemo(() => {
      const debouncedQuery = searchQuery.trim().toLowerCase();
      
      return validSlots.filter((slot) => {
        // City filter
        if (slot.city !== selectedCity) return false;
        
        // Category filter
        if (selectedCategory !== 'Alle' && slot.type !== selectedCategory) return false;
        
        // Search query filter
        if (debouncedQuery) {
          return (
            slot.name.toLowerCase().includes(debouncedQuery) ||
            slot.type.toLowerCase().includes(debouncedQuery) ||
            (slot.address && slot.address.toLowerCase().includes(debouncedQuery))
          );
        }
        
        return true;
      });
    }, [validSlots, selectedCity, selectedCategory, searchQuery]);
  
    // Fetch bookings function
    const fetchBookings = useCallback(async () => {
      setIsLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        setIsLoading(false);
      } catch (_err) {
        console.error("Error fetching bookings:", _err);
        setError("Failed to load bookings");
        setIsLoading(false);
      }
    }, []);

  // --- UI Interaction Handlers ---
  const resetSelectionAndViews = useCallback(() => {
    setRightPanelView('list');
    setSelectedSlotId(null);
    setSelectedSlot(null);
    setFlyToCoords(null);
  }, []);

  const handleSearch = useCallback((query: string) => {
    if (!query.trim()) return;
  
    resetSelectionAndViews();
  
    const parts = query.trim().toLowerCase().split(/\s+/);
  
    // Find city and category in the query
    let foundCity: string | null = null;
    let foundCategory: string | null = null;
  
    parts.forEach(part => {
      // Try to match city
      const matchedCity = cities.find(c =>
        c.value.toLowerCase() === part ||
        c.value.toLowerCase().includes(part)
      );
  
      if (matchedCity && !foundCity) {
        foundCity = matchedCity.value;
      }
  
      // Try to match category
      const matchedCategory = categories.find(c =>
        c.toLowerCase() === part ||
        c.toLowerCase().includes(part)
      );
  
      if (matchedCategory && !foundCategory) {
        foundCategory = matchedCategory;
      }
    });
  
    // Set found values or keep defaults
    if (foundCity) setSelectedCity(foundCity);
    if (foundCategory) setSelectedCategory(foundCategory);
  
  }, [resetSelectionAndViews]);

  const handleAuthClick = useCallback(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    

    if (user.role === 'provider') {
      router.push('/dashboard/slots');
    } else {
      router.push('/profil');
    }
  }, [router, user]);

  const handleCategoryChange = useCallback((cat: string) => {
    resetSelectionAndViews();
    setSelectedCategory(prev => prev === cat ? 'Alle' : cat);
  }, [resetSelectionAndViews]);

  const handleShowSlotDetails = useCallback((id: string | number) => {
    try {
      const slot = validSlots.find(s => s.id === id);
      if (!slot) return;

      setSelectedSlot(slot);
      setSelectedSlotId(id);
      setRightPanelView('detail');

      if (Array.isArray(slot.lngLat) &&
          slot.lngLat.length === 2 &&
          typeof slot.lngLat[0] === 'number' &&
          typeof slot.lngLat[1] === 'number') {
        setFlyToCoords(slot.lngLat);
      }
    } catch (err) {
      console.error('[ERROR] Failed to show slot details:', err);
    }
  }, [validSlots]);

  const handleGoToBooking = useCallback(() => {
    if (selectedSlot) {
      setRightPanelView('booking');
    }
  }, [selectedSlot]);

  const handleGoToBookingFromList = useCallback((id: string | number, event: React.MouseEvent) => {
    try {
      event.stopPropagation();
      const slot = validSlots.find(s => s.id === id);
      if (!slot) return;

      setSelectedSlot(slot);
      setSelectedSlotId(id);
      setRightPanelView('booking');

      if (Array.isArray(slot.lngLat) &&
          slot.lngLat.length === 2) {
        setFlyToCoords(slot.lngLat);
      }
    } catch (err) {
      console.error('[ERROR] Failed to go to booking:', err);
    }
  }, [validSlots]);

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
    setBookingSuccessMessage(message);

    // Optimistic UI update
    setTimeout(() => {
      router.push('/success');
    }, 300);

    setTimeout(() => {
      setBookingSuccessMessage(null);
      resetSelectionAndViews();
      fetchBookings();
    }, 3000);
  }, [router, fetchBookings, resetSelectionAndViews]);

  const handleMapMoveEnd = useCallback(() => {
    setFlyToCoords(null);
  }, []);

  // --- Side Effects ---

  // Handle scroll for sticky header effects
  useEffect(() => {
    const handleScroll = () => {
      setIsHeaderScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Load user data from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('authToken');

        if (storedUser && token) {
          try {
            const userData = JSON.parse(storedUser);
            setUser(userData);
          } catch (_e) {
            localStorage.removeItem('user');
          }
        }
      } catch (_err) {
        console.error('[ERROR] Auth status check failed:', _err);
      }
    }
  }, [pathname]);

  
  // --- JSX for UI subcomponents ---
  
  const SearchBar = () => (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSearch(searchQuery);
      }}
      className="flex-grow max-w-xl mx-2 sm:mx-6 relative"
    >
      <input
        type="text"
        placeholder="z.B. Massage Zürich oder Berlin"
        className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none text-sm transition-shadow duration-200"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        aria-label="Search locations"
      />
      <button
        type="submit"
        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
        aria-label="Search"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>
    </form>
  );

  const AuthButton = () => (
    <button
      onClick={handleAuthClick}
      className={`flex items-center gap-2 px-3 sm:px-4 py-2 ${
        user
          ? 'bg-blue-600 text-white hover:bg-blue-700'
          : 'bg-black text-white hover:bg-gray-800'
      } rounded-md text-sm whitespace-nowrap transition-colors duration-200`}
      aria-label={user ? "Open profile" : "Login to account"}
    >
      {user ? (
        <>
          <span className="hidden sm:inline">{user.name ? user.name.split(' ')[0] : 'Profil'}</span>
          <div className="h-6 w-6 rounded-full bg-blue-400 flex items-center justify-center text-xs font-bold">
            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
        </>
      ) : (
        <>
          <span>Login</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
        </>
      )}
    </button>
  );

  interface SlotListItemProps {
    slot: SlotData;
    onSelect: (id: string | number) => void;
    onBookNow: (id: string | number, event: React.MouseEvent) => void;
  }

  const SlotListItem: React.FC<SlotListItemProps> = ({ slot, onSelect, onBookNow }) => {
    return (
      <div
        className={`border border-gray-200 rounded-lg px-4 py-3 flex justify-between items-center bg-white shadow-sm transition-all duration-150 hover:shadow-md hover:border-gray-300 ${
          selectedSlotId === slot.id ? 'ring-2 ring-blue-500' : ''
        }`}
        onClick={() => onSelect(slot.id)}
        >
        <div className="flex-grow mr-4 overflow-hidden">
            <h3 className="font-semibold text-base truncate">{slot.name}</h3>
            <div className="flex items-center text-xs text-gray-500 mt-1">
            {slot.subType && (
                <span className="inline-block mr-2 px-2 py-0.5 bg-gray-100 rounded-full">{slot.subType}</span>
            )}
            <span>{slot.type}</span>
            {slot.address && (
                <span className="ml-2 truncate">• {slot.address.split(',')[0]}</span>
            )}
            </div>
        </div>
        <button
            onClick={(e) => {
            e.stopPropagation();
            onBookNow(slot.id, e);
            }}
            className="ml-auto flex-shrink-0 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded whitespace-nowrap z-10 transition-colors duration-200"
            aria-label={`Book ${slot.name}`}
        >
            Buchen
        </button>
        </div>
    );
  };

  interface SuccessToastProps {
    message: string;
  }

  const SuccessToast: React.FC<SuccessToastProps> = ({ message }) => {
    return (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-3 rounded-lg shadow-xl z-50 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <span>{message}</span>
            <button
                onClick={() => setBookingSuccessMessage(null)}
                className="ml-3 text-white hover:text-gray-200"
                aria-label="Close notification"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
            </div>
    );
  };

  // --- Main JSX Rendering ---
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-white text-gray-900 flex flex-col">
        {/* Header - Mobile optimiert */}
        <header
          className={`flex items-center justify-between px-4 sm:px-6 py-3 border-b bg-white sticky top-0 z-20 transition-all duration-300 ${
            isHeaderScrolled ? 'shadow-md' : 'shadow-sm'
          }`}
        >
          <div className="flex items-center">
          <Link
            href="/"
            className="font-bold text-black text-lg flex-shrink-0"
          >   
            Nowly
          </Link>
          </div>

          {/* Desktop Suchleiste */}
          <div className="hidden md:flex flex-grow max-w-xl mx-2 sm:mx-6">
            <SearchBar />
          </div>

          {/* Mobile Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900"
              aria-label={isMobileMenuOpen ? "Suche schließen" : "Suche öffnen"}
            >
              {isMobileMenuOpen ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              )}
            </button>
            <AuthButton />
          </div>
        </header>

        {/* Mobile Search & Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-b shadow-lg p-4">
            <SearchBar />
          </div>
        )}

        {/* Main Content */}
        <main className="flex-grow">
          {/* Hero Section - Mobile optimiert */}
          <section className="px-4 py-8 sm:px-6 sm:py-12 bg-gradient-to-b from-gray-50 to-white">
            <div className="max-w-5xl mx-auto text-center">
              <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold text-gray-900 mb-4 sm:mb-6">
                Book what&apos;s free <span className="text-blue-600">now</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-700 mb-6 sm:mb-8 max-w-2xl mx-auto">
                Find and book available slots in your area instantly. No waiting, no callbacks.
              </p>

              {/* Category Filter - Mobile scrollable */}
              <div className="overflow-x-auto pb-4 -mx-4 px-4">
                <div className="flex gap-2 min-w-max justify-center md:flex-wrap">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => handleCategoryChange(cat)}
                      className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border text-sm transition-colors duration-200 whitespace-nowrap ${
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
              </div>
            </div>
          </section>

          {/* Map and Results Section - Mobile optimiert */}
          <section className="px-4 sm:px-6 pb-8 sm:pb-16">
            <div className="max-w-7xl mx-auto">
              {/* Mobile Toggle Buttons */}
              <div className="lg:hidden flex gap-2 mb-4">
                <button
                  onClick={() => setShowMap(true)}
                  className={`flex-1 py-2 rounded-md border text-sm font-medium ${
                    showMap 
                      ? 'bg-blue-600 text-white border-blue-600' 
                      : 'bg-white text-gray-700 border-gray-300'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  Karte
                </button>
                <button
                  onClick={() => setShowMap(false)}
                  className={`flex-1 py-2 rounded-md border text-sm font-medium ${
                    !showMap 
                      ? 'bg-blue-600 text-white border-blue-600' 
                      : 'bg-white text-gray-700 border-gray-300'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  Liste
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Left Column: Map */}
                <div className={`lg:col-span-3 ${showMap ? 'block' : 'hidden'} lg:block`}>
                  <div className="h-[400px] sm:h-[500px] md:h-[calc(100vh-400px)] min-h-[300px] rounded-xl overflow-hidden shadow-lg relative bg-gray-100">
                  <Map
                    city={selectedCity}
                    slots={filteredSlots.filter((slot): slot is SlotData & { lngLat: [number, number] } => 
                        slot.lngLat !== undefined
                    )}
                    onSlotSelect={handleShowSlotDetails}
                    selectedSlotId={selectedSlotId}
                    flyToCoords={flyToCoords}
                    onMapMoveEnd={handleMapMoveEnd}
                  />
                  </div>
                </div>

                {/* Right Column: Dynamic Content */}
                <div className={`lg:col-span-2 ${!showMap ? 'block' : 'hidden'} lg:block`}>
                  <div className="h-[400px] sm:h-[500px] md:h-[calc(100vh-400px)] min-h-[300px] rounded-xl bg-white shadow-lg p-4 overflow-y-auto flex flex-col">
                    {isLoading ? (
                      <LoadingState text="Loading data..." />
                    ) : (
                      <>
                        {rightPanelView === 'list' && (
                          <div className="flex flex-col gap-3">
                            <div className="flex justify-between items-center mb-2">
                              <h2 className="font-semibold text-base sm:text-lg">
                                {filteredSlots.length} Verfügbare Termine
                              </h2>
                              <div className="text-xs sm:text-sm text-gray-500">
                                {selectedCity}
                              </div>
                            </div>

                            {filteredSlots.length === 0 ? (
                              <div className="text-center py-8 sm:py-12">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-gray-400 mb-3 sm:mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-gray-500 mb-2 text-sm sm:text-base">Keine Einträge gefunden.</p>
                                <p className="text-xs sm:text-sm text-gray-400">Versuche andere Filter oder eine neue Suche.</p>
                              </div>
                            ) : (
                              <div className="flex flex-col gap-3">
                                {filteredSlots.map((slot) => (
                                  <SlotListItem
                                    key={`${slot.id}-${slot.type}`}
                                    slot={slot}
                                    onSelect={handleShowSlotDetails}
                                    onBookNow={handleGoToBookingFromList}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {rightPanelView === 'detail' && selectedSlot && (
                          <SlotDetailView
                            slot={selectedSlot}
                            onGoToBooking={handleGoToBooking}
                            onClose={handleCloseDetailView}
                          />
                        )}

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
                </div>
              </div>
            </div>
          </section>

          {/* Features Section - Mobile optimiert */}
          <section className="py-12 sm:py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">How Nowly Works</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
                <div className="bg-white p-6 rounded-xl shadow-sm text-center">
                  <div className="bg-blue-100 rounded-full w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2">Find</h3>
                  <p className="text-sm sm:text-base text-gray-600">Discover available appointments nearby based on your location and preferences.</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm text-center">
                  <div className="bg-blue-100 rounded-full w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2">Book</h3>
                  <p className="text-sm sm:text-base text-gray-600">Schedule appointments instantly with just a few clicks, no phone calls needed.</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm text-center">
                  <div className="bg-blue-100 rounded-full w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2">Enjoy</h3>
                  <p className="text-sm sm:text-base text-gray-600">Show up to your appointment hassle-free with automatic confirmation and reminders.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Testimonials Section - Mobile optimiert */}
          <section className="py-12 sm:py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4">What Our Users Say</h2>
              <p className="text-sm sm:text-base text-gray-600 text-center mb-8 sm:mb-12 max-w-2xl mx-auto">Real experiences from people who use Nowly to make their lives easier.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {/* Testimonial Cards - optimiert für mobile Ansicht */}
              </div>
            </div>
          </section>

          {/* CTA Section - Mobile optimiert */}
          <section className="py-12 sm:py-16 bg-blue-600 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Ready to simplify your scheduling?</h2>
              <p className="text-lg sm:text-xl max-w-2xl mx-auto mb-6 sm:mb-8">Join thousands of users who are saving time and finding the perfect appointments with Nowly.</p>
              <button className="bg-white text-blue-600 px-6 py-3 rounded-md font-semibold text-base sm:text-lg hover:bg-gray-100 transition-colors duration-200">
                Get Started
              </button>
            </div>
          </section>
        </main>

        {/* Footer - Mobile optimiert */}
        <footer className="bg-gray-800 text-white py-8 sm:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {/* Footer Columns - 2 Spalten auf Mobile, 4 auf Desktop */}
            </div>

            <div className="border-t border-gray-700 mt-8 sm:mt-12 pt-6 sm:pt-8 flex flex-col sm:flex-row justify-between items-center">
              <p className="text-gray-400 text-xs sm:text-sm text-center sm:text-left mb-4 sm:mb-0">&copy; {new Date().getFullYear()} Nowly. All rights reserved.</p>
              <div className="flex space-x-4">
                {/* Social Icons */}
              </div>
            </div>
          </div>
        </footer>

        {/* Success Toast */}
        {bookingSuccessMessage && (
          <SuccessToast message={bookingSuccessMessage} />
        )}
       </div>
    </ErrorBoundary>
  );
}