'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
    const router = useRouter()
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const response = await fetch('http://localhost:8000/api/v1/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.detail || 'Login failed')
            }

            // Store token and user data
            localStorage.setItem('token', data.access_token)
            localStorage.setItem('user', JSON.stringify(data.user))

            // Redirect to dashboard
            router.push('/dashboard')
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-[var(--bg-primary)] via-white to-[var(--bg-secondary)]">
            <div className="absolute inset-0 flex justify-center items-center pointer-events-none -z-10">
                <div className="w-[1000px] h-[700px] bg-gradient-to-br from-primary/8 to-secondary/8 rounded-full blur-[150px] opacity-50"></div>
            </div>
            <div className="card max-w-md w-full animate-fade-in bg-white shadow-lg border border-primary/10 rounded-2xl">
                <h1 className="text-3xl font-bold mb-2 gradient-text">Welcome Back</h1>
                <p className="text-text-secondary mb-6">Sign in to continue your stress monitoring journey</p>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-text-primary mb-2">Email</label>
                        <input
                            type="email"
                            required
                            className="w-full px-4 py-3 border border-primary/15 rounded-lg bg-[var(--bg-tertiary)] text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="your@email.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-text-primary mb-2">Password</label>
                        <input
                            type="password"
                            required
                            className="w-full px-4 py-3 border border-primary/15 rounded-lg bg-[var(--bg-tertiary)] text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary w-full py-3 text-base font-semibold rounded-lg transition-all"
                        disabled={loading}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <p className="mt-6 text-center text-text-secondary">
                    Don't have an account?{' '}
                    <a href="/register" className="text-primary font-semibold hover:text-accent transition-colors">
                        Create one
                    </a>
                </p>
            </div>
        </div>
    )
}
