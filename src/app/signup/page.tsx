'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'user' | 'provider'>('user');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const res = await fetch('/api/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, role }),
        });

        const data = await res.json();

        if (!res.ok) {
            setError(data.message || 'Registrierung fehlgeschlagen.');
            return;
        }

        // Speichere User-Daten lokal
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('authToken', data.token); // falls du später mit Token arbeitest

        // Weiterleitung zur Startseite
        router.push('/');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-white px-4">
            <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md border border-gray-200">
                <h2 className="text-3xl font-bold text-center mb-6 text-gray-900">Jetzt registrieren</h2>
                {error && <p className="text-red-600 text-sm mb-4 text-center">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <input
                        type="text"
                        placeholder="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full border px-4 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-300 focus:outline-none"
                    />
                    <input
                        type="email"
                        placeholder="E-Mail-Adresse"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full border px-4 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-300 focus:outline-none"
                    />
                    <input
                        type="password"
                        placeholder="Passwort"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full border px-4 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-300 focus:outline-none"
                    />
                    <div className="flex flex-col gap-2 text-sm text-gray-700">
                        <label className="font-medium">Ich bin:</label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    name="role"
                                    value="user"
                                    checked={role === 'user'}
                                    onChange={() => setRole('user')}
                                />
                                Nutzer:in
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    name="role"
                                    value="provider"
                                    checked={role === 'provider'}
                                    onChange={() => setRole('provider')}
                                />
                                Dienstleister:in
                            </label>
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition text-sm font-medium"
                    >
                        Registrieren
                    </button>
                </form>
                <p className="text-sm text-center mt-4 text-gray-600">
                    Bereits ein Konto?{' '}
                    <a href="/login" className="text-blue-600 hover:underline">Jetzt anmelden</a>
                </p>
            </div>
        </div>
    );
}
