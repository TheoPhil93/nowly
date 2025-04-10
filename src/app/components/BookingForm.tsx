'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';

interface BookingFormProps {
    slotId: number;
    slotName: string;
    slotAddress?: string;
    onBookingSuccess: (message: string) => void;
    onClose: () => void;
}

const BookingForm: React.FC<BookingFormProps> = ({ slotId, slotName, slotAddress, onBookingSuccess, onClose }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
   const formRef = useRef<HTMLFormElement>(null);
   const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
    
        const bookingDetails = {
            slotId,
            name,
            email,
            phone,
            date,
            time,
        };
    
        try {
            const response = await fetch('/api/book', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
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
                
                setErrorMessage(null);
                onBookingSuccess('Buchung erfolgreich!');
                formRef.current?.reset();
            } else {
                setErrorMessage(data.error || 'Buchung fehlgeschlagen');
            }
        } catch (error) {
            console.error(error);
            alert('Ein Fehler ist aufgetreten.');
        }
    };

    const handleClose = useCallback(() => {
        onClose();
    }, [onClose]);

    useEffect(() => {
        if (formRef.current) {
            const firstInput = formRef.current.querySelector('input');
            firstInput?.focus();
        }
    }, []);

    return (
        <div className="booking-form-overlay fade-in">
            <div className="booking-form-container">
                <div className="booking-form-header">
                    <h2 className="booking-form-title">Buche deinen Termin</h2>
                    <button type="button" className="booking-form-close-button" onClick={handleClose}>
                        <svg className="h-6 w-6 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                            <path
                                fillRule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="booking-form" ref={formRef}>
                    <div className="form-group">
                        <label htmlFor="name" className="form-label">Name</label>
                        <input type="text" id="name" className="form-input" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email" className="form-label">Email</label>
                        <input type="email" id="email" className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="phone" className="form-label">Telefon</label>
                        <input type="tel" id="phone" className="form-input" value={phone} onChange={(e) => setPhone(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="date" className="form-label">Datum</label>
                        <input type="date" id="date" className="form-input" value={date} onChange={(e) => setDate(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="time" className="form-label">Uhrzeit</label>
                        <input type="time" id="time" className="form-input" value={time} onChange={(e) => setTime(e.target.value)} required />
                    </div>
                    <div className="button-group">
                        <button type="button" className="secondary-button" onClick={handleClose}>Zurück</button>
                        <button type="submit" className="primary-button">Buchen</button>
                    </div>
                        {errorMessage && (
                            <p className="text-red-600 text-sm mt-4">{errorMessage}</p>
                        )}
                </form>
            </div>
        </div>
    );
};

export default BookingForm;
