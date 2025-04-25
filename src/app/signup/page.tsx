'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // Validate form
            if (password !== confirmPassword) {
                setError('Die Passwörter stimmen nicht überein.');
                setIsLoading(false);
                return;
            }

            if (password.length < 6) {
                setError('Das Passwort muss mindestens 6 Zeichen lang sein.');
                setIsLoading(false);
                return;
            }

            // Call API for registration
            const res = await fetch('/api/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                // Check for duplicate email error
                if (res.status === 409 || data.error?.toLowerCase().includes('exists') || 
                    data.error?.toLowerCase().includes('vorhanden') ||
                    data.error?.toLowerCase().includes('registriert')) {
                    throw new Error('Diese E-Mail-Adresse ist bereits registriert. Bitte melden Sie sich an oder verwenden Sie eine andere E-Mail-Adresse.');
                }
                throw new Error(data.error || 'Registrierung fehlgeschlagen.');
            }

            // Auto-login after registration
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('authToken', data.token || 'signup-token');
            
            // For demo/testing purposes, create a fallback user if API doesn't return one
            if (!data.user) {
                const mockUser = {
                    id: `user-${Date.now()}`,
                    name: name,
                    email: email,
                    role: 'user'
                };
                localStorage.setItem('user', JSON.stringify(mockUser));
                localStorage.setItem('authToken', 'signup-token-123');
            }

            // Redirect to homepage after registration
            window.location.href = '/';
        } catch (err) {
            console.error('Registration error:', err);
            setError(err instanceof Error ? err.message : 'Registrierung fehlgeschlagen.');
        } finally {
            setIsLoading(false);
        }
    };

    // Demo signup function for testing
    const handleDemoSignup = () => {
        const demoUser = {
            id: `demo-${Date.now()}`,
            name: 'Neuer Nutzer',
            email: `user${Math.floor(Math.random()*1000)}@example.com`,
            role: 'user'
        };
        localStorage.setItem('user', JSON.stringify(demoUser));
        localStorage.setItem('authToken', 'signup-demo-token');
        
        // Redirect to homepage
        window.location.href = '/';
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-8 sm:py-12">
            <div className="bg-white p-4 sm:p-8 rounded-lg shadow-lg w-full max-w-md relative mx-auto">
                {/* Close button - responsive positioning */}
                <div className="absolute top-2 right-2 sm:top-4 sm:right-4">
                    <Link href="/" className="text-gray-400 hover:text-gray-600 p-2" aria-label="Schließen">
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </Link>
                </div>
                
                <h2 className="text-xl sm:text-2xl font-bold text-center mb-4 sm:mb-6 text-gray-800">Registrieren</h2>
                
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 sm:px-4 sm:py-3 rounded mb-4 text-sm sm:text-base">
                        {error}
                        {error.toLowerCase().includes('bereits registriert') && (
                            <div className="mt-2">
                                <Link href="/login" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                    </svg>
                                    Zum Login wechseln
                                </Link>
                            </div>
                        )}
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                            Name
                        </label>
                        <input
                            id="name"
                            type="text"
                            placeholder="Ihr Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full border border-gray-300 px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                        />
                    </div>
                    
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
                            className="w-full border border-gray-300 px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
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
                            minLength={6}
                            className="w-full border border-gray-300 px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                        />
                        <p className="text-xs text-gray-500 mt-1">Mindestens 6 Zeichen</p>
                    </div>
                    
                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                            Passwort bestätigen
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="w-full border border-gray-300 px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                        />
                    </div>
                    
                    <div className="flex items-start mt-4">
                        <input
                            id="terms"
                            name="terms"
                            type="checkbox"
                            required
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-0.5"
                        />
                        <label htmlFor="terms" className="ml-2 block text-xs sm:text-sm text-gray-700">
                            Ich akzeptiere die <a href="/terms" className="text-blue-600 hover:underline">Nutzungsbedingungen</a> und <a href="/privacy" className="text-blue-600 hover:underline">Datenschutzerklärung</a>
                        </label>
                    </div>
                    
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full bg-black text-white py-2.5 sm:py-2 rounded-md hover:bg-gray-900 transition flex justify-center items-center text-sm sm:text-base mt-6 ${
                            isLoading ? 'opacity-70 cursor-not-allowed' : ''
                        }`}
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Registrierung...
                            </>
                        ) : (
                            'Konto erstellen'
                        )}
                    </button>
                </form>
                
                <div className="mt-4 sm:mt-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-xs sm:text-sm">
                            <span className="px-2 bg-white text-gray-500">Oder</span>
                        </div>
                    </div>
                    
                    <div className="mt-4 sm:mt-6">
                        <button
                            onClick={handleDemoSignup}
                            type="button"
                            className="w-full flex justify-center py-2.5 sm:py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Demo-Konto erstellen
                        </button>
                    </div>
                </div>
                
                <p className="text-xs sm:text-sm text-center mt-4 sm:mt-6 text-gray-600">
                    Bereits registriert?{' '}
                    <Link href="/login" className="text-blue-600 hover:underline font-medium">
                        Zum Login
                    </Link>
                </p>
            </div>
        </div>
    );
}