'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // Optional: Add validation here
            if (!email || !password) {
                setError('Bitte geben Sie E-Mail und Passwort ein.');
                setIsLoading(false);
                return;
            }

            // Try to fetch from API
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Anmeldung fehlgeschlagen.');
            }

            // Store authentication data properly
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('authToken', data.token || 'demo-token');

            // For demo purposes, if the API isn't set up yet, create a mock user
            if (!data.user) {
                const mockUser = {
                    id: '123',
                    name: `${email.split('@')[0]}`,
                    email: email,
                    role: 'user'
                };
                localStorage.setItem('user', JSON.stringify(mockUser));
                localStorage.setItem('authToken', 'mock-token-123');
            }

            // Reload the page to ensure all components update
            router.push('/');
            window.location.href = '/';
        } catch (err) {
            console.error('Login error:', err);
            setError(err instanceof Error ? err.message : 'Anmeldung fehlgeschlagen.');
        } finally {
            setIsLoading(false);
        }
    };

    // For testing/development only, to quickly log in
    const handleDemoLogin = (userType: 'user' | 'provider') => {
        let demoUser;
        if (userType === 'provider') {
            demoUser = {
                id: 'provider-123',
                name: 'Demo Provider',
                email: 'provider@example.com',
                role: 'provider'
            };
        } else {
            demoUser = {
                id: 'user-123',
                name: 'Demo User',
                email: 'user@example.com',
                role: 'user'
            };
        }

        // Wählen Sie hier aus, welchen Benutzer Sie testen möchten
        localStorage.setItem('user', JSON.stringify(demoUser));
        localStorage.setItem('authToken', 'demo-token-123');

        window.location.href = '/';
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

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            E-Mail
                        </label>
                        <input
                            id="email"
                            type="email"
                            placeholder="ihre@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full border border-gray-300 px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                            Passwort
                        </label>
                        <input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full border border-gray-300 px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="remember_me"
                                name="remember_me"
                                type="checkbox"
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="remember_me" className="ml-2 block text-sm text-gray-700">
                                Angemeldet bleiben
                            </label>
                        </div>

                        <div className="text-sm">
                            <a href="#" className="text-blue-600 hover:underline">
                                Passwort vergessen?
                            </a>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full bg-black text-white py-2 rounded-md hover:bg-gray-900 transition flex justify-center items-center ${
                            isLoading ? 'opacity-70 cursor-not-allowed' : ''
                        }`}
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Anmelden...
                            </>
                        ) : (
                            'Anmelden'
                        )}
                    </button>
                </form>

                <div className="mt-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">Oder</span>
                        </div>
                    </div>

                    <div className="mt-6 space-y-3">
                        <button
                            onClick={() => handleDemoLogin('user')}
                            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 font-medium"
                        >
                            Demo Login (Benutzer)
                        </button>
                        <button
                            onClick={() => handleDemoLogin('provider')}
                            className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors duration-200 font-medium"
                        >
                            Demo Login (Anbieter)
                        </button>
                    </div>

                    <p className="text-sm text-center mt-6 text-gray-600">
                        Noch kein Konto?{' '}
                        <Link href="/signup" className="text-blue-600 hover:underline font-medium">
                            Jetzt registrieren
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}