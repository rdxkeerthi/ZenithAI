'use client';

export default function GlassCard({
    children,
    className = '',
    variant = 'default',
    hover = true,
    onClick
}) {
    const variants = {
        default: 'glass',
        strong: 'glass-strong',
        ultra: 'glass-ultra',
        bordered: 'glass-border-animated'
    };

    const hoverClass = hover ? 'hover-lift hover-glow cursor-pointer' : '';
    const baseClass = variants[variant] || variants.default;

    return (
        <div
            className={`${baseClass} ${hoverClass} rounded-2xl p-6 transition-smooth ${className}`}
            onClick={onClick}
        >
            {children}
        </div>
    );
}
