'use client';

import RealTimeGraph from './RealTimeGraph';

export default function StressMeter({ stressData, stressHistory = [] }) {
    const { stress_level = 'Unknown', stress_score = 0, confidence = 0, micro_features = {} } = stressData || {};

    const getColor = (level) => {
        switch (level) {
            case 'Low': return 'text-green-600 bg-green-100';
            case 'Medium': return 'text-yellow-600 bg-yellow-100';
            case 'High': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getProgressColor = (score) => {
        if (score < 33) return 'bg-green-500';
        if (score < 66) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4">Real-time Stress Analysis</h3>

            {!stressData && stressHistory.length === 0 ? (
                <div className="text-center py-8">
                    <div className="text-gray-400 mb-2">
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </div>
                    <p className="text-gray-500">Start analysis to see stress metrics</p>
                </div>
            ) : (
                <>
                    {/* Real-time Graph */}
                    <div className="mb-6 -mx-2">
                        <RealTimeGraph
                            stressData={{ history: stressHistory }}
                            height={150}
                        />
                    </div>

                    {/* Stress Level Badge */}
                    <div className="text-center mb-6">
                        <div className={`inline-block px-6 py-3 rounded-full text-2xl font-bold ${getColor(stress_level)} transition-colors duration-300`}>
                            {stress_level}
                        </div>
                    </div>

                    {/* Stress Score Progress Bar */}
                    <div className="mb-6">
                        <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium">Stress Score</span>
                            <span className="text-sm font-medium">{stress_score}/100</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-4">
                            <div
                                className={`h-4 rounded-full transition-all duration-500 ${getProgressColor(stress_score)}`}
                                style={{ width: `${stress_score}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Confidence */}
                    <div className="mb-6">
                        <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium">Confidence</span>
                            <span className="text-sm font-medium">{(confidence * 100).toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${confidence * 100}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Micro Features */}
                    {Object.keys(micro_features).length > 0 && (
                        <div className="border-t pt-4">
                            <h4 className="text-sm font-semibold mb-3">Facial Indicators</h4>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                {micro_features.brow_furrow !== undefined && (
                                    <div>
                                        <span className="text-gray-600">Brow Tension:</span>
                                        <span className="ml-2 font-medium">{(micro_features.brow_furrow * 100).toFixed(0)}%</span>
                                    </div>
                                )}
                                {micro_features.left_eye_openness !== undefined && (
                                    <div>
                                        <span className="text-gray-600">Eye Strain:</span>
                                        <span className="ml-2 font-medium">
                                            {((2 - (micro_features.left_eye_openness + micro_features.right_eye_openness)) * 50).toFixed(0)}%
                                        </span>
                                    </div>
                                )}
                                {micro_features.jaw_tension !== undefined && (
                                    <div>
                                        <span className="text-gray-600">Jaw Tension:</span>
                                        <span className="ml-2 font-medium">{(micro_features.jaw_tension * 100).toFixed(0)}%</span>
                                    </div>
                                )}
                                {micro_features.mouth_openness !== undefined && (
                                    <div>
                                        <span className="text-gray-600">Mouth Tension:</span>
                                        <span className="ml-2 font-medium">{(micro_features.mouth_openness * 100).toFixed(0)}%</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

