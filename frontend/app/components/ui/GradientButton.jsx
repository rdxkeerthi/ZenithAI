'use client';

import { useState } from 'react';

export default function GradientButton({
    children,
    onClick,
    type = 'button',
    disabled = false,
    loading = false,
    variant = 'primary',
    size = 'md',
    icon,
    className = ''
}) {
    const [ripples, setRipples] = useState([]);

    const variants = {
        primary: 'from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-blue-500/30 hover:shadow-blue-500/50',
        secondary: 'from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 shadow-pink-500/30 hover:shadow-pink-500/50',
        success: 'from-green-500 to-cyan-600 hover:from-green-600 hover:to-cyan-700 shadow-green-500/30 hover:shadow-green-500/50',
        danger: 'from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 shadow-red-500/30 hover:shadow-red-500/50',
        cosmic: 'from-purple-500 via-pink-500 to-blue-500 hover:from-purple-600 hover:via-pink-600 hover:to-blue-600 shadow-purple-500/30 hover:shadow-purple-500/50'
    };

    const sizes = {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg'
    };

    const handleClick = (e) => {
        if (disabled || loading) return;

        // Create ripple effect
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const newRipple = {
            x,
            y,
            id: Date.now()
        };

        setRipples(prev => [...prev, newRipple]);
        setTimeout(() => {
            setRipples(prev => prev.filter(r => r.id !== newRipple.id));
        }, 600);

        if (onClick) onClick(e);
    };

    return (
        <button
            type={type}
            onClick={handleClick}
            disabled={disabled || loading}
            className={`
        relative overflow-hidden
        bg-gradient-to-r ${variants[variant]}
        text-white font-semibold rounded-lg
        ${sizes[size]}
        transition-all duration-200
        shadow-lg
        disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center justify-center gap-2
        ${className}
      `}
        >
            {/* Ripple effects */}
            {ripples.map(ripple => (
                <span
                    key={ripple.id}
                    className="absolute bg-white rounded-full opacity-50 animate-[ripple_0.6s_ease-out]"
                    style={{
                        left: ripple.x,
                        top: ripple.y,
                        width: 0,
                        height: 0,
                    }}
                />
            ))}

            {/* Content */}
            {loading ? (
                <>
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Loading...</span>
                </>
            ) : (
                <>
                    {icon && <span>{icon}</span>}
                    <span>{children}</span>
                </>
            )}
        </button>
    );
}
