'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import authService from './services/auth';
import GradientButton from './components/ui/GradientButton';

export default function Register() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const getPasswordStrength = (pass) => {
        if (!pass) return { strength: 0, label: '', color: '' };
        let strength = 0;
        if (pass.length >= 6) strength++;
        if (pass.length >= 10) strength++;
        if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) strength++;
        if (/\d/.test(pass)) strength++;
        if (/[^a-zA-Z\d]/.test(pass)) strength++;

        if (strength <= 2) return { strength, label: 'Weak', color: 'from-red-500 to-red-600' };
        if (strength <= 3) return { strength, label: 'Medium', color: 'from-yellow-500 to-orange-600' };
        return { strength, label: 'Strong', color: 'from-green-500 to-emerald-600' };
    };

    const passwordStrength = getPasswordStrength(password);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const trimmedName = name.trim();
        const trimmedEmail = email.trim();
        const trimmedPassword = password.trim();
        const trimmedConfirm = confirmPassword.trim();

        if (!trimmedName || !trimmedEmail || !trimmedPassword || !trimmedConfirm) {
            setError('Please fill in all fields');
            return;
        }

        if (trimmedPassword !== trimmedConfirm) {
            setError('Passwords do not match');
            return;
        }

        if (trimmedPassword.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        setLoading(true);

        try {
            const result = await authService.register(email.trim(), name.trim(), password.trim());

            if (result.success) {
                authService.setUser(result.user);
                router.push('/dashboard');
            } else {
                // Handle error message properly
                const errorMsg = typeof result.error === 'string'
                    ? result.error
                    : result.error?.message || 'Registration failed. Please try again.';
                setError(errorMsg);
            }
        } catch (err) {
            // Handle caught errors properly
            const errorMsg = typeof err === 'string'
                ? err
                : err?.message || 'Network error. Please check your connection.';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
            {/* Animated Blob Shapes */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 right-10 w-96 h-96 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-full blur-3xl float morph"></div>
                <div className="absolute bottom-20 left-10 w-[500px] h-[500px] bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full blur-3xl float-slow" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/3 right-1/3 w-[400px] h-[400px] bg-gradient-to-r from-cyan-500/10 to-pink-500/10 rounded-full blur-3xl morph" style={{ animationDelay: '2s' }}></div>
            </div>

            <div className="w-full max-w-md relative z-10 fade-in">
                {/* Logo/Brand */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-pink-500 via-purple-600 to-blue-500 rounded-3xl mb-6 shadow-2xl shadow-pink-500/40 hover-scale transition-smooth pulse-glow">
                        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                    </div>
                    <h1 className="text-6xl font-bold text-white mb-4 gradient-text-animated">
                        Join StressGuardAI
                    </h1>
                    <p className="text-slate-300 text-lg">
                        Create your account and start <span className="gradient-text-cosmic font-semibold">monitoring</span>
                    </p>
                </div>

                {/* Register Card with 3D Tilt Effect */}
                <div className="glass-ultra rounded-3xl p-10 shadow-3xl border border-white/10 card-tilt-3d gradient-border-animated">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-5 py-4 rounded-xl flex items-center space-x-3 fade-in shake backdrop-blur-sm">
                                <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <span className="font-medium">{error}</span>
                            </div>
                        )}

                        {/* Name Input */}
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500"></div>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                style={{ minHeight: '3.5rem' }}
                                className="peer w-full bg-slate-800/60 border-2 border-slate-600/50 text-white px-6 py-5 rounded-xl focus:outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-500/20 transition-all placeholder-transparent backdrop-blur-sm text-lg"
                                placeholder="Full Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={loading}
                            />
                            <label
                                htmlFor="name"
                                className="absolute left-6 -top-3.5 bg-gradient-to-r from-slate-800 to-slate-900 px-3 py-1 text-sm text-slate-400 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-5 peer-placeholder-shown:text-slate-500 peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-pink-400 peer-focus:font-semibold rounded-full"
                            >
                                Full Name
                            </label>
                        </div>

                        {/* Email Input */}
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500"></div>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                style={{ minHeight: '3.5rem' }}
                                className="peer w-full bg-slate-800/60 border-2 border-slate-600/50 text-white px-6 py-5 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all placeholder-transparent backdrop-blur-sm text-lg"
                                placeholder="Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading}
                            />
                            <label
                                htmlFor="email"
                                className="absolute left-6 -top-3.5 bg-gradient-to-r from-slate-800 to-slate-900 px-3 py-1 text-sm text-slate-400 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-5 peer-placeholder-shown:text-slate-500 peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-purple-400 peer-focus:font-semibold rounded-full"
                            >
                                Email Address
                            </label>
                        </div>

                        {/* Password Input */}
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500"></div>
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                required
                                minLength={6}
                                style={{ minHeight: '3.5rem' }}
                                className="peer w-full bg-slate-800/60 border-2 border-slate-600/50 text-white px-6 py-5 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all placeholder-transparent pr-16 backdrop-blur-sm text-lg"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading}
                            />
                            <label
                                htmlFor="password"
                                className="absolute left-6 -top-3.5 bg-gradient-to-r from-slate-800 to-slate-900 px-3 py-1 text-sm text-slate-400 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-5 peer-placeholder-shown:text-slate-500 peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-blue-400 peer-focus:font-semibold rounded-full"
                            >
                                Password
                            </label>
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-5 top-5 text-slate-400 hover:text-white transition-colors p-1.5 hover:bg-slate-700/50 rounded-lg"
                            >
                                {showPassword ? (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                    </svg>
                                ) : (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                )}
                            </button>
                        </div>

                        {/* Password Strength Indicator */}
                        {password && (
                            <div className="space-y-2 fade-in">
                                <div className="flex justify-between text-xs text-slate-400">
                                    <span className="font-semibold">Password Strength</span>
                                    <span className={`font-bold ${passwordStrength.strength >= 3 ? 'text-green-400' : passwordStrength.strength >= 2 ? 'text-yellow-400' : 'text-red-400'}`}>
                                        {passwordStrength.label}
                                    </span>
                                </div>
                                <div className="h-3 bg-slate-700/50 rounded-full overflow-hidden backdrop-blur-sm">
                                    <div
                                        className={`h-full bg-gradient-to-r ${passwordStrength.color} transition-all duration-500 ease-out shadow-lg`}
                                        style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}

                        {/* Confirm Password Input */}
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500"></div>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type={showPassword ? 'text' : 'password'}
                                required
                                minLength={6}
                                style={{ minHeight: '3.5rem' }}
                                className="peer w-full bg-slate-800/60 border-2 border-slate-600/50 text-white px-6 py-5 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all placeholder-transparent backdrop-blur-sm text-lg"
                                placeholder="Confirm Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                disabled={loading}
                            />
                            <label
                                htmlFor="confirmPassword"
                                className="absolute left-6 -top-3.5 bg-gradient-to-r from-slate-800 to-slate-900 px-3 py-1 text-sm text-slate-400 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-5 peer-placeholder-shown:text-slate-500 peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-cyan-400 peer-focus:font-semibold rounded-full"
                            >
                                Confirm Password
                            </label>
                        </div>

                        {/* Submit Button */}
                        <GradientButton
                            type="submit"
                            disabled={loading}
                            loading={loading}
                            variant="secondary"
                            size="lg"
                            className="w-full text-lg font-bold mt-8"
                            style={{ minHeight: '3.5rem' }}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center space-x-3">
                                    <svg className="spinner w-6 h-6" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Creating account...</span>
                                </span>
                            ) : 'Create Account'}
                        </GradientButton>
                    </form>

                    {/* Divider */}
                    <div className="relative my-10">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-600/50"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-5 py-2 bg-slate-800/80 text-slate-400 backdrop-blur-sm rounded-full font-medium">Already have an account?</span>
                        </div>
                    </div>

                    {/* Login Link */}
                    <Link
                        href="/login"
                        style={{ minHeight: '3.5rem' }}
                        className="flex items-center justify-center w-full text-center glass border-2 border-slate-600/50 hover:border-purple-500/50 text-white font-semibold py-5 rounded-xl transition-all duration-300 hover-lift hover:shadow-glow-purple"
                    >
                        Sign In
                    </Link>
                </div>

                {/* Footer */}
                <p className="text-center text-slate-400 text-sm mt-10 fade-in" style={{ animationDelay: '0.2s' }}>
                    By creating an account, you agree to our{' '}
                    <a href="#" className="text-purple-400 hover:text-purple-300 transition-colors font-medium hover:underline">Terms</a>
                    {' '}and{' '}
                    <a href="#" className="text-purple-400 hover:text-purple-300 transition-colors font-medium hover:underline">Privacy Policy</a>
                </p>
            </div>
        </div>
    );
}
