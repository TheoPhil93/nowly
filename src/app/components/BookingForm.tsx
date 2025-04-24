'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface BookingFormProps {
  slotId: string | number; // Changed from just 'number' to 'string | number'
  slotName: string;
  slotAddress?: string;
  onBookingSuccess: (message: string) => void;
  onClose: () => void;
}

const BookingForm: React.FC<BookingFormProps> = ({
  slotId,
  slotName,
  slotAddress,
  onBookingSuccess,
  onClose,
}) => {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Login-Prüfung & Buchen nur wenn eingeloggt
  const handleBooking = () => {
    const isLoggedIn = !!localStorage.getItem('token'); // oder session prüfen

    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

    // Manuelles Submit, damit handleSubmit korrekt aufgerufen wird
    if (formRef.current) {
      formRef.current.requestSubmit();
    }
  };

  // Formular-Submit (nur wenn eingeloggt)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const bookingDetails = { slotId, name, email, phone, date, time };

    try {
      const response = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingDetails),
      });

      const data = await response.json();

      if (response.ok) {
        const successInfo = {
          slotId,
          slotName,
          slotAddress,
          name,
          date,
          time,
        };
        localStorage.setItem('lastBooking', JSON.stringify(successInfo));
        onBookingSuccess('Buchung erfolgreich!');
      } else {
        setErrorMessage(data.error || 'Buchung fehlgeschlagen. Bitte versuche es erneut.');
      }
    } catch (error) {
      console.error('Booking submission error:', error);
      setErrorMessage('Ein Netzwerkfehler ist aufgetreten. Bitte prüfe deine Verbindung.');
    }
  };

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (formRef.current) {
      const firstFocusable = formRef.current.querySelector<HTMLElement>(
        'input:not([disabled]), textarea:not([disabled]), select:not([disabled])'
      );
      firstFocusable?.focus();
    }
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Termin buchen:</h2>
          <p className="text-md text-gray-600">{slotName}</p>
          {slotAddress && <p className="text-sm text-gray-500">{slotAddress}</p>}
        </div>
        <button
          type="button"
          className="text-gray-400 hover:text-gray-600"
          onClick={handleClose}
          aria-label="Schließen"
        >
          <svg className="h-6 w-6 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {/* Formular */}
      <form
        id="booking-form-element"
        onSubmit={handleSubmit}
        ref={formRef}
        className="flex-grow overflow-y-auto space-y-3 pr-2"
      >
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            id="name"
            className="form-input block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            id="email"
            className="form-input block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Telefon (Optional)</label>
          <input
            type="tel"
            id="phone"
            className="form-input block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Datum</label>
            <input
              type="date"
              id="date"
              className="form-input block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">Uhrzeit</label>
            <input
              type="time"
              id="time"
              className="form-input block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
          </div>
        </div>

        {errorMessage && (
          <p className="text-red-600 text-sm">{errorMessage}</p>
        )}
      </form>

      {/* Button-Gruppe */}
      <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-200">
        <button
          type="button"
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 border border-gray-300 text-sm"
          onClick={handleClose}
        >
          Zurück
        </button>
        <button
          type="button"
          onClick={handleBooking}
          className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 text-sm"
        >
          Buchen
        </button>
      </div>
    </div>
  );
};

export default BookingForm;