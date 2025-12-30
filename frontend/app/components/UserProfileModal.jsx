'use client';

import { useState } from 'react';
import GradientButton from './ui/GradientButton';

export default function UserProfileModal({ isOpen, onClose, onSave, initialData = {} }) {
    const [formData, setFormData] = useState({
        job_role: initialData.job_role || '',
        work_hours: initialData.work_hours || '',
        sleep_hours: initialData.sleep_hours || '',
        work_type: initialData.work_type || 'Onsite',
        electronics_usage: initialData.electronics_usage || ''
    });
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSave({
                ...formData,
                work_hours: parseInt(formData.work_hours),
                sleep_hours: parseInt(formData.sleep_hours),
                electronics_usage: parseInt(formData.electronics_usage)
            });
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm fade-in">
            <div className="bg-white rounded-2xl w-full max-w-lg p-8 border border-gray-100 shadow-2xl relative overflow-hidden">
                {/* Background Glow - Subtle for light theme */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Complete Your Profile</h2>
                <p className="text-gray-500 text-center mb-8">Help us personalize your stress analysis</p>

                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                    <div>
                        <label className="block text-gray-700 mb-2 text-sm font-medium">Job Role</label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors"
                            placeholder="e.g. Software Engineer"
                            value={formData.job_role}
                            onChange={(e) => setFormData({ ...formData, job_role: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-700 mb-2 text-sm font-medium">Work Hours / Day</label>
                            <input
                                type="number"
                                required
                                min="0" max="24"
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors"
                                value={formData.work_hours}
                                onChange={(e) => setFormData({ ...formData, work_hours: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-2 text-sm font-medium">Sleep Hours</label>
                            <input
                                type="number"
                                required
                                min="0" max="24"
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-colors"
                                value={formData.sleep_hours}
                                onChange={(e) => setFormData({ ...formData, sleep_hours: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-gray-700 mb-2 text-sm font-medium">Work Type</label>
                        <div className="grid grid-cols-3 gap-3">
                            {['Remote', 'Onsite', 'Hybrid'].map(type => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, work_type: type })}
                                    className={`py-2 rounded-lg text-sm font-medium transition-all ${formData.work_type === type
                                        ? 'bg-indigo-600 text-white shadow-md'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-gray-700 mb-2 text-sm font-medium">Electronics Usage (Hours/Day)</label>
                        <input
                            type="number"
                            required
                            min="0" max="24"
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none transition-colors"
                            value={formData.electronics_usage}
                            onChange={(e) => setFormData({ ...formData, electronics_usage: e.target.value })}
                        />
                    </div>

                    <GradientButton
                        type="submit"
                        loading={loading}
                        className="w-full mt-4"
                        variant="primary"
                    >
                        Save Profile
                    </GradientButton>
                </form>
            </div>
        </div>
    );
}
