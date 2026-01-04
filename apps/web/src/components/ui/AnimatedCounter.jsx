'use client'
import { useEffect, useState, useRef } from 'react'
import { cn } from '@/lib/utils'

export function AnimatedCounter({ value, duration = 1500, className }) {
    const [displayValue, setDisplayValue] = useState(0)
    const startValue = useRef(0)
    const startTime = useRef(null)

    useEffect(() => {
        startValue.current = displayValue
        startTime.current = null

        const animate = (timestamp) => {
            if (!startTime.current) startTime.current = timestamp
            const progress = timestamp - startTime.current

            // Ease out quart
            const percentage = Math.min(progress / duration, 1)
            const ease = 1 - Math.pow(1 - percentage, 4)

            const nextValue = Math.floor(startValue.current + (value - startValue.current) * ease)
            setDisplayValue(nextValue)

            if (progress < duration) {
                requestAnimationFrame(animate)
            } else {
                setDisplayValue(value)
            }
        }

        requestAnimationFrame(animate)
    }, [value, duration])

    return <span className={cn("tabular-nums", className)}>{displayValue}</span>
}
