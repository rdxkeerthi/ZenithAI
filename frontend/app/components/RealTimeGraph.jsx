'use client';

import React, { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export default function RealTimeGraph({ stressData, height = 200 }) {
    // Generate graph data from stress history
    const chartData = useMemo(() => {
        if (!stressData || !stressData.history) return {
            labels: [],
            datasets: []
        };

        const labels = stressData.history.map((_, i) => i);
        const dataPoints = stressData.history.map(d => d.stress);

        return {
            labels,
            datasets: [
                {
                    label: 'Current Stress',
                    data: dataPoints,
                    borderColor: 'rgb(255, 99, 132)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 2,
                    borderWidth: 2,
                },
                {
                    label: 'Baseline (Healthy)',
                    data: new Array(dataPoints.length).fill(45),
                    borderColor: 'rgba(75, 192, 192, 0.5)',
                    borderDash: [5, 5],
                    pointRadius: 0,
                    borderWidth: 1,
                    tension: 0,
                    fill: false
                }
            ]
        };
    }, [stressData]);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: 0 // Disable animation for real-time performance
        },
        scales: {
            y: {
                min: 0,
                max: 100,
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                },
                ticks: {
                    color: '#86868b'
                }
            },
            x: {
                display: false // Hide x-axis labels for clean look
            }
        },
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                mode: 'index',
                intersect: false,
            }
        }
    };

    return (
        <div className="glass-panel p-4 w-full" style={{ height: `${height}px` }}>
            <h3 className="text-sm font-semibold mb-2 text-secondary">Real-time Stress Flow</h3>
            <div className="w-full h-full pb-6">
                <Line data={chartData} options={options} />
            </div>
        </div>
    );
}
