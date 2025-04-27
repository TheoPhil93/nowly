'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Slot {
  id: string;
  name: string;
  type: string;
  subType?: string;
  address: string;
  phone?: string;
  website?: string;
  price?: number;
  duration?: number;
  description?: string;
  rating?: number;
  bookingsToday?: number;
  totalBookings?: number;
  revenue?: number;
  openingHours?: {
    day: string;
    open: string;
    close: string;
  }[];
}

interface Booking {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  date: string;
  time: string;
  service: string;
  price: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
}

interface Analytics {
  totalRevenue: number;
  monthlyRevenue: number;
  totalBookings: number;
  confirmationRate: number;
  averageRating: number;
  topServices: { name: string; count: number }[];
}

interface User {
  id: string | number;
  name: string;
  email?: string;
  role: 'provider' | 'customer' | 'admin';
}

export default function ProviderDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'slots' | 'bookings' | 'analytics' | 'settings'>('dashboard');
  const [showAddSlotModal, setShowAddSlotModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'today' | 'week' | 'month' | 'year'>('week');
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/login');
      return;
    }

    try {
      const userData: unknown = JSON.parse(storedUser);

      if (typeof userData === 'object' && userData !== null && 'role' in userData && 'name' in userData) {
        if ((userData as User).role !== 'provider') {
          router.push('/profil');
          return;
        }
        setUser(userData as User);
        fetchProviderData();
      } else {
        console.error('Invalid user data structure in localStorage');
        router.push('/login');
        return;
      }

    } catch (e) {
      console.error('Error parsing user data:', e);
      localStorage.removeItem('user');
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showUserMenu) {
        const target = event.target as HTMLElement;
        if (!target.closest('.user-menu-container')) {
          setShowUserMenu(false);
        }
      }
      if (showMobileMenu) {
        const target = event.target as HTMLElement;
        if (!target.closest('.mobile-menu-container')) {
          setShowMobileMenu(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu, showMobileMenu]);

  const fetchProviderData = async () => {
    // Simulated provider data - replace with actual API calls
    const mockSlots: Slot[] = [
      {
        id: '1',
        name: 'Salon Beauty Premium',
        type: 'Friseur',
        subType: 'Unisex',
        address: 'Seestrasse 8, 8002 Zürich',
        phone: '+41442345678',
        website: 'www.salonbeauty.ch',
        price: 89,
        duration: 60,
        rating: 4.8,
        bookingsToday: 12,
        totalBookings: 285,
        revenue: 25365,
        openingHours: [
          { day: 'Montag', open: '09:00', close: '18:00' },
          { day: 'Dienstag', open: '09:00', close: '18:00' },
          { day: 'Mittwoch', open: '09:00', close: '18:00' },
          { day: 'Donnerstag', open: '09:00', close: '20:00' },
          { day: 'Freitag', open: '09:00', close: '18:00' },
          { day: 'Samstag', open: '10:00', close: '16:00' },
        ]
      },
      {
        id: '2',
        name: 'Express Haarschnitt',
        type: 'Friseur',
        subType: 'Quick Service',
        address: 'Seestrasse 8, 8002 Zürich',
        phone: '+41442345678',
        price: 45,
        duration: 30,
        rating: 4.6,
        bookingsToday: 8,
        totalBookings: 156,
        revenue: 7020,
      }
    ];

    const mockBookings: Booking[] = [
      {
        id: '1',
        customerName: 'Anna Schmidt',
        customerEmail: 'anna.schmidt@example.com',
        customerPhone: '+41791234567',
        date: '2025-04-28',
        time: '14:00',
        service: 'Salon Beauty Premium',
        price: 89,
        status: 'pending',
        notes: 'Haarschnitt und Färben'
      },
      {
        id: '2',
        customerName: 'Max Müller',
        customerEmail: 'max.mueller@example.com',
        date: '2025-04-29',
        time: '11:00',
        service: 'Express Haarschnitt',
        price: 45,
        status: 'confirmed'
      },
      {
        id: '3',
        customerName: 'Sophie Weber',
        customerEmail: 'sophie.weber@example.com',
        customerPhone: '+41797654321',
        date: '2025-04-28',
        time: '16:30',
        service: 'Salon Beauty Premium',
        price: 89,
        status: 'confirmed'
      }
    ];

    const mockAnalytics: Analytics = {
      totalRevenue: 32385,
      monthlyRevenue: 8420,
      totalBookings: 441,
      confirmationRate: 94,
      averageRating: 4.7,
      topServices: [
        { name: 'Salon Beauty Premium', count: 285 },
        { name: 'Express Haarschnitt', count: 156 },
      ]
    };

    setSlots(mockSlots);
    setBookings(mockBookings);
    setAnalytics(mockAnalytics);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    router.push('/');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const updateBookingStatus = (bookingId: string, newStatus: Booking['status']) => {
    setBookings(prev => 
      prev.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: newStatus }
          : booking
      )
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF'
    }).format(amount);
  };

  const getInitials = (name?: string) => {
    if (!name) return 'P';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Lade Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header with Mobile Menu */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">N</span>
              </div>
              <div>
                <span className="font-bold text-xl text-gray-900">Nowly</span>
                <span className="ml-2 text-sm text-gray-700 hidden sm:inline">Provider</span>
              </div>
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {showMobileMenu ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              {/* Quick Actions */}
              <button className="p-2 text-gray-400 hover:text-gray-800 relative">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* User Menu */}
              <div className="relative user-menu-container">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-semibold">
                    {getInitials(user?.name)}
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-sm font-medium text-gray-900">{user?.name || 'Provider'}</p>
                    <p className="text-xs text-gray-500">Provider Account</p>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50">
                    <Link href="/profil" className="block px-4 py-2 text-sm text-gray-900 hover:bg-gray-100">
                      Mein Profil
                    </Link>
                    <button
                      onClick={() => {
                        setActiveTab('settings');
                        setShowUserMenu(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Einstellungen
                    </button>
                    <hr className="my-1" />
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Abmelden
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-gray-200 bg-white mobile-menu-container">
            <div className="pt-2 pb-3 space-y-1">
              <button
                onClick={() => {
                  setActiveTab('dashboard');
                  setShowMobileMenu(false);
                }}
                className={`block w-full text-left px-4 py-2 text-base font-medium ${
                  activeTab === 'dashboard' ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => {
                  setActiveTab('slots');
                  setShowMobileMenu(false);
                }}
                className={`block w-full text-left px-4 py-2 text-base font-medium ${
                  activeTab === 'slots' ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Meine Angebote
              </button>
              <button
                onClick={() => {
                  setActiveTab('bookings');
                  setShowMobileMenu(false);
                }}
                className={`block w-full text-left px-4 py-2 text-base font-medium ${
                  activeTab === 'bookings' ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Buchungen
              </button>
              <button
                onClick={() => {
                  setActiveTab('analytics');
                  setShowMobileMenu(false);
                }}
                className={`block w-full text-left px-4 py-2 text-base font-medium ${
                  activeTab === 'analytics' ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Analytics
              </button>
              <button
                onClick={() => {
                  setActiveTab('settings');
                  setShowMobileMenu(false);
                }}
                className={`block w-full text-left px-4 py-2 text-base font-medium ${
                  activeTab === 'settings' ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Einstellungen
              </button>
            </div>
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-semibold">
                    {getInitials(user?.name)}
                  </div>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">{user?.name || 'Provider'}</div>
                  <div className="text-sm font-medium text-gray-500">Provider Account</div>
                </div>
              </div>
              <div className="mt-3 px-2 space-y-1">
                <Link href="/profil" className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50">
                  Mein Profil
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:text-red-900 hover:bg-red-50"
                >
                  Abmelden
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Desktop Navigation Tabs */}
      <div className="hidden md:block bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'dashboard'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('slots')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'slots'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Meine Angebote
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'bookings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Buchungen
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
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'settings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Einstellungen
            </button>
          </nav>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Quick Stats - Mobile Friendly Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Heutiger Umsatz</p>
                    <p className="text-2xl font-semibold text-gray-900">{formatCurrency(1068)}</p>
                    <p className="text-sm text-green-600 mt-1">+12% vs. gestern</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100 text-green-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Termine heute</p>
                    <p className="text-2xl font-semibold text-gray-900">20</p>
                    <p className="text-sm text-green-600 mt-1">3 verfügbar</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Bewertung</p>
                    <p className="text-2xl font-semibold text-gray-900">4.8</p>
                    <p className="text-sm text-gray-600 mt-1">aus 285 Bewertungen</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Konversionsrate</p>
                    <p className="text-2xl font-semibold text-gray-900">94%</p>
                    <p className="text-sm text-green-600 mt-1">+5% vs. letzten Monat</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Today's Schedule & Recent Bookings - Stacked on Mobile */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Today's Schedule */}
              <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 mb-6">
                  <h2 className="text-lg font-semibold">Heutiger Zeitplan</h2>
                  <select className="border border-gray-300 rounded-md px-3 py-1.5 text-sm w-full sm:w-auto">
                    <option>Alle Angebote</option>
                    {slots.map(slot => (
                      <option key={slot.id}>{slot.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-4 overflow-x-auto">
                  {bookings
                    .filter(booking => booking.date === '2025-04-28')
                    .map((booking) => (
                      <div key={booking.id} className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition min-w-full sm:min-w-0">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                          {booking.customerName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="ml-4 flex-grow min-w-0">
                          <p className="font-medium text-gray-900 truncate">{booking.customerName}</p>
                          <p className="text-sm text-gray-500 truncate">{booking.service}</p>
                        </div>
                        <div className="text-right ml-4">
                          <p className="font-medium text-gray-900">{booking.time} Uhr</p>
                          <p className="text-sm text-gray-500">{formatCurrency(booking.price)}</p>
                        </div>
                        <div className="ml-4 hidden sm:block">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            booking.status === 'confirmed'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {booking.status === 'confirmed' ? 'Bestätigt' : 'Angefragt'}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                <h2 className="text-lg font-semibold mb-6">Aktuelle Aktivitäten</h2>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="p-2 bg-green-100 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">Neue Buchung bestätigt</p>
                      <p className="text-xs text-gray-500">Anna Schmidt - vor 5 Minuten</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="p-2 bg-yellow-100 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">Neue Buchungsanfrage</p>
                      <p className="text-xs text-gray-500">Max Müller - vor 12 Minuten</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">Neue 5-Sterne-Bewertung</p>
                      <p className="text-xs text-gray-500">Sophie Weber - vor 1 Stunde</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Slots Tab - Mobile Friendly Grid */}
        {activeTab === 'slots' && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold">Meine Angebote</h2>
                <p className="text-gray-600 mt-1">Verwalten Sie Ihre Services und Verfügbarkeiten</p>
              </div>
              <button
                onClick={() => setShowAddSlotModal(true)}
                className="mt-4 sm:mt-0 w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Neues Angebot erstellen
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {slots.map((slot) => (
                <div key={slot.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition">
                  <div className="p-4 sm:p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{slot.name}</h3>
                        <p className="text-sm text-gray-500">{slot.type} - {slot.subType}</p>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          {slot.rating}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 space-y-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="truncate">{slot.address}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-gray-600">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {formatCurrency(slot.price || 0)}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {slot.duration} Min
                        </div>
                      </div>
                    </div>

                    {/* Statistics */}
                    <div className="mt-6 grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-900">{slot.bookingsToday}</p>
                        <p className="text-xs text-gray-500">Heute</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-900">{slot.totalBookings}</p>
                        <p className="text-xs text-gray-500">Gesamt</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-900">{formatCurrency(slot.revenue || 0)}</p>
                        <p className="text-xs text-gray-500">Umsatz</p>
                      </div>
                    </div>
                  </div>

                  <div className="px-4 sm:px-6 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                    <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                      Bearbeiten
                    </button>
                    <div className="flex items-center space-x-3">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                        <span className="ml-2 text-sm text-gray-600">Aktiv</span>
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bookings Tab - Mobile Friendly Table */}
        {activeTab === 'bookings' && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold">Buchungen</h2>
                <p className="text-gray-600 mt-1">Verwalten Sie Ihre Termine und Kundenanfragen</p>
              </div>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mt-4 sm:mt-0 w-full sm:w-auto">
                <select className="border border-gray-300 rounded-lg px-4 py-2 text-sm w-full sm:w-auto">
                  <option>Alle Buchungen</option>
                  <option>Angefragt</option>
                  <option>Bestätigt</option>
                  <option>Abgeschlossen</option>
                  <option>Storniert</option>
                </select>
                <button className="bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition flex items-center justify-center text-sm w-full sm:w-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Exportieren
                </button>
              </div>
            </div>

            {/* Mobile Cards for Bookings */}
            <div className="block sm:hidden space-y-4">
              {bookings.map((booking) => (
                <div key={booking.id} className="bg-white rounded-lg shadow-sm p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                        {booking.customerName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-gray-900">{booking.customerName}</p>
                        <p className="text-sm text-gray-500">{booking.customerEmail}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      booking.status === 'confirmed'
                        ? 'bg-green-100 text-green-800'
                        : booking.status === 'completed'
                        ? 'bg-blue-100 text-blue-800'
                        : booking.status === 'cancelled'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {booking.status === 'confirmed' ? 'Bestätigt'
                        : booking.status === 'completed' ? 'Abgeschlossen'
                        : booking.status === 'cancelled' ? 'Storniert'
                        : 'Angefragt'}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Service:</span>
                      <span className="font-medium">{booking.service}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Datum:</span>
                      <span className="font-medium">{formatDate(booking.date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Zeit:</span>
                      <span className="font-medium">{booking.time} Uhr</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Preis:</span>
                      <span className="font-medium">{formatCurrency(booking.price)}</span>
                    </div>
                  </div>
                  {booking.status === 'pending' && (
                    <div className="flex space-x-3 mt-4">
                      <button
                        onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm"
                      >
                        Bestätigen
                      </button>
                      <button
                        onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                        className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition text-sm"
                      >
                        Ablehnen
                      </button>
                    </div>
                  )}
                  {booking.status === 'confirmed' && (
                    <button
                      onClick={() => updateBookingStatus(booking.id, 'completed')}
                      className="w-full mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
                    >
                      Abschließen
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden sm:block bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kunde
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Service
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Datum & Zeit
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Preis
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aktionen
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {bookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                                {booking.customerName.split(' ').map(n => n[0]).join('')}
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{booking.customerName}</div>
                              <div className="text-sm text-gray-500">{booking.customerEmail}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{booking.service}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDate(booking.date)}</div>
                          <div className="text-sm text-gray-500">{booking.time} Uhr</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{formatCurrency(booking.price)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            booking.status === 'confirmed'
                              ? 'bg-green-100 text-green-800'
                              : booking.status === 'completed'
                              ? 'bg-blue-100 text-blue-800'
                              : booking.status === 'cancelled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {booking.status === 'confirmed' ? 'Bestätigt'
                              : booking.status === 'completed' ? 'Abgeschlossen'
                              : booking.status === 'cancelled' ? 'Storniert'
                              : 'Angefragt'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {booking.status === 'pending' && (
                            <div className="flex justify-end space-x-3">
                              <button
                                onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                                className="text-green-600 hover:text-green-900"
                              >
                                Bestätigen
                              </button>
                              <button
                                onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                                className="text-red-600 hover:text-red-900"
                              >
                                Ablehnen
                              </button>
                            </div>
                          )}
                          {booking.status === 'confirmed' && (
                            <button
                              onClick={() => updateBookingStatus(booking.id, 'completed')}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Abschließen
                            </button>
                          )}
                          <button className="text-gray-400 hover:text-gray-600 ml-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab - Mobile Friendly Layout */}
        {activeTab === 'analytics' && analytics && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
              <div>
                <h2 className="text-2xl font-bold">Analytics</h2>
                <p className="text-gray-600 mt-1">Detaillierte Einblicke in Ihre Performance</p>
              </div>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                <select
                  value={selectedTimeRange}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => 
                    setSelectedTimeRange(e.target.value as 'today' | 'week' | 'month' | 'year')
                  }
                  className="border border-gray-300 rounded-lg px-4 py-2 text-sm w-full sm:w-auto"
                >
                  <option value="today">Heute</option>
                  <option value="week">Diese Woche</option>
                  <option value="month">Dieser Monat</option>
                  <option value="year">Dieses Jahr</option>
                </select>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm w-full sm:w-auto">
                  Bericht exportieren
                </button>
              </div>
            </div>

            {/* Key Metrics - Mobile Friendly Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-500">Gesamtumsatz</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    +15%
                  </span>
                </div>
                <p className="mt-2 text-3xl font-semibold text-gray-900">{formatCurrency(analytics.totalRevenue)}</p>
                <p className="mt-1 text-sm text-gray-500">Letzte 30 Tage</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-500">Monatlicher Umsatz</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    +8%
                  </span>
                </div>
                <p className="mt-2 text-3xl font-semibold text-gray-900">{formatCurrency(analytics.monthlyRevenue)}</p>
                <p className="mt-1 text-sm text-gray-500">Aktueller Monat</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-500">Buchungen Gesamt</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    +23%
                  </span>
                </div>
                <p className="mt-2 text-3xl font-semibold text-gray-900">{analytics.totalBookings}</p>
                <p className="mt-1 text-sm text-gray-500">Alle Zeit</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-500">Bestätigungsrate</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    +5%
                  </span>
                </div>
                <p className="mt-2 text-3xl font-semibold text-gray-900">{analytics.confirmationRate}%</p>
                <p className="mt-1 text-sm text-gray-500">Akzeptierte Buchungen</p>
              </div>
            </div>

           {/* Charts & Detailed Stats - Mobile Friendly */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Revenue Chart */}
              <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-4 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Umsatzentwicklung</h3>
                <div className="h-64 sm:h-80 flex items-center justify-center bg-gray-50 rounded-lg">
                  {/* Here you would integrate a chart library */}
                  <p className="text-gray-500 text-center px-4">Umsatz-Chart wird hier angezeigt</p>
                </div>
              </div>

              {/* Top Services */}
              <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Top Services</h3>
                <div className="space-y-4">
                  {analytics.topServices.map((service, index) => (
                    <div key={index} className="flex items-center">
                      <div className="flex-grow min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <p className="text-sm font-medium text-gray-900 truncate">{service.name}</p>
                          <p className="text-sm text-gray-500 ml-2 flex-shrink-0">{service.count} Buchungen</p>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${(service.count / analytics.totalBookings) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            </div>
            )}

            {/* Settings Tab - Mobile Friendly Form */}
            {activeTab === 'settings' && (
              <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-lg shadow-sm">
                  {/* Business Information */}
                  <div className="p-4 sm:p-6 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Geschäftsinformationen</h3>
                    <form className="space-y-6">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-medium text-gray-700">Geschäftsname</label>
                          <input
                            type="text"
                            defaultValue={slots[0]?.name || ''}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Geschäftstyp</label>
                          <select className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm">
                            <option>Friseur</option>
                            <option>Arzt</option>
                            <option>Zahnarzt</option>
                            <option>Therapeut</option>
                            <option>Gastro</option>
                          </select>
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-medium text-gray-700">Adresse</label>
                          <input
                            type="text"
                            defaultValue={slots[0]?.address || ''}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Telefon</label>
                          <input
                            type="tel"
                            defaultValue={slots[0]?.phone || ''}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Website</label>
                          <input
                            type="url"
                            defaultValue={slots[0]?.website || ''}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                          />
                        </div>
                      </div>
                    </form>
                  </div>

                  {/* Notification Settings */}
                  <div className="p-4 sm:p-6 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Benachrichtigungen</h3>
                    <div className="space-y-4">
                      <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                        <div>
                          <p className="text-sm font-medium text-gray-900">E-Mail-Benachrichtigungen</p>
                          <p className="text-sm text-gray-500">Erhalten Sie E-Mails für neue Buchungen</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer mt-2 sm:mt-0">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                        <div>
                          <p className="text-sm font-medium text-gray-900">SMS-Benachrichtigungen</p>
                          <p className="text-sm text-gray-500">SMS für dringende Updates</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer mt-2 sm:mt-0">
                          <input type="checkbox" className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="px-4 sm:px-6 py-4 bg-gray-50">
                    <button className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                      Änderungen speichern
                    </button>
                  </div>
                </div>
              </div>
            )}
            </main>

            {/* Add Slot Modal - Mobile Friendly */}
            {showAddSlotModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
                <div className="bg-white rounded-lg w-full max-w-2xl my-8">
                  <div className="p-4 sm:p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-semibold">Neues Angebot erstellen</h3>
                      <button
                        onClick={() => setShowAddSlotModal(false)}
                        className="text-gray-400 hover:text-gray-600 p-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <form className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Name des Angebots
                        </label>
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="z.B. Haarschnitt Premium"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Kategorie
                          </label>
                          <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                            <option value="">Bitte wählen</option>
                            <option value="Friseur">Friseur</option>
                            <option value="Arzt">Arzt</option>
                            <option value="Zahnarzt">Zahnarzt</option>
                            <option value="Therapeut">Therapeut</option>
                            <option value="Gastro">Gastro</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Unterkategorie
                          </label>
                          <input
                            type="text"
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="z.B. Herrenhaarschnitt"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Preis (CHF)
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-gray-500 text-sm">CHF</span>
                            </div>
                            <input
                              type="number"
                              className="w-full border border-gray-300 rounded-md pl-14 pr-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              placeholder="0.00"
                              step="0.01"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Dauer (Minuten)
                          </label>
                          <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                            <option value="15">15 Minuten</option>
                            <option value="30">30 Minuten</option>
                            <option value="45">45 Minuten</option>
                            <option value="60">1 Stunde</option>
                            <option value="90">1.5 Stunden</option>
                            <option value="120">2 Stunden</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Beschreibung
                        </label>
                        <textarea
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          rows={4}
                          placeholder="Beschreiben Sie Ihr Angebot..."
                        ></textarea>
                      </div>

                      {/* Advanced Settings */}
                      <div className="border-t border-gray-200 pt-6">
                        <h4 className="text-lg font-medium text-gray-900 mb-4">Erweiterte Einstellungen</h4>

                        <div className="space-y-4">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="onlineBooking"
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="onlineBooking" className="ml-2 block text-sm text-gray-900">
                              Online-Buchung erlauben
                            </label>
                          </div>

                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="instantConfirmation"
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="instantConfirmation" className="ml-2 block text-sm text-gray-900">
                              Sofortige Bestätigung
                            </label>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Maximale Buchungen pro Tag
                            </label>
                            <input
                              type="number"
                              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Unbegrenzt"
                              min="1"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200">
                        <button
                          type="button"
                          onClick={() => setShowAddSlotModal(false)}
                          className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Abbrechen
                        </button>
                        <button
                          type="submit"
                          className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Erstellen
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* Footer - Mobile Optimized */}
            <footer className="bg-white border-t mt-12">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                  <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 text-center sm:text-left">
                    <span className="text-gray-900 font-semibold">Nowly Provider</span>
                    <span className="hidden sm:inline text-gray-400">|</span>
                    <p className="text-gray-500 text-sm">
                      © {new Date().getFullYear()} Nowly. Alle Rechte vorbehalten.
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-center md:justify-end gap-4 sm:gap-6">
                    <Link href="/help" className="text-gray-500 hover:text-gray-700 text-sm">
                      Hilfe & Support
                    </Link>
                    <Link href="/docs" className="text-gray-500 hover:text-gray-700 text-sm">
                      Dokumentation
                    </Link>
                    <Link href="/terms" className="text-gray-500 hover:text-gray-700 text-sm">
                      AGB für Provider
                    </Link>
                    <Link href="/contact" className="text-gray-500 hover:text-gray-700 text-sm">
                      Kontakt
                    </Link>
                  </div>
                </div>
              </div>
            </footer>

            {/* Success Message - floating notification */}
            {false && (
              <div className="fixed bottom-4 right-4 left-4 sm:left-auto bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center justify-center sm:justify-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Erfolgreich gespeichert
              </div>
            )}
            </div>
            );
            }