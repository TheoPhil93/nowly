'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface BookingInfo {
    slotId: number;
    slotName: string;
    slotAddress?: string;
    name: string;
    date: string;
    time: string;
}

export default function SuccessPage() {
    const router = useRouter();
    const [bookingData, setBookingData] = useState<BookingInfo | null>(null);

    useEffect(() => {
        const stored = localStorage.getItem('lastBooking');
        if (stored) {
            setBookingData(JSON.parse(stored));
        }
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-white px-4">
            <div className="bg-white border border-gray-200 p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
                <h1 className="text-3xl font-bold text-gray-700 mb-4">Buchung erfolgreich!</h1>
                {bookingData ? (
                    <div className="text-gray-700 text-sm space-y-2 mb-6">
                        <p><span className="font-medium">Ort:</span> {bookingData.slotName}</p>
                        {bookingData.slotAddress && (
                            <p><span className="font-medium">Adresse:</span> {bookingData.slotAddress}</p>
                        )}
                        <p><span className="font-medium">Name:</span> {bookingData.name}</p>
                        <p><span className="font-medium">Datum:</span> {bookingData.date}</p>
                        <p><span className="font-medium">Uhrzeit:</span> {bookingData.time}</p>
                    </div>
                ) : (
                    <p className="text-gray-500 mb-6">Keine Buchungsdaten gefunden.</p>
                )}
                <button
                    onClick={() => {
                        localStorage.removeItem('lastBooking');
                        router.push('/');
                    }}
                    className="px-4 py-2 bg-gray-700 text-white text-sm rounded hover:bg-gray-900 transition"
                >
                    Zurück zur Startseite
                </button>
            </div>
        </div>
    );
}
