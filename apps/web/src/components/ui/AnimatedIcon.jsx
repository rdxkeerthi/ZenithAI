'use client'
import React from 'react'

const AnimatedIcon = ({ type, className }) => {
    // Determine which icon info to render
    const getIcon = () => {
        switch (type) {
            case 'brain':
                return (
                    <div className={`relative w-12 h-12 ${className}`}>
                        <div className="absolute inset-0 bg-indigo-500 rounded-full opacity-20 animate-pulse-slow"></div>
                        <div className="absolute inset-2 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-full animate-blob"></div>
                        <div className="absolute inset-0 flex items-center justify-center text-white text-xl font-bold z-10">🧠</div>
                        <div className="absolute -inset-1 rounded-full border border-indigo-200 opacity-50 animate-spin-slow" style={{ animationDuration: '10s' }}></div>
                    </div>
                )
            case 'stress':
                return (
                    <div className={`relative w-12 h-12 ${className}`}>
                        <div className="absolute inset-0 bg-amber-500 rounded-full opacity-20 animate-pulse-slow"></div>
                        <svg className="w-full h-full p-2 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path className="animate-pulse" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                        </svg>
                    </div>
                )
            case 'heart':
                return (
                    <div className={`relative w-12 h-12 ${className}`}>
                        <div className="absolute inset-0 bg-emerald-500 rounded-full opacity-20 animate-pulse-slow"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-6 h-6 bg-emerald-500 rotate-45 animate-beat"></div>
                        </div>
                        {/* Particles */}
                        <div className="absolute top-0 right-0 w-2 h-2 bg-emerald-300 rounded-full animate-float-slow"></div>
                        <div className="absolute bottom-1 left-1 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-float"></div>
                    </div>
                )
            case 'energy':
                return (
                    <div className={`relative w-12 h-12 ${className}`}>
                        <div className="absolute inset-0 bg-blue-500 rounded-full opacity-20 animate-pulse-slow"></div>
                        <svg className="w-full h-full p-2 text-blue-600 animate-pulse-glow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                        </svg>
                    </div>
                )
            case 'chart':
                return (
                    <div className={`relative w-12 h-12 ${className}`}>
                        <div className="absolute inset-0 bg-violet-500 rounded-full opacity-20"></div>
                        <div className="absolute bottom-2 left-2 w-2 h-4 bg-violet-400 rounded-t animate-slide-up" style={{ animationDelay: '0ms' }}></div>
                        <div className="absolute bottom-2 left-5 w-2 h-6 bg-violet-500 rounded-t animate-slide-up" style={{ animationDelay: '100ms' }}></div>
                        <div className="absolute bottom-2 left-8 w-2 h-3 bg-violet-300 rounded-t animate-slide-up" style={{ animationDelay: '200ms' }}></div>
                    </div>
                )
            default:
                return null
        }
    }

    return getIcon()
}

export default AnimatedIcon
