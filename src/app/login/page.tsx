'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
            setError(data.error || 'Anmeldung fehlgeschlagen.');
            return;
        }

        // ✅ Daten speichern (optional)
        localStorage.setItem('user', JSON.stringify(data.user));

        // 👉 Weiterleitung nach erfolgreichem Login
        router.push('/partner/slots');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <div className="bg-white p-8 rounded-md shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Anmelden</h2>
                {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="email"
                        placeholder="E-Mail"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full border px-3 py-2 rounded"
                    />
                    <input
                        type="password"
                        placeholder="Passwort"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full border px-3 py-2 rounded"
                    />
                    <button
                        type="submit"
                        className="w-full bg-black text-white py-2 rounded hover:bg-gray-900 transition"
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
}
