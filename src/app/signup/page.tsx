'use client';
import React, { useState } from 'react';


const SignUp = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Hier kannst du deine Registrierung-Logik einfügen
        if (password !== confirmPassword) {
            alert("Passwörter stimmen nicht überein");
            return;
        }

        // Beispiel für das Registrieren (z. B. API-Anruf)
        console.log('Registrierung:', { name, email, password });
        alert('Registrierung erfolgreich');
    };

    return (
        <div className="min-h-screen bg-white text-gray-900">
            <header className="flex justify-between items-center px-6 py-4 border-b text-sm text-gray-600">
                <span className="font-semibold text-black text-lg">Nowly</span>
            </header>

            <section className="flex justify-center items-center px-6 py-8">
                <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Registrieren</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                            <input
                                type="text"
                                id="name"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                            <input
                                type="email"
                                id="email"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Passwort</label>
                            <input
                                type="password"
                                id="password"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Passwort bestätigen</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="flex justify-between space-x-4">
                            <button
                                type="submit"
                                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                Registrieren
                            </button>
                        </div>
                    </form>
                    <p className="mt-4 text-sm text-center text-gray-500">
                        Hast du schon ein Konto?{' '}
                        <a href="/login" className="text-blue-600 hover:underline">
                            Jetzt einloggen
                        </a>
                    </p>
                </div>
            </section>
        </div>
    );
};

export default SignUp;
