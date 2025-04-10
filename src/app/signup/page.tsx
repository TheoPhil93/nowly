'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const SignupPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError('Passwörter stimmen nicht überein.');
            return;
        }

        try {
            const response = await fetch('/api/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Erfolgreiche Registrierung
                console.log(data.message);
                router.push('/login'); // Weiterleitung zum Login
            } else {
                // Fehler bei der Registrierung
                setError(data.message || 'Registrierung fehlgeschlagen.');
            }
        } catch (err) {
            console.error(err);
            setError('Es ist ein Fehler aufgetreten. Bitte versuche es später noch einmal.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-md shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Registrieren</h2>
                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                        <input type="text" id="name" className="mt-1 block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                        <input type="email" id="email" className="mt-1 block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Passwort</label>
                        <input type="password" id="password" className="mt-1 block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Passwort bestätigen</label>
                        <input type="password" id="confirmPassword" className="mt-1 block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                    </div>
                    <div className="flex justify-end space-x-4">
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">Registrieren</button>
                    </div>
                </form>
                <div className="mt-4 text-center">
                    <p>Hast du bereits ein Konto? <a href="/login" className="text-indigo-600 hover:underline">Anmelden</a></p>
                </div>
            </div>
        </div>
    );
};

export default SignupPage;