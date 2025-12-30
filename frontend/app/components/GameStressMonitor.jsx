'use client';

export default function GameStressMonitor({ stressData, isVisible = true }) {
    if (!isVisible) return null;

    const { stress_level = 'Unknown', stress_score = 0, confidence = 0 } = stressData || {};

    const getColor = (level) => {
        switch (level) {
            case 'Low': return 'from-green-500 to-emerald-600';
            case 'Medium': return 'from-yellow-500 to-orange-600';
            case 'High': return 'from-red-500 to-pink-600';
            default: return 'from-gray-500 to-slate-600';
        }
    };

    return (
        <div className="fixed top-20 right-4 z-40 w-64 glass-strong rounded-xl p-4 shadow-2xl border border-slate-600/50">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-white">Live Stress Monitor</h3>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>

            {/* Stress Level Badge */}
            <div className="mb-3">
                <div className={`bg-gradient-to-r ${getColor(stress_level)} text-white px-4 py-2 rounded-lg text-center font-bold shadow-lg`}>
                    {stress_level}
                </div>
            </div>

            {/* Stress Score */}
            <div className="mb-3">
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Stress Level</span>
                    <span>{stress_score}%</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                        className={`h-full bg-gradient-to-r ${getColor(stress_level)} transition-all duration-500`}
                        style={{ width: `${stress_score}%` }}
                    ></div>
                </div>
            </div>

            {/* Confidence */}
            <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Confidence</span>
                    <span>{(confidence * 100).toFixed(0)}%</span>
                </div>
                <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-blue-500 transition-all duration-500"
                        style={{ width: `${confidence * 100}%` }}
                    ></div>
                </div>
            </div>

            {/* Mini Camera Indicator */}
            <div className="mt-3 pt-3 border-t border-slate-600/50">
                <div className="flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <span>Camera Active</span>
                    </div>
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                </div>
            </div>
        </div>
    );
}
