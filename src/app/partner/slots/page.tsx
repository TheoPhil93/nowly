'use client';

import { useState } from 'react';

function SlotCreatorPage() {
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [type, setType] = useState('Friseur');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [duration, setDuration] = useState('30');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuccess(false);

        const res = await fetch('/api/slots', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, address, type, date, time, duration }),
        });

        if (res.ok) {
            setSuccess(true);
            setName('');
            setAddress('');
            setDate('');
            setTime('');
            setDuration('30');
        } else {
            alert('Fehler beim Erstellen des Slots');
        }
    };

    return (
        <div className="max-w-md mx-auto p-6 mt-10 border border-white/20 rounded-xl shadow-md text-white bg-black">
            <h2 className="text-xl font-bold text-white">Slot erstellen</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" placeholder="Name des Geschäfts" value={name} onChange={(e) => setName(e.target.value)} required className="w-full border border-gray-400 text-white bg-transparent px-3 py-2 rounded placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white" />
                <input type="text" placeholder="Adresse" value={address} onChange={(e) => setAddress(e.target.value)} required className="w-full border border-gray-400 text-white bg-transparent px-3 py-2 rounded placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white" />
                <select value={type} onChange={(e) => setType(e.target.value)} className="w-full border border-gray-400 text-white bg-transparent px-3 py-2 rounded placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white">
                    <option>Friseur</option>
                    <option>Arzt</option>
                    <option>Massage</option>
                    <option>Gastro</option>
                </select>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="w-full border border-gray-400 text-white bg-transparent px-3 py-2 rounded placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white" />
                <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required className="w-full border border-gray-400 text-white bg-transparent px-3 py-2 rounded placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white" />
                <input type="number" placeholder="Dauer in Minuten" value={duration} onChange={(e) => setDuration(e.target.value)} required className="w-full border border-gray-400 text-white bg-transparent px-3 py-2 rounded placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white" />
                <button type="submit" className="w-full border border-gray-400 text-white bg-transparent px-3 py-2 rounded placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white">Slot erstellen</button>
                {success && <p className="w-full border border-gray-400 text-white bg-transparent px-3 py-2 rounded placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white">Slot wurde erfolgreich erstellt.</p>}
            </form>
        </div>
    );
}

export default SlotCreatorPage;
