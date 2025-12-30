'use client';

export default function LoadingSpinner({
    size = 'md',
    variant = 'orbit',
    text = '',
    color = 'blue'
}) {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
        xl: 'w-16 h-16'
    };

    const colorClasses = {
        blue: 'border-blue-500',
        purple: 'border-purple-500',
        pink: 'border-pink-500',
        cyan: 'border-cyan-500'
    };

    if (variant === 'orbit') {
        return (
            <div className="flex flex-col items-center justify-center gap-3">
                <div className={`relative ${sizeClasses[size]}`}>
                    <div className={`absolute inset-0 rounded-full border-4 border-transparent ${colorClasses[color]} border-t-transparent animate-spin`}></div>
                    <div className={`absolute inset-2 rounded-full border-4 border-transparent ${colorClasses[color].replace('500', '400')} border-t-transparent animate-spin`} style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
                </div>
                {text && <p className="text-sm text-slate-400 animate-pulse">{text}</p>}
            </div>
        );
    }

    if (variant === 'dots') {
        return (
            <div className="flex flex-col items-center justify-center gap-3">
                <div className="flex gap-2">
                    <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-r from-blue-500 to-purple-600 animate-bounce`}></div>
                    <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-r from-purple-500 to-pink-600 animate-bounce`} style={{ animationDelay: '0.1s' }}></div>
                    <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-r from-pink-500 to-red-600 animate-bounce`} style={{ animationDelay: '0.2s' }}></div>
                </div>
                {text && <p className="text-sm text-slate-400 animate-pulse">{text}</p>}
            </div>
        );
    }

    if (variant === 'pulse') {
        return (
            <div className="flex flex-col items-center justify-center gap-3">
                <div className={`relative ${sizeClasses[size]}`}>
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 animate-ping"></div>
                    <div className="relative rounded-full bg-gradient-to-r from-blue-500 to-purple-600 w-full h-full"></div>
                </div>
                {text && <p className="text-sm text-slate-400 animate-pulse">{text}</p>}
            </div>
        );
    }

    // Default spinner
    return (
        <div className="flex flex-col items-center justify-center gap-3">
            <div className={`${sizeClasses[size]} border-4 ${colorClasses[color]} border-t-transparent rounded-full animate-spin`}></div>
            {text && <p className="text-sm text-slate-400 animate-pulse">{text}</p>}
        </div>
    );
}
