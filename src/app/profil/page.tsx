// src/app/profil/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

// --- Type Definitions ---
interface User {
    id?: string | number;
    name?: string;
    email?: string;
    password?: string;
    phone?: string;
    country?: string;
    birthday?: string;
    gender?: string;
    role?: string;
    profileImage?: string;
    bio?: string;
    preferences?: {
        notifications?: boolean;
        marketingEmails?: boolean;
        darkMode?: boolean;
    };
}

interface Booking {
    id: number;
    name: string;
    date: string;
    time: string;
    address: string;
    status: 'upcoming' | 'completed' | 'cancelled';
    providerImage?: string;
}

interface ProviderManagedSlot {
    id: number;
    title: string;
    date: string;
    time: string;
    address: string;
    duration: string;
    capacity: number;
    price?: string;
    bookings?: number;
}

interface UpdatedUserData extends User {
    password?: string;
}

interface Notification {
    id: number;
    message: string;
    date: string;
    read: boolean;
    type: 'info' | 'success' | 'warning' | 'error';
}

// --- Component ---
export default function ProfilPage() {
    // States with types
    const [user, setUser] = useState<User | null>(null);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [editMode, setEditMode] = useState(false);
    const [activeTab, setActiveTab] = useState<'bookings' | 'settings' | 'slots' | 'analytics'>('bookings');
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [editedUser, setEditedUser] = useState<User>({
        name: '',
        email: '',
        password: '',
        phone: '',
        country: '',
        birthday: '',
        gender: '',
        role: '',
        bio: '',
        profileImage: '',
        preferences: {
            notifications: true,
            marketingEmails: false,
            darkMode: false,
        },
    });
    const [slots, setSlots] = useState<ProviderManagedSlot[]>([]);
    const [newSlot, setNewSlot] = useState({
        title: '',
        date: '',
        time: '',
        address: '',
        duration: '60',
        capacity: 1,
        price: '',
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [toast, setToast] = useState<{
        message: string;
        type: 'success' | 'error' | 'info';
        visible: boolean;
    } | null>(null);

    const router = useRouter();

    // Show toast notification
    const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
        setToast({ message, type, visible: true });
        setTimeout(() => {
            setToast(null);
        }, 3000);
    }, []);

    // Effect for loading user data and example bookings/slots
    useEffect(() => {
        setIsLoading(true);
        const loadUserData = async () => {
            try {
                const userDataString = localStorage.getItem('user');
                if (!userDataString || userDataString === 'undefined') {
                    console.log("No user data in localStorage, redirecting to login.");
                    router.push('/login');
                    return;
                }

                const parsedUser = JSON.parse(userDataString) as User;
                setUser(parsedUser);
                
                // Initialize editedUser based on parsed data
                setEditedUser({
                    name: parsedUser.name || '',
                    email: parsedUser.email || '',
                    password: '',
                    phone: parsedUser.phone || '',
                    country: parsedUser.country || '',
                    birthday: parsedUser.birthday || '',
                    gender: parsedUser.gender || '',
                    role: parsedUser.role || '',
                    bio: parsedUser.bio || '',
                    profileImage: parsedUser.profileImage || '',
                    preferences: parsedUser.preferences || {
                        notifications: true,
                        marketingEmails: false,
                        darkMode: false,
                    },
                });

                // Example bookings (replace with real API call)
                setBookings([
                    {
                        id: 1,
                        name: 'Massage bei BodyCare',
                        date: '2025-04-25',
                        time: '14:30',
                        address: 'Langstrasse 15, Zürich',
                        status: 'upcoming',
                        providerImage: '/images/provider1.jpg',
                    },
                    {
                        id: 2,
                        name: 'Zahnarzttermin',
                        date: '2025-05-02',
                        time: '10:00',
                        address: 'Limmatplatz 3, Zürich',
                        status: 'upcoming',
                        providerImage: '/images/provider2.jpg',
                    },
                    {
                        id: 3,
                        name: 'Yoga Session',
                        date: '2025-04-15',
                        time: '18:00',
                        address: 'Europaallee 41, Zürich',
                        status: 'completed',
                        providerImage: '/images/provider3.jpg',
                    },
                ]);

                // Example notifications
                setNotifications([
                    {
                        id: 1,
                        message: 'Ihre Buchung bei BodyCare wurde bestätigt.',
                        date: '2025-04-22',
                        read: false,
                        type: 'success',
                    },
                    {
                        id: 2,
                        message: 'Neues Angebot in Ihrer Nähe: 20% Rabatt auf Massage.',
                        date: '2025-04-20',
                        read: true,
                        type: 'info',
                    },
                ]);

                // Example slots for providers (replace with real API call)
                if (parsedUser.role === 'provider') {
                    setSlots([
                        {
                            id: 1,
                            title: 'Massage Standard',
                            date: '2025-04-28',
                            time: '10:00',
                            address: 'Meine Praxis, Seestrasse 1, Zürich',
                            duration: '60',
                            capacity: 1,
                            price: '120 CHF',
                            bookings: 0,
                        },
                        {
                            id: 2,
                            title: 'Wellness-Paket Premium',
                            date: '2025-04-28',
                            time: '14:00',
                            address: 'Meine Praxis, Seestrasse 1, Zürich',
                            duration: '90',
                            capacity: 1,
                            price: '180 CHF',
                            bookings: 1,
                        },
                    ]);
                }
            } catch (e) {
                console.error('Error parsing localStorage user in Profile:', e);
                setError('Failed to load user data. Please try logging in again.');
                localStorage.removeItem('user');
                localStorage.removeItem('authToken');
                router.push('/login');
            } finally {
                setIsLoading(false);
            }
        };

        loadUserData();
    }, [router]);

    // --- Handler Functions (with Logic) ---
    const handleLogout = useCallback(() => {
        console.log("Logging out...");
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
        setUser(null);
        showToast('Successfully logged out', 'info');
        router.push('/');
    }, [router, showToast]);

    const handleInputChange = useCallback((field: keyof User | 'preferences.notifications' | 'preferences.marketingEmails' | 'preferences.darkMode', value: string | boolean) => {
        setEditedUser(prev => {
            if (field.startsWith('preferences.')) {
                const preferencesField = field.split('.')[1] as keyof typeof prev.preferences;
                return {
                    ...prev,
                    preferences: {
                        ...prev.preferences,
                        [preferencesField]: value,
                    },
                };
            }
            return { ...prev, [field]: value };
        });
    }, []);

    const handleSaveSettings = useCallback(async () => {
        try {
            setIsLoading(true);
            console.log("Saving settings...", editedUser);
            // TODO: API call to save user data in backend!
            
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 800));
            
            const updatedUserData: UpdatedUserData = { ...user, ...editedUser };
            
            // Password only send/save if it was changed (and ideally hashed)
            if (!editedUser.password) {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { password, ...dataWithoutPassword } = updatedUserData;
                setUser(dataWithoutPassword as User);
                localStorage.setItem('user', JSON.stringify(dataWithoutPassword));
            } else {
                // Logic for hashing the new password before sending to backend
                console.warn("Password update logic not implemented!");
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { password, ...dataWithoutPassword } = updatedUserData;
                setUser(dataWithoutPassword as User);
                localStorage.setItem('user', JSON.stringify(dataWithoutPassword));
            }

            setEditMode(false);
            showToast('Settings saved successfully!', 'success');
        } catch (error) {
            console.error('Error saving settings:', error);
            showToast('Failed to save settings. Please try again.', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [user, editedUser, showToast]);

    const handleCancelBooking = useCallback(async (id: number) => {
        try {
            setIsLoading(true);
            console.log(`Cancelling booking ${id}`);
            // TODO: API call to cancel booking in backend!
            
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 800));
            
            // Update local state to show booking as cancelled
            setBookings(prev => 
                prev.map(b => b.id === id ? { ...b, status: 'cancelled' as const } : b)
            );
            
            showToast(`Booking ${id} cancelled successfully!`, 'success');
        } catch (error) {
            console.error('Error cancelling booking:', error);
            showToast('Failed to cancel booking. Please try again.', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [showToast]);

    const handleBack = useCallback(() => { router.push('/'); }, [router]);

    const handleSlotInput = useCallback((field: keyof typeof newSlot, value: string | number) => {
        setNewSlot(prev => ({ ...prev, [field]: value }));
    }, []);

    const handleAddSlot = useCallback(async () => {
        try {
            if (!newSlot.title || !newSlot.date || !newSlot.time || !newSlot.address) {
                showToast('Please fill in all required fields', 'error');
                return;
            }
            
            setIsLoading(true);
            console.log("Adding new slot:", newSlot);
            // TODO: API call to save slot in backend!
            
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 800));
            
            const newId = Date.now();
            const slotToAdd: ProviderManagedSlot = { 
                ...newSlot, 
                id: newId,
                capacity: Number(newSlot.capacity),
                bookings: 0,
            };
            
            setSlots(prev => [...prev, slotToAdd]);
            setNewSlot({
                title: '',
                date: '',
                time: '',
                address: '',
                duration: '60',
                capacity: 1,
                price: '',
            });
            
            showToast('Slot added successfully!', 'success');
        } catch (error) {
            console.error('Error adding slot:', error);
            showToast('Failed to add slot. Please try again.', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [newSlot, showToast]);

    const handleDeleteSlot = useCallback(async (id: number) => {
        try {
            setIsLoading(true);
            console.log(`Deleting slot ${id}`);
            // TODO: API call to delete slot in backend!
            
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 800));
            
            setSlots(prev => prev.filter(s => s.id !== id));
            showToast('Slot deleted successfully!', 'success');
        } catch (error) {
            console.error('Error deleting slot:', error);
            showToast('Failed to delete slot. Please try again.', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [showToast]);

    const handleMarkAllNotificationsAsRead = useCallback(() => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        showToast('All notifications marked as read', 'info');
    }, [showToast]);

    // Loading state
    if (isLoading && !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading profile...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center max-w-md p-6 bg-white shadow-lg rounded-lg">
                    <div className="text-red-500 text-5xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Profile</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button 
                        onClick={() => router.push('/login')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Back to Login
                    </button>
                </div>
            </div>
        );
    }

    // --- JSX Rendering ---
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Toast Notification */}
            {toast && toast.visible && (
                <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
                    toast.type === 'success' ? 'bg-green-500' : 
                    toast.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                } text-white`}>
                    <p>{toast.message}</p>
                </div>
            )}
            
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <Link href="/" className="font-bold text-xl text-gray-900">Nowly</Link>
                    <div className="flex items-center space-x-4">
                        {/* Notifications */}
                        <div className="relative">
                            <button 
                                className="text-gray-500 hover:text-gray-700 relative"
                                onClick={() => showToast('Notifications viewed', 'info')}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                {notifications.filter(n => !n.read).length > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                                        {notifications.filter(n => !n.read).length}
                                    </span>
                                )}
                            </button>
                        </div>
                        
                        {/* User Menu */}
                        <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-700 hidden sm:inline-block">
                                {user?.name || 'User'}
                            </span>
                            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700">
                                {user?.profileImage ? (
                                    <img 
                                        src={user.profileImage} 
                                        alt={user.name || 'User'} 
                                        className="h-8 w-8 rounded-full object-cover"
                                    />
                                ) : (
                                    <span className="font-medium text-sm">
                                        {user?.name?.charAt(0) || 'U'}
                                    </span>
                                )}
                            </div>
                            <button 
                                onClick={handleLogout}
                                className="text-sm text-red-600 hover:text-red-800 hidden sm:block"
                            >
                                Log out
                            </button>
                        </div>
                    </div>
                </div>
            </header>
            
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    {/* Profile Header */}
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-16 relative">
                        <div className="absolute bottom-0 left-6 transform translate-y-1/2">
                            <div className="h-24 w-24 rounded-full bg-white p-1 shadow-lg">
                                {user?.profileImage ? (
                                    <img 
                                        src={user.profileImage} 
                                        alt={user.name || 'User'} 
                                        className="h-full w-full rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="h-full w-full rounded-full bg-gray-200 flex items-center justify-center">
                                        <span className="text-3xl font-medium text-gray-600">
                                            {user?.name?.charAt(0) || 'U'}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="absolute bottom-4 right-6">
                            <button 
                                onClick={handleBack}
                                className="text-white bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-md text-sm font-medium transition"
                            >
                                Back to Home
                            </button>
                        </div>
                    </div>
                    
                    {/* Profile Info */}
                    <div className="px-6 pt-16 pb-6">
                        <h1 className="text-2xl font-bold text-gray-900">
                            {user?.name || 'Welcome to your profile'}
                        </h1>
                        <p className="text-gray-600 mt-1">
                            {user?.role === 'provider' ? 'Service Provider' : 'Customer'} • {user?.email}
                        </p>
                        {user?.bio && (
                            <p className="text-gray-700 mt-4 max-w-2xl">
                                {user.bio}
                            </p>
                        )}
                    </div>
                    
                    {/* Tabs */}
                    <div className="border-b border-gray-200">
                        <div className="px-6">
                            <nav className="flex space-x-8">
                                <button
                                    onClick={() => setActiveTab('bookings')}
                                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                        activeTab === 'bookings'
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    Bookings
                                </button>
                                
                                {user?.role === 'provider' && (
                                    <>
                                        <button
                                            onClick={() => setActiveTab('slots')}
                                            className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                                activeTab === 'slots'
                                                    ? 'border-blue-500 text-blue-600'
                                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            }`}
                                        >
                                            Manage Slots
                                        </button>
                                        
                                        <button
                                            onClick={() => setActiveTab('analytics')}
                                            className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                                activeTab === 'analytics'
                                                    ? 'border-blue-500 text-blue-600'
                                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            }`}
                                        >
                                            Analytics
                                        </button>
                                    </>
                                )}
                                
                                <button
                                    onClick={() => setActiveTab('settings')}
                                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                        activeTab === 'settings'
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    Settings
                                </button>
                            </nav>
                        </div>
                    </div>
                    
                    {/* Tab Content */}
                    <div className="p-6">
                        {/* Bookings Tab */}
                        {activeTab === 'bookings' && (
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-semibold text-gray-800">Your Bookings</h2>
                                    {notifications.filter(n => !n.read).length > 0 && (
                                        <button
                                            onClick={handleMarkAllNotificationsAsRead}
                                            className="text-sm text-blue-600 hover:text-blue-800"
                                        >
                                            Mark all notifications as read
                                        </button>
                                    )}
                                </div>
                                
                                {/* Notifications */}
                                {notifications.length > 0 && (
                                    <div className="mb-8">
                                        <h3 className="text-lg font-medium text-gray-800 mb-3">Notifications</h3>
                                        <div className="space-y-3">
                                            {notifications.map(notification => (
                                                <div 
                                                    key={notification.id}
                                                    className={`p-4 rounded-lg border ${
                                                        notification.read ? 'bg-white' : 'bg-blue-50'
                                                    } ${
                                                        notification.type === 'success' ? 'border-green-200' :
                                                        notification.type === 'warning' ? 'border-yellow-200' :
                                                        notification.type === 'error' ? 'border-red-200' :
                                                        'border-blue-200'
                                                    }`}
                                                >
                                                    <div className="flex items-start">
                                                        <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                                            notification.type === 'success' ? 'bg-green-100 text-green-500' :
                                                            notification.type === 'warning' ? 'bg-yellow-100 text-yellow-500' :
                                                            notification.type === 'error' ? 'bg-red-100 text-red-500' :
                                                            'bg-blue-100 text-blue-500'
                                                        }`}>
                                                            {notification.type === 'success' ? '✓' :
                                                             notification.type === 'warning' ? '!' :
                                                             notification.type === 'error' ? '×' : 'i'}
                                                        </div>
                                                        <div className="ml-3 flex-1">
                                                            <p className="text-sm text-gray-800">{notification.message}</p>
                                                            <p className="text-xs text-gray-500 mt-1">{notification.date}</p>
                                                        </div>
                                                        {!notification.read && (
                                                            <div className="ml-2 flex-shrink-0">
                                                                <span className="inline-block h-2 w-2 rounded-full bg-blue-500"></span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                
                                {/* Upcoming Bookings */}
                                <div className="mb-8">
                                    <h3 className="text-lg font-medium text-gray-800 mb-3">Upcoming Bookings</h3>
                                    <div className="space-y-4">
                                        {bookings.filter(b => b.status === 'upcoming').length === 0 ? (
                                            <p className="text-gray-500 italic">No upcoming bookings.</p>
                                        ) : (
                                            bookings.filter(b => b.status === 'upcoming').map(booking => (
                                                <div key={booking.id} className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                                                    <div className="flex items-start">
                                                        <div className="h-12 w-12 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                                                            {booking.providerImage ? (
                                                                <img 
                                                                    src={booking.providerImage} 
                                                                    alt="Provider" 
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="h-full w-full flex items-center justify-center text-gray-500">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                                    </svg>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="ml-4 flex-1">
                                                            <div className="flex justify-between">
                                                                <h4 className="font-medium text-gray-900">{booking.name}</h4>
                                                                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                                                                    Upcoming
                                                                </span>
                                                            </div>
                                                            <p className="text-gray-600 text-sm mt-1">
                                                                <span className="inline-block mr-3">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1 -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                    </svg>
                                                                    {booking.date}
                                                                 </span>
                                                                <span className="inline-block mr-3">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1 -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                    </svg>
                                                                    {booking.time} Uhr
                                                                    </span>

                                                            </p>
                                                            <p className="text-gray-600 text-sm mt-1">
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1 -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                </svg>
                                                                {booking.address}
                                                            </p>
                                                            <div className="mt-3 flex">
                                                                <button
                                                                    onClick={() => showToast('Booking details', 'info')}
                                                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium mr-4"
                                                                >
                                                                    View Details
                                                                </button>
                                                                <button
                                                                    onClick={() => handleCancelBooking(booking.id)}
                                                                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                                                                >
                                                                    Cancel Booking
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                                
                                {/* Past Bookings */}
                                {bookings.filter(b => b.status === 'completed' || b.status === 'cancelled').length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-800 mb-3">Past Bookings</h3>
                                        <div className="space-y-4">
                                            {bookings.filter(b => b.status === 'completed' || b.status === 'cancelled').map(booking => (
                                                <div key={booking.id} className="bg-white border rounded-lg p-4 shadow-sm">
                                                    <div className="flex items-start">
                                                        <div className="h-12 w-12 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                                                            {booking.providerImage ? (
                                                                <img 
                                                                    src={booking.providerImage} 
                                                                    alt="Provider" 
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="h-full w-full flex items-center justify-center text-gray-500">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                                    </svg>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="ml-4 flex-1">
                                                            <div className="flex justify-between">
                                                                <h4 className="font-medium text-gray-900">{booking.name}</h4>
                                                                <span className={`px-2 py-1 text-xs rounded-full ${
                                                                    booking.status === 'completed' 
                                                                        ? 'bg-gray-100 text-gray-800' 
                                                                        : 'bg-red-100 text-red-800'
                                                                }`}>
                                                                    {booking.status === 'completed' ? 'Completed' : 'Cancelled'}
                                                                </span>
                                                            </div>
                                                            <p className="text-gray-600 text-sm mt-1">
                                                                <span className="inline-block mr-3">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1 -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                    </svg>
                                                                    {booking.date}
                                                                </span>
                                                                <span className="inline-block">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1 -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                    </svg>
                                                                    {booking.address}
                                                                </span>
                                                            </p>
                                                            {booking.status === 'completed' && (
                                                                <button
                                                                    onClick={() => showToast('Thank you for your feedback!', 'success')}
                                                                    className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                                >
                                                                    Leave Review
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {/* Settings Tab */}
                        {activeTab === 'settings' && (
                            <div>
                                <h2 className="text-xl font-semibold text-gray-800 mb-6">Account Settings</h2>
                                
                                {!editMode ? (
                                    <div>
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="bg-white p-5 rounded-lg border shadow-sm">
                                                <h3 className="font-medium text-gray-900 mb-4">Personal Information</h3>
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700">Full Name</label>
                                                        <p className="mt-1 text-gray-900">{user?.name || 'Not provided'}</p>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700">Email Address</label>
                                                        <p className="mt-1 text-gray-900">{user?.email || 'Not provided'}</p>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                                                        <p className="mt-1 text-gray-900">{user?.phone || 'Not provided'}</p>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700">Country</label>
                                                        <p className="mt-1 text-gray-900">{user?.country || 'Not provided'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="bg-white p-5 rounded-lg border shadow-sm">
                                                <h3 className="font-medium text-gray-900 mb-4">Additional Information</h3>
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700">Birthday</label>
                                                        <p className="mt-1 text-gray-900">{user?.birthday || 'Not provided'}</p>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700">Gender</label>
                                                        <p className="mt-1 text-gray-900">{user?.gender || 'Not provided'}</p>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700">Account Type</label>
                                                        <p className="mt-1 text-gray-900">
                                                            {user?.role === 'provider' ? 'Service Provider' : 'Customer'}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700">Bio</label>
                                                        <p className="mt-1 text-gray-900">{user?.bio || 'Not provided'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="mt-6 bg-white p-5 rounded-lg border shadow-sm">
                                            <h3 className="font-medium text-gray-900 mb-4">Preferences</h3>
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-medium text-gray-800">Email Notifications</p>
                                                        <p className="text-sm text-gray-600">Receive notifications about your bookings</p>
                                                    </div>
                                                    <span className={`px-2 py-1 text-xs rounded-full ${user?.preferences?.notifications ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                        {user?.preferences?.notifications ? 'Enabled' : 'Disabled'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-medium text-gray-800">Marketing Emails</p>
                                                        <p className="text-sm text-gray-600">Receive special offers and promotions</p>
                                                    </div>
                                                    <span className={`px-2 py-1 text-xs rounded-full ${user?.preferences?.marketingEmails ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                        {user?.preferences?.marketingEmails ? 'Enabled' : 'Disabled'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-medium text-gray-800">Dark Mode</p>
                                                        <p className="text-sm text-gray-600">Use dark theme for the application</p>
                                                    </div>
                                                    <span className={`px-2 py-1 text-xs rounded-full ${user?.preferences?.darkMode ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                        {user?.preferences?.darkMode ? 'Enabled' : 'Disabled'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="mt-6 flex">
                                            <button
                                                onClick={() => setEditMode(true)}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                                            >
                                                Edit Profile
                                            </button>
                                            <button
                                                onClick={handleLogout}
                                                className="ml-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium"
                                            >
                                                Logout
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="bg-white p-6 rounded-lg border shadow-sm mb-6">
                                            <h3 className="font-medium text-gray-900 mb-4">Edit Profile</h3>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-4">
                                                    <div>
                                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                                                        <input
                                                            type="text"
                                                            id="name"
                                                            placeholder="Your full name"
                                                            value={editedUser.name || ''}
                                                            onChange={(e) => handleInputChange('name', e.target.value)}
                                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                        />
                                                    </div>
                                                    
                                                    <div>
                                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                                                        <input
                                                            type="email"
                                                            id="email"
                                                            placeholder="your@email.com"
                                                            value={editedUser.email || ''}
                                                            onChange={(e) => handleInputChange('email', e.target.value)}
                                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                        />
                                                    </div>
                                                    
                                                    <div>
                                                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                                                        <input
                                                            type="text"
                                                            id="phone"
                                                            placeholder="Your phone number"
                                                            value={editedUser.phone || ''}
                                                            onChange={(e) => handleInputChange('phone', e.target.value)}
                                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                        />
                                                    </div>
                                                    
                                                    <div>
                                                        <label htmlFor="country" className="block text-sm font-medium text-gray-700">Country</label>
                                                        <input
                                                            type="text"
                                                            id="country"
                                                            placeholder="Your country"
                                                            value={editedUser.country || ''}
                                                            onChange={(e) => handleInputChange('country', e.target.value)}
                                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                        />
                                                    </div>
                                                </div>
                                                
                                                <div className="space-y-4">
                                                    <div>
                                                        <label htmlFor="birthday" className="block text-sm font-medium text-gray-700">Birthday</label>
                                                        <input
                                                            type="date"
                                                            id="birthday"
                                                            value={editedUser.birthday || ''}
                                                            onChange={(e) => handleInputChange('birthday', e.target.value)}
                                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                        />
                                                    </div>
                                                    
                                                    <div>
                                                        <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Gender</label>
                                                        <select
                                                            id="gender"
                                                            value={editedUser.gender || ''}
                                                            onChange={(e) => handleInputChange('gender', e.target.value)}
                                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                        >
                                                            <option value="">Select gender</option>
                                                            <option value="männlich">Männlich</option>
                                                            <option value="weiblich">Weiblich</option>
                                                            <option value="divers">Divers</option>
                                                        </select>
                                                    </div>
                                                    
                                                    <div>
                                                        <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Bio</label>
                                                        <textarea
                                                            id="bio"
                                                            rows={3}
                                                            placeholder="Tell us about yourself"
                                                            value={editedUser.bio || ''}
                                                            onChange={(e) => handleInputChange('bio', e.target.value)}
                                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                        />
                                                    </div>
                                                    
                                                    <div>
                                                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">New Password (optional)</label>
                                                        <input
                                                            type="password"
                                                            id="password"
                                                            placeholder="Leave blank to keep current password"
                                                            value={editedUser.password || ''}
                                                            onChange={(e) => handleInputChange('password', e.target.value)}
                                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="bg-white p-6 rounded-lg border shadow-sm mb-6">
                                            <h3 className="font-medium text-gray-900 mb-4">Preferences</h3>
                                            <div className="space-y-4">
                                                <div className="flex items-center">
                                                    <input
                                                        id="notifications"
                                                        type="checkbox"
                                                        checked={editedUser.preferences?.notifications || false}
                                                        onChange={(e) => handleInputChange('preferences.notifications', e.target.checked)}
                                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                    />
                                                    <label htmlFor="notifications" className="ml-3">
                                                        <span className="block text-sm font-medium text-gray-700">Email Notifications</span>
                                                        <span className="block text-sm text-gray-500">Receive notifications about your bookings</span>
                                                    </label>
                                                </div>
                                                
                                                <div className="flex items-center">
                                                    <input
                                                        id="marketingEmails"
                                                        type="checkbox"
                                                        checked={editedUser.preferences?.marketingEmails || false}
                                                        onChange={(e) => handleInputChange('preferences.marketingEmails', e.target.checked)}
                                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                    />
                                                    <label htmlFor="marketingEmails" className="ml-3">
                                                        <span className="block text-sm font-medium text-gray-700">Marketing Emails</span>
                                                        <span className="block text-sm text-gray-500">Receive special offers and promotions</span>
                                                    </label>
                                                </div>
                                                
                                                <div className="flex items-center">
                                                    <input
                                                        id="darkMode"
                                                        type="checkbox"
                                                        checked={editedUser.preferences?.darkMode || false}
                                                        onChange={(e) => handleInputChange('preferences.darkMode', e.target.checked)}
                                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                    />
                                                    <label htmlFor="darkMode" className="ml-3">
                                                        <span className="block text-sm font-medium text-gray-700">Dark Mode</span>
                                                        <span className="block text-sm text-gray-500">Use dark theme for the application</span>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex space-x-4">
                                            <button
                                                onClick={handleSaveSettings}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                                                disabled={isLoading}
                                            >
                                                {isLoading ? 'Saving...' : 'Save Changes'}
                                            </button>
                                            <button
                                                onClick={() => setEditMode(false)}
                                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm font-medium"
                                                disabled={isLoading}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        {/* Slots Management Tab (for providers) */}
                        {activeTab === 'slots' && user?.role === 'provider' && (
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-semibold text-gray-800">Manage Your Slots</h2>
                                    <button
                                        onClick={() => showToast('Slot settings saved', 'success')}
                                        className="text-sm text-blue-600 hover:text-blue-800"
                                    >
                                        Slot Settings
                                    </button>
                                </div>
                                
                                {/* Add New Slot */}
                                <div className="bg-white p-6 rounded-lg border shadow-sm mb-6">
                                    <h3 className="text-lg font-medium text-gray-800 mb-4">Add New Slot</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="slotTitle" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                            <input
                                                type="text"
                                                id="slotTitle"
                                                placeholder="Service name or description"
                                                value={newSlot.title}
                                                onChange={(e) => handleSlotInput('title', e.target.value)}
                                                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                            />
                                        </div>
                                        
                                        <div>
                                            <label htmlFor="slotAddress" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                            <input
                                                type="text"
                                                id="slotAddress"
                                                placeholder="Location of the service"
                                                value={newSlot.address}
                                                onChange={(e) => handleSlotInput('address', e.target.value)}
                                                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                            />
                                        </div>
                                        
                                        <div>
                                            <label htmlFor="slotDate" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                            <input
                                                type="date"
                                                id="slotDate"
                                                value={newSlot.date}
                                                onChange={(e) => handleSlotInput('date', e.target.value)}
                                                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                            />
                                        </div>
                                        
                                        <div>
                                            <label htmlFor="slotTime" className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                                            <input
                                                type="time"
                                                id="slotTime"
                                                value={newSlot.time}
                                                onChange={(e) => handleSlotInput('time', e.target.value)}
                                                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                            />
                                        </div>
                                        
                                        <div>
                                            <label htmlFor="slotDuration" className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                                            <select
                                                id="slotDuration"
                                                value={newSlot.duration}
                                                onChange={(e) => handleSlotInput('duration', e.target.value)}
                                                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                            >
                                                <option value="30">30 minutes</option>
                                                <option value="45">45 minutes</option>
                                                <option value="60">60 minutes</option>
                                                <option value="90">90 minutes</option>
                                                <option value="120">120 minutes</option>
                                            </select>
                                        </div>
                                        
                                        <div>
                                            <label htmlFor="slotCapacity" className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                                            <input
                                                type="number"
                                                min="1"
                                                id="slotCapacity"
                                                value={newSlot.capacity}
                                                onChange={(e) => handleSlotInput('capacity', parseInt(e.target.value) || 1)}
                                                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-
                        500 focus:border-blue-500 sm:text-sm"
                                            />
                                        </div>
                                        
                                        <div>
                                            <label htmlFor="slotPrice" className="block text-sm font-medium text-gray-700 mb-1">Price (optional)</label>
                                            <input
                                                type="text"
                                                id="slotPrice"
                                                placeholder="e.g. 120 CHF"
                                                value={newSlot.price}
                                                onChange={(e) => handleSlotInput('price', e.target.value)}
                                                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="mt-4">
                                        <button
                                            onClick={handleAddSlot}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? 'Adding...' : 'Add Slot'}
                                        </button>
                                    </div>
                                </div>
                                
                                {/* Existing Slots */}
                                <div className="bg-white p-6 rounded-lg border shadow-sm">
                                    <h3 className="text-lg font-medium text-gray-800 mb-4">Your Slots</h3>
                                    
                                    {slots.length === 0 ? (
                                        <p className="text-gray-500 italic">You haven't created any slots yet.</p>
                                    ) : (
                                        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                                            <table className="min-w-full divide-y divide-gray-300">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Title</th>
                                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date & Time</th>
                                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Duration</th>
                                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Bookings</th>
                                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Price</th>
                                                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                                            <span className="sr-only">Actions</span>
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200 bg-white">
                                                    {slots.map((slot) => (
                                                        <tr key={slot.id}>
                                                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                                                {slot.title}
                                                                <div className="text-xs text-gray-500">{slot.address}</div>
                                                            </td>
                                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                                {slot.date} at {slot.time}
                                                            </td>
                                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                                {slot.duration} min
                                                            </td>
                                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                                {slot.bookings !== undefined ? (
                                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                                        slot.bookings > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                                    }`}>
                                                                        {slot.bookings} / {slot.capacity}
                                                                    </span>
                                                                ) : (
                                                                    'N/A'
                                                                )}
                                                            </td>
                                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                                {slot.price || 'Not set'}
                                                            </td>
                                                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                                <button
                                                                    onClick={() => showToast('Slot details', 'info')}
                                                                    className="text-blue-600 hover:text-blue-900 mr-4"
                                                                >
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteSlot(slot.id)}
                                                                    className="text-red-600 hover:text-red-900"
                                                                >
                                                                    Delete
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        
                        {/* Analytics Tab (for providers) */}
                        {activeTab === 'analytics' && user?.role === 'provider' && (
                            <div>
                                <h2 className="text-xl font-semibold text-gray-800 mb-6">Analytics & Insights</h2>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                    {/* Card 1 */}
                                    <div className="bg-white p-6 rounded-lg border shadow-sm">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <div className="h-12 w-12 rounded-md bg-blue-100 flex items-center justify-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <h3 className="text-lg font-medium text-gray-900">Total Revenue</h3>
                                                <p className="text-2xl font-semibold text-gray-900">CHF 1,250</p>
                                                <p className="text-sm text-green-600">↑ 12% from last month</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Card 2 */}
                                    <div className="bg-white p-6 rounded-lg border shadow-sm">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <div className="h-12 w-12 rounded-md bg-green-100 flex items-center justify-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                    </svg>
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <h3 className="text-lg font-medium text-gray-900">Total Bookings</h3>
                                                <p className="text-2xl font-semibold text-gray-900">23</p>
                                                <p className="text-sm text-green-600">↑ 7% from last month</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Card 3 */}
                                    <div className="bg-white p-6 rounded-lg border shadow-sm">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <div className="h-12 w-12 rounded-md bg-purple-100 flex items-center justify-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                                    </svg>
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <h3 className="text-lg font-medium text-gray-900">Average Rating</h3>
                                                <p className="text-2xl font-semibold text-gray-900">4.8/5</p>
                                                <p className="text-sm text-gray-600">Based on 17 reviews</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Charts (Placeholder) */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="bg-white p-6 rounded-lg border shadow-sm">
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">Booking Trends</h3>
                                        <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-lg flex items-center justify-center">
                                            <div className="text-center">
                                                <div className="w-20 h-20 mx-auto flex items-center justify-center bg-gray-200 rounded-full mb-4">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 13v-1m4 1v-3m4 3V8M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                                                    </svg>
                                                </div>
                                                <p className="text-gray-500">Analytics chart will appear here</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-white p-6 rounded-lg border shadow-sm">
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Analysis</h3>
                                        <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-lg flex items-center justify-center">
                                            <div className="text-center">
                                                <div className="w-20 h-20 mx-auto flex items-center justify-center bg-gray-200 rounded-full mb-4">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                                                    </svg>
                                                </div>
                                                <p className="text-gray-500">Revenue chart will appear here</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
            
            {/* Footer */}
            <footer className="mt-16 bg-white border-t py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="md:flex md:items-center md:justify-between">
                        <div className="flex justify-center md:justify-start space-x-6">
                            <a href="#" className="text-gray-400 hover:text-gray-500">
                                <span className="sr-only">Facebook</span>
                                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                                </svg>
                            </a>

                            <a href="#" className="text-gray-400 hover:text-gray-500">
                                <span className="sr-only">Instagram</span>
                                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                                </svg>
                            </a>

                            <a href="#" className="text-gray-400 hover:text-gray-500">
                                <span className="sr-only">Twitter</span>
                                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                                </svg>
                            </a>
                        </div>
                        <p className="mt-8 text-center md:mt-0 md:text-right text-base text-gray-400">
                            &copy; 2025 Nowly. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}