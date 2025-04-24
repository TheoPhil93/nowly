'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
        router.push('/');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <div className="bg-white p-8 rounded-md shadow-md w-full max-w-md relative">
                {/* X Button innerhalb der Box */}
                <div className="absolute top-4 right-4">
                    <Link href="/" className="text-gray-400 hover:text-gray-600" aria-label="Schließen">
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </Link>
                </div>
                
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
                    <p className="text-sm text-center mt-4 text-gray-600">
                        Noch kein Konto?{' '}
                        <a href="/signup" className="text-blue-600 hover:underline">
                            Jetzt registrieren
                        </a>
                    </p>
                </form>
            </div>
        </div>
    );
}