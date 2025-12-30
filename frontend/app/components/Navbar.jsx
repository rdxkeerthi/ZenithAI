'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import authService from '../services/auth';

export default function Navbar() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        setUser(authService.getUser());
    }, []);

    const handleLogout = () => {
        authService.logout();
        authService.clearUser();
        router.push('/login');
    };

    if (!mounted) {
        return null; // Prevent hydration mismatch
    }

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 glass-apple">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link href="/dashboard" className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-lg">S</span>
                            </div>
                            <h1 className="text-xl font-semibold text-gray-900">
                                StressGuardAI
                            </h1>
                        </Link>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Link
                            href="/dashboard"
                            className="text-gray-700 hover:text-black px-4 py-2 text-sm font-medium transition-colors"
                        >
                            Dashboard
                        </Link>
                        <Link
                            href="/analysis"
                            className="text-gray-700 hover:text-black px-4 py-2 text-sm font-medium transition-colors"
                        >
                            Analysis
                        </Link>
                        <Link
                            href="/games"
                            className="text-gray-700 hover:text-black px-4 py-2 text-sm font-medium transition-colors"
                        >
                            Games
                        </Link>
                        <Link
                            href="/reports"
                            className="text-gray-700 hover:text-black px-4 py-2 text-sm font-medium transition-colors"
                        >
                            Reports
                        </Link>

                        {user && (
                            <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-gray-300">
                                <div className="flex items-center space-x-2">
                                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                        <span className="text-gray-700 text-sm font-semibold">
                                            {user.name?.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <span className="text-gray-900 text-sm font-medium">{user.name}</span>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-100 px-4 py-1.5 rounded-full text-sm font-medium transition-all"
                                >
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}

