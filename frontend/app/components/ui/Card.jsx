'use client';

export default function Card({ children, className = '', hover = false, ...props }) {
    const baseStyles = 'glass-strong rounded-2xl p-6 shadow-xl border border-slate-700/50';
    const hoverStyles = hover ? 'hover-lift cursor-pointer' : '';

    return (
        <div className={`${baseStyles} ${hoverStyles} ${className}`} {...props}>
            {children}
        </div>
    );
}
