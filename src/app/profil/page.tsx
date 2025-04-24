// src/app/profil/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react'; // useCallback hinzugefügt
import { useRouter } from 'next/navigation';
import React from 'react';

// --- Typdefinitionen ---
interface User {
    id?: string | number; name?: string; email?: string; password?: string; phone?: string;
    country?: string; birthday?: string; gender?: string; role?: string;
}
interface Booking {
    id: number; name: string; date: string; time: string; address: string;
}
interface ProviderManagedSlot {
    id: number; title: string; date: string; time: string; address: string;
}

// Interface für updatedUserData hinzugefügt
interface UpdatedUserData extends User {
    password?: string; // Explizit als optional deklariert
}

// --- Die Komponente ---
export default function ProfilPage() {
    // States mit Typen
    const [user, setUser] = useState<User | null>(null);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [editMode, setEditMode] = useState(false); // Edit-Mode State wieder aktiv
    const [editedUser, setEditedUser] = useState({ // State für bearbeitete Daten
        name: '', email: '', password: '', phone: '',
        country: '', birthday: '', gender: '', role: '',
    });
    const [slots, setSlots] = useState<ProviderManagedSlot[]>([]); // State für Provider-Slots
    const [newSlot, setNewSlot] = useState({ title: '', date: '', time: '', address: '' }); // State für neues Slot-Formular

    const router = useRouter();

    // Effekt zum Laden der User-Daten und Beispiel-Buchungen/Slots
    useEffect(() => {
        const userDataString = localStorage.getItem('user');
        if (!userDataString || userDataString === 'undefined') {
            console.log("Keine User-Daten im localStorage, leite zu Login weiter.");
            router.push('/login');
        } else {
            try {
                const parsedUser = JSON.parse(userDataString) as User;
                setUser(parsedUser);
                // Initialisiere editedUser basierend auf geparsten Daten
                setEditedUser({
                    name: parsedUser.name || '', email: parsedUser.email || '', password: '',
                    phone: parsedUser.phone || '', country: parsedUser.country || '',
                    birthday: parsedUser.birthday || '', gender: parsedUser.gender || '',
                    role: parsedUser.role || '',
                });
                // Beispiel-Buchungen (ersetze durch echten API-Aufruf)
                setBookings([
                    { id: 1, name: 'Massage bei BodyCare', date: '2025-04-25', time: '14:30', address: 'Langstrasse 15, Zürich' },
                    { id: 2, name: 'Zahnarzttermin', date: '2025-05-02', time: '10:00', address: 'Limmatplatz 3, Zürich' },
                ]);
                 // Beispiel-Slots für Provider (ersetze durch echten API-Aufruf)
                if (parsedUser.role === 'provider') {
                     setSlots([ { id: 1, title: 'Freier Slot Vormittag', date: '2025-04-28', time: '10:00', address: 'Eigene Praxis' } ]);
                }
            } catch (e) { // <-- Linter wird angewiesen, ungenutztes 'e' hier zu ignorieren
                console.error('Fehler beim Parsen von localStorage user in Profil:', e);
                localStorage.removeItem('user');
                localStorage.removeItem('authToken');
                router.push('/login');
            }
        }
    }, [router]);

    // --- Handler-Funktionen (mit Logik) ---
    const handleLogout = useCallback(() => {
        console.log("Logging out...");
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
        setUser(null); // User-State zurücksetzen
        router.push('/'); // Zur Startseite
    }, [router]);

    const handleInputChange = useCallback((field: keyof typeof editedUser, value: string) => {
        setEditedUser(prev => ({ ...prev, [field]: value }));
    }, []);

    const handleSaveSettings = useCallback(async () => { // Async falls API-Call
        console.log("Saving settings...", editedUser);
        // TODO: Hier API-Aufruf zum Speichern der User-Daten im Backend einfügen!
        // Annahme: Backend gibt aktualisierten User zurück oder wir nehmen die lokalen Änderungen
        const updatedUserData: UpdatedUserData = { ...user, ...editedUser };
        
        // Passwort nur senden/speichern, wenn es geändert wurde (und idealerweise gehasht)
        if (!editedUser.password) {
            // ESLint-Warnung deaktivieren
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { password, ...dataWithoutPassword } = updatedUserData;
            setUser(dataWithoutPassword as User); // State aktualisieren
            localStorage.setItem('user', JSON.stringify(dataWithoutPassword)); // localStorage aktualisieren
        } else {
            // Hier Logik zum Hashen des neuen Passworts vor dem Senden ans Backend
            console.warn("Passwort-Update Logik nicht implementiert!");
            // ESLint-Warnung deaktivieren
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { password, ...dataWithoutPassword } = updatedUserData;
            setUser(dataWithoutPassword as User); // State aktualisieren
            localStorage.setItem('user', JSON.stringify(dataWithoutPassword)); // localStorage aktualisieren
        }

        setEditMode(false); // Edit-Modus beenden
        alert("Einstellungen gespeichert (lokal)!"); // Feedback (später bessere UI)
    }, [user, editedUser]);

    const handleCancelBooking = useCallback((id: number) => {
        console.log(`Cancelling booking ${id}`);
        // TODO: Hier API-Aufruf zum Stornieren der Buchung im Backend einfügen!
        setBookings(prev => prev.filter(b => b.id !== id)); // Lokal entfernen
        alert(`Buchung ${id} storniert (lokal)!`); // Feedback
    }, []);

    const handleBack = useCallback(() => { router.push('/'); }, [router]);

    const handleSlotInput = useCallback((field: keyof typeof newSlot, value: string) => {
        setNewSlot(prev => ({ ...prev, [field]: value }));
    }, []);

    const handleAddSlot = useCallback(async () => { // Async falls API-Call
        if (!newSlot.title || !newSlot.date || !newSlot.time || !newSlot.address) return;
        console.log("Adding new slot:", newSlot);
        // TODO: Hier API-Aufruf zum Speichern des Slots im Backend einfügen!
        // Annahme: Backend gibt neuen Slot mit ID zurück
        const newId = Date.now(); // Simple temporäre ID
        const slotToAdd: ProviderManagedSlot = { ...newSlot, id: newId };
        setSlots(prev => [...prev, slotToAdd]); // Lokal hinzufügen
        setNewSlot({ title: '', date: '', time: '', address: '' }); // Formular leeren
        alert("Slot hinzugefügt (lokal)!"); // Feedback
    }, [newSlot]);

    // Ladeanzeige
    if (!user) { return <div className="p-4 text-center">Lade Profil...</div>; }

    // --- JSX Rendering (Vervollständigt) ---
    return (
        <div className="min-h-screen bg-white text-gray-900 px-4 py-12">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Hallo {user.name || '👋'}</h1>
                        <p className="text-gray-600">Willkommen in deinem Profilbereich.</p>
                    </div>
                    <button onClick={handleBack} className="text-sm underline text-blue-600 hover:text-blue-800">Zurück zur Startseite</button>
                </div>

                {/* Buchungen */}
                <section className="mb-10 p-6 border rounded-lg shadow-md bg-gray-50">
                    <h2 className="text-xl font-semibold mb-4 text-gray-700">🗕️ Deine Buchungen</h2>
                    {bookings.length === 0 ? (
                        <p className="text-gray-500 italic">Du hast derzeit keine aktiven Buchungen.</p>
                    ) : (
                        <ul className="space-y-4">
                            {bookings.map((b: Booking) => (
                                <li key={b.id} className="border rounded-md px-4 py-3 shadow-sm bg-white">
                                    {/* Anzeige der Buchungsdetails */}
                                    <p className="font-medium text-gray-800">{b.name}</p>
                                    <p className="text-sm text-gray-600">Wann: {b.date} um {b.time} Uhr</p>
                                    <p className="text-sm text-gray-500 mb-2">Wo: {b.address}</p>
                                    <button
                                        onClick={() => handleCancelBooking(b.id)}
                                        className="text-red-600 hover:text-red-800 text-sm underline"
                                    >
                                        Buchung stornieren
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                {/* Einstellungen */}
                <section className="mb-10 p-6 border rounded-lg shadow-md bg-gray-50">
                    <h2 className="text-xl font-semibold mb-4 text-gray-700">⚙️ Einstellungen</h2>
                    {!editMode ? (
                        // Anzeige-Modus
                        <div className="space-y-3">
                            <p className="text-sm text-gray-600">Name: <span className="font-medium text-gray-900">{user.name || '-'}</span></p>
                            <p className="text-sm text-gray-600">E-Mail: <span className="font-medium text-gray-900">{user.email || '-'}</span></p>
                            <p className="text-sm text-gray-600">Mobilnummer: <span className="font-medium text-gray-900">{user.phone || '-'}</span></p>
                            <p className="text-sm text-gray-600">Land: <span className="font-medium text-gray-900">{user.country || '-'}</span></p>
                            <p className="text-sm text-gray-600">Geburtstag: <span className="font-medium text-gray-900">{user.birthday || '-'}</span></p>
                            <p className="text-sm text-gray-600">Geschlecht: <span className="font-medium text-gray-900">{user.gender || '-'}</span></p>
                            <div className="flex gap-3 mt-4">
                                <button
                                    onClick={() => setEditMode(true)} // Ruft setEditMode auf
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm"
                                >
                                    Bearbeiten
                                </button>
                                <button
                                    onClick={handleLogout} // Ruft handleLogout auf
                                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    ) : (
                        // Bearbeitungs-Modus
                        <div className="space-y-4">
                             {/* Input-Felder rufen handleInputChange auf */}
                            <input type="text" placeholder="Name" value={editedUser.name} onChange={(e) => handleInputChange('name', e.target.value)} className="w-full border px-3 py-2 rounded-md shadow-sm" />
                            <input type="email" placeholder="E-Mail" value={editedUser.email} onChange={(e) => handleInputChange('email', e.target.value)} className="w-full border px-3 py-2 rounded-md shadow-sm" />
                            <input type="text" placeholder="Mobilnummer" value={editedUser.phone} onChange={(e) => handleInputChange('phone', e.target.value)} className="w-full border px-3 py-2 rounded-md shadow-sm" />
                            <input type="text" placeholder="Land" value={editedUser.country} onChange={(e) => handleInputChange('country', e.target.value)} className="w-full border px-3 py-2 rounded-md shadow-sm" />
                            <input type="date" placeholder="Geburtstag" value={editedUser.birthday} onChange={(e) => handleInputChange('birthday', e.target.value)} className="w-full border px-3 py-2 rounded-md shadow-sm" />
                            <select value={editedUser.gender} onChange={(e) => handleInputChange('gender', e.target.value)} className="w-full border px-3 py-2 rounded-md shadow-sm bg-white">
                                <option value="">Geschlecht wählen</option> <option value="männlich">Männlich</option>
                                <option value="weiblich">Weiblich</option> <option value="divers">Divers</option>
                            </select>
                            <input type="password" placeholder="Neues Passwort (optional)" value={editedUser.password} onChange={(e) => handleInputChange('password', e.target.value)} className="w-full border px-3 py-2 rounded-md shadow-sm" />
                            <div className="flex gap-3 pt-2">
                                <button onClick={handleSaveSettings} className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 text-sm">Speichern</button>
                                <button onClick={() => setEditMode(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm">Abbrechen</button>
                            </div>
                        </div>
                    )}
                </section>

                {/* Slot Verwaltung (nur für Provider) */}
                {user.role === 'provider' && (
                    <section className="mb-10 p-6 border rounded-lg shadow-md bg-gray-50">
                        <h2 className="text-xl font-semibold mb-4 text-gray-700">🗓️ Eigene Slots verwalten</h2>
                        <div className="space-y-4">
                            {/* Formular zum Hinzufügen */}
                            <div className="flex flex-col sm:flex-row gap-2 items-end">
                                <input type="text" placeholder="Titel des Slots" value={newSlot.title} onChange={(e) => handleSlotInput('title', e.target.value)} className="flex-grow border px-3 py-2 rounded-md shadow-sm" />
                                <input type="date" value={newSlot.date} onChange={(e) => handleSlotInput('date', e.target.value)} className="border px-3 py-2 rounded-md shadow-sm bg-white" />
                                <input type="time" value={newSlot.time} onChange={(e) => handleSlotInput('time', e.target.value)} className="border px-3 py-2 rounded-md shadow-sm bg-white" />
                                <input type="text" placeholder="Adresse (optional)" value={newSlot.address} onChange={(e) => handleSlotInput('address', e.target.value)} className="flex-grow border px-3 py-2 rounded-md shadow-sm" />
                                <button onClick={handleAddSlot} className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 text-sm self-end whitespace-nowrap">Slot hinzufügen</button>
                            </div>
                            {/* Liste der eigenen Slots */}
                            <h3 className="text-lg font-medium pt-4 text-gray-700">Erstellte Slots:</h3>
                            {slots.length === 0 ? (
                                <p className="text-gray-500 italic">Noch keine Slots erstellt.</p>
                             ) : (
                                <ul className="space-y-2">
                                    {slots.map((slot: ProviderManagedSlot) => (
                                        <li key={slot.id} className="border px-4 py-3 rounded shadow-sm bg-white">
                                            <p className="font-medium">{slot.title}</p>
                                            <p className="text-sm text-gray-600">{slot.date} um {slot.time} Uhr</p>
                                            <p className="text-sm text-gray-500">{slot.address}</p>
                                             {/* Optional: Button zum Löschen/Bearbeiten von Slots */}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}