'use client'
import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

export default function BreathingExerciseGame({ onComplete }) {
    const [phase, setPhase] = useState('intro') // intro, playing, complete
    const [cycle, setCycle] = useState(0)
    const [breathState, setBreathState] = useState('idle') // inhale, hold, exhale, idle
    const [instruction, setInstruction] = useState('')

    // Configuration: 4-4-4 Technique
    const CYCLES_TO_COMPLETE = 3

    useEffect(() => {
        let mounted = true

        const runLoop = async () => {
            if (phase !== 'playing') return

            // Loop for cycles
            while (mounted && phase === 'playing' && cycle < CYCLES_TO_COMPLETE) {
                // Inhale (4s)
                setBreathState('inhale')
                setInstruction('Inhale deeply...')
                await new Promise(r => setTimeout(r, 4000))
                if (!mounted || phase !== 'playing') break

                // Hold (4s)
                setBreathState('hold')
                setInstruction('Hold your breath...')
                await new Promise(r => setTimeout(r, 4000))
                if (!mounted || phase !== 'playing') break

                // Exhale (4s)
                setBreathState('exhale')
                setInstruction('Exhale slowly...')
                await new Promise(r => setTimeout(r, 4000))
                if (!mounted || phase !== 'playing') break

                setCycle(c => {
                    const newCycle = c + 1
                    if (newCycle >= CYCLES_TO_COMPLETE) {
                        setPhase('complete')
                        onComplete({ score: 100, duration: 40 })
                    }
                    return newCycle
                })
            }
        }

        if (phase === 'playing') {
            runLoop()
        }

        return () => { mounted = false }
    }, [phase])


    const startGame = () => {
        setPhase('playing')
        setCycle(0)
    }

    // Dynamic styles for the breathing circle
    const getCircleStyle = () => {
        switch (breathState) {
            case 'inhale': return 'scale-150 bg-indigo-500/20 border-indigo-500 transition-all duration-[4000ms] ease-out'
            case 'hold': return 'scale-150 bg-indigo-500/40 border-indigo-600 transition-all duration-300'
            case 'exhale': return 'scale-100 bg-indigo-500/10 border-indigo-300 transition-all duration-[4000ms] ease-in-out'
            default: return 'scale-100'
        }
    }

    if (phase === 'intro') {
        return (
            <div className="flex flex-col items-center justify-center p-8 h-full text-center space-y-6">
                <div className="text-6xl animate-bounce">🧘</div>
                <h2 className="text-3xl font-bold text-slate-800">Breathing Alignment</h2>
                <p className="text-slate-500 max-w-md">
                    Synchronize your breath to reduce stress. Follow the circle: Inhale as it expands, hold when it stops, and exhale as it shrinks.
                </p>
                <Button onClick={startGame} size="lg" className="w-48">START EXERCISE</Button>
            </div>
        )
    }

    if (phase === 'complete') {
        return (
            <div className="flex flex-col items-center justify-center p-8 h-full text-center space-y-6 animate-in fade-in">
                <div className="text-6xl">✨</div>
                <h2 className="text-2xl font-bold text-slate-800">Aligned & Calm</h2>
                <p className="text-slate-500">Great job. Assessment complete.</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center justify-center h-full relative overflow-hidden bg-slate-50/50">
            {/* Ambient Background Glows */}
            <div className={cn(
                "absolute inset-0 bg-gradient-to-b from-indigo-50/0 via-indigo-50/50 to-indigo-50/0 transition-opacity duration-1000",
                breathState === 'inhale' ? 'opacity-100' : 'opacity-30'
            )} />

            <div className="relative z-10 flex flex-col items-center gap-12">
                <div className="text-center space-y-2">
                    <h3 className="text-2xl font-bold text-slate-700 transition-all duration-500">{instruction}</h3>
                    <p className="text-sm text-slate-400 font-mono">Cycle {Math.min(cycle + 1, CYCLES_TO_COMPLETE)}/{CYCLES_TO_COMPLETE}</p>
                </div>

                {/* Breathing Circle Container */}
                <div className="relative w-64 h-64 flex items-center justify-center">
                    {/* Outer Rings */}
                    <div className={cn(
                        "absolute inset-0 rounded-full border-2",
                        breathState === 'inhale' ? "border-indigo-200 animate-ping opacity-20" : "border-transparent"
                    )} />

                    {/* Main Circle */}
                    <div className={cn(
                        "w-40 h-40 rounded-full border-4 flex items-center justify-center shadow-lg backdrop-blur-sm",
                        getCircleStyle()
                    )}>
                        <div className="text-indigo-600 font-medium text-lg">
                            {breathState === 'inhale' && 'Inhale'}
                            {breathState === 'hold' && 'Hold'}
                            {breathState === 'exhale' && 'Exhale'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
