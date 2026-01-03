'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
    const router = useRouter()
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        work_type: '',
        working_hours: '',
        mobile_usage: '',
        health_info: ''
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            // Convert numeric fields
            const payload = {
                ...formData,
                working_hours: formData.working_hours ? parseFloat(formData.working_hours) : null,
                mobile_usage: formData.mobile_usage ? parseFloat(formData.mobile_usage) : null
            }

            const response = await fetch('http://localhost:8000/api/v1/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.detail || 'Registration failed')
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
        <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br from-[var(--bg-primary)] via-white to-[var(--bg-secondary)]">
            <div className="absolute inset-0 flex justify-center items-center pointer-events-none -z-10">
                <div className="w-[1000px] h-[700px] bg-gradient-to-br from-primary/8 to-secondary/8 rounded-full blur-[150px] opacity-50"></div>
            </div>
            <div className="card max-w-2xl w-full animate-fade-in bg-white shadow-lg border border-primary/10 rounded-2xl">
                <h1 className="text-3xl font-bold mb-2 gradient-text">Create Your Account</h1>
                <p className="text-text-secondary mb-6">Join us to start monitoring your stress levels</p>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Full Name *</label>
                            <input
                                type="text"
                                required
                                className="input"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="John Doe"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Email *</label>
                            <input
                                type="email"
                                required
                                className="input"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="your@email.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Password *</label>
                        <input
                            type="password"
                            required
                            minLength={6}
                            className="input"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            placeholder="At least 6 characters"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Work Type</label>
                            <select
                                className="input"
                                value={formData.work_type}
                                onChange={(e) => setFormData({ ...formData, work_type: e.target.value })}
                            >
                                <option value="">Select...</option>
                                <option value="office">Office Work</option>
                                <option value="remote">Remote Work</option>
                                <option value="field">Field Work</option>
                                <option value="student">Student</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Working Hours/Day</label>
                            <input
                                type="number"
                                step="0.5"
                                min="0"
                                max="24"
                                className="input"
                                value={formData.working_hours}
                                onChange={(e) => setFormData({ ...formData, working_hours: e.target.value })}
                                placeholder="8"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Mobile Usage (hours/day)</label>
                        <input
                            type="number"
                            step="0.5"
                            min="0"
                            max="24"
                            className="input"
                            value={formData.mobile_usage}
                            onChange={(e) => setFormData({ ...formData, mobile_usage: e.target.value })}
                            placeholder="4"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Health Information (Optional)</label>
                        <textarea
                            className="input min-h-[100px]"
                            value={formData.health_info}
                            onChange={(e) => setFormData({ ...formData, health_info: e.target.value })}
                            placeholder="Any relevant health conditions, medications, or concerns..."
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary w-full"
                        disabled={loading}
                    >
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                <p className="mt-6 text-center text-muted">
                    Already have an account?{' '}
                    <a href="/login" className="text-primary hover:underline">
                        Sign in
                    </a>
                </p>
            </div>
        </div>
    )
}
