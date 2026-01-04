'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

export function DashboardLayout({ children }) {
    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
            <aside className="hidden w-64 flex-col border-r bg-background md:flex">
                <div className="flex h-14 items-center border-b px-6">
                    <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg">
                        <span>ZenithMind.AI</span>
                    </Link>
                </div>
                <div className="flex-1 overflow-auto py-2">
                    <nav className="grid items-start px-4 text-sm font-medium">
                        <NavLink href="/dashboard" icon="📊">Dashboard</NavLink>
                        <NavLink href="/play" icon="🎮">Start Session</NavLink>
                        <NavLink href="/report" icon="📄">Reports</NavLink>
                        <NavLink href="/settings" icon="⚙️">Settings</NavLink>
                    </nav>
                </div>
                <div className="mt-auto p-4 border-t">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                            U
                        </div>
                        <div className="text-sm">
                            <p className="font-medium">User Account</p>
                            <p className="text-xs text-muted-foreground">Pro Plan</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-h-screen">
                <header className="flex h-14 items-center gap-4 border-b bg-background px-6 lg:h-[60px]">
                    <div className="flex-1">
                        <h1 className="font-semibold text-lg">Dashboard</h1>
                    </div>
                </header>
                <div className="flex-1 overflow-y-auto p-6 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    )
}

function NavLink({ href, icon, children }) {
    const pathname = usePathname()
    const isActive = pathname === href || (href !== '/dashboard' && pathname?.startsWith(href))

    return (
        <Link
            href={href}
            className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                isActive ? "bg-primary/10 text-primary" : "text-muted-foreground"
            )}
        >
            <span className="text-lg">{icon}</span>
            {children}
        </Link>
    )
}
